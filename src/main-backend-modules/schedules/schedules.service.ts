import { CreateScheduleDto } from '@app/src/core/schedules/dto/create-schedule.dto';
import { FindScheduleDto } from '@app/src/core/schedules/dto/find-schedule.dto';
import { UpdateScheduleDto } from '@app/src/core/schedules/dto/update-schedule.dto';
import { ScheduleEntity } from '@app/src/core/schedules/entities/schedule.entity';
import { SchedulesController } from '@app/src/core/schedules/schedules.controller';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { authMainBackendInterceptor, errorInterceptor } from '@sync-ukd-service/common/interceptors';

@Injectable()
export class SchedulesService extends SchedulesController {
  private readonly logger = new Logger(SchedulesService.name);
  private readonly axios = this.httpService.axiosRef;

  constructor(private readonly httpService: HttpService) {
    // @ts-ignore
    super();
    authMainBackendInterceptor(this.axios.interceptors);
    errorInterceptor(this.axios.interceptors, this.logger);
  }

  async create(payload: CreateScheduleDto[]) {
    if (!payload.length) return [];

    const request = await this.axios.post<ScheduleEntity[]>('', payload);
    return request.data as any;
  }

  async findAll(params?: FindScheduleDto) {
    const request = await this.axios.get<ScheduleEntity[]>('', { params });
    return request.data;
  }

  async findOne(id: number) {
    const request = await this.axios.get<ScheduleEntity>(`/${id}`);
    return request.data;
  }

  async updateMany(payloads: UpdateScheduleDto[]) {
    if (!payloads.length) return [];
    const request = await this.axios.patch('/many', payloads);
    return request.data;
  }

  async removeMany(ids: number[]) {
    if (!ids.length) return [];
    const request = await this.axios.delete(`/many`, { data: ids });
    return request.data;
  }
}
