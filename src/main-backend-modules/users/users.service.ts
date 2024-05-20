import { CreateUserDto } from '@app/src/core/users/dto/create-user.dto';
import { FindAllUsersDto } from '@app/src/core/users/dto/find-all-users.dto';
import { UpdateUserDto } from '@app/src/core/users/dto/update-user.dto';
import { UserEntity } from '@app/src/core/users/entities/user.entity';
import { UsersController } from '@app/src/core/users/users.controller';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { authMainBackendInterceptor, errorInterceptor } from '@sync-ukd-service/common/interceptors';

@Injectable()
export class UsersService extends UsersController {
  private readonly logger = new Logger(UsersController.name);
  private readonly axios = this.httpService.axiosRef;

  constructor(private readonly httpService: HttpService) {
    // @ts-ignore
    super();
    authMainBackendInterceptor(this.axios.interceptors);
    errorInterceptor(this.axios.interceptors, this.logger);
  }

  async create(payload: CreateUserDto[]) {
    const request = await this.axios.post<UserEntity[]>('', payload);
    return request.data;
  }

  async findAll(params?: FindAllUsersDto) {
    const request = await this.axios.get<UserEntity[]>('', { params });
    return request.data;
  }

  // @ts-ignore
  async findMe() {
    const request = await this.axios.get<UserEntity>('/profile');
    return request.data;
  }

  async findOne(id: number) {
    const request = await this.axios.get<UserEntity>(`/${id}`);
    return request.data;
  }

  async update(id: number, payload: UpdateUserDto) {
    const request = await this.axios.patch(`/${id}`, payload);
    return request.data;
  }

  async remove(id: number) {
    const request = await this.axios.delete(`/${id}`);
    return request.data;
  }
}
