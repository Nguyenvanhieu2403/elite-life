import {
    Injectable,
} from '@nestjs/common';
import * as ms from 'ms';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/config.type';
import { ResponseData } from 'src/utils/schemas/common.schema';
import { AuthLoginDto } from './dto/auth-login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Repository } from 'typeorm';
import { StringToMd5 } from 'src/utils/common-helper';
import { AccessTypeEnums, ApplicationTypeEnums, FileTypeEnums } from 'src/utils/enums.utils';
import * as moment from 'moment';
import { CacheKeyEnums } from 'src/cache/cache.enums';
import { CacheService } from 'src/cache/cache.service';
import { JwtPayloadType } from 'src/utils/strategies/types/jwt-payload.type';
import { UsersService } from '../users/users.service';
import { CollaboratorsService } from '../collaborators/collaborators.service';
import { AuthRegisterDto } from './dto/auth-register.dto';
import { AuthChangePasswordDto } from './dto/auth-change-password.dto';
import { UploadFilesService } from '../upload-files/upload-files.service';
import { FileHelper } from 'src/utils/file-helper';
import * as path from 'path';
import { UploadFiles } from 'src/database/entities/uploadFiles.entity';
import { AuthUploadAvatarDto } from './dto/auth-upload-avatar.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserTokensService } from '../user-tokens/user-tokens.service';
import { v4 as uuidv4 } from 'uuid';
import { MailerService } from 'src/mailer/mailer.service';
import { UserAccessHistoriesService } from '../user-access-histories/user-access-histories.service';
import { RolePermissionsService } from '../role-permissions/role-permissions.service';
import * as os from 'os';
import { HttpService } from '@nestjs/axios';
import { Environment } from 'src/config/app.config';
import { Users } from 'src/database/entities/user/users.entity';

