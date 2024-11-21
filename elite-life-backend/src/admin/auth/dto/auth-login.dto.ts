import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength, Validate } from 'class-validator';
import { IsExist } from 'src/utils/validators/is-exists.validator';
import { Expose, Transform } from 'class-transformer';
import { lowerCaseTransformer } from 'src/utils/transformers/lower-case.transformer';
import { HandlesValidateMessage, HandlesValidateMessageEnums } from "src/utils/schemas/common.schema";

export class AuthLoginDto {
  Id: number

  @ApiProperty({ example: 'admin' })
  @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
  @Transform(lowerCaseTransformer)
  UserName: string;

  @ApiProperty({ example: '123456' })
  @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
  Password: string;

  RoleId: number
}
