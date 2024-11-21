import { SetMetadata } from '@nestjs/common';
import { ActionPermissionEnums, FunctionPermissionEnums, SaleStudentCommActionPermissionEnums, SaleStudentCommFunctionPermissionEnums } from './permission.enum';

export const FunctionParam = (param: FunctionPermissionEnums | SaleStudentCommFunctionPermissionEnums) => SetMetadata('functionParam', param);
export const ActionParam = (param: ActionPermissionEnums[] | SaleStudentCommActionPermissionEnums[]) => SetMetadata('actionParam', param);