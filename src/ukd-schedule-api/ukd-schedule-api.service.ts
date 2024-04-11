import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { IGetUkdSchedule, IUkdSchedule } from './interfaces';
import { axiosErrorHandler } from '@sync-ukd-service/common/handlers';

@Injectable()
export class UkdScheduleApiService {
  private readonly logger = new Logger(UkdScheduleApiService.name);
  private readonly axios = this.httpService.axiosRef;

  constructor(private readonly httpService: HttpService) {
    httpService.axiosRef.interceptors.response.use((response) => response, axiosErrorHandler(this.logger));
  }

  async getGroups(): Promise<string[]> {
    const response = await this.axios.get<string[]>('/groups');
    return response.data;
  }

  async getTeachers(): Promise<string[]> {
    const response = await this.axios.get<string[]>('/teachers');
    return response.data;
  }

  async getSchedule(params: IGetUkdSchedule) {
    const response = await this.axios.get<IUkdSchedule[]>('/schedules', {
      params,
    });
    return response.data;
  }
}
