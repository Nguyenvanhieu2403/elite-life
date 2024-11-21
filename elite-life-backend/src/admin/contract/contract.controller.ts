import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, UseGuards, DefaultValuePipe, ParseIntPipe, Query } from '@nestjs/common';
import { ContractService } from './contract.service';
import { UpdateCollaboratorSignDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import * as path from 'path';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UserInfo } from 'src/utils/decorator/jwt.decorator';
import { userFileFilter } from 'src/utils/multer-helper';
import { JwtPayloadType } from 'src/utils/strategies/types/jwt-payload.type';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/config.type';
import { ResponseData } from 'src/utils/schemas/common.schema';
import * as fs from 'fs';
import { AuthGuard } from '@nestjs/passport';
import { FileHelper } from 'src/utils/file-helper';
import { Contracts } from 'src/database/entities/collaborator/contracts.entity';
import { ActionParam, FunctionParam } from 'src/permissions/permission.decorator';
import { ActionPermissionEnums, FunctionPermissionEnums } from 'src/permissions/permission.enum';
import { GridFilterParse } from 'src/utils/common-helper';
import { pagination } from 'src/utils/pagination';
import { CollaboratorsService } from '../collaborators/collaborators.service';

@ApiTags("Admin/Contract")
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt-admin'))
@Controller('admin/contract')
@FunctionParam(FunctionPermissionEnums.Contract)
export class ContractController {
  constructor(
    private readonly contractService: ContractService,
    private configService: ConfigService<AllConfigType>,
    private readonly collaboratorsService: CollaboratorsService,

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
    let where = GridFilterParse.ParseWhere<Contracts>(filters);

    let [data, total] = await this.contractService.findManyWithPagination({
      where: where,
    }, { page, limit })

    data.forEach(item => {
      if (item.ImageSign) {
        let dirFile = this.configService.getOrThrow("app.dirFile", { infer: true });
        if (FileHelper.Exist(path.resolve(dirFile, "Files", "ImageSign", item.ImageSign)))
          item.ImageSign = `/Files/ImageSign/${item.ImageSign}`
        else {
          item.ImageSign = null
        }
      }
    })

    return pagination(data, total);
  }

  @ActionParam([ActionPermissionEnums.Index])
  @Get('get/:id')
  async get(
    @Param('id') id: number,
  ) {
    let response: ResponseData = { status: false };

    let contract = await this.contractService.findOne({ where: { Id: id } })
    let htmlPath: string
    var dirFile = this.configService.getOrThrow("app.dirFile", { infer: true });
    const outputPath = path.join(dirFile, `./word/outPutWord${contract.UserName}.docx`)

    if (contract && contract.ImageSign) {
      htmlPath = await this.contractService.convertHtmlToString(outputPath)
    }

    response.status = true
    response.data = {
      PdfPath: htmlPath,
      Contract: contract
    }

    return response
  }
}
