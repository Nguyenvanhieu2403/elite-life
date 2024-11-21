import { Controller, Get, Post, Body, UseGuards, Request, UnauthorizedException, UseInterceptors, UploadedFile, Query, Req } from '@nestjs/common';
import { SaleAuthService } from './auth.service';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { MailerService } from 'src/mailer/mailer.service';
import { UserInfo, getJwtToken } from 'src/utils/decorator/jwt.decorator';
import { ComboData, ResponseData } from 'src/utils/schemas/common.schema';
import { AuthLoginDto } from './dto/auth-login.dto';
import { CacheService } from 'src/cache/cache.service';
import { JwtPayloadType } from 'src/utils/strategies/types/jwt-payload.type';
import { FileInterceptor } from '@nestjs/platform-express';
import { userFileFilter } from 'src/utils/multer-helper';
import { CollaboratorsService } from '../collaborators/collaborators.service';
import { StringToMd5 } from 'src/utils/common-helper';
import * as moment from 'moment'
import { BanksService } from '../banks/banks.service';
import { AuthRegisterDto } from './dto/auth-register.dto';
import { AuthChangePasswordDto } from './dto/auth-change-password.dto';
import { AuthUploadAvatarDto } from './dto/auth-upload-avatar.dto';
import { FileHelper } from 'src/utils/file-helper';
import { FileTypeEnums, OtherListTypeEnums } from 'src/utils/enums.utils';
import { UploadFilesService } from '../upload-files/upload-files.service';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/config.type';
import * as path from 'path'
import { In } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { UserTokensService } from '../user-tokens/user-tokens.service';
import { UsersService } from '../users/users.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { HttpService } from '@nestjs/axios';
import { OtherListsService } from '../other-lists/other-lists.service';

@ApiTags("Sale/Auth")
@Controller('sale/auth')
export class SaleAuthController {
  constructor(private readonly saleAuthService: SaleAuthService,
    private readonly uploadFilesService: UploadFilesService,
    private readonly collaboratorsService: CollaboratorsService,
    private banksService: BanksService,
    private cacheService: CacheService,
    private configService: ConfigService<AllConfigType>,
    private userTokensService: UserTokensService,
    private usersService: UsersService,
    private mailerService: MailerService,
    private httpService: HttpService,
    private readonly otherListsService: OtherListsService,
  ) { }

  @Post("login")
  async auth(@Body() authLoginDto: AuthLoginDto) {
    let response: ResponseData = { status: false }
    response = await this.saleAuthService.validateLogin(authLoginDto);

    return response
  }

  @Get("register")
  async getRegister() {
    let response: ResponseData = { status: false }
    let bankOptions = await this.banksService.find({ select: { Id: true, Name: true } })
    let nations = await this.otherListsService.find({ where: { Type: OtherListTypeEnums.NationType } })

    response.status = true;
    response.data = {
      BankIdOptions: bankOptions.map(s => new ComboData({
        Text: s.Name,
        Value: s.Id
      })),
      Nations: nations.map(s => new ComboData({
        Text: s.Name,
        Value: s.Id
      })),
    }
    return response
  }

