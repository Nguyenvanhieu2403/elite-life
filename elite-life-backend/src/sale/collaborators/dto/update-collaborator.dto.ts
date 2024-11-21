import { ApiProperty, } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { CreateCollaboratorDto } from './create-collaborator.dto';
import { HandlesValidateMessage, HandlesValidateMessageEnums } from 'src/utils/schemas/common.schema';
import { lowerCaseTransformer } from 'src/utils/transformers/lower-case.transformer';
import { Transform } from 'class-transformer';

export class UpdateCollaboratorDto extends (CreateCollaboratorDto) {
    Id: number = null;

    @ApiProperty({ example: `0123456798` })
    @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
    @Transform(lowerCaseTransformer)
    Mobile: string = null;

    @ApiProperty({ required: false })
    @IsOptional()
    BankNumber: string | null = null;

    UserName: string = null;

    Image: string = null;
}
