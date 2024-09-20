import { ClassroomModel, GroupModel, LessonModel, ScheduleModel, UserModel } from '@prisma/client';

export interface IDataFromMainBackend {
  classrooms: ClassroomModel[];
  schedules: ScheduleModel[];
  lessons: LessonModel[];
  teachers: UserModel[];
  groups: GroupModel[];
}
