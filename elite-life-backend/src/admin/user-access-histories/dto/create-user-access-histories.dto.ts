import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional } from "class-validator";
import { AccessTypeEnums, ApplicationTypeEnums } from "src/utils/enums.utils";
import { HandlesValidateMessage, HandlesValidateMessageEnums } from "src/utils/schemas/common.schema";

export class CreateUserAccessHistoriesDto {
    @ApiProperty({})
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    UserId: number | null;

    @ApiProperty({})
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    ApplicationType: ApplicationTypeEnums;

    @ApiProperty({})
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    AccessType: AccessTypeEnums;
}
