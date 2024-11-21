import { Injectable } from '@nestjs/common';
import { CreateOrderPayDto } from './dto/create-order-pay.dto';
import { UpdateOrderPayDto } from './dto/update-order-pay.dto';
import { OrderPays } from 'src/database/entities/collaborator/orderPay.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseData } from 'src/utils/schemas/common.schema';
import { IPaginationOptions } from 'src/utils/types/pagination-options';
import { Repository, DataSource, FindManyOptions, FindOneOptions } from 'typeorm';

@Injectable()
export class OrderPaysService {
  constructor(
    @InjectRepository(OrderPays)
    private orderPaysRepository: Repository<OrderPays>,
    private dataSource: DataSource
  ) { }


  async find(options?: FindManyOptions<OrderPays>) {
    return await this.orderPaysRepository.find(options);
  }

  async findManyWithPagination(options?: FindManyOptions<OrderPays>, paginationOptions?: IPaginationOptions,) {
    return await this.orderPaysRepository.findAndCount({
      ...options,
      skip: paginationOptions ? (paginationOptions.page - 1) * paginationOptions.limit : null,
      take: paginationOptions ? paginationOptions.limit : null,
      order: {
        ...options.order,
        CreatedAt: "DESC"
      },
    });
  }

  async findOne(options: FindOneOptions<OrderPays>) {
    return await this.orderPaysRepository.findOne(options);
  }

  async remove(id: OrderPays["Id"]) {
    const response: ResponseData = { status: false }
    await this.orderPaysRepository.delete(id);
    response.status = true;
    return response
  }

  async softRemove(id: OrderPays["Id"]) {
    const response: ResponseData = { status: false }
    await this.orderPaysRepository.softDelete(id);
    response.status = true;
    return response
  }
}
