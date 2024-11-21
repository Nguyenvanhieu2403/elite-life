import { ComboData } from "src/utils/schemas/common.schema";
import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsPositive } from "class-validator";
import { Transform } from "class-transformer";
import { stringToDateTransformer } from "src/utils/transformers/string-to-date.transformer";
import { HandlesValidateMessage, HandlesValidateMessageEnums } from "src/utils/schemas/common.schema";

export class PayOrderDto {

    constructor(partial: Partial<PayOrderDto>) {
        Object.assign(this, partial);
    }

    OrderId: number | null;

    @ApiProperty({ example: "01/01/2023" })
    @IsDate(HandlesValidateMessage(HandlesValidateMessageEnums.IsDate))
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    @Transform(stringToDateTransformer)
    PayDate: Date | null;

    @ApiProperty({ example: 0 })
    @IsNumber({}, HandlesValidateMessage(HandlesValidateMessageEnums.IsNumber))
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    @IsPositive(HandlesValidateMessage(HandlesValidateMessageEnums.IsPositive))
    Value: number | null;

    @ApiProperty({ example: `` })
    @IsOptional()
    Note: string = null;

    @ApiProperty({ example: 1 })
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    @IsNumber({}, HandlesValidateMessage(HandlesValidateMessageEnums.IsNumber))
    ProductId?: number;

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

export class UpdateDeliverySaleDto {
    @ApiProperty({ example: `` })
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    NameSale: string = null;

    @ApiProperty({ example: `` })
    @IsOptional()
    AddressSale: string = null;

    @ApiProperty({ example: `` })
    @IsOptional()
    MobileSale: string = null;
}