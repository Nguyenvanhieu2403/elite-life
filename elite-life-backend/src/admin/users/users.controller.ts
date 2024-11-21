import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, DefaultValuePipe, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { pagination } from 'src/utils/pagination';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ComboData, ResponseData } from 'src/utils/schemas/common.schema';
import { RolesService } from '../roles/roles.service';
import * as  crypto from 'crypto';
import { In, IsNull, Not } from 'typeorm';
import { UserInfo } from 'src/utils/decorator/jwt.decorator';
import { ApplicationTypeEnums, FileTypeEnums } from 'src/utils/enums.utils';
import { GridFilterParse, StringToMd5 } from 'src/utils/common-helper';
import { FilterPipeData, ParseFilterPipe } from 'src/utils/transformers/pipe-filter.transformer';
import { Users } from 'src/database/entities/user/users.entity';
import { GetUserDto } from './dto/get-user.dto';
import { JwtPayloadType } from 'src/utils/strategies/types/jwt-payload.type';
import { ActionParam, FunctionParam } from 'src/permissions/permission.decorator';
import { ActionPermissionEnums, FunctionPermissionEnums } from 'src/permissions/permission.enum';
import { UserActivitiesService } from '../user-activities/user-activities.service';
import { CreateUserWithFileDto } from './dto/create-user-with-file.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { userFileFilter } from 'src/utils/multer-helper';
import { UploadFilesService } from '../upload-files/upload-files.service';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { AllConfigType } from 'src/config/config.type';
import { FileHelper } from 'src/utils/file-helper';

