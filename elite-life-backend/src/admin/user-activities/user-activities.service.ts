import { Injectable } from '@nestjs/common';
import { CreateUserActivityDto } from './dto/create-user-activity.dto';
import { UpdateUserActivityDto } from './dto/update-user-activity.dto';
import { UserActivities } from 'src/database/entities/user/userActivities.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin, FindManyOptions, Repository } from 'typeorm';
import { ResponseData } from 'src/utils/schemas/common.schema';
import { JwtPayloadType } from 'src/utils/strategies/types/jwt-payload.type';
import { IPaginationOptions } from 'src/utils/types/pagination-options';
import { ApplicationTypeEnums } from 'src/utils/enums.utils';
import logger from 'src/utils/logger';

@Injectable()
export class UserActivitiesService {
  constructor(
    @InjectRepository(UserActivities)
    private userActivitiesRepository: Repository<UserActivities>,
  ) { }
  async create(createUserActivityDto: CreateUserActivityDto, user: JwtPayloadType) {
    try {
      await this.userActivitiesRepository.save(
        this.userActivitiesRepository.create({
          ...createUserActivityDto,
          ApplicationType: ApplicationTypeEnums.User,
          CreatedBy: user.userName,
        }),
      );
    } catch (error) {
      logger.error(error);
    }
  }

  async saveMany(createUserActivitysDto: CreateUserActivityDto[], user: JwtPayloadType) {
    try {

      let info = []

      for (let createUserActivityDto of createUserActivitysDto) {
        info.push(
          this.userActivitiesRepository.create({
            ...createUserActivityDto,
            ApplicationType: ApplicationTypeEnums.User,
            CreatedBy: user.userName,
          }),
        )
      }

      await this.userActivitiesRepository.save(info);
    } catch (error) {
      logger.error(error);
    }
  }

  findManyWithPagination(options?: FindManyOptions<UserActivities>, paginationOptions?: IPaginationOptions,) {
    return this.userActivitiesRepository.findAndCount({
      ...options,
      skip: paginationOptions ? (paginationOptions.page - 1) * paginationOptions.limit : null,
      take: paginationOptions ? paginationOptions.limit : null,
      order: {
        ...options.order,
        CreatedAt: "DESC"
      },

    });
  }

  findDifference(oldDataRaw: any, newDataRaw: any): any {
    try {
      if (!oldDataRaw || !newDataRaw) {
        throw new Error('lỗi đầu vào');
      }
      let oldData: { [key: string]: any } = {};
      let newData: { [key: string]: any } = {};

      Object.keys(oldDataRaw).forEach((key) => {
        if (oldDataRaw[key] !== newDataRaw[key]) {
          oldData[key] = oldDataRaw[key];
          newData[key] = newDataRaw[key];
        }
      });

      return {
        oldData: Object.keys(oldData).length === 0 ? null : oldData,
        newData: Object.keys(newData).length === 0 ? null : newData,
      };
    } catch (error) {
      logger.error(error);
      return { oldData: null, newData: null };
    }
  }
}
