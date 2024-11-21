import { Module } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { WalletsController } from './wallets.controller';
import { Wallets } from 'src/database/entities/collaborator/wallet.entity';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterUploadModule } from 'src/utils/multer-helper';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([Wallets]),
    MulterUploadModule],
  controllers: [WalletsController],
  providers: [WalletsService],
})
export class WalletsModule { }
