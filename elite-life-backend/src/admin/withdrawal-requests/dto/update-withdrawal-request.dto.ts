import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateWithdrawalRequestDto } from './create-withdrawal-request.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { WithdrawalStatusEnums } from 'src/utils/enums.utils';

export class UpdateWithdrawalRequestDto {
    @ApiProperty({ example: Object.keys(WithdrawalStatusEnums).join("|"), enum: WithdrawalStatusEnums })
    @IsEnum(WithdrawalStatusEnums, { message: 'Invalid category' })
    Status: WithdrawalStatusEnums;

    @ApiProperty({ type: 'string', format: 'binary', required: false })
    @IsOptional()
    Image: Express.Multer.File | null = null;

    @ApiProperty({ required: false })
    @IsOptional()
    NoteRejection: string | null;

    @ApiProperty({ required: false })
    @IsOptional()
    Note: string | null;

    Tax: number | null;

    ActualNumberReceived: number | null;

}