import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";
import { HandlesValidateMessage, HandlesValidateMessageEnums } from "src/utils/schemas/common.schema";
import { stringToDateTransformer } from "src/utils/transformers/string-to-date.transformer";
import { Transform } from "class-transformer";

export class UpdateCollaboratorSignDto {

    @ApiProperty({ required: true })
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    Name: string = null;

    @ApiProperty({ example: `0123456789`, required: true })
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    Identity: string = null;

    @ApiProperty({ example: `01/01/2000`, required: true })
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    @Transform((stringToDateTransformer))
    IdentityDate: Date = null;

    @ApiProperty({ example: `Hà Nội`, required: true })
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    IdentityPlace: string = null;

    @ApiProperty({ required: true })
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    Address: string = null;

    @ApiProperty({ type: 'string', format: 'binary', required: true })
    @IsOptional()
    ImageSign: Express.Multer.File | null = null;
}