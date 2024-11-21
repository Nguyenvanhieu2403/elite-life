import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InitDataService } from './init-data.service';
import { UserInfo } from 'src/utils/decorator/jwt.decorator';
import { JwtPayloadType } from 'src/utils/strategies/types/jwt-payload.type';

@Controller('init-data')
export class InitDataController {
  constructor(private readonly initDataService: InitDataService) { }

  @Post("init-order")
  initOrder(@UserInfo() user: JwtPayloadType) {
    return this.initDataService.initOrder(user);
  }
}
