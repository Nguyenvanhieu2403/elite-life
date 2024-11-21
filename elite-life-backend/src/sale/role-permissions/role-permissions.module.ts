import { Module } from '@nestjs/common';
import { RolePermissionsService } from './role-permissions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import RolePermissions from 'src/database/entities/user/rolePermisions.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RolePermissions])],
  controllers: [],
  providers: [RolePermissionsService],
})
export class RolePermissionsModule { }
