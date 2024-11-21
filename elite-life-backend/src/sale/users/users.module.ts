import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import RolePermissions from 'src/database/entities/user/rolePermisions.entity';
import { Users } from 'src/database/entities/user/users.entity';
import { Collaborators } from 'src/database/entities/collaborator/collaborators.entity';
import { Roles } from 'src/database/entities/user/roles.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollaboratorsService } from '../collaborators/collaborators.service';
import { UploadFiles } from 'src/database/entities/uploadFiles.entity';
import { RolesService } from '../roles/roles.service';
import { UserActivitiesService } from '../user-activities/user-activities.service';
import { UserActivities } from 'src/database/entities/user/userActivities.entity';
import { Contracts } from 'src/database/entities/collaborator/contracts.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Users, Collaborators, Roles, RolePermissions, UploadFiles, UserActivities, Contracts])],
  controllers: [UsersController],
  providers: [UsersService, CollaboratorsService, RolesService, UserActivitiesService],
})
export class UsersModule { }
