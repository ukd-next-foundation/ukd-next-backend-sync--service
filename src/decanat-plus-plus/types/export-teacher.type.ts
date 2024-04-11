import { IRozkladExport } from '../interfaces';

export type ExportTeachersType = IRozkladExport<
  'departments',
  Array<{ name: string; objects: Array<{ name: string; P: string; I: string; B: string }> }>
>;
