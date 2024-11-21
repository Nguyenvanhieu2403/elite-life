import { Injectable } from '@nestjs/common';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { Wallets } from 'src/database/entities/collaborator/wallet.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseData } from 'src/utils/schemas/common.schema';
import { IPaginationOptions } from 'src/utils/types/pagination-options';
import { Repository, FindManyOptions, FindOneOptions, FindOptionsWhere } from 'typeorm';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallets)
    private walletsRepository: Repository<Wallets>,
  ) { }

  async find(options?: FindManyOptions<Wallets>) {
    return await this.walletsRepository.find(options);
  }

  async findManyWithPagination(options?: FindManyOptions<Wallets>, paginationOptions?: IPaginationOptions,) {
    return await this.walletsRepository.findAndCount({
      ...options,
      skip: paginationOptions ? (paginationOptions.page - 1) * paginationOptions.limit : null,
      take: paginationOptions ? paginationOptions.limit : null,
      order: {
        ...options.order,
        CreatedAt: "DESC"
      }
    });
  }

  async findOne(options: FindOneOptions<Wallets>) {
    return await this.walletsRepository.findOne(options);
  }

  async remove(id: Wallets["Id"]) {
    let response: ResponseData = { status: false }
    await this.walletsRepository.delete(id);
    response.status = true;
    return response
  }

  async softRemove(id: Wallets["Id"]) {
    let response: ResponseData = { status: false }
    await this.walletsRepository.softDelete(id);
    response.status = true;
    return response
  }



}
