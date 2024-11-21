import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthGuard } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { MulterUploadModule } from 'src/utils/multer-helper';
import { UserActivities } from 'src/database/entities/user/userActivities.entity';
import { UserActivitiesService } from '../user-activities/user-activities.service';
import { Orders } from 'src/database/entities/collaborator/order.entity';
import { OrderPays } from 'src/database/entities/collaborator/orderPay.entity';
import { OrderDetails } from 'src/database/entities/collaborator/orderDetail.entity';
import { BinaryTrees } from 'src/database/entities/collaborator/binaryTree.entity';
import { OrdersController } from './orders.controller';
import { ProductsService } from '../products/products.service';
import { Products } from 'src/database/entities/products.entity';
import { OrderPaysService } from '../order-pays/order-pays.service';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([Orders, OrderPays, Products, OrderPays, OrderDetails, BinaryTrees, UserActivities]),
    MulterUploadModule],
  controllers: [OrdersController],
  providers: [OrdersService, ProductsService, OrderPaysService, UserActivitiesService, AuthGuard('jwt-sale')],
})
export class OrdersModule { }
