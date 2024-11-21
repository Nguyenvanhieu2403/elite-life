import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, MinLength, Validate } from 'class-validator';
import { HandlesValidateMessage, HandlesValidateMessageEnums } from "src/utils/schemas/common.schema";
import { lowerCaseTransformer } from 'src/utils/transformers/lower-case.transformer';

export class AuthLoginDto {
  Id: number

  @ApiProperty({ example: 'EI1051' })
  @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
  UserName: string;

  @ApiProperty({ example: '123456' })
  @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
  Password: string;
}
