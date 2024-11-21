import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEnum, IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString } from "class-validator";
import { OtherListTypeEnums } from "src/utils/enums.utils";
import { cleanDataTransformer } from "src/utils/transformers/clean-data.transformer";
import { stringToNumberTransformer } from "src/utils/transformers/string-to-number.transformer";
import { upperCaseTransformer } from "src/utils/transformers/upper-case.transformer";
import { HandlesValidateMessage, HandlesValidateMessageEnums } from "src/utils/schemas/common.schema";

export class ImportOtherListDto {
    Type: OtherListTypeEnums = null;

    @ApiProperty({})
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    @Transform(cleanDataTransformer)
    @Transform(upperCaseTransformer)
    Code: string = null;

    @ApiProperty({})
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    @Transform(cleanDataTransformer)
    Name: string = null;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber({}, HandlesValidateMessage(HandlesValidateMessageEnums.IsNumber))
    @Transform(cleanDataTransformer)
    @Transform(stringToNumberTransformer)
    Number1?: number | null = null;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber({}, HandlesValidateMessage(HandlesValidateMessageEnums.IsNumber))
    @Transform(cleanDataTransformer)
    @Transform(stringToNumberTransformer)
    Number2?: number | null = null;

    @ApiProperty({ required: false })
    @IsOptional()
    @Transform(cleanDataTransformer)
    String1?: string | null = null;

    @ApiProperty({ required: false })
    @IsOptional()
    @Transform(cleanDataTransformer)
    String2?: string | null = null;

    @ApiProperty({ required: false })
    @IsOptional()
    @Transform(cleanDataTransformer)
    Note?: string | null = null;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber({}, HandlesValidateMessage(HandlesValidateMessageEnums.IsNumber))
    @Transform(cleanDataTransformer)
    @Transform(stringToNumberTransformer)
    Ord: number | null = null;
}
