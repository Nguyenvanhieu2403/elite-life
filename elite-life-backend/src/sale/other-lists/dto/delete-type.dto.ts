import { randomStringGenerator } from "@nestjs/common/utils/random-string-generator.util";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmpty, IsEnum, IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString } from "class-validator";
import { OtherListTypeEnums } from "src/utils/enums.utils";
import { cleanDataTransformer } from "src/utils/transformers/clean-data.transformer";
import { upperCaseTransformer } from "src/utils/transformers/upper-case.transformer";
import { HandlesValidateMessage, HandlesValidateMessageEnums } from "src/utils/schemas/common.schema";

export class DeleteTypeDto {

    @ApiProperty({ example: Object.keys(OtherListTypeEnums).join("|"), enum: OtherListTypeEnums })
    @IsEnum(OtherListTypeEnums, { message: 'Invalid category' })
    Type: OtherListTypeEnums;
}