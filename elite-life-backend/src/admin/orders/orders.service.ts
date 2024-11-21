import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityCondition } from 'src/utils/types/entity-condition.type';
import { IPaginationOptions } from 'src/utils/types/pagination-options';
import { Repository, DeepPartial, FindManyOptions, DataSource, QueryRunner, FindOptionsWhere, Raw, Not, In, FindOneOptions, IsNull } from 'typeorm';
import { ResponseData } from 'src/utils/schemas/common.schema';
import { Orders } from 'src/database/entities/collaborator/order.entity';
import { JwtPayloadType } from 'src/utils/strategies/types/jwt-payload.type';
import { PayOrderDto } from './dto/pay-order.dto';
import { OrderPays } from 'src/database/entities/collaborator/orderPay.entity';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import logger from 'src/utils/logger';
import * as moment from 'moment';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Orders)
    private ordersRepository: Repository<Orders>,
    private dataSource: DataSource,
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

  async findOne(options: FindOneOptions<Orders>) {
    return await this.ordersRepository.findOne(options);
  }

  async create(createOrderDto: CreateOrderDto) {
    let response: ResponseData = { status: false }
    let info = await this.ordersRepository.save(
      this.ordersRepository.create(createOrderDto),
    );
    response.status = true;
    response.data = info;
    return response
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

  async sum(options: FindOptionsWhere<Orders> | FindOptionsWhere<Orders>[]): Promise<number> {
    const totalAmount = await this.ordersRepository.sum('Payed', options);
    return totalAmount || 0;
  }

  async countOrders(): Promise<number> {
    const count = await this.ordersRepository.count({
      where: { CompletedDate: Not(IsNull()) }
    });
    return count;
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

    return response
  }

  async payCommon(queryRunner: QueryRunner, payOrderDto: PayOrderDto, user: JwtPayloadType) {
    try {
      let orderResult =
        await queryRunner.manager.createQueryBuilder()
          .update(Orders)
          .set({
            Payed: () => `"Payed" + ${payOrderDto.Value}`,
            Pending: () => `"Pending" - ${payOrderDto.Value}`,
          } as QueryDeepPartialEntity<Orders>)
          .where({
            Id: payOrderDto.OrderId,
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

      await queryRunner.manager.save(
        queryRunner.manager.create(OrderPays, {
          OrderId: payOrderDto.OrderId,
          Value: payOrderDto.Value,
          Note: payOrderDto.Note,
          CreatedBy: user.userName,
        } as OrderPays),
      );

      let info: Orders = orderResult.raw

      if (info && info.Pending == 0) {
        await queryRunner.manager.save(
          queryRunner.manager.create(Orders, {
            Id: payOrderDto.OrderId,
            CompletedDate: moment().zone(7 * 60).toDate()
          } as Orders),
        );
      }

      return {
        status: true
      }
    } catch (error) {
      logger.error(error)
      throw error;
    }
  };

  async calcCustomer(queryRunner: QueryRunner, order: Orders, user: JwtPayloadType) {
    try {
      // đồng chia
      let orderShares = await queryRunner.manager.find(Orders,
        {
          where: {
            Pending: 0,
            Id: Not(order.Id)
          },
          select: {
            Id: true,
          }
        }
      )

      let customerNum = orderShares.length;
      if (customerNum > 0) {
        let valueShare = (order.Value - (order.Value % customerNum)) / customerNum

        await queryRunner.manager.createQueryBuilder()
          .update(Orders)
          .set({
            CommissionCustomerShare: () =>
              `CASE WHEN "CommissionCustomerShare" + "CommissionCustomerGratitude" + ${valueShare} > "CommissionCustomerMax" THEN
                "CommissionCustomerMax" - "CommissionCustomerShare" - "CommissionCustomerGratitude"
              ELSE 
                ${valueShare}
              END`,
          } as QueryDeepPartialEntity<Orders>)
          .where({
            Id: In(orderShares.map(s => s.Id)),
          } as FindOptionsWhere<Orders>)
          .execute();
      }

      // nhị phân
    } catch (error) {
      logger.error(`calcCustomer`)
      throw error;
    }
  }

  async calcSale(queryRunner: QueryRunner, order: Orders, user: JwtPayloadType) {
    try {

    } catch (error) {
      logger.error(`calcSale`)
      throw error;
    }
  }

  async isDelivered(id: Orders["Id"], payload: DeepPartial<Orders>) {
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
}
