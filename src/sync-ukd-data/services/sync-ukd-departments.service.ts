import { Injectable, Logger } from '@nestjs/common';
import { findMissingValues } from '@sync-ukd-service/common/functions';
import { DecanatPlusPlusService } from '@sync-ukd-service/src/decanat-plus-plus/decanat-plus-plus.service';
import { DepartmentsService } from '@sync-ukd-service/src/departments/departments.service';

@Injectable()
export class SyncUkdDepartmentsService {
  private readonly logger = new Logger(SyncUkdDepartmentsService.name);

  constructor(
    private readonly decanatPlusPlusService: DecanatPlusPlusService,
    private readonly departmentsService: DepartmentsService,
  ) {}

  async sync() {
    this.logger.log('The process of synchronizing departments with UKD data has begun');

    const result = await this.process();

    if (result.length) {
      this.logger.warn(`Successfully synchronized ${result.length} departments such as: ${result.map((g) => g.name)}.`);
    } else {
      this.logger.log('No new departments found to synchronize');
    }

    return result;
  }

  private async process() {
    const externalDepartments = this.decanatPlusPlusService.getLessons().map((values) => values.departmentName);
    const internalDepartments = await this.departmentsService
      .findAll()
      .then((departments) => departments.map((department) => department.name));

    const results = [];
    const missingDepartments = findMissingValues(externalDepartments, internalDepartments);

    for (const name of missingDepartments) {
      results.push(await this.departmentsService.create({ name }));
    }

    return results;
  }
}
