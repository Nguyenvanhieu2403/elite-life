import { Module } from '@nestjs/common';
import { CollaboratorsService } from './collaborators.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Collaborators } from 'src/database/entities/collaborator/collaborators.entity';
import { CollaboratorsController } from './collaborators.controller';
import { UploadFilesService } from '../upload-files/upload-files.service';
import { UploadFiles } from 'src/database/entities/uploadFiles.entity';
import { UsersService } from '../users/users.service';
import { Users } from 'src/database/entities/user/users.entity';
import { Banks } from 'src/database/entities/collaborator/banks.entity';
import { BanksService } from '../banks/banks.service';
import { PermissionsService } from '../permissions/permissions.service';
import { Permissions } from 'src/database/entities/user/permissions.entity';
import { RolePermissionsService } from '../role-permissions/role-permissions.service';
import RolePermissions from 'src/database/entities/user/rolePermisions.entity';
import { HttpModule, HttpService } from '@nestjs/axios';
import { OrdersService } from '../orders/orders.service';
import { Orders } from 'src/database/entities/collaborator/order.entity';
import { UserActivitiesService } from '../user-activities/user-activities.service';
import { UserActivities } from 'src/database/entities/user/userActivities.entity';
import { Contracts } from 'src/database/entities/collaborator/contracts.entity';
import { MulterUploadModule } from 'src/utils/multer-helper';


@Module({
  imports: [HttpModule, TypeOrmModule.forFeature(
    [
      Collaborators, UploadFiles, Users, Banks, Permissions, RolePermissions, Orders, UserActivities, Contracts
    ]), MulterUploadModule
  ],
  controllers: [CollaboratorsController],
  providers: [CollaboratorsService, UploadFilesService, UsersService, BanksService, PermissionsService, RolePermissionsService, OrdersService, UserActivitiesService],
})
export class CollaboratorsModule { }
