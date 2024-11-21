import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Collaborators } from 'src/database/entities/collaborator/collaborators.entity';
import { Users } from 'src/database/entities/user/users.entity';
import RolePermissions from 'src/database/entities/user/rolePermisions.entity';
import { ProcessOrder } from './process-order.task';
import { Orders } from 'src/database/entities/collaborator/order.entity';
import { OrderPays } from 'src/database/entities/collaborator/orderPay.entity';
import { Wallets } from 'src/database/entities/collaborator/wallet.entity';
import { Products } from 'src/database/entities/products.entity';
import { OrderDetails } from 'src/database/entities/collaborator/orderDetail.entity';
import { UserActivities } from 'src/database/entities/user/userActivities.entity';
import { BinaryTrees } from 'src/database/entities/collaborator/binaryTree.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Orders, Products, OrderPays, Wallets, RolePermissions, Collaborators, Users, OrderDetails, BinaryTrees, UserActivities])
  ],
  controllers: [
  ],
  providers: [TasksService, ProcessOrder],
})
export class TasksModule { }
