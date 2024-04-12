import { Module } from '@nestjs/common';
import { SyncUkdDaemonService } from './services/sync-ukd-daemon.service';
import { SyncUkdGroupsService } from './services/sync-ukd-groups.service';
import { SyncUkdJornalsService } from './services/sync-ukd-jornals.service';
import { SyncUkdSchedulesService } from './services/sync-ukd-schedules.service';
import { GroupsModule } from '../groups/groups.module';
import { UsersModule } from '../users/users.module';
import { ClassroomsModule } from '../classrooms/classrooms.module';
import { SchedulesModule } from '../schedules/schedules.module';
import { LessonsModule } from '../lessons/lessons.module';
import { SyncUkdTeachersService } from './services/sync-ukd-teachers.service';
import { DecanatPlusPlusModule } from '../decanat-plus-plus/decanat-plus-plus.module';
import { SyncUkdLessonsService } from './services/sync-ukd-lessons.service';
import { SyncUkdDepartmentsService } from './services/sync-ukd-departments.service';
import { DepartmentsModule } from '../departments/departments.module';

@Module({
  imports: [
    ClassroomsModule,
    GroupsModule,
    LessonsModule,
    SchedulesModule,
    DepartmentsModule,
    UsersModule,
    DecanatPlusPlusModule,
  ],
  providers: [
    SyncUkdDaemonService,
    SyncUkdDepartmentsService,
    SyncUkdGroupsService,
    SyncUkdJornalsService,
    SyncUkdLessonsService,
    SyncUkdSchedulesService,
    SyncUkdTeachersService,
  ],
  exports: [
    SyncUkdDaemonService,
    SyncUkdDepartmentsService,
    SyncUkdGroupsService,
    SyncUkdJornalsService,
    SyncUkdLessonsService,
    SyncUkdSchedulesService,
    SyncUkdTeachersService,
  ],
})
export class SyncUkdDataModule {}
