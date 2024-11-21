import { AuthLoginDto } from 'src/admin/auth/dto/auth-login.dto';
import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Version, UseGuards, Logger, Inject, Injectable, UnauthorizedException, Req } from '@nestjs/common';
import { AdminAuthService } from './auth.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import logger from 'src/utils/logger';
import { MailerService } from 'src/mailer/mailer.service';
import { JwtToken, UserInfo, getJwtToken } from 'src/utils/decorator/jwt.decorator';
import { StringToMd5 } from 'src/utils/common-helper';
import { UsersService } from '../users/users.service';
import { ResponseData } from 'src/utils/schemas/common.schema';
import { Cache } from 'cache-manager';
import * as moment from 'moment';
import { AuthChangePasswordDto } from './dto/auth-change-password.dto';
import { CacheService } from 'src/cache/cache.service'; 
import { CacheKeyEnums } from 'src/cache/cache.enums';
import { ApplicationTypeEnums, RequestTypeEnums } from 'src/utils/enums.utils';
import { Users } from 'src/database/entities/user/users.entity';
import { Request } from 'express';
import { JwtPayloadType } from 'src/utils/strategies/types/jwt-payload.type';

@ApiTags("Admin/Auth")
@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService,
    private readonly mailerService: MailerService, 
    private cacheService: CacheService
  ) { }

  @Post("login")
  async auth(@Body() authLoginDto: AuthLoginDto) {
    let response: ResponseData = { status: false }
    response = await this.adminAuthService.validateLogin(authLoginDto);
    return response
  }

  @UseGuards(AuthGuard('jwt-admin'))
  @ApiBearerAuth()
  @Post("info")
  async getInfo(@Req() request: Request,
    @UserInfo() user: JwtPayloadType) {
    let response: ResponseData = { status: false }
    if (user.userInfo == undefined) throw new UnauthorizedException()
    response.data = user.userInfo;
    response.status = true;
    return response
  }

  @UseGuards(AuthGuard('jwt-admin'))
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
    authChangePasswordDto.Id = user.id
    response = await this.adminAuthService.changePassword(authChangePasswordDto);
    return response
  }

  @UseGuards(AuthGuard('jwt-admin'))
  @ApiBearerAuth()
  @Post("logout")
  async logOut(@UserInfo() user: JwtPayloadType,
    @Req() req: Request) {
    let jwt: string = getJwtToken(req);
    return await this.adminAuthService.logOut(user, jwt);
  }
}
