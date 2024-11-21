import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsArray, IsOptional } from "class-validator";
import { convertNumeric } from "src/utils/transformers/string-to-number.transformer";
import { Transform, Type } from "class-transformer";
import { HandlesValidateMessage, HandlesValidateMessageEnums } from "src/utils/schemas/common.schema";

export class UploadCollaboratorDto {
    @ApiProperty({
        type: 'array',
        items: {
            type: 'number'
        },
        example: [1],

    })
    @Transform(({ value }) =>
        Array.isArray(value) ?
            value.map(s => convertNumeric(s)) :
            value.split(",")
                .map(s => s == undefined ? null : convertNumeric(s))
    )
    @IsNumber({}, HandlesValidateMessage(HandlesValidateMessageEnums.IsNumber, { each: true }))
    @IsArray(HandlesValidateMessage(HandlesValidateMessageEnums.IsArray))
    FileIds: number[] = null;

    @ApiProperty({ type: 'string', format: 'binary', isArray: true })
    @IsOptional()
    Files: Express.Multer.File[] | null = null;
}

export class MailMergeDto {
    @ApiProperty({ type: 'string', format: 'binary', isArray: true })
    @IsOptional()
    FileTemp: Express.Multer.File | null = null;

    @ApiProperty({ type: 'string', format: 'binary', isArray: true })
    @IsOptional()
    FileOutPut: Express.Multer.File | null = null;
}