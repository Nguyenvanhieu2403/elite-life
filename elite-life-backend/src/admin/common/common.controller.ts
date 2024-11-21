import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Res } from '@nestjs/common';
import { OtherListsService } from '../other-lists/other-lists.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ComboData, ResponseData } from 'src/utils/schemas/common.schema';
import { ApplicationTypeEnums, OtherListTypeEnums } from 'src/utils/enums.utils';
import { CommonOtherList } from './dto/common-other-list.dto';
import { AllConfigType } from 'src/config/config.type';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { Response } from 'express';

@ApiTags("Admin/Common")
@Controller('admin/common')
export class CommonController {
  constructor(private readonly otherListsService: OtherListsService,
    private configService: ConfigService<AllConfigType>,) { }

  @UseGuards(AuthGuard('jwt-admin'))
  @ApiBearerAuth()
  @Get("application/types/get")
  getApplicationTypes() {
    let response: ResponseData = { status: false }
    response.status = true;
    response.data = Object.keys(ApplicationTypeEnums)
      .map(key => {
        return new ComboData({ Text: key, Value: key })
      })
    return response
  }

  @UseGuards(AuthGuard('jwt-admin'))
  @ApiBearerAuth()
  @Get("other-lists/types/get")
  getOtherListTypes() {
    let response: ResponseData = { status: false }
    response.status = true;
    response.data = Object.keys(OtherListTypeEnums)
      .map(key => {
        return new ComboData({ Text: key, Value: key })
      })
    return response
  }

  @UseGuards(AuthGuard('jwt-admin'))
  @ApiBearerAuth()
  @Get("other-lists/get")
  async getOtherListByTypes(@Body() request: CommonOtherList) {
    let response: ResponseData = { status: false }
    response = await this.otherListsService.findByTypes(request.Types)
    return response
  }

  @Get("file/:fileName")
  getFile(@Param('fileName') fileName: string, @Res() res: Response) {
    const dirFile = this.configService.getOrThrow("app.dirFile", { infer: true });
    const filePath = join(dirFile, fileName);
    return res.download(filePath, fileName.substring(fileName.lastIndexOf("/")));
  }
}
