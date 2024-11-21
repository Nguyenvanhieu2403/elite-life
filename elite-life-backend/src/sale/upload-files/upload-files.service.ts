import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UploadFiles } from 'src/database/entities/uploadFiles.entity';
import { EntityCondition } from 'src/utils/types/entity-condition.type';
import { IPaginationOptions } from 'src/utils/types/pagination-options';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';

@Injectable()
export class UploadFilesService {
  constructor(
    @InjectRepository(UploadFiles)
    private uploadFilesRepository: Repository<UploadFiles>,
  ) { }

  async find(options?: FindManyOptions<UploadFiles>) {
    return await this.uploadFilesRepository.find(options);
  }

  async exist(options?: FindManyOptions<UploadFiles>) {
    return await this.uploadFilesRepository.exist(options);
  }

  async findManyWithPagination(options?: FindManyOptions<UploadFiles>, paginationOptions?: IPaginationOptions,) {
    return await this.uploadFilesRepository.findAndCount({
      ...options,
      skip: paginationOptions ? (paginationOptions.page - 1) * paginationOptions.limit : null,
      take: paginationOptions ? paginationOptions.limit : null,
      order: {
        ...options.order,
        CreatedAt: "DESC"
      },
    });
  }

  async findOne(options: FindOneOptions<UploadFiles>) {
    return await this.uploadFilesRepository.findOne(options);
  }
}
