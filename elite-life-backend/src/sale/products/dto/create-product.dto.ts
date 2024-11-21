import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional } from "class-validator";
import { HandlesValidateMessage, HandlesValidateMessageEnums } from "src/utils/schemas/common.schema";

export class CreateProductDto {
    @ApiProperty({})
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    Name: string;

    @ApiProperty({})
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    @IsNumber({}, HandlesValidateMessage(HandlesValidateMessageEnums.IsNumber))
    Price: number;

    @ApiProperty({})
    @IsOptional()
    @IsNumber({}, HandlesValidateMessage(HandlesValidateMessageEnums.IsNumber))
    DiscountPayPeriod1: number | null;

    @ApiProperty({})
    @IsOptional()
    @IsNumber({}, HandlesValidateMessage(HandlesValidateMessageEnums.IsNumber))
    DiscountPayPeriod2: number | null;

    @ApiProperty({})
    @IsOptional()
    @IsNumber({}, HandlesValidateMessage(HandlesValidateMessageEnums.IsNumber))
    DiscountPayPeriod3: number | null;

    @ApiProperty({ nullable: true })
    @IsOptional()
    @IsNumber({})
    ProjectId: number | null;
}
