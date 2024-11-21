import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { UserAccessHistoriesService } from './user-access-histories.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ActionPermissionEnums, FunctionPermissionEnums } from 'src/permissions/permission.enum';
import { ActionParam, FunctionParam } from 'src/permissions/permission.decorator';
import { GridFilterParse } from 'src/utils/common-helper';
import { UserAccessHistories } from 'src/database/entities/user/userAccessHistories.entity';
import { pagination } from 'src/utils/pagination';

@ApiTags("Admin/User-Access")
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt-admin'))
@Controller('admin/user-access')
@FunctionParam(FunctionPermissionEnums.UserAccessHitories)
export class UserAccessHistoriesController {
  constructor(private readonly userAccessHistoriesService: UserAccessHistoriesService) { }

  @ActionParam([ActionPermissionEnums.Index])
  @Get("get")
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('filters', new DefaultValuePipe("")) filters: string,) {
    if (limit > 50) {
      limit = 50;
    }
    let where = GridFilterParse.ParseWhere<UserAccessHistories>(filters);

    let [data, total] = await this.userAccessHistoriesService.findManyWithPagination(
      {
        select: {
          Id: true,
          AccessType: true,
          ApplicationType: true,
          CreatedAt: true,
          User: {
            Id: true,
            UserName: true,
            Email: true,
            Mobile: true,
          }
        },
        where: where,
        relations: {
          User: true,
        }
      },
      { page, limit })
    return pagination(data, total);
  }

}
