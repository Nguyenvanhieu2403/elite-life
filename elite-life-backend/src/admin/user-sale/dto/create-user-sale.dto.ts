import { randomStringGenerator } from "@nestjs/common/utils/random-string-generator.util";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsEmail, IsOptional, IsBoolean } from "class-validator";
import { ApplicationTypeEnums } from "src/utils/enums.utils";
import { HandlesValidateMessage, HandlesValidateMessageEnums } from "src/utils/schemas/common.schema";
import { lowerCaseTransformer } from "src/utils/transformers/lower-case.transformer";
import { Transform } from "class-transformer";

export class CreateUserSaleDto {
    @ApiProperty({ example: `UserName${randomStringGenerator()}` })
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    @Transform(lowerCaseTransformer)
    UserName: string;

    @ApiProperty({ example: `123456` })
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    Password: string;

    @ApiProperty({ example: `123456` })
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    RePassword?: string;

    @ApiProperty({ example: 1 })
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    @IsNumber({}, HandlesValidateMessage(HandlesValidateMessageEnums.IsNumber))
    RoleId?: number;

    @ApiProperty({ example: `DisplayName${randomStringGenerator()}` })
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    DisplayName: string | null;

    @ApiProperty({ example: `Email${randomStringGenerator()}@gmail.com` })
    @IsEmail({}, HandlesValidateMessage(HandlesValidateMessageEnums.IsEmail))
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    @Transform(lowerCaseTransformer)
    Email: string;

    @ApiProperty({ example: `Mobile${randomStringGenerator()}` })
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    Mobile: string;

    @ApiProperty({ required: false })
    @IsOptional()
    Address: string | null;

    Permission?: string;

    ApplicationType: ApplicationTypeEnums

}
