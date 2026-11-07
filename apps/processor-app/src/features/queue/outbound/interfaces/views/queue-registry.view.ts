import { Nullable } from '@acme-libs/toolkit';

export interface IQueueRegistryJobCountsView {
  name: string;
  jobCounts: {
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    waiting: number;
    paused: Nullable<number>;
  };
}

export type IQueueRegistryFailedJobsView = [
  {
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
    debounceId: Nullable<string>;
    finishedOn: Nullable<number>;
    processedOn: Nullable<number>;
  }[],
  number,
];
