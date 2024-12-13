import { Controller, Get, Post, Body, UseGuards, UseInterceptors, UploadedFile, Query, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AllConfigType } from 'src/config/config.type';
import { CollaboratorsService } from '../collaborators/collaborators.service';
import { ConfigService } from '@nestjs/config';
import { ClassToClassNotValidate, GridFilterParse } from 'src/utils/common-helper';
import { Collaborators } from 'src/database/entities/collaborator/collaborators.entity';
import { convertDate } from 'src/utils/transformers/string-to-date.transformer';
import { In, Raw } from 'typeorm';
import { UserInfo } from 'src/utils/decorator/jwt.decorator';
import { JwtPayloadType } from 'src/utils/strategies/types/jwt-payload.type';
import { pagination } from 'src/utils/pagination';
import { ActionParam } from 'src/permissions/permission.decorator';
import { ComboData, ResponseData } from 'src/utils/schemas/common.schema';
import { UploadFilesService } from '../upload-files/upload-files.service';
import { BanksService } from '../banks/banks.service';
import { FileTypeEnums } from 'src/utils/enums.utils';
import { UpdateCollaboratorDto } from './dto/update-collaborator.dto';
import * as path from 'path';
import { FileHelper } from 'src/utils/file-helper';
import { FileInterceptor } from '@nestjs/platform-express';
import { userFileFilter } from 'src/utils/multer-helper';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { ActionPermissionEnums } from 'src/permissions/permission.enum';
import { RolePermissionsService } from '../role-permissions/role-permissions.service';
import { PermissionsService } from '../permissions/permissions.service';
import { InternalTransferDto, PersonalMoneyTransferDto } from './dto/create-collaborator-contractNumber.dto';
import { BinaryCollaboratorDto } from './dto/get-system-collaborator.dto';
import { OrdersService } from '../orders/orders.service';
import { UserActivitiesService } from '../user-activities/user-activities.service';

@ApiTags("Sale/Collaborator")
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt-sale'))
@Controller('sale/collaborator')
export class CollaboratorsController {
    isPermissionValidate: boolean = false;

    constructor(
        private readonly collaboratorsService: CollaboratorsService,
        private configService: ConfigService<AllConfigType>,
        private readonly bankService: BanksService,
        private readonly uploadFilesService: UploadFilesService,
        private readonly rolePermissionsService: RolePermissionsService,
        private readonly permissionsService: PermissionsService,
        private readonly ordersService: OrdersService,
        private readonly userActivitiesService: UserActivitiesService,
    ) {
        this.isPermissionValidate = this.configService.get('app.isPermissionValidate', { infer: true })
    }

    @ApiQuery({ name: "filters", required: false })
    @ApiQuery({ name: "fromDate", required: false })
    @ApiQuery({ name: "toDate", required: false })
    @Get("get-refferals")
    async getRefferals(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
        @Query('filters', new DefaultValuePipe("")) filters: string,
        @Query('fromDate', new DefaultValuePipe("")) fromDateStr: string,
        @Query('toDate', new DefaultValuePipe("")) toDateStr: string,
        @UserInfo() user: JwtPayloadType
    ) {
        let where = GridFilterParse.ParseWhere<Collaborators>(filters);
        if (where.BeginDate == undefined) {
            let fromDate = convertDate(fromDateStr);
            let toDate = convertDate(toDateStr);
            if (fromDate && toDate)
                where.BeginDate = Raw((alias) => `${alias} >= :fromDate AND ${alias} <= :toDate`, { fromDate: fromDate, toDate: toDate })
            else if (fromDate)
                where.BeginDate = Raw((alias) => `${alias} >= :fromDate `, { fromDate: fromDate, })
            else if (toDate)
                where.BeginDate = Raw((alias) => `${alias} <= :toDate`, { toDate: toDate })
        }
        // where.ParentId = user.collaboratorInfo?.Id ?? 0

        var [data, total] = await this.collaboratorsService.referalList({
            where: where,
            select: {
                CreatedAt: true,
                Id: true,
                UserName: true,
                Name: true,
                Rank: true,
                ParentId: true,
                Email: true,
                Mobile: true,
                BeginDate: true
            }
        },
            { page, limit },
            user);

        return pagination(data, total);
    }

