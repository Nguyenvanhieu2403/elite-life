import { Collaborators } from "src/database/entities/collaborator/collaborators.entity";
import RolePermissions from "src/database/entities/user/rolePermisions.entity";
import { Users } from "src/database/entities/user/users.entity";
import { ActionPermissionEnums, FunctionPermissionEnums, SaleStudentCommActionPermissionEnums, SaleStudentCommFunctionPermissionEnums } from "src/permissions/permission.enum";
import { RequestTypeEnums } from "src/utils/enums.utils";

export type JwtPayloadType = {
  id: number,
  role?: number | string,
  userName: string,
  iat?: number;
  exp?: number;
  [RequestTypeEnums.userInfo]?: Users;
  [RequestTypeEnums.collaboratorInfo]?: Collaborators;
  [RequestTypeEnums.permissions]?: RolePermissions[];
  Function?: FunctionPermissionEnums | SaleStudentCommFunctionPermissionEnums;
  Action?: ActionPermissionEnums[] | SaleStudentCommActionPermissionEnums[];
};
