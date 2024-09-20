import { Injectable, Logger } from '@nestjs/common';

import { findMissingValues } from '@sync-ukd-service/common/functions';
import { DecanatPlusPlusService } from '@sync-ukd-service/src/decanat-plus-plus/decanat-plus-plus.service';
import { ClassroomsService } from '@sync-ukd-service/src/main-backend-modules/classrooms/classrooms.service';

@Injectable()
export class SyncUkdClassroomsService {
  private readonly logger = new Logger(SyncUkdClassroomsService.name);

  constructor(
    private readonly decanatPlusPlusService: DecanatPlusPlusService,
    private readonly classroomsService: ClassroomsService,
  ) {}

  async sync() {
    this.logger.log('The process of synchronizing classrooms with UKD data has begun');

    const result = await this.process();

    if (result.length) {
      const newClassrooms = result.map(({ name }) => name).join(', ');
      this.logger.warn(`Successfully synchronized ${result.length} classrooms such as: ${newClassrooms}.`);
    } else {
      this.logger.log('No found new classrooms to synchronize');
    }

    return result;
  }

  private async process() {
    const [externalClassrooms, internalClassrooms] = await Promise.all([
      this.decanatPlusPlusService.getClassrooms(),
      this.classroomsService.findAll().then((classrooms) => classrooms.map((classroom) => classroom.name)),
    ]);

    const results = [];
    const missingClassrooms = findMissingValues(externalClassrooms, internalClassrooms);

    for (const missingClassroom of missingClassrooms) {
      results.push(
        await this.classroomsService.create({
          name: missingClassroom,
          numberOfSeats: 0,
        } as any),
      );
    }

    return results;
  }
}
