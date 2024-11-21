import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserTokens } from 'src/database/entities/user/userTokens.entity';
import { FindManyOptions, Repository } from 'typeorm';
import { IPaginationOptions } from 'src/utils/types/pagination-options';
import { EntityCondition } from 'src/utils/types/entity-condition.type';

@Injectable()
export class UserTokensService {
  constructor(
    @InjectRepository(UserTokens)
    private UserTokensRepository: Repository<UserTokens>
  ) { }

  async find(options?: FindManyOptions<UserTokens>) {
    return await this.UserTokensRepository.find(options);
  }

  async findManyWithPagination(options?: FindManyOptions<UserTokens>, paginationOptions?: IPaginationOptions,) {
    return await this.UserTokensRepository.findAndCount({
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
    return await this.UserTokensRepository.findOne({
      where: fields,
    });
  }
}
