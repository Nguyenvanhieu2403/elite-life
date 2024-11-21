import { Controller, Get, Post, Body, Patch, Param, Delete, DefaultValuePipe, ParseIntPipe, Query, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { WithdrawalRequestsService } from './withdrawal-requests.service';
import { CreateWithdrawalRequestDto } from './dto/create-withdrawal-request.dto';
import { UpdateWithdrawalRequestDto } from './dto/update-withdrawal-request.dto';
import { WithdrawalRequests } from 'src/database/entities/collaborator/withdrawalRequests.entity';
import { UserActivitiesService } from '../user-activities/user-activities.service';
import { ActionParam, FunctionParam } from 'src/permissions/permission.decorator';
import { ActionPermissionEnums, FunctionPermissionEnums } from 'src/permissions/permission.enum';
import { GridFilterParse } from 'src/utils/common-helper';
import { UserInfo } from 'src/utils/decorator/jwt.decorator';
import { pagination } from 'src/utils/pagination';
import { ComboData, ResponseData } from 'src/utils/schemas/common.schema';
import { JwtPayloadType } from 'src/utils/strategies/types/jwt-payload.type';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { userFileFilter } from 'src/utils/multer-helper';
import { BanksService } from '../banks/banks.service';
import { CollaboratorsService } from '../collaborators/collaborators.service';
import { Not, In } from 'typeorm';
import { WalletsService } from '../wallets/wallets.service';
import { WalletTypeEnums } from 'src/utils/enums.utils';

@ApiTags("Sale/Withdrawal-requests")
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt-sale'))
@Controller('sale/withdrawal-requests')
// @FunctionParam(FunctionPermissionEnums.Product)
export class WithdrawalRequestsController {
  constructor(
    private readonly withdrawalRequestsService: WithdrawalRequestsService,
    private readonly userActivitiesService: UserActivitiesService,
    private readonly bankService: BanksService,
    private readonly collaboratorsService: CollaboratorsService,
    private readonly walletsService: WalletsService,

  ) { }

  @ActionParam([ActionPermissionEnums.Index])
  @Get('create')
  async getCreate(
    @UserInfo() user: JwtPayloadType,
  ) {
    let response: ResponseData = { status: false }

    let bankOptions = await this.bankService.find({ select: { Id: true, Name: true } })
    let wallet = await this.walletsService.findOne({
      where: {
        CollaboratorId: user.collaboratorInfo.Id,
        WalletTypeEnums: WalletTypeEnums.Source
      }
    })

    response.status = true;
    response.data = {
      Availiable: wallet?.Available ?? 0,
      BankIdOptions: bankOptions.map(s => new ComboData({
        Text: s.Name,
        Value: s.Id
      }))
    }
    return response
  }


  @ActionParam([ActionPermissionEnums.Add])
  @Post("create")
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('Image', {
    fileFilter: (req, file, callback) =>
      userFileFilter(req, file, callback, ["png", "jpg", "jpeg"])
  }))
  async create(
    @Body() createWithdrawalRequestDto: CreateWithdrawalRequestDto,
    @UserInfo() user: JwtPayloadType,
  ) {
    let response: ResponseData = { status: false }

    response = await this.withdrawalRequestsService.create(createWithdrawalRequestDto, user);

    if (response.status == false) {
      response.message = response.message
      return response
    }

    await this.userActivitiesService.create({
      NewRequestData: response.data,
      OldRequestData: null,
      UserId: user.id,
      Action: user.Action[0],
      Function: user.Function,
      Description: `Yêu cầu rút tiền ${response.data.Code}`,
      RecordId: response.data.Id
    }, user)

    return response
  }


}
