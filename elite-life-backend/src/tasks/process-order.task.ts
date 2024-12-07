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
        await queryRunner.query('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');
        try {
          let orderTemp = await queryRunner.manager.findOne(Orders, {
            where: { Id: order.Id },
            relations:
            {
              Collaborator: true
            }
          })

          // Nhận 49% về công ty
          let valueCompany = orderTemp.Value * 0.49;
          const IdCompany = 8082;
          let walletUpdateResult = await queryRunner.manager.findOne(Wallets, {
            where: {
              CollaboratorId: IdCompany,
              WalletTypeEnums: WalletTypeEnums.CustomerGratitude,
            },
          });

          if (!walletUpdateResult) {
            // Nếu không tồn tại, thực hiện INSERT
            walletUpdateResult = await queryRunner.manager.save(
              queryRunner.manager.create(Wallets, {
                CollaboratorId: IdCompany,
                WalletTypeEnums: WalletTypeEnums.CustomerGratitude,
                Available: valueCompany,
                Total: valueCompany,
              } as DeepPartial<Wallets>)
            );
          } else {
            // Nếu tồn tại, thực hiện UPDATE
            await queryRunner.manager
              .createQueryBuilder()
              .update(Wallets)
              .set({
                Available: () => `"Available" + ${valueCompany}`,
                Total: () => `"Total" + ${valueCompany}`,
              })
              .where('"CollaboratorId" = :collaboratorId', { collaboratorId: IdCompany })
              .andWhere('"WalletTypeEnums" = :walletType', { walletType: 'CustomerGratitude' })
              .execute();

          }

          if (walletUpdateResult) {
            await queryRunner.manager.save(
              queryRunner.manager.create(WalletDetails, {
                WalletId: walletUpdateResult.Id,
                WalletType: walletUpdateResult.WalletTypeEnums,
                Value: valueCompany,
                Note: `Tri ân 49% từ ${orderTemp.Collaborator.UserName}`,
              })
            );
          }

          // chia tiền cho KH
          await this.calcCustomer(queryRunner, orderTemp);

          // chia tiền cho nvkd
          await this.calcSale(queryRunner, orderTemp);
          // cập nhật cấp bậc cho user mua + parent
          //await this.processSaleUpgrade(queryRunner, orderTemp);

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
      let binaryTreeNum = await queryRunner.manager.count(BinaryTrees);
      let binaryTreeParentNum = Math.floor((binaryTreeNum + 1) / 2);

      const parents = await queryRunner.manager.find(BinaryTrees, {
        skip: binaryTreeParentNum == 0 ? 0 : binaryTreeParentNum - 1,
        take: 1,
        relations: {
          Collaborator: true,
        },
        order: {
          Id: 'ASC',
        },
      });

      let parent = parents.length > 0 ? parents[0] : null;

      // Lưu thông tin vào bảng BinaryTrees
      await queryRunner.manager.save(
        queryRunner.manager.create(BinaryTrees, {
          CollaboratorId: order.CollaboratorId,
          OrderId: order.Id,
          ParentId: parent ? parent.Id : null,
        } as DeepPartial<BinaryTrees>)
      );


      // tri ân
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
      if (parentList.length < 21) {
        const totalAmount = 3450000 * 0.07;
        const paymentAmount = 11500 * parentList.length;
        const changeAmount = totalAmount - paymentAmount;
        const IdCompany = 8080;
        let walletUpdateResult = await queryRunner.manager.findOne(Wallets, {
          where: {
            CollaboratorId: IdCompany,
            WalletTypeEnums: WalletTypeEnums.CustomerGratitude,
          },
        });

        if (!walletUpdateResult) {
          // Nếu không tồn tại, thực hiện INSERT
          walletUpdateResult = await queryRunner.manager.save(
            queryRunner.manager.create(Wallets, {
              CollaboratorId: IdCompany,
              WalletTypeEnums: WalletTypeEnums.CustomerGratitude,
              Available: changeAmount,
              Total: changeAmount,
            } as DeepPartial<Wallets>)
          );
        } else {
          // Nếu tồn tại, thực hiện UPDATE
          await queryRunner.manager
            .createQueryBuilder()
            .update(Wallets)
            .set({
              Available: () => `"Available" + ${changeAmount}`,
              Total: () => `"Total" + ${changeAmount}`,
            })
            .where('"CollaboratorId" = :collaboratorId', { collaboratorId: IdCompany })
            .andWhere('"WalletTypeEnums" = :walletType', { walletType: 'CustomerGratitude' })
            .execute();
        }
        if (walletUpdateResult) {
          await queryRunner.manager.save(
            queryRunner.manager.create(WalletDetails, {
              WalletId: walletUpdateResult.Id,
              WalletType: walletUpdateResult.WalletTypeEnums,
              Value: changeAmount,
              Note: `Tri ân tiền thừa 7% sau khi đã chia ${parentList.length} tầng từ ${order.Collaborator.UserName}`,
            })
          );
        }
      }
      const gratitudeAmount = 11500;// totalAmount / parentList.length; // Ví dụ khoản tiền tri ân
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

        // Kiểm tra ví CustomerGratitude có tồn tại hay chưa
        let walletUpdateResult = await queryRunner.manager.findOne(Wallets, {
          where: {
            CollaboratorId: collaboratorId,
            WalletTypeEnums: WalletTypeEnums.CustomerGratitude,
          },
        });

        if (!walletUpdateResult) {
          // Nếu không tồn tại, thực hiện INSERT
          walletUpdateResult = await queryRunner.manager.save(
            queryRunner.manager.create(Wallets, {
              CollaboratorId: collaboratorId,
              WalletTypeEnums: WalletTypeEnums.CustomerGratitude,
              Available: gratitudeAmount,
              Total: gratitudeAmount,
            } as DeepPartial<Wallets>)
          );
        } else {
          // Nếu tồn tại, thực hiện UPDATE
          await queryRunner.manager
            .createQueryBuilder()
            .update(Wallets)
            .set({
              Available: () => `"Available" + ${gratitudeAmount}`,
              Total: () => `"Total" + ${gratitudeAmount}`,
            })
            .where('"CollaboratorId" = :collaboratorId', { collaboratorId: collaboratorId })
            .andWhere('"WalletTypeEnums" = :walletType', { walletType: 'CustomerGratitude' })
            .execute();
        }
        // Bổ sung vào WalletDetails
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
        if(orderGratitude){
          await funcV1New(v1, orderGratitude, RankEnums.V1, v1s.length)
        }
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
        if(orderGratitude){
          await funcV1New(v1, orderGratitude, RankEnums.V2, v1s.length)
        }
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
        if(orderGratitude){
          await funcV1New(v1, orderGratitude, RankEnums.V3, v1s.length)
        }
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
        if(orderGratitude){
          await funcV1New(v1, orderGratitude, RankEnums.V4, v1s.length)
        }
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
        if(orderGratitude){
          await funcV1New(v1, orderGratitude, RankEnums.V5, v1s.length)
        }
      }

    } catch (error) {
      this.logger.error(`calcSale`)
      throw error;
    }
  }

  private async processSaleUpgrade(queryRunner: QueryRunner, order: Orders) {
    try {
      let currentId = order.CollaboratorId;
      // B1: Khởi tạo danh sách ListParent và ListRankUpdate
      const ListParent: Collaborators[] = [];
      // const parentListId: number[] = [];
      const ListRankUpdate: { collaboratorId: number; rank: RankEnums }[] = [];

      // Lấy thông tin cộng tác viên từ đơn hàng
      let collaborator = await queryRunner.manager.findOne(Collaborators, {
        where: { Id: order.CollaboratorId },
      });
      if (!collaborator) return;

      ListRankUpdate.push({ collaboratorId: collaborator.Id, rank: collaborator.Rank });




      // Truy vấn ParentId
      while (true) {
        // Tạo UserName bằng tiền tố EL
        const userName = `EL${currentId.toString().padStart(3, '0')}`;

        // Truy vấn ParentId
        const parent = await queryRunner.manager.findOne(Collaborators, {
          where: { UserName: userName },
        });

        if (!parent?.ParentId) {
          // Nếu không tìm thấy ParentId thì dừng lặp
          break;
        }

        // Lưu ParentId vào danh sách
        ListParent.push(parent);

        // Cập nhật currentId thành ParentId để tìm cha tiếp theo
        currentId = parent.ParentId;
      }
      ListParent.shift();

      for (const parent of ListParent) {
        let rankUpdated = false;
        // Lấy tất cả con cháu của thằng cha hiện tại
        const descendantIds = await this.getTreeByCollaboratorId(queryRunner, parent.Id);

        // Tính tổng chi tiêu của các descendant
        const totalAmount = await this.orderRepository.sum('Payed', {
          CollaboratorId: In(descendantIds),
          CompletedDate: LessThanOrEqual(order.CompletedDate),
        });

        if (totalAmount >= 69_000_000) {
          // Lấy tất cả con cháu chắt của thằng cha hiện tại
          const descendantRanks = await this.getDescendantRanks(queryRunner, parent.Id, ListRankUpdate);

          // Kiểm tra điều kiện nâng rank
          for (const condition of this.getRankConditions()) {
            const eligibleRanks = descendantRanks.filter((rank) => condition.minRank.includes(rank));
            if (eligibleRanks.length >= 3) {
              // Update rank và thêm vào ListRankUpdate
              parent.Rank = condition.rank;
              await queryRunner.manager.save(parent);
              ListRankUpdate.push({ collaboratorId: parent.Id, rank: parent.Rank });
              rankUpdated = true;
              break;
            }
          }
        }
        
        if (!rankUpdated) {
          await this.processDescendantsForUpgrade(
            queryRunner,
            parent.Id,
            ListRankUpdate,
            parent.Rank
          );
        }

      }
    } catch (error) {
      this.logger.error(`processSaleUpgrade error: ${error.message}`);
      throw error;
    }
  }

  private async getDescendantRanks(
    queryRunner: QueryRunner,
    parentId: number,
    ListRankUpdate: { collaboratorId: number; rank: RankEnums }[]
  ): Promise<RankEnums[]> {
    const descendants: Collaborators[] = await queryRunner.manager.find(Collaborators, {
      where: { ParentId: parentId },
      select: { Id: true, Rank: true },
    });

    const descendantRanks = descendants.map((descendant) => descendant.Rank);

    // Thêm các rank từ ListRankUpdate10
    ListRankUpdate.forEach((update) => {
      if (descendants.some((descendant) => descendant.Id === update.collaboratorId)) {
        descendantRanks.push(update.rank);
      }
    });

    return descendantRanks;
  }
  private async processDescendantsForUpgrade(
    queryRunner: QueryRunner,
    parentId: number,
    ListRankUpdate: { collaboratorId: number; rank: RankEnums }[],
    parentRank: RankEnums
  ): Promise<void> {
    const descendants = await queryRunner.manager.find(Collaborators, {
      where: { ParentId: parentId },
      select: { Id: true, Rank: true },
    });

    for (const descendant of descendants) {
      // Tính tổng chi tiêu của các descendant
      const descendantIds = await this.getTreeByCollaboratorId(queryRunner, descendant.Id);
      const totalAmount = await this.orderRepository.sum('Payed', {
        CollaboratorId: In(descendantIds),
      });

      // Kiểm tra điều kiện nâng hạng
      if (totalAmount >= 69_000_000) {
        const descendantRanks = await this.getDescendantRanks(queryRunner, descendant.Id, ListRankUpdate);

        for (const condition of this.getRankConditions()) {
          const eligibleRanks = descendantRanks.filter((rank) => condition.minRank.includes(rank));
          if (eligibleRanks.length >= 3) {
            // Cập nhật rank của descendant nếu đủ điều kiện
            descendant.Rank = condition.rank;
            await queryRunner.manager.save(descendant);
            ListRankUpdate.push({ collaboratorId: descendant.Id, rank: descendant.Rank });
          }
        }
      }

      // Tiếp tục duyệt con cháu của descendant
      await this.processDescendantsForUpgrade(queryRunner, descendant.Id, ListRankUpdate, parentRank);
    }
  }

  private getRankConditions(): { rank: RankEnums; minRank: RankEnums[] }[] {
    return [
      { rank: RankEnums.V5, minRank: [RankEnums.V4] },
      { rank: RankEnums.V4, minRank: [RankEnums.V4, RankEnums.V3] },
      { rank: RankEnums.V3, minRank: [RankEnums.V4, RankEnums.V3, RankEnums.V2] },
      { rank: RankEnums.V2, minRank: [RankEnums.V4, RankEnums.V3, RankEnums.V2, RankEnums.V1] },
      { rank: RankEnums.V1, minRank: [RankEnums.V4, RankEnums.V3, RankEnums.V2, RankEnums.V1, RankEnums.V] },
    ];
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