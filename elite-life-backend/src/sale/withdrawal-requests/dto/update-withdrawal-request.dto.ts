import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateWithdrawalRequestDto } from './create-withdrawal-request.dto';
import { IsEnum } from 'class-validator';
import { WithdrawalStatusEnums } from 'src/utils/enums.utils';

export class UpdateWithdrawalRequestDto {
    @ApiProperty({ example: Object.keys(WithdrawalStatusEnums).join("|"), enum: WithdrawalStatusEnums })
    @IsEnum(WithdrawalStatusEnums, { message: 'Invalid category' })
    Status: WithdrawalStatusEnums;

}