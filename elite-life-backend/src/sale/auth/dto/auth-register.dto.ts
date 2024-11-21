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
import { ApproveKYCTypeEnums, KYCTypeEnums } from "src/utils/enums.utils";

export class AuthRegisterDto {
    @ApiProperty({ example: `Name${randomStringGenerator()}` })
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    Name: string = null;

    @ApiProperty({ example: `Email@gmail.com` })
    @IsOptional()
    //@IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    //@IsEmail({}, HandlesValidateMessage(HandlesValidateMessageEnums.IsEmail))
    @Transform(lowerCaseTransformer)
    Email: string = null;

    @ApiProperty({ example: `0123456798` })
    @IsOptional()
    //@IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    @Transform(lowerCaseTransformer)
    Mobile: string = null;

    @ApiProperty({ required: false })
    @IsOptional()
    Address: string = null;

    @ApiProperty({ example: `0123456789` })
    @IsOptional()
    //@IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    @Transform(lowerCaseTransformer)
    Identity: string = null;

    @ApiProperty({ example: `01/01/2000` })
    @IsOptional()
    //@IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    @IsDate(HandlesValidateMessage(HandlesValidateMessageEnums.IsDate))
    @Transform((stringToDateTransformer))
    IdentityDate: Date = null;

    @ApiProperty({ example: `Hà Nội` })
    @IsOptional()
    //@IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    IdentityPlace: string = null;

    BeginDate: Date | null = null;

    @ApiProperty({ example: `EL001`, required: false })
    @IsOptional()
    ParentCode: string | null = null;

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

    IsLock: boolean | null = null;

    @ApiProperty({ example: "123456" })
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    Password: string = null;

    @ApiProperty({ example: "123456" })
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    RePassword: string = null;

    OrgId: number | null;

    IsKyc: boolean | null = null;

    TimeKyc: Date | null = null;

    @ApiProperty({ type: 'string', format: 'binary' })
    @IsOptional()
    File: Express.Multer.File | null = null;

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
export class AuthRegisterSaleDto {
    @ApiProperty({ type: 'string', format: 'binary' })
    @IsOptional()
    File: Express.Multer.File | null = null;
}
