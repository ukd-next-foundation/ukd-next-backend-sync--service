import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from '@sync-ukd-service/src/main-backend-modules/users/users.service';
import { ScheduleType, UserRole } from '@app/src/common/enums';
import { LessonsService } from '@sync-ukd-service/src/main-backend-modules/lessons/lessons.service';
import { ClassroomsService } from '@sync-ukd-service/src/main-backend-modules/classrooms/classrooms.service';
import { SchedulesService } from '@sync-ukd-service/src/main-backend-modules/schedules/schedules.service';
import { GroupsService } from '@sync-ukd-service/src/main-backend-modules/groups/groups.service';
import { GroupEntity } from '@app/src/core/groups/entities/group.entity';
import { DecanatPlusPlusService } from '@sync-ukd-service/src/decanat-plus-plus/decanat-plus-plus.service';
import { IRozkladItem } from '@sync-ukd-service/src/decanat-plus-plus/interfaces';
import { deleteArrayDuplicates, getFindFunction, twoParallelProcesses } from '@sync-ukd-service/common/functions';
import { SyncUkdTeachersService } from './sync-ukd-teachers.service';
import { CreateScheduleDto } from '@app/src/core/schedules/dto/create-schedule.dto';
import { chunkArray } from '@sync-ukd-service/common/functions/chunk-array.function';
import { scheduleNextActionsType } from '../types/schedule-next-actions.type';
import { SharedDataType } from '../types';

@Injectable()
export class SyncUkdSchedulesService {
  private readonly logger = new Logger(SyncUkdSchedulesService.name);

  constructor(
    private readonly decanatPlusPlusService: DecanatPlusPlusService,
    private readonly syncUkdTeachersService: SyncUkdTeachersService,
    private readonly classroomsService: ClassroomsService,
    private readonly schedulesService: SchedulesService,
    private readonly lessonsService: LessonsService,
    private readonly groupsService: GroupsService,
    private readonly usersService: UsersService,
  ) {}

  async sync(from: Date, to: Date) {
    const [schedules, teachers, classrooms, lessons, groups] = await Promise.all([
      this.schedulesService.findAll({ from, to, findAll: true, onlyIds: true }),
      this.usersService.findAll({ role: UserRole.Teacher }),
      this.classroomsService.findAll(),
      this.lessonsService.findAll(),
      this.groupsService.findAll(),
    ]);

    const sharedData: SharedDataType = {
      findTeacherFn: getFindFunction(teachers.map(({ fullname }) => fullname)),
      findClassroomFn: getFindFunction(
        classrooms.map(({ name }) => name),
        true,
      ),
      findLessonFn: getFindFunction(
        lessons.map(({ name }) => name),
        true,
      ),
      scheduleFrom: from,
      newSchedule: [],
      scheduleTo: to,
      classrooms,
      schedules,
      teachers,
      lessons,
      groups,
    };

    await twoParallelProcesses<[IRozkladItem[], GroupEntity]>(
      (pushFn) => this.processOfDataCollection(sharedData, pushFn),
      (item) => this.processOfHandlingData(sharedData, item),
    );

    const actions = this.getNextActionsFromDataDifference(sharedData);

    await Promise.all([
      (async () => {
        for (const createChunk of chunkArray(actions.create, 2_000)) {
          await this.schedulesService.create(createChunk);
        }
      })(),
      (async () => {
        for (const updateChunk of chunkArray(actions.update, 6_000)) {
          await this.schedulesService.updateMany(updateChunk);
        }
      })(),
      (async () => {
        for (const deleteChunk of chunkArray(actions.delete, 10_000)) {
          await this.schedulesService.removeMany(deleteChunk);
        }
      })(),
    ]);

    this.logger.log(
      `Finish sync schedules with results: created: ${actions.create.length}, updated: ${actions.update.length}, deleted: ${actions.delete.length}`,
    );
  }

