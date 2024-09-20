import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { GlobalConfig, GlobalConfigType } from '@sync-ukd-service/src/configs';

import { ClassroomsService } from './classrooms.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      inject: [GlobalConfig],
      useFactory: (config: GlobalConfigType) => ({ baseURL: `${config.apiUrl}/classrooms` }),
    }),
  ],
  providers: [ClassroomsService],
  exports: [ClassroomsService],
})
export class ClassroomsModule {}
