import { Injectable } from '@nestjs/common';
import { CreateUserSaleDto } from './dto/create-user-sale.dto';
import { UpdateUserSaleDto } from './dto/update-user-sale.dto';
import { Collaborators } from 'src/database/entities/collaborator/collaborators.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/database/entities/user/users.entity';
import { ResponseData } from 'src/utils/schemas/common.schema';
import { JwtPayloadType } from 'src/utils/strategies/types/jwt-payload.type';
import { EntityCondition } from 'src/utils/types/entity-condition.type';
import { IPaginationOptions } from 'src/utils/types/pagination-options';
import { Repository, FindManyOptions, DeepPartial } from 'typeorm';
import { CreateCollaboratorDto } from '../collaborators/dto/create-collaborator.dto';

@Injectable()
export class UserSaleService {
  constructor(
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
    @InjectRepository(Collaborators)
    private collaboratorsRepository: Repository<Collaborators>,
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

  async update(id: Users["Id"], payload: DeepPartial<Users>) {
    let response: ResponseData = { status: false }
    const { UserName, ...updatePayload } = payload;

    await this.userRepository.save(
      this.userRepository.create({
        Id: id,
        ...updatePayload
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

    let user = await this.userRepository.findOne({ where: { Id: id } })

    await this.collaboratorsRepository.softDelete({ UserName: user.UserName })
    await this.userRepository.softDelete(id);
    response.status = true;
    return response
  }
}
