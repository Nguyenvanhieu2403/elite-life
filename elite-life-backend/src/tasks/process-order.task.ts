import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import * as moment from "moment";
import { Environment } from "src/config/app.config";
import { BinaryTrees } from "src/database/entities/collaborator/binaryTree.entity";
import { Collaborators } from "src/database/entities/collaborator/collaborators.entity";
import { Orders } from "src/database/entities/collaborator/order.entity";
import { OrderDetails } from "src/database/entities/collaborator/orderDetail.entity";
import { OrderPays } from "src/database/entities/collaborator/orderPay.entity";
import { Wallets } from "src/database/entities/collaborator/wallet.entity";
import { WalletDetails } from "src/database/entities/collaborator/walletDetail.entity";
import { Products } from "src/database/entities/products.entity";
import { PayOrderDto } from "src/sale/orders/dto/pay-order.dto";
import { OrdersService } from "src/sale/orders/orders.service";
import { RankEnums, WalletTypeEnums } from "src/utils/enums.utils";
import { DataSource, DeepPartial, FindOptionsWhere, In, InsertResult, IsNull, LessThanOrEqual, MoreThan, MoreThanOrEqual, Not, QueryRunner, Raw, Repository, UpdateResult } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

@Injectable()
export class ProcessOrder {
  private readonly logger = new Logger(ProcessOrder.name);
  private readonly isProd: boolean = false;
  constructor(
    @InjectRepository(Orders)
    private orderRepository: Repository<Orders>,
    private configService: ConfigService,
    @InjectDataSource()
    private dataSource: DataSource,

  ) {
    let nodeEvn = this.configService.getOrThrow("app.nodeEnv", { infer: true, });
    this.isProd = nodeEvn == Environment.Prod

  }

