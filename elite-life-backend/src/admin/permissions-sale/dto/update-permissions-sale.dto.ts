import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreatePermissionsSaleDto } from './create-permissions-sale.dto';
import { IsOptional } from 'class-validator';

export class UpdatePermissionsSaleDto {
    @ApiProperty({})
    @IsOptional()
    Code: string | null;

    @ApiProperty({})
    @IsOptional()
    Name: string | null;

    @ApiProperty({})
    @IsOptional()
    Action: string | null;

    @ApiProperty({})
    @IsOptional()
    Controller: string | null;

}
