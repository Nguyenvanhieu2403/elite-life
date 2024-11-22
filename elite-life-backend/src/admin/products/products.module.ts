import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Products } from 'src/database/entities/products.entity';
import { AuthGuard } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { MulterUploadModule } from 'src/utils/multer-helper';
import { UserActivities } from 'src/database/entities/user/userActivities.entity';
import { UserActivitiesService } from '../user-activities/user-activities.service';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([Products, UserActivities]),
    MulterUploadModule],
  controllers: [ProductsController],
  providers: [ProductsService, UserActivitiesService, AuthGuard('jwt-admin')],
})
export class ProductsModule { }