import { Module } from '@nestjs/common';
import { WalletDetailsService } from './wallet-details.service';
import { WalletDetails } from 'src/database/entities/collaborator/walletDetail.entity';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterUploadModule } from 'src/utils/multer-helper';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([WalletDetails]),
    MulterUploadModule],
  controllers: [],
  providers: [WalletDetailsService],
})
export class WalletDetailsModule { }
