import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserSaleDto } from './create-user-sale.dto';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { IsNotEmpty, IsOptional, IsNumber, IsEmail } from 'class-validator';
import { ApplicationTypeEnums } from 'src/utils/enums.utils';
import { HandlesValidateMessage, HandlesValidateMessageEnums } from 'src/utils/schemas/common.schema';
import { lowerCaseTransformer } from 'src/utils/transformers/lower-case.transformer';
import { Transform } from 'class-transformer';

export class UpdateUserSaleDto {

    @ApiProperty({ example: 1 })
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    @IsNumber({}, HandlesValidateMessage(HandlesValidateMessageEnums.IsNumber))
    RoleId?: number;

    Permission?: string;

    ApplicationType: ApplicationTypeEnums
}
