import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';

import { CreateScheduleDto } from '@app/src/api/schedules/dto/create-schedule.dto';
import { FindScheduleDto } from '@app/src/api/schedules/dto/find-schedule.dto';
import { UpdateScheduleDto } from '@app/src/api/schedules/dto/update-schedule.dto';
import { SchedulesController } from '@app/src/api/schedules/schedules.controller';

import { authMainBackendInterceptor, errorInterceptor } from '@sync-ukd-service/common/interceptors';

@Injectable()
export class SchedulesService implements SchedulesController {
  private readonly logger = new Logger(SchedulesService.name);
  private readonly axios = this.httpService.axiosRef;

  constructor(private readonly httpService: HttpService) {
    authMainBackendInterceptor(this.axios.interceptors);
    errorInterceptor(this.axios.interceptors, this.logger);
  }

  // @ts-ignore
  async createMany(payload: CreateScheduleDto[]) {
    if (!payload.length) return [];

    const request = await this.axios.post('many', payload);
    return request.data as ReturnType<SchedulesController['createMany']>;
  }

  // @ts-ignore
  async findAll(params?: FindScheduleDto) {
    const request = await this.axios.get('', { params });
    return request.data as ReturnType<SchedulesController['findAll']>;
  }

  // @ts-ignore
  async findOne(id: string) {
    const request = await this.axios.get(`/${id}`);
    return request.data as ReturnType<SchedulesController['findOne']>;
  }

  // @ts-ignore
  async updateMany(payloads: UpdateScheduleDto[]) {
    if (!payloads.length) return [];
    const request = await this.axios.patch('/many', payloads);
    return request.data as ReturnType<SchedulesController['updateMany']>;
  }

  // @ts-ignore
  async removeMany(ids: string[]) {
    if (!ids.length) return [];
    const request = await this.axios.delete(`/many`, { data: ids });
    return request.data as ReturnType<SchedulesController['removeMany']>;
  }
}
