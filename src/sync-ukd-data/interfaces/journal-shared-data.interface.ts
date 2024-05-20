import { GroupEntity } from '@app/src/core/groups/entities/group.entity';
import { JournalEntity } from '@app/src/core/journals/entities/journal.entity';
import { LessonEntity } from '@app/src/core/lessons/entities/lesson.entity';
import { ScheduleEntity } from '@app/src/core/schedules/entities/schedule.entity';
import { UserEntity } from '@app/src/core/users/entities/user.entity';

export interface IJournalSharedData {
  findLessonFn: (value: string) => string;
  findUserFn: (value: string) => string;
  schedules: ScheduleEntity[];
  serviceAccount: UserEntity;
  journals: JournalEntity[];
  lessons: LessonEntity[];
  groups: GroupEntity[];
  users: UserEntity[];
}
