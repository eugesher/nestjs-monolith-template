import { Inject, Injectable } from '@nestjs/common';

import { type IQueueRegistryPort, QUEUE_REGISTRY_PORT } from '../../outbound';
import { IQueueListView } from '../interfaces';

@Injectable()
export class QueueListUseCase {
  constructor(
    @Inject(QUEUE_REGISTRY_PORT)
    private readonly registry: IQueueRegistryPort,
  ) {}

  public async execute(): Promise<IQueueListView[]> {
    return await this.registry.listJobCounts();
  }
}
