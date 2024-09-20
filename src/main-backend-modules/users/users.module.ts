import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { GlobalConfig, GlobalConfigType } from '@sync-ukd-service/src/configs';

import { UsersService } from './users.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      inject: [GlobalConfig],
      useFactory: (config: GlobalConfigType) => ({ baseURL: `${config.apiUrl}/users` }),
    }),
  ],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
