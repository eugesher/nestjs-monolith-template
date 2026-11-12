import type { Nullable } from '@acme-libs/toolkit';

import type {
  IQueueRegistryFailedJobsView,
  IQueueRegistryFindFailedJobsCommand,
  IQueueRegistryJobCommand,
  IQueueRegistryJobCountsView,
} from '../interfaces';

export interface IQueueRegistryPort {
  has(queueName: string): boolean;
  listJobCounts(): Promise<IQueueRegistryJobCountsView[]>;
  findFailedJobs(
    command: IQueueRegistryFindFailedJobsCommand,
  ): Promise<IQueueRegistryFailedJobsView>;
  findJobState(command: IQueueRegistryJobCommand): Promise<Nullable<string>>;
  retryJob(command: IQueueRegistryJobCommand): Promise<void>;
  removeJob(command: IQueueRegistryJobCommand): Promise<unknown>;
}

export const QUEUE_REGISTRY_PORT = Symbol('QUEUE_REGISTRY_PORT');
