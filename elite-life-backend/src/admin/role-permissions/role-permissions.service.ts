import { Injectable } from '@nestjs/common';
import RolePermissions from 'src/database/entities/user/rolePermisions.entity';
import { DataSource, DeepPartial, FindManyOptions, Repository } from 'typeorm';
import { IPaginationOptions } from 'src/utils/types/pagination-options';
import { EntityCondition } from 'src/utils/types/entity-condition.type';
import { ResponseData } from 'src/utils/schemas/common.schema';
import { JwtPayloadType } from 'src/utils/strategies/types/jwt-payload.type';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RolePermissionsService {
  constructor(
    @InjectRepository(RolePermissions)
    private RolePermissionRepository: Repository<RolePermissions>,
    private dataSource: DataSource
  ) { }

  async find(options?: FindManyOptions<RolePermissions>) {
    return await this.RolePermissionRepository.find(options);
  }

  async findManyWithPagination(options?: FindManyOptions<RolePermissions>, paginationOptions?: IPaginationOptions,) {
    return await this.RolePermissionRepository.findAndCount({
      ...options,
      skip: paginationOptions ? (paginationOptions.page - 1) * paginationOptions.limit : null,
      take: paginationOptions ? paginationOptions.limit : null,
      order: {
        ...options.order,
        CreatedAt: "DESC"
      }
    });
  }

  async findOne(fields: EntityCondition<RolePermissions>) {
    return await this.RolePermissionRepository.findOne({
      where: fields,
    });
  }

  async remove(id: RolePermissions["Id"]) {
    let response: ResponseData = { status: false }
    await this.RolePermissionRepository.delete(id);
    response.status = true;
    return response
  }

  async softRemove(id: RolePermissions["Id"]) {
    let response: ResponseData = { status: false }
    await this.RolePermissionRepository.softDelete(id);
    response.status = true;
    return response
  }

}
