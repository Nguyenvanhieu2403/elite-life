import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { Products } from 'src/database/entities/products.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityCondition } from 'src/utils/types/entity-condition.type';
import { IPaginationOptions } from 'src/utils/types/pagination-options';
import { Repository, DeepPartial, FindManyOptions } from 'typeorm';
import { ResponseData } from 'src/utils/schemas/common.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Products)
    private productsRepository: Repository<Products>,
  ) { }

  async create(createProductDto: CreateProductDto) {
    let response: ResponseData = { status: false }
    let info = await this.productsRepository.save(
      this.productsRepository.create(createProductDto),
    );
    response.status = true;
    response.data = info;
    return response
  }

  async find(options?: FindManyOptions<Products>) {
    return await this.productsRepository.find(options);
  }


  async findManyWithPagination(options?: FindManyOptions<Products>, paginationOptions?: IPaginationOptions,) {
    return await this.productsRepository.findAndCount({
      ...options,
      skip: paginationOptions ? (paginationOptions.page - 1) * paginationOptions.limit : null,
      take: paginationOptions ? paginationOptions.limit : null,
      order: {
        ...options.order,
        CreatedAt: "DESC"
      }
    });
  }

  findOne(fields: EntityCondition<Products>) {
    return this.productsRepository.findOne({
      where: fields,
    });
  }

  async update(id: number, payload: DeepPartial<Products>) {
    let response: ResponseData = { status: false }
    await this.productsRepository.save(
      this.productsRepository.create({
        Id: id,
        ...payload
      }),
    );
    response.status = true;
    return response
  }

  async remove(id: Products["Id"]) {
    let response: ResponseData = { status: false }
    await this.productsRepository.delete(id);
    response.status = true;
    return response
  }

  async softRemove(id: Products["Id"]) {
    let response: ResponseData = { status: false }
    await this.productsRepository.softDelete(id);
    response.status = true;
    return response
  }

  async lockOrUnlock(id: Products["Id"], payload: DeepPartial<Products>) {
    let response: ResponseData = { status: false }

    await this.productsRepository.save(
      this.productsRepository.create({
        Id: id,
        ...payload
      }),
    );

    response.status = true;
    return response
  }
}
