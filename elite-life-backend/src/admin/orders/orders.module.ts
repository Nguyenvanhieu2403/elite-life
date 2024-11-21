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
import { WalletDetailsService } from '../wallet-details/wallet-details.service';
import { WalletDetails } from 'src/database/entities/collaborator/walletDetail.entity';
import { OrderDetailsService } from '../order-details/order-details.service';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([Orders, OrderPays, OrderDetails, WalletDetails, OrderDetails, BinaryTrees, UserActivities]),
    MulterUploadModule],
  controllers: [OrdersController],
  providers: [OrdersService, WalletDetailsService, OrderDetailsService, UserActivitiesService, AuthGuard('jwt-admin')],
})
export class OrdersModule { }
