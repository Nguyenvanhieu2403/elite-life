import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNumber, IsOptional, IsPositive } from "class-validator";
import { stringToNumberTransformer } from "src/utils/transformers/string-to-number.transformer";
import { HandlesValidateMessage, HandlesValidateMessageEnums } from "src/utils/schemas/common.schema";

export class CreateAvailableDepositDto {
    @ApiProperty({ required: false, default: 0 })
    @IsNumber({}, HandlesValidateMessage(HandlesValidateMessageEnums.IsNumber))
    @Transform(stringToNumberTransformer)
    AvailableDeposit: number | null = null;

    @ApiProperty({ required: false, default: "Nạp" })
    @IsOptional()
    Note: string | null = null;
}