import { Module } from '@nestjs/common';
import { ClassroomsService } from './classrooms.service';
import { GlobalConfig, GlobalConfigType } from '@sync-ukd-service/src/configs';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.registerAsync({
      inject: [GlobalConfig],
      useFactory: (config: GlobalConfigType) => ({
        baseURL: `${config.apiUrl}/classrooms`,
        headers: { Authorization: `Bearer ${config.apiAccessToken}` },
      }),
    }),
  ],
  providers: [ClassroomsService],
  exports: [ClassroomsService],
})
export class ClassroomsModule {}
