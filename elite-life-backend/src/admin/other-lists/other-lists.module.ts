import { HttpException, HttpStatus, Module } from '@nestjs/common';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { OtherListsService } from './other-lists.service';
import { OtherListsController } from './other-lists.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OtherLists } from 'src/database/entities/otherLists.entity';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { MulterUploadModule } from 'src/utils/multer-helper';
import { UserActivities } from 'src/database/entities/user/userActivities.entity';
import { UserActivitiesService } from '../user-activities/user-activities.service';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([OtherLists, UserActivities]),
    MulterUploadModule
  ],
  controllers: [OtherListsController],
  providers: [OtherListsService, UserActivitiesService, AuthGuard('jwt-admin')],
})
export class OtherListsModule { }
