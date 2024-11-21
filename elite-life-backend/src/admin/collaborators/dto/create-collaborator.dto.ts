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

export class CreateCollaboratorDto {
    @ApiProperty({ example: `Name${randomStringGenerator()}` })
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    Name: string = null;

    @ApiProperty({ example: `Email@gmail.com`, required: false })
    @IsOptional()
    @Transform(lowerCaseTransformer)
    Email: string = null;

    @ApiProperty({ example: `0123456798`, required: false })
    @IsOptional()
    @Transform(lowerCaseTransformer)
    Mobile: string = null;

    @ApiProperty({ required: false })
    @IsOptional()
    Address: string = null;

    @ApiProperty({ example: `0123456789`, required: false })
    @IsOptional()
    @Transform(lowerCaseTransformer)
    Identity: string = null;

    @ApiProperty({ example: `01/01/2000`, required: false })
    @IsOptional()
    @Transform((stringToDateTransformer))
    IdentityDate: Date = null;

    @ApiProperty({ example: `Hà Nội`, required: false })
    @IsOptional()
    IdentityPlace: string = null;

    BeginDate: Date | null = null;

    ContractNumber: string | null = null;

    @ApiProperty({ required: false })
    @IsOptional()
    @Transform(stringToNumberTransformer)
    Level: number | null = null;

    @ApiProperty({})
    @IsBoolean()
    @Transform((stringToBooleanTransformer))
    @IsOptional()
    IsRepOffice: boolean | null = null;

    @ApiProperty({ required: false })
    @IsNumber({}, HandlesValidateMessage(HandlesValidateMessageEnums.IsNumber))
    @IsOptional()
    @Transform(stringToNumberTransformer)
    ParentId: number | null = null;

    @ApiProperty({ required: false })
    @IsNumber({}, HandlesValidateMessage(HandlesValidateMessageEnums.IsNumber))
    @IsOptional()
    @Transform(stringToNumberTransformer)
    BankId: number | null = null;

    @ApiProperty({ required: false })
    @IsOptional()
    BankBranchName: string = null;

    @ApiProperty({ required: false })
    @IsOptional()
    BankOwner: string | null = null;

    @ApiProperty({ required: false })
    @IsOptional()
    BankNumber: string | null = null;

    @ApiProperty({ required: false })
    @IsOptional()
    Note: string | null = null;

    IsLock: boolean | null = null;

    @ApiProperty({ example: "123456" })
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    Password: string = null;

    @ApiProperty({ example: "123456" })
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    RePassword: string = null;

    @ApiProperty({ required: false, type: 'string', format: 'binary' })
    @IsOptional()
    File: Express.Multer.File | null = null;

    IsKyc: boolean | null = null;

    TimeKyc: Date | null = null;

    ElectronicContractId: number | null = null;

    @ApiProperty({ required: false })
    @IsOptional()
    NameSale: string = null;

    @ApiProperty({ required: false })
    @IsOptional()
    AddressSale: string = null;

    @ApiProperty({ required: false })
    @IsOptional()
    MobileSale: string = null;
}

export class BinaryCollaboratorDto {
    Id: number;
    Name: string;
    UserName?: string;
    Rank?: string;
    ParentId: number | null;
    IsGroup: boolean
}

export class SaleNode {
    name: string;
    attributes: {
        rank: string;
        index: number;
    };
    children: SaleNode[];
}

export class Record {
    Stt: number;
    Id: number;
    UserName: string;
    Rank: string;
    ParentId: number | null;
}