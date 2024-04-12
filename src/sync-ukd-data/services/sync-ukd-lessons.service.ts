import { Injectable, Logger } from '@nestjs/common';
import { DecanatPlusPlusService } from '@sync-ukd-service/src/decanat-plus-plus/decanat-plus-plus.service';
import { LessonsService } from '@sync-ukd-service/src/lessons/lessons.service';
import { SyncUkdDepartmentsService } from './sync-ukd-departments.service';
import { DepartmentsService } from '@sync-ukd-service/src/departments/departments.service';

@Injectable()
export class SyncUkdLessonsService {
  private readonly logger = new Logger(SyncUkdLessonsService.name);

  constructor(
    private readonly syncUkdDepartmentsService: SyncUkdDepartmentsService,
    private readonly decanatPlusPlusService: DecanatPlusPlusService,
    private readonly departmentsService: DepartmentsService,
    private readonly lessonsService: LessonsService,
  ) {}

  async sync() {
    this.logger.log('The process of synchronizing lessons with UKD data has begun');

    await this.syncUkdDepartmentsService.sync();
    const result = await this.process();

    if (result.length) {
      this.logger.warn(`Successfully synchronized ${result.length} lessons such as: ${result.map((g) => g.name)}.`);
    } else {
      this.logger.log('No new lessons found to synchronize');
    }

    return result;
  }

  private async process() {
    const departments = await this.departmentsService.findAll();
    const externalLessons = this.decanatPlusPlusService.getLessons();
    const internalLessons = await this.lessonsService.findAll().then((lessons) => lessons.map((lesson) => lesson.name));

    const results = [];
    const missingLessons = externalLessons.filter(({ lessonName }) => !internalLessons.includes(lessonName));

    for (const { departmentName, lessonName } of missingLessons) {
      const department = departments
        .filter(({ name }) => !name.toLocaleLowerCase().includes(departmentName.toLocaleLowerCase()))
        .shift();

      if (department) {
        results.push(await this.lessonsService.create({ departmentId: department.id, name: lessonName }));
      } else {
        this.logger.warn(`Not found department: "${departmentName}" for this lesson: "${lessonName}"`);
      }
    }

    return results;
  }
}
