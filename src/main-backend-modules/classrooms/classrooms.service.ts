import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';

import { ClassroomsController } from '@app/src/api/classrooms/classrooms.controller';
import { CreateClassroomDto } from '@app/src/api/classrooms/dto/create-classroom.dto';
import { UpdateClassroomDto } from '@app/src/api/classrooms/dto/update-classroom.dto';

import { authMainBackendInterceptor, errorInterceptor } from '@sync-ukd-service/common/interceptors';

@Injectable()
export class ClassroomsService implements ClassroomsController {
  private readonly logger = new Logger(ClassroomsService.name);
  private readonly axios = this.httpService.axiosRef;

  constructor(private readonly httpService: HttpService) {
    authMainBackendInterceptor(this.axios.interceptors);
    errorInterceptor(this.axios.interceptors, this.logger);
  }

  // @ts-ignore
  async create(payload: CreateClassroomDto) {
    const request = await this.axios.post('', payload);
    return request.data as ReturnType<ClassroomsController['create']>;
  }

  // @ts-ignore
  async findAll() {
    const request = await this.axios.get('');
    return request.data as ReturnType<ClassroomsController['findAll']>;
  }

  // @ts-ignore
  async findOne(id: string) {
    const request = await this.axios.get(`/${id}`);
    return request.data as ReturnType<ClassroomsController['findOne']>;
  }

  // @ts-ignore
  async update(payload: UpdateClassroomDto) {
    const request = await this.axios.patch('', payload);
    return request.data as ReturnType<ClassroomsController['update']>;
  }

  // @ts-ignore
  async remove(id: string) {
    const request = await this.axios.delete(`/${id}`);
    return request.data as ReturnType<ClassroomsController['remove']>;
  }
}
