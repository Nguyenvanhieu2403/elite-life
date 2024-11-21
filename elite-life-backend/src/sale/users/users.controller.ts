import { Controller, Get, Post, Body, Patch, Param, Delete, DefaultValuePipe, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserInfo } from 'src/utils/decorator/jwt.decorator';
import { JwtPayloadType } from 'src/utils/strategies/types/jwt-payload.type';
import { Users } from 'src/database/entities/user/users.entity';
import { GridFilterParse } from 'src/utils/common-helper';
import { ApplicationTypeEnums } from 'src/utils/enums.utils';
import { pagination } from 'src/utils/pagination';
import { In } from 'typeorm';
import { CollaboratorsService } from '../collaborators/collaborators.service';
import { ComboData, ResponseData } from 'src/utils/schemas/common.schema';
import { RolesService } from '../roles/roles.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ActionParam, FunctionParam } from 'src/permissions/permission.decorator';

@ApiTags("Sale/User")
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt-sale'))
@Controller('sale/user')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly collaboratorsService: CollaboratorsService,
    private readonly rolesService: RolesService,
  ) { }

  @Get("get")
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('filters', new DefaultValuePipe("")) filters: string,
    @UserInfo() user: JwtPayloadType
  ) {

    let where = GridFilterParse.ParseWhere<Users>(filters);
    where.ApplicationType = ApplicationTypeEnums.Sale

    let userNames = await this.collaboratorsService.salerList(user.userName)
    where.UserName = In(userNames)

    let [data, total] = await this.usersService.findManyWithPagination({
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

  @Get("update/:id")
  async getUpdate(@Param('id') id: string) {
    let response: ResponseData = { status: false }
    response.status = true;
    let roles = await this.rolesService.find({
      where: { ApplicationType: ApplicationTypeEnums.Sale },
      select: { Id: true, Name: true }
    });
    let info = await this.usersService.findOne({ Id: +id, ApplicationType: ApplicationTypeEnums.Sale });
    response.data = {
      Role: roles
        .map(key => {
          return new ComboData({ Text: key.Name, Value: key.Id })
        }),
      Info: info
    }
    return response
  }

  @Post('update/:id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    let response: ResponseData = { status: false }

    let exist = await this.usersService.exist({
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

    let role = await this.rolesService.findOne({ where: { Id: updateUserDto.RoleId, ApplicationType: ApplicationTypeEnums.Sale } });
    if (role == undefined) {
      response.message = {
        UserName: "Nhóm quyền không tồn tại"
      }
      return response
    }
    delete updateUserDto.ApplicationType;
    return this.usersService.update(+id, updateUserDto);
  }
}