    @Get("get-binary-tree")
    async getBinaryTree(@UserInfo() user: JwtPayloadType) {
        let response: ResponseData = { status: false };

        const datas: BinaryCollaboratorDto[] = await this.collaboratorsService.binarTree(user);
        let collaboratorIds = datas.map(s => s.Id);
        let ordersValue = await this.ordersService.sum({ CollaboratorId: In(collaboratorIds) });

        let dataRaw: BinaryCollaboratorDto[] = []
        let totals = {
            total: datas.length,
            F1: 0,
            F2: 0,
            F3: 0,
            TotalRevenue: ordersValue
        };

        let nodeParents = datas.filter(s => s.ParentId == null);
        if (nodeParents.length > 0) {
            let nodeParent = nodeParents[0];
            let levelCur = 1;
            let parentIdFake = 1_000_000_000_000;
            dataRaw.push(nodeParent);

            const processGroup = (node: BinaryCollaboratorDto, level: number) => {
                // if (level > 3) return;

                let childrens = datas.filter(s => s.ParentId == node.Id);
                let nodeParentFake: BinaryCollaboratorDto;
                if (childrens.length > 0) {
                    nodeParentFake = {
                        Id: parentIdFake,
                        Name: `DL${level - 1} (${childrens.length})`,
                        ParentId: node.Id,
                        IsGroup: true
                    } as BinaryCollaboratorDto
                    parentIdFake++;
                    dataRaw.push(nodeParentFake)

                    if (level === 1) {
                        totals.F1 += childrens.length;
                    } else if (level === 2) {
                        totals.F2 += childrens.length;
                    } else if (level === 3) {
                        totals.F3 += childrens.length;
                    }

                    for (const children of childrens) {
                        dataRaw.push({
                            ...children,
                            ParentId: nodeParentFake.Id
                        })
                        processGroup({
                            ...children,
                            ParentId: nodeParentFake.Id
                        }, level + 1)
                    }
                }
            };

            processGroup(nodeParent, levelCur);
        }

        response.status = true;
        response.data = {
            totals,
            dataRaw,
        };
        return response;
    }

    @Get("update")
    async getUpdate(@UserInfo() user: JwtPayloadType,
    ) {
        let response: ResponseData = { status: false }
        let collaborator = await this.collaboratorsService.findOne({ where: { Id: user.collaboratorInfo.Id } });
        let bankOptions = await this.bankService.find({ select: { Id: true, Name: true } })
        let collaborators = await this.collaboratorsService.find({
            where: { IsSale: true },
            select: {
                Id: true,
                Name: true,
                UserName: true
            }
        })
        let avatar = await this.uploadFilesService.findOne({
            where: { FileId: 20, ForId: collaborator.Id, Type: FileTypeEnums.Sale },
            order: {
                CreatedAt: "DESC"
            }
        })
        let info = ClassToClassNotValidate(collaborator, new UpdateCollaboratorDto());
        if (avatar) {
            let dirFile = this.configService.getOrThrow("app.dirFile", { infer: true });
            if (FileHelper.Exist(path.resolve(dirFile, "Files", "Collaborator", avatar.FileName)))
                info.Image = `/Files/Collaborator/${avatar.FileName}`
        }
        response.status = true;
        response.data = {
            ParentIdOptions: collaborators.map(s => new ComboData({
                Text: `${s.UserName} - ${s.Name}`,
                Value: s.Id,
            })),
            BankIdOptions: bankOptions.map(s => new ComboData({
                Text: s.Name,
                Value: s.Id,
            })),
            Info: info
        }
        return response
    }

