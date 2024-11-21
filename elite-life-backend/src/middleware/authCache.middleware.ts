
import { Inject, Injectable, NestMiddleware, Req, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response, NextFunction, Request } from 'express';
import { CacheKeyEnums } from 'src/cache/cache.enums';
import { CacheService } from 'src/cache/cache.service';
import { Environment } from 'src/config/app.config';
import { AllConfigType } from 'src/config/config.type';
import RolePermissions from 'src/database/entities/user/rolePermisions.entity';
import { Users } from 'src/database/entities/user/users.entity';
import { getJwtToken } from 'src/utils/decorator/jwt.decorator';
import { ApplicationTypeEnums, RequestTypeEnums } from 'src/utils/enums.utils';
import { JwtPayloadType } from 'src/utils/strategies/types/jwt-payload.type';

@Injectable()
export class AuthCacheMiddleware implements NestMiddleware {
      isPermissionValidate: boolean = false;

      constructor(
            private cacheService: CacheService,
            private configService: ConfigService<AllConfigType>,
      ) {
            this.isPermissionValidate = this.configService.get('app.isPermissionValidate', { infer: true })
      }

      async use(req: Request, res: Response, next: NextFunction) {
            let jwtToken = getJwtToken(req);
            if (jwtToken) {
                  let applicationTypeEnums: ApplicationTypeEnums | null = null;
                  // admin api
                  if (req.originalUrl.startsWith("/api/admin")) applicationTypeEnums = ApplicationTypeEnums.User

                  // sale api
                  if (req.originalUrl.startsWith("/api/sale")) applicationTypeEnums = ApplicationTypeEnums.Sale

                  // validate
                  if (applicationTypeEnums) {
                        let data: any = await this.cacheService.get(applicationTypeEnums, `${CacheKeyEnums.Session}:${jwtToken}`);
                        if (this.isPermissionValidate && data == undefined) throw new UnauthorizedException();

                        req[RequestTypeEnums.permissions] = data?.Permissions;
                        req[RequestTypeEnums.userInfo] = data?.Info;
                        req[RequestTypeEnums.collaboratorInfo] = data?.CollaboratorInfo;
                  }
            }

            next();
      }
}
