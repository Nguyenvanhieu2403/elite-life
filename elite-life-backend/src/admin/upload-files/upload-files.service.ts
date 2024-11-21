import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UploadFiles } from 'src/database/entities/uploadFiles.entity';
import { EntityCondition } from 'src/utils/types/entity-condition.type';
import { IPaginationOptions } from 'src/utils/types/pagination-options';
import { DataSource, DeepPartial, FindManyOptions, FindOneOptions, FindOptionsWhere, Repository } from 'typeorm';
import { CreateUploadFileDto } from './dto/create-upload-file.dto';
import { JwtPayloadType } from 'src/utils/strategies/types/jwt-payload.type';
import { ResponseData } from 'src/utils/schemas/common.schema';
import { Files } from 'src/database/entities/files.entity';
import { CreateManyUploadFileDto } from './dto/create-many-upload-file.dto';
import * as moment from 'moment';

@Injectable()
export class UploadFilesService {
  constructor(
    @InjectRepository(UploadFiles)
    private uploadFilesRepository: Repository<UploadFiles>,
    private dataSource: DataSource
  ) { }

  async find(options?: FindManyOptions<UploadFiles>) {
    return await this.uploadFilesRepository.find(options);
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

  async create(createUploadFileDto: CreateUploadFileDto, user: JwtPayloadType) {
    let response: ResponseData = { status: false }
    await this.uploadFilesRepository.save(
      this.uploadFilesRepository.create(createUploadFileDto),
    );
    response.status = true;
    return response
  }

  async createMany(createUploadFileDtos: CreateManyUploadFileDto[], user: JwtPayloadType) {
    let response: ResponseData = { status: false }
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      let dtos: UploadFiles[] = []
      for (const createOtherListDto of createUploadFileDtos) {
        dtos.push(queryRunner.manager.create(UploadFiles, {
          ...createOtherListDto,
          CreatedBy: user.userName
        }))
      }
      await queryRunner.manager.save(dtos);
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

  async update(id: UploadFiles["Id"], payload: DeepPartial<UploadFiles>) {
    let response: ResponseData = { status: false }
    await this.uploadFilesRepository.save(
      this.uploadFilesRepository.create({
        Id: id,
        ...payload
      }),
    );
    response.status = true;
    return response
  }

  async softRemove(uploadFiles: FindOptionsWhere<UploadFiles>) {
    let response: ResponseData = { status: false }
    await this.uploadFilesRepository.softDelete(uploadFiles);
    response.status = true;
    return response
  }

}
