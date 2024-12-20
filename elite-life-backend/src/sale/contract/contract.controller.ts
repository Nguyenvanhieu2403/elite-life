import { Controller, Get, Post, Body, UploadedFile, UseInterceptors, UseGuards, Res } from '@nestjs/common';
import { ContractService } from './contract.service';
import { UpdateCollaboratorSignDto } from './dto/create-contract.dto';
import * as path from 'path';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UserInfo } from 'src/utils/decorator/jwt.decorator';
import { userFileFilter } from 'src/utils/multer-helper';
import { JwtPayloadType } from 'src/utils/strategies/types/jwt-payload.type';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/config.type';
import { ResponseData } from 'src/utils/schemas/common.schema';
import { AuthGuard } from '@nestjs/passport';
import { FileHelper } from 'src/utils/file-helper';
import { Response } from 'express';


@ApiTags("Sale/Contract")
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt-sale'))
@Controller('sale/contract')
export class ContractController {
  constructor(
    private readonly contractService: ContractService,
    private configService: ConfigService<AllConfigType>,

  ) { }

  @Get('get')
  async get(
    @UserInfo() user: JwtPayloadType,
  ) {
    let response: ResponseData = { status: false };

    var dirFile = this.configService.getOrThrow("app.dirFile", { infer: true });
    let dirTemplate = this.configService.getOrThrow("app.dirTemplate", { infer: true });
    // const outputPdfPath = path.join(dirFile, `./word/contractPdf${user.collaboratorInfo.UserName}.pdf`)
    const templatePath = path.join(dirTemplate, './word/contractTemp.docx')
    const outputPath = path.join(dirFile, `./word/outPutWord${user.collaboratorInfo.UserName}.docx`)

    // let pdfPath: string
    let htmlPath: string
    let imageSign = null;

    let contract = await this.contractService.findOne({ where: { UserName: user.collaboratorInfo.UserName } })
    if (contract) {
      // pdfPath = `/word/contractPdf${user.collaboratorInfo.UserName}.pdf`
      htmlPath = await this.contractService.convertHtmlToString(outputPath) ?? ""
      imageSign = `Files/ImageSign/${contract.ImageSign}`
    } else {
      if (FileHelper.Exist(path.resolve(dirFile, "word", `outPutWord${user.collaboratorInfo.UserName}.docx`))) {
        // pdfPath = `/word/contractPdf${user.collaboratorInfo.UserName}.pdf`
        htmlPath = await this.contractService.convertHtmlToString(outputPath) ?? ""
      } else {

        let pdf = await this.contractService.pdfNoSign(
          templatePath,
          outputPath,
          // outputPdfPath,
          user)
        if (pdf.status == true) {
          // pdfPath = `/word/contractPdf${user.collaboratorInfo.UserName}.pdf`
          htmlPath = await this.contractService.convertHtmlToString(outputPath) ?? ""
        } else {
          response.message = pdf.message
          return response
        }
      }
    }

    response.status = true
    response.data = {
      // PdfPath: pdfPath,
      ImageSign: imageSign,
      HtmlPath: htmlPath,
      Contract: contract
    }

    return response
  }

  @Post('mail-merge')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('ImageSign', {
    fileFilter: (req, file, callback) =>
      userFileFilter(req, file, callback, ["png", "jpg", "jpeg"])
  }))
  async createMailMerge(
    @UserInfo() user: JwtPayloadType,
    @Body() updateCollaboratorSignDto: UpdateCollaboratorSignDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    updateCollaboratorSignDto.ImageSign = file;
    let dirTemplate = this.configService.getOrThrow("app.dirTemplate", { infer: true });
    var dirFile = this.configService.getOrThrow("app.dirFile", { infer: true });

    const templatePath = path.join(dirTemplate, './word/contractTemp.docx')
    // const outputPdfPath = path.join(dirFile, `./word/contractPdf${user.collaboratorInfo.UserName}.pdf`)
    const outputPath = path.join(dirFile, `./word/outPutWord${user.collaboratorInfo.UserName}.docx`)

    return await this.contractService.mailMerge(
      templatePath,
      outputPath,
      // outputPdfPath,
      updateCollaboratorSignDto,
      user);
  }

  @Get('download')
  async download(
    @UserInfo() user: JwtPayloadType,
    @Res() res: Response
  ) {
    let response: ResponseData = { status: false };

    const dirFile = this.configService.getOrThrow("app.dirFile", { infer: true });
    const dirTemplate = this.configService.getOrThrow("app.dirTemplate", { infer: true });
    const templatePath = path.join(dirTemplate, './word/contractTemp.docx');
    const outputPath = path.join(dirFile, `./word/outPutWord${user.collaboratorInfo.UserName}.docx`);

    try {
      let contract = await this.contractService.findOne({ where: { UserName: user.collaboratorInfo.UserName } });

      if (!contract) {
        if (!FileHelper.Exist(outputPath)) {
          let pdfResult = await this.contractService.pdfNoSign(
            templatePath,
            outputPath,
            user
          );
          if (!pdfResult.status) {
            response.message = pdfResult.message;
            return res.status(400).json(response);
          }
        }
      }
      // Nếu hợp đồng tồn tại hoặc đã được tạo, gửi file DOCX
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename=contract_${user.collaboratorInfo.UserName}.docx`);
      return res.sendFile(outputPath); // Trả về file Word
    } catch (error) {
      console.error("Error generating Word file:", error);
      response.message = "Failed to download contract Word file.";
      return res.status(500).json(response);
    }
  }
}
