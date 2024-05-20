import { CreateJournalDto } from '@app/src/core/journals/dto/create-journal.dto';
import { JournalEntity } from '@app/src/core/journals/entities/journal.entity';

export type journalNextActionsType = { create: CreateJournalDto[]; update: JournalEntity[]; delete: JournalEntity[] };
