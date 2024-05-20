import { ClassroomEntity } from '@app/src/core/classrooms/entities/classroom.entity';
import { GroupEntity } from '@app/src/core/groups/entities/group.entity';
import { LessonEntity } from '@app/src/core/lessons/entities/lesson.entity';
import { CreateScheduleDto } from '@app/src/core/schedules/dto/create-schedule.dto';
import { ScheduleEntity } from '@app/src/core/schedules/entities/schedule.entity';
import { UserEntity } from '@app/src/core/users/entities/user.entity';

export type SharedDataType = {
  findClassroomFn: (value: string) => string;
  findTeacherFn: (value: string) => string;
  findLessonFn: (value: string) => string;
  newSchedule: CreateScheduleDto[];
  classrooms: ClassroomEntity[];
  schedules: ScheduleEntity[];
  lessons: LessonEntity[];
  teachers: UserEntity[];
  groups: GroupEntity[];
  scheduleFrom: Date;
  scheduleTo: Date;
};
