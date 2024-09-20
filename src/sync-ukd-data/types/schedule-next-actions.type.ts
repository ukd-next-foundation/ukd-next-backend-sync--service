import { CreateScheduleDto } from '@app/src/api/schedules/dto/create-schedule.dto';
import { UpdateScheduleDto } from '@app/src/api/schedules/dto/update-schedule.dto';

// interface UpdateScheduleDtoWithId extends UpdateScheduleDto {
//   // id: number;
// }

export type scheduleNextActionsType = {
  create: CreateScheduleDto[];
  update: UpdateScheduleDto[];
  foundIds: Set<number>;
  delete: number[];
};
