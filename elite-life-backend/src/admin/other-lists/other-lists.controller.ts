import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, DefaultValuePipe, ParseIntPipe, UseInterceptors, UploadedFile, Response, ValidationPipe, Request } from '@nestjs/common';
import { OtherListsService } from './other-lists.service';
import { CreateOtherListDto } from './dto/create-other-list.dto';
import { UpdateOtherListDto } from './dto/update-other-list.dto';
import { AuthGuard } from '@nestjs/passport';
import { pagination } from 'src/utils/pagination';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiParam, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/config.type';
import { userFileFilter } from 'src/utils/multer-helper';
import * as fs from 'fs';
import { ComboData, ImportErrorDto, ResponseData } from 'src/utils/schemas/common.schema';
import * as ExcelJS from 'exceljs';
import { OtherListTypeEnums } from 'src/utils/enums.utils';
import { UserInfo } from 'src/utils/decorator/jwt.decorator';
import { ImportOtherListDto } from './dto/import-other-list.dto';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { ExcelHelper, ExcelImportError, ExcelImportErrorDetail, ExcelParamMap } from 'src/utils/excel-helper';
import { ClassToClass, GridFilterParse } from 'src/utils/common-helper';
import { OtherLists } from 'src/database/entities/otherLists.entity';
import { ActionParam, FunctionParam } from '../../permissions/permission.decorator';
import { ActionPermissionEnums, FunctionPermissionEnums } from 'src/permissions/permission.enum';
import { PermissionGuard } from 'src/permissions/permission.guard';
import { JwtPayloadType } from 'src/utils/strategies/types/jwt-payload.type';
import { DeleteTypeDto } from './dto/delete-type.dto';
import { UserActivitiesService } from '../user-activities/user-activities.service';

@ApiTags("Admin/OtherList")
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt-admin'))
@Controller('admin/other-lists')
@FunctionParam(FunctionPermissionEnums.OtherList)
export class OtherListsController {
  constructor(
    private readonly otherListsService: OtherListsService,
    private readonly userActivitiesService: UserActivitiesService,
    private configService: ConfigService<AllConfigType>,
  ) {
  }

  @ActionParam([ActionPermissionEnums.Index])
  @Get("get/:type")
  @ApiParam({
    name: "type",
    description: "OtherListType Enum",
    enum: OtherListTypeEnums
  })
  async findAll(
    @Param("type") type: OtherListTypeEnums,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('filters', new DefaultValuePipe("")) filters: string,) {

    let where = GridFilterParse.ParseWhere<OtherLists>(filters);
    where.Type = type
    let [data, total] = await this.otherListsService.findManyWithPagination({ where: where, order: { Code: 'asc' } }, { page, limit })
    return pagination(data, total);
  }


  @ActionParam([ActionPermissionEnums.Index])
  @Get("get-types")
  getTypes() {
    let response: ResponseData = { status: false }
    response.status = true;
    response.data = Object.keys(OtherListTypeEnums)
      .map(key => {
        return new ComboData({ Text: key, Value: key })
      })
    return response
  }


  @ActionParam([ActionPermissionEnums.Add])
  @Get("create")
  getCreate() {
    let response: ResponseData = { status: false }
    response.status = true;
    response.data = {
      Type: Object.keys(OtherListTypeEnums)
        .map(key => {
          return new ComboData({ Text: key, Value: key })
        })
    }
    return response
  }


  @ActionParam([ActionPermissionEnums.Add])
  @Post("create")
  async create(@Body() createOtherListDto: CreateOtherListDto,
    @UserInfo() user: JwtPayloadType) {
    let response: ResponseData = { status: false }

    response = await this.otherListsService.create(createOtherListDto, user);;

    await this.userActivitiesService.create({
      NewRequestData: response.data,
      OldRequestData: null,
      UserId: user.id,
      Action: user.Action[0],
      Function: user.Function,
      Description: `Thêm MasterData ${response.data.Name},type: ${response.data.Type}`,
      RecordId: response.data.Id
    }, user)

    return response
  }


  @ActionParam([ActionPermissionEnums.Index])
  @Get('get/:id')
  findOne(@Param('id') id: string) {
    let response: ResponseData = { status: false }
    let data = this.otherListsService.findOne({ Id: +id });
    response.status = data != undefined;
    response.data = data;
    return response
  }


  @ActionParam([ActionPermissionEnums.Update])
  @ApiParam({
    name: "id",
    type: "number"
  })
  @Get("update/:id")
  async getUpdate(@Param('id') id: string) {
    let response: ResponseData = { status: false }
    response.status = true;
    let data = await this.otherListsService.findOne({ Id: +id });
    response.data = {
      Type: Object.keys(OtherListTypeEnums)
        .map(key => {
          return new ComboData({ Text: key, Value: key })
        }),
      Info: data
    }
    return response;
  }


