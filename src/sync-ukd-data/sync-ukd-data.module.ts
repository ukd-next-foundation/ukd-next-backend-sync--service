import { Module } from '@nestjs/common';
import { SyncUkdGroupsService } from './services/sync-ukd-groups.service';
import { SyncUkdSchedulesService } from './services/sync-ukd-schedules.service';
import { GroupsModule } from '../main-backend-modules/groups/groups.module';
import { UsersModule } from '../main-backend-modules/users/users.module';
import { ClassroomsModule } from '../main-backend-modules/classrooms/classrooms.module';
import { SchedulesModule } from '../main-backend-modules/schedules/schedules.module';
import { LessonsModule } from '../main-backend-modules/lessons/lessons.module';
import { SyncUkdTeachersService } from './services/sync-ukd-teachers.service';
import { DecanatPlusPlusModule } from '../decanat-plus-plus/decanat-plus-plus.module';
import { DepartmentsModule } from '../main-backend-modules/departments/departments.module';
import { SyncUkdDataController } from './sync-ukd-data.controller';
import { SyncUkdClassroomsService } from './services/sync-ukd-classrooms.service';
import { JournalsModule } from '../main-backend-modules/journals/journals.module';
import { SyncUkdJournalsService } from './services/sync-ukd-journals.service';
import { ServiceAccountModule } from '../service-account/service-account.module';
import { GoogleSheetsModule } from '../google-sheets/google-sheets.module';

@Module({
  imports: [
    UsersModule,
    GroupsModule,
    LessonsModule,
    JournalsModule,
    SchedulesModule,
    ClassroomsModule,
    DepartmentsModule,
    GoogleSheetsModule,
    ServiceAccountModule,
    DecanatPlusPlusModule,
  ],
  providers: [
    SyncUkdClassroomsService,
    SyncUkdGroupsService,
    SyncUkdJournalsService,
    SyncUkdSchedulesService,
    SyncUkdTeachersService,
  ],
  controllers: [SyncUkdDataController],
})
export class SyncUkdDataModule {}
