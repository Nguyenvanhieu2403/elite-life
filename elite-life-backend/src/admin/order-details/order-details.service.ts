import { Injectable } from '@nestjs/common';
import { CreateOrderDetailDto } from './dto/create-order-detail.dto';
import { UpdateOrderDetailDto } from './dto/update-order-detail.dto';
import { OrderDetails } from 'src/database/entities/collaborator/orderDetail.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseData } from 'src/utils/schemas/common.schema';
import { IPaginationOptions } from 'src/utils/types/pagination-options';
import { Repository, FindManyOptions, FindOneOptions } from 'typeorm';

@Injectable()
export class OrderDetailsService {
  constructor(
    @InjectRepository(OrderDetails)
    private orderDetailsRepository: Repository<OrderDetails>,
  ) { }

  async find(options?: FindManyOptions<OrderDetails>) {
    return await this.orderDetailsRepository.find(options);
  }

  async findManyWithPagination(options?: FindManyOptions<OrderDetails>, paginationOptions?: IPaginationOptions,) {
    return await this.orderDetailsRepository.findAndCount({
      ...options,
      skip: paginationOptions ? (paginationOptions.page - 1) * paginationOptions.limit : null,
      take: paginationOptions ? paginationOptions.limit : null,
      order: {
        ...options.order,
        CreatedAt: "DESC"
      }
    });
  }

  async findOne(options: FindOneOptions<OrderDetails>) {
    return await this.orderDetailsRepository.findOne(options);
  }

  async remove(id: OrderDetails["Id"]) {
    let response: ResponseData = { status: false }
    await this.orderDetailsRepository.delete(id);
    response.status = true;
    return response
  }

  async softRemove(id: OrderDetails["Id"]) {
    let response: ResponseData = { status: false }
    await this.orderDetailsRepository.softDelete(id);
    response.status = true;
    return response
  }
}
