import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { GlobalConfig, GlobalConfigType } from '@sync-ukd-service/src/configs';

import { SchedulesService } from './schedules.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      inject: [GlobalConfig],
      useFactory: (config: GlobalConfigType) => ({ baseURL: `${config.apiUrl}/schedules` }),
    }),
  ],
  providers: [SchedulesService],
  exports: [SchedulesService],
})
export class SchedulesModule {}
