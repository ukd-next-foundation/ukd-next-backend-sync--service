import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { GlobalConfig, GlobalConfigType } from '@sync-ukd-service/src/configs';

import { DepartmentsService } from './departments.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      inject: [GlobalConfig],
      useFactory: (config: GlobalConfigType) => ({ baseURL: `${config.apiUrl}/departments` }),
    }),
  ],
  providers: [DepartmentsService],
  exports: [DepartmentsService],
})
export class DepartmentsModule {}
