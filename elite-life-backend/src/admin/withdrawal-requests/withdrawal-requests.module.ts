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
import { Wallets } from 'src/database/entities/collaborator/wallet.entity';
import { WalletDetails } from 'src/database/entities/collaborator/walletDetail.entity';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([WithdrawalRequests, UserActivities, Banks, Wallets, WalletDetails]),
    MulterUploadModule],
  controllers: [WithdrawalRequestsController],
  providers: [WithdrawalRequestsService, UserActivitiesService, BanksService, AuthGuard('jwt-admin')],
})
export class WithdrawalRequestsModule { }
