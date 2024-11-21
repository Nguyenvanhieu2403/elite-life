import { Controller, Get, Post, Body, Param, UseGuards, UseInterceptors, UploadedFile, UploadedFiles, Query, DefaultValuePipe, ParseIntPipe, UnauthorizedException } from '@nestjs/common';
import { JwtPayloadType } from 'src/utils/strategies/types/jwt-payload.type';
import { UserInfo } from 'src/utils/decorator/jwt.decorator';
import { FileTypeEnums, WalletTypeEnums } from 'src/utils/enums.utils';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ComboData, ResponseData } from 'src/utils/schemas/common.schema';
import { ClassToClass, ClassToClassNotValidate, GridFilterParse } from 'src/utils/common-helper';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/config.type';
import { In, Not, Raw } from 'typeorm';
import * as path from 'path';
import * as moment from 'moment';
import { FileHelper } from 'src/utils/file-helper';
import { pagination } from 'src/utils/pagination';
import { UsersService } from '../users/users.service';
import { CollaboratorsService } from '../collaborators/collaborators.service';
import { UploadFilesService } from '../upload-files/upload-files.service';
import { UpdateCollaboratorDto } from '../collaborators/dto/update-collaborator.dto';
import { Collaborators } from 'src/database/entities/collaborator/collaborators.entity';
import { convertDate } from 'src/utils/transformers/string-to-date.transformer';
import { WalletDetailsService } from '../wallet-details/wallet-details.service';
import { WalletDetails } from 'src/database/entities/collaborator/walletDetail.entity';
import { WalletsService } from '../wallets/wallets.service';
import { OrdersService } from '../orders/orders.service';

@ApiTags("Sale/Home")
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt-sale'))
@Controller('sale/home')
export class HomeController {
  constructor(
    private readonly collaboratorsService: CollaboratorsService,
    private readonly uploadFilesService: UploadFilesService,
    private readonly walletDetailsService: WalletDetailsService,
    private configService: ConfigService<AllConfigType>,
    private readonly walletsService: WalletsService,
    private readonly ordersService: OrdersService,
  ) { }

  @Post("info")
  async getInfo(@UserInfo() user: JwtPayloadType) {
    let response: ResponseData = { status: false }
    if (user?.collaboratorInfo == undefined) throw new UnauthorizedException()

    let collaInfo = await this.collaboratorsService.findOne({
      where: { Id: user.collaboratorInfo.Id },
      relations: {
        Parent: true,
        Bank: true,
      }
    });

    let image = await this.uploadFilesService.findOne({
      where: {
        ForId: In([collaInfo.Id]),
        Type: FileTypeEnums.Sale,
        FileId: 20
      },
      order: { CreatedAt: "desc" }
    });

    (collaInfo as any).Image = null;
    if (image) {
      let dirFile = this.configService.getOrThrow("app.dirFile", { infer: true });
      if (FileHelper.Exist(path.resolve(dirFile, "Files", "Collaborator", image.FileName)))
        (collaInfo as any).Image = `/Files/Collaborator/${image.FileName}`
    }

    let source = await this.walletsService.findOne({
      where: {
        CollaboratorId: user.collaboratorInfo.Id,
        WalletTypeEnums: WalletTypeEnums.Source
      }
    })

    let customerShare = await this.walletsService.findOne({
      where: {
        CollaboratorId: user.collaboratorInfo.Id,
        WalletTypeEnums: WalletTypeEnums.CustomerShare
      }
    })

    let customerGratitude = await this.walletsService.findOne({
      where: {
        CollaboratorId: user.collaboratorInfo.Id,
        WalletTypeEnums: WalletTypeEnums.CustomerGratitude
      }
    })

    let sale1 = await this.walletsService.findOne({
      where: {
        CollaboratorId: user.collaboratorInfo.Id,
        WalletTypeEnums: WalletTypeEnums.Sale1
      }
    })

    let sale2 = await this.walletsService.findOne({
      where: {
        CollaboratorId: user.collaboratorInfo.Id,
        WalletTypeEnums: WalletTypeEnums.Sale2
      }
    })

    let sale3 = await this.walletsService.findOne({
      where: {
        CollaboratorId: user.collaboratorInfo.Id,
        WalletTypeEnums: WalletTypeEnums.Sale3
      }
    })

    let order = await this.ordersService.findOne({
      where: { CollaboratorId: user.collaboratorInfo.Id },
      select: {
        Id: true,
        CommissionSaleMax: true,
        CommissionCustomerMax: true,
        CommissionCustomer: true,
        CommissionSale: true
      },
      order: {
        CreatedAt: 'DESC'
      }
    })

    response.status = true;
    response.data = {
      Info: collaInfo,
      Source: source?.Available ?? 0,
      Customer: (customerShare ? customerShare.Available : 0) + (customerGratitude ? customerGratitude.Available : 0),
      Sale: (sale1 ? sale1.Available : 0) + (sale2 ? sale2.Available : 0) + (sale3 ? sale3.Available : 0),
      CustomerShare: customerShare ? customerShare.Available : 0,
      CustomerGratitude: customerGratitude ? customerGratitude.Available : 0,
      Sale1: sale1 ? sale1.Available : 0,
      Sale2: sale2 ? sale2.Available : 0,
      Sale3: sale3 ? sale3.Available : 0,
      Order: order
    };
    return response
  }

  @Get('payment-list')
  async getPaymentList(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @UserInfo() user: JwtPayloadType
  ) {

    let [data, total] = await this.walletDetailsService.findManyWithPagination({
      where: {
        Wallet: {
          CollaboratorId: user.collaboratorInfo.Id
        }
      },
      select: {
        CreatedAt: true,
        Id: true,
        Value: true,
        Note: true,
        WalletType: true
      },
      order: {
        Id: 'DESC'
      }
    },
      { page, limit },
    )

    return pagination(data, total);
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
    where.ParentId = user.collaboratorInfo?.Id ?? 0

    var [data, total] = await this.collaboratorsService.referalList({
      where: where,
      select: {
        Id: true,
        UserName: true,
        Name: true,
        Email: true,
        Mobile: true,
        BeginDate: true,
        Rank: true
      }
    },
      { page, limit },
      user);

    return pagination(data, total);
  }

}
