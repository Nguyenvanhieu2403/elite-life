import { Controller, Get, Post, Body, Patch, Param, Delete, DefaultValuePipe, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { pagination } from 'src/utils/pagination';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ComboData, ResponseData } from 'src/utils/schemas/common.schema';
import { ActionPermissionEnums, FunctionPermissionEnums, SaleStudentCommActionPermissionEnums, SaleStudentCommFunctionPermissionEnums } from '../../permissions/permission.enum';
import { ApplicationTypeEnums } from 'src/utils/enums.utils';
import { GridFilterParse } from 'src/utils/common-helper';
import { Permissions } from 'src/database/entities/user/permissions.entity';
import { ActionParam, FunctionParam } from 'src/permissions/permission.decorator';
import { PermissionsSaleService } from './permissions-sale.service';
import { CreatePermissionsSaleDto } from './dto/create-permissions-sale.dto';
import { UpdatePermissionsSaleDto } from './dto/update-permissions-sale.dto';

@ApiTags("Admin/Permissions-Sale")
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt-admin'))
@Controller('admin/permissions-sale')
@FunctionParam(FunctionPermissionEnums.PermissionSale)
export class PermissionsSaleController {
  constructor(private readonly permissionsSaleService: PermissionsSaleService) { }

  @ActionParam([ActionPermissionEnums.Index])
  @Get('get/:type')
  async findAll(
    @Param('type') type: ApplicationTypeEnums,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('filters', new DefaultValuePipe("")) filters: string,) {

    let where = GridFilterParse.ParseWhere<Permissions>(filters);
    where.ApplicationType = type
    let [data, total] = await this.permissionsSaleService.findManyWithPagination(
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
    return this.permissionsSaleService.findOne({ Id: +id, ApplicationType: ApplicationTypeEnums.User });
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
  create(@Param('type') type: ApplicationTypeEnums,
    @Body() createPermissionsSaleDto: CreatePermissionsSaleDto) {
    createPermissionsSaleDto.ApplicationType = type;
    return this.permissionsSaleService.create(createPermissionsSaleDto);
  }

  @ActionParam([ActionPermissionEnums.Update])
  @Get('update/:type/:id')
  async getUpdate(@Param('type') type: ApplicationTypeEnums,
    @Param('id') id: string) {
    let response: ResponseData = { status: false }
    let info = await this.permissionsSaleService.findOne({ Id: +id, ApplicationType: type });
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
    @Param('id') id: string, @Body() updatePermissionsSaleDto: UpdatePermissionsSaleDto) {
    let response: ResponseData = { status: false }
    let info = await this.permissionsSaleService.findOne({ Id: +id, ApplicationType: type });
    if (info == undefined) {
      response.message = "Dữ liệu không tồn tại";
      return response;
    }
    return this.permissionsSaleService.update(+id, updatePermissionsSaleDto);
  }

  @ActionParam([ActionPermissionEnums.Delete])
  @Post('delete/:type/:id')
  async remove(@Param('type') type: ApplicationTypeEnums,
    @Param('id') id: string) {
    let response: ResponseData = { status: false }
    let info = await this.permissionsSaleService.findOne({ Id: +id, ApplicationType: type });
    if (info == undefined) {
      response.message = "Dữ liệu không tồn tại";
      return response;
    }
    return this.permissionsSaleService.softRemove(+id);
  }
}
