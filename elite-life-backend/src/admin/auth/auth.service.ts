import {
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import * as ms from 'ms';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/config.type';
import { ResponseData } from 'src/utils/schemas/common.schema';
import { AuthLoginDto } from './dto/auth-login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/database/entities/user/users.entity';
import { ILike, Repository } from 'typeorm';
import { StringToMd5 } from 'src/utils/common-helper';
import { AccessTypeEnums, ApplicationTypeEnums } from 'src/utils/enums.utils';
import { UsersService } from '../users/users.service';
import { RolePermissionsService } from '../role-permissions/role-permissions.service';
import { AuthChangePasswordDto } from './dto/auth-change-password.dto';
import * as moment from 'moment';
import { CacheService } from 'src/cache/cache.service';
import { CacheKeyEnums } from 'src/cache/cache.enums';
import { UserAccessHistoriesService } from '../user-access-histories/user-access-histories.service';
import { JwtPayloadType } from 'src/utils/strategies/types/jwt-payload.type';


@Injectable()
export class AdminAuthService {
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService<AllConfigType>,
        private readonly usersService: UsersService,
        private readonly userAccessHistoriesService: UserAccessHistoriesService,
        private readonly rolePermissionsService: RolePermissionsService,
        private cacheService: CacheService
    ) {

    }

    async validateLogin(
        loginDto: AuthLoginDto
    ): Promise<ResponseData> {
        let response: ResponseData = { status: false }

        loginDto.Password = StringToMd5(loginDto.Password);
        let user = await this.usersService.findOne({
            UserName: ILike(loginDto.UserName),
            Password: loginDto.Password,
            ApplicationType: ApplicationTypeEnums.User
        });

        if (user == null) {
            response.message = {
                Password: "Tài khoản hoặc mật khẩu sai"
            }
            return response;
        }

        // if (user.IsLock) {
        //     response.message = {
        //         UserName: "Tài khoản không có quyền truy cập"
        //     }
        //     return response;
        // }
        loginDto.Id = user.Id;
        loginDto.RoleId = user.RoleId
        delete user.Password
        let permissions = await this.rolePermissionsService.find({
            where: { RoleId: user.RoleId },
            relations: {
                Permission: true
            },
            select: {
                Permission: {
                    Controller: true,
                    Action: true
                }
            }
        })
        let { token, tokenExpires } = await this.getTokensData({ id: loginDto.Id, role: loginDto.RoleId, userName: loginDto.UserName })
        response.status = true;
        response.token = token
        response.tokenExpires = tokenExpires
        response.data = {
            Info: user,
            Permissions: permissions
        }
        let ttl = moment(tokenExpires!).diff(moment())
        await this.cacheService.set(ApplicationTypeEnums.User, `${CacheKeyEnums.Session}:${response.token}`, response.data, ttl);
        await this.userAccessHistoriesService.create({ UserId: user.Id, ApplicationType: ApplicationTypeEnums.User, AccessType: AccessTypeEnums.LogIn })
        return response
    }

    async logOut(user: JwtPayloadType, jwt: string) {
        let response: ResponseData = { status: false }
        let session = await this.cacheService.get(ApplicationTypeEnums.User, `${CacheKeyEnums.Session}:${jwt}`);
        if (session) {
            await this.cacheService.del(ApplicationTypeEnums.User, `${CacheKeyEnums.Session}:${jwt}`);
            await this.userAccessHistoriesService.create({ UserId: user.id, ApplicationType: ApplicationTypeEnums.User, AccessType: AccessTypeEnums.LogOut })
        }
        response.status = true;
        return response;
    }

    async changePassword(
        authChangePasswordDto: AuthChangePasswordDto
    ): Promise<ResponseData> {
        let response: ResponseData = { status: false }

        authChangePasswordDto.Password = StringToMd5(authChangePasswordDto.Password);
        let user = await this.usersService.findOne({
            Id: authChangePasswordDto.Id,
            Password: authChangePasswordDto.Password,
            ApplicationType: ApplicationTypeEnums.User
        });
        if (user == undefined) {
            response.message = {
                Password: "Mật khẩu cũ không đúng"
            }
            return response
        }

        response = await this.usersService.update(authChangePasswordDto.Id, {
            Password: StringToMd5(authChangePasswordDto.NewPassword)
        })
        await this.userAccessHistoriesService.create({ UserId: user.Id, ApplicationType: ApplicationTypeEnums.User, AccessType: AccessTypeEnums.ChangePassword })
        response.status = true;
        return response
    }

    private async getTokensData(data: {
        id: number,
        role: number | string,
        userName: string,
    }) {
        const tokenExpiresIn = this.configService.getOrThrow('auth.admin.expires', { infer: true, });
        const secret = this.configService.getOrThrow('auth.admin.secret', { infer: true })

        const tokenExpires = Date.now() + ms(tokenExpiresIn);

        const token = await this.jwtService.signAsync(
            data,
            {
                secret: secret,
                expiresIn: tokenExpiresIn,
            },
        )

        return {
            token,
            tokenExpires,
        };
    }
}
