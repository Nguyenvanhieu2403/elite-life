import { Module } from '@nestjs/common';
import { OrderDetailsService } from './order-details.service';
import { OrderDetails } from 'src/database/entities/collaborator/orderDetail.entity';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterUploadModule } from 'src/utils/multer-helper';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([OrderDetails]),
    MulterUploadModule],
  controllers: [],
  providers: [OrderDetailsService],
})
export class OrderDetailsModule { }
