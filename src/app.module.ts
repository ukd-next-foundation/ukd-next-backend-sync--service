import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { config } from '@sync-ukd-service/src/configs';
import { SyncUkdDataModule } from './sync-ukd-data/sync-ukd-data.module';
import { DecanatPlusPlusModule } from './decanat-plus-plus/decanat-plus-plus.module';
import { DepartmentsModule } from './main-backend-modules/departments/departments.module';
import { JournalsModule } from './main-backend-modules/journals/journals.module';
import { ServiceAccountModule } from './service-account/service-account.module';
import { GoogleSheetsModule } from './google-sheets/google-sheets.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
      cache: true,
    }),
    ScheduleModule.forRoot(),
    ServiceAccountModule,
    SyncUkdDataModule,
    DecanatPlusPlusModule,
    DepartmentsModule,
    JournalsModule,
    GoogleSheetsModule,
  ],
})
export class AppModule {}
