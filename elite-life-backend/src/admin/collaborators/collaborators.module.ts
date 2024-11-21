import { Module } from '@nestjs/common';
import { Collaborators } from 'src/database/entities/collaborator/collaborators.entity';
import { CollaboratorsService } from './collaborators.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadFiles } from 'src/database/entities/uploadFiles.entity';
import { UploadFilesService } from '../upload-files/upload-files.service';
import { UsersService } from '../users/users.service';
import { Users } from 'src/database/entities/user/users.entity';
import { Banks } from 'src/database/entities/collaborator/banks.entity';
import { BanksService } from '../banks/banks.service';
import { FilesService } from '../files/files.service';
import { Files } from 'src/database/entities/files.entity';
import { MulterUploadModule } from 'src/utils/multer-helper';
import { CollaboratorsController } from './collaborators.controller';
import { UserActivitiesService } from '../user-activities/user-activities.service';
import { UserActivities } from 'src/database/entities/user/userActivities.entity';
import { OtherListsService } from '../other-lists/other-lists.service';
import { OtherLists } from 'src/database/entities/otherLists.entity';
import { OrdersService } from '../orders/orders.service';
import { Orders } from 'src/database/entities/collaborator/order.entity';
import { WalletDetailsService } from '../wallet-details/wallet-details.service';
import { WalletDetails } from 'src/database/entities/collaborator/walletDetail.entity';
import { WalletsService } from '../wallets/wallets.service';
import { Wallets } from 'src/database/entities/collaborator/wallet.entity';
import { BinaryTrees } from 'src/database/entities/collaborator/binaryTree.entity';
import { OrderDetailsService } from '../order-details/order-details.service';
import { OrderDetails } from 'src/database/entities/collaborator/orderDetail.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Collaborators, OrderDetails, UploadFiles, Users, Banks, Files, UserActivities, OtherLists, BinaryTrees, Orders, Wallets, WalletDetails]),
        MulterUploadModule
    ],
    controllers: [CollaboratorsController],
    providers: [CollaboratorsService, UploadFilesService, UsersService, BanksService, FilesService, UserActivitiesService, OtherListsService, OrdersService, WalletDetailsService, WalletsService, OrderDetailsService],
})
export class CollaboratorsModule {
}