  private getNextActionsFromDataDifference(sharedData: SharedDataType) {
    sharedData.newSchedule = this.mergeGroups(sharedData.newSchedule);
    sharedData.newSchedule = sharedData.newSchedule.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    const actions: scheduleNextActionsType = { create: [], update: [], foundIds: new Set(), delete: [] };

    sharedData.groups.forEach((group) => {
      const newSchedule = sharedData.newSchedule.filter(({ groupIds }) => groupIds.includes(group.id));
      const oldSchedule = sharedData.schedules.filter(({ groups }) => groups.some(({ id }) => id === group.id));

      newSchedule.forEach((newItem) => {
        const foundItem = oldSchedule.find(
          (oldItem) =>
            newItem.lessonId === oldItem.lessonId &&
            newItem.startAt === oldItem.startAt &&
            newItem.endAt === oldItem.endAt &&
            newItem.date === oldItem.date,
        );

        if (foundItem) {
          actions.foundIds.add(foundItem.id);

          const updateObj = {};

          if (newItem.classroomId !== foundItem.classroomId) updateObj['classroomId'] = newItem.classroomId;
          if (newItem.isCanceled !== foundItem.isCanceled) updateObj['isCanceled'] = newItem.isCanceled;
          if (newItem.teacherId !== foundItem.teacherId) updateObj['teacherId'] = newItem.teacherId;
          if (newItem.type !== foundItem.type) updateObj['type'] = newItem.type;

          if (Object.keys(updateObj).length) {
            actions.update.push({ id: foundItem.id, ...updateObj });
          }
        } else {
          actions.create.push(newItem);
        }
      });
    });

    actions.create = deleteArrayDuplicates(actions.create);
    actions.update = deleteArrayDuplicates(actions.update);
    actions.delete = deleteArrayDuplicates(
      sharedData.schedules.filter(({ id }) => !actions.foundIds.has(id)).map(({ id }) => id),
    );

    return actions;
  }

  private async processOfDataCollection(
    sharedData: SharedDataType,
    push: (item: [IRozkladItem[], GroupEntity]) => number,
  ) {
    for (const currentGroup of sharedData.groups) {
      try {
        let items = await this.decanatPlusPlusService.getSchedule(
          currentGroup.name,
          sharedData.scheduleFrom,
          sharedData.scheduleTo,
        );

        // Only lessons without an event
        items = items.filter((item) => item.title);

        push([items, currentGroup]);
      } catch (error) {
        this.logger.error(error);
      }
    }
  }

  private async processOfHandlingData(sharedData: SharedDataType, item: [IRozkladItem[], GroupEntity]) {
    const [items, currentGroup] = item;
    const result: CreateScheduleDto[] = [];

    for (const item of items) {
      try {
        const [classroom, teacher, lesson] = await Promise.all([
          this.getClassroomForSchedule(sharedData, item),
          this.getTeacherForSchedule(sharedData, item),
          this.getLessonForSchedule(sharedData, item),
        ]);

        result.push({
          isCanceled: this.parseReplacement(item.replacement).isCanceled,
          startAt: item.lesson_time.split('-')[0] + ':00',
          endAt: item.lesson_time.split('-')[1] + ':00',
          type: this.getTypeForSchedule(item.type),
          classroomId: classroom?.id ?? null,
          teacherId: teacher?.id ?? null,
          lessonId: lesson?.id ?? null,
          groupIds: [currentGroup.id],
          date: item.date,
        });
      } catch (error) {
        this.logger.error(error);
      }
    }

    sharedData.newSchedule = sharedData.newSchedule.concat(result);
    this.logger.log(
      `Group ${currentGroup.name}, ${sharedData.groups.indexOf(currentGroup)} of ${sharedData.groups.length} added: ${result.length} schedules`,
    );
  }

  private async getLessonForSchedule(sharedData: SharedDataType, item: IRozkladItem) {
    if (!item.title) return null;

    const foundLesson = sharedData.findLessonFn(item.title);

    if (foundLesson) {
      return sharedData.lessons.find(({ name }) => name === foundLesson);
    }

    this.logger.warn(`Lesson not found for ${JSON.stringify(item)}`);

    const newLesson = await this.lessonsService.create({ name: item.title, departmentId: null });

    sharedData.lessons.push(newLesson);
    sharedData.findLessonFn = getFindFunction(sharedData.lessons.map(({ name }) => name));

    this.logger.log(`Created new lessons ${item.title}`);
    return newLesson;
  }

