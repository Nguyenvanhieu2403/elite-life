import { Controller, Get, Post, Body, Patch, Param, Delete, DefaultValuePipe, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { pagination } from 'src/utils/pagination';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { GridFilterParse } from 'src/utils/common-helper';
import { Roles } from 'src/database/entities/user/roles.entity';
import { UserInfo } from 'src/utils/decorator/jwt.decorator';
import { JwtPayloadType } from 'src/utils/strategies/types/jwt-payload.type';
import { PermissionsService } from '../permissions/permissions.service';
import { ComboData, ResponseData } from 'src/utils/schemas/common.schema';
import { RolePermissionsService } from '../role-permissions/role-permissions.service';
import { ApplicationTypeEnums } from 'src/utils/enums.utils';
import { In } from 'typeorm';
import { ActionParam, FunctionParam } from 'src/permissions/permission.decorator';
import { ActionPermissionEnums, FunctionPermissionEnums } from 'src/permissions/permission.enum';
import { RolesSaleService } from './roles-sale.service';
import { CreateRolesSaleDto } from './dto/create-roles-sale.dto';
import { UpdateRolesSaleDto } from './dto/update-roles-sale.dto';
import { PermissionsSaleService } from '../permissions-sale/permissions-sale.service';

@ApiTags("Admin/Roles-Sale")
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt-admin'))
@Controller('admin/roles-sale')
@FunctionParam(FunctionPermissionEnums.RoleSale)
export class RolesSaleController {
  constructor(private readonly rolesSaleService: RolesSaleService,
    private readonly permissionsSaleService: PermissionsSaleService,
  ) { }

  @ActionParam([ActionPermissionEnums.Index])
  @Get('get/:type')
  async findAll(
    @Param('type') type: ApplicationTypeEnums,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('filters', new DefaultValuePipe("")) filters: string,) {

    let where = GridFilterParse.ParseWhere<Roles>(filters);
    where.ApplicationType = type;
    let [dataRaw, total] = await this.rolesSaleService.findManyWithPagination(
      {
        where,
        select: {
          Id: true,
          Name: true,
          CreatedAt: true
        }
      },
      { page, limit })

    let data = await this.rolesSaleService.find(
      {
        where: { Id: In(dataRaw.map(s => s.Id)) },
        relations: {
          Permissions: {
            Permission: true
          }
        },
        order: {
          Permissions: {
            Permission: {
              Controller: "asc",
              Name: 'asc'
            }
          }
        }
      })

    return pagination(data, total);
  }

  @ActionParam([ActionPermissionEnums.Index])
  @Get('get/:id')
  findOne(@Param('id') id: string) {
    return this.rolesSaleService.findOne({
      where: { Id: +id },
      relations: {
        Permissions: {
          Permission: true
        }
      }
    });
  }

  @ActionParam([ActionPermissionEnums.Add])
  @Get("create/:type")
  async getCreate(
    @Param('type') type: ApplicationTypeEnums,) {
    let response: ResponseData = { status: false }
    response.status = true;
    let permissions = await this.permissionsSaleService.find({
      where: { ApplicationType: type },
      order: {
        Controller: "asc",
        Name: 'asc'
      }
    });

    response.data = {
      Permissions: permissions
        .map(key => {
          return new ComboData({
            Text: key.Name,
            Value: key.Id,
            Extra: {
              Action: key.Action,
            }
          })
        })
    }
    return response
  }

  @ActionParam([ActionPermissionEnums.Add])
  @Post("create/:type")
  create(
    @Param('type') type: ApplicationTypeEnums,
    @Body() createRolesSaleDto: CreateRolesSaleDto,
    @UserInfo() user: JwtPayloadType) {
    createRolesSaleDto.ApplicationType = type
    return this.rolesSaleService.create(createRolesSaleDto, user);
  }

  @ActionParam([ActionPermissionEnums.Update])
  @Get('update/:type/:id')
  async getUpdate(
    @Param('type') type: ApplicationTypeEnums,
    @Param('id') id: string) {
    let response: ResponseData = { status: false }
    response.status = true;
    let permissions = await this.permissionsSaleService.find({
      where: { ApplicationType: type },
      order: {
        Controller: "asc",
        Name: 'asc'
      }
    });

    let info = await this.rolesSaleService.findOne({
      where: { Id: +id, ApplicationType: type },
      relations: {
        Permissions: {
          Permission: true
        },
      }
    })

    response.data = {
      Permissions: permissions
        .map(key => {
          return new ComboData({
            Text: key.Name,
            Value: key.Id,
            Extra: {
              Action: key.Action,
            }
          })
        }),
      Info: info
    }
    return response
  }

  @ActionParam([ActionPermissionEnums.Update])
  @Post('update/:type/:id')
  async update(
    @Param('type') type: ApplicationTypeEnums,
    @Param('id') id: string, @Body() updateRolesSaleDto: UpdateRolesSaleDto,
    @UserInfo() user: JwtPayloadType) {
    let response: ResponseData = { status: false }
    let info = await this.rolesSaleService.findOne({ where: { Id: +id, ApplicationType: type } });
    if (info == undefined) {
      response.message = "Dữ liệu không tồn tại";
      return response;
    }
    return this.rolesSaleService.update(+id, updateRolesSaleDto, user);
  }

  @ActionParam([ActionPermissionEnums.Delete])
  @Post('delete/:type/:id')
  async remove(
    @Param('type') type: ApplicationTypeEnums,
    @Param('id') id: string) {
    let response: ResponseData = { status: false }
    let info = await this.rolesSaleService.findOne({ where: { Id: +id, ApplicationType: type } });
    if (info == undefined) {
      response.message = "Dữ liệu không tồn tại";
      return response;
    }
    return this.rolesSaleService.softRemove(+id);
  }
}
