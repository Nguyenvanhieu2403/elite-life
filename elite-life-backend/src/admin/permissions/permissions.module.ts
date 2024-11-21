import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permissions } from 'src/database/entities/user/permissions.entity';
import { UserActivitiesService } from '../user-activities/user-activities.service';
import { UserActivities } from 'src/database/entities/user/userActivities.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Permissions, UserActivities])],
  controllers: [PermissionsController],
  providers: [PermissionsService, UserActivitiesService],
})
export class PermissionsModule { }
