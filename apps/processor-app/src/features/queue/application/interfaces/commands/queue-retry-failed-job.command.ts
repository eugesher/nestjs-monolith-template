export interface IQueueRetryFailedJobCommand {
  queueName: string;
  jobId: string;
  staffUserId: string;
}
