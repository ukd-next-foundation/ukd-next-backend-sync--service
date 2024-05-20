import { Module } from '@nestjs/common';
import { JournalsService } from './journals.service';
import { GlobalConfig, GlobalConfigType } from '@sync-ukd-service/src/configs';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.registerAsync({
      inject: [GlobalConfig],
      useFactory: (config: GlobalConfigType) => ({ baseURL: `${config.apiUrl}/journals` }),
    }),
  ],
  providers: [JournalsService],
  exports: [JournalsService],
})
export class JournalsModule {}
