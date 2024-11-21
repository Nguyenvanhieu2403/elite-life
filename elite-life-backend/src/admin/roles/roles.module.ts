import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Roles } from 'src/database/entities/user/roles.entity';
import RolePermissions from 'src/database/entities/user/rolePermisions.entity';
import { PermissionsService } from '../permissions/permissions.service';
import { Permissions } from 'src/database/entities/user/permissions.entity';
import { UserActivities } from 'src/database/entities/user/userActivities.entity';
import { UserActivitiesService } from '../user-activities/user-activities.service';
import { Users } from 'src/database/entities/user/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Roles, RolePermissions, Permissions, UserActivities, Users])],
  controllers: [RolesController],
  providers: [RolesService, PermissionsService, UserActivitiesService],
})
export class RolesModule { }
