import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateWithdrawalRequestDto } from './create-withdrawal-request.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { WithdrawalStatusEnums } from 'src/utils/enums.utils';

export class RejectWithdrawalRequestDto {
    Status: WithdrawalStatusEnums;

    Image: Express.Multer.File | null = null;

    @ApiProperty({ required: false })
    @IsOptional()
    NoteRejection: string | null;

    Note: string | null;

    Tax: number | null;

    ActualNumberReceived: number | null;

}