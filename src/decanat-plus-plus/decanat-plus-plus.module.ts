import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { DecanatPlusPlusService } from './decanat-plus-plus.service';

@Module({
  imports: [
    HttpModule.register({
      params: { coding_mode: 'UTF8', req_format: 'json', bs: 'ok' },
    }),
  ],
  providers: [DecanatPlusPlusService],
  exports: [DecanatPlusPlusService],
})
export class DecanatPlusPlusModule {}
