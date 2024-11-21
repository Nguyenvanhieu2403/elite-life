import { Module } from '@nestjs/common';
import { UserActivitiesService } from './user-activities.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserActivities } from 'src/database/entities/user/userActivities.entity';
import { UserActivitiesController } from './user-activities.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserActivities])],
  controllers: [UserActivitiesController],
  providers: [UserActivitiesService],
})
export class UserActivitiesModule { }
