import { GroupEntity } from '@app/src/core/groups/entities/group.entity';
import { sheets_v4 } from 'googleapis';

export interface IJournal {
  group: GroupEntity;
  table: sheets_v4.Schema$BatchGetValuesResponse;
  checksum: string;
}
