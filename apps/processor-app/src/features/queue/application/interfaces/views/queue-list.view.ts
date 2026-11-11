import type { Nullable } from '@acme-libs/toolkit';

export interface IQueueListView {
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
