import { ClassroomModel, GroupModel, LessonModel, ScheduleModel, UserModel } from '@prisma/client';

import { CreateScheduleDto } from '@app/src/api/schedules/dto/create-schedule.dto';

export type SharedDataType = {
  findClassroomFn: (value: string) => string;
  findTeacherFn: (value: string) => string;
  findLessonFn: (value: string) => string;
  newSchedule: CreateScheduleDto[];
  classrooms: ClassroomModel[];
  schedules: ScheduleModel[];
  lessons: LessonModel[];
  teachers: UserModel[];
  groups: GroupModel[];
  scheduleFrom: Date;
  scheduleTo: Date;
};
