import { } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateProductDto extends (CreateProductDto) {
}
