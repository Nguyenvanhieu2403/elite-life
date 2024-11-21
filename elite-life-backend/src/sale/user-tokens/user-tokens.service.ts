import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserTokens } from 'src/database/entities/user/userTokens.entity';
import { EntityCondition } from 'src/utils/types/entity-condition.type';
import { IPaginationOptions } from 'src/utils/types/pagination-options';
import { FindManyOptions, Repository } from 'typeorm';
import { ResponseData } from 'src/utils/schemas/common.schema';
import { ApplicationTypeEnums } from 'src/utils/enums.utils';
import { Users } from 'src/database/entities/user/users.entity';

@Injectable()
export class UserTokensService {
  constructor(
    @InjectRepository(UserTokens)
    private userTokensRepository: Repository<UserTokens>
  ) { }

  async find(options?: FindManyOptions<UserTokens>) {
    return await this.userTokensRepository.find(options);
  }

  async findManyWithPagination(options?: FindManyOptions<UserTokens>, paginationOptions?: IPaginationOptions,) {
    return await this.userTokensRepository.findAndCount({
      ...options,
      skip: paginationOptions ? (paginationOptions.page - 1) * paginationOptions.limit : null,
      take: paginationOptions ? paginationOptions.limit : null,
      order: {
        ...options.order,
        CreatedAt: "DESC"
      },
    });
  }

  async findOne(fields: EntityCondition<UserTokens>) {
    return await this.userTokensRepository.findOne({
      where: fields,
    });
  }
  async create(code: string, email: string, username: string) {
    var response: ResponseData = { status: false }
    var info = await this.userTokensRepository.save(
      this.userTokensRepository.create({
        ApplicationType: ApplicationTypeEnums.Sale,
        Email: email,
        UserName: username,
        Type: "1",
        Value: code,
        Exprired: new Date(Date.now() + 1 * 60 * 60 * 1000),
        IsUse: false,
      }),
    );
    response.status = true;
    response.data = info;
    return response
  }
  async update(id: Users["Id"]) {
    var response: ResponseData = { status: false }
    await this.userTokensRepository.save(
      this.userTokensRepository.create({
        Id: id,
        IsUse: true,
      }),
    );
    response.status = true;
    return response
  }
}

