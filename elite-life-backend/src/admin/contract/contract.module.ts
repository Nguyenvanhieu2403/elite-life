import { Module } from '@nestjs/common';
import { ContractService } from './contract.service';
import { ContractController } from './contract.controller';
import { Contracts } from 'src/database/entities/collaborator/contracts.entity';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterUploadModule } from 'src/utils/multer-helper';
import { CollaboratorsService } from '../collaborators/collaborators.service';
import { Collaborators } from 'src/database/entities/collaborator/collaborators.entity';
import { UsersService } from '../users/users.service';
import { Users } from 'src/database/entities/user/users.entity';
import { UploadFiles } from 'src/database/entities/uploadFiles.entity';
import { BanksService } from '../banks/banks.service';
import { Banks } from 'src/database/entities/collaborator/banks.entity';
import { BinaryTrees } from 'src/database/entities/collaborator/binaryTree.entity';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([Contracts, Collaborators, Users, UploadFiles, Banks, BinaryTrees]),
    MulterUploadModule],
  controllers: [ContractController],
  providers: [ContractService, CollaboratorsService, UsersService, BanksService],
})
export class ContractModule { }
