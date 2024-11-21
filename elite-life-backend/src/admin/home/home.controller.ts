import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, DefaultValuePipe, ParseIntPipe, Query } from '@nestjs/common';
import { HomeService } from './home.service';
import { CreateHomeDto } from './dto/create-home.dto';
import { UpdateHomeDto } from './dto/update-home.dto';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { JwtPayloadType } from 'src/utils/strategies/types/jwt-payload.type';
import { UserInfo } from 'src/utils/decorator/jwt.decorator';
import { ResponseData } from 'src/utils/schemas/common.schema';
import * as moment from 'moment'
import { StudentInterviewStatusEnums, ForeignAffairsOrderStatusEnums, FileTypeEnums, WalletTypeEnums } from 'src/utils/enums.utils';
import { FindOptionsWhere, In, MoreThanOrEqual, Raw } from 'typeorm';
import { CollaboratorsService } from '../collaborators/collaborators.service';
import path from 'path';
import { Collaborators } from 'src/database/entities/collaborator/collaborators.entity';
import { ActionParam, FunctionParam } from 'src/permissions/permission.decorator';
import { ActionPermissionEnums, FunctionPermissionEnums } from 'src/permissions/permission.enum';
import { GridFilterParse } from 'src/utils/common-helper';
import { FileHelper } from 'src/utils/file-helper';
import { pagination } from 'src/utils/pagination';
import { convertDate } from 'src/utils/transformers/string-to-date.transformer';
import { WalletsService } from '../wallets/wallets.service';
import { OrdersService } from '../orders/orders.service';

@ApiTags("Admin/Home")
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt-admin'))
@Controller('admin/home')
@FunctionParam(FunctionPermissionEnums.Home)
export class HomeController {
  constructor(
    private readonly homeService: HomeService,
    private readonly collaboratorsService: CollaboratorsService,
    private readonly walletsService: WalletsService,
    private readonly ordersService: OrdersService,

  ) { }

  @ActionParam([ActionPermissionEnums.Index])
  @ApiQuery({ name: "filters", required: false })
  @ApiQuery({ name: "fromDate", required: false })
  @ApiQuery({ name: "toDate", required: false })
  @Get("get-home")
  async getHome(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('filters', new DefaultValuePipe("")) filters: string,
    @Query('fromDate', new DefaultValuePipe("")) fromDateStr: string,
    @Query('toDate', new DefaultValuePipe("")) toDateStr: string,
    @UserInfo() user: JwtPayloadType,
  ) {
    let response: ResponseData = { status: false }
    // if (user.userName?.toLowerCase() != 'admin') {
    //   response.status = true
    //   response.data = {
    //     TotalRevenue: 0,
    //     TotalOrdersSold: 0,
    //     TotalSystemMembers: 0,
    //     TotalMembersIsSale: 0,
    //     TotalMembersIsNotSale: 0,
    //     TotalNumberOfVIPMembers: 0,
    //     Collaborators: []
    //   }
    //   return response;
    // }

    let where: FindOptionsWhere<Collaborators> | FindOptionsWhere<Collaborators>[]
    where = GridFilterParse.ParseWhere<Collaborators>(filters);

    if (where.BeginDate == undefined) {
      let fromDate = convertDate(fromDateStr);
      let toDate = convertDate(toDateStr);
      if (fromDate && toDate) {
        let toDatePlus = toDate.setDate(toDate.getDate() + 1)
        where.BeginDate = Raw((alias) => `${alias} >= :fromDate AND ${alias} <= :toDate`,
          {
            fromDate: fromDate,
            toDate: new Date(toDatePlus)
          })
      }
      else if (fromDate) {
        where.BeginDate = Raw((alias) => `${alias} >= :fromDate `,
          {
            fromDate: fromDate,
          })
      }
      else if (toDate) {
        let toDatePlus = toDate.setDate(toDate.getDate() + 1)
        where.BeginDate = Raw((alias) => `${alias} <= :toDate`,
          {
            toDate: new Date(toDatePlus)
          })
      }
    }

    var data = await this.collaboratorsService.find({
      where: where,
      select: {
        CreatedAt: true,
        Id: true,
        Name: true,
        UserName: true,
        Rank: true,
        BeginDate: true
      }
    });

    let collaboratorIds = data.map(item => item.Id)
    let walletSources = await this.walletsService.find({
      where: {
        WalletTypeEnums: WalletTypeEnums.Source,
        CollaboratorId: In(collaboratorIds)
      }
    })
    let walletCustomers = await this.walletsService.find({
      where: [
        {
          WalletTypeEnums: WalletTypeEnums.CustomerShare,
          CollaboratorId: In(collaboratorIds)
        },
        {
          WalletTypeEnums: WalletTypeEnums.CustomerGratitude,
          CollaboratorId: In(collaboratorIds)
        }
      ]
    })
    let walletSales = await this.walletsService.find({
      where: [
        {
          WalletTypeEnums: WalletTypeEnums.Sale1,
          CollaboratorId: In(collaboratorIds)
        },
        {
          WalletTypeEnums: WalletTypeEnums.Sale2,
          CollaboratorId: In(collaboratorIds)
        },
        {
          WalletTypeEnums: WalletTypeEnums.Sale3,
          CollaboratorId: In(collaboratorIds)
        }
      ]
    })

    data.forEach(item => {
      (item as any).Available = 0;
      (item as any).Customer = 0;
      (item as any).Sale = 0;

      let wallettSource = walletSources.find(s => s.CollaboratorId == item.Id)
      if (wallettSource) {
        (item as any).Available = wallettSource.Available;
      }
      let walletsCustomer = walletCustomers.filter(s => s.CollaboratorId == item.Id)
      if (walletsCustomer) {
        for (let walletCustomer of walletsCustomer) {
          (item as any).Customer += walletCustomer.Available
        }
      }
      let walletsSale = walletSales.filter(s => s.CollaboratorId == item.Id)
      if (walletsCustomer) {
        for (let walletSale of walletsSale) {
          (item as any).Sale += walletSale.Available
        }
      }
    })

    data.sort((a, b) => (b as any).Customer - (a as any).Customer);

    let paginatedData = data.slice((page - 1) * limit, page * limit);

    let ordersValue = await this.ordersService.sum({})
    let orders = await this.ordersService.countOrders()
    let collabsIsSaleTrue = await this.collaboratorsService.countCollabIsSaleTrue()
    let collabRanks = await this.collaboratorsService.countCollabRanksVe()
    let collabsIsSaleFalse = await this.collaboratorsService.countCollabIsSaleFalse()

    response.status = true
    response.data = {
      TotalRevenue: ordersValue,
      TotalOrdersSold: orders,
      TotalSystemMembers: collabsIsSaleTrue + collabsIsSaleFalse,
      TotalMembersIsSale: collabsIsSaleTrue,
      TotalMembersIsNotSale: collabsIsSaleFalse,
      TotalNumberOfVIPMembers: collabRanks,
      Collaborators: paginatedData
    }
    return response
  }

}


