import { Module } from '@nestjs/common';
import { SaleAuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { Users } from 'src/database/entities/user/users.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IsExist } from 'src/utils/validators/is-exists.validator';
import { IsNotExist } from 'src/utils/validators/is-not-exists.validator';
import { PassportModule } from '@nestjs/passport';
import { MailerModule } from 'src/mailer/mailer.module';
import { UsersService } from '../users/users.service';
import RolePermissions from 'src/database/entities/user/rolePermisions.entity';
import { SaleAuthController } from './auth.controller';
import { JwtSaleStrategy } from 'src/utils/strategies/jwt-sale.strategy';
import { CacheService } from 'src/cache/cache.service';
import { CollaboratorsService } from '../collaborators/collaborators.service';
import { Collaborators } from 'src/database/entities/collaborator/collaborators.entity';
import { MulterUploadModule } from 'src/utils/multer-helper';
import { BanksService } from '../banks/banks.service';
import { Banks } from 'src/database/entities/collaborator/banks.entity';
import { UploadFiles } from 'src/database/entities/uploadFiles.entity';
import { UploadFilesService } from '../upload-files/upload-files.service';
import { UserTokens } from 'src/database/entities/user/userTokens.entity';
import { UserTokensService } from '../user-tokens/user-tokens.service';
import { UserAccessHistories } from 'src/database/entities/user/userAccessHistories.entity';
import { UserAccessHistoriesService } from '../user-access-histories/user-access-histories.service';
import { RolePermissionsService } from '../role-permissions/role-permissions.service';
import { HttpModule } from '@nestjs/axios';
import { OtherListsService } from '../other-lists/other-lists.service';
import { OtherLists } from 'src/database/entities/otherLists.entity';
import { UserActivitiesService } from '../user-activities/user-activities.service';
import { UserActivities } from 'src/database/entities/user/userActivities.entity';
import { Contracts } from 'src/database/entities/collaborator/contracts.entity';

@Module({
  imports: [HttpModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([Users, RolePermissions, Banks,
      Collaborators, UploadFiles,
      UserAccessHistories, Contracts,
      UserTokens, RolePermissions, OtherLists, UserActivities]),
    PassportModule,
    MailerModule,
    MulterUploadModule
  ],
  controllers: [SaleAuthController],
  providers: [
    IsExist,
    IsNotExist,
    SaleAuthService,
    JwtSaleStrategy,
    UsersService,
    CacheService,
    CollaboratorsService,
    BanksService,
    UploadFilesService,
    UserTokensService,
    UserAccessHistoriesService,
    RolePermissionsService,
    OtherListsService,
    UserActivitiesService
  ],
})
export class SaleAuthModule { }
