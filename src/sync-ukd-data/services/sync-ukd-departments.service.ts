import { Injectable, Logger } from '@nestjs/common';
import { DecanatPlusPlusService } from '@sync-ukd-service/src/decanat-plus-plus/decanat-plus-plus.service';
import { LessonsService } from '@sync-ukd-service/src/lessons/lessons.service';

@Injectable()
export class SyncUkdLessonsService {
  private readonly logger = new Logger(SyncUkdLessonsService.name);

  constructor(
    private readonly decanatPlusPlusService: DecanatPlusPlusService,
    private readonly lessonsService: LessonsService,
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
    const externalLessons = this.decanatPlusPlusService.getLessons();
    const internalLessons = await this.lessonsService.findAll().then((lessons) => lessons.map((lesson) => lesson.name));

    const missingLessons = externalLessons.filter(({ lessonName }) => !internalLessons.includes(lessonName));
    const results = [];

    for (const {lessonName} of missingLessons) {
      // results.push(await this.lessonsService.create({})
    }

    return results;
  }
}
