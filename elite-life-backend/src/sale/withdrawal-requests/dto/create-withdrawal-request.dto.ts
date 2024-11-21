import { randomStringGenerator } from "@nestjs/common/utils/random-string-generator.util";
import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsNotEmpty } from "class-validator";
import { WithdrawalStatusEnums } from "src/utils/enums.utils";
import { HandlesValidateMessage, HandlesValidateMessageEnums } from "src/utils/schemas/common.schema";
import { lowerCaseTransformer } from "src/utils/transformers/lower-case.transformer";
import { stringToNumberTransformer } from "src/utils/transformers/string-to-number.transformer";
import { Transform } from "class-transformer";

export class CreateWithdrawalRequestDto {
    Code: string;

    CollaboratorId: number | null = null;

    @ApiProperty({ example: `0123456789` })
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    BankNumber: string | null;

    @ApiProperty({ example: `Name${randomStringGenerator()}` })
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    BankOwner: string | null;

    @ApiProperty({ required: true })
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    @IsNumber({}, HandlesValidateMessage(HandlesValidateMessageEnums.IsNumber))
    @Transform(stringToNumberTransformer)
    BankId: number | null;

    @ApiProperty({ required: false })
    @IsOptional()
    BankBranchName: string;

    @ApiProperty({ required: true, default: 0 })
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    @IsNumber({}, HandlesValidateMessage(HandlesValidateMessageEnums.IsNumber))
    @Transform(stringToNumberTransformer)
    WithdrawalAmount: number; // lưu số tiền rút

    Status: WithdrawalStatusEnums;

    Tax: number | null;

    ActualNumberReceived: number | null;

}
