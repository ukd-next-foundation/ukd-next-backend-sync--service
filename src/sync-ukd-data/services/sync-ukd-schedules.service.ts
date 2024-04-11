import { IUkdSchedule, UkdScheduleApiService } from '@sync-ukd-service/src/ukd-schedule-api';
import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from '@sync-ukd-service/src/users/users.service';
import { UserRole } from '@app/src/common/enums';
import { LessonsService } from '@sync-ukd-service/src/lessons/lessons.service';
import { ClassroomsService } from '@sync-ukd-service/src/classrooms/classrooms.service';
import { SchedulesService } from '@sync-ukd-service/src/schedules/schedules.service';
import { GroupsService } from '@sync-ukd-service/src/groups/groups.service';
import { IDataFromMainBackend } from '../interfaces/data-from-main-backend.interface';
import { GroupEntity } from '@app/src/core/groups/entities/group.entity';
import { DecanatPlusPlusService } from '@sync-ukd-service/src/decanat-plus-plus/decanat-plus-plus.service';
import { IRozkladItem } from '@sync-ukd-service/src/decanat-plus-plus/interfaces';
import { ScheduleEntity } from '@app/src/core/schedules/entities/schedule.entity';

@Injectable()
export class SyncUkdSchedulesService {
  private readonly logger = new Logger(SyncUkdSchedulesService.name);

  constructor(
    private readonly decanatPlusPlusService: DecanatPlusPlusService,
    private readonly classroomsService: ClassroomsService,
    private readonly schedulesService: SchedulesService,
    private readonly lessonsService: LessonsService,
    private readonly groupsService: GroupsService,
    private readonly usersService: UsersService,
  ) {}

  async sync(from: Date, to: Date) {
    const data = await this.getDataFromMainBackend(from, to);

    for (const currentGroup of data.groups) {
      const schedule = await this.decanatPlusPlusService.getSchedule(currentGroup.name, from, to);

      for (const item of schedule) {
        const schedule = await this.parse(item, currentGroup, data);

        console.log(schedule);

        // const isPresenceInDB = this.isPresenceInDB(item, currentGroup, data);

        // if (isPresenceInDB) {
        //   this.updateItemInDB();
        // } else {
        //   this.createItemInDB();
        // }
      }
    }
  }

  private async parse(item: IRozkladItem, currentGroup: GroupEntity, data: IDataFromMainBackend) {
    const teacher = data.teachers.filter(
      ({ fullname }) => item.teacher.toLocaleLowerCase() === fullname.toLocaleLowerCase(),
    )[0];

    if (!teacher?.fullname) {
      console.log(item);
      throw new Error(`Teacher not found for ${item}`);
    }

    const lesson = data.lessons.filter(({ name }) => item.title.includes(name))[0];

    if (!lesson?.name) {
      console.log(item);
      throw new Error(`Lesson not found for ${item}`);
    }

    const classroom = data.classrooms.filter(({ name }) => item.room.includes(name))[0];

    if (!classroom?.name) {
      this.logger.error('Classroom not found');
      console.log(item);
    }

    const result = {
      type: 'LECTURE',
      lessonId: lesson.id,
      teacherId: teacher.id,
      classroomId: classroom?.id ?? null,
      groupIds: [currentGroup.id, currentGroup.name],
      date: item.date,
      startAt: item.lesson_time.split('-')[0],
      endAt: item.lesson_time.split('-')[1],
    };

    return result;
  }

  private isPresenceInDB(item: ScheduleEntity, currentGroup: GroupEntity, data: IDataFromMainBackend) {
    return true;
  }

  private updateItemInDB() {}

  private createItemInDB() {}

  private async getDataFromMainBackend(from: Date, to: Date): Promise<IDataFromMainBackend> {
    return Promise.all([
      this.classroomsService.findAll(),
      this.schedulesService.findAll({ from, to }),
      this.lessonsService.findAll(),
      this.groupsService.findAll(),
      this.usersService.findAll({ role: UserRole.Teacher }),
    ]).then((data) => ({
      classrooms: data[0],
      schedules: data[1],
      lessons: data[2],
      groups: data[3],
      teachers: data[4],
    }));
  }
}
