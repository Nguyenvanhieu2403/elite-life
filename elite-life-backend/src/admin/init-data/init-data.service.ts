import { Injectable } from '@nestjs/common';
import { JwtPayloadType } from 'src/utils/strategies/types/jwt-payload.type';

@Injectable()
export class InitDataService {
  constructor(

  ) { }

  async initOrder(user: JwtPayloadType) {
    return "done";
  }
}
