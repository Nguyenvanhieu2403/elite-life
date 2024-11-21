import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsNumber, IsArray } from "class-validator";
import { ApplicationTypeEnums } from "src/utils/enums.utils";
import { HandlesValidateMessage, HandlesValidateMessageEnums } from "src/utils/schemas/common.schema";

export class CreateRolesSaleDto {
    @ApiProperty({})
    @IsOptional()
    Name: string | null;

    @ApiProperty({})
    @IsNumber({}, HandlesValidateMessage(HandlesValidateMessageEnums.IsNumber, { each: true }))
    @IsArray(HandlesValidateMessage(HandlesValidateMessageEnums.IsArray))
    PermissionIds: number[]

    ApplicationType: ApplicationTypeEnums;
}
