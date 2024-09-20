import { JournalModel } from '@prisma/client';

import { CreateJournalDto } from '@app/src/api/journals/dto/create-journal.dto';

export type journalNextActionsType = { create: CreateJournalDto[]; update: JournalModel[]; delete: JournalModel[] };