  @ActionParam([ActionPermissionEnums.Update])
  @Post('update/:id')
  async update(
    @Param('id') id: string,
    @Body() updateOtherListDto: UpdateOtherListDto,
    @UserInfo() user: JwtPayloadType) {
    let response: ResponseData = { status: false }

    let oldOtherList = await this.otherListsService.findOne({ Id: +id })

    response = await this.otherListsService.update(+id, updateOtherListDto);

    let newOtherList = await this.otherListsService.findOne({ Id: +id })
    let difference = await this.userActivitiesService.findDifference(oldOtherList, newOtherList)

    await this.userActivitiesService.create({
      NewRequestData: difference.newData,
      OldRequestData: difference.oldData,
      UserId: user.id,
      Action: user.Action[0],
      Function: user.Function,
      Description: `Chỉnh sửa MasterData ${newOtherList.Name},type: ${newOtherList.Type}`,
      RecordId: newOtherList.Id
    }, user)

    return response
  }


  @ActionParam([ActionPermissionEnums.Delete])
  @Post('delete/:id')
  async remove(
    @Param('id') id: string,
    @Body() deleteTypeDto: DeleteTypeDto,
    @UserInfo() user: JwtPayloadType
  ) {

    let otherList = await this.otherListsService.findOne({ Id: +id })

    await this.userActivitiesService.create({
      NewRequestData: null,
      OldRequestData: otherList,
      UserId: user.id,
      Action: user.Action[0],
      Function: user.Function,
      Description: `Xóa MasterData ${otherList.Name},type: ${otherList.Type}`,
      RecordId: otherList.Id
    }, user)

    return this.otherListsService.softRemove(+id);
  }


  @ActionParam([ActionPermissionEnums.Import])
  @Get('export')
  async export(@Response() res) {
    const dirTemplate = this.configService.getOrThrow("app.dirTemplate", { infer: true });
    const pathTemplate = `${dirTemplate}/other-list/import.xlsx`;
    const fileName = `other_list_import_${randomStringGenerator()}.xlsx`

    return res.download(pathTemplate, fileName, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    });
  }


  @ActionParam([ActionPermissionEnums.Import])
  @Post('import/:type')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        }
      },
    },
  })
  @ApiParam({
    name: "type",
    description: "OtherListType Enum",
    enum: OtherListTypeEnums
  })
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: (req, file, callback) =>
      userFileFilter(req, file, callback, ["xlsx"])
  }))
  async import(
    @Param("type") type: OtherListTypeEnums,
    @UploadedFile() file: Express.Multer.File,
    @UserInfo() user: JwtPayloadType
  ) {
    let response: ResponseData = { status: false }
    // process file from request
    if (file) {

      // detect position with property dto
      let paramMap: ExcelParamMap = {
        Code: 1,
        Name: 2,
        Number1: 3,
        Number2: 4,
        String1: 5,
        String2: 6,
        Note: 7,
        Ord: 8
      }
      // process data from row number
      let rowStart: number = 4

      // read from a file
      const workbook = new ExcelJS.Workbook();
      let data = await workbook.xlsx.readFile(file.path);
      // remove file temp
      fs.rmSync(file.path, { force: true });
      const ws = data.getWorksheet('data');

      let result = await ExcelHelper.ExportDataFromExcel(ws, rowStart, paramMap, ImportOtherListDto)

      if (result.status == false) {
        const dirTemplate = this.configService.getOrThrow("app.dirTemplate", { infer: true });
        const pathTemplate = `${dirTemplate}/import-error.xlsx`;
        const fileName = `import_error_${randomStringGenerator()}.xlsx`
        const dirFile = this.configService.getOrThrow("app.dirFile", { infer: true });
        const dataMap = Object.getOwnPropertyNames(new ImportErrorDto())
        const pathDist = `${dirFile}/tmp/${fileName}`;
        const rowStart = 2
        const colStart = 1

        let dataErrors: ImportErrorDto[] = []
        Object.keys(result.errors).forEach(rowNumber => {
          let errors: ExcelImportErrorDetail = result.errors[rowNumber]
          dataErrors.push({
            RowNum: `Dòng ${rowNumber}`,
            Description: Object.keys(errors).map(property => { return `${property}: ${errors[property].join(',')}` }).join('\n')
          })
        })

        await ExcelHelper.ExportDataToExcel(pathTemplate, pathDist, {
          [1]: {
            RowStart: rowStart,
            ColStart: colStart,
            Data: dataErrors,
            DataMap: dataMap
          }
        })

        response.message = "Có lỗi trong quá trình Nhập file mẫu, xem chi tiết ở file tải về";
        response.data = `/tmp/${fileName}`;
        return response;
      }

      if (result.data.length == 0) {
        response.message = {
          Data: "Dữ liệu nhập không tồn tại"
        }
        return response;
      }

      let dtos = result.data
      dtos.forEach(dto => dto.Type = type);

      for (let dto of dtos) {
        await this.userActivitiesService.create({
          NewRequestData: dto,
          OldRequestData: null,
          UserId: user.id,
          Action: user.Action[0],
          Function: user.Function,
          Description: `Import MasterData: ${dto.Name} Type: ${dto.Type}`,
          RecordId: null
        }, user)
      }

      // process dtos object
      return await this.otherListsService.import(dtos, user);
    }

    return {
      ...response,
      status: true
    }
  }

}