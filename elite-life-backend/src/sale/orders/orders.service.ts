import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityCondition } from 'src/utils/types/entity-condition.type';
import { IPaginationOptions } from 'src/utils/types/pagination-options';
import { Repository, DeepPartial, FindManyOptions, DataSource, QueryRunner, FindOptionsWhere, Raw, Not, In, InsertResult, UpdateResult, LessThan, MoreThan, FindOneOptions, Equal } from 'typeorm';
import { ResponseData } from 'src/utils/schemas/common.schema';
import { Orders } from 'src/database/entities/collaborator/order.entity';
import { JwtPayloadType } from 'src/utils/strategies/types/jwt-payload.type';
import { PayOrderDto } from './dto/pay-order.dto';
import { OrderPays } from 'src/database/entities/collaborator/orderPay.entity';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import logger from 'src/utils/logger';
import * as moment from 'moment';
import { Products } from 'src/database/entities/products.entity';
import { Wallets } from 'src/database/entities/collaborator/wallet.entity';
import { WalletTypeEnums } from 'src/utils/enums.utils';
import { Collaborators } from 'src/database/entities/collaborator/collaborators.entity';
import { RankEnums } from 'src/utils/enums.utils';
import { WalletDetails } from 'src/database/entities/collaborator/walletDetail.entity';
import { UserActivitiesService } from '../user-activities/user-activities.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Orders)
    private ordersRepository: Repository<Orders>,
    private dataSource: DataSource,
    private readonly userActivitiesService: UserActivitiesService,
  ) { }

  async find(options?: FindManyOptions<Orders>) {
    return await this.ordersRepository.find(options);
  }

  async findManyWithPagination(options?: FindManyOptions<Orders>, paginationOptions?: IPaginationOptions,) {
    return await this.ordersRepository.findAndCount({
      ...options,
      skip: paginationOptions ? (paginationOptions.page - 1) * paginationOptions.limit : null,
      take: paginationOptions ? paginationOptions.limit : null,
      order: {
        ...options.order,
        CreatedAt: "DESC"
      }
    });
  }

  async sum(options: FindOptionsWhere<Orders> | FindOptionsWhere<Orders>[]): Promise<number> {
    const totalAmount = await this.ordersRepository.sum('Payed', options);
    return totalAmount || 0;
  }

  async findOne(options: FindOneOptions<Orders>) {
    return await this.ordersRepository.findOne(options);
  }

  async update(id: number, payload: DeepPartial<Orders>) {
    let response: ResponseData = { status: false }
    await this.ordersRepository.save(
      this.ordersRepository.create({
        Id: id,
        ...payload
      }),
    );
    response.status = true;
    return response
  }

  async remove(id: Orders["Id"]) {
    let response: ResponseData = { status: false }
    await this.ordersRepository.delete(id);
    response.status = true;
    return response
  }

  async softRemove(id: Orders["Id"]) {
    let response: ResponseData = { status: false }
    await this.ordersRepository.softDelete(id);
    response.status = true;
    return response
  }

  async pay(payOrderDto: PayOrderDto, user: JwtPayloadType) {
    let response: ResponseData = { status: false }
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      response = await this.payCommon(queryRunner, payOrderDto, user);
      if (response && response.status == false) {
        await queryRunner.rollbackTransaction();
        return response;
      }
      await queryRunner.commitTransaction();
      response.status = true;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      response.message = err.message;
    } finally {
      await queryRunner.release();
    }

    response.status = true;
    return response
  }

  async payCommon(queryRunner: QueryRunner, payOrderDto: PayOrderDto, user: JwtPayloadType) {
    try {

      let wallet = await queryRunner.manager.findOne(Wallets,
        {
          where: {
            CollaboratorId: user.collaboratorInfo.Id,
            WalletTypeEnums: WalletTypeEnums.Source

          }
        })

      if (wallet.Available < payOrderDto.Value) {
        return {
          status: false,
          message: "Số dư ví ko đủ. Thao tác không thành công!!!"
        }
      }

      let isOrder = await queryRunner.manager.exists(Orders,
        {
          where: {
            CollaboratorId: user.collaboratorInfo.Id,
            ProductId: payOrderDto.ProductId,
            CommissionSaleMax: Raw(alias => `"CommissionSale" < ${alias}`),
            Pending: 0
          }
        })
      if (isOrder) {
        return {
          status: false,
          message: "Tại 1 thời điểm chỉ có 1 combo được áp dụng hưởng hoa hồng"
        }
      }

      let order = await queryRunner.manager.findOne(Orders,
        {
          where: {
            CollaboratorId: user.collaboratorInfo.Id,
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
          message: "Vui lòng nhập đúng số tiền phải thanh toán còn lại"
        }
      }

      let info: Orders = order
      if (!order) {
        order = await queryRunner.manager.save(
          queryRunner.manager.create(Orders, {
            CollaboratorId: user.collaboratorInfo.Id,
            ProductId: payOrderDto.ProductId,
            Value: product.Price,
            Payed: payOrderDto.Value,
            Pending: product.Price - payOrderDto.Value,
            NameSale: payOrderDto.NameSale,
            AddressSale: payOrderDto.AddressSale,
            MobileSale: payOrderDto.MobileSale
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
              NameSale: payOrderDto.NameSale,
              AddressSale: payOrderDto.AddressSale,
              MobileSale: payOrderDto.MobileSale
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
          Value: payOrderDto.Value,
          Note: payOrderDto.Note,
          CreatedBy: user.userName,
          PayDate: payOrderDto.PayDate
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
          message: "Số dư ví ko đủ. Thao tác không thành công!!!"
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
            CommissionSaleMax: orderCur.Value * 2,
            CompletedDate: moment().zone(7 * 60).toDate()
          } as DeepPartial<Orders>),
        );

        const existingCollaborator = await queryRunner.manager.findOne(Collaborators, { where: { Id: info.CollaboratorId } });
        if(existingCollaborator.Rank == RankEnums.None) {
          await queryRunner.manager.save(
            queryRunner.manager.create(Collaborators, {
              Id: info.CollaboratorId,
              Rank: RankEnums.V,
              IsSale: true
            })
          )
        }

    //     const existingCollaborator = await queryRunner.manager.findOne(Collaborators, { where: { Id: info.CollaboratorId } });

    // if (existingCollaborator) {
    //   // Nếu tồn tại, cập nhật
    //   await queryRunner.manager.update(
    //     Collaborators,
    //     { Id: info.CollaboratorId },
    //     { Rank: RankEnums.V, IsSale: true }
    //   );
    // } else {
    //   // Nếu không tồn tại, tạo mới
    //   await queryRunner.manager.save(
    //     queryRunner.manager.create(Collaborators, {
    //       Id: info.CollaboratorId,
    //       Rank: RankEnums.V,
    //       IsSale: true
    //     })
    //   );
    // }
      }

      await queryRunner.manager.save(
        queryRunner.manager.create(WalletDetails, {
          WalletId: wallet.Id,
          Value: -payOrderDto.Value,
          Note: "Thanh toán đơn hàng",
          WalletType: WalletTypeEnums.Source
        })
      )

      await this.userActivitiesService.create({
        NewRequestData: order,
        OldRequestData: null,
        UserId: user.id,
        Action: user.Action[0],
        Function: user.Function,
        Description: `Thanh toán đơn hàng #${order.Id}`,
        RecordId: order.Id
      }, user)

      return {
        status: true
      }
    } catch (error) {
      logger.error(error)
      throw error;
    }
  };

  async activate(user: JwtPayloadType) {
    let response: ResponseData = { status: false }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {

      let collaborator = await queryRunner.manager.findOne(Collaborators, {
        where: { Id: user.collaboratorInfo.Id }
      })
      if (collaborator.IsSale == true) {
        response.message = "Tài khoản đã được kích hoạt!!!"

        return response
      }

      // let wallet = await queryRunner.manager.findOne(Wallets, {
      //   where: {
      //     CollaboratorId: user.collaboratorInfo.Id,
      //     WalletTypeEnums: WalletTypeEnums.Source
      //   }
      // })

      // if (wallet.Available < 500000) {
      //   response.message = {
      //     Available: "Số dư ví ko đủ. Thao tác không thành công!!!"
      //   }

      //   return response
      // }
      // let product = await queryRunner.manager.findOne(Products, { where: { Price: Equal(3300000) } })

      // let order = await queryRunner.manager.findOne(Orders,
      //   {
      //     where: {
      //       CollaboratorId: user.collaboratorInfo.Id,
      //       Pending: MoreThan(0)
      //     },
      //     order: {
      //       CreatedAt: "DESC"
      //     }
      //   })
      // let orderResult: InsertResult | UpdateResult
      // let info: Orders

      // if (!order) {
      //   order = await queryRunner.manager.save(
      //     queryRunner.manager.create(Orders, {
      //       CollaboratorId: user.collaboratorInfo.Id,
      //       ProductId: product.Id,
      //       Value: product.Price,
      //       Payed: 500000,
      //       Pending: product.Price - 500000,
      //     } as DeepPartial<Orders>),
      //   );
      //   info = order
      // } else {
      //   if (order.Pending < 500000) {
      //     orderResult =
      //       await queryRunner.manager.createQueryBuilder()
      //         .update(Orders)
      //         .set({
      //           Payed: () => `"Payed" + ${order.Pending}`,
      //           Pending: () => `"Pending" - ${order.Pending}`,
      //         } as QueryDeepPartialEntity<Orders>)
      //         .where({
      //           Id: order.Id,
      //           Payed: Raw(alias => `${alias} + ${order.Pending} <= "Value"`),
      //           Pending: Raw(alias => `${alias} - ${order.Pending} >=0`)
      //         } as FindOptionsWhere<Orders>)
      //         .returning('*')
      //         .execute();

      //     if (orderResult?.affected == undefined || orderResult?.affected == 0) {
      //       return {
      //         status: false,
      //         message: "Lỗi liên quan tới số thanh toán và số tiền còn lại của đơn hàng"
      //       }
      //     }
      //     info = orderResult.raw[0]
      //   } else {
      //     orderResult =
      //       await queryRunner.manager.createQueryBuilder()
      //         .update(Orders)
      //         .set({
      //           Payed: () => `"Payed" + 500000`,
      //           Pending: () => `"Pending" - 500000`,
      //         } as QueryDeepPartialEntity<Orders>)
      //         .where({
      //           Id: order.Id,
      //           Payed: Raw(alias => `${alias} + 500000 <= "Value"`),
      //           Pending: Raw(alias => `${alias} - 500000 >=0`)
      //         } as FindOptionsWhere<Orders>)
      //         .returning('*')
      //         .execute();

      //     if (orderResult?.affected == undefined || orderResult?.affected == 0) {
      //       return {
      //         status: false,
      //         message: "Lỗi liên quan tới số thanh toán và số tiền còn lại của đơn hàng"
      //       }
      //     }
      //     info = orderResult.raw[0]
      //   }
      // }

      // if (info && info.Pending == 0) {
      //   let orderCur = await queryRunner.manager.findOne(Orders, {
      //     where: {
      //       Id: info.Id
      //     }
      //   })
      //   await queryRunner.manager.save(
      //     queryRunner.manager.create(Orders, {
      //       Id: info.Id,
      //       CommissionCustomerMax: orderCur.Value * 2,
      //       CommissionSaleMax: orderCur.Value * 2,
      //       CompletedDate: moment().zone(7 * 60).startOf('day').toDate()
      //     } as DeepPartial<Orders>),
      //   );
      // }

      // let orderPay = await queryRunner.manager.save(
      //   queryRunner.manager.create(OrderPays, {
      //     OrderId: order?.Id ?? orderResult.raw[0].Id,
      //     Value: 500000,
      //     Note: "Thanh toán kích hoạt",
      //     CreatedBy: user.userName,
      //     PayDate: moment().zone(7 * 60).startOf('day').toDate()
      //   } as DeepPartial<OrderPays>),
      // );

      // await queryRunner.manager.createQueryBuilder()
      //   .update(Wallets)
      //   .set({
      //     Available: () => `"Available" - 500000`,
      //   } as QueryDeepPartialEntity<Wallets>)
      //   .where({
      //     Id: wallet.Id,
      //     Available: Raw(alias => `${alias} - 500000 >=0`)
      //   } as FindOptionsWhere<Wallets>)
      //   .returning('*')
      //   .execute();

      // await queryRunner.manager.save(
      //   queryRunner.manager.create(WalletDetails, {
      //     WalletId: wallet.Id,
      //     WalletType: wallet.WalletTypeEnums,
      //     Value: -500000,
      //     Note: "Kích hoạt mã giới thiệu"
      //   })
      // )

      // if (order.Pending < 500000) {
      //   await queryRunner.manager.createQueryBuilder()
      //     .update(Wallets)
      //     .set({
      //       Available: () => `"Available" + ${500000 - order.Pending}`,
      //     } as QueryDeepPartialEntity<Wallets>)
      //     .where({
      //       Id: wallet.Id,
      //       Available: Raw(alias => `${alias} + ${500000 - order.Pending} >=0`)
      //     } as FindOptionsWhere<Wallets>)
      //     .returning('*')
      //     .execute();

      //   await queryRunner.manager.save(
      //     queryRunner.manager.create(WalletDetails, {
      //       WalletId: wallet.Id,
      //       WalletType: wallet.WalletTypeEnums,
      //       Value: 500000 - order.Pending,
      //       Note: "Trả tiền thừa kích hoạt mã giới thiệu"
      //     })
      //   )

      //   await queryRunner.manager.save(
      //     queryRunner.manager.create(OrderPays, {
      //       Id: orderPay.Id,
      //       Value: order.Pending,
      //     } as DeepPartial<OrderPays>),
      //   );

      // }

      let collaboratorNew = await queryRunner.manager.save(
        queryRunner.manager.create(Collaborators, {
          Id: user.collaboratorInfo.Id,
          IsSale: true //kich hoat ma gioi thieu
        })
      )

      await this.userActivitiesService.create({
        NewRequestData: collaboratorNew,
        OldRequestData: null,
        UserId: user.id,
        Action: user.Action[0],
        Function: user.Function,
        Description: `Kích hoạt mã giới thiệu cho KH: ${user.collaboratorInfo.UserName}`,
        RecordId: user.collaboratorInfo.Id
      }, user)

      await queryRunner.commitTransaction();
      response.status = true;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      response.message = err.message;
    } finally {
      await queryRunner.release();
    }

    return response
  }

}
