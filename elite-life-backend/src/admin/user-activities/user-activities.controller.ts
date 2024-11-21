import { Controller, DefaultValuePipe, Get, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { UserActivitiesService } from './user-activities.service';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UserActivities } from 'src/database/entities/user/userActivities.entity';
import { GridFilterParse } from 'src/utils/common-helper';
import { pagination } from 'src/utils/pagination';
import { AuthGuard } from '@nestjs/passport';
import { ActionPermissionEnums, FunctionPermissionEnums } from 'src/permissions/permission.enum';
import { In } from 'typeorm';
import { ActionParam, FunctionParam } from 'src/permissions/permission.decorator';

@ApiTags("Admin/User-activities")
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt-admin'))
@Controller('admin/user-activities')
@FunctionParam(FunctionPermissionEnums.UserActivities)
export class UserActivitiesController {
    constructor(
        private readonly userActivitiesService: UserActivitiesService
    ) { }

    @ActionParam([ActionPermissionEnums.Index])
    @Get("get")
    async findAll(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
        @Query('filters', new DefaultValuePipe("")) filters: string,
    ) {
        let where = GridFilterParse.ParseWhere<UserActivities>(filters);

        let [data, total] = await this.userActivitiesService.findManyWithPagination(
            {
                select: {
                    Id: true,
                    Action: true,
                    ApplicationType: true,
                    CreatedAt: true,
                    Description: true,
                    Function: true,
                    NewRequestData: true,
                    OldRequestData: true,
                    User: {
                        Id: true,
                        UserName: true,
                        Email: true,
                        Mobile: true
                    }
                },
                where: where,
                relations: {
                    User: true,
                },
            },
            { page, limit });

        return pagination(data, total);
    }


}
