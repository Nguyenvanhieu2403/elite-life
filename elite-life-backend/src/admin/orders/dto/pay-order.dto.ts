import { ComboData } from "src/utils/schemas/common.schema";
import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional } from "class-validator";
import { Transform } from "class-transformer";
import { stringToDateTransformer } from "src/utils/transformers/string-to-date.transformer";
import { HandlesValidateMessage, HandlesValidateMessageEnums } from "src/utils/schemas/common.schema";
import { stringToBooleanTransformer } from "src/utils/transformers/string-to-boolean.transformer";

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
    Value: number | null;

    @ApiProperty({ example: `` })
    @IsOptional()
    Note: string = null;

}

export class DeliveryOrderDto {

    IsDelivered: boolean | null = null;

    @ApiProperty({ example: `01/01/2000` })
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    @IsDate(HandlesValidateMessage(HandlesValidateMessageEnums.IsDate))
    @Transform((stringToDateTransformer))
    DeliveryDate: Date = null;

}
