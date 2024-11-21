import { Module } from '@nestjs/common';
import { OrderPaysService } from './order-pays.service';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterUploadModule } from 'src/utils/multer-helper';
import { OrderPays } from 'src/database/entities/collaborator/orderPay.entity';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([OrderPays
    ]),
    MulterUploadModule
  ],
  controllers: [],
  providers: [OrderPaysService],
})
export class OrderPaysModule { }
