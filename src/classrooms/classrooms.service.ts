import { ClassroomsController } from '@app/src/core/classrooms/classrooms.controller';
import { CreateClassroomDto } from '@app/src/core/classrooms/dto/create-classroom.dto';
import { UpdateClassroomDto } from '@app/src/core/classrooms/dto/update-classroom.dto';
import { ClassroomEntity } from '@app/src/core/classrooms/entities/classroom.entity';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { axiosErrorHandler } from '@sync-ukd-service/common/handlers';

@Injectable()
export class ClassroomsService extends ClassroomsController {
  private readonly logger = new Logger(ClassroomsService.name);
  private readonly axios = this.httpService.axiosRef;

  constructor(private readonly httpService: HttpService) {
    // @ts-ignore
    super();

    httpService.axiosRef.interceptors.response.use((response) => response, axiosErrorHandler(this.logger));
  }

  async create(payload: CreateClassroomDto) {
    const request = await this.axios.post<ClassroomEntity>('', payload);
    return request.data;
  }

  async findAll() {
    const request = await this.axios.get<ClassroomEntity[]>('');
    return request.data;
  }

  async findOne(id: number) {
    const request = await this.axios.get<ClassroomEntity>(`/${id}`);
    return request.data;
  }

  async update(id: number, payload: Partial<UpdateClassroomDto>) {
    const request = await this.axios.patch(`/${id}`, payload);
    return request.data;
  }

  async remove(id: number) {
    const request = await this.axios.delete(`/${id}`);
    return request.data;
  }
}
