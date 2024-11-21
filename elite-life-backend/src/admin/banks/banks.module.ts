import { Module } from '@nestjs/common';
import { BanksService } from './banks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Banks } from 'src/database/entities/collaborator/banks.entity';
import { BanksController } from './banks.controller';
import { UserActivitiesService } from '../user-activities/user-activities.service';
import { UserActivities } from 'src/database/entities/user/userActivities.entity';
import { OtherListsService } from '../other-lists/other-lists.service';
import { OtherLists } from 'src/database/entities/otherLists.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Banks, UserActivities, OtherLists
  ])],
  controllers: [BanksController],
  providers: [BanksService, UserActivitiesService, OtherListsService],
})
export class BanksModule { }
