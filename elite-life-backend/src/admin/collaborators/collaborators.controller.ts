import { Controller, Get, Post, Body, Patch, Param, Delete, DefaultValuePipe, ParseIntPipe, Query, UseGuards, UseInterceptors, UploadedFile, UploadedFiles, Response, HttpException, HttpStatus } from '@nestjs/common';
import { CollaboratorsService } from './collaborators.service';
import { BinaryCollaboratorDto, CreateCollaboratorDto, Record, SaleNode } from './dto/create-collaborator.dto'
import { pagination } from 'src/utils/pagination';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiQuery, ApiBody } from '@nestjs/swagger';
import { UpdateCollaboratorDto } from './dto/update-collaborator.dto';
import { ComboData, ExportBaseDto, ImportErrorDto, ResponseData } from 'src/utils/schemas/common.schema';
import { ClassToClass, ClassToClassNotValidate, GridFilterParse, StringToMd5 } from 'src/utils/common-helper';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import { UploadFilesService } from '../upload-files/upload-files.service';
import { AllConfigType } from 'src/config/config.type';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { userFileFilter } from 'src/utils/multer-helper';
import { UserInfo } from 'src/utils/decorator/jwt.decorator';
import { JwtPayloadType } from 'src/utils/strategies/types/jwt-payload.type';
import { BanksService } from '../banks/banks.service';
import * as moment from 'moment';
import { FileTypeEnums, OtherListTypeEnums, WalletTypeEnums } from 'src/utils/enums.utils';
import { FilesService } from '../files/files.service';
import { FindOptionsWhere, In, IsNull, Not, Raw } from 'typeorm';
import { MailMergeDto, UploadCollaboratorDto } from './dto/upload-collaborators.dto';
import { CreateManyUploadFileDto } from '../upload-files/dto/create-many-upload-file.dto';
import { FileHelper } from 'src/utils/file-helper';
import { UsersService } from '../users/users.service';
import { Collaborators } from 'src/database/entities/collaborator/collaborators.entity';
import { ActionParam, FunctionParam } from '../../permissions/permission.decorator';
import { ActionPermissionEnums, FunctionPermissionEnums } from '../../permissions/permission.enum';
import { convertDate } from 'src/utils/transformers/string-to-date.transformer';
import { UpdateBankDto } from './dto/update-collaborator-bank.dto';
import { response } from 'express';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { ExcelHelper, ExcelImportError, ExcelImportErrorDetail, ExcelParamMap } from 'src/utils/excel-helper';
import { ImportCollaboratorDto } from './dto/import-collaborator.dto';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs'
import { UserActivitiesService } from '../user-activities/user-activities.service';
import { OtherListsService } from '../other-lists/other-lists.service';
import { CreateAvailableDepositDto } from './dto/create-collaborator-contractNumber.dto';
import { OrdersService } from '../orders/orders.service';
import { WalletDetailsService } from '../wallet-details/wallet-details.service';
import { WalletDetails } from 'src/database/entities/collaborator/walletDetail.entity';
import { Orders } from 'src/database/entities/collaborator/order.entity';
import { WalletsService } from '../wallets/wallets.service';
import { OrderDetailsService } from '../order-details/order-details.service';

@ApiTags("Admin/Collaborators")
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt-admin'))
@Controller('admin/collaborators')
@FunctionParam(FunctionPermissionEnums.Collaborator)
export class CollaboratorsController {
  isPermissionValidate: boolean = false;

  constructor(
    private readonly collaboratorsService: CollaboratorsService,
    private readonly uploadFilesService: UploadFilesService,
    private readonly bankService: BanksService,
    private configService: ConfigService<AllConfigType>,
    private readonly filesService: FilesService,
    private readonly usersService: UsersService,
    private readonly userActivitiesService: UserActivitiesService,
    private readonly otherListsService: OtherListsService,
    private readonly ordersService: OrdersService,
    private readonly walletDetailsService: WalletDetailsService,
    private readonly walletsService: WalletsService,
    private readonly orderDetailsService: OrderDetailsService,

  ) {
    this.isPermissionValidate = this.configService.get('app.isPermissionValidate', { infer: true })
  }