@ApiTags("Admin/User")
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt-admin'))
@Controller('admin/users')
@FunctionParam(FunctionPermissionEnums.User)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    private readonly userActivitiesService: UserActivitiesService,
    private readonly uploadFilesService: UploadFilesService,
    private configService: ConfigService<AllConfigType>,
  ) { }

  @ActionParam([ActionPermissionEnums.Index])
  @Get("get")
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('filters', new DefaultValuePipe("")) filters: string) {

    let where = GridFilterParse.ParseWhere<Users>(filters);
    where.ApplicationType = ApplicationTypeEnums.User
    let [data, total] = await this.usersService.findManyWithPagination({
      where: where,
      relations: {
        Role: true
      },
      select: {
        ApplicationType: false,
        Role: {
          Id: true,
          Name: true
        }
      }
    }, { page, limit });

    let userIds = data.map(item => item.Id)
    let images = await this.uploadFilesService.find({
      where: {
        ForId: In(userIds),
        Type: FileTypeEnums.User,
        FileId: 21
      }, order: { CreatedAt: 'desc' }
    })

    data.forEach(item => {
      (item as any).Image = null;
      let image = images.find(s => s.ForId == item.Id);
      if (image) {
        let dirFile = this.configService.getOrThrow("app.dirFile", { infer: true });
        if (FileHelper.Exist(path.resolve(dirFile, "Files", "User", image.FileName)))
          (item as any).Image = `/Files/User/${image.FileName}`
      }
    })

    return pagination(data, total);
  }

  @ActionParam([ActionPermissionEnums.Index])
  @Get('get/:id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne({ Id: +id });
  }

  @ActionParam([ActionPermissionEnums.Add])
  @Get("create")
  async getCreate() {
    let response: ResponseData = { status: false }
    response.status = true;
    let roles = await this.rolesService.find({
      where: { ApplicationType: ApplicationTypeEnums.User },
      select: { Id: true, Name: true }
    });


    response.data = {
      Role: roles
        .map(key => {
          return new ComboData({ Text: key.Name, Value: key.Id })
        }),
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
    @Body() createUserDto: CreateUserWithFileDto,
    @UserInfo() user: JwtPayloadType,
    @UploadedFile() file: Express.Multer.File
  ) {
    let response: ResponseData = { status: false }
    createUserDto.File = file;

    if (createUserDto.Password != createUserDto.RePassword) {
      response.message = {
        Password: "Mật khẩu nhập không trùng nhau"
      }
      return response
    }
    createUserDto.Password = StringToMd5(createUserDto.Password)

    let exist = await this.usersService.exist({ where: { UserName: createUserDto.UserName, ApplicationType: ApplicationTypeEnums.User } });
    if (exist) {
      response.message = {
        UserName: "Tài khoản đã tồn tại"
      }
      return response
    }

    let role = await this.rolesService.findOne({ where: { Id: createUserDto.RoleId, ApplicationType: ApplicationTypeEnums.User } });
    if (role == undefined) {
      response.message = {
        UserName: "Nhóm quyền không tồn tại"
      }
      return response
    }
    createUserDto.Permission = role.Permission;
    createUserDto.ApplicationType = ApplicationTypeEnums.User
    let responseCreate = await this.usersService.createWithFile(createUserDto, user);

    await this.userActivitiesService.create({
      NewRequestData: responseCreate.data,
      OldRequestData: null,
      UserId: user.id,
      Action: user.Action[0],
      Function: user.Function,
      Description: `Thêm user ${responseCreate.data.UserName}`,
      RecordId: responseCreate.data.Id
    }, user)

    return responseCreate
  }

  @ActionParam([ActionPermissionEnums.Update])
  @Get("update/:id")
  async getUpdate(@Param('id') id: string) {
    let response: ResponseData = { status: false }
    response.status = true;
    let roles = await this.rolesService.find({
      where: { ApplicationType: ApplicationTypeEnums.User },
      select: { Id: true, Name: true }
    });

    let info = await this.usersService.findOne({ Id: +id, ApplicationType: ApplicationTypeEnums.User });
    let avatar = await this.uploadFilesService.findOne({
      where: { FileId: 20, ForId: +id, Type: FileTypeEnums.Sale },
      order: {
        CreatedAt: "DESC"
      }
    })
    if (avatar) {
      (info as any).Image = null;
      let dirFile = this.configService.getOrThrow("app.dirFile", { infer: true });
      if (FileHelper.Exist(path.resolve(dirFile, "Files", "User", avatar.FileName)))
        (info as any).Image = `/Files/User/${avatar.FileName}`
    } response.data = {
      Role: roles
        .map(key => {
          return new ComboData({ Text: key.Name, Value: key.Id })
        }),
      Info: info
    }
    return response
  }

  @ActionParam([ActionPermissionEnums.Update])
  @Post('update/:id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('File', {
    fileFilter: (req, file, callback) =>
      userFileFilter(req, file, callback, ["png", "jpg", "jpeg"])
  }))
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UserInfo() user: JwtPayloadType,
    @UploadedFile() file: Express.Multer.File
  ) {
    let response: ResponseData = { status: false }
    updateUserDto.File = file;

    if (updateUserDto.Password || updateUserDto.RePassword) {
      if (updateUserDto.Password != updateUserDto.RePassword) {
        response.message = {
          Password: "Mật khẩu nhập không trùng nhau"
        }
        return response
      }
      updateUserDto.Password = crypto.createHash('md5').update(updateUserDto.Password).digest("hex")
    }
    else {
      delete updateUserDto.Password;
      delete updateUserDto.RePassword;
    }

    let exist = await this.usersService.exist({
      where: {
        ApplicationType: ApplicationTypeEnums.User,
        Id: +id
      }
    });

    if (!exist) {
      response.message = {
        UserName: "Tài khoản không tồn tại"
      }
      return response
    }

    exist = await this.usersService.exist({
      where: {
        UserName: updateUserDto.UserName,
        ApplicationType: ApplicationTypeEnums.User,
        Id: Not(In([+id]))
      }
    });

    if (exist) {
      response.message = {
        UserName: "Tài khoản đã tồn tại"
      }
      return response
    }

    let role = await this.rolesService.findOne({ where: { Id: updateUserDto.RoleId, ApplicationType: ApplicationTypeEnums.User } });
    if (role == undefined) {
      response.message = {
        UserName: "Nhóm quyền không tồn tại"
      }
      return response
    }
    delete updateUserDto.ApplicationType;

    let oldUser = await this.usersService.findOne({ Id: +id })

    response = await this.usersService.updateWithFile(+id, updateUserDto);

    let newUser = await this.usersService.findOne({ Id: +id })
    let difference = await this.userActivitiesService.findDifference(oldUser, newUser)

    await this.userActivitiesService.create({
      NewRequestData: difference.newData,
      OldRequestData: difference.oldData,
      UserId: user.id,
      Action: user.Action[0],
      Function: user.Function,
      Description: `Chỉnh sửa user: ${newUser.UserName}`,
      RecordId: newUser.Id
    }, user)
    return response
  }

  @ActionParam([ActionPermissionEnums.Delete])
  @Post('delete/:id')
  async remove(@Param('id') id: string, @UserInfo() user: JwtPayloadType) {
    let response: ResponseData = { status: false }
    let exist = await this.usersService.exist({
      where: {
        ApplicationType: ApplicationTypeEnums.User,
        Id: +id
      }
    });

    if (!exist) {
      response.message = {
        UserName: "Tài khoản không tồn tại"
      }
      return response
    }

    let getUser = await this.usersService.findOne({ Id: +id })

    await this.userActivitiesService.create({
      NewRequestData: null,
      OldRequestData: getUser,
      UserId: user.id,
      Action: user.Action[0],
      Function: user.Function,
      Description: `Xóa user: ${getUser.UserName}`,
      RecordId: getUser.Id
    }, user)
    return this.usersService.softRemove(+id);
  }

  // @ActionParam([ActionPermissionEnums.Lock])
  // @Post('lock/:id')
  // async lock(
  //   @Param('id') id: string,
  //   @UserInfo() user: JwtPayloadType) {
  //   let response: ResponseData = { status: false }
  //   let exist = await this.usersService.exist({
  //     where: {
  //       ApplicationType: ApplicationTypeEnums.User,
  //       Id: +id
  //     }
  //   });

  //   if (!exist) {
  //     response.message = {
  //       UserName: "Tài khoản không tồn tại"
  //     }
  //     return response
  //   }
  //   let oldUser = await this.usersService.findOne({ Id: +id })

  //   // todo: process kill session user
  //   response = await this.usersService.lockOrUnlock(+id, { Id: +id, IsLock: true });

  //   let newUser = await this.usersService.findOne({ Id: +id })
  //   let difference = await this.userActivitiesService.findDifference(oldUser, newUser)

  //   await this.userActivitiesService.create({
  //     NewRequestData: difference.newData,
  //     OldRequestData: difference.oldData,
  //     UserId: user.id,
  //     Action: user.Action[0],
  //     Function: user.Function,
  //     Description: `Khóa user: ${newUser.UserName}`,
  //     RecordId: newUser.Id
  //   }, user)

  //   return response
  // }

  // @ActionParam([ActionPermissionEnums.Unlock])
  // @Post('unlock/:id')
  // async unlock(@Param('id') id: string, @UserInfo() user: JwtPayloadType) {
  //   let response: ResponseData = { status: false }
  //   let exist = await this.usersService.exist({
  //     where: {
  //       ApplicationType: ApplicationTypeEnums.User,
  //       Id: +id
  //     }
  //   });

  //   if (!exist) {
  //     response.message = {
  //       UserName: "Tài khoản không tồn tại"
  //     }
  //     return response
  //   }

  //   let oldUser = await this.usersService.findOne({ Id: +id })
  //   // todo: process kill session user
  //   response = await this.usersService.lockOrUnlock(+id, { Id: +id, IsLock: true });

  //   let newUser = await this.usersService.findOne({ Id: +id })
  //   let difference = await this.userActivitiesService.findDifference(oldUser, newUser)

  //   await this.userActivitiesService.create({
  //     NewRequestData: difference.newData,
  //     OldRequestData: difference.oldData,
  //     UserId: user.id,
  //     Action: user.Action[0],
  //     Function: user.Function,
  //     Description: `Mở khóa user: ${newUser.UserName}`,
  //     RecordId: newUser.Id
  //   }, user)

  //   return this.usersService.lockOrUnlock(+id, { Id: +id, IsLock: false });
  // }

  // @ActionParam([ActionPermissionEnums.Delete])
  // @Post('delete/:id')
  // async remove(@Param('id') id: string, @UserInfo() user: JwtPayloadType) {
  //   let response: ResponseData = { status: false }
  //   let exist = await this.usersService.exist({
  //     where: {
  //       ApplicationType: ApplicationTypeEnums.User,
  //       Id: +id
  //     }
  //   });

  //   if (!exist) {
  //     response.message = {
  //       UserName: "Tài khoản không tồn tại"
  //     }
  //     return response
  //   }

  //   let getUser = await this.usersService.findOne({ Id: +id })

  //   await this.userActivitiesService.create({
  //     NewRequestData: null,
  //     OldRequestData: getUser,
  //     UserId: user.id,
  //     Action: user.Action[0],
  //     Function: user.Function,
  //     Description: `Xóa user: ${getUser.UserName}`,
  //     RecordId: getUser.Id
  //   }, user)
  //   return this.usersService.softRemove(+id);
  // }
}
