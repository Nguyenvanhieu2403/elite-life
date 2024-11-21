import { Module } from '@nestjs/common';
import { UserActivitiesService } from './user-activities.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserActivities } from 'src/database/entities/user/userActivities.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserActivities])],
  controllers: [],
  providers: [UserActivitiesService],
})
export class UserActivitiesModule { }
