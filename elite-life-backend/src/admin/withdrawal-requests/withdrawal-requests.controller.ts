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
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { AllConfigType } from 'src/config/config.type';
import { FileHelper } from 'src/utils/file-helper';
import { ApproveWithdrawalRequestDto } from './dto/approve-withdrawal-request.dto';
import { RejectWithdrawalRequestDto } from './dto/reject-withdrawl-request.dto';
import { WithdrawalStatusEnums } from 'src/utils/enums.utils';

@ApiTags("Admin/Withdrawal-requests")
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt-admin'))
@Controller('admin/withdrawal-requests')
@FunctionParam(FunctionPermissionEnums.WithdrawalRequests)
export class WithdrawalRequestsController {
  constructor(
    private readonly withdrawalRequestsService: WithdrawalRequestsService,
    private readonly userActivitiesService: UserActivitiesService,
    private readonly bankService: BanksService,
    private configService: ConfigService<AllConfigType>
  ) { }

  @ActionParam([ActionPermissionEnums.Index])
  @Get("get")
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('filters', new DefaultValuePipe("")) filters: string,) {
    if (limit > 50) {
      limit = 50;
    }
    let where = GridFilterParse.ParseWhere<WithdrawalRequests>(filters);

    let [data, total] = await this.withdrawalRequestsService.findManyWithPagination({
      where: where,
      relations: {
        Collaborator: true,
        Bank: true
      },
      select: {
        Collaborator: {
          Id: true,
          Name: true,
          Email: true,
          UserName: true
        },
        Bank: {
          Id: true,
          Name: true
        }
      }
    }, { page, limit })

    data.forEach(item => {
      if (item.Image) {
        let dirFile = this.configService.getOrThrow("app.dirFile", { infer: true });
        if (FileHelper.Exist(path.resolve(dirFile, "Files", "WithdrawalRequest", item.Image)))
          item.Image = `/Files/WithdrawalRequest/${item.Image}`
        else {
          item.Image = null
        }
      }
    })

    return pagination(data, total);
  }

  @ActionParam([ActionPermissionEnums.Index])
  @Get("update/:id")
  async getUpdate(@Param('id') id: string) {
    let response: ResponseData = { status: false }

    let data = await this.withdrawalRequestsService.findOne({
      where: { Id: +id },
      relations: {
        Collaborator: true,
        Bank: true
      },
      select: {
        Collaborator: {
          Id: true,
          Name: true,
          UserName: true,
          Email: true
        },
        Bank: {
          Id: true,
          Name: true
        }
      }
    });

    response.status = true;
    response.data = data
    return response;
  }

  @ActionParam([ActionPermissionEnums.Approve])
  @Post('approve/:id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('Image', {
    fileFilter: (req, file, callback) =>
      userFileFilter(req, file, callback, ["png", "jpg", "jpeg"])
  }))
  async approve(@Param('id') id: string,
    @UserInfo() user: JwtPayloadType,
    @UploadedFile() file: Express.Multer.File,
    @Body() approveWithdrawalRequestDto: ApproveWithdrawalRequestDto) {
    approveWithdrawalRequestDto.Image = file
    approveWithdrawalRequestDto.Status = WithdrawalStatusEnums.Sent

    let response: ResponseData = { status: false }

    let oldProduct = await this.withdrawalRequestsService.findOne({ where: { Id: +id } })
    response = await this.withdrawalRequestsService.update(+id, approveWithdrawalRequestDto);

    let newProduct = await this.withdrawalRequestsService.findOne({ relations: { Collaborator: true }, where: { Id: +id } })
    let difference = await this.userActivitiesService.findDifference(oldProduct, newProduct)

    await this.userActivitiesService.create({
      NewRequestData: difference.newData,
      OldRequestData: difference.oldData,
      UserId: user.id,
      Action: user.Action[0],
      Function: user.Function,
      Description: `Duyệt yêu cầu rút tiền ${newProduct.Code} của ${newProduct.Collaborator?.UserName} - ${newProduct.Collaborator?.Name}`,
      RecordId: newProduct.Id
    }, user)

    return response
  }

  @ActionParam([ActionPermissionEnums.Reject])
  @Post('reject/:id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('Image', {
    fileFilter: (req, file, callback) =>
      userFileFilter(req, file, callback, ["png", "jpg", "jpeg"])
  }))
  async reject(@Param('id') id: string,
    @UserInfo() user: JwtPayloadType,
    @Body() rejectWithdrawalRequestDto: RejectWithdrawalRequestDto) {
    rejectWithdrawalRequestDto.Status = WithdrawalStatusEnums.Rejected

    let response: ResponseData = { status: false }

    let oldProduct = await this.withdrawalRequestsService.findOne({ where: { Id: +id } })
    response = await this.withdrawalRequestsService.update(+id, rejectWithdrawalRequestDto);

    let newProduct = await this.withdrawalRequestsService.findOne({ relations: { Collaborator: true }, where: { Id: +id } })
    let difference = await this.userActivitiesService.findDifference(oldProduct, newProduct)

    await this.userActivitiesService.create({
      NewRequestData: difference.newData,
      OldRequestData: difference.oldData,
      UserId: user.id,
      Action: user.Action[0],
      Function: user.Function,
      Description: `Từ chối yêu cầu rút tiền ${newProduct.Code} của ${newProduct.Collaborator?.UserName} - ${newProduct.Collaborator?.Name}`,
      RecordId: newProduct.Id
    }, user)

    return response
  }
}
