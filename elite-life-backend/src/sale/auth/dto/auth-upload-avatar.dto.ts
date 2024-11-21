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

export class AuthUploadAvatarDto {
    Id: number

    @ApiProperty({ type: 'string', format: 'binary' })
    @IsOptional()
    File: Express.Multer.File | null = null;
}