@Injectable()
export class SaleAuthService {
    private readonly isProd: boolean = false;
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService<AllConfigType>,
        private usersService: UsersService,
        private readonly userAccessHistoriesService: UserAccessHistoriesService,
        private collaboratorsService: CollaboratorsService,
        private uploadFilesService: UploadFilesService,
        private cacheService: CacheService,
        private userTokensService: UserTokensService,
        @InjectRepository(UploadFiles)
        private uploadFilesRepository: Repository<UploadFiles>,
        private mailerService: MailerService,
        private readonly rolePermissionsService: RolePermissionsService,
        private httpService: HttpService,

    ) {
        let nodeEvn = this.configService.getOrThrow("app.nodeEnv", { infer: true, });
        this.isProd = nodeEvn == Environment.Prod
    }

    async validateLogin(
        loginDto: AuthLoginDto
    ): Promise<ResponseData> {
        let response: ResponseData = { status: false }

        let user: Users;
        loginDto.Password = StringToMd5(loginDto.Password);
        if (!this.isProd) {
            user = await this.usersService.findOne({
                UserName: ILike(loginDto.UserName),
                ApplicationType: ApplicationTypeEnums.Sale
            });
        } else {
            user = await this.usersService.findOne({
                UserName: ILike(loginDto.UserName),
                Password: loginDto.Password,
                ApplicationType: ApplicationTypeEnums.Sale
            });
        }

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
        delete user.Password
        let collaInfo = await this.collaboratorsService.findOne({
            where: { UserName: user.UserName },
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

        let { token, tokenExpires } = await this.getTokensData({ id: loginDto.Id, userName: loginDto.UserName })
        response.status = true;
        response.token = token
        response.tokenExpires = tokenExpires
        response.data = {
            Info: user,
            CollaboratorInfo: collaInfo,
        }

        let client_session = this.getClientSession()

        console.log(client_session)

        let ttl = moment(response.tokenExpires!).diff(moment())
        await this.cacheService.set(ApplicationTypeEnums.Sale, `${CacheKeyEnums.Session}:${response.token}`, response.data, ttl);
        await this.userAccessHistoriesService.create({ UserId: user.Id, ApplicationType: ApplicationTypeEnums.Sale, AccessType: AccessTypeEnums.LogIn })
        return response
    }

    async logOut(user: JwtPayloadType, jwt: string) {
        let response: ResponseData = { status: false }
        let session = await this.cacheService.get(ApplicationTypeEnums.Sale, `${CacheKeyEnums.Session}:${jwt}`);
        if (session) {
            await this.cacheService.del(ApplicationTypeEnums.Sale, `${CacheKeyEnums.Session}:${jwt}`);
            await this.userAccessHistoriesService.create({ UserId: user.id, ApplicationType: ApplicationTypeEnums.Sale, AccessType: AccessTypeEnums.LogOut })
        }
        response.status = true;
        return response;
    }

    private async getTokensData(data: JwtPayloadType) {
        const tokenExpiresIn = this.configService.getOrThrow('auth.sale.expires', { infer: true, });
        const secret = this.configService.getOrThrow('auth.sale.secret', { infer: true })

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

    async register(registerDto: AuthRegisterDto, user: JwtPayloadType) {
        return this.collaboratorsService.register(registerDto, user);
    }

    async changePassword(
        authChangePasswordDto: AuthChangePasswordDto
    ): Promise<ResponseData> {
        let response: ResponseData = { status: false }

        authChangePasswordDto.Password = StringToMd5(authChangePasswordDto.Password);
        let user = await this.usersService.findOne({
            Id: authChangePasswordDto.Id,
            Password: authChangePasswordDto.Password,
            ApplicationType: ApplicationTypeEnums.Sale
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

        await this.userAccessHistoriesService.create({ UserId: user.Id, ApplicationType: ApplicationTypeEnums.Sale, AccessType: AccessTypeEnums.ChangePassword })
        return response
    }

    async uploadAvatar(authUploadAvatarDto: AuthUploadAvatarDto, user: JwtPayloadType) {
        let response: ResponseData = { status: false }

        if (authUploadAvatarDto.File) {
            const fileExtension = authUploadAvatarDto.File.originalname.split('.').pop();
            var dirFile = this.configService.getOrThrow("app.dirFile", { infer: true });
            const fileName = `${user.userName}-20-${moment().format("YYYYMMDDHHmmss")}.${fileExtension}`;
            FileHelper.SaveFile(authUploadAvatarDto.File, path.resolve(dirFile, "Files", "Collaborator"), fileName);
            await this.uploadFilesRepository.save(
                this.uploadFilesRepository.create({
                    FileId: 20,
                    FileName: fileName,
                    ForId: authUploadAvatarDto.Id,
                    Type: FileTypeEnums.Sale,
                    IsApproved: true,
                    CreatedBy: user.userName
                })
            )
        }

        response.status = true;
        return response
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto) {
        let response: ResponseData = { status: false }
        let token = await this.userTokensService.findOne({ Value: resetPasswordDto.Code, Email: resetPasswordDto.Email });
        if (token == null) {
            response.message = "Link không tồn tại";
            return response;
        }
        let collaborator = await this.collaboratorsService.findOne({ where: { UserName: token.UserName, Email: token.Email } })
        if (collaborator == null) {
            response.message = "Link không tồn tại";
            return response;
        }
        let user = await this.usersService.findOne({ UserName: token.UserName, Email: token.Email })
        if (user == null) {
            response.message = "Link không tồn tại";
            return response;
        }
        const uuid = uuidv4();
        const pass = uuid ? uuid.replace(/-/g, '0').substring(0, 10) : '';

        try {
            await this.collaboratorsService.resetPassword(collaborator.Id, pass);

            await this.usersService.resetPassword(user.Id, pass);

            await this.userTokensService.update(token.Id);

            response.status = true;
        } catch (error) {
            response.status = false;
            console.error(error);
        }

        let info = await this.collaboratorsService.findOne({ where: { Email: resetPasswordDto.Email } });

        var name = info.Name;

        await this.mailerService.sendMail({
            to: resetPasswordDto.Email,
            subject: 'Expertrans - Thay đổi mật khẩu',
            html: `Xin chào ${name},<br/>Mật khẩu mới của bạn là: <b>${pass}</b><br/><br/>Trân trọng!`,
        });
        await this.userAccessHistoriesService.create({ UserId: user.Id, ApplicationType: ApplicationTypeEnums.Sale, AccessType: AccessTypeEnums.ResetPassword })
        response.status = true;
        return response
    }

    getClientSession(): string {
        const platform = os.platform() === 'win32' ? 'WINDOWS' : os.platform() === 'darwin' ? 'MACOS' : 'LINUX';
        const modelName = os.hostname().replace(/ /g, "_");
        const osVersion = os.release();
        const deviceType = 'Device';
        const sdkVersion = '1.0.0';
        const deviceId = uuidv4();
        const timeStamp = Math.floor(Date.now() / 1000);

        let clientSession = `${platform}_${modelName}_${osVersion}_${deviceType}_${sdkVersion}_${deviceId}_${timeStamp}`;

        return clientSession
    }

}