  private async getTeacherForSchedule(sharedData: SharedDataType, item: IRozkladItem) {
    if (item.replacement) {
      const { newTeacher } = this.parseReplacement(item.replacement);

      if (newTeacher) {
        const foundTeacher = sharedData.findTeacherFn(newTeacher.split('.')[0]);

        if (foundTeacher) {
          return sharedData.teachers.find(({ fullname }) => fullname === foundTeacher);
        }
      }
    }

    if (item.teacher) {
      const foundTeacher = sharedData.findTeacherFn(item.teacher);

      if (foundTeacher) {
        return sharedData.teachers.find(({ fullname }) => fullname === foundTeacher);
      }

      this.logger.warn(`Teacher not found for ${JSON.stringify(item)}`);

      const newTeacherTemplate = this.syncUkdTeachersService.createEmptyTeacher(item.teacher);
      const newTeacher = await this.usersService.create([newTeacherTemplate]).then((arr) => arr.pop());

      sharedData.teachers.push(newTeacher);
      sharedData.findTeacherFn = getFindFunction(sharedData.teachers.map(({ fullname }) => fullname));

      this.logger.log(`Created new teacher ${item.teacher}`);
      return newTeacher;
    }

    return null;
  }

  private async getClassroomForSchedule(sharedData: SharedDataType, item: IRozkladItem) {
    if (item.replacement) {
      const { newClassroom } = this.parseReplacement(item.replacement);

      if (newClassroom) {
        const foundClassroom = sharedData.findClassroomFn(newClassroom);

        if (foundClassroom) {
          return sharedData.classrooms.find(({ name }) => name === foundClassroom);
        }
      }
    }

    if (item.room) {
      const foundClassroom = sharedData.findClassroomFn(item.room);

      if (foundClassroom) {
        return sharedData.classrooms.find(({ name }) => name === foundClassroom);
      }

      this.logger.warn(`Classroom not found for ${JSON.stringify(item)}`);

      const newClassroom = await this.classroomsService.create({ name: item.room, numberOfSeats: 0 });

      sharedData.classrooms.push(newClassroom);
      sharedData.findClassroomFn = getFindFunction(sharedData.classrooms.map(({ name }) => name));

      this.logger.log(`Created new classroom ${item.room}`);
      return newClassroom;
    }

    if (item.online) {
      const onlineClassroom = sharedData.classrooms.filter(({ onlineLink }) => onlineLink === item.link)[0];

      if (onlineClassroom?.name) return onlineClassroom;

      this.logger.warn(`Online classroom not found for ${JSON.stringify(item)}`);

      const newOnlineClassroom = await this.classroomsService.create({
        name: item.link.split('/')[2],
        numberOfSeats: 0,
        isOnline: true,
        onlineLink: item.link,
      });

      sharedData.classrooms.push(newOnlineClassroom);

      this.logger.log(`Created new online classroom with link: ${item.link}`);
      return newOnlineClassroom;
    }

    return null;
  }

  private parseReplacement(payload: string) {
    const results = { isCanceled: false, newTeacher: '', newClassroom: '' };

    if (payload.includes('Заняття відмінено!')) {
      results.isCanceled = true;
    }

    if (payload.includes('Заміна!') && payload.includes('замість:')) {
      results.newTeacher = payload.split('Заміна!')[1].split('замість:')[0].trim();
    }

    if (payload.includes('Заняття перенесено у іншу аудиторію')) {
      const arr = payload.split('Заняття перенесено у іншу аудиторію');
      results.newClassroom = arr[1].split('!')[0].trim();
    }

    return results;
  }

  private getTypeForSchedule(value: string): ScheduleType | null {
    const values = {
      Л: ScheduleType.Lecture,
      Пр: ScheduleType.Practical,
      Сем: ScheduleType.Seminar,
      Екз: ScheduleType.Exam,
      Зал: ScheduleType.CreditWork,
      Под: ScheduleType.GroupSession,
      ІЗд: ScheduleType.IndividualMeeting,
    };
    return values[value] ?? null;
  }

  private mergeGroups(schedule: CreateScheduleDto[]): CreateScheduleDto[] {
    const map = new Map<string, number[]>();

    schedule.forEach(({ groupIds, ...anyFields }) => {
      const payload = JSON.stringify(anyFields);
      const array = map.get(payload) ?? [];

      map.set(payload, array.concat(groupIds));
    });

    return Array.from(map.entries()).map(([payload, array]) => ({
      groupIds: Array.from(new Set(array)),
      ...JSON.parse(payload),
    }));
  }
}
