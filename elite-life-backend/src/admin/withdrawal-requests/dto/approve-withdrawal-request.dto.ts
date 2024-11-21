import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateWithdrawalRequestDto } from './create-withdrawal-request.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { WithdrawalStatusEnums } from 'src/utils/enums.utils';

export class ApproveWithdrawalRequestDto {
    Status: WithdrawalStatusEnums;

    @ApiProperty({ type: 'string', format: 'binary', required: false })
    @IsOptional()
    Image: Express.Multer.File | null = null;

    NoteRejection: string | null;

    @ApiProperty({ required: false })
    @IsOptional()
    Note: string | null;

    Tax: number | null;

    ActualNumberReceived: number | null;
}