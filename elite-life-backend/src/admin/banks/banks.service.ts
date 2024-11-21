import { Injectable } from '@nestjs/common';
import { Banks } from 'src/database/entities/collaborator/banks.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { IPaginationOptions } from 'src/utils/types/pagination-options';
import { EntityCondition } from 'src/utils/types/entity-condition.type';
import { ResponseData } from 'src/utils/schemas/common.schema';
import { CreateBanksDto } from './dto/create-banks.dto';
import { JwtPayloadType } from 'src/utils/strategies/types/jwt-payload.type';
import { UpdateBanksDto } from './dto/update-banks.dto';

@Injectable()
export class BanksService {
  constructor(
    @InjectRepository(Banks)
    private banksRepository: Repository<Banks>,
  ) { }

  async find(options?: FindManyOptions<Banks>) {
    return await this.banksRepository.find(options);
  }

  findManyWithPagination(options?: FindManyOptions<Banks>, paginationOptions?: IPaginationOptions,) {
    return this.banksRepository.findAndCount({
      ...options,
      skip: paginationOptions ? (paginationOptions.page - 1) * paginationOptions.limit : null,
      take: paginationOptions ? paginationOptions.limit : null,
      order: {
        ...options.order,
        CreatedAt: "DESC"
      },
    });
  }

  async findOne(options: FindOneOptions<Banks>) {
    return await this.banksRepository.findOne(options);
  }

  async create(createBanksDto: CreateBanksDto, user: JwtPayloadType) {
    const response: ResponseData = { status: false }
    let info = await this.banksRepository.save(
      this.banksRepository.create({
        ...createBanksDto,
        CreatedBy: user.userName
      }),
    );
    response.status = true;
    response.data = info;
    return response
  }

  async update(id: Banks["Id"], updateBankDto: UpdateBanksDto) {
    const response: ResponseData = { status: false }
    await this.banksRepository.save(
      this.banksRepository.create({
        Id: id,
        ...updateBankDto
      }),
    );
    response.status = true;
    return response
  }

  async remove(id: Banks["Id"]) {
    const response: ResponseData = { status: false }
    await this.banksRepository.delete(id);
    response.status = true;
    return response
  }

  async softRemove(id: Banks["Id"]) {
    const response: ResponseData = { status: false }
    await this.banksRepository.softDelete(id);
    response.status = true;
    return response
  }
}
