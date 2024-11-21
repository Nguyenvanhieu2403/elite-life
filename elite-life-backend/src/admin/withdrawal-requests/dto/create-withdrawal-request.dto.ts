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

    @ApiProperty({ required: false })
    @IsNumber({}, HandlesValidateMessage(HandlesValidateMessageEnums.IsNumber))
    @IsOptional()
    @Transform(stringToNumberTransformer)
    CollaboratorId: number | null = null;

    @ApiProperty({ example: `0123456789` })
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    @Transform(lowerCaseTransformer)
    BankNumber: string | null;

    @ApiProperty({ example: `Name${randomStringGenerator()}` })
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    BankOwner: string | null;

    @ApiProperty({ required: false })
    @IsNumber({}, HandlesValidateMessage(HandlesValidateMessageEnums.IsNumber))
    @IsOptional()
    @Transform(stringToNumberTransformer)
    BankId: number | null;

    @ApiProperty({ required: false })
    @IsOptional()
    BankBranchName: string;

    @ApiProperty({ required: false, default: 0 })
    @IsNumber({}, HandlesValidateMessage(HandlesValidateMessageEnums.IsNumber))
    @IsOptional()
    @Transform(stringToNumberTransformer)
    WithdrawalAmount: number; // lưu số tiền rút

    @ApiProperty({ required: false })
    @IsOptional()
    Note: string | null;

    Status: WithdrawalStatusEnums;

    @ApiProperty({ required: false })
    @IsOptional()
    NoteRejection: string | null;

    @ApiProperty({ type: 'string', format: 'binary', required: false })
    @IsOptional()
    Image: Express.Multer.File | null = null;

}
