import { ClassroomsController } from '@app/src/core/classrooms/classrooms.controller';
import { CreateClassroomDto } from '@app/src/core/classrooms/dto/create-classroom.dto';
import { UpdateClassroomDto } from '@app/src/core/classrooms/dto/update-classroom.dto';
import { ClassroomEntity } from '@app/src/core/classrooms/entities/classroom.entity';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { authMainBackendInterceptor, errorInterceptor } from '@sync-ukd-service/common/interceptors';

@Injectable()
export class ClassroomsService extends ClassroomsController {
  private readonly logger = new Logger(ClassroomsService.name);
  private readonly axios = this.httpService.axiosRef;

  constructor(private readonly httpService: HttpService) {
    // @ts-ignore
    super();
    authMainBackendInterceptor(this.axios.interceptors);
    errorInterceptor(this.axios.interceptors, this.logger);
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
