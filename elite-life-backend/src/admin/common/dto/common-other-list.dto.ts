import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, MinLength, Validate } from 'class-validator';
import { IsExist } from 'src/utils/validators/is-exists.validator';
import { Expose, Transform } from 'class-transformer';
import { lowerCaseTransformer } from 'src/utils/transformers/lower-case.transformer';
import { OtherListTypeEnums } from 'src/utils/enums.utils';
import { HandlesValidateMessage, HandlesValidateMessageEnums } from "src/utils/schemas/common.schema";

export class CommonOtherList {
  @ApiProperty({ example: Object.keys(OtherListTypeEnums), enum: OtherListTypeEnums })
  @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
  @IsEnum(OtherListTypeEnums)
  @Transform(lowerCaseTransformer)
  Types: OtherListTypeEnums[];

}
