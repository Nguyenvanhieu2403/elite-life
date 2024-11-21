import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { async } from 'rxjs';
import { Collaborators } from 'src/database/entities/collaborator/collaborators.entity';
import RolePermissions from 'src/database/entities/user/rolePermisions.entity';
import { Users } from 'src/database/entities/user/users.entity';
import { In, LessThan, LessThanOrEqual, MoreThan, MoreThanOrEqual, Not, Repository } from 'typeorm';
import { ProcessOrder } from './process-order.task';
import { ConfigService } from '@nestjs/config';
import { Environment } from 'src/config/app.config';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  private readonly isProd: boolean = false;

  constructor(
    private configService: ConfigService,
    private readonly processOrder: ProcessOrder,
  ) {
    let nodeEvn = this.configService.getOrThrow("app.nodeEnv", { infer: true, });
    this.isProd = nodeEvn == Environment.Prod
  }


  isProcessOrder: boolean = false;
  @Cron(CronExpression.EVERY_10_SECONDS)
  async processOrderTask() {
    if (this.isProcessOrder == false) {
      this.isProcessOrder = true;
      console.log("isProcessOrder running")
      if (this.isProd) {
        await this.processOrder.process();
      }
      else {
        // await this.processOrder.process();
      }
      this.isProcessOrder = false;
    }
  }
}

// * * * * * *
// | | | | | |
// | | | | | day of week
// | | | | months
// | | | day of month
// | | hours
// | minutes
// seconds (optional)

// * * * * * *	every second
// 45 * * * * *	every minute, on the 45th second
// 0 10 * * * *	every hour, at the start of the 10th minute
// 0 */30 9-17 * * *	every 30 minutes between 9am and 5pm
// 0 30 11 * * 1-5	Monday to Friday at 11:30am