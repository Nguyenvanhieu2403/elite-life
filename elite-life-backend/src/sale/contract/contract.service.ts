import { Injectable } from '@nestjs/common';
import { UpdateContractDto } from './dto/update-contract.dto';
import { Contracts } from 'src/database/entities/collaborator/contracts.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseData } from 'src/utils/schemas/common.schema';
import { IPaginationOptions } from 'src/utils/types/pagination-options';
import { Repository, FindManyOptions, FindOneOptions } from 'typeorm';
import * as fs from 'fs';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import * as convert from 'libreoffice-convert';
import * as docxConverter from 'docx-pdf';
import * as path from 'path'
import * as moment from 'moment'
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/config.type';
import { FileHelper } from 'src/utils/file-helper';
import { JwtPayloadType } from 'src/utils/strategies/types/jwt-payload.type';
import { UpdateCollaboratorSignDto } from './dto/create-contract.dto';
import * as mammoth from 'mammoth';
import * as pdf from 'html-pdf';
import * as PDFDocument from 'pdfkit';

@Injectable()
export class ContractService {
  constructor(
    @InjectRepository(Contracts)
    private contractsRepository: Repository<Contracts>,
    private configService: ConfigService<AllConfigType>
  ) { }

  async find(options?: FindManyOptions<Contracts>) {
    return await this.contractsRepository.find(options);
  }

  async findManyWithPagination(options?: FindManyOptions<Contracts>, paginationOptions?: IPaginationOptions,) {
    return await this.contractsRepository.findAndCount({
      ...options,
      skip: paginationOptions ? (paginationOptions.page - 1) * paginationOptions.limit : null,
      take: paginationOptions ? paginationOptions.limit : null,
      order: {
        ...options.order,
        CreatedAt: "DESC"
      }
    });
  }

  async findOne(options: FindOneOptions<Contracts>) {
    return await this.contractsRepository.findOne(options);
  }

  async pdfNoSign(
    templatePath: string,
    outputPath: string,
    // outputPdfPath: string,
    user: JwtPayloadType) {
    let response: ResponseData = { status: false }

    let data = {
      UserName: user.collaboratorInfo.UserName ?? '',
      Name: user.collaboratorInfo.Name ?? '',
      Identity: user.collaboratorInfo.Identity ?? '',
      IdentityDate: user.collaboratorInfo.IdentityDate ? moment(user.collaboratorInfo.IdentityDate).format("DD/MM/YYYY") : '',
      IdentityPlace: user.collaboratorInfo.IdentityPlace ?? '',
      Address: user.collaboratorInfo.Address ?? '',
      Day: moment().format('DD'),
      Month: moment().format('MM'),
      Year: moment().format('YYYY')
    }

    try {
      // Đọc file mẫu .docx
      const content = fs.readFileSync(templatePath, 'binary');

      // Tạo một instance của PizZip  
      const zip = new PizZip(content);

      // Tạo instance của Docxtemplater với file zip đã tải
      const doc = new Docxtemplater(zip);

      // Gán dữ liệu cho document
      doc.setData(data);

      // Xử lý tài liệu với dữ liệu đã cung cấp
      doc.render();

      // Xuất file tài liệu mới với thông tin đã merge
      const output = doc.getZip().generate({ type: 'nodebuffer', compression: "DEFLATE", });

      // Ghi file kết quả ra đĩa
      fs.writeFileSync(outputPath, output);

      // await this.wordToPdf(output, outputPdfPath)
      // .then(pdfBuffer => {
      //   fs.writeFileSync(outputPdfPath, pdfBuffer);
      // });
      // if (wordToPdf.status == false) {
      //   response.message = wordToPdf.message
      //   return response
      // }
      // await this.convertWordToHtml(output, outputPath)

      response.status = true
    } catch (error) {
      response.message = `Lỗi khi thực hiện mail merge: ${error}`
    }

    return response
  }

