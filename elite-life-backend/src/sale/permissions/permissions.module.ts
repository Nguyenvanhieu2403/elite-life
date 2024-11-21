import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permissions } from 'src/database/entities/user/permissions.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Permissions])],
  controllers: [],
  providers: [PermissionsService],
})
export class PermissionsModule { }
