import { randomStringGenerator } from "@nestjs/common/utils/random-string-generator.util";
import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsDate, IsEmail, IsNotEmpty, IsNumber, IsOptional } from "class-validator";
import { cleanDataTransformer } from "src/utils/transformers/clean-data.transformer";
import { lowerCaseTransformer } from "src/utils/transformers/lower-case.transformer";
import { stringToNumberTransformer } from "src/utils/transformers/string-to-number.transformer";
import { HandlesValidateMessage, HandlesValidateMessageEnums } from "src/utils/schemas/common.schema";
import { stringToDateTransformer } from "src/utils/transformers/string-to-date.transformer";

export class ImportCollaboratorDto {
    Stt: number | null = null;

    ContractNumber: string | null = null;

    @ApiProperty({})
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    @Transform(cleanDataTransformer)
    Name: string | null = null;

    @ApiProperty({ example: `Identity${randomStringGenerator()}` })
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    @Transform(cleanDataTransformer)
    Identity: string | null = null;

    @ApiProperty({ example: `01/01/2000` })
    @IsDate(HandlesValidateMessage(HandlesValidateMessageEnums.IsDate))
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    @Transform(cleanDataTransformer)
    @Transform((stringToDateTransformer))
    IdentityDate: Date = null;

    @ApiProperty({ example: `IdentityPlace${randomStringGenerator()}` })
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    @Transform(cleanDataTransformer)
    IdentityPlace: string = null;

    @ApiProperty({})
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    @IsEmail({}, HandlesValidateMessage(HandlesValidateMessageEnums.IsEmail))
    @Transform(cleanDataTransformer)
    @Transform(lowerCaseTransformer)
    Email: string = null;

    @ApiProperty({ example: `Mobile${randomStringGenerator()}` })
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    @Transform(cleanDataTransformer)
    Mobile: string = null;

    @ApiProperty({})
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    @Transform(cleanDataTransformer)
    ParentCode: string = null;

    @ApiProperty({ example: 1 })
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    @IsNumber({}, HandlesValidateMessage(HandlesValidateMessageEnums.IsNumber))
    @Transform(cleanDataTransformer)
    @Transform(stringToNumberTransformer)
    BankNumber: string | null = null;

    @ApiProperty({})
    @IsOptional()
    @Transform(cleanDataTransformer)
    BankOwner: string | null = null;

    @ApiProperty({})
    @IsOptional()
    @Transform(cleanDataTransformer)
    BankName: string | null = null;

    @ApiProperty({})
    @IsOptional()
    @Transform(cleanDataTransformer)
    BankBranchName: string | null = null;

    @ApiProperty({})
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    @Transform(cleanDataTransformer)
    Password: string | null = null;

    @ApiProperty({})
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    @Transform(cleanDataTransformer)
    RankName: string | null = null;

    @ApiProperty({ example: 1 })
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    @IsNumber({}, HandlesValidateMessage(HandlesValidateMessageEnums.IsNumber))
    @Transform(cleanDataTransformer)
    @Transform(stringToNumberTransformer)
    BankId: number | null = null;

    @ApiProperty({ example: 1 })
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    @IsNumber({}, HandlesValidateMessage(HandlesValidateMessageEnums.IsNumber))
    @Transform(cleanDataTransformer)
    @Transform(stringToNumberTransformer)
    RankId: number | null = null;

    RowNumber: number | null;

    BeginDate: Date | null;

    Id: number;

    ParentId: number | null = null;
}