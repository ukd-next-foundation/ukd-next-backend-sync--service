import { CreateScheduleDto } from '@app/src/core/schedules/dto/create-schedule.dto';
import { UpdateScheduleDto } from '@app/src/core/schedules/dto/update-schedule.dto';

interface UpdateScheduleDtoWithId extends UpdateScheduleDto {
  id: number;
}

export type scheduleNextActionsType = {
  create: CreateScheduleDto[];
  update: UpdateScheduleDtoWithId[];
  foundIds: Set<number>;
  delete: number[];
};
