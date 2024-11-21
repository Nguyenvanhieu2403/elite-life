import { Module } from '@nestjs/common';
import { CommonController } from './common.controller';
import { OtherListsService } from '../other-lists/other-lists.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OtherLists } from 'src/database/entities/otherLists.entity';

@Module({
  imports: [
    JwtModule.register({}),
    PassportModule,
    TypeOrmModule.forFeature([OtherLists]),
  ],
  controllers: [CommonController],
  providers: [
    OtherListsService

  ],
})
export class CommonModule { }
