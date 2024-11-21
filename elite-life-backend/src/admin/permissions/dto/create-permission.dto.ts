import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";
import { OtherLists } from "src/database/entities/otherLists.entity";
import { ApplicationTypeEnums } from "src/utils/enums.utils";
import { HandlesValidateMessage, HandlesValidateMessageEnums } from "src/utils/schemas/common.schema";

export class CreatePermissionDto {
    @ApiProperty({})
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    Code: string | null;

    @ApiProperty({})
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    Name: string | null;

    @ApiProperty({})
    @IsOptional()
    Action: string | null;

    @ApiProperty({})
    @IsOptional()
    Controller: string | null;

    ApplicationType: ApplicationTypeEnums;
}
