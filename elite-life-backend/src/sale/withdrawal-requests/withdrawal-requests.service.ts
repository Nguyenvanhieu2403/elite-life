import { Injectable } from '@nestjs/common';
import { CreateWithdrawalRequestDto } from './dto/create-withdrawal-request.dto';
import { UpdateWithdrawalRequestDto } from './dto/update-withdrawal-request.dto';
import { WithdrawalRequests } from 'src/database/entities/collaborator/withdrawalRequests.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseData } from 'src/utils/schemas/common.schema';
import { EntityCondition } from 'src/utils/types/entity-condition.type';
import { IPaginationOptions } from 'src/utils/types/pagination-options';
import { Repository, FindManyOptions, DeepPartial, FindOneOptions } from 'typeorm';
import { FileHelper } from 'src/utils/file-helper';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';
import * as path from 'path';
import { AllConfigType } from 'src/config/config.type';
import { WalletTypeEnums, WithdrawalStatusEnums } from 'src/utils/enums.utils';
import { JwtPayloadType } from 'src/utils/strategies/types/jwt-payload.type';
import { Wallets } from 'src/database/entities/collaborator/wallet.entity';

@Injectable()
export class WithdrawalRequestsService {
    constructor(
        private configService: ConfigService<AllConfigType>,
        @InjectRepository(WithdrawalRequests)
        private withdrawalRequestsRepository: Repository<WithdrawalRequests>,
        @InjectRepository(Wallets)
        private walletsRepository: Repository<Wallets>,
    ) { }

    async create(createWithdrawalRequestDto: CreateWithdrawalRequestDto, user: JwtPayloadType) {
        let response: ResponseData = { status: false }

        let wallet = await this.walletsRepository.findOne({
            where: { CollaboratorId: user.collaboratorInfo.Id, WalletTypeEnums: WalletTypeEnums.Source }
        })

        if (!wallet || wallet.Available < createWithdrawalRequestDto.WithdrawalAmount) {
            response.message = {
                WithdrawalAmount: "Số dư ví không đủ. Thao tác không thành công!!!"
            }

            return response
        }

        createWithdrawalRequestDto.Tax = createWithdrawalRequestDto.WithdrawalAmount * 0.1
        createWithdrawalRequestDto.ActualNumberReceived = createWithdrawalRequestDto.WithdrawalAmount - createWithdrawalRequestDto.Tax

        let info = await this.withdrawalRequestsRepository.save(
            this.withdrawalRequestsRepository.create({
                CollaboratorId: user.collaboratorInfo.Id,
                BankNumber: createWithdrawalRequestDto.BankNumber,
                BankOwner: createWithdrawalRequestDto.BankOwner,
                BankId: createWithdrawalRequestDto.BankId,
                BankBranchName: createWithdrawalRequestDto.BankBranchName,
                WithdrawalAmount: createWithdrawalRequestDto.WithdrawalAmount,
                Tax: createWithdrawalRequestDto.Tax,
                ActualNumberReceived: createWithdrawalRequestDto.ActualNumberReceived,
                Status: WithdrawalStatusEnums.Processing,
            }),
        );

        info.Code = `ELR${String(info.Id).padStart(3, '0')}`
        await this.withdrawalRequestsRepository.save(
            this.withdrawalRequestsRepository.create({
                Id: info.Id,
                Code: info.Code
            }));

        response.status = true;
        response.data = info;
        return response
    }

    async find(options?: FindManyOptions<WithdrawalRequests>) {
        return await this.withdrawalRequestsRepository.find(options);
    }


    async findManyWithPagination(options?: FindManyOptions<WithdrawalRequests>, paginationOptions?: IPaginationOptions,) {
        return await this.withdrawalRequestsRepository.findAndCount({
            ...options,
            skip: paginationOptions ? (paginationOptions.page - 1) * paginationOptions.limit : null,
            take: paginationOptions ? paginationOptions.limit : null,
            order: {
                ...options.order,
                CreatedAt: "DESC"
            }
        });
    }

    async findOne(options: FindOneOptions<WithdrawalRequests>) {
        return await this.withdrawalRequestsRepository.findOne(options);
    }

    async update(id: number, createWithdrawalRequestDto: UpdateWithdrawalRequestDto) {
        let response: ResponseData = { status: false }
        await this.withdrawalRequestsRepository.save(
            this.withdrawalRequestsRepository.create({
                Id: id,
                ...createWithdrawalRequestDto
            }),
        );
        response.status = true;
        return response
    }

    async remove(id: WithdrawalRequests["Id"]) {
        let response: ResponseData = { status: false }
        await this.withdrawalRequestsRepository.delete(id);
        response.status = true;
        return response
    }

    async softRemove(id: WithdrawalRequests["Id"]) {
        let response: ResponseData = { status: false }
        await this.withdrawalRequestsRepository.softDelete(id);
        response.status = true;
        return response
    }

    async lockOrUnlock(id: WithdrawalRequests["Id"], payload: DeepPartial<WithdrawalRequests>) {
        let response: ResponseData = { status: false }

        await this.withdrawalRequestsRepository.save(
            this.withdrawalRequestsRepository.create({
                Id: id,
                ...payload
            }),
        );

        response.status = true;
        return response
    }
}
