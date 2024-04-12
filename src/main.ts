import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SyncUkdDataModule } from './sync-ukd-data/sync-ukd-data.module';
import { SyncUkdDaemonService } from './sync-ukd-data/services/sync-ukd-daemon.service';
import { DecanatPlusPlusModule } from './decanat-plus-plus/decanat-plus-plus.module';
import { DecanatPlusPlusService } from './decanat-plus-plus/decanat-plus-plus.service';
import { writeFile } from 'fs/promises';
import { SyncUkdDepartmentsService } from './sync-ukd-data/services/sync-ukd-departments.service';
import { SyncUkdGroupsService } from './sync-ukd-data/services/sync-ukd-groups.service';
import { SyncUkdTeachersService } from './sync-ukd-data/services/sync-ukd-teachers.service';
import { SyncUkdLessonsService } from './sync-ukd-data/services/sync-ukd-lessons.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  // await app.init();
  const methods = app.select(SyncUkdDataModule).get(SyncUkdDaemonService, { strict: true });

  await methods.syncDailySchedules();

  // console.log(await methods.getSchedule('МІПЗс-23-1', new Date(), new Date()));
  // console.log(await methods.getClassroomsTypes())
}
bootstrap();
