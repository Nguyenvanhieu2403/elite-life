import { Module } from '@nestjs/common';
import { UserTokensService } from './user-tokens.service';

@Module({
  controllers: [],
  providers: [UserTokensService],
})
export class UserTokensModule { }
