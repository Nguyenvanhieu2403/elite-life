import { ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApplicationTypeEnums } from 'src/utils/enums.utils';
import { HandlesValidateMessage, HandlesValidateMessageEnums } from 'src/utils/schemas/common.schema';

export class UpdateUserDto {
    @ApiProperty({ example: 1 })
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    @IsNumber({}, HandlesValidateMessage(HandlesValidateMessageEnums.IsNumber))
    RoleId?: number;

    Permission?: string;

    ApplicationType: ApplicationTypeEnums
}
