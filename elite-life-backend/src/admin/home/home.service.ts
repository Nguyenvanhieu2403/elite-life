import { Injectable } from '@nestjs/common';
import { CreateHomeDto } from './dto/create-home.dto';
import { UpdateHomeDto } from './dto/update-home.dto';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format, addWeeks, subMonths } from 'date-fns';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { ResponseData } from 'src/utils/schemas/common.schema';
import { Collaborators } from 'src/database/entities/collaborator/collaborators.entity';
import { FileTypeEnums } from 'src/utils/enums.utils';
import { getTopSalerDto } from './dto/getTopSaler.dto';
import { UploadFilesService } from '../upload-files/upload-files.service';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { AllConfigType } from 'src/config/config.type';
import { FileHelper } from 'src/utils/file-helper';
import { JwtPayloadType } from 'src/utils/strategies/types/jwt-payload.type';
@Injectable()
export class HomeService {
  isPermissionValidate: boolean = false;
  constructor(
    @InjectRepository(Collaborators)
    private readonly collaboratorsRepository: Repository<Collaborators>,
    private readonly uploadFilesService: UploadFilesService,
    private configService: ConfigService<AllConfigType>,

  ) { }

  // async getChangeStudents(user: JwtPayloadType): Promise<number> {
  //   // Lấy thời điểm bắt đầu của tuần hiện tại và tuần trước
  //   const currentDate = new Date();
  //   const startOfCurrentWeek = format(currentDate, 'yyyy-MM-dd');
  //   const startOfLastWeek = format(addWeeks(currentDate, -1), 'yyyy-MM-dd');

  //   // Tính toán doanh thu cho tuần hiện tại
  //   const currentWeekStudent = await this.calculateStudent(startOfCurrentWeek, user);

  //   // Tính toán doanh thu cho tuần trước
  //   const lastWeekStudent = await this.calculateStudent(startOfLastWeek, user);

  //   if (currentWeekStudent == null || lastWeekStudent == null) {
  //     return 0;
  //   }
  //   if (lastWeekStudent === 0) {
  //     return 0;
  //   }

  //   const growthPercentage = ((currentWeekStudent - lastWeekStudent) / lastWeekStudent) * 100;

  //   return growthPercentage;
  // }

  // private async calculateStudent(startDate: string, user: JwtPayloadType): Promise<number> {
  //   let SubInstituteIds = user.userInfo.SubInstituteIds ?? []
  //   if (SubInstituteIds.length == 0) {
  //     return 0
  //   }

  //   return 0;
  // }

  async compareRevenuePercentageWeek(user: JwtPayloadType): Promise<number> {
    // Lấy thời điểm bắt đầu của tuần hiện tại và tuần trước
    const currentDate = new Date();
    const startOfCurrentWeek = format(currentDate, 'yyyy-MM-dd');
    const startOfLastWeek = format(addWeeks(currentDate, -1), 'yyyy-MM-dd');

    // Tính toán doanh thu cho tuần hiện tại
    const currentWeekRevenue = await this.calculateRevenueWeek(startOfCurrentWeek, user);

    // Tính toán doanh thu cho tuần trước
    const lastWeekRevenue = await this.calculateRevenueWeek(startOfLastWeek, user);
    if (currentWeekRevenue == null || lastWeekRevenue == null) {
      return 0;
    }
    if (lastWeekRevenue === 0) {
      return 0;
    }

    // Tính phần trăm tăng trưởng
    const growthPercentage = ((currentWeekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100;

    return growthPercentage;
  }

  private async calculateRevenueWeek(startDate: string, user: JwtPayloadType): Promise<number> {
    return 0;
  }

  // async calculateRevenueForCurrentWeek(user: JwtPayloadType): Promise<number> {
  //   let OrgIds = user.userInfo.OrgIds ?? [];
  //   if (OrgIds.length == 0) {
  //     return 0
  //   }

  //   return 0;
  // }


  async compareRevenuePercentageMonth(user: JwtPayloadType): Promise<number> {
    const currentDate = new Date();
    const startOfCurrentMonth = startOfMonth(currentDate);
    const startOfLastMonth = startOfMonth(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

    const currentMonthRevenue = await this.calculateRevenueMonth(startOfCurrentMonth, user);

    const lastMonthRevenue = await this.calculateRevenueMonth(startOfLastMonth, user);
    if (currentMonthRevenue == null || lastMonthRevenue == null) {
      return 0;
    }
    if (lastMonthRevenue === 0) {
      return 0;
    }

    const growthPercentage = ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

    return growthPercentage;
  }

  private async calculateRevenueMonth(startDate: Date, user: JwtPayloadType): Promise<number> {
    return 0;
  }
  async calculateRevenueForCurrentMonth(user: JwtPayloadType): Promise<number> {
    return 0;
  }

  // async getStudentCountByMonth(user: JwtPayloadType): Promise<{ month: string; count: number }[]> {
  //   let SubInstituteIds = user.userInfo.SubInstituteIds ?? []
  //   if (SubInstituteIds.length == 0) {
  //     return []
  //   }

  //   const currentDate = new Date();
  //   const result: { month: string; count: number }[] = [];

  //   for (let i = 11; i >= 0; i--) {
  //     const startDate = startOfMonth(subMonths(currentDate, i));
  //     const endDate = startOfMonth(subMonths(currentDate, i - 1));

  //     const monthLabel = format(startDate, 'MMMM');

  //     result.push({ month: monthLabel, count: 0 });
  //   }

  //   return result;
  // }
  // async getRevenueForLast12Months(user: JwtPayloadType): Promise<{ month: string; revenue: number }[]> {
  //   let OrgIds = user.userInfo.OrgIds ?? [];
  //   if (OrgIds.length == 0) {
  //     return []
  //   }
  //   const currentDate = new Date();
  //   const result: { month: string; revenue: number }[] = [];

  //   for (let i = 11; i >= 0; i--) {
  //     const startDate = startOfMonth(subMonths(currentDate, i));
  //     const endDate = startOfMonth(subMonths(currentDate, i - 1));

  //     const monthLabel = format(startDate, 'MMMM'); // Định dạng tên tháng

  //     result.push({ month: monthLabel, revenue: 0 });
  //   }

  //   return result;
  // }

  // async getTopSaler(user: JwtPayloadType) {
  //   let OrgIds = user.userInfo.OrgIds ?? [];
  //   if (OrgIds.length == 0) {
  //     return {}
  //   }

  // }

  async getNumberStudentInOrder(userName: string) {

    var schema = this.configService.getOrThrow("database.schema", { infer: true });

  }

}