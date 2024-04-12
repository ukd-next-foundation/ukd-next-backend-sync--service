import { Injectable, Logger } from '@nestjs/common';
import { SyncUkdGroupsService } from './sync-ukd-groups.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SyncUkdJornalsService } from './sync-ukd-jornals.service';
import { SyncUkdSchedulesService } from './sync-ukd-schedules.service';
import { SyncUkdTeachersService } from './sync-ukd-teachers.service';

@Injectable()
export class SyncUkdDaemonService {
  private readonly logger = new Logger(SyncUkdDaemonService.name);

  constructor(
    private readonly syncUkdGroupsService: SyncUkdGroupsService,
    private readonly syncUkdJornalsService: SyncUkdJornalsService,
    private readonly syncUkdTeachersService: SyncUkdTeachersService,
    private readonly syncUkdSchedulesService: SyncUkdSchedulesService,
  ) {}

  // @Cron(CronExpression.EVERY_DAY_AT_7PM)
  async syncGroups() {
    this.syncUkdGroupsService.sync();
  }

  async syncDailySchedules() {
    // await this.syncUkdTeachersService.sync();
    await this.syncUkdSchedulesService.sync(new Date(), new Date());
  }

  async syncWeeklySchedules() {}

  async syncMonthlySchedules() {}
}
