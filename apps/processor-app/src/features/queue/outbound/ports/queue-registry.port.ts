import { Nullable } from '@acme-libs/toolkit';

import {
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
  removeJob(command: IQueueRegistryJobCommand): Promise<void>;
}

export const QUEUE_REGISTRY_PORT = Symbol('QUEUE_REGISTRY_PORT');
