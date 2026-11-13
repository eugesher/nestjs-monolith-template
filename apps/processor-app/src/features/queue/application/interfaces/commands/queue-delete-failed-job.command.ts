export interface IQueueDeleteFailedJobCommand {
  queueName: string;
  jobId: string;
  staffUserId: string;
}
