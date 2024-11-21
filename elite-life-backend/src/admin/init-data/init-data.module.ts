import { Module } from '@nestjs/common';
import { InitDataService } from './init-data.service';
import { InitDataController } from './init-data.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Collaborators } from 'src/database/entities/collaborator/collaborators.entity';
import { UploadFiles } from 'src/database/entities/uploadFiles.entity';
import { Users } from 'src/database/entities/user/users.entity';
import { UsersService } from '../users/users.service';
import { CollaboratorsService } from '../collaborators/collaborators.service';
import { ProductsService } from '../products/products.service';
import { BanksService } from '../banks/banks.service';
import { Products } from 'src/database/entities/products.entity';
import { Banks } from 'src/database/entities/collaborator/banks.entity';
import { OtherListsService } from '../other-lists/other-lists.service';
import { OtherLists } from 'src/database/entities/otherLists.entity';
import { MulterUploadModule } from 'src/utils/multer-helper';
import { BinaryTrees } from 'src/database/entities/collaborator/binaryTree.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Collaborators,
    UploadFiles, Users, Products, Banks, BinaryTrees, OtherLists]),
    MulterUploadModule
  ],
  controllers: [InitDataController,],
  providers: [InitDataService, UsersService, CollaboratorsService,
    ProductsService, BanksService, OtherListsService,
  ],
})
export class InitDataModule { }
