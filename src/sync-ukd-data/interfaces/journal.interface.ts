import { GroupModel } from '@prisma/client';
import { sheets_v4 } from 'googleapis';

export interface IJournal {
  group: GroupModel;
  table: sheets_v4.Schema$BatchGetValuesResponse;
  checksum: string;
}
