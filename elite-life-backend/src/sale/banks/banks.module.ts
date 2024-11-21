import { Module } from '@nestjs/common';
import { BanksService } from './banks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Banks } from 'src/database/entities/collaborator/banks.entity';

@Module({
  controllers: [],
  providers: [BanksService],
})
export class BanksModule { }
