import { ApiProperty, ApiPropertyOptional, } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsArray, IsEmail, IsEmpty, IsEnum, IsNotEmpty, IsNumber, IsOptional, MinLength } from 'class-validator';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { Transform } from 'class-transformer';
import { lowerCaseTransformer } from 'src/utils/transformers/lower-case.transformer';
import { ApplicationTypeEnums } from 'src/utils/enums.utils';
import { HandlesValidateMessage, HandlesValidateMessageEnums } from "src/utils/schemas/common.schema";
import { stringToNumberTransformer } from 'src/utils/transformers/string-to-number.transformer';

export class UpdateUserDto {
    @ApiProperty({ example: `UserName${randomStringGenerator()}` })
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    @Transform(lowerCaseTransformer)
    UserName: string;

    @ApiProperty({ example: `123456` })
    @IsOptional()
    Password: string;

    @ApiProperty({ example: `123456` })
    @IsOptional()
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

    Image: string = null;

    @ApiProperty({ type: 'string', format: 'binary', required: false })
    @IsOptional()
    File: Express.Multer.File | null = null;

}
