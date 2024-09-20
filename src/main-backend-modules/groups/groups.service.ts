import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';

import { CreateGroupDto } from '@app/api/groups/dto/create-group.dto';
import { UpdateGroupDto } from '@app/api/groups/dto/update-group.dto';
import { GroupsController } from '@app/api/groups/groups.controller';

import { authMainBackendInterceptor, errorInterceptor } from '@sync-ukd-service/common/interceptors';

@Injectable()
export class GroupsService implements GroupsController {
  private readonly logger = new Logger(GroupsService.name);
  private readonly axios = this.httpService.axiosRef;

  constructor(private readonly httpService: HttpService) {
    authMainBackendInterceptor(this.axios.interceptors);
    errorInterceptor(this.axios.interceptors, this.logger);
  }

  // @ts-ignore
  async createMany(payload: CreateGroupDto[]) {
    const request = await this.axios.post('/many', payload);
    return request.data as ReturnType<GroupsController['createMany']>;
  }

  // @ts-ignore
  async findAll() {
    const request = await this.axios.get('');
    return request.data as ReturnType<GroupsController['findAll']>;
  }

  // @ts-ignore
  async findOne(id: string) {
    const request = await this.axios.get(`/${id}`);
    return request.data as ReturnType<GroupsController['findOne']>;
  }

  // @ts-ignore
  async update(payload: UpdateGroupDto) {
    const request = await this.axios.patch('', payload);
    return request.data as ReturnType<GroupsController['update']>;
  }

  // @ts-ignore
  async remove(id: string) {
    const request = await this.axios.delete(`/${id}`);
    return request.data as ReturnType<GroupsController['remove']>;
  }
}
