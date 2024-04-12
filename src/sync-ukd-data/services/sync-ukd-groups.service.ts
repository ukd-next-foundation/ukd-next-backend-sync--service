import { Injectable, Logger } from '@nestjs/common';
import { findMissingValues } from '@sync-ukd-service/common/functions';
import { DecanatPlusPlusService } from '@sync-ukd-service/src/decanat-plus-plus/decanat-plus-plus.service';
import { GroupsService } from '@sync-ukd-service/src/groups/groups.service';

@Injectable()
export class SyncUkdGroupsService {
  private readonly logger = new Logger(SyncUkdGroupsService.name);

  constructor(
    private readonly decanatPlusPlusService: DecanatPlusPlusService,
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
      this.decanatPlusPlusService.getGroups(),
      this.groupsService.findAll().then((groups) => groups.map((group) => group.name)),
    ]);

    const missingGroups = findMissingValues(externalGroups, internalGroups);

    return this.groupsService.create(missingGroups.map((name) => ({ name })));
  }
}
