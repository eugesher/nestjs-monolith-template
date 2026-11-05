import { IPage, Nullable } from '@acme-libs/toolkit';

export type IQueueListFailedJobsView = IPage<{
  id: string | number;
  name: string;
  data: unknown;
  opts: unknown;
  progress: number;
  delay: number;
  timestamp: number;
  attemptsMade: number;
  failedReason: unknown;
  stacktrace: Nullable<string[]>;
  returnvalue: unknown;
  debounceId?: Nullable<string>;
  finishedOn: Nullable<number>;
  processedOn: Nullable<number>;
}>;
