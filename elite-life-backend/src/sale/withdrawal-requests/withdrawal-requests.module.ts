import { Module } from '@nestjs/common';
import { WithdrawalRequestsService } from './withdrawal-requests.service';
import { WithdrawalRequestsController } from './withdrawal-requests.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterUploadModule } from 'src/utils/multer-helper';
import { AuthGuard } from '@nestjs/passport';
import { WithdrawalRequests } from 'src/database/entities/collaborator/withdrawalRequests.entity';
import { UserActivitiesService } from '../user-activities/user-activities.service';
import { UserActivities } from 'src/database/entities/user/userActivities.entity';
import { BanksService } from '../banks/banks.service';
import { Banks } from 'src/database/entities/collaborator/banks.entity';
import { CollaboratorsService } from '../collaborators/collaborators.service';
import { Collaborators } from 'src/database/entities/collaborator/collaborators.entity';
import { UploadFiles } from 'src/database/entities/uploadFiles.entity';
import { UsersService } from '../users/users.service';
import { Users } from 'src/database/entities/user/users.entity';
import { Wallets } from 'src/database/entities/collaborator/wallet.entity';
import { WalletsService } from '../wallets/wallets.service';
import { Contracts } from 'src/database/entities/collaborator/contracts.entity';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([WithdrawalRequests, Collaborators, UserActivities, UploadFiles, Banks, Users, Wallets, Contracts]),
    MulterUploadModule],
  controllers: [WithdrawalRequestsController],
  providers: [WithdrawalRequestsService, BanksService, UserActivitiesService, CollaboratorsService, UsersService, WalletsService],
})
export class WithdrawalRequestsModule { }
