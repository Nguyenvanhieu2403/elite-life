import { Injectable } from '@nestjs/common';
import { Banks } from 'src/database/entities/collaborator/banks.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, FindManyOptions, Repository } from 'typeorm';
import { IPaginationOptions } from 'src/utils/types/pagination-options';
import { EntityCondition } from 'src/utils/types/entity-condition.type';
import { ResponseData } from 'src/utils/schemas/common.schema';

@Injectable()
export class BanksService {
  constructor(
    @InjectRepository(Banks)
    private banksRepository: Repository<Banks>,
  ) { }

  async find(options?: FindManyOptions<Banks>) {
    return await this.banksRepository.find(options);
  }

  findManyWithPagination(options?: FindManyOptions<Banks>, paginationOptions?: IPaginationOptions,) {
    return this.banksRepository.findAndCount({
      ...options,
      skip: paginationOptions ? (paginationOptions.page - 1) * paginationOptions.limit : null,
      take: paginationOptions ? paginationOptions.limit : null,
      order: {
        ...options.order,
        CreatedAt: "DESC"
      },
    });
  }

  findOne(fields: EntityCondition<Banks>) {
    return this.banksRepository.findOne({
      where: fields,
    });
  }

}
