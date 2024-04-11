import { IRozkladExport } from '../interfaces';

export type ExportGroupsType = IRozkladExport<'departments', Array<{ name: string; objects: Array<{ name: string }> }>>;
