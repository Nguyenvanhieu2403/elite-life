import { Injectable, NestMiddleware, Inject, ExecutionContext, CanActivate } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ActionPermissionEnums, FunctionPermissionEnums, SaleStudentCommActionPermissionEnums, SaleStudentCommFunctionPermissionEnums } from './permission.enum';
import RolePermissions from 'src/database/entities/user/rolePermisions.entity';
import { Users } from 'src/database/entities/user/users.entity';
import { AllConfigType } from 'src/config/config.type';
import { ConfigService } from '@nestjs/config';
import { CacheService } from 'src/cache/cache.service';
import { ApplicationTypeEnums } from 'src/utils/enums.utils';
import { CacheKeyEnums } from 'src/cache/cache.enums';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache, Milliseconds } from 'cache-manager';

@Injectable()
export class PermissionGuard implements CanActivate {
    isPermissionValidate: boolean;
    constructor(
        @Inject(Reflector)
        private readonly reflector: Reflector,
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache,
        @Inject(ConfigService)
        private configService: ConfigService<AllConfigType>
    ) {
        this.isPermissionValidate = this.configService.get('app.isPermissionValidate', { infer: true })
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();

        let applicationTypeEnums: ApplicationTypeEnums | null = null;
        let functionParam: FunctionPermissionEnums | SaleStudentCommFunctionPermissionEnums;
        let actionParam: ActionPermissionEnums[] | SaleStudentCommActionPermissionEnums[];

        functionParam = this.reflector.getAllAndOverride('functionParam', [
            context.getHandler(),
            context.getClass(),
        ]);

        actionParam = this.reflector.getAllAndOverride('actionParam', [
            context.getHandler(),
            context.getClass(),
        ]);

        // admin api
        if (req.route.path.startsWith("/api/admin")) {
            applicationTypeEnums = ApplicationTypeEnums.User
        }

        // sale api
        if (req.route.path.startsWith("/api/sale")) {
            applicationTypeEnums = ApplicationTypeEnums.Sale
        }

        if (this.isPermissionValidate && functionParam && actionParam) {
            const authHeader = req.headers['authorization'];
            const token: string = authHeader ? authHeader.substring(7) : "";

            let dataInfo: { Info: Users, Permissions: RolePermissions[] } = await this.cacheManager.get(`${applicationTypeEnums}${CacheKeyEnums.Session}:${token}`);
            if (dataInfo == undefined) return false;

            let permissions = dataInfo?.Permissions;

            let valid = permissions.some(s => s.Permission &&
                s.Permission.Controller == functionParam.toString() &&
                actionParam.some(item => item == s.Permission.Action));

            return valid;
        }

        return true;

    }
}