import { Controller, Get, Post, Body, Patch, Param, Delete, DefaultValuePipe, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { UserSaleService } from './user-sale.service';
import { CreateUserSaleDto } from './dto/create-user-sale.dto';
import { UpdateUserSaleDto } from './dto/update-user-sale.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Users } from 'src/database/entities/user/users.entity';
import { FunctionParam, ActionParam } from 'src/permissions/permission.decorator';
import { FunctionPermissionEnums, ActionPermissionEnums } from 'src/permissions/permission.enum';
import { GridFilterParse, StringToMd5 } from 'src/utils/common-helper';
import { UserInfo } from 'src/utils/decorator/jwt.decorator';
import { ApplicationTypeEnums } from 'src/utils/enums.utils';
import { pagination } from 'src/utils/pagination';
import { ResponseData, ComboData } from 'src/utils/schemas/common.schema';
import { JwtPayloadType } from 'src/utils/strategies/types/jwt-payload.type';
import { Not, In } from 'typeorm';
import { RolesService } from '../roles/roles.service';
import * as  crypto from 'crypto';


@ApiTags("Admin/User-Sale")
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt-admin'))
@Controller('admin/user-sale')
@FunctionParam(FunctionPermissionEnums.UserSale)
@Controller('user-sale')
export class UserSaleController {
  constructor(
    private readonly userSaleService: UserSaleService,
    private readonly rolesService: RolesService
  ) { }

  @ActionParam([ActionPermissionEnums.Index])
  @Get("get")
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('filters', new DefaultValuePipe("")) filters: string) {

    let where = GridFilterParse.ParseWhere<Users>(filters);
    where.ApplicationType = ApplicationTypeEnums.Sale
    let [data, total] = await this.userSaleService.findManyWithPagination({
      where: where,
      relations: {
        Role: true
      },
      select: {
        ApplicationType: false,
        Role: {
          Id: true,
          Name: true
        }
      }
    }, { page, limit });

    return pagination(data, total);
  }

  @ActionParam([ActionPermissionEnums.Index])
  @Get('get/:id')
  findOne(@Param('id') id: string) {
    return this.userSaleService.findOne({ Id: +id });
  }

  @ActionParam([ActionPermissionEnums.Add])
  @Get("create")
  async getCreate() {
    let response: ResponseData = { status: false }
    response.status = true;
    let roles = await this.rolesService.find({
      where: { ApplicationType: ApplicationTypeEnums.Sale },
      select: { Id: true, Name: true }
    });
    response.data = {
      Role: roles
        .map(key => {
          return new ComboData({ Text: key.Name, Value: key.Id })
        })
    }
    return response
  }

  @ActionParam([ActionPermissionEnums.Update])
  @Get("update/:id")
  async getUpdate(@Param('id') id: string) {
    let response: ResponseData = { status: false }
    response.status = true;
    let roles = await this.rolesService.find({
      where: { ApplicationType: ApplicationTypeEnums.Sale },
      select: { Id: true, Name: true }
    });
    let info = await this.userSaleService.findOne({ Id: +id, ApplicationType: ApplicationTypeEnums.Sale });
    response.data = {
      Role: roles
        .map(key => {
          return new ComboData({ Text: key.Name, Value: key.Id })
        }),
      Info: info
    }
    return response
  }

  @ActionParam([ActionPermissionEnums.Update])
  @Post('update/:id')
  async update(@Param('id') id: string, @Body() updateUserSaleDto: UpdateUserSaleDto) {
    let response: ResponseData = { status: false }

    let exist = await this.userSaleService.exist({
      where: {
        ApplicationType: ApplicationTypeEnums.Sale,
        Id: +id
      }
    });

    if (!exist) {
      response.message = {
        UserName: "Tài khoản không tồn tại"
      }
      return response
    }

    let role = await this.rolesService.findOne({ where: { Id: updateUserSaleDto.RoleId, ApplicationType: ApplicationTypeEnums.Sale } });
    if (role == undefined) {
      response.message = {
        UserName: "Nhóm quyền không tồn tại"
      }
      return response
    }
    delete updateUserSaleDto.ApplicationType;
    return this.userSaleService.update(+id, updateUserSaleDto);
  }

  // @ActionParam([ActionPermissionEnums.Lock])
  // @Post('lock/:id')
  // async lock(@Param('id') id: string) {
  //   let response: ResponseData = { status: false }
  //   let exist = await this.userSaleService.exist({
  //     where: {
  //       ApplicationType: ApplicationTypeEnums.Sale,
  //       Id: +id
  //     }
  //   });

  //   if (!exist) {
  //     response.message = {
  //       UserName: "Tài khoản không tồn tại"
  //     }
  //     return response
  //   }
  //   // todo: process kill session user
  //   return this.userSaleService.lockOrUnlock(+id, { Id: +id, IsLock: true });
  // }

  // @ActionParam([ActionPermissionEnums.Unlock])
  // @Post('unlock/:id')
  // async unlock(@Param('id') id: string) {
  //   let response: ResponseData = { status: false }
  //   let exist = await this.userSaleService.exist({
  //     where: {
  //       ApplicationType: ApplicationTypeEnums.Sale,
  //       Id: +id
  //     }
  //   });

  //   if (!exist) {
  //     response.message = {
  //       UserName: "Tài khoản không tồn tại"
  //     }
  //     return response
  //   }
  //   return this.userSaleService.lockOrUnlock(+id, { Id: +id, IsLock: false });
  // }

  @ActionParam([ActionPermissionEnums.Delete])
  @Post('delete/:id')
  async remove(@Param('id') id: string) {
    let response: ResponseData = { status: false }
    let exist = await this.userSaleService.exist({
      where: {
        ApplicationType: ApplicationTypeEnums.Sale,
        Id: +id
      }
    });

    if (!exist) {
      response.message = {
        UserName: "Tài khoản không tồn tại"
      }
      return response
    }
    return this.userSaleService.softRemove(+id);
  }

}
