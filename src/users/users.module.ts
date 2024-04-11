import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { HttpModule } from '@nestjs/axios';
import { GlobalConfig, GlobalConfigType } from '@sync-ukd-service/src/configs';

@Module({
  imports: [
    HttpModule.registerAsync({
      inject: [GlobalConfig],
      useFactory: (config: GlobalConfigType) => ({
        baseURL: `${config.apiUrl}/users`,
        headers: { Authorization: `Bearer ${config.apiAccessToken}` },
      }),
    }),
  ],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
