import { PartialType } from '@nestjs/swagger';
import { CreateOrderPayDto } from './create-order-pay.dto';

export class UpdateOrderPayDto extends PartialType(CreateOrderPayDto) {}
