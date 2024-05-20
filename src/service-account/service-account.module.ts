import { Module } from '@nestjs/common';
import { ServiceAccountService } from './service-account.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule.register({})],
  providers: [ServiceAccountService],
  exports: [ServiceAccountService],
})
export class ServiceAccountModule {}
