import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';

import { CreateLessonDto } from '@app/src/api/lessons/dto/create-lesson.dto';
import { UpdateLessonDto } from '@app/src/api/lessons/dto/update-lesson.dto';
import { LessonsController } from '@app/src/api/lessons/lessons.controller';

import { authMainBackendInterceptor, errorInterceptor } from '@sync-ukd-service/common/interceptors';

@Injectable()
export class LessonsService implements LessonsController {
  private readonly logger = new Logger(LessonsService.name);
  private readonly axios = this.httpService.axiosRef;

  constructor(private readonly httpService: HttpService) {
    authMainBackendInterceptor(this.axios.interceptors);
    errorInterceptor(this.axios.interceptors, this.logger);
  }

  // @ts-ignore
  async create(payload: CreateLessonDto) {
    const request = await this.axios.post('', payload);
    return request.data as ReturnType<LessonsController['create']>;
  }

  // @ts-ignore
  async findAll() {
    const request = await this.axios.get('');
    return request.data as ReturnType<LessonsController['findAll']>;
  }

  // @ts-ignore
  async findOne(id: string) {
    const request = await this.axios.get(`/${id}`);
    return request.data as ReturnType<LessonsController['findOne']>;
  }

  // @ts-ignore
  async update(payload: UpdateLessonDto) {
    const request = await this.axios.patch('/', payload);
    return request.data as ReturnType<LessonsController['update']>;
  }

  // @ts-ignore
  async remove(id: string) {
    const request = await this.axios.delete(`/${id}`);
    return request.data as ReturnType<LessonsController['remove']>;
  }
}
