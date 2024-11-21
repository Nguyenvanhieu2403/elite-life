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
import { Wallets } from 'src/database/entities/collaborator/wallet.entity';
import { WalletDetails } from 'src/database/entities/collaborator/walletDetail.entity';

@Injectable()
export class WithdrawalRequestsService {
    constructor(
        private configService: ConfigService<AllConfigType>,
        @InjectRepository(WithdrawalRequests)
        private withdrawalRequestsRepository: Repository<WithdrawalRequests>,
        @InjectRepository(Wallets)
        private walletsRepository: Repository<Wallets>,
        @InjectRepository(WalletDetails)
        private walletDetailsRepository: Repository<WalletDetails>,
    ) { }

    async create(createWithdrawalRequestDto: CreateWithdrawalRequestDto) {
        let response: ResponseData = { status: false }
        let info = await this.withdrawalRequestsRepository.save(
            this.withdrawalRequestsRepository.create({
                CollaboratorId: createWithdrawalRequestDto.CollaboratorId,
                BankNumber: createWithdrawalRequestDto.BankNumber,
                BankOwner: createWithdrawalRequestDto.BankOwner,
                BankId: createWithdrawalRequestDto.BankId,
                BankBranchName: createWithdrawalRequestDto.BankBranchName,
                WithdrawalAmount: createWithdrawalRequestDto.WithdrawalAmount,
                Note: createWithdrawalRequestDto.Note,
                NoteRejection: createWithdrawalRequestDto.NoteRejection,
                Status: WithdrawalStatusEnums.Processing,
            }),
        );

        if (createWithdrawalRequestDto.Image != null) {
            const fileExtension = createWithdrawalRequestDto.Image.originalname.split('.').pop();
            var dirFile = this.configService.getOrThrow("app.dirFile", { infer: true });
            const fileName = `${moment().format("YYYYMMDDHHmmss")}.${fileExtension}`;
            FileHelper.SaveFile(createWithdrawalRequestDto.Image, path.resolve(dirFile, "Files", "WithdrawalRequest"), fileName);

            await this.withdrawalRequestsRepository.save(
                this.withdrawalRequestsRepository.create({
                    Id: info.Id,
                    Image: fileName,
                }),
            )

            info.Image = fileName
        }


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

    async update(id: number, payload: UpdateWithdrawalRequestDto) {
        let response: ResponseData = { status: false }

        let request = await this.withdrawalRequestsRepository.findOne({ where: { Id: id } })
        if (request.Status == WithdrawalStatusEnums.Sent || request.Status == WithdrawalStatusEnums.Rejected) {
            response.message = {
                Status: "Yêu cầu đã được phê duyệt hoặc từ chối. Thao tác không thành công!!!"
            }

            return response
        }

        let wallet = await this.walletsRepository.findOne({
            where: { CollaboratorId: request.CollaboratorId, WalletTypeEnums: WalletTypeEnums.Source }
        })

        if (payload.Status == WithdrawalStatusEnums.Sent) {

            if (wallet.Available < request.WithdrawalAmount) {
                response.message = {
                    WithdrawalAmount: "Số dư ví không đủ. Thao tác không thành công!!!"
                }

                return response
            }

            await this.walletsRepository.save(
                this.walletsRepository.create({
                    Id: wallet.Id,
                    Available: wallet.Available - request.WithdrawalAmount
                })
            )

            await this.walletDetailsRepository.save(
                this.walletDetailsRepository.create({
                    WalletId: wallet.Id,
                    WalletType: WalletTypeEnums.Source,
                    Value: -request.WithdrawalAmount,
                    Note: "Rút"
                })
            )

            await this.withdrawalRequestsRepository.save(
                this.withdrawalRequestsRepository.create({
                    Id: request.Id,
                    Tax: payload.Tax,
                    ActualNumberReceived: payload.ActualNumberReceived
                }),
            );
        }

        let info = await this.withdrawalRequestsRepository.save(
            this.withdrawalRequestsRepository.create({
                Id: request.Id,
                Status: payload.Status,
                Note: payload.Note,
                NoteRejection: payload.NoteRejection
            }),
        );

        if (info && payload.Image) {
            const fileExtension = payload.Image.originalname.split('.').pop();
            var dirFile = this.configService.getOrThrow("app.dirFile", { infer: true });
            const fileName = `${moment().format("YYYYMMDDHHmmss")}.${fileExtension}`;
            FileHelper.SaveFile(payload.Image, path.resolve(dirFile, "Files", "WithdrawalRequest"), fileName);
            await this.withdrawalRequestsRepository.save(
                this.withdrawalRequestsRepository.create({
                    Id: id,
                    Image: fileName
                }),
            )
        }

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
