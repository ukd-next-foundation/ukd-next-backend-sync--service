import { GroupModel, JournalModel, LessonModel, ScheduleModel, UserModel } from '@prisma/client';

export interface IJournalSharedData {
  findLessonFn: (value: string) => string;
  findUserFn: (value: string) => string;
  schedules: ScheduleModel[];
  serviceAccount: UserModel;
  journals: JournalModel[];
  lessons: LessonModel[];
  groups: GroupModel[];
  users: UserModel[];
}
