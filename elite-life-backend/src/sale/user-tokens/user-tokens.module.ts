import { Module } from '@nestjs/common';
import { UserTokensService } from './user-tokens.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserTokens } from 'src/database/entities/user/userTokens.entity';

@Module({
  imports: [TypeOrmModule.forFeature(
    [
      UserTokens
    ]),
  ],
  controllers: [],
  providers: [UserTokensService],
})
export class UserTokensModule { }
