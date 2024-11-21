import { randomStringGenerator } from "@nestjs/common/utils/random-string-generator.util";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmpty, IsEnum, IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString } from "class-validator";
import { OtherListTypeEnums } from "src/utils/enums.utils";
import { cleanDataTransformer } from "src/utils/transformers/clean-data.transformer";
import { upperCaseTransformer } from "src/utils/transformers/upper-case.transformer";
import { HandlesValidateMessage, HandlesValidateMessageEnums } from "src/utils/schemas/common.schema";

export class CreateOtherListDto {
    @ApiProperty({ example: Object.keys(OtherListTypeEnums).join("|"), enum: OtherListTypeEnums })
    @IsEnum(OtherListTypeEnums, { message: 'Invalid category' })
    Type: OtherListTypeEnums;

    @ApiProperty({ example: `Code${randomStringGenerator()}` })
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    @Transform(upperCaseTransformer)
    Code: string;

    @ApiProperty({ example: `Name${randomStringGenerator()}` })
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    Name: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber({}, HandlesValidateMessage(HandlesValidateMessageEnums.IsNumber))
    Number1?: number | null;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber({}, HandlesValidateMessage(HandlesValidateMessageEnums.IsNumber))
    Number2?: number | null;

    @ApiProperty({ required: false })
    @IsOptional()
    String1?: string | null;

    @ApiProperty({ required: false })
    @IsOptional()
    String2?: string | null;

    @ApiProperty({ required: false })
    @IsOptional()
    Note?: string | null;

    @ApiProperty({ example: 999, required: false })
    @IsOptional()
    @IsNumber({}, HandlesValidateMessage(HandlesValidateMessageEnums.IsNumber))
    Ord: number | null;
}
