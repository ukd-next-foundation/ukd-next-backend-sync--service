import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { GlobalConfig, GlobalConfigType } from '@sync-ukd-service/src/configs';

import { LessonsService } from './lessons.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      inject: [GlobalConfig],
      useFactory: (config: GlobalConfigType) => ({ baseURL: `${config.apiUrl}/lessons` }),
    }),
  ],
  providers: [LessonsService],
  exports: [LessonsService],
})
export class LessonsModule {}
