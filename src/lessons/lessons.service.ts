import { CreateLessonDto } from '@app/src/core/lessons/dto/create-lesson.dto';
import { UpdateLessonDto } from '@app/src/core/lessons/dto/update-lesson.dto';
import { LessonEntity } from '@app/src/core/lessons/entities/lesson.entity';
import { LessonsController } from '@app/src/core/lessons/lessons.controller';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { axiosErrorHandler } from '@sync-ukd-service/common/handlers';

@Injectable()
export class LessonsService extends LessonsController {
  private readonly logger = new Logger(LessonsService.name);
  private readonly axios = this.httpService.axiosRef;

  constructor(private readonly httpService: HttpService) {
    // @ts-ignore
    super();

    httpService.axiosRef.interceptors.response.use((response) => response, axiosErrorHandler(this.logger));
  }

  async create(payload: CreateLessonDto) {
    const request = await this.axios.post<LessonEntity>('', payload);
    return request.data;
  }

  async findAll() {
    const request = await this.axios.get<LessonEntity[]>('');
    return request.data;
  }

  async findOne(id: number) {
    const request = await this.axios.get<LessonEntity>(`/${id}`);
    return request.data;
  }

  async update(id: number, payload: UpdateLessonDto) {
    const request = await this.axios.patch(`/${id}`, payload);
    return request.data;
  }

  async remove(id: number) {
    const request = await this.axios.delete(`/${id}`);
    return request.data;
  }
}
