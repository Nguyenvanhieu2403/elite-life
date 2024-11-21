import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Roles } from 'src/database/entities/user/roles.entity';
import RolePermissions from 'src/database/entities/user/rolePermisions.entity';
import { PermissionsService } from '../permissions/permissions.service';
import { Permissions } from 'src/database/entities/user/permissions.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Roles, RolePermissions, Permissions])],
  controllers: [],
  providers: [RolesService, PermissionsService],
})
export class RolesModule { }
