import { ClassProvider, Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { type Queue } from 'bull';

import { Nullable } from '@acme-libs/toolkit';
import { LEDGER_RECORD_QUEUE } from '@acme-core/contracts/ledger';
import { PRODUCT_STOCK_POST_SUBTRACT_QUEUE } from '@acme-core/contracts/product-stock';

import {
  IQueueRegistryFailedJobsView,
  IQueueRegistryFindFailedJobsCommand,
  IQueueRegistryJobCommand,
  IQueueRegistryJobCountsView,
  IQueueRegistryPort,
  QUEUE_REGISTRY_PORT,
} from '../../outbound';

@Injectable()
export class QueueRegistryQueueAdapter implements IQueueRegistryPort {
  public static readonly provider: ClassProvider<IQueueRegistryPort> = {
    provide: QUEUE_REGISTRY_PORT,
    useClass: QueueRegistryQueueAdapter,
  };

  private readonly queues: Map<string, Queue>;

  constructor(
    @InjectQueue(LEDGER_RECORD_QUEUE)
    ledgerRecordQueue: Queue,
    @InjectQueue(PRODUCT_STOCK_POST_SUBTRACT_QUEUE)
    postSubtractQueue: Queue,
  ) {
    this.queues = new Map(
      [ledgerRecordQueue, postSubtractQueue].map((queue) => [queue.name, queue]),
    );
  }

  public has(queueName: string): boolean {
    return this.queues.has(queueName);
  }

  public async listJobCounts(): Promise<IQueueRegistryJobCountsView[]> {
    const queues = [...this.queues.values()];

    return await Promise.all(
      queues.map(async (queue) => {
        const jobCounts = await queue.getJobCounts();

        return { name: queue.name, jobCounts: { paused: null, ...jobCounts } };
      }),
    );
  }

  public async findFailedJobs(
    command: IQueueRegistryFindFailedJobsCommand,
  ): Promise<IQueueRegistryFailedJobsView> {
    const { queueName, offset, limit } = command;
    const queue = this.queueOf(queueName);

    const [jobs, total] = await Promise.all([
      queue.getFailed(offset, offset + limit - 1),
      queue.getFailedCount(),
    ]);
    const data = jobs.map((job) => ({ debounceId: null, ...job.toJSON() }));

    return [data, total];
  }

  public async findJobState(command: IQueueRegistryJobCommand): Promise<Nullable<string>> {
    const { queueName, jobId } = command;
    const job = await this.queueOf(queueName).getJob(jobId);

    return job ? await job.getState() : null;
  }

  public async retryJob(command: IQueueRegistryJobCommand): Promise<void> {
    const { queueName, jobId } = command;
    const job = await this.queueOf(queueName).getJob(jobId);

    await job?.retry();
  }

  public async removeJob(command: IQueueRegistryJobCommand): Promise<void> {
    const { queueName, jobId } = command;
    const job = await this.queueOf(queueName).getJob(jobId);

    await job?.remove();
  }

  private queueOf(queueName: string): Queue {
    const queue = this.queues.get(queueName);

    if (!queue) {
      throw new Error(`Queue ${queueName} is not registered`);
    }

    return queue;
  }
}
