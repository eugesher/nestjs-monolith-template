import { Inject, Injectable } from '@nestjs/common';

import { QUEUE_REGISTRY_PORT, type IQueueRegistryPort } from '../../outbound';
import type { IQueueListView } from '../interfaces';

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
