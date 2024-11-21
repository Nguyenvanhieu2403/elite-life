import { Controller, Get, Post, Body, Patch, Param, Delete, DefaultValuePipe, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { pagination } from 'src/utils/pagination';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ComboData, ResponseData } from 'src/utils/schemas/common.schema';
import { ActionPermissionEnums, FunctionPermissionEnums, SaleStudentCommActionPermissionEnums, SaleStudentCommFunctionPermissionEnums } from '../../permissions/permission.enum';
import { ApplicationTypeEnums } from 'src/utils/enums.utils';
import { GridFilterParse } from 'src/utils/common-helper';
import { Permissions } from 'src/database/entities/user/permissions.entity';
import { ActionParam, FunctionParam } from 'src/permissions/permission.decorator';
import { UserActivitiesService } from '../user-activities/user-activities.service';
import { UserInfo } from 'src/utils/decorator/jwt.decorator';
import { JwtPayloadType } from 'src/utils/strategies/types/jwt-payload.type';
import { Not } from 'typeorm';

@ApiTags("Admin/Permissions")
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt-admin'))
@Controller('admin/permissions')
@FunctionParam(FunctionPermissionEnums.Permission)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService,
    private readonly userActivitiesService: UserActivitiesService,
  ) { }

  @ActionParam([ActionPermissionEnums.Index])
  @Get('get/:type')
  async findAll(
    @Param('type') type: ApplicationTypeEnums,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('filters', new DefaultValuePipe("")) filters: string,) {

    let where = GridFilterParse.ParseWhere<Permissions>(filters);
    where.ApplicationType = type
    let [data, total] = await this.permissionsService.findManyWithPagination(
      {
        where: where,
        order: {
          Controller: "asc",
          Name: 'asc'
        }
      },
      {
        page, limit
      })
    return pagination(data, total);
  }

  @ActionParam([ActionPermissionEnums.Index])
  @Get('get/:type/:id')
  findOne(
    @Param('type') type: ApplicationTypeEnums,
    @Param('id') id: string) {
    return this.permissionsService.findOne({ Id: +id, ApplicationType: ApplicationTypeEnums.User });
  }

  @ActionParam([ActionPermissionEnums.Add])
  @Get('create/:type')
  getCreate(
    @Param('type') type: ApplicationTypeEnums,) {
    let response: ResponseData = { status: false }
    switch (type) {
      case ApplicationTypeEnums.User:
        response.data = {
          Actions: Object.keys(ActionPermissionEnums).map(s => new ComboData({
            Text: s,
            Value: ActionPermissionEnums[s]
          })),
          Functions: Object.keys(FunctionPermissionEnums).map(s => new ComboData({
            Text: s,
            Value: FunctionPermissionEnums[s]
          }))
        }
        break;

      case ApplicationTypeEnums.Sale:
        response.data = {
          Actions: Object.keys(SaleStudentCommActionPermissionEnums).map(s => new ComboData({
            Text: s,
            Value: SaleStudentCommActionPermissionEnums[s]
          })),
          Functions: Object.keys(SaleStudentCommFunctionPermissionEnums).map(s => new ComboData({
            Text: s,
            Value: SaleStudentCommFunctionPermissionEnums[s]
          }))
        }
        break;

      default:
        break;
    }
    response.status = true;
    return response
  }

  @ActionParam([ActionPermissionEnums.Add])
  @Post('create/:type')
  async create(@Param('type') type: ApplicationTypeEnums,
    @Body() createPermissionDto: CreatePermissionDto,
    @UserInfo() user: JwtPayloadType) {
    let response: ResponseData = { status: false }

    createPermissionDto.ApplicationType = type;
    response = await this.permissionsService.create(createPermissionDto);

    await this.userActivitiesService.create({
      NewRequestData: response.data,
      OldRequestData: null,
      UserId: user.id,
      Action: user.Action[0],
      Function: user.Function,
      Description: `Thêm quyền ${response.data.Name}`,
      RecordId: response.data.Id
    }, user)

    return response
  }

  @ActionParam([ActionPermissionEnums.Update])
  @Get('update/:type/:id')
  async getUpdate(@Param('type') type: ApplicationTypeEnums,
    @Param('id') id: string) {
    let response: ResponseData = { status: false }
    let info = await this.permissionsService.findOne({ Id: +id, ApplicationType: type });
    switch (type) {
      case ApplicationTypeEnums.User:
        response.data = {
          Actions: Object.keys(ActionPermissionEnums).map(s => new ComboData({
            Text: s,
            Value: ActionPermissionEnums[s]
          })),
          Functions: Object.keys(FunctionPermissionEnums).map(s => new ComboData({
            Text: s,
            Value: FunctionPermissionEnums[s]
          })),
          Info: info
        }
        break;
      case ApplicationTypeEnums.Sale:
        response.data = {
          Actions: Object.keys(SaleStudentCommActionPermissionEnums).map(s => new ComboData({
            Text: s,
            Value: SaleStudentCommActionPermissionEnums[s]
          })),
          Functions: Object.keys(SaleStudentCommFunctionPermissionEnums).map(s => new ComboData({
            Text: s,
            Value: SaleStudentCommFunctionPermissionEnums[s]
          })),
          Info: info
        }
        break;
      default:
        break;
    }
    response.status = true;
    return response
  }

  @ActionParam([ActionPermissionEnums.Update])
  @Post('update/:type/:id')
  async update(@Param('type') type: ApplicationTypeEnums,
    @Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionDto,
    @UserInfo() user: JwtPayloadType) {
    let response: ResponseData = { status: false }
    let oldInfo = await this.permissionsService.findOne({ Id: +id, ApplicationType: type });
    if (oldInfo == undefined) {
      response.message = "Dữ liệu không tồn tại";
      return response;
    }

    response = await this.permissionsService.update(+id, updatePermissionDto);

    let newInfo = await this.permissionsService.findOne({ Id: +id, ApplicationType: type });
    let difference = await this.userActivitiesService.findDifference(oldInfo, newInfo)

    await this.userActivitiesService.create({
      NewRequestData: difference.newData,
      OldRequestData: difference.oldData,
      UserId: user.id,
      Action: user.Action[0],
      Function: user.Function,
      Description: `Chỉnh sửa quyền ${newInfo.Name}`,
      RecordId: newInfo.Id
    }, user)

    return response
  }

  @ActionParam([ActionPermissionEnums.Delete])
  @Post('delete/:type/:id')
  async remove(@Param('type') type: ApplicationTypeEnums,
    @Param('id') id: string,
    @UserInfo() user: JwtPayloadType) {
    let response: ResponseData = { status: false }
    let info = await this.permissionsService.findOne({ Id: +id, ApplicationType: type });
    if (info == undefined) {
      response.message = "Dữ liệu không tồn tại";
      return response;
    }

    await this.userActivitiesService.create({
      NewRequestData: null,
      OldRequestData: info,
      UserId: user.id,
      Action: user.Action[0],
      Function: user.Function,
      Description: `Xóa quyền ${info.Name}`,
      RecordId: info.Id
    }, user)

    return this.permissionsService.softRemove(+id);
  }
}
