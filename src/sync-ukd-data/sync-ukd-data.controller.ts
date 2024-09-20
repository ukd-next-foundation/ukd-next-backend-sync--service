import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { SyncUkdClassroomsService } from './services/sync-ukd-classrooms.service';
import { SyncUkdGroupsService } from './services/sync-ukd-groups.service';
import { SyncUkdJournalsService } from './services/sync-ukd-journals.service';
import { SyncUkdSchedulesService } from './services/sync-ukd-schedules.service';
import { SyncUkdTeachersService } from './services/sync-ukd-teachers.service';

@Injectable()
export class SyncUkdDataController implements OnApplicationBootstrap {
  constructor(
    private readonly syncUkdGroupsService: SyncUkdGroupsService,
    private readonly syncUkdJournalsService: SyncUkdJournalsService,
    private readonly syncUkdTeachersService: SyncUkdTeachersService,
    private readonly syncUkdSchedulesService: SyncUkdSchedulesService,
    private readonly syncUkdClassroomsService: SyncUkdClassroomsService,
  ) {}

  async onApplicationBootstrap() {
    await this.syncOtherData();
  }

  @Cron(CronExpression.EVERY_HOUR)
  async syncJournals() {
    await this.syncUkdJournalsService.sync();
  }

  @Cron(CronExpression.EVERY_HOUR)
  async sync2WeeklySchedules() {
    const to = new Date();
    to.setDate(to.getDate() + 14);

    await this.syncUkdSchedulesService.sync(new Date(), to);
  }

  @Cron(CronExpression.EVERY_DAY_AT_7PM)
  async sync4MonthlySchedules() {
    const to = new Date();
    to.setMonth(to.getMonth() + 4);

    await this.syncUkdSchedulesService.sync(new Date(), to);
  }

  @Cron(CronExpression.EVERY_DAY_AT_7PM)
  async syncOtherData() {
    await this.syncUkdGroupsService.sync();
    await this.syncUkdTeachersService.sync();
    await this.syncUkdClassroomsService.sync();
  }
}