    @ActionParam([ActionPermissionEnums.Update])
    @Post('update')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('File', {
        fileFilter: (req, file, callback) =>
            userFileFilter(req, file, callback, ["png", "jpg", "jpeg", "pdf"])
    }))
    async update(
        @Body() updateCollaboratorDto: UpdateSaleDto,
        @UserInfo() user: JwtPayloadType,
        @UploadedFile() file: Express.Multer.File
    ) {
        let response: ResponseData = { status: false }

        let collaborator = await this.collaboratorsService.findOne({ where: { Id: user.collaboratorInfo.Id } })

        // let collaboratorsMoblie = await this.collaboratorsService.exist({ where: { Mobile: updateCollaboratorDto.Mobile, Id: Not(In([collaborator.Id])) } });
        // if (collaboratorsMoblie) {
        //     response.message = {
        //         Mobile: "Số điện thoại đã tồn tại"
        //     }
        //     return response
        // }

        // let collaboratorsBankNumber = await this.collaboratorsService.exist({ where: { BankNumber: updateCollaboratorDto.BankNumber, Id: Not(In([collaborator.Id])) } });
        // if (updateCollaboratorDto.BankNumber) {
        //     if (collaboratorsBankNumber) {
        //         response.message = {
        //             BankNumber: "Tài khoản ngân hàng đã tồn tại"
        //         }
        //         return response
        //     }
        // }

        response = await this.collaboratorsService.update(collaborator.Id, updateCollaboratorDto, user);

        let newCollaborator = await this.collaboratorsService.findOne({ where: { Id: user.collaboratorInfo.Id } })
        let difference = await this.userActivitiesService.findDifference(collaborator, newCollaborator)

        await this.userActivitiesService.create({
            NewRequestData: difference.newData,
            OldRequestData: difference.oldData,
            UserId: user.id,
            Action: user.Action[0],
            Function: user.Function,
            Description: `Chỉnh sửa NVKD: ${newCollaborator.UserName} - ${collaborator.Name}`,
            RecordId: newCollaborator.Id
        }, user)

        return response

    }

    @ActionParam([ActionPermissionEnums.Transfer])
    @Post('personalMoneyTransfer')
    async personalMoneyTransfer(
        @Body() personalMoneyTransferDto: PersonalMoneyTransferDto,
        @UserInfo() user: JwtPayloadType,
    ) {
        return await this.collaboratorsService.personalMoneyTransfer(personalMoneyTransferDto, user)
    }

    @Get("create-internalTransfer")
    async getInternalTransfer() {
        let response: ResponseData = { status: false }
        let collaborators = await this.collaboratorsService.find({
            select: {
                Id: true,
                Name: true,
                UserName: true
            }
        })
        response.status = true;
        response.data = {
            ParentIdOptions: collaborators.map(s => new ComboData({
                Text: s.Name,
                Extra: s.Id,
                Value: s.UserName
            })),
        }

        return response
    }

    @ActionParam([ActionPermissionEnums.Transfer])
    @Post('internalTransfer')
    async internalTransfer(
        @Body() internalTransferDto: InternalTransferDto,
        @UserInfo() user: JwtPayloadType,
    ) {
        return await this.collaboratorsService.internalTransfer(internalTransferDto, user)
    }

    @Post('updatePersonalMoneyTransfer')
    async updatePersonalMoneyTransfer(
      @Body() personalMoneyTransferDto: PersonalMoneyTransferDto,
      @UserInfo() user: JwtPayloadType,
    ) {
      return await this.collaboratorsService.personalMoneyTransfer(personalMoneyTransferDto, user)
    }


    @Post('validatePersonalMoneyTransfer')
    async validatePersonalMoneyTransfer(
      @Body() personalMoneyTransferDto: PersonalMoneyTransferDto,
      @UserInfo() user: JwtPayloadType,
    ) {
      return await this.collaboratorsService.personalMoneyTransfer(personalMoneyTransferDto, user)
    }

}
