import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Users } from 'src/database/entities/user/users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, FindManyOptions, Repository } from 'typeorm';
import { IPaginationOptions } from 'src/utils/types/pagination-options';
import { EntityCondition } from 'src/utils/types/entity-condition.type';
import { ResponseData } from 'src/utils/schemas/common.schema';
import { JwtPayloadType } from 'src/utils/strategies/types/jwt-payload.type';
import { CreateUserWithFileDto } from './dto/create-user-with-file.dto';
import * as moment from 'moment';
import * as path from 'path';
import { UploadFiles } from 'src/database/entities/uploadFiles.entity';
import { FileTypeEnums } from 'src/utils/enums.utils';
import { FileHelper } from 'src/utils/file-helper';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/config.type';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
    @InjectRepository(UploadFiles)
    private uploadFilesRepository: Repository<UploadFiles>,
    private configService: ConfigService<AllConfigType>,
  ) { }

  async find(options?: FindManyOptions<Users>) {
    return await this.userRepository.find(options);
  }

  async exist(options?: FindManyOptions<Users>) {
    return await this.userRepository.exist(options);
  }

  findManyWithPagination(options?: FindManyOptions<Users>, paginationOptions?: IPaginationOptions,) {
    return this.userRepository.findAndCount({
      ...options,
      skip: paginationOptions ? (paginationOptions.page - 1) * paginationOptions.limit : null,
      take: paginationOptions ? paginationOptions.limit : null,
      order: {
        ...options.order,
        CreatedAt: "DESC"
      },
    });
  }

  findOne(fields: EntityCondition<Users>) {
    return this.userRepository.findOne({
      where: fields,
    });
  }

  async create(createUserDto: CreateUserDto, user: JwtPayloadType) {
    let response: ResponseData = { status: false }
    let info = await this.userRepository.save(
      this.userRepository.create({
        ...createUserDto,
        CreatedBy: user?.userName
      }),
    );
    response.status = true;
    response.data = info
    return response
  }

  async createWithFile(createUserWithFileDto: CreateUserWithFileDto, user: JwtPayloadType) {
    let response: ResponseData = { status: false }
    let info = await this.userRepository.save(
      this.userRepository.create({
        ...createUserWithFileDto,
        CreatedBy: user?.userName
      }),
    );

    if (createUserWithFileDto.File) {
      const fileExtension = createUserWithFileDto.File.originalname.split('.').pop();
      var dirFile = this.configService.getOrThrow("app.dirFile", { infer: true });
      // 20 is File Id in table UploadFiles
      const fileName = `${info.UserName}-21-${moment().format("YYYYMMDDHHmmss")}.${fileExtension}`;
      FileHelper.SaveFile(createUserWithFileDto.File, path.resolve(dirFile, "Files", "User"), fileName);
      await this.uploadFilesRepository.save(
        this.uploadFilesRepository.create({
          FileId: 21, // avatar
          FileName: fileName,
          ForId: info.Id,
          Type: FileTypeEnums.User,
          IsApproved: true,
          CreatedBy: user.userName
        })
      )
    }

    response.status = true;
    response.data = info
    return response
  }

  async update(id: Users["Id"], payload: DeepPartial<Users>) {
    let response: ResponseData = { status: false }
    await this.userRepository.save(
      this.userRepository.create({
        Id: id,
        ...payload
      }),
    );
    response.status = true;
    return response
  }

  async updateWithFile(id: Users["Id"], payload: UpdateUserDto) {
    let response: ResponseData = { status: false }
    await this.userRepository.save(
      this.userRepository.create({
        Id: id,
        ...payload
      }),
    );

    let info = await this.userRepository.findOne({ where: { Id: id } });

    if (info && payload.File) {
      const fileExtension = payload.File.originalname.split('.').pop();
      var dirFile = this.configService.getOrThrow("app.dirFile", { infer: true });
      const fileName = `${info.UserName}-20-${moment().format("YYYYMMDDHHmmss")}.${fileExtension}`;
      FileHelper.SaveFile(payload.File, path.resolve(dirFile, "Files", "User"), fileName);
      await this.uploadFilesRepository.save(
        this.uploadFilesRepository.create({
          FileId: 21,
          FileName: fileName,
          ForId: info.Id,
          Type: FileTypeEnums.User,
          IsApproved: true,
          CreatedBy: info.UserName
        })
      )
    }

    response.status = true;
    return response
  }

  async lockOrUnlock(id: Users["Id"], payload: DeepPartial<Users>) {
    let response: ResponseData = { status: false }
    await this.userRepository.save(
      this.userRepository.create({
        Id: id,
        ...payload
      }),
    );
    response.status = true;
    return response
  }

  async remove(id: Users["Id"]) {
    let response: ResponseData = { status: false }
    await this.userRepository.delete(id);
    response.status = true;
    return response
  }

  async softRemove(id: Users["Id"]) {
    let response: ResponseData = { status: false }
    await this.uploadFilesRepository.softDelete({ ForId: id, Type: FileTypeEnums.User })
    await this.userRepository.softDelete(id);
    response.status = true;
    return response
  }

} 
