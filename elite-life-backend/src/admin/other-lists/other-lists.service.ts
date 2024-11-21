import { Injectable } from '@nestjs/common';
import { CreateOtherListDto } from './dto/create-other-list.dto';
import { UpdateOtherListDto } from './dto/update-other-list.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, DeepPartial, FindManyOptions, FindOptionsWhere, In, Repository } from 'typeorm';
import { OtherLists } from 'src/database/entities/otherLists.entity';
import { ResponseData } from 'src/utils/schemas/common.schema';
import logger from 'src/utils/logger';
import { IPaginationOptions } from 'src/utils/types/pagination-options';
import { EntityCondition } from 'src/utils/types/entity-condition.type';
import { NullableType } from 'src/utils/types/nullable.type';
import { JwtPayloadType } from 'src/utils/strategies/types/jwt-payload.type';
import { ImportOtherListDto } from './dto/import-other-list.dto';
import { OtherListTypeEnums } from 'src/utils/enums.utils';

@Injectable()
export class OtherListsService {
  constructor(
    @InjectRepository(OtherLists)
    private otherListRepository: Repository<OtherLists>,
    private dataSource: DataSource
  ) { }

  async find(options?: FindManyOptions<OtherLists>) {
    return await this.otherListRepository.find(options);
  }

  async findManyWithPagination(options?: FindManyOptions<OtherLists>, paginationOptions?: IPaginationOptions,) {
    return await this.otherListRepository.findAndCount({
      ...options,
      skip: paginationOptions ? (paginationOptions.page - 1) * paginationOptions.limit : null,
      take: paginationOptions ? paginationOptions.limit : null,
      order: {
        ...options.order,
        CreatedAt: "DESC"
      }
    });
  }

  async findOne(fields: EntityCondition<OtherLists>) {
    return await this.otherListRepository.findOne({
      where: fields,
    });
  }

  async create(createOtherListDto: CreateOtherListDto, user: JwtPayloadType) {
    let response: ResponseData = { status: false }
    let info = await this.otherListRepository.save(
      this.otherListRepository.create({
        ...createOtherListDto,
        CreatedBy: user.userName,
      }),
    );
    response.status = true;
    response.data = info
    return response
  }

  async update(id: OtherLists["Id"], payload: DeepPartial<OtherLists>) {
    let response: ResponseData = { status: false }
    await this.otherListRepository.save(
      this.otherListRepository.create({
        Id: id,
        ...payload
      }),
    );
    response.status = true;
    return response
  }

  async remove(id: OtherLists["Id"]) {
    let response: ResponseData = { status: false }
    await this.otherListRepository.delete(id);
    response.status = true;
    return response
  }

  async softRemove(id: OtherLists["Id"]) {
    let response: ResponseData = { status: false }
    await this.otherListRepository.softDelete(id);
    response.status = true;
    return response
  }

  async import(createOtherListDtos: ImportOtherListDto[], user: JwtPayloadType) {
    let response: ResponseData = { status: false }
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      for (const createOtherListDto of createOtherListDtos) {
        await queryRunner.manager.save(queryRunner.manager.create(OtherLists, {
          ...createOtherListDto,
          CreatedBy: user?.userName
        }));
      }
      await queryRunner.commitTransaction();
      response.status = true;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      response.message = err.message;
    } finally {
      await queryRunner.release();
    }
    return response;
  }

  async findByTypes(types: OtherListTypeEnums[]): Promise<ResponseData<{ [key: string]: OtherLists[] }>> {
    let response: ResponseData<{ [key: string]: OtherLists[] }> = { status: false };
    try {
      let data: OtherLists[] = await this.otherListRepository.find({
        where: {
          Type: In(types)
        },
        order: {
          Ord: "ASC",
          Name: "ASC"
        }
      });
      response.data = {};

      types.forEach(type => {
        let dataFilter = data.filter((item) => item.Type == type)
        response.data![type] = dataFilter;
      });

      return {
        ...response,
        status: true
      }

    } catch (error) {
      logger.error(error);
      let message = "";
      if (typeof error === "string") message = error
      else if (error instanceof Error) message = error.message
      return {
        ...response,
        message
      };
    }
  }

}
