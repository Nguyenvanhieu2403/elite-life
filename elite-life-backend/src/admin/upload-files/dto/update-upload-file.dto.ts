import { ApiProperty, } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { CreateUploadFileDto } from './create-upload-file.dto';

export class UpdateUploadFileDto extends (CreateUploadFileDto) {
}
