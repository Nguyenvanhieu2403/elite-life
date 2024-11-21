import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Roles } from 'src/database/entities/user/roles.entity';
import RolePermissions from 'src/database/entities/user/rolePermisions.entity';
import { Permissions } from 'src/database/entities/user/permissions.entity';
import { PermissionsSaleService } from '../permissions-sale/permissions-sale.service';
import { RolesSaleController } from './roles-sale.controller';
import { RolesSaleService } from './roles-sale.service';


@Module({
  imports: [TypeOrmModule.forFeature([Roles, RolePermissions, Permissions])],
  controllers: [RolesSaleController],
  providers: [RolesSaleService, PermissionsSaleService],
})
export class RolesSaleModule { }
