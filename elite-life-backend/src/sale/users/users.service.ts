import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Users } from 'src/database/entities/user/users.entity';
import { ResponseData } from 'src/utils/schemas/common.schema';
import { JwtPayloadType } from 'src/utils/strategies/types/jwt-payload.type';
import { EntityCondition } from 'src/utils/types/entity-condition.type';
import { DeepPartial, FindManyOptions, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions } from 'src/utils/types/pagination-options';
import { StringToMd5 } from 'src/utils/common-helper';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
  ) { }

  async find(options?: FindManyOptions<Users>) {
    return await this.userRepository.find(options);
  }

  async exist(options?: FindManyOptions<Users>) {
    return await this.userRepository.exist(options);
  }

  findManyWithPagination(options?: FindManyOptions<Users>, paginationOptions?: IPaginationOptions,) {
    return this.userRepository.findAndCount({
      ...options,
      skip: paginationOptions ? (paginationOptions.page - 1) * paginationOptions.limit : null,
      take: paginationOptions ? paginationOptions.limit : null,
      order: {
        ...options.order,
        CreatedAt: "DESC"
      },
    });
  }

  findOne(fields: EntityCondition<Users>) {
    return this.userRepository.findOne({
      where: fields,
    });
  }

  async create(createUserDto: CreateUserDto, user: JwtPayloadType) {
    let response: ResponseData = { status: false }
    await this.userRepository.save(
      this.userRepository.create({
        ...createUserDto,
        CreatedBy: user?.userName
      }),
    );
    response.status = true;
    return response
  }

  async update(id: Users["Id"], payload: DeepPartial<Users>) {
    let response: ResponseData = { status: false }
    await this.userRepository.save(
      this.userRepository.create({
        Id: id,
        ...payload
      }),
    );
    response.status = true;
    return response
  }

  async lockOrUnlock(id: Users["Id"], payload: DeepPartial<Users>) {
    let response: ResponseData = { status: false }
    await this.userRepository.save(
      this.userRepository.create({
        Id: id,
        ...payload
      }),
    );
    response.status = true;
    return response
  }

  async remove(id: Users["Id"]) {
    let response: ResponseData = { status: false }
    await this.userRepository.delete(id);
    response.status = true;
    return response
  }

  async softRemove(id: Users["Id"]) {
    let response: ResponseData = { status: false }
    await this.userRepository.softDelete(id);
    response.status = true;
    return response
  }
  async resetPassword(id: Users["Id"], password: string) {
    var response: ResponseData = { status: false }
    await this.userRepository.save(
      this.userRepository.create({
        Id: id,
        Password: StringToMd5(password)
      }),
    );
    response.status = true;
    return response
  }
}
