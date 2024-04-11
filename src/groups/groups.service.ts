import { Injectable, Logger } from '@nestjs/common';
import { GroupsController } from '@app/core/groups/groups.controller';
import { CreateGroupDto } from '@app/core/groups/dto/create-group.dto';
import { UpdateGroupDto } from '@app/core/groups/dto/update-group.dto';
import { GroupEntity } from '@app/core/groups/entities/group.entity';
import { HttpService } from '@nestjs/axios';
import { axiosErrorHandler } from '@sync-ukd-service/common/handlers';

@Injectable()
export class GroupsService extends GroupsController {
  private readonly logger = new Logger(GroupsService.name);
  private readonly axios = this.httpService.axiosRef;

  constructor(private readonly httpService: HttpService) {
    // @ts-ignore
    super();

    httpService.axiosRef.interceptors.response.use((response) => response, axiosErrorHandler(this.logger));
  }

  async create(payload: CreateGroupDto[]) {
    const request = await this.axios.post<GroupEntity[]>('', payload);
    return request.data;
  }

  async findAll() {
    const request = await this.axios.get<GroupEntity[]>('');
    return request.data;
  }

  async findOne(id: number) {
    const request = await this.axios.get<GroupEntity>(`/${id}`);
    return request.data;
  }

  async update(id: number, payload: Partial<UpdateGroupDto>) {
    const request = await this.axios.patch(`/${id}`, payload);
    return request.data;
  }

  async remove(id: number) {
    const request = await this.axios.delete(`/${id}`);
    return request.data;
  }
}
