export interface IQueueRegistryFindFailedJobsCommand {
  queueName: string;
  offset: number;
  limit: number;
}

export interface IQueueRegistryJobCommand {
  queueName: string;
  jobId: string;
}
