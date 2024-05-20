import crypto from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';
import { JournalsService } from '@sync-ukd-service/src/main-backend-modules/journals/journals.service';
import { CreateJournalDto } from '@app/src/core/journals/dto/create-journal.dto';
import { UsersService } from '@sync-ukd-service/src/main-backend-modules/users/users.service';
import { SchedulesService } from '@sync-ukd-service/src/main-backend-modules/schedules/schedules.service';
import { LessonsService } from '@sync-ukd-service/src/main-backend-modules/lessons/lessons.service';
import { getFindFunction, twoParallelProcesses } from '@sync-ukd-service/common/functions';
import { GoogleSheetsService } from '@sync-ukd-service/src/google-sheets/google-sheets.service';
import { GroupsService } from '@sync-ukd-service/src/main-backend-modules/groups/groups.service';
import { JournalEntity } from '@app/src/core/journals/entities/journal.entity';
import { IJournal, IJournalSharedData, IStudentScore } from '../interfaces';
import { journalNextActionsType } from '../types';

@Injectable()
export class SyncUkdJournalsService {
  constructor(
    private readonly usersService: UsersService,
    private readonly groupsService: GroupsService,
    private readonly lessonsService: LessonsService,
    private readonly journalsService: JournalsService,
    private readonly schedulesService: SchedulesService,
    private readonly googleSheetsService: GoogleSheetsService,
  ) {}

  private logger = new Logger(SyncUkdJournalsService.name);

  async sync() {
    const serviceAccount = await this.usersService.findMe();
    const [journals, schedules, lessons, groups, users] = await Promise.all([
      this.journalsService.findAll({ teacherId: serviceAccount.id, onlyIds: true }),
      this.schedulesService.findAll(),
      this.lessonsService.findAll(),
      this.groupsService.findAll(),
      this.usersService.findAll(),
    ]);

    const sharedData = {
      findLessonFn: getFindFunction(lessons.map((lesson) => lesson.name)),
      findUserFn: getFindFunction(users.map((user) => user.fullname)),
      serviceAccount,
      schedules,
      journals,
      lessons,
      groups,
      users,
    };

    await twoParallelProcesses<IJournal>(
      (pushFn) => this.processOfSyncJournals(sharedData, pushFn),
      (item) => this.processOfParseJournals(sharedData, item),
    );
  }

  private async processOfSyncJournals(sharedData: IJournalSharedData, push: (item: IJournal) => number) {
    const groups = sharedData.groups.filter((g) => !!g.googleSheetsURL);

    for (const group of groups) {
      this.logger.log(`Sync journal '${group.name}' ${groups.indexOf(group)} of ${groups.length}`);

      try {
        const spreadsheetId = this.googleSheetsService.getTableId(group.googleSheetsURL);
        const table = await this.googleSheetsService.getTableDate(spreadsheetId);

        const checksum = this.getChecksum(JSON.stringify(table));
        if (checksum === group.checksumOfJournalContent) continue;

        push({ group, table, checksum });
      } catch (error) {
        this.logger.error(error);
      }
    }
  }

  private async processOfParseJournals(sharedData: IJournalSharedData, journal: IJournal) {
    this.logger.log(`Start of parse journal '${journal.group.name}'`);

    const newScores = await this.parseRawSheets(sharedData, journal);
    const actions = this.getNextActionsFromDataDifference(sharedData.journals, newScores);

    await this.journalsService.create(actions.create);
    await this.journalsService.updateMany(actions.update.map(({ id, type, date }) => ({ id, type, date })));
    await this.journalsService.removeMany(actions.delete.map(({ id }) => id));
    await this.groupsService.update(journal.group.id, { checksumOfJournalContent: journal.checksum });

    this.logger.log(
      `Successfully parse journal '${journal.group.name}' and created: ${actions.create.length}, updated: ${actions.update.length}, deleted: ${actions.delete.length} scores.`,
    );
  }

  private async parseRawSheets(sharedData: IJournalSharedData, journal: IJournal): Promise<CreateJournalDto[]> {
    const results: CreateJournalDto[] = [];

    for (const sheet of journal.table.valueRanges) {
      if (sheet.values === undefined) continue;

      const sheetName = sheet.range.split("'!")[0].slice(1);
      const studentsScores = this.getStudentsScores(sheet.values.filter((row) => row.length));

      if (!Object.keys(studentsScores).length) continue;

      let lessonName = sharedData.findLessonFn(sheetName);

      if (!lessonName) {
        this.logger.warn(`Lesson: '${sheetName}' not found`);
        lessonName = await this.createAndUpdateLessons(sharedData, sheetName);
      }

      const lessonId = sharedData.lessons.find((lesson) => lesson.name === lessonName).id;

      for (const [studentName, scores] of Object.entries(studentsScores)) {
        const student = sharedData.findUserFn(studentName);

        if (!student) {
          this.logger.warn(`Student: '${studentName}' not found from lesson: '${lessonName}'`);
          continue;
        }

        const studentId = sharedData.users.find((user) => user.fullname === student).id;

        for (const score of scores) {
          if (score.value.length >= 3) continue;

          const date = this.getClearDateValue(score.date);
          const dateStr = date ? date.toISOString().split('T')[0] : null;

          const schedule = sharedData.schedules.filter(
            (schedule) =>
              schedule.groups.some((groups) => groups.name === journal.group.name) &&
              (schedule.date as unknown as string) === dateStr &&
              schedule.lesson.id === lessonId,
          );

          results.push({
            date,
            mark: score.value,
            lessonId: lessonId,
            studentId: studentId,
            teacherId: sharedData.serviceAccount.id,
            type: schedule.length ? schedule[0].type : null,
          });
        }
      }
    }

    return results;
  }

