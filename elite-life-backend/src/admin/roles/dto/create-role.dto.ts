import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsObject, IsOptional } from "class-validator";
import { ApplicationTypeEnums } from "src/utils/enums.utils";
import { HandlesValidateMessage, HandlesValidateMessageEnums } from "src/utils/schemas/common.schema";

export class CreateRoleDto {
    @ApiProperty({})
    @IsOptional()
    Name: string | null;

    @ApiProperty({})
    @IsNumber({}, HandlesValidateMessage(HandlesValidateMessageEnums.IsNumber, { each: true }))
    @IsArray(HandlesValidateMessage(HandlesValidateMessageEnums.IsArray))
    PermissionIds: number[]

    ApplicationType: ApplicationTypeEnums;
}
