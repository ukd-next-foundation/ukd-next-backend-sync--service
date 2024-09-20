import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { ServiceAccountService } from './service-account.service';

@Module({
  imports: [HttpModule.register({})],
  providers: [ServiceAccountService],
  exports: [ServiceAccountService],
})
export class ServiceAccountModule {}
