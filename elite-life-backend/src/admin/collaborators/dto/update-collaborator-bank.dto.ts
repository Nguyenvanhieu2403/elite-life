import { ApiProperty } from "@nestjs/swagger";
import { IsEmpty, IsNumber, IsOptional } from "class-validator";
import { stringToNumberTransformer } from "src/utils/transformers/string-to-number.transformer";
import { Transform } from "class-transformer";
import { HandlesValidateMessage, HandlesValidateMessageEnums } from "src/utils/schemas/common.schema";

export class UpdateBankDto {
    Id: number = null;

    @ApiProperty({ required: false })
    @IsNumber({}, HandlesValidateMessage(HandlesValidateMessageEnums.IsNumber))
    @IsOptional()
    @Transform(stringToNumberTransformer)
    BankId: number | null = null;

    @ApiProperty({ required: false, default: "Đội Cấn,Hà Nội" })
    @IsOptional()
    BankBranchName: string = null;

    @ApiProperty({ required: false, default: "Nguyễn Văn A" })
    @IsOptional()
    BankOwner: string | null = null;

    @ApiProperty({ required: false, default: "123456789" })
    @IsOptional()
    BankNumber: string | null = null;
}