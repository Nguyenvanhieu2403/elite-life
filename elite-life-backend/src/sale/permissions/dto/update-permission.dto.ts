import { ApiProperty, } from '@nestjs/swagger';
import { CreatePermissionDto } from './create-permission.dto';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { OtherLists } from 'src/database/entities/otherLists.entity';

export class UpdatePermissionDto {
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
