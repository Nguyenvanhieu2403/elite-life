import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Users } from 'src/database/entities/user/users.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthGuard } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { RolesService } from '../roles/roles.service';
import { Roles } from 'src/database/entities/user/roles.entity';
import RolePermissions from 'src/database/entities/user/rolePermisions.entity';
import { UserActivities } from 'src/database/entities/user/userActivities.entity';
import { UserActivitiesService } from '../user-activities/user-activities.service';
import { UploadFiles } from 'src/database/entities/uploadFiles.entity';
import { UploadFilesService } from '../upload-files/upload-files.service';
import { MulterUploadModule } from 'src/utils/multer-helper';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([Users, Roles, RolePermissions, UserActivities, UploadFiles]),
    MulterUploadModule
  ],
  controllers: [UsersController],
  providers: [UsersService, RolesService, UserActivitiesService, UploadFilesService, AuthGuard('jwt-admin')],
})
export class UsersModule { }
