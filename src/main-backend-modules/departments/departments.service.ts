import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';

import { DepartmentsController } from '@app/src/api/departments/departments.controller';
import { CreateDepartmentDto } from '@app/src/api/departments/dto/create-department.dto';
import { UpdateDepartmentDto } from '@app/src/api/departments/dto/update-department.dto';

import { authMainBackendInterceptor, errorInterceptor } from '@sync-ukd-service/common/interceptors';

@Injectable()
export class DepartmentsService implements DepartmentsController {
  private readonly logger = new Logger(DepartmentsService.name);
  private readonly axios = this.httpService.axiosRef;

  constructor(private readonly httpService: HttpService) {
    authMainBackendInterceptor(this.axios.interceptors);
    errorInterceptor(this.axios.interceptors, this.logger);
  }

  // @ts-ignore
  async createMany(payload: CreateDepartmentDto[]) {
    const request = await this.axios.post('/many', payload);
    return request.data as ReturnType<DepartmentsController['createMany']>;
  }

  // @ts-ignore
  async findAll() {
    const request = await this.axios.get('');
    return request.data as ReturnType<DepartmentsController['findAll']>;
  }

  // @ts-ignore
  async findOne(id: string) {
    const request = await this.axios.get(`/${id}`);
    return request.data as ReturnType<DepartmentsController['findOne']>;
  }

  // @ts-ignore
  async update(payload: UpdateDepartmentDto) {
    const request = await this.axios.patch('', payload);
    return request.data as ReturnType<DepartmentsController['update']>;
  }

  // @ts-ignore
  async remove(id: string) {
    const request = await this.axios.delete(`/${id}`);
    return request.data as ReturnType<DepartmentsController['remove']>;
  }
}
