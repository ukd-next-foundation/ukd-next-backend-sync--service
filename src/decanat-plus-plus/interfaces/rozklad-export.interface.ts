export interface IRozkladExport<K extends string, T> {
  psrozklad_export: {
    code: string;
  } & { [key in K]: T };
}
