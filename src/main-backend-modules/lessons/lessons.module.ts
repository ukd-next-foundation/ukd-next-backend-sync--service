import { Module } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { HttpModule } from '@nestjs/axios';
import { GlobalConfig, GlobalConfigType } from '@sync-ukd-service/src/configs';

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
