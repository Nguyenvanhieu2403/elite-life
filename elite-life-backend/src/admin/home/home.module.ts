import { Module } from '@nestjs/common';
import { HomeService } from './home.service';
import { HomeController } from './home.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Collaborators } from 'src/database/entities/collaborator/collaborators.entity';
import { UploadFilesService } from '../upload-files/upload-files.service';
import { UploadFiles } from 'src/database/entities/uploadFiles.entity';
import { UsersService } from '../users/users.service';
import { Users } from 'src/database/entities/user/users.entity';
import { CollaboratorsService } from '../collaborators/collaborators.service';
import { ProductsService } from '../products/products.service';
import { Products } from 'src/database/entities/products.entity';
import { BanksService } from '../banks/banks.service';
import { Banks } from 'src/database/entities/collaborator/banks.entity';
import { WalletsService } from '../wallets/wallets.service';
import { Wallets } from 'src/database/entities/collaborator/wallet.entity';
import { OrdersService } from '../orders/orders.service';
import { Orders } from 'src/database/entities/collaborator/order.entity';
import { BinaryTrees } from 'src/database/entities/collaborator/binaryTree.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Collaborators, Wallets, BinaryTrees, UploadFiles, Users, Collaborators, Products, Banks,
    Orders
  ])],
  controllers: [HomeController],
  providers: [HomeService, UploadFilesService, UsersService, CollaboratorsService, ProductsService, BanksService, WalletsService,
    OrdersService
  ],
})
export class HomeModule { }
