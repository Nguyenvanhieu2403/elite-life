import { HttpException, HttpStatus, MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from './config/database.config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { TypeOrmConfigService } from './database/typeorm-config.service';
import authConfig from './config/auth.config';
import appConfig from './config/app.config';
import * as path from 'path';
import mailConfig from './config/mail.config';
import fileConfig from './config/file.config';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';

import { AdminAuthModule } from './admin/auth/auth.module';
import { OtherListsModule } from './admin/other-lists/other-lists.module';
import { UsersModule } from './admin/users/users.module';
import { PermissionsModule } from './admin/permissions/permissions.module';
import { ProductsModule } from './admin/products/products.module';
import { RolesModule } from './admin/roles/roles.module';
import { CollaboratorsModule } from './admin/collaborators/collaborators.module';
import { CommonModule } from './admin/common/common.module';
import { RolePermissionsModule } from './admin/role-permissions/role-permissions.module';
import { HomeModule } from './admin/home/home.module';
import { UserActivitiesModule } from './admin/user-activities/user-activities.module';
import { UserAccessHistoriesModule } from './admin/user-access-histories/user-access-histories.module';
import { PermissionsSaleModule } from './admin/permissions-sale/permissions-sale.module';
import { RolesSaleModule } from './admin/roles-sale/roles-sale.module';
import { UserSaleModule } from './admin/user-sale/user-sale.module';
import { WithdrawalRequestsModule as AdminWithdrawalRequestsModule } from './admin/withdrawal-requests/withdrawal-requests.module';
import { OrdersModule as AdminOrdersModule } from './admin/orders/orders.module';
import { ContractModule as AdminContractModule } from './admin/contract/contract.module';

// sale
import { SaleAuthModule } from './sale/auth/auth.module';
import { HomeModule as SaleHomeModule } from './sale/home/home.module';
import { CollaboratorsModule as SaleCollaboratorsModule } from './sale/collaborators/collaborators.module';
import { UserAccessHistoriesModule as SaleUserAccessHistoriesModule } from './sale/user-access-histories/user-access-histories.module';
import { RolesModule as SaleRolesModule } from './sale/roles/roles.module';
import { PermissionsModule as SalePermissionModule } from './sale/permissions/permissions.module';
import { UsersModule as UsersSaleModule } from './sale/users/users.module';
import { WithdrawalRequestsModule as SaleWithdrawalRequestsModule } from './sale/withdrawal-requests/withdrawal-requests.module';
import { OrdersModule as SaleOrdersModule } from './sale/orders/orders.module';
import { ContractModule as SaleContractModule } from './sale/contract/contract.module';

import { CacheModule } from './cache/cache.module';
import { TasksModule } from './tasks/tasks.module';
import { PermissionGuard } from './permissions/permission.guard';
import { AuthCacheMiddleware } from './middleware/authCache.middleware';
import { InitDataModule } from './admin/init-data/init-data.module';
import { UserTokensModule } from './sale/user-tokens/user-tokens.module';

import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { BanksModule } from './admin/banks/banks.module';
import { WalletDetailsModule } from './sale/wallet-details/wallet-details.module';
import { WalletsModule } from './sale/wallets/wallets.module';
import { OrderPaysModule } from './sale/order-pays/order-pays.module';
import { OrderDetailsModule } from './admin/order-details/order-details.module';

export const adminModule = [AdminAuthModule,
  HomeModule,
  CommonModule,
  OtherListsModule,
  PermissionsModule,
  RolesModule,
  UsersModule,
  ProductsModule,
  CollaboratorsModule,
  RolePermissionsModule,
  InitDataModule,
  UserActivitiesModule,
  UserAccessHistoriesModule,
  PermissionsSaleModule,
  UserSaleModule,
  RolesSaleModule,
  BanksModule,
  AdminWithdrawalRequestsModule,
  AdminOrdersModule,
  AdminContractModule
]

export const saleModule = [SaleAuthModule,
  SaleHomeModule,
  SaleCollaboratorsModule,
  SaleUserAccessHistoriesModule,
  SaleRolesModule,
  SalePermissionModule,
  UsersSaleModule,
  SaleWithdrawalRequestsModule,
  SaleOrdersModule,
  SaleContractModule,
]

@Module({
  imports: [
    ThrottlerModule.forRoot({
      limit: 1,
      ttl: 0.2
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        databaseConfig,
        authConfig,
        appConfig,
        mailConfig,
        fileConfig
      ],
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      dataSourceFactory: async (options: DataSourceOptions) => {
        return new DataSource(options).initialize();
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '../files')
    }),
    CacheModule,
    TasksModule,
    // admin
    ...adminModule,
    // sale
    ...saleModule,
    UserTokensModule,
    UserActivitiesModule,
    UserAccessHistoriesModule,
    HomeModule,
    WalletDetailsModule,
    WalletsModule,
    OrderPaysModule,
    OrderDetailsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        AuthCacheMiddleware,
        (req, res, next) => {
          if (res.statusCode === 404) {
            throw new HttpException('Not found', HttpStatus.NOT_FOUND);
          } else if (res.statusCode === 500) {
            throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
          }
          next();
        }
      )
      .forRoutes('*');
  }
}
