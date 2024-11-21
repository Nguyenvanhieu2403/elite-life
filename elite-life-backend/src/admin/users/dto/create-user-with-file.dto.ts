import { randomStringGenerator } from "@nestjs/common/utils/random-string-generator.util";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsEnum, IsOptional, IsEmail, MinLength, IsNumber, IsArray } from "class-validator";
import { Roles } from "src/database/entities/user/roles.entity";
import { ApplicationTypeEnums } from "src/utils/enums.utils";
import { lowerCaseTransformer } from "src/utils/transformers/lower-case.transformer";
import { HandlesValidateMessage, HandlesValidateMessageEnums } from "src/utils/schemas/common.schema";
import { stringToNumberTransformer } from "src/utils/transformers/string-to-number.transformer";

export class CreateUserWithFileDto {
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
    @Transform(stringToNumberTransformer)
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

    @ApiProperty({ type: 'string', format: 'binary', required: false })
    @IsOptional()
    File: Express.Multer.File | null = null;
}
