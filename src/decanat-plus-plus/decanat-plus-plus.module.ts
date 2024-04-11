import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GlobalConfig, GlobalConfigType } from '@sync-ukd-service/src/configs';
import { DecanatPlusPlusService } from './decanat-plus-plus.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      inject: [GlobalConfig],
      useFactory: (config: GlobalConfigType) => ({
        baseURL: `${config.decanatPlusPlusUrl}/cgi-bin`,
        params: { coding_mode: 'UTF8', req_format: 'json', bs: 'ok' },
      }),
    }),
  ],
  providers: [DecanatPlusPlusService],
  exports: [DecanatPlusPlusService],
})
export class DecanatPlusPlusModule {}
