import { Controller, Get, Post, Body, Patch, Param, Delete, DefaultValuePipe, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
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
import { In, Not } from 'typeorm';
import { ActionParam, FunctionParam } from 'src/permissions/permission.decorator';
import { UserActivitiesService } from '../user-activities/user-activities.service';
import { ActionPermissionEnums, FunctionPermissionEnums, SaleStudentCommFunctionPermissionEnums } from 'src/permissions/permission.enum';

@ApiTags("Admin/Roles")
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt-admin'))
@Controller('admin/roles')
@FunctionParam(FunctionPermissionEnums.Role)
export class RolesController {
  constructor(private readonly rolesService: RolesService,
    private readonly userActivitiesService: UserActivitiesService,
    private readonly permissionsService: PermissionsService,
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
    let [dataRaw, total] = await this.rolesService.findManyWithPagination(
      {
        where,
        select: {
          Id: true,
          Name: true,
          CreatedAt: true
        }
      },
      { page, limit })

    let data = await this.rolesService.find(
      {
        where: {
          Id: In(dataRaw.map(s => s.Id))
        },
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
    return this.rolesService.findOne({
      where: {
        Id: +id,
      },
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
    let permissions = await this.permissionsService.find({
      where: { ApplicationType: type, },
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
  async create(
    @Param('type') type: ApplicationTypeEnums,
    @Body() createRoleDto: CreateRoleDto,
    @UserInfo() user: JwtPayloadType) {
    let response: ResponseData = { status: false }

    createRoleDto.ApplicationType = type
    response = await this.rolesService.create(createRoleDto, user);

    await this.userActivitiesService.create({
      NewRequestData: response.data,
      OldRequestData: null,
      UserId: user.id,
      Action: user.Action[0],
      Function: user.Function,
      Description: `Thêm role ${response.data.Name}`,
      RecordId: response.data.Id
    }, user)

    return response
  }

  @ActionParam([ActionPermissionEnums.Update])
  @Get('update/:type/:id')
  async getUpdate(
    @Param('type') type: ApplicationTypeEnums,
    @Param('id') id: string) {
    let response: ResponseData = { status: false }
    response.status = true;
    let permissions = await this.permissionsService.find({
      where: { ApplicationType: type, },
      order: {
        Controller: "asc",
        Name: 'asc'
      }
    });

    let info = await this.rolesService.findOne({
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
    @Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto,
    @UserInfo() user: JwtPayloadType) {
    let response: ResponseData = { status: false }
    let oldInfo = await this.rolesService.findOne({ where: { Id: +id, ApplicationType: type } });
    if (oldInfo == undefined) {
      response.message = "Dữ liệu không tồn tại";
      return response;
    }

    response = await this.rolesService.update(+id, updateRoleDto, user);
    let newInfo = await this.rolesService.findOne({ where: { Id: +id, ApplicationType: type } });
    let difference = await this.userActivitiesService.findDifference(oldInfo, newInfo)

    await this.userActivitiesService.create({
      NewRequestData: difference.newData,
      OldRequestData: difference.oldData,
      UserId: user.id,
      Action: user.Action[0],
      Function: user.Function,
      Description: `Chỉnh sửa role ${newInfo.Name}`,
      RecordId: newInfo.Id
    }, user)

    return response
  }

  @ActionParam([ActionPermissionEnums.Delete])
  @Post('delete/:type/:id')
  async remove(
    @Param('type') type: ApplicationTypeEnums,
    @Param('id') id: string, @UserInfo() user: JwtPayloadType) {
    let response: ResponseData = { status: false }
    let info = await this.rolesService.findOne({ where: { Id: +id, ApplicationType: type } });
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
      Description: `Xóa role ${info.Name}`,
      RecordId: info.Id
    }, user)

    response = await this.rolesService.softRemove(+id);
    return response
  }
}
