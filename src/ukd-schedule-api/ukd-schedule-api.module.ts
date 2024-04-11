import { Module } from '@nestjs/common';
import { UkdScheduleApiService } from './ukd-schedule-api.service';
import { HttpModule } from '@nestjs/axios';
import { GlobalConfig, GlobalConfigType } from '@sync-ukd-service/src/configs';

@Module({
  imports: [
    HttpModule.registerAsync({
      inject: [GlobalConfig],
      useFactory: (config: GlobalConfigType) => ({
        baseURL: config.ukdScheduleApiUrl,
      }),
    }),
  ],
  providers: [UkdScheduleApiService],
  exports: [UkdScheduleApiService],
})
export class UkdScheduleApiModule {}
