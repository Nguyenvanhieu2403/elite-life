import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Files } from 'src/database/entities/files.entity';
import { FindManyOptions, Repository } from 'typeorm';
import { EntityCondition } from 'src/utils/types/entity-condition.type';
import { IPaginationOptions } from 'src/utils/types/pagination-options';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(Files)
    private FilesRepository: Repository<Files>
  ) { }

  async find(options?: FindManyOptions<Files>) {
    return await this.FilesRepository.find(options);
  }

  async findManyWithPagination(options?: FindManyOptions<Files>, paginationOptions?: IPaginationOptions,) {
    return await this.FilesRepository.findAndCount({
      ...options,
      skip: paginationOptions ? (paginationOptions.page - 1) * paginationOptions.limit : null,
      take: paginationOptions ? paginationOptions.limit : null,
      order: {
        ...options.order,
        CreatedAt: "DESC"
      },
    });
  }

  async findOne(fields: EntityCondition<Files>) {
    return await this.FilesRepository.findOne({
      where: fields,
    });
  }
}
