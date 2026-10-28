import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { IEventPublisherPort } from '@acme-libs/contracts/messaging';

@Injectable()
export class InProcessEventPublisherAdapter implements IEventPublisherPort {
  constructor(
    @Inject(EventEmitter2)
    private readonly emitter: EventEmitter2,
    @InjectPinoLogger(InProcessEventPublisherAdapter.name)
    private readonly logger: PinoLogger,
  ) {}

  public async publish<T extends object>(eventName: string, payload: T): Promise<void> {
    try {
      await this.emitter.emitAsync(eventName, payload);
    } catch (error) {
      this.logger.warn({ err: error, eventName, payload }, 'In-process event handler failed');
    }
  }
}