  async mailMerge(
    templatePath: string,
    outputPath: string,
    // outputPdfPath: string,
    updateCollaboratorSignDto: UpdateCollaboratorSignDto,
    user: JwtPayloadType) {
    let response: ResponseData = { status: false }

    let contract = await this.contractsRepository.findOne({ where: { UserName: user.collaboratorInfo.UserName } })
    if (contract) {
      response.message = 'Khách hàng đã ký hợp đồng. Thao tác không thành công!!'
      return response
    }

    let data = {
      UserName: user.collaboratorInfo.UserName,
      Name: updateCollaboratorSignDto.Name,
      Identity: updateCollaboratorSignDto.Identity,
      IdentityDate: moment(updateCollaboratorSignDto.IdentityDate).format("DD/MM/YYYY"),
      IdentityPlace: updateCollaboratorSignDto.IdentityPlace,
      Address: updateCollaboratorSignDto.Address,
      ImageSign: updateCollaboratorSignDto.ImageSign,
      Day: moment().format('DD'),
      Month: moment().format('MM'),
      Year: moment().format('YYYY')
    }

    try {
      // Đọc file mẫu .docx
      const content = fs.readFileSync(templatePath, 'binary');

      // Tạo một instance của PizZip  
      const zip = new PizZip(content);

      // Tạo instance của Docxtemplater với file zip đã tải
      const doc = new Docxtemplater(zip);

      // Gán dữ liệu cho document
      doc.setData(data);

      // Xử lý tài liệu với dữ liệu đã cung cấp
      doc.render();

      // Xuất file tài liệu mới với thông tin đã merge
      const output = doc.getZip().generate({ type: 'nodebuffer' });

      fs.writeFileSync(outputPath, output);

      // await this.wordToPdf(output, outputPdfPath)
      // .then(pdfBuffer => {
      //   fs.writeFileSync(outputPdfPath, pdfBuffer);
      // });
      // if (wordToPdf.status == false) {
      //   response.message = wordToPdf.message
      //   return response
      // }

      let info = await this.contractsRepository.save(
        this.contractsRepository.create({
          UserName: user.userInfo.UserName,
          Name: updateCollaboratorSignDto.Name,
          Identity: updateCollaboratorSignDto.Identity,
          IdentityDate: updateCollaboratorSignDto.IdentityDate,
          IdentityPlace: updateCollaboratorSignDto.IdentityPlace,
          Address: updateCollaboratorSignDto.Address,
        })
      )

      if (updateCollaboratorSignDto.ImageSign != null) {
        const fileExtension = updateCollaboratorSignDto.ImageSign.originalname.split('.').pop();
        var dirFile = this.configService.getOrThrow("app.dirFile", { infer: true });
        const fileName = `${moment().format("YYYYMMDDHHmmss")}.${fileExtension}`;
        FileHelper.SaveFile(updateCollaboratorSignDto.ImageSign, path.resolve(dirFile, "Files", "ImageSign"), fileName);

        await this.contractsRepository.save(
          this.contractsRepository.create({
            Id: info.Id,
            ImageSign: fileName,
            IsSign: true,
            BeginDate: moment().zone(7 * 60).startOf('day').toDate()
          }),
        )

        info.ImageSign = fileName
      }

      response.status = true
      response.data = info
    } catch (error) {
      response.message = `Lỗi khi thực hiện mail merge: ${error}`
    }

    return response
  }

  async wordToPdf(outputPath: Buffer, outputPdfPath: string,) {

    try {
      // Read the input file
      // const docxBuf = await fs.readFileSync(outputPath);

      return new Promise<void>((resolve, reject) => {
        // Thực hiện chuyển đổi từ DOCX sang PDF
        convert.convert(outputPath, '.pdf', undefined, (err, pdfBuffer) => {
          if (err) {
            // console.error('Lỗi khi chuyển đổi file:', err);
            return reject(err);
          }

          // Ghi buffer PDF ra file đích
          fs.writeFileSync(outputPdfPath, pdfBuffer);
          // console.log(`PDF đã được tạo tại: ${outputPdfPath}`);
          resolve();
        });
      });

    } catch (err) {
      console.error(`Error converting file: ${err}`);
    }
  }

  convertHtmlToText = (htmlContent: string): string => {
    // Thay thế thẻ <p> bằng xuống dòng
    let plainText = htmlContent.replace(/<p[^>]*>/g, '\n').replace(/<\/p>/g, '\n');

    // Thay thế thẻ <br> bằng xuống dòng
    plainText = plainText.replace(/<br\s*\/?>/gi, '\n');

    // Loại bỏ tất cả các thẻ HTML khác
    plainText = plainText.replace(/<[^>]+>/g, '');

    // Trim để loại bỏ khoảng trắng đầu và cuối
    return plainText.trim();
  };

  async convertWordToHtml(outputPath: Buffer, outputFilePath: string) {
    try {

      return new Promise<void>((resolve, reject) => {
        // Đọc file Word

        // Chuyển đổi file
        convert.convert(outputPath, '.html', undefined, (err, result) => {
          if (err) {
            // console.error('Lỗi khi chuyển đổi file:', err);
            return reject(err);
          }


          // Ghi nội dung HTML vào file
          fs.writeFileSync(outputFilePath, result);
          resolve();
        });
      });

    } catch (err) {
      console.error(`Error converting file: ${err}`);
    }
  }

  async convertHtmlToString(filePath: string) {
    try {
      // Đọc nội dung file HTML và chuyển thành chuỗi
      const { value: html } = await mammoth.convertToHtml({ path: filePath });
      return html;
    } catch (error) {
      console.error('Lỗi khi đọc file HTML:', error);
      return '';
    }
  };

  async remove(id: Contracts["Id"]) {
    let response: ResponseData = { status: false }
    await this.contractsRepository.delete(id);
    response.status = true;
    return response
  }

  async softRemove(id: Contracts["Id"]) {
    let response: ResponseData = { status: false }
    await this.contractsRepository.softDelete(id);
    response.status = true;
    return response
  }

}
