import { IRozkladExport } from '../interfaces';

export type ExportClassroomsType = IRozkladExport<'blocks', Array<{ name: string; objects: Array<{ name: string }> }>>;
