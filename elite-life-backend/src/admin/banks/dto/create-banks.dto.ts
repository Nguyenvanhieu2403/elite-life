import { randomStringGenerator } from "@nestjs/common/utils/random-string-generator.util";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsBooleanString, IsDate, IsEmail, IsEmpty, IsNotEmpty, IsNumber, IsOptional, IsString, MinLength, isEmpty } from "class-validator";
import { timeStamp } from "console";
import { lowerCaseTransformer } from "src/utils/transformers/lower-case.transformer";
import { stringToBooleanTransformer } from "src/utils/transformers/string-to-boolean.transformer";
import { stringToDateTransformer } from "src/utils/transformers/string-to-date.transformer";
import { stringToNumberTransformer } from "src/utils/transformers/string-to-number.transformer";
import { HandlesValidateMessage, HandlesValidateMessageEnums } from "src/utils/schemas/common.schema";

export class CreateBanksDto {
    @ApiProperty({ example: `Name${randomStringGenerator()}` })
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    Name: string = null;

    @ApiProperty({ required: false, default: 0 })
    @IsNumber({}, HandlesValidateMessage(HandlesValidateMessageEnums.IsNumber))
    @IsOptional()
    OrderNo: number | null = null;

}
