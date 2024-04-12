import { CreateScheduleDto } from '@app/src/core/schedules/dto/create-schedule.dto';
import { FindScheduleDto } from '@app/src/core/schedules/dto/find-schedule.dto';
import { UpdateScheduleDto } from '@app/src/core/schedules/dto/update-schedule.dto';
import { ScheduleEntity } from '@app/src/core/schedules/entities/schedule.entity';
import { SchedulesController } from '@app/src/core/schedules/schedules.controller';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { axiosErrorHandler } from '@sync-ukd-service/common/handlers';

@Injectable()
export class SchedulesService extends SchedulesController {
  private readonly logger = new Logger(SchedulesService.name);
  private readonly axios = this.httpService.axiosRef;

  constructor(private readonly httpService: HttpService) {
    // @ts-ignore
    super();

    httpService.axiosRef.interceptors.response.use((response) => response, axiosErrorHandler(this.logger));
  }

  async create(payload: CreateScheduleDto) {
    const request = await this.axios.post<ScheduleEntity>('', payload);
    return request.data as any ;
  }

  async findAll(params: FindScheduleDto) {
    const request = await this.axios.get<ScheduleEntity[]>('', { params });
    return request.data;
  }

  async findOne(id: number) {
    const request = await this.axios.get<ScheduleEntity>(`/${id}`);
    return request.data;
  }

  async update(id: number, payload: UpdateScheduleDto) {
    const request = await this.axios.patch(`/${id}`, payload);
    return request.data;
  }

  async remove(id: number) {
    const request = await this.axios.delete(`/${id}`);
    return request.data;
  }
}
