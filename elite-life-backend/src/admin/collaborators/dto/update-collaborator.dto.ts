import { ApiProperty, } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { CreateCollaboratorDto } from './create-collaborator.dto';

export class UpdateCollaboratorDto extends (CreateCollaboratorDto) {
    Id: number = null;

    @ApiProperty({ required: false })
    @IsOptional()
    Password: string = null;

    @ApiProperty({ required: false })
    @IsOptional()
    RePassword: string = null;

    UserName: string = null;

    Image: string = null;
}
