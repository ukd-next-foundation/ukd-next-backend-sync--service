import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { config } from '@sync-ukd-service/src/configs';
import { SyncUkdDataModule } from './sync-ukd-data/sync-ukd-data.module';
import { DecanatPlusPlusModule } from './decanat-plus-plus/decanat-plus-plus.module';
import { DepartmentsModule } from './departments/departments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
      cache: true,
    }),
    ScheduleModule.forRoot(),
    SyncUkdDataModule,
    DecanatPlusPlusModule,
    DepartmentsModule,
  ],
})
export class AppModule {}
