import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';

import { CreateUserDto } from '@app/src/api/users/dto/create-user.dto';
import { FindAllUsersDto } from '@app/src/api/users/dto/find-all-users.dto';
import { UpdateUserDto } from '@app/src/api/users/dto/update-user.dto';
import { UsersController } from '@app/src/api/users/users.controller';

import { authMainBackendInterceptor, errorInterceptor } from '@sync-ukd-service/common/interceptors';

@Injectable()
export class UsersService implements UsersController {
  private readonly logger = new Logger(UsersController.name);
  private readonly axios = this.httpService.axiosRef;

  constructor(private readonly httpService: HttpService) {
    authMainBackendInterceptor(this.axios.interceptors);
    errorInterceptor(this.axios.interceptors, this.logger);
  }

  // @ts-ignore
  async createMany(payload: CreateUserDto[]) {
    const request = await this.axios.post('/many', payload);
    return request.data as ReturnType<UsersController['createMany']>;
  }

  // @ts-ignore
  async findAll(params?: FindAllUsersDto) {
    const request = await this.axios.get('', { params });
    return request.data as ReturnType<UsersController['findAll']>;
  }

  // @ts-ignore
  async findMe() {
    const request = await this.axios.get('/profile');
    return request.data as ReturnType<UsersController['findMe']>;
  }

  // @ts-ignore
  async findOne(id: string) {
    const request = await this.axios.get(`/${id}`);
    return request.data as ReturnType<UsersController['findOne']>;
  }

  // @ts-ignore
  async update(payload: UpdateUserDto) {
    const request = await this.axios.patch('/', payload);
    return request.data as ReturnType<UsersController['update']>;
  }

  // @ts-ignore
  async remove(id: string) {
    const request = await this.axios.delete(`/${id}`);
    return request.data as ReturnType<UsersController['remove']>;
  }
}
