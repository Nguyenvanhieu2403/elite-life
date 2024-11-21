import { Injectable } from '@nestjs/common';

import { Permissions } from 'src/database/entities/user/permissions.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityCondition } from 'src/utils/types/entity-condition.type';
import { IPaginationOptions } from 'src/utils/types/pagination-options';
import { Repository, DeepPartial, FindManyOptions } from 'typeorm';
import { ResponseData } from 'src/utils/schemas/common.schema';
import { CreatePermissionsSaleDto } from './dto/create-permissions-sale.dto';

@Injectable()
export class PermissionsSaleService {
  constructor(
    @InjectRepository(Permissions)
    private permissionsRepository: Repository<Permissions>,
  ) { }

  async create(createPermissionsSaleDto: CreatePermissionsSaleDto) {
    let response: ResponseData = { status: false }
    await this.permissionsRepository.save(
      this.permissionsRepository.create(createPermissionsSaleDto),
    );
    response.status = true;
    return response
  }

  async find(options?: FindManyOptions<Permissions>) {
    return await this.permissionsRepository.find(options);
  }

  findManyWithPagination(options: FindManyOptions<Permissions>, paginationOptions?: IPaginationOptions,) {
    return this.permissionsRepository.findAndCount({
      ...options,
      skip: paginationOptions ? (paginationOptions.page - 1) * paginationOptions.limit : null,
      take: paginationOptions ? paginationOptions.limit : null,
      order: {
        ...options.order,
        CreatedAt: "DESC"
      },
    });
  }

  findOne(fields: EntityCondition<Permissions>) {
    return this.permissionsRepository.findOne({
      where: fields,
    });
  }

  async update(id: number, payload: DeepPartial<Permissions>) {
    let response: ResponseData = { status: false }
    await this.permissionsRepository.save(
      this.permissionsRepository.create({
        Id: id,
        ...payload
      }),
    );
    response.status = true;
    return response
  }

  async remove(id: Permissions["Id"]) {
    let response: ResponseData = { status: false }
    await this.permissionsRepository.delete(id);
    response.status = true;
    return response
  }

  async softRemove(id: Permissions["Id"]) {
    let response: ResponseData = { status: false }
    await this.permissionsRepository.softDelete(id);
    response.status = true;
    return response
  }
}