  @Post("register")
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('File', {
    fileFilter: (req, file, callback) =>
      userFileFilter(req, file, callback, ["png", "jpg", "jpeg"])
  }))
  async register(
    @Body() registerDto: AuthRegisterDto,
    @UserInfo() user: JwtPayloadType,
    @UploadedFile() file: Express.Multer.File
  ) {
    let response: ResponseData = { status: false }
    registerDto.File = file;

    if (registerDto.Password != registerDto.RePassword) {
      response.message = {
        Password: "Mật khẩu nhập không trùng nhau"
      }
      return response
    }

    // let collaboratorsEmail = await this.collaboratorsService.exist({ where: { Email: registerDto.Email } });
    // if (collaboratorsEmail) {
    //   response.message = {
    //     Email: "Email đã tồn tại"
    //   }
    //   return response
    // }

    // let collaboratorsMoblie = await this.collaboratorsService.exist({ where: { Mobile: registerDto.Mobile } });
    // if (collaboratorsMoblie) {
    //   response.message = {
    //     Mobile: "Số điện thoại đã tồn tại"
    //   }
    //   return response
    // }
    // let collaboratorsIdentity = await this.collaboratorsService.exist({ where: { Identity: registerDto.Identity } });
    // if (collaboratorsIdentity) {
    //   response.message = {
    //     Identity: "CMND đã tồn tại"
    //   }
    //   return response
    // }
    // let collaboratorsBankNumber = await this.collaboratorsService.exist({ where: { BankNumber: registerDto.BankNumber } });
    // if (registerDto.BankNumber) {
    //   if (collaboratorsBankNumber) {
    //     response.message = {
    //       BankNumber: "Tài khoản ngân hàng đã tồn tại"
    //     }
    //     return response
    //   }
    // }
    if (registerDto.ParentCode) {
      let collaborator = await this.collaboratorsService.findOne({
        where: { UserName: registerDto.ParentCode, IsSale: true }
      })

      if (!collaborator) {
        response.message = {
          Collaborator: 'Mã giới thiệu chưa được kích hoạt, thao tác không thành công !!!'
        }

        return response
      }
    }

    registerDto.Password = StringToMd5(registerDto.Password);
    registerDto.BeginDate = moment().zone(7 * 60).startOf('day').toDate();
    registerDto.OrgId = 1;
    response = await this.saleAuthService.register(registerDto, user);
    return response
  }

  @UseGuards(AuthGuard('jwt-sale'))
  @ApiBearerAuth()
  @Post("info")
  async getInfo(@UserInfo() user: JwtPayloadType) {
    let response: ResponseData = { status: false }
    if (user?.collaboratorInfo == undefined) throw new UnauthorizedException()
    let collaInfo = await this.collaboratorsService.findOne({
      where: { UserName: user.userName },
      relations: {
        Parent: true,
        Bank: true,
      }
    });

    let image = await this.uploadFilesService.findOne({
      where: {
        ForId: In([collaInfo.Id]),
        Type: FileTypeEnums.Sale,
        FileId: 20
      },
      order: { CreatedAt: "desc" }
    });

    (collaInfo as any).Image = null;
    if (image) {
      let dirFile = this.configService.getOrThrow("app.dirFile", { infer: true });
      if (FileHelper.Exist(path.resolve(dirFile, "Files", "Collaborator", image.FileName)))
        (collaInfo as any).Image = `/Files/Collaborator/${image.FileName}`
    }

    response.data = collaInfo;
    response.status = true;
    return response
  }

  @UseGuards(AuthGuard('jwt-sale'))
  @ApiBearerAuth()
  @Post("change-password")
  async changePassword(@Body() authChangePasswordDto: AuthChangePasswordDto,
    @UserInfo() user: JwtPayloadType) {
    let response: ResponseData = { status: false }
    if (authChangePasswordDto.NewPassword != authChangePasswordDto.ReNewPassword) {
      response.message =
      {
        NewPassword: "Mật khẩu nhập không trùng nhau"
      }
      return response
    }
    if (user?.collaboratorInfo == undefined) throw new UnauthorizedException()
    authChangePasswordDto.Id = user.id

    response = await this.saleAuthService.changePassword(authChangePasswordDto);
    return response
  }


  @UseGuards(AuthGuard('jwt-sale'))
  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('File', {
    fileFilter: (req, file, callback) =>
      userFileFilter(req, file, callback, ["png", "jpg", "jpeg"])
  }))
  async upload(
    @UserInfo() user: JwtPayloadType,
    @Body() authUploadAvatarDto: AuthUploadAvatarDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (user?.collaboratorInfo == undefined) throw new UnauthorizedException()
    authUploadAvatarDto.Id = user.collaboratorInfo.Id;
    authUploadAvatarDto.File = file
    return this.saleAuthService.uploadAvatar(authUploadAvatarDto, user);
  }

  @Post('forgot-password')
  async forgotPassword(@Query('username') username: string) {
    let response: ResponseData = { status: false }
    let info = await this.collaboratorsService.findOne({ where: { UserName: username } })
    if (info == null) {
      response.message = "Nhân viên không tồn tại";
      return response;
    }
    var name = info.Name;
    var email = info.Email;
    var baseUrl = this.configService.getOrThrow("app.saleFrontendDomain", { infer: true });
    const uuid = uuidv4();
    const code = uuid ? uuid.replace(/-/g, '0') : '';
    const link = `${baseUrl}?email=${info.Email}&code=${code}`;
    await this.mailerService.sendMail({
      to: email,
      subject: 'Expertrans - Thay đổi mật khẩu',
      html: `Xin chào ${name},<br/>Chúng tôi đã nhận được yêu cầu khôi phục mật khẩu tài khoản ${username} của bạn. Vui lòng click vào liên kết bên dưới để khôi phục tài khoản:<br/>${link}<br/><br/>Trân trọng!`,
    });
    await this.userTokensService.create(code, email, username)

    response.status = true;
    response.data = {
      link,
      email,
      code,
    }
    return response
  }
  @Post("reset-password")
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto,) {
    let response: ResponseData = { status: false }

    try {
      await this.saleAuthService.resetPassword(resetPasswordDto);

      response.message = 'Thay đổi mật khẩu thành công';
      response.status = true;
    } catch (error) {
      console.error('Error resetting password or sending email:', error);

      response.message = 'Lỗi khi thực hiện thay đổi mật khẩu hoặc gửi email';
      response.status = false;
    }
    return response
  }

  @UseGuards(AuthGuard('jwt-sale'))
  @ApiBearerAuth()
  @Post("logout")
  async logOut(@UserInfo() user: JwtPayloadType,
    @Req() req: Request) {
    let jwt: string = getJwtToken(req);
    return await this.saleAuthService.logOut(user, jwt);
  }
}

