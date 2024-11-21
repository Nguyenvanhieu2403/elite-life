import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive } from "class-validator";
import { stringToNumberTransformer } from "src/utils/transformers/string-to-number.transformer";
import { HandlesValidateMessage, HandlesValidateMessageEnums } from "src/utils/schemas/common.schema";
import { WalletTypeEnums } from "src/utils/enums.utils";

export class CreateAvailableDepositDto {
    @ApiProperty({ required: true, default: 0 })
    @IsNumber({}, HandlesValidateMessage(HandlesValidateMessageEnums.IsNumber))
    @IsOptional()
    @Transform(stringToNumberTransformer)
    AvailableDeposit: number | null = null;

}

export class PersonalMoneyTransferDto {

    @ApiProperty({ required: true })
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    @IsEnum(WalletTypeEnums)
    WalletTypeFrom: WalletTypeEnums

    @ApiProperty({ required: true })
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    @IsPositive(HandlesValidateMessage(HandlesValidateMessageEnums.IsPositive))
    @IsNumber({}, HandlesValidateMessage(HandlesValidateMessageEnums.IsNumber))
    Available: number | null = null;

}

export class InternalTransferDto {

    @ApiProperty({ required: true })
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    CollaboratorCode?: string | null = null;

    @ApiProperty({ required: true })
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    @IsPositive(HandlesValidateMessage(HandlesValidateMessageEnums.IsPositive))
    @IsNumber({}, HandlesValidateMessage(HandlesValidateMessageEnums.IsNumber))
    Available: number | null = null;
}