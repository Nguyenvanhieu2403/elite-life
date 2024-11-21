import { Injectable } from '@nestjs/common';
import { Roles } from 'src/database/entities/user/roles.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityCondition } from 'src/utils/types/entity-condition.type';
import { IPaginationOptions } from 'src/utils/types/pagination-options';
import { Repository, DeepPartial, FindManyOptions, DataSource, FindOneOptions } from 'typeorm';
import { ResponseData } from 'src/utils/schemas/common.schema';
import { JwtPayloadType } from 'src/utils/strategies/types/jwt-payload.type';
import RolePermissions from 'src/database/entities/user/rolePermisions.entity';
import { CreateRolesSaleDto } from './dto/create-roles-sale.dto';
import { UpdateRolesSaleDto } from './dto/update-roles-sale.dto';

@Injectable()
export class RolesSaleService {
  constructor(
    @InjectRepository(Roles)
    private rolesRepository: Repository<Roles>,
    @InjectRepository(RolePermissions)
    private rolePermissionsRepository: Repository<RolePermissions>,
    private dataSource: DataSource,
  ) { }

  findManyWithPagination(options?: FindManyOptions<Roles>, paginationOptions?: IPaginationOptions,) {
    return this.rolesRepository.findAndCount({
      ...options,
      skip: paginationOptions ? (paginationOptions.page - 1) * paginationOptions.limit : null,
      take: paginationOptions ? paginationOptions.limit : null,
      order: {
        ...options.order,
        CreatedAt: "DESC"
      },
    });
  }

  async find(options?: FindManyOptions<Roles>) {
    return await this.rolesRepository.find(options);
  }

  findOne(options: FindOneOptions<Roles>) {
    return this.rolesRepository.findOne(options);
  }

  async create(createRolesSaleDto: CreateRolesSaleDto, user: JwtPayloadType,) {
    let response: ResponseData = { status: false }
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      let role = await queryRunner.manager.save(
        queryRunner.manager.create(Roles, {
          ...createRolesSaleDto,
          CreatedBy: user?.userName
        }));

      for (const Permission of createRolesSaleDto.PermissionIds) {
        await queryRunner.manager.save(
          queryRunner.manager.create(RolePermissions, {
            RoleId: role.Id,
            PermissionId: Permission,
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

  async update(id: number, updateRolesSaleDto: UpdateRolesSaleDto, user: JwtPayloadType,) {
    let response: ResponseData = { status: false }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.save(
        queryRunner.manager.create(Roles, {
          Id: id,
          Name: updateRolesSaleDto.Name
        }));

      await queryRunner.manager.delete(RolePermissions, { RoleId: id });

      for (const Permission of updateRolesSaleDto.PermissionIds) {
        await queryRunner.manager.save(
          queryRunner.manager.create(RolePermissions, {
            RoleId: id,
            PermissionId: Permission,
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

  async remove(id: Roles["Id"]) {
    let response: ResponseData = { status: false }
    await this.rolesRepository.delete(id);
    response.status = true;
    return response
  }

  async softRemove(id: Roles["Id"]) {
    let response: ResponseData = { status: false }
    await this.rolesRepository.softDelete(id);
    response.status = true;
    return response
  }
}