  @ActionParam([ActionPermissionEnums.Index])
  @ApiQuery({ name: "filters", required: false })
  @ApiQuery({ name: "fromDate", required: false })
  @ApiQuery({ name: "toDate", required: false })
  @Get("get")
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('filters', new DefaultValuePipe("")) filters: string,
    @Query('fromDate', new DefaultValuePipe("")) fromDateStr: string,
    @Query('toDate', new DefaultValuePipe("")) toDateStr: string,
    @UserInfo() user: JwtPayloadType,
  ) {

    let where: FindOptionsWhere<Collaborators> | FindOptionsWhere<Collaborators>[]
    where = GridFilterParse.ParseWhere<Collaborators>(filters);

    if (where.BeginDate == undefined) {
      let fromDate = convertDate(fromDateStr);
      let toDate = convertDate(toDateStr);
      if (fromDate && toDate) {
        let toDatePlus = toDate.setDate(toDate.getDate() + 1)
        where.BeginDate = Raw((alias) => `${alias} >= :fromDate AND ${alias} <= :toDate`,
          {
            fromDate: fromDate,
            toDate: new Date(toDatePlus)
          })
      }
      else if (fromDate) {
        where.BeginDate = Raw((alias) => `${alias} >= :fromDate `,
          {
            fromDate: fromDate,
          })
      }
      else if (toDate) {
        let toDatePlus = toDate.setDate(toDate.getDate() + 1)
        where.BeginDate = Raw((alias) => `${alias} <= :toDate`,
          {
            toDate: new Date(toDatePlus)
          })
      }
    }

    var [data, total] = await this.collaboratorsService.findManyWithPagination({
      where: where,
      relations: {
        Parent: true,
      },
      select: {
        Parent: {
          Id: true,
          Name: true,
          UserName: true
        }
      }
    }, { page, limit });

    let collaboratorIds = data.map(item => item.Id)
    let images = await this.uploadFilesService.find({
      where: {
        ForId: In(collaboratorIds),
        Type: FileTypeEnums.Sale,
        FileId: 20
      }, order: { CreatedAt: 'desc' }
    })
    let wallets = await this.walletsService.find({
      where: {
        WalletTypeEnums: WalletTypeEnums.Source,
        CollaboratorId: In(collaboratorIds)
      }
    })

    data.forEach(item => {
      (item as any).Image = null;
      (item as any).Available = 0;
      let image = images.find(s => s.ForId == item.Id);
      let wallet = wallets.find(s => s.CollaboratorId == item.Id)
      if (image) {
        let dirFile = this.configService.getOrThrow("app.dirFile", { infer: true });
        if (FileHelper.Exist(path.resolve(dirFile, "Files", "Collaborator", image.FileName)))
          (item as any).Image = `/Files/Collaborator/${image.FileName}`
      }
      if (wallet) {
        (item as any).Available = wallet.Available;
      }
    })

    return pagination(data, total);
  }

  @ActionParam([ActionPermissionEnums.Index])
  @Get('get/:id')
  async findOne(@Param('id') id: string,
    @UserInfo() user: JwtPayloadType,
  ) {
    let response: ResponseData = { status: false }
    let collaborator = await this.collaboratorsService.findOne({ where: { Id: +id } });

    response.status = true;
    response.data = {
      collaborator: collaborator
    }

    return response
  }

  @ActionParam([ActionPermissionEnums.Add])
  @Get("create")
  async getCreate() {
    let response: ResponseData = { status: false }
    let bankOptions = await this.bankService.find({ select: { Id: true, Name: true } })
    let collaborators = await this.collaboratorsService.find({
      where: { IsSale: true },
      select: {
        Id: true,
        Name: true,
        UserName: true
      }
    })
    response.status = true;
    response.data = {
      ParentIdOptions: collaborators.map(s => new ComboData({
        Text: `${s.UserName} - ${s.Name}`,
        Value: s.Id,
      })),
      BankIdOptions: bankOptions.map(s => new ComboData({
        Text: s.Name,
        Value: s.Id
      })),
    }

    return response
  }

  @ActionParam([ActionPermissionEnums.Add])
  @Post("create")
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('File', {
    fileFilter: (req, file, callback) =>
      userFileFilter(req, file, callback, ["png", "jpg", "jpeg"])
  }))
  async create(
    @Body() createCollaboratorDto: CreateCollaboratorDto,
    @UserInfo() user: JwtPayloadType,
    @UploadedFile() file: Express.Multer.File
  ) {
    let response: ResponseData = { status: false }
    createCollaboratorDto.File = file;

    if (createCollaboratorDto.Password != createCollaboratorDto.RePassword) {
      response.message = {
        Password: "Mật khẩu nhập không trùng nhau"
      }
      return response
    }

    if (this.validatePassword(createCollaboratorDto.Password) == false) {
      response.message = {
        Password: "Mật khẩu không hợp lệ!"
      }

      return response
    }

    // let collaboratorsEmail = await this.collaboratorsService.exist({ where: { Email: createCollaboratorDto.Email } });
    // if (collaboratorsEmail) {
    //   response.message = {
    //     Email: "Email đã tồn tại"
    //   }
    //   return response
    // }

    // let collaboratorsMoblie = await this.collaboratorsService.exist({ where: { Mobile: createCollaboratorDto.Mobile } });
    // if (collaboratorsMoblie) {
    //   response.message = {
    //     Mobile: "Số điện thoại đã tồn tại"
    //   }
    //   return response
    // }
    // let collaboratorsIdentity = await this.collaboratorsService.exist({ where: { Identity: createCollaboratorDto.Identity } });
    // if (collaboratorsIdentity) {
    //   response.message = {
    //     Identity: "CMND đã tồn tại"
    //   }
    //   return response
    // }
    // let collaboratorsBankNumber = await this.collaboratorsService.exist({ where: { BankNumber: createCollaboratorDto.BankNumber } });
    // if (createCollaboratorDto.BankNumber) {
    //   if (collaboratorsBankNumber) {
    //     response.message = {
    //       BankNumber: "Tài khoản ngân hàng đã tồn tại"
    //     }
    //     return response
    //   }
    // }

    createCollaboratorDto.Password = StringToMd5(createCollaboratorDto.Password);
    createCollaboratorDto.BeginDate = moment().zone(7 * 60).startOf('day').toDate();
    response = await this.collaboratorsService.create(createCollaboratorDto, user);

    await this.userActivitiesService.create({
      NewRequestData: response.data,
      OldRequestData: null,
      UserId: user.id,
      Action: user.Action[0],
      Function: user.Function,
      Description: `Thêm NVKD: ${response.data.UserName} - ${response.data.Name}`,
      RecordId: response.data.Id
    }, user)

    return response
  }

  validatePassword(password: string): boolean {
    const minLength = 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>[\]\\/`~+=_-]/.test(password);

    return password.length >= minLength;//&& hasUpperCase && hasLowerCase && hasSpecialChar;
  }

  @ActionParam([ActionPermissionEnums.Update])
  @Get("update/:id")
  async getUpdate(
    @Param('id') id: string,
    @UserInfo() user: JwtPayloadType,
  ) {
    let response: ResponseData = { status: false }
    let collaborator = await this.collaboratorsService.findOne({ where: { Id: +id }, relations: { Bank: true } });

    let bankOptions = await this.bankService.find({ select: { Id: true, Name: true } })
    let collaborators = await this.collaboratorsService.find({
      where: { IsSale: true },
      select: {
        Id: true,
        Name: true,
        UserName: true
      }
    })

    let avatar = await this.uploadFilesService.findOne({
      where: { FileId: 20, ForId: +id, Type: FileTypeEnums.Sale },
      order: {
        CreatedAt: "DESC"
      }
    })
    if (avatar) {
      (collaborator as any).Image = null;
      let dirFile = this.configService.getOrThrow("app.dirFile", { infer: true });
      if (FileHelper.Exist(path.resolve(dirFile, "Files", "Collaborator", avatar.FileName)))
        (collaborator as any).Image = `/Files/Collaborator/${avatar.FileName}`
    }
    response.status = true;
    response.data = {
      ParentIdOptions: collaborators.map(s => new ComboData({
        Text: `${s.UserName} - ${s.Name}`,
        Value: s.Id,
      })),
      BankIdOptions: bankOptions.map(s => new ComboData({
        Text: s.Name,
        Value: s.Id,
      })),
      Info: collaborator
    }
    return response
  }

  @ActionParam([ActionPermissionEnums.Update])
  @Post('update/:id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('File', {
    fileFilter: (req, file, callback) =>
      userFileFilter(req, file, callback, ["png", "jpg", "jpeg", "pdf"])
  }))
  async update(
    @Param('id') id: string,
    @Body() updateCollaboratorDto: UpdateCollaboratorDto,
    @UserInfo() user: JwtPayloadType,
    @UploadedFile() file: Express.Multer.File
  ) {
    let response: ResponseData = { status: false }
    updateCollaboratorDto.File = file;

    // let collaboratorsEmail = await this.collaboratorsService.exist({ where: { Email: updateCollaboratorDto.Email, Id: Not(In([+id])) } });
    // if (collaboratorsEmail) {
    //   response.message = {
    //     Email: "Email đã tồn tại"
    //   }
    //   return response
    // }

    // let collaboratorsMoblie = await this.collaboratorsService.exist({ where: { Mobile: updateCollaboratorDto.Mobile, Id: Not(In([+id])) } });
    // if (collaboratorsMoblie) {
    //   response.message = {
    //     Mobile: "Số điện thoại đã tồn tại"
    //   }
    //   return response
    // }
    // let collaboratorsIdentity = await this.collaboratorsService.exist({ where: { Identity: updateCollaboratorDto.Identity, Id: Not(In([+id])) } });
    // if (collaboratorsIdentity) {
    //   response.message = {
    //     Identity: "CMND đã tồn tại"
    //   }
    //   return response
    // }
    // let collaboratorsBankNumber = await this.collaboratorsService.exist({ where: { BankNumber: updateCollaboratorDto.BankNumber, Id: Not(In([+id])) } });
    // if (updateCollaboratorDto.BankNumber) {
    //   if (collaboratorsBankNumber) {
    //     response.message = {
    //       BankNumber: "Tài khoản ngân hàng đã tồn tại"
    //     }
    //     return response
    //   }
    // }

    if (updateCollaboratorDto.Password || updateCollaboratorDto.RePassword) {
      if (updateCollaboratorDto.Password != updateCollaboratorDto.RePassword) {
        response.message = {
          Password: "Mật khẩu nhập không trùng nhau"
        }
        return response
      }
      updateCollaboratorDto.Password = StringToMd5(updateCollaboratorDto.Password);
    }

    let oldCollaborator = await this.collaboratorsService.findOne({ where: { Id: +id } });

    // if (oldCollaborator.IsKyc === true) {
    //   response.message = {
    //     IsKyc: "Nhân viên kinh doanh đã được Kyc không được chỉnh sửa"
    //   }
    //   return response
    // }

    response = await this.collaboratorsService.update(+id, updateCollaboratorDto, user);

    let newCollaborator = await this.collaboratorsService.findOne({ where: { Id: +id } })
    let difference = await this.userActivitiesService.findDifference(oldCollaborator, newCollaborator)

    await this.userActivitiesService.create({
      NewRequestData: difference.newData,
      OldRequestData: difference.oldData,
      UserId: user.id,
      Action: user.Action[0],
      Function: user.Function,
      Description: `Chỉnh sửa NVKD: ${newCollaborator.UserName} - ${oldCollaborator.Name}`,
      RecordId: newCollaborator.Id
    }, user)

    return response

  }

  @ActionParam([ActionPermissionEnums.Delete])
  @Post('delete/:id')
  async remove(@Param('id') id: string,
    @UserInfo() user: JwtPayloadType,
  ) {

    let collaborator = await this.collaboratorsService.findOne({ where: { Id: +id } });

    await this.userActivitiesService.create({
      NewRequestData: null,
      OldRequestData: collaborator,
      UserId: user.id,
      Action: user.Action[0],
      Function: user.Function,
      Description: `Xóa NVKD: ${collaborator.UserName} - ${collaborator.Name}`,
      RecordId: collaborator.Id
    }, user)

    return this.collaboratorsService.softRemove(+id);
  }

  @ActionParam([ActionPermissionEnums.Update])
  @Get("upload/:id")
  async getUpload(@Param('id') id: string,

    @UserInfo() user: JwtPayloadType,
  ) {
    let response: ResponseData = { status: false }

    let fileTypes = await this.filesService.find({
      select: { Id: true, Name: true },
      where: { Type: FileTypeEnums.Sale, Id: Not(In([20])) }
    });
    let files = await this.uploadFilesService.find({
      where: {
        ForId: +id,
        Type: FileTypeEnums.Sale,
        FileId: Not(In([20]))
      },
      relations: { File: true }
    });

    files.forEach(item => item.FileName = `/Files/Collaborator/${item.FileName}`)

    response.status = true;
    response.data = {
      Files: files,
      FileTypes: fileTypes.map(s => { return new ComboData({ Text: s.Name, Value: s.Id }) }),
    }
    return response
  }

  @ActionParam([ActionPermissionEnums.Update])
  @Post("upload/:id")
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('Files', null, {
    fileFilter: (req, file, callback) =>
      userFileFilter(req, file, callback, ["png", "jpg", "jpeg", "pdf"])
  }))
  async upload(@Param('id') id: string,
    @Body() uploadCollaboratorDto: UploadCollaboratorDto,
    @UserInfo() user: JwtPayloadType,
    @UploadedFiles() files: Express.Multer.File[],) {
    let response: ResponseData = { status: false }
    let collaborator = await this.collaboratorsService.findOne({ where: { Id: +id } });
    if (collaborator == undefined) {
      response.message = {
        Collaborator: "Nhân viên không tồn tại"
      }
      return response
    }

    uploadCollaboratorDto.Files = files;
    if (uploadCollaboratorDto.Files == undefined || uploadCollaboratorDto.Files.length == 0) {
      response.message = {
        Files: "Bạn chưa chọn file"
      }
      return response
    }
    let createManyDtos: CreateManyUploadFileDto[] = [];
    let i = 0;

    let dirFile = this.configService.getOrThrow("app.dirFile", { infer: true });
    uploadCollaboratorDto.FileIds.forEach((fileId, index) => {
      if (files[index]) {
        const fileExtension = files[index].originalname.split('.').pop();
        let fileName = `${collaborator.UserName}-${fileId}-${i}-${moment().format("YYYYMMDDHHmmss")}.${fileExtension}`
        FileHelper.SaveFile(files[index], path.resolve(dirFile, "Files", "Collaborator"), fileName);

        createManyDtos.push({
          FileId: fileId,
          ForId: +id,
          FileName: fileName,
          Type: FileTypeEnums.Sale,
        })
        i++;
      }
    })

    if (createManyDtos.length == 0) {
      response.message = {
        Files: "Dữ liệu không hợp lệ"
      }
      return response
    }
    response = await this.uploadFilesService.createMany(createManyDtos, user);

    let fileIds = createManyDtos.map(s => s.FileId)

    let fileUploads = await this.filesService.find({ where: { Id: In(fileIds) } })

    let fileName = fileUploads.map(s => s.Name)

    await this.userActivitiesService.create({
      NewRequestData: createManyDtos,
      OldRequestData: null,
      UserId: user.id,
      Action: user.Action[0],
      Function: user.Function,
      Description: `NVKD: ${collaborator.UserName} - ${collaborator.Name} Upload File: ${fileName}`,
      RecordId: collaborator.Id
    }, user)


    return response
  }

  @ActionParam([ActionPermissionEnums.Update])
  @Post('mail-merge')
  async createMailMerge() {

    let dirTemplate = this.configService.getOrThrow("app.dirTemplate", { infer: true });

    const templatePath = path.join(dirTemplate, './word/Admin_Nam.docx')
    const outputPath = path.join(dirTemplate, './word/Admin_Snow.docx')

    return await this.collaboratorsService.mailMerge(templatePath, outputPath);
  }

  @ActionParam([ActionPermissionEnums.Update])
  @Post("upload/delete/:collaboratorId/:uploadId")
  async removeUpload(@Param('collaboratorId') collaboratorId: string,
    @Param('uploadId') uploadId: string,
    @UserInfo() user: JwtPayloadType,) {
    let response: ResponseData = { status: false }
    let collaborator = await this.collaboratorsService.findOne({ where: { Id: +collaboratorId } });
    if (collaborator == undefined) {
      response.message = {
        collaborator: "Nhân viên không tồn tại"
      }
      return response
    }

    let uploadFile = await this.uploadFilesService.findOne({ where: { Id: +uploadId, ForId: +collaboratorId, Type: FileTypeEnums.Sale } })
    let file = await this.filesService.findOne({ Id: uploadFile.FileId })

    await this.userActivitiesService.create({
      NewRequestData: null,
      OldRequestData: file,
      UserId: user.id,
      Action: user.Action[0],
      Function: user.Function,
      Description: `NVKD: ${collaborator.Name} - ${collaborator.UserName} Xóa File: ${file.Name}`,
      RecordId: collaborator.Id
    }, user)

    response = await this.uploadFilesService.softRemove({ Id: +uploadId, ForId: +collaboratorId, Type: FileTypeEnums.Sale });

    return response
  }

  @FunctionParam(FunctionPermissionEnums.CollaboratorBank)
  @ActionParam([ActionPermissionEnums.Index])
  @ApiQuery({ name: "filters", required: false })
  @Get('bank')
  async bank(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('filters', new DefaultValuePipe("")) filters: string,
    @UserInfo() user: JwtPayloadType
  ) {

    let where: FindOptionsWhere<Collaborators> | FindOptionsWhere<Collaborators>[] = GridFilterParse.ParseWhere<Collaborators>(filters);

    if (this.isPermissionValidate) {
      let whereSub: FindOptionsWhere<Collaborators> = {
        ...where,
      };
      let whereUser: FindOptionsWhere<Collaborators> = {
        ...where,
        CreatedBy: user.userName
      }
      where = [whereSub, whereUser]
    }

    var [data, total] = await this.collaboratorsService.findManyWithPagination({
      where: where,
      relations: {
        Bank: true
      },
      select: {
        Id: true,
        UserName: true,
        Name: true,
        Email: true,
        Mobile: true,
        Address: true,
        BankNumber: true,
        BankId: true,
        BankOwner: true,
        BankBranchName: true,
        CreatedAt: true,
        Identity: true,
        Bank: {
          Name: true
        }
      }
    }, { page, limit });

    return pagination(data, total);
  }

  @FunctionParam(FunctionPermissionEnums.CollaboratorBank)
  @ActionParam([ActionPermissionEnums.Update])
  @Get('update/bank/:id')
  async getUpdateBank(
    @Param('id') id: string,
    @UserInfo() user: JwtPayloadType,
  ) {
    let response: ResponseData = { status: false }
    let collaborator = await this.collaboratorsService.findOne({
      where: { Id: +id },
      relations: {
        Bank: true
      },
    });

    if (this.isPermissionValidate) {
      if (collaborator && !(collaborator.CreatedBy == user.userName))
        throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    let bankOptions = await this.bankService.find({ select: { Id: true, Name: true } })

    response.status = true;
    response.data = {
      BankIdOptions: bankOptions.map(s => new ComboData({
        Text: s.Name,
        Value: s.Id,
      })),
      Info: collaborator
    }
    return response
  }


  @FunctionParam(FunctionPermissionEnums.CollaboratorBank)
  @ActionParam([ActionPermissionEnums.Update])
  @Post('update/bank/:id')
  async updateBank(
    @Param('id') id: string,
    @Body() updateBankDto: UpdateBankDto,
    @UserInfo() user: JwtPayloadType
  ) {
    let response: ResponseData = { status: false }
    let oldCollaborator = await this.collaboratorsService.findOne({ where: { Id: +id } })

    if (oldCollaborator == null) {
      response.message = {
        CollaboratorId: "Dữ liệu không hợp lệ"
      }
      return response
    }
    response = await this.collaboratorsService.updateBank(oldCollaborator.Id, updateBankDto)

    let newCollaborator = await this.collaboratorsService.findOne({ where: { Id: +id } })
    let difference = await this.userActivitiesService.findDifference(oldCollaborator, newCollaborator)

    await this.userActivitiesService.create({
      NewRequestData: difference.newData,
      OldRequestData: difference.oldData,
      UserId: user.id,
      Action: user.Action[0],
      Function: user.Function,
      Description: `Chỉnh sửa TKNH của NVKD: ${newCollaborator.UserName} - ${newCollaborator.Name}`,
      RecordId: newCollaborator.Id
    }, user)

    return response
  }

  @ActionParam([ActionPermissionEnums.Deposit])
  @Post('deposit/:id')
  async deposit(
    @Param('id') id: string,
    @Body() createAvailableDepositDto: CreateAvailableDepositDto
  ) {
    return await this.collaboratorsService.deposit(+id, createAvailableDepositDto)
  }

  @ActionParam([ActionPermissionEnums.Index])
  @ApiQuery({ name: "filters", required: false })
  @Get("walletDetails/:id")
  async walletDetails(
    @Param('id') id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('filters', new DefaultValuePipe("")) filters: string,
  ) {
    let where: FindOptionsWhere<WalletDetails> | FindOptionsWhere<WalletDetails>[] = GridFilterParse.ParseWhere<WalletDetails>(filters);

    var [data, total] = await this.walletDetailsService.findManyWithPagination({
      where: {
        Wallet: {
          CollaboratorId: +id
        },
        WalletType: WalletTypeEnums.Source,
        ...where
      },
    }, { page, limit });

    return pagination(data, total);
  }

  @ActionParam([ActionPermissionEnums.Index])
  @Post('tree/:id')
  async getTree(
    @Param('id') id: string,
  ) {
    let response: ResponseData = { status: false };

    const datas = await this.collaboratorsService.binarTree(+id);

    let dataRaw: BinaryCollaboratorDto[] = []
    let totals = {
      total: datas.length,
      F1: 0,
      F2: 0,
      F3: 0,
    };

    let nodeParents = datas.filter(s => s.ParentId == null);
    if (nodeParents.length > 0) {
      let nodeParent = nodeParents[0];
      let levelCur = 1;
      let parentIdFake = 1_000_000_000_000;
      dataRaw.push(nodeParent);

      const processGroup = (node: BinaryCollaboratorDto, level: number) => {
        // if (level > 3) return;

        let childrens = datas.filter(s => s.ParentId == node.Id);
        let nodeParentFake: BinaryCollaboratorDto;
        if (childrens.length > 0) {
          nodeParentFake = {
            Id: parentIdFake,
            Name: `DL${level - 1} (${childrens.length})`,
            ParentId: node.Id,
            IsGroup: true
          } as BinaryCollaboratorDto
          parentIdFake++;
          dataRaw.push(nodeParentFake)

          if (level === 1) {
            totals.F1 += childrens.length;
          } else if (level === 2) {
            totals.F2 += childrens.length;
          } else if (level === 3) {
            totals.F3 += childrens.length;
          }

          for (const children of childrens) {
            dataRaw.push({
              ...children,
              ParentId: nodeParentFake.Id
            })
            processGroup({
              ...children,
              ParentId: nodeParentFake.Id
            }, level + 1)
          }
        }
      };

      processGroup(nodeParent, levelCur);
    }

    response.status = true;
    response.data = {
      totals,
      dataRaw,
    };
    return response;
  }

  // @ActionParam([ActionPermissionEnums.Index])
  // @Get("get-binary-tree")
  // async getBinaryTree() {
  //   let response: ResponseData = { status: false };

  //   const datas = await this.collaboratorsService.binarTreeAdmin();

  //   let dataRaw: BinaryCollaboratorDto[] = []
  //   let totals = {
  //     total: datas.length,
  //     F1: 0,
  //     F2: 0,
  //     F3: 0,
  //   };

  //   let nodeParents = datas.filter(s => s.ParentId == null);
  //   if (nodeParents.length > 0) {
  //     let nodeParent = nodeParents[0];
  //     let levelCur = 1;
  //     let parentIdFake = 1_000_000_000_000;
  //     dataRaw.push(nodeParent);

  //     const processGroup = (node: BinaryCollaboratorDto, level: number) => {
  //       let childrens = datas.filter(s => s.ParentId == node.Id);
  //       let nodeParentFake: BinaryCollaboratorDto;
  //       if (childrens.length > 0) {
  //         nodeParentFake = {
  //           Id: parentIdFake,
  //           Name: `Tầng ${level}`,
  //           ParentId: node.Id,
  //           IsGroup: true
  //         } as BinaryCollaboratorDto
  //         parentIdFake++;
  //         dataRaw.push(nodeParentFake)

  //         if (level === 1) {
  //           totals.F1 += childrens.length;
  //         } else if (level === 2) {
  //           totals.F2 += childrens.length;
  //         } else if (level === 3) {
  //           totals.F3 += childrens.length;
  //         }

  //         for (const children of childrens) {
  //           dataRaw.push({
  //             ...children,
  //             ParentId: nodeParentFake.Id
  //           })
  //           processGroup({
  //             ...children,
  //             ParentId: nodeParentFake.Id
  //           }, level + 1)
  //         }
  //       }
  //     };

  //     processGroup(nodeParent, levelCur);
  //   }

  //   response.status = true;
  //   response.data = {
  //     totals,
  //     dataRaw,
  //   };
  //   return response;
  // }

  @FunctionParam(FunctionPermissionEnums.BinaryTree)
  @ActionParam([ActionPermissionEnums.Index])
  @Get("get-binary-tree")
  async getBinaryTree() {
    let response: ResponseData = { status: false };

    const datas = await this.collaboratorsService.binarTreeAdmin();

    let totals = {
      total: datas.length,
      F1: 0,
      F2: 0,
      F3: 0,
    };

    const buildOrgChart = (data: Record[]): SaleNode | null => {
      const nodes: { [key: number]: SaleNode } = {};
      let root: SaleNode | null = null;

      data.forEach(s => {
        const { Stt, Id, UserName, Rank, ParentId } = s;

        nodes[Id] = {
          name: UserName,
          attributes: {
            rank: Rank,
            index: Stt,
          },
          children: [],
        };

        if (ParentId === null) {
          root = nodes[Id];
        } else {
          if (nodes[ParentId]) {
            nodes[ParentId].children.push(nodes[Id]);
          }
        }
      });

      return root;
    };

    const orgChart = buildOrgChart(datas);

    response.status = true;
    response.data = {
      totals,
      orgChart,
    };
    return response;
  }

  @ActionParam([ActionPermissionEnums.Index])
  @Get('commission-payment-history/:collaboratorId')
  async CommissionPaymentHistory(
    @Param('collaboratorId') collaboratorId: string
  ) {
    let response: ResponseData = { status: false }

    let walletDetails = await this.walletDetailsService.find({
      relations: {
        Wallet: true
      },
      where: {
        Wallet: {
          CollaboratorId: +collaboratorId,
          WalletTypeEnums: Not(In([WalletTypeEnums.Source])),
        }
      },
      select: {
        CreatedAt: true,
        Id: true,
        Wallet: {
          Id: true,
          WalletTypeEnums: true
        },
        Value: true,
        Note: true
      },
      order: {
        Value: 'asc'
      }
    })

    response.status = true
    response.data = walletDetails ?? []
    return response
  }

  @ActionParam([ActionPermissionEnums.Index])
  @Get("getOrderDetails/:collaboratorId")
  async getOrderDetails(
    @Param('collaboratorId') collaboratorId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    if (limit > 50) {
      limit = 50;
    }

    let [data, total] = await this.orderDetailsService.findManyWithPagination({
      relations: {
        Order: {
          Collaborator: true
        }
      },
      where: {
        CollaboratorId: +collaboratorId
      },
      select: {
        CreatedAt: true,
        Id: true,
        CollaboratorId: true,
        Value: true,
        Note: true,
        WalletTypeEnums: true,
        Order: {
          Id: true,
          Collaborator: {
            Id: true,
            Name: true,
            UserName: true,
            Rank: true
          }
        }
      }
    }, { page, limit })

    return pagination(data, total);
  }
}
