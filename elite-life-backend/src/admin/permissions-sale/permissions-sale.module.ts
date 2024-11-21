import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permissions } from 'src/database/entities/user/permissions.entity';
import { PermissionsSaleController } from './permissions-sale.controller';
import { PermissionsSaleService } from './permissions-sale.service';

@Module({
  imports: [TypeOrmModule.forFeature([Permissions])],
  controllers: [PermissionsSaleController],
  providers: [PermissionsSaleService],
})
export class PermissionsSaleModule { }
