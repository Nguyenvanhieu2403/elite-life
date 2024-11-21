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

  async convertHtmlToString(filePath: string) {
    try {
      // Đọc nội dung file HTML và chuyển thành chuỗi
      const { value: html } = await mammoth.convertToHtml({ path: filePath });
      return html;
    } catch (error) {
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
