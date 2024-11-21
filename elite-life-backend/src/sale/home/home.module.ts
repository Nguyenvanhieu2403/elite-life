import { Module } from '@nestjs/common';
import { HomeController } from './home.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Collaborators } from 'src/database/entities/collaborator/collaborators.entity';
import { Users } from 'src/database/entities/user/users.entity';
import { CollaboratorsService } from '../collaborators/collaborators.service';
import { UsersService } from '../users/users.service';
import { UploadFilesService } from '../upload-files/upload-files.service';
import { UploadFiles } from 'src/database/entities/uploadFiles.entity';
import { Files } from 'src/database/entities/files.entity';
import { FilesService } from '../files/files.service';
import { WalletDetailsService } from '../wallet-details/wallet-details.service';
import { WalletDetails } from 'src/database/entities/collaborator/walletDetail.entity';
import { UserActivitiesService } from '../user-activities/user-activities.service';
import { UserActivities } from 'src/database/entities/user/userActivities.entity';
import { Contracts } from 'src/database/entities/collaborator/contracts.entity';
import { WalletsService } from '../wallets/wallets.service';
import { Wallets } from 'src/database/entities/collaborator/wallet.entity';
import { OrdersService } from '../orders/orders.service';
import { Orders } from 'src/database/entities/collaborator/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Collaborators, Users, Orders,
    UploadFiles, Files, WalletDetails, UserActivities, Contracts, Wallets
  ])],
  controllers: [HomeController],
  providers: [
    CollaboratorsService, UploadFilesService,
    UsersService,
    FilesService, UploadFilesService, WalletDetailsService, UserActivitiesService, WalletsService, OrdersService],
})
export class HomeModule { }
