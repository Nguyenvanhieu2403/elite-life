import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, MinLength, Validate } from 'class-validator';
import { HandlesValidateMessage, HandlesValidateMessageEnums } from "src/utils/schemas/common.schema";
import { lowerCaseTransformer } from 'src/utils/transformers/lower-case.transformer';

export class ResetPasswordDto {
    @ApiProperty({ example: `` })
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    Code: string;

    @ApiProperty({ example: `Email@gmail.com` })
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    @IsEmail({}, HandlesValidateMessage(HandlesValidateMessageEnums.IsEmail))
    @Transform(lowerCaseTransformer)
    Email: string = null;
}