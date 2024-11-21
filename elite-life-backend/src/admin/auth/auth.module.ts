import { Module } from '@nestjs/common';
import { AdminAuthService } from './auth.service';
import { AdminAuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { Users } from 'src/database/entities/user/users.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IsExist } from 'src/utils/validators/is-exists.validator';
import { IsNotExist } from 'src/utils/validators/is-not-exists.validator';
import { PassportModule } from '@nestjs/passport';
import { JwtAdminStrategy } from 'src/utils/strategies/jwt-admin.strategy';
import { MailerModule } from 'src/mailer/mailer.module';
import { UsersService } from '../users/users.service';
import { RolePermissionsService } from '../role-permissions/role-permissions.service';
import RolePermissions from 'src/database/entities/user/rolePermisions.entity';
import { CacheService } from 'src/cache/cache.service';
import { UserAccessHistories } from 'src/database/entities/user/userAccessHistories.entity';
import { UserAccessHistoriesService } from '../user-access-histories/user-access-histories.service';
import { UploadFiles } from 'src/database/entities/uploadFiles.entity';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([Users, RolePermissions, UserAccessHistories, UploadFiles]),
    PassportModule,
    MailerModule,
  ],
  controllers: [AdminAuthController],
  providers: [
    IsExist,
    IsNotExist,
    AdminAuthService,
    JwtAdminStrategy,
    UsersService,
    UserAccessHistoriesService,
    RolePermissionsService,
    CacheService
  ],
})
export class AdminAuthModule { }
