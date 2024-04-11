import { DepartmentsController } from '@app/src/core/departments/departments.controller';
import { CreateDepartmentDto } from '@app/src/core/departments/dto/create-department.dto';
import { UpdateDepartmentDto } from '@app/src/core/departments/dto/update-department.dto';
import { DepartmentEntity } from '@app/src/core/departments/entities/department.entity';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { axiosErrorHandler } from '@sync-ukd-service/common/handlers';

@Injectable()
export class DepartmentsService extends DepartmentsController {
  private readonly logger = new Logger(DepartmentsService.name);
  private readonly axios = this.httpService.axiosRef;

  constructor(private readonly httpService: HttpService) {
    // @ts-ignore
    super();

    httpService.axiosRef.interceptors.response.use((response) => response, axiosErrorHandler(this.logger));
  }

  async create(payload: CreateDepartmentDto) {
    const request = await this.axios.post<DepartmentEntity>('', payload);
    return request.data;
  }

  async findAll() {
    const request = await this.axios.get<DepartmentEntity[]>('');
    return request.data;
  }

  async findOne(id: number) {
    const request = await this.axios.get<DepartmentEntity>(`/${id}`);
    return request.data;
  }

  async update(id: number, payload: Partial<UpdateDepartmentDto>) {
    const request = await this.axios.patch(`/${id}`, payload);
    return request.data;
  }

  async remove(id: number) {
    const request = await this.axios.delete(`/${id}`);
    return request.data;
  }
}
