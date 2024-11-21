import { createParamDecorator, ExecutionContext, } from '@nestjs/common';
import { JwtPayloadType } from '../strategies/types/jwt-payload.type';
import { RequestTypeEnums } from '../enums.utils';
import { Reflector } from '@nestjs/core';
import { ActionPermissionEnums, FunctionPermissionEnums } from 'src/permissions/permission.enum';

export const UserInfo = createParamDecorator(
    (data: unknown, context: ExecutionContext): JwtPayloadType => {
        const request = context.switchToHttp().getRequest();
        var userInfo = request[RequestTypeEnums.userInfo];
        var collaboratorInfo = request[RequestTypeEnums.collaboratorInfo];
        var permission = request[RequestTypeEnums.permissions];


        const reflector = new Reflector();

        let functionParam: FunctionPermissionEnums = reflector.getAllAndOverride('functionParam', [
            context.getHandler(),
            context.getClass(),
        ]);

        let actionParam: ActionPermissionEnums[] = reflector.getAllAndOverride('actionParam', [
            context.getHandler(),
            context.getClass(),
        ]);

        return {
            ...request.user,
            userInfo,
            collaboratorInfo,
            permission,
            Function: functionParam,
            Action: actionParam
        };
    },
);

export const JwtToken = createParamDecorator(
    (data: unknown, context: ExecutionContext) => {
        const request = context.switchToHttp().getRequest();
        return getJwtToken(request);
    },
);

export function getJwtToken(request: Request | any) {
    const authHeader = request.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        return token;
    }
    return null;
}
