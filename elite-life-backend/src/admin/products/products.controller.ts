import { Controller, Response, Get, Post, Body, Param, DefaultValuePipe, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { pagination } from 'src/utils/pagination';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ComboData, ResponseData } from 'src/utils/schemas/common.schema';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/config.type';
import { ExportProductDto } from './dto/export-product.dto';
import { ExcelHelper } from 'src/utils/excel-helper';
import { GridFilterParse } from 'src/utils/common-helper';
import { Products } from 'src/database/entities/products.entity';
import { FunctionParam, ActionParam } from '../../permissions/permission.decorator';
import { FunctionPermissionEnums, ActionPermissionEnums } from '../../permissions/permission.enum';
import { UserActivitiesService } from '../user-activities/user-activities.service';
import { UserInfo } from 'src/utils/decorator/jwt.decorator';
import { JwtPayloadType } from 'src/utils/strategies/types/jwt-payload.type';

@ApiTags("Admin/Products")
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt-admin'))
@Controller('admin/products')
@FunctionParam(FunctionPermissionEnums.Product)
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private configService: ConfigService<AllConfigType>,
    private readonly userActivitiesService: UserActivitiesService,
  ) { }

  @ActionParam([ActionPermissionEnums.Index])
  @Get("get")
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('filters', new DefaultValuePipe("")) filters: string,) {
    if (limit > 50) {
      limit = 50;
    }
    let where = GridFilterParse.ParseWhere<Products>(filters);

    let [data, total] = await this.productsService.findManyWithPagination({
      where: where,

    }, { page, limit })
    return pagination(data, total);
  }

  @ActionParam([ActionPermissionEnums.Index])
  @Get('get/:id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne({ Id: +id });
  }


  @ActionParam([ActionPermissionEnums.Index])
  @Post("create")
  async create(@Body() createProductDto: CreateProductDto, @UserInfo() user: JwtPayloadType) {
    let response: ResponseData = { status: false }

    response = await this.productsService.create(createProductDto);

    await this.userActivitiesService.create({
      NewRequestData: response.data,
      OldRequestData: null,
      UserId: user.id,
      Action: user.Action[0],
      Function: user.Function,
      Description: `Thêm sản phẩm ${response.data.Name}`,
      RecordId: response.data.Id
    }, user)

    return response
  }

  @ActionParam([ActionPermissionEnums.Index])
  @Get("update/:id")
  async getUpdate(@Param('id') id: string) {
    let response: ResponseData = { status: false }

    let data = await this.productsService.findOne({ Id: +id });

    response.status = true;
    response.data = {
      Info: data
    }
    return response;
  }

  @ActionParam([ActionPermissionEnums.Index])
  @Post('update/:id')
  async update(@Param('id') id: string,
    @UserInfo() user: JwtPayloadType,
    @Body() updateProductDto: UpdateProductDto) {

    let response: ResponseData = { status: false }

    let oldProduct = await this.productsService.findOne({ Id: +id })
    response = await this.productsService.update(+id, updateProductDto);

    let newProduct = await this.productsService.findOne({ Id: +id })
    let difference = await this.userActivitiesService.findDifference(oldProduct, newProduct)

    await this.userActivitiesService.create({
      NewRequestData: difference.newData,
      OldRequestData: difference.oldData,
      UserId: user.id,
      Action: user.Action[0],
      Function: user.Function,
      Description: `Chỉnh sửa sản phẩm ${newProduct.Name}`,
      RecordId: newProduct.Id
    }, user)

    return response
  }

  @Get("export-excel")
  async exportExcel(@Response() res) {
    const dirFile = this.configService.getOrThrow("app.dirFile", { infer: true });
    const dirTemplate = this.configService.getOrThrow("app.dirTemplate", { infer: true });
    const datas = await this.productsService.find()
    const dataMap = Object.getOwnPropertyNames(new ExportProductDto)
    const pathTemplate = `${dirTemplate}/product/export.xlsx`;
    const fileName = `product_${randomStringGenerator()}.xlsx`
    const pathDist = `${dirFile}/tmp/${fileName}`;
    const rowStart = 2
    const colStart = 1

    await ExcelHelper.ExportDataToExcel(pathTemplate, pathDist, {
      [1]: {
        RowStart: rowStart,
        ColStart: colStart,
        Data: datas,
        DataMap: dataMap
      }
    })

    return res.download(pathDist, fileName, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    });
  }

}
