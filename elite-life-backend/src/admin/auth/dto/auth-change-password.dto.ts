import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength, Validate } from 'class-validator';
import { IsExist } from 'src/utils/validators/is-exists.validator';
import { Expose, Transform } from 'class-transformer';
import { lowerCaseTransformer } from 'src/utils/transformers/lower-case.transformer';
import { HandlesValidateMessage, HandlesValidateMessageEnums } from "src/utils/schemas/common.schema";

export class AuthChangePasswordDto {
  Id: number;

  @ApiProperty({ example: '123456' })
  @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
  Password: string;

  @ApiProperty({ example: '123456' })
  @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
  NewPassword: string;

  @ApiProperty({ example: '123456' })
  @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
  ReNewPassword: string;
}