  private getStudentsScores(table: string[][]): Record<string, IStudentScore[]> {
    const students = this.sliceTable(table, 2, 2, 5);
    const rawScores = this.getRawScoresTable(table);

    const topics = rawScores[1];
    const dates = rawScores[2];
    const data = rawScores.slice(3);
    const results = {};

    for (const [rowIndex, row] of Object.entries(data)) {
      const scores = [];
      const student = students[rowIndex].pop();

      if (!student) continue;

      for (const [valIndex, value] of Object.entries(row)) {
        if (value) {
          scores.push({ topic: topics[valIndex], date: dates[valIndex], value });
        }
      }

      results[student] = scores;
    }

    return results;
  }

  private getRawScoresTable(table: string[][]) {
    const fromColumn = 4;
    const fromRow = 2;

    const header = this.sliceTable(table, fromColumn, Infinity, fromRow, fromRow).pop();
    let headerСounter = 0;
    let headerLength = 0;

    for (const index in header) {
      if (header[index].length > 4 && ++headerСounter === 3) {
        headerLength = +index - 1;
        break;
      }
    }

    return this.sliceTable(table, fromColumn, fromColumn + headerLength, fromRow);
  }

  private getNextActionsFromDataDifference(rawPrewScores: CreateJournalDto[], rawNewScores: JournalEntity[]) {
    const newScoresMap = this.dataPreparation(rawNewScores);
    const prewScoresMap = this.dataPreparation(rawPrewScores);
    const actions: journalNextActionsType = { create: [], update: [], delete: [] };

    for (const [key, newScores] of newScoresMap.entries()) {
      const prewScores = prewScoresMap.get(key);

      if (prewScores === undefined) {
        actions.create.push(...newScores);
        continue;
      }

      if (newScores.length < prewScores.length) {
        actions.delete.push(...prewScores.slice(newScores.length));
      }

      for (const index in newScores) {
        const prewScore = prewScores[index];
        const newScore = newScores[index];
        const updateObj = {};

        if (prewScore === undefined) {
          actions.create.push(newScore);
          continue;
        }

        if (newScore.mark !== prewScore.mark) {
          actions.create.push(newScore);
          actions.delete.push(prewScore);
          continue;
        }

        if (newScore.type !== prewScore.type) {
          updateObj['type'] = newScore.type;
        }

        if (`${newScore.date}`.split('T')[0] !== `${prewScore.date}`.split('T')[0]) {
          updateObj['date'] = newScore.date;
        }

        if (Object.keys(updateObj).length) {
          actions.update.push({ ...prewScore, ...updateObj });
        }
      }
    }

    return actions;
  }

  private dataPreparation<T extends CreateJournalDto>(scores: T[]) {
    const map: Map<string, T[]> = new Map();

    scores.forEach((score) => {
      const key = score.lessonId + '|' + score.studentId;
      map.has(key) ? map.get(key).push(score) : map.set(key, [score]);
    });

    return map;
  }

  private getChecksum(payload: string) {
    const hash = crypto.createHash('sha256');
    hash.update(payload);
    return hash.digest('hex');
  }

  private async createAndUpdateLessons(sharedData: IJournalSharedData, newLessonName: string) {
    const newLesson = await this.lessonsService.create({ name: newLessonName });
    sharedData.lessons.push(newLesson);
    sharedData.findLessonFn = getFindFunction(sharedData.lessons.map((lesson) => lesson.name));

    return newLesson.name;
  }

  private sliceTable(table: string[][], columnFrom: number, columnTo: number, rowFrom: number, rowTo?: number) {
    return table.slice(rowFrom - 1, rowTo).map((row) => row.slice(columnFrom - 1, columnTo));
  }

  private getClearDateValue(value: string) {
    if (!value) return null;

    const digitsOnly = value.replace(/[^\d]+/g, '');

    if (digitsOnly.length < 4) return null;

    const day = digitsOnly.slice(0, 2);
    const month = digitsOnly.slice(2, 4);
    let year = digitsOnly.slice(4, 8);

    if (!day || !month || isNaN(+day) || isNaN(+month) || +day > 31 || +month > 12) {
      return null;
    }

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const yearsRange = [currentYear - 2, currentYear - 1, currentYear];

    if (!year) {
      year = currentYear.toString();
    }

    if (year.length == 2) {
      year = `20${year}`;
    }

    if (!yearsRange.includes(+year)) {
      year = currentYear.toString();
    }

    return new Date(+year, +month - 1, +day + 1);
  }
}
