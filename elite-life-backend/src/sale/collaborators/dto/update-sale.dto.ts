import { ApiProperty, } from '@nestjs/swagger';
import { IsDate, IsEmail, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { CreateCollaboratorDto } from './create-collaborator.dto';
import { HandlesValidateMessage, HandlesValidateMessageEnums } from 'src/utils/schemas/common.schema';
import { lowerCaseTransformer } from 'src/utils/transformers/lower-case.transformer';
import { Transform } from 'class-transformer';
import { stringToNumberTransformer } from 'src/utils/transformers/string-to-number.transformer';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { stringToDateTransformer } from 'src/utils/transformers/string-to-date.transformer';

export class UpdateSaleDto {
    Id: number = null;

    @ApiProperty({ example: `Name${randomStringGenerator()}` })
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    Name: string = null;

    @ApiProperty({ example: `Email@gmail.com`, required: false })
    @IsOptional()
    //@IsEmail({}, HandlesValidateMessage(HandlesValidateMessageEnums.IsEmail))
    @Transform(lowerCaseTransformer)
    Email: string = null;

    @ApiProperty({ example: `0123456789`, required: false })
    @Transform(lowerCaseTransformer)
    @IsOptional()
    Identity: string = null;

    @ApiProperty({ example: `01/01/2000`, required: false })
    @Transform((stringToDateTransformer))
    @IsOptional()
    IdentityDate: Date = null;

    @ApiProperty({ example: `Hà Nội`, required: false })
    @IsOptional()
    IdentityPlace: string = null;

    @ApiProperty({ example: `0123456798`, required: false })
    @Transform(lowerCaseTransformer)
    @IsOptional()
    Mobile: string = null;

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
    Password: string = null;

    @ApiProperty({ required: false })
    @IsOptional()
    RePassword: string = null;

    UserName: string = null;

    Image: string = null;

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
