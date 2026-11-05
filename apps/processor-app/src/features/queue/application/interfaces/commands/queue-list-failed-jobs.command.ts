export interface IQueueListFailedJobsCommand {
  queueName: string;
  page?: number;
  limit?: number;
}
