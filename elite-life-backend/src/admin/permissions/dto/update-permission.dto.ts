import { ApiProperty, } from '@nestjs/swagger';
import { CreatePermissionDto } from './create-permission.dto';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { OtherLists } from 'src/database/entities/otherLists.entity';
import { HandlesValidateMessage, HandlesValidateMessageEnums } from 'src/utils/schemas/common.schema';

export class UpdatePermissionDto {
      @ApiProperty({})
      @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
      Code: string | null;

      @ApiProperty({})
      @IsNotEmpty(HandlesValidateMessage(HandlesValidateMessageEnums.IsNotEmpty))
      Name: string | null;

      @ApiProperty({})
      @IsOptional()
      Action: string | null;

      @ApiProperty({})
      @IsOptional()
      Controller: string | null;

}
