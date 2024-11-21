import { Module } from '@nestjs/common';
import { UserSaleService } from './user-sale.service';
import { UserSaleController } from './user-sale.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/database/entities/user/users.entity';
import { Collaborators } from 'src/database/entities/collaborator/collaborators.entity';
import { RolesService } from '../roles/roles.service';
import { Roles } from 'src/database/entities/user/roles.entity';
import RolePermissions from 'src/database/entities/user/rolePermisions.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Users, Collaborators, Roles, RolePermissions])],
  controllers: [UserSaleController],
  providers: [UserSaleService, RolesService],
})
export class UserSaleModule { }
