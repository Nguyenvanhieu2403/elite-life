import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WalletDetails } from 'src/database/entities/collaborator/walletDetail.entity';
import { ResponseData } from 'src/utils/schemas/common.schema';
import { EntityCondition } from 'src/utils/types/entity-condition.type';
import { FindOptions } from 'src/utils/types/find-options.type';
import { IPaginationOptions } from 'src/utils/types/pagination-options';
import { Repository, FindManyOptions, DeepPartial, FindOneOptions, FindOptionsWhere } from 'typeorm';

@Injectable()
export class WalletDetailsService {

  constructor(
    @InjectRepository(WalletDetails)
    private walletDetailsRepository: Repository<WalletDetails>,
  ) { }


  async find(options?: FindManyOptions<WalletDetails>) {
    return await this.walletDetailsRepository.find(options);
  }


  async findManyWithPagination(options?: FindManyOptions<WalletDetails>, paginationOptions?: IPaginationOptions,) {
    return await this.walletDetailsRepository.findAndCount({
      ...options,
      skip: paginationOptions ? (paginationOptions.page - 1) * paginationOptions.limit : null,
      take: paginationOptions ? paginationOptions.limit : null,
      order: {
        ...options.order,
        CreatedAt: "DESC"
      }
    });
  }

  async findOne(options: FindOneOptions<WalletDetails>) {
    return await this.walletDetailsRepository.findOne(options);
  }

  async sum(options: FindOptionsWhere<WalletDetails> | FindOptionsWhere<WalletDetails>[]): Promise<number> {
    const totalAmount = await this.walletDetailsRepository.sum('Value', options);
    return totalAmount || 0;
  }

  async remove(id: WalletDetails["Id"]) {
    let response: ResponseData = { status: false }
    await this.walletDetailsRepository.delete(id);
    response.status = true;
    return response
  }

  async softRemove(id: WalletDetails["Id"]) {
    let response: ResponseData = { status: false }
    await this.walletDetailsRepository.softDelete(id);
    response.status = true;
    return response
  }

  async lockOrUnlock(id: WalletDetails["Id"], payload: DeepPartial<WalletDetails>) {
    let response: ResponseData = { status: false }

    await this.walletDetailsRepository.save(
      this.walletDetailsRepository.create({
        Id: id,
        ...payload
      }),
    );

    response.status = true;
    return response
  }

}