  async process() {
    try {
      let orders = await this.orderRepository.find(
        {
          where: {
            CompletedDate: Not(IsNull()),
            IsProcess: false,
            // Id: 2249,
            // CommissionSaleMax: Raw(alias => `"CommissionSale" < ${alias}`),
            // Pending: 0
          },
          order: {
            CompletedDate: "asc",
            Id: "asc"
          },
          select: {
            Id: true
          }
        }
      )

      for (const order of orders) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
          let orderTemp = await queryRunner.manager.findOne(Orders, {
            where: { Id: order.Id },
            relations:
            {
              Collaborator: true
            }
          })

          // chia tiền cho KH
          await this.calcCustomer(queryRunner, orderTemp);

          // chia tiền cho nvkd
          await this.calcSale(queryRunner, orderTemp);

          // cập nhật cấp bậc cho user mua + parent
          await this.processSaleUpgrade(queryRunner, orderTemp);

          // cập nhật trạng thái
          await queryRunner.manager.save(
            queryRunner.manager.create(Orders, {
              Id: order.Id,
              IsProcess: true
            } as DeepPartial<Orders>),
          );
          await queryRunner.commitTransaction();
        } catch (err) {
          await queryRunner.rollbackTransaction();
          this.logger.error(err);
          return;
        } finally {
          await queryRunner.release();
        }
      }

    } catch (error) {

    }
  }

  async processTest() {
    try {
      let orders = await this.orderRepository.find(
        {
          where: {
            CompletedDate: Not(IsNull()),
            // IsProcess: false
            // Id: 133,
            // CommissionSaleMax: Raw(alias => `"CommissionSale" < ${alias}`),
            // Pending: 0
          },
          order: {
            CompletedDate: "asc",
            Id: "asc"
          },
          select: {
            Id: true
          }
        }
      )

      for (const order of orders) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
          let orderTemp = await queryRunner.manager.findOne(Orders, {
            where: { Id: order.Id },
            relations:
            {
              Collaborator: true
            }
          })

          // cập nhật cấp bậc cho user mua + parent
          await this.processSaleUpgrade(queryRunner, orderTemp);

          await queryRunner.commitTransaction();
        } catch (err) {
          await queryRunner.rollbackTransaction();
          this.logger.error(err);
          return;
        } finally {
          await queryRunner.release();
        }
      }

    } catch (error) {

    }
  }

  private async calcCustomer(queryRunner: QueryRunner, order: Orders) {
    try {
      // đồng chia
      let orderShares = await queryRunner.manager.find(Orders,
        {
          where: {
            CompletedDate: Not(IsNull()),
            IsProcess: true
          }
        }
      )

      let customerNum = orderShares.length;
      if (customerNum > 0) {
        let percentCommission = 15;

        let orderValue = order.Value * percentCommission / 100
        let valueShare = Math.round((orderValue / customerNum) * 1e8) / 1e8
        for (const orderShare of orderShares) {
          if (orderShare.CommissionCustomer == orderShare.CommissionCustomerMax) continue;
          let valueUpdate =
            orderShare.CommissionCustomer + valueShare > orderShare.CommissionCustomerMax
              ? orderShare.CommissionCustomerMax - orderShare.CommissionCustomer : valueShare

          await queryRunner.manager.save(
            queryRunner.manager.create(Orders, {
              Id: orderShare.Id,
              CommissionCustomerShare: orderShare.CommissionCustomerShare + valueUpdate,
              CommissionCustomer: orderShare.CommissionCustomer + valueUpdate,
            } as DeepPartial<Orders>),
          );

          await queryRunner.manager.save(
            queryRunner.manager.create(OrderDetails, {
              CollaboratorId: orderShare.CollaboratorId,
              OrderId: order.Id,
              WalletTypeEnums: WalletTypeEnums.CustomerShare,
              Value: valueUpdate,
              Note: `Đồng chia ${percentCommission}% cho ${customerNum} KH từ ${order.Collaborator.UserName}`
            } as DeepPartial<OrderDetails>),
          );

          await queryRunner.manager.createQueryBuilder()
            .insert()
            .into(Wallets)
            .values({
              CollaboratorId: orderShare.CollaboratorId,
              Available: valueUpdate,
              WalletTypeEnums: WalletTypeEnums.CustomerShare,
              Total: valueUpdate,
            })
            .onConflict(`("CollaboratorId", "WalletTypeEnums") DO UPDATE SET 
              "Total" = "Wallets"."Total" + ${valueUpdate},
              "Available" = "Wallets"."Available" + ${valueUpdate}`)
            .returning("*")
            .execute();

          let walletShare = await queryRunner.manager.findOne(Wallets,
            {
              where: {
                CollaboratorId: orderShare.CollaboratorId,
                WalletTypeEnums: WalletTypeEnums.CustomerShare,
              }
            }
          )

          await queryRunner.manager.save(
            queryRunner.manager.create(WalletDetails, {
              WalletId: walletShare.Id,
              WalletType: walletShare.WalletTypeEnums,
              Value: valueUpdate,
              Note: `Đồng chia ${percentCommission}% cho ${customerNum} KH từ ${order.Collaborator.UserName}`
            })
          )
        }
      }

      // nhị phân
      let currentId = order.CollaboratorId;
      const maxLevels = 21; // Tối đa 21 cha
      const parentList: number[] = []; // Danh sách ID cha
      const collaboratorList: number[] = []; // Danh sách CollaboratorId cha

      for (let level = 0; level < maxLevels; level++) {
        // Tạo UserName bằng tiền tố EL
        const userName = `EL${currentId.toString().padStart(3, '0')}`;

        // Truy vấn ParentId
        const parent = await queryRunner.manager.findOne(Collaborators, {
          where: { UserName: userName },
          select: ["ParentId"],
        });
        collaboratorList.push(currentId);
        if (!parent?.ParentId) {
          // Nếu không tìm thấy ParentId thì dừng lặp
          break;
        }

        // Lưu ParentId vào danh sách
        parentList.push(parent.ParentId);


        // Cập nhật currentId thành ParentId để tìm cha tiếp theo
        currentId = parent.ParentId;
      }
      // Xóa thằng đầu tiên
      collaboratorList.shift();
      // Cập nhật giá trị tri ân cho tất cả các cha trong danh sách
      const totalAmount = 3450000 * 0.07;
      const gratitudeAmount = totalAmount / parentList.length; // Ví dụ khoản tiền tri ân
      for (const collaboratorId of collaboratorList) {
        const orderGratitude = await queryRunner.manager.findOne(Orders, {
          where: { CollaboratorId: collaboratorId },
          relations: { Collaborator: true },
        });

        if (orderGratitude) {
          const valueUpdate = gratitudeAmount;

          // Cập nhật giá trị tri ân vào Orders
          await queryRunner.manager.save(
            queryRunner.manager.create(Orders, {
              Id: orderGratitude.Id,
              CommissionCustomerGratitude: orderGratitude.CommissionCustomerGratitude + valueUpdate,
            } as DeepPartial<Orders>)
          );
          // Lưu dữ liệu vào OrderDetails
          await queryRunner.manager.save(
            queryRunner.manager.create(OrderDetails, {
              CollaboratorId: collaboratorId,
              OrderId: order.Id,
              WalletTypeEnums: WalletTypeEnums.CustomerGratitude,
              Value: valueUpdate,
              Note: `Tri ân từ ${order.Collaborator.UserName}`,
            } as DeepPartial<OrderDetails>)
          );
        }
          await queryRunner.manager
            .createQueryBuilder()
            .update(Wallets)
            .set({
              Available: () => `"Available" + ${gratitudeAmount}`,
            })
            .where('"CollaboratorId" = :collaboratorId', { collaboratorId })
            .andWhere('"WalletTypeEnums" = :walletType', { walletType: 'CustomerGratitude' })
            .execute();

          // Bổ sung vào WalletDetails
          const walletUpdateResult = await queryRunner.manager.findOne(Wallets, {
            where: {
              CollaboratorId: collaboratorId,
              WalletTypeEnums: WalletTypeEnums.CustomerGratitude,
            },
          });

          if (walletUpdateResult) {
            await queryRunner.manager.save(
              queryRunner.manager.create(WalletDetails, {
                WalletId: walletUpdateResult.Id,
                WalletType: walletUpdateResult.WalletTypeEnums,
                Value: gratitudeAmount,
                Note: `Tri ân từ ${order.Collaborator.UserName}`,
              })
            );
          }
        }

      } catch (error) {
        this.logger.error(`calcCustomer`);
        throw error;
      }

    }

  private async calcSale(queryRunner: QueryRunner, order: Orders) {
    try {
      let collaborator = await queryRunner.manager.findOne(Collaborators, {
        where: {
          Id: order.CollaboratorId
        },
        relations: {
          Parent: true
        }
      })

      let parent = collaborator.Parent;
      let levelNum = 1;

      let func3Level = async (parent: Partial<Collaborators>, orderGratitude: Orders, levelNum: number) => {
        let commissionPercent = 0;
        switch (levelNum) {
          case 1:
            commissionPercent = 4
            break;

          case 2:
            commissionPercent = 5
            break;
          case 3:
            commissionPercent = 7
            break;
          default:
            break;
        }
        let valueOriginUpdate = order.Value * commissionPercent / 100;
        let valueUpdate = Math.round(valueOriginUpdate * 1e8) / 1e8
        valueOriginUpdate = Math.round(valueOriginUpdate * 1e8) / 1e8
        let commissionSaleMax = orderGratitude.CommissionSaleMax

        // rank đạt tiêu chí 1000%
        if ([RankEnums.V1, RankEnums.V2, RankEnums.V3, RankEnums.V4, RankEnums.V5].some(s => parent.Rank == s)) {
          commissionSaleMax = orderGratitude.CommissionSaleMax * 0.9;
          // nếu vượt quá 1000%
          if (orderGratitude.CommissionSale == orderGratitude.CommissionSaleMax) return;
          // nết vượt quá 900%
          else if (orderGratitude.CommissionSale >= commissionSaleMax) {
            valueUpdate =
              orderGratitude.CommissionSale + valueUpdate > orderGratitude.CommissionSaleMax
                ? orderGratitude.CommissionSaleMax - orderGratitude.CommissionSale : valueUpdate

            await funcSale3(parent, orderGratitude, valueUpdate);
            // nếu vượt chưa quá 900%
          } else {
            valueUpdate =
              orderGratitude.CommissionSale + valueUpdate > commissionSaleMax
                ? commissionSaleMax - orderGratitude.CommissionSale : valueUpdate

            await queryRunner.manager.save(
              queryRunner.manager.create(Orders, {
                Id: orderGratitude.Id,
                CommissionSale1: orderGratitude.CommissionSale1 + valueUpdate,
                CommissionSale: orderGratitude.CommissionSale + valueUpdate,
              } as DeepPartial<Orders>),
            );

            await queryRunner.manager.save(
              queryRunner.manager.create(OrderDetails, {
                CollaboratorId: orderGratitude.CollaboratorId,
                OrderId: order.Id,
                WalletTypeEnums: WalletTypeEnums.Sale1,
                Value: valueUpdate,
                Note: `Hoa hồng giới thiệu hưởng ${commissionPercent}% từ DL${levelNum - 1} ${order.Collaborator.UserName}`
              } as DeepPartial<OrderDetails>),
            );

            await queryRunner.manager.createQueryBuilder()
              .insert()
              .into(Wallets)
              .values({
                CollaboratorId: orderGratitude.CollaboratorId,
                Available: valueUpdate,
                WalletTypeEnums: WalletTypeEnums.Sale1,
                Total: valueUpdate,
              })
              .onConflict(`("CollaboratorId", "WalletTypeEnums") DO UPDATE SET 
            "Total" = "Wallets"."Total" + ${valueUpdate},
            "Available" = "Wallets"."Available" + ${valueUpdate}`)
              .returning("*")
              .execute();


            let walletGratitude = await queryRunner.manager.findOne(Wallets,
              {
                where: {
                  CollaboratorId: orderGratitude.CollaboratorId,
                  WalletTypeEnums: WalletTypeEnums.Sale1,
                }
              }
            )

            await queryRunner.manager.save(
              queryRunner.manager.create(WalletDetails, {
                WalletId: walletGratitude.Id,
                WalletType: walletGratitude.WalletTypeEnums,
                Value: valueUpdate,
                Note: `Hoa hồng giới thiệu hưởng ${commissionPercent}% từ DL${levelNum - 1} ${order.Collaborator.UserName}`
              })
            )

            if (valueOriginUpdate != valueUpdate && valueOriginUpdate - valueUpdate > 0) {
              let orderGratitude = await queryRunner.manager.findOne(Orders,
                {
                  where: {
                    CollaboratorId: parent.Id,
                    IsProcess: true
                  },
                  relations: {
                    Collaborator: true
                  },
                  order: {
                    CreatedAt: "desc"
                  }
                }
              )
              await funcSale3(parent, orderGratitude, valueOriginUpdate - valueUpdate);
            }
          }
        }
        else {
          if (orderGratitude.CommissionSale == commissionSaleMax) return;


          valueUpdate =
            orderGratitude.CommissionSale + valueUpdate > commissionSaleMax
              ? commissionSaleMax - orderGratitude.CommissionSale : valueUpdate

          await queryRunner.manager.save(
            queryRunner.manager.create(Orders, {
              Id: orderGratitude.Id,
              CommissionSale1: orderGratitude.CommissionSale1 + valueUpdate,
              CommissionSale: orderGratitude.CommissionSale + valueUpdate,
            } as DeepPartial<Orders>),
          );

          await queryRunner.manager.save(
            queryRunner.manager.create(OrderDetails, {
              CollaboratorId: orderGratitude.CollaboratorId,
              OrderId: order.Id,
              WalletTypeEnums: WalletTypeEnums.Sale1,
              Value: valueUpdate,
              Note: `Hoa hồng giới thiệu hưởng ${commissionPercent}% từ DL${levelNum - 1} ${order.Collaborator.UserName}`
            } as DeepPartial<OrderDetails>),
          );

          await queryRunner.manager.createQueryBuilder()
            .insert()
            .into(Wallets)
            .values({
              CollaboratorId: orderGratitude.CollaboratorId,
              Available: valueUpdate,
              WalletTypeEnums: WalletTypeEnums.Sale1,
              Total: valueUpdate,
            })
            .onConflict(`("CollaboratorId", "WalletTypeEnums") DO UPDATE SET 
          "Total" = "Wallets"."Total" + ${valueUpdate},
          "Available" = "Wallets"."Available" + ${valueUpdate}`)
            .returning("*")
            .execute();

          let walletShare = await queryRunner.manager.findOne(Wallets,
            {
              where: {
                CollaboratorId: orderGratitude.CollaboratorId,
                WalletTypeEnums: WalletTypeEnums.Sale1,
              }
            }
          )

          await queryRunner.manager.save(
            queryRunner.manager.create(WalletDetails, {
              WalletId: walletShare.Id,
              WalletType: walletShare.WalletTypeEnums,
              Value: valueUpdate,
              Note: `Hoa hồng giới thiệu hưởng ${commissionPercent}% từ DL${levelNum - 1} ${order.Collaborator.UserName}`
            })
          )
        }

      }

      let funcV1New = async (collaborator: Partial<Collaborators>, orderGratitude: Orders, rankLevel: RankEnums, saleCount: number) => {
        let percentCommission: number = 6;
        switch (rankLevel) {
          case RankEnums.V1:
            percentCommission = 6
            break;
          case RankEnums.V2:
            percentCommission = 3
            break;
          case RankEnums.V3:
            percentCommission = 2
            break;
          case RankEnums.V4:
            percentCommission = 1
            break;
          case RankEnums.V5:
            percentCommission = 1
            break;
          default:
            break;
        }
        let valueOriginUpdate = (order.Value * percentCommission / 100) / saleCount;
        let valueUpdate = Math.round(valueOriginUpdate * 1e8) / 1e8
        valueOriginUpdate = Math.round(valueOriginUpdate * 1e8) / 1e8
        let commissionSaleMax = orderGratitude.CommissionSaleMax * 0.9;
        // nếu vượt quá 1000%
        if (orderGratitude.CommissionSale == orderGratitude.CommissionSaleMax) return;
        // nết vượt quá 900%
        else if (orderGratitude.CommissionSale >= commissionSaleMax) {
          valueUpdate =
            orderGratitude.CommissionSale + valueUpdate > orderGratitude.CommissionSaleMax
              ? orderGratitude.CommissionSaleMax - orderGratitude.CommissionSale : valueUpdate

          await funcSale3(collaborator, orderGratitude, valueUpdate);
          // nếu vượt chưa quá 900%
        } else {

          valueUpdate =
            orderGratitude.CommissionSale + valueUpdate > commissionSaleMax
              ? commissionSaleMax - orderGratitude.CommissionSale : valueUpdate

          await queryRunner.manager.save(
            queryRunner.manager.create(Orders, {
              Id: orderGratitude.Id,
              CommissionSale2: orderGratitude.CommissionSale2 + valueUpdate,
              CommissionSale: orderGratitude.CommissionSale + valueUpdate,
            } as DeepPartial<Orders>),
          );

          await queryRunner.manager.save(
            queryRunner.manager.create(OrderDetails, {
              CollaboratorId: orderGratitude.CollaboratorId,
              OrderId: order.Id,
              WalletTypeEnums: WalletTypeEnums.Sale2,
              Value: valueUpdate,
              Note: `Thưởng Đại lý ${rankLevel} hưởng ${percentCommission}% chia cho ${saleCount} ${rankLevel} từ ${order.Collaborator.UserName}`
            } as DeepPartial<OrderDetails>),
          );

          await queryRunner.manager.createQueryBuilder()
            .insert()
            .into(Wallets)
            .values({
              CollaboratorId: orderGratitude.CollaboratorId,
              Available: valueUpdate,
              WalletTypeEnums: WalletTypeEnums.Sale2,
              Total: valueUpdate,
            })
            .onConflict(`("CollaboratorId", "WalletTypeEnums") DO UPDATE SET 
            "Total" = "Wallets"."Total" + ${valueUpdate},
            "Available" = "Wallets"."Available" + ${valueUpdate}`)
            .returning("*")
            .execute();

          let walletShare = await queryRunner.manager.findOne(Wallets,
            {
              where: {
                CollaboratorId: orderGratitude.CollaboratorId,
                WalletTypeEnums: WalletTypeEnums.Sale2,
              }
            }
          )

          await queryRunner.manager.save(
            queryRunner.manager.create(WalletDetails, {
              WalletId: walletShare.Id,
              WalletType: walletShare.WalletTypeEnums,
              Value: valueUpdate,
              Note: `Thưởng Đại lý ${rankLevel} hưởng ${percentCommission}% chia cho ${saleCount} ${rankLevel} từ ${order.Collaborator.UserName}`
            })
          )

          if (valueOriginUpdate != valueUpdate && valueOriginUpdate - valueUpdate > 0) {
            let orderGratitude = await queryRunner.manager.findOne(Orders,
              {
                where: {
                  CollaboratorId: collaborator.Id,
                  IsProcess: true
                },
                relations: {
                  Collaborator: true
                },
                order: {
                  CreatedAt: "desc"
                }
              }
            )
            await funcSale3(collaborator, orderGratitude, valueOriginUpdate - valueUpdate);
          }
        }

      }


      let funcSale3 = async (parent: Partial<Collaborators>, orderGratitude: Orders, valueUpdate: number) => {

        if (orderGratitude.CommissionSale + valueUpdate == orderGratitude.CommissionSaleMax) {
          valueUpdate = 3_450_000 - orderGratitude.CommissionSale3;
        }
        await queryRunner.manager.save(
          queryRunner.manager.create(Orders, {
            Id: orderGratitude.Id,
            CommissionSale3: orderGratitude.CommissionSale3 + valueUpdate,
            CommissionSale: orderGratitude.CommissionSale + valueUpdate,
          } as DeepPartial<Orders>),
        );

        await queryRunner.manager.save(
          queryRunner.manager.create(OrderDetails, {
            CollaboratorId: orderGratitude.CollaboratorId,
            OrderId: order.Id,
            WalletTypeEnums: WalletTypeEnums.Sale3,
            Value: valueUpdate,
            Note: `Quy đổi combo SP mới từ ${order.Collaborator.UserName}`
          } as DeepPartial<OrderDetails>),
        );

        await queryRunner.manager.createQueryBuilder()
          .insert()
          .into(Wallets)
          .values({
            CollaboratorId: orderGratitude.CollaboratorId,
            Available: valueUpdate,
            WalletTypeEnums: WalletTypeEnums.Sale3,
            Total: valueUpdate,
          })
          .onConflict(`("CollaboratorId", "WalletTypeEnums") DO UPDATE SET 
          "Total" = "Wallets"."Total" + ${valueUpdate},
          "Available" = "Wallets"."Available" + ${valueUpdate}`)
          .returning("*")
          .execute();

        let walletShare = await queryRunner.manager.findOne(Wallets,
          {
            where: {
              CollaboratorId: orderGratitude.CollaboratorId,
              WalletTypeEnums: WalletTypeEnums.Sale3,
            }
          }
        )

        await queryRunner.manager.save(
          queryRunner.manager.create(WalletDetails, {
            WalletId: walletShare.Id,
            WalletType: walletShare.WalletTypeEnums,
            Value: valueUpdate,
            Note: `Quy đổi combo SP mới từ ${order.Collaborator.UserName}`
          })
        )
        if (orderGratitude.CommissionSale + valueUpdate == orderGratitude.CommissionSaleMax) {
          try {
            let response = await this.payBack(queryRunner,
              {
                ProductId: orderGratitude.ProductId,
                Value: orderGratitude.Value,
                PayDate: moment().zone(7 * 60).startOf('day').toDate(),
                Note: "Mua lại combo SP khi đạt cấp bậc >= V1",
                OrderId: null,
                NameSale: orderGratitude.NameSale,
                AddressSale: orderGratitude.AddressSale,
                MobileSale: orderGratitude.MobileSale
              },
              orderGratitude.Collaborator as Collaborators
            );

            if (response.status == false) {
              console.error("Mua lại combo SP khi đạt cấp bậc >= V1 bị lỗi");
            }
          } catch (error) {
            console.error("Lỗi trong quá trình mua lại combo SP khi đạt cấp bậc >= V1:", error.message);
          }
        }

      }

      while (true) {
        if (!parent) break;
        if (levelNum > 3) break;
        // ăn 3 đời
        let orderGratitude = await queryRunner.manager.findOne(Orders,
          {
            where: {
              CollaboratorId: parent.Id,
              IsProcess: true
            },
            relations: {
              Collaborator: true
            },
            order: {
              CreatedAt: "desc"
            }
          }
        )
        if (orderGratitude) await func3Level(parent, orderGratitude, levelNum)

        if (parent.ParentId == undefined) parent = null
        else
          parent = await queryRunner.manager.findOne(Collaborators, {
            where: { Id: parent.ParentId },
          })

        levelNum++;
      }

      // rank v1
      let v1s = await queryRunner.manager.find(Collaborators, {
        where: { Rank: In([RankEnums.V1, RankEnums.V2, RankEnums.V3, RankEnums.V4, RankEnums.V5]) },
      })

      for (const v1 of v1s) {
        let orderGratitude = await queryRunner.manager.findOne(Orders,
          {
            where: {
              CollaboratorId: v1.Id,
              IsProcess: true
            },
            relations: {
              Collaborator: true
            },
            order: {
              CreatedAt: "desc"
            }
          }
        )
        await funcV1New(v1, orderGratitude, RankEnums.V1, v1s.length)
      }

      // rank v2
      v1s = v1s.filter(s => [RankEnums.V2, RankEnums.V3, RankEnums.V4, RankEnums.V5].some(s1 => s1 == s.Rank));
      for (const v1 of v1s) {
        let orderGratitude = await queryRunner.manager.findOne(Orders,
          {
            where: {
              CollaboratorId: v1.Id,
              IsProcess: true
            },
            relations: {
              Collaborator: true
            },
            order: {
              CreatedAt: "desc"
            }
          }
        )
        await funcV1New(v1, orderGratitude, RankEnums.V2, v1s.length)
      }


      // rank v3
      v1s = v1s.filter(s => [RankEnums.V3, RankEnums.V4, RankEnums.V5].some(s1 => s1 == s.Rank));
      for (const v1 of v1s) {
        let orderGratitude = await queryRunner.manager.findOne(Orders,
          {
            where: {
              CollaboratorId: v1.Id,
              IsProcess: true
            },
            relations: {
              Collaborator: true
            },
            order: {
              CreatedAt: "desc"
            }
          }
        )
        await funcV1New(v1, orderGratitude, RankEnums.V3, v1s.length)
      }

      // rank v4
      v1s = v1s.filter(s => [RankEnums.V4, RankEnums.V5].some(s1 => s1 == s.Rank));
      for (const v1 of v1s) {
        let orderGratitude = await queryRunner.manager.findOne(Orders,
          {
            where: {
              CollaboratorId: v1.Id,
              IsProcess: true
            },
            relations: {
              Collaborator: true
            },
            order: {
              CreatedAt: "desc"
            }
          }
        )
        await funcV1New(v1, orderGratitude, RankEnums.V4, v1s.length)
      }

      // rank v5
      v1s = v1s.filter(s => [RankEnums.V5].some(s1 => s1 == s.Rank));
      for (const v1 of v1s) {
        let orderGratitude = await queryRunner.manager.findOne(Orders,
          {
            where: {
              CollaboratorId: v1.Id,
              IsProcess: true
            },
            relations: {
              Collaborator: true
            },
            order: {
              CreatedAt: "desc"
            }
          }
        )
        await funcV1New(v1, orderGratitude, RankEnums.V5, v1s.length)
      }

    } catch (error) {
      this.logger.error(`calcSale`)
      throw error;
    }
  }

  private async processSaleUpgrade(queryRunner: QueryRunner, order: Orders) {
    try {

      let collaborator = await queryRunner.manager.findOne(Collaborators, {
        where: {
          Id: order.CollaboratorId
        }
      });
      // let childNum = await queryRunner.manager.count(Collaborators, {
      //   where: {
      //     ParentId: collaborator.Id,
      //     Rank: RankEnums.V
      //   }
      // });

      // await queryRunner.manager.save(
      //   queryRunner.manager.create(Collaborators, {
      //     Id: order.CollaboratorId,
      //     Rank: childNum >= 3 ? RankEnums.V1 : RankEnums.V
      //   } as DeepPartial<Collaborators>),
      // );

      let parent = collaborator
      let parentIds: number[] = []
      while (true) {
        if (!parent) break;
        if (parentIds.some(s => s == parent.Id)) break;
        parentIds.push(parent.Id);
        let rankCur: RankEnums = parent.Rank;
        let rankNext: RankEnums = parent.Rank;
        let coefficient: number = 0;

        if (rankCur != RankEnums.V5) {
          let collaboratorIds = await this.getTreeByCollaboratorId(queryRunner, parent.Id);
          const totalAmount = await this.orderRepository.sum('Payed', {
            CollaboratorId: In(collaboratorIds),
            CompletedDate: LessThanOrEqual(order.CompletedDate)
          });

          let childs = await queryRunner.manager.find(Collaborators, {
            where: {
              ParentId: parent.Id
              // Id: In(collaboratorIds.filter(s => s != parent.Id)),
            },
            select: {
              Id: true,
              UserName: true,
              Rank: true
            }
          });

          let childRanks: Partial<Collaborators>[] = []
          for (const child of childs) {
            let collaboratorChildIds = await this.getTreeByCollaboratorId(queryRunner, child.Id);

            let childTemps = await queryRunner.manager.find(Collaborators, {
              where: {
                Id: In(collaboratorChildIds),
              },
              select: {
                Id: true,
                Rank: true
              }
            });
            if (childTemps.filter(s => s.Rank == RankEnums.V5).length >= 1) {
              childRanks.push({
                Id: child.Id,
                UserName: child.UserName,
                Rank: RankEnums.V5
              });
            }
            else if (childTemps.filter(s => s.Rank == RankEnums.V4).length >= 1) {
              childRanks.push({
                Id: child.Id,
                UserName: child.UserName,
                Rank: RankEnums.V4
              });
            }
            else if (childTemps.filter(s => s.Rank == RankEnums.V3).length >= 1) {
              childRanks.push({
                Id: child.Id,
                UserName: child.UserName,
                Rank: RankEnums.V3
              });
            }
            else if (childTemps.filter(s => s.Rank == RankEnums.V2).length >= 1) {
              childRanks.push({
                Id: child.Id,
                UserName: child.UserName,
                Rank: RankEnums.V2
              });
            }
            else if (childTemps.filter(s => s.Rank == RankEnums.V1).length >= 1) {
              childRanks.push({
                Id: child.Id,
                UserName: child.UserName,
                Rank: RankEnums.V1
              });
            }
            else if (childTemps.filter(s => s.Rank == RankEnums.V).length >= 1) {
              childRanks.push({
                Id: child.Id,
                UserName: child.UserName,
                Rank: RankEnums.V
              });
            } else {
              childRanks.push({
                Id: child.Id,
                UserName: child.UserName,
                Rank: RankEnums.None
              });
            }
          };
          // rankNext = RankEnums.V;
          // if (parent.UserName == 'EL001') debugger;
          if (childRanks.filter(s => s.Rank == RankEnums.V4).length >= 3 && totalAmount >= 69_000_000) {
            rankNext = RankEnums.V5
            coefficient = 10
          } else if (childRanks.filter(s => [RankEnums.V4, RankEnums.V3].some(s1 => s1 == s.Rank)).length >= 3 && totalAmount >= 69_000_000) {
            rankNext = RankEnums.V4
            coefficient = 10
          } else if (childRanks.filter(s => [RankEnums.V4, RankEnums.V3, RankEnums.V2].some(s1 => s1 == s.Rank)).length >= 3 && totalAmount >= 69_000_000) {
            rankNext = RankEnums.V3
            coefficient = 10
          } else if (childRanks.filter(s => [RankEnums.V4, RankEnums.V3, RankEnums.V2, RankEnums.V1].some(s1 => s1 == s.Rank)).length >= 3 && totalAmount >= 69_000_000) {
            rankNext = RankEnums.V2
            coefficient = 10
          } else if (childRanks.filter(s => [RankEnums.V4, RankEnums.V3, RankEnums.V2, RankEnums.V1, RankEnums.V].some(s1 => s1 == s.Rank)).length >= 3 && totalAmount >= 69_000_000) {
            rankNext = RankEnums.V1
            coefficient = 10
          } else if (childRanks.length >= 3) {
            coefficient = 3
          }
        }

        if (rankCur != rankNext || coefficient > 0) {

          if (rankCur != rankNext) {
            await queryRunner.manager.save(Collaborators,
              queryRunner.manager.create(Collaborators,
                {
                  Id: parent.Id,
                  Rank: rankNext
                } as DeepPartial<Collaborators>
              )
            )
          }

          let orderCur = await queryRunner.manager.findOne(Orders, {
            where: {
              CollaboratorId: parent.Id
            },
            order: {
              CreatedAt: "desc"
            }
          })
          if (orderCur) {
            await queryRunner.manager.save(
              queryRunner.manager.create(Orders, {
                Id: orderCur.Id,
                CommissionSaleMax: order.Value * coefficient
              } as Orders),
            );
          }

        }

        if (parent.ParentId == undefined) parent = null
        else
          parent = await queryRunner.manager.findOne(Collaborators, {
            where: {
              Id: parent.ParentId
            }
          });
      }
    } catch (error) {
      this.logger.error(`processSaleUpgrade`)
      throw error;
    }
  }

  async payBack(queryRunner: QueryRunner, payOrderDto: PayOrderDto, collaborator: Collaborators) {
    try {

      let wallet = await queryRunner.manager.findOne(Wallets,
        {
          where: {
            CollaboratorId: collaborator.Id,
            WalletTypeEnums: WalletTypeEnums.Sale3

          }
        })

      if (wallet.Available < payOrderDto.Value) {
        return {
          status: false,
          message: "Số point trong ví ko đủ. Thao tác không thành công!!!"
        }
      }

      let order = await queryRunner.manager.findOne(Orders,
        {
          where: {
            CollaboratorId: collaborator.Id,
            ProductId: payOrderDto.ProductId,
            Pending: MoreThan(0)
          },
          order: {
            CreatedAt: "DESC"
          }
        })
      let product = await queryRunner.manager.findOne(Products, { where: { Id: payOrderDto.ProductId } })
      let orderResult: InsertResult | UpdateResult

      if (product.Price < payOrderDto.Value || order?.Pending < payOrderDto.Value) {
        return {
          status: false,
          message: "Vui lòng nhập đúng số tiền thanh toán <= giá sản phẩm"
        }
      }

      let info: Orders = order
      if (!order) {
        order = await queryRunner.manager.save(
          queryRunner.manager.create(Orders, {
            CollaboratorId: collaborator.Id,
            ProductId: payOrderDto.ProductId,
            Value: product.Price,
            Payed: payOrderDto.Value,
            Pending: product.Price - payOrderDto.Value,
          } as DeepPartial<Orders>),
        );
        info = order;
      } else {
        orderResult =
          await queryRunner.manager.createQueryBuilder()
            .update(Orders)
            .set({
              Payed: () => `"Payed" + ${payOrderDto.Value}`,
              Pending: () => `"Pending" - ${payOrderDto.Value}`,
            } as QueryDeepPartialEntity<Orders>)
            .where({
              Id: order.Id,
              Payed: Raw(alias => `${alias} + ${payOrderDto.Value} <= "Value"`),
              Pending: Raw(alias => `${alias} - ${payOrderDto.Value} >=0`)
            } as FindOptionsWhere<Orders>)
            .returning('*')
            .execute();

        if (orderResult?.affected == undefined || orderResult?.affected == 0) {
          return {
            status: false,
            message: "Lỗi liên quan tới số thanh toán và số tiền còn lại của đơn hàng"
          }
        }
        info = orderResult.raw[0]
      }

      await queryRunner.manager.save(
        queryRunner.manager.create(OrderPays, {
          OrderId: info.Id,
          PayDate: moment().zone(7 * 60).startOf('day').toDate(),
          Value: payOrderDto.Value,
          Note: payOrderDto.Note,
          CreatedBy: collaborator.UserName,
        } as DeepPartial<OrderPays>),
      );

      let walletResult =
        await queryRunner.manager.createQueryBuilder()
          .update(Wallets)
          .set({
            Available: () => `"Available" - ${payOrderDto.Value}`,
          } as QueryDeepPartialEntity<Wallets>)
          .where({
            Id: wallet.Id,
            Available: Raw(alias => `${alias} - ${payOrderDto.Value} >=0`)
          } as FindOptionsWhere<Wallets>)
          .returning('*')
          .execute();

      if (walletResult?.affected == undefined || walletResult?.affected == 0) {
        return {
          status: false,
          message: "Số point trong ví ko đủ. Thao tác không thành công!!!"
        }
      }

      if (info && info.Pending == 0) {
        let orderCur = await queryRunner.manager.findOne(Orders, {
          where: {
            Id: info.Id
          }
        })
        await queryRunner.manager.save(
          queryRunner.manager.create(Orders, {
            Id: info.Id,
            CommissionCustomerMax: orderCur.Value * 2,
            CommissionSaleMax: orderCur.Value * 10,
            CompletedDate: moment().zone(7 * 60).toDate()
          } as DeepPartial<Orders>),
        );
      }

      await queryRunner.manager.save(
        queryRunner.manager.create(WalletDetails, {
          WalletId: wallet.Id,
          Value: -payOrderDto.Value,
          Note: "Thanh toán đơn hàng",
          WalletType: WalletTypeEnums.Sale3
        })
      )

      return {
        status: true
      }
    } catch (error) {
      this.logger.error(error)
      throw error;
    }
  };

  async getTreeByCollaboratorId(queryRunner: QueryRunner, id: Collaborators["Id"]) {
    var schema = this.configService.getOrThrow("database.schema", { infer: true });

    let dataRaw: Collaborators[] = await queryRunner.manager.query(`
    WITH RECURSIVE recursive_cte AS
      (SELECT c."Id",
          c."Name",
          c."Rank",
          c."UserName",
          CASE
              WHEN c."Id" = $1 THEN NULL
              ELSE c."ParentId"
          END AS "ParentId",
        ARRAY[c."Id"] "ListId"
      FROM ${schema}."Collaborators" c
      WHERE c."Id" = $1
      UNION ALL
      SELECT t."Id",
                    t."Name",
                    t."Rank",
                    t."UserName",
                    CASE
                        WHEN t."Id" = t."ParentId" THEN NULL
                        ELSE t."ParentId"
                    END AS "ParentId",
      ARRAY_APPEND("ListId", t."Id") AS "ListId"
      FROM ${schema}."Collaborators" t
      JOIN recursive_cte r ON r."Id" = t."ParentId"
      WHERE t."Id" <> ALL("ListId"))
    SELECT c."Id"
    FROM recursive_cte c
    ORDER BY c."Id" ASC
`, [id])

    return dataRaw.map(s => s.Id);
  }

}