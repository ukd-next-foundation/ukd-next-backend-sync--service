import { IRozkladExport, IRozkladItem } from '../interfaces';

export type ExportRozkladType = IRozkladExport<'roz_items', Array<IRozkladItem>>;
