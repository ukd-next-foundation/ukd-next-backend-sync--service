import { Injectable, Logger } from '@nestjs/common';
import { GroupsService } from '@sync-ukd-service/src/groups/groups.service';
import { UkdScheduleApiService } from '@sync-ukd-service/src/ukd-schedule-api';

@Injectable()
export class SyncUkdGroupsService {
  private readonly logger = new Logger(SyncUkdGroupsService.name);

  constructor(
    private readonly ukdScheduleApiService: UkdScheduleApiService,
    private readonly groupsService: GroupsService,
  ) {}

  async sync() {
    this.logger.log('The process of synchronizing groups with UKD data has begun');

    const result = await this.process();

    if (result.length) {
      this.logger.warn(`Successfully synchronized ${result.length} groups such as: ${result.map((g) => g.name)}.`);
    } else {
      this.logger.log('No new groups found to synchronize');
    }

    return result;
  }

  private async process() {
    const [externalGroups, internalGroups] = await Promise.all([
      this.ukdScheduleApiService.getGroups().then((groups) => Array.from(new Set(groups))),
      this.groupsService.findAll().then((groups) => groups.map((group) => group.name)),
    ]);

    const missingGroups = externalGroups.filter((name) => !internalGroups.includes(name));

    return this.groupsService.create(missingGroups.map((name) => ({ name })));
  }
}
