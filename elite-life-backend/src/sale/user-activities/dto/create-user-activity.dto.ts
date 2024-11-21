import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsNumber } from "class-validator";
import { HandlesValidateMessage, HandlesValidateMessageEnums } from "src/utils/schemas/common.schema";
import { stringToNumberTransformer } from "src/utils/transformers/string-to-number.transformer";
import { Transform } from "class-transformer";
import { ActionPermissionEnums, FunctionPermissionEnums, SaleStudentCommActionPermissionEnums, SaleStudentCommFunctionPermissionEnums } from "src/permissions/permission.enum";

export class CreateUserActivityDto {
    @ApiProperty({ required: false })
    @IsNumber({}, HandlesValidateMessage(HandlesValidateMessageEnums.IsNumber))
    @IsOptional()
    @Transform(stringToNumberTransformer)
    UserId: number | null = null;

    @ApiProperty({ required: false })
    @IsOptional()
    OldRequestData: any | null = null;

    @ApiProperty({ required: false })
    @IsOptional()
    NewRequestData: any | null = null;

    Action: ActionPermissionEnums | SaleStudentCommActionPermissionEnums;

    Function: FunctionPermissionEnums | SaleStudentCommFunctionPermissionEnums;

    @ApiProperty({ required: false })
    @IsOptional()
    Description: string | null = null;

    @ApiProperty({ required: false })
    @IsNumber({}, HandlesValidateMessage(HandlesValidateMessageEnums.IsNumber))
    @IsOptional()
    @Transform(stringToNumberTransformer)
    RecordId: number | null = null;
}
