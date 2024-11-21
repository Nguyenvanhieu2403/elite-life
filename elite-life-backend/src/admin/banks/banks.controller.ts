import { Body, Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ActionParam, FunctionParam } from 'src/permissions/permission.decorator';
import { ActionPermissionEnums, FunctionPermissionEnums } from 'src/permissions/permission.enum';
import { GridFilterParse } from 'src/utils/common-helper';
import { UserInfo } from 'src/utils/decorator/jwt.decorator';
import { pagination } from 'src/utils/pagination';
import { ComboData, ResponseData } from 'src/utils/schemas/common.schema';
import { JwtPayloadType } from 'src/utils/strategies/types/jwt-payload.type';
import { BanksService } from './banks.service';
import { CreateBanksDto } from './dto/create-banks.dto';
import { UpdateBanksDto } from './dto/update-banks.dto';
import { UserActivitiesService } from '../user-activities/user-activities.service';
import { AuthGuard } from '@nestjs/passport';
import { OtherListsService } from '../other-lists/other-lists.service';
import { OtherListTypeEnums } from 'src/utils/enums.utils';
import { Banks } from 'src/database/entities/collaborator/banks.entity';

@ApiTags("Admin/Banks")
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt-admin'))
@Controller('admin/banks')
@FunctionParam(FunctionPermissionEnums.Banks)
export class BanksController {
    constructor(
        private readonly banksService: BanksService,
        private readonly userActivitiesService: UserActivitiesService,
        private readonly otherListsService: OtherListsService,
    ) { }

    @Get("get")
    @ActionParam([ActionPermissionEnums.Index])
    @ApiQuery({ name: 'filters', type: String, required: false, description: 'Name for filtering' })
    async findAll(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
        @Query('filters', new DefaultValuePipe("")) filters: string) {
        let where = GridFilterParse.ParseWhere<Banks>(filters);

        const [data, total] = await this.banksService.findManyWithPagination({
            where: where,
        }, { page, limit })
        return pagination(data, total);

    }

    @ActionParam([ActionPermissionEnums.Add])
    @Post("create")
    async create(@Body() createRoomDto: CreateBanksDto,
        @UserInfo() user: JwtPayloadType) {
        let response: ResponseData = { status: false }

        response = await this.banksService.create(createRoomDto, user);

        await this.userActivitiesService.create({
            NewRequestData: response.data,
            OldRequestData: null,
            UserId: user.id,
            Action: user.Action[0],
            Function: user.Function,
            Description: `Thêm Ngân hàng: ${response.data.Name}`,
            RecordId: response.data.Id
        }, user)

        return response
    }

    @ActionParam([ActionPermissionEnums.Index])
    @Get('update/:id')
    async getUpdate(
        @Param('id') id: number
    ) {
        let response: ResponseData = { status: false }

        let info = await this.banksService.findOne({
            where: { Id: id },
        })

        response.status = true
        response.data = {
            Info: info
        }

        return response
    }

    @Post('update/:id')
    @ActionParam([ActionPermissionEnums.Update])
    async update(
        @Param('id') id: string,
        @Body() updateRoomDto: UpdateBanksDto,
        @UserInfo() user: JwtPayloadType) {
        let response: ResponseData = { status: false }

        let oldRoom = await this.banksService.findOne({ where: { Id: +id } })
        response = await this.banksService.update(+id, updateRoomDto);

        let newRoom = await this.banksService.findOne({ where: { Id: +id } })
        let difference = await this.userActivitiesService.findDifference(oldRoom, newRoom)

        await this.userActivitiesService.create({
            NewRequestData: difference.newData,
            OldRequestData: difference.oldData,
            UserId: user.id,
            Action: user.Action[0],
            Function: user.Function,
            Description: `Chỉnh sửa Ngân hàng: ${newRoom.Name}`,
            RecordId: newRoom.Id
        }, user)

        return response
    }

    @ActionParam([ActionPermissionEnums.Delete])
    @Post('delete/:id')
    async remove(@Param('id') id: string, @UserInfo() user: JwtPayloadType) {
        let room = await this.banksService.findOne({ where: { Id: +id } })

        await this.userActivitiesService.create({
            NewRequestData: null,
            OldRequestData: room,
            UserId: user.id,
            Action: user.Action[0],
            Function: user.Function,
            Description: `Xóa Ngân hàng: ${room.Name}`,
            RecordId: room.Id
        }, user)

        return this.banksService.softRemove(+id);
    }
}
