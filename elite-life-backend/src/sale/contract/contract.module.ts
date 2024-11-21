import { Module } from '@nestjs/common';
import { ContractService } from './contract.service';
import { ContractController } from './contract.controller';
import { Contracts } from 'src/database/entities/collaborator/contracts.entity';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterUploadModule } from 'src/utils/multer-helper';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([Contracts]),
    MulterUploadModule],
  controllers: [ContractController],
  providers: [ContractService],
})
export class ContractModule { }
