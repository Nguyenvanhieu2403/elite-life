import { ApiProperty } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';
import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';
import { stringToBooleanTransformer } from 'src/utils/transformers/string-to-boolean.transformer';
import { Transform } from 'class-transformer';

export class UpdateProductDto extends (CreateProductDto) {
}
