import { EventEmitter2 } from '@nestjs/event-emitter';
import { PinoLogger } from 'nestjs-pino';

import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';
import { InProcessEventPublisherAdapter } from '../in-process-event-publisher.adapter';

describe('InProcessEventPublisherAdapter', () => {
  let emitAsync: jest.Mock;
  let logger: PinoLoggerMock;
  let publisher: InProcessEventPublisherAdapter;

  beforeEach(() => {
    emitAsync = jest.fn().mockResolvedValue([]);
    logger = makePinoLoggerMock();
    publisher = new InProcessEventPublisherAdapter(
      { emitAsync } as unknown as EventEmitter2,
      logger as unknown as PinoLogger,
    );
  });

  it('emits the event to the in-process handlers and waits for them', async () => {
    await publisher.publish('catalog.item.created', { itemId: 7 });

    expect(emitAsync).toHaveBeenCalledWith('catalog.item.created', { itemId: 7 });
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('swallows a failed handler and logs it with the event name and payload', async () => {
    emitAsync.mockRejectedValue(new Error('handler failed'));

    await publisher.publish('catalog.item.created', { itemId: 7 });

    expect(logger.warn).toHaveBeenCalledWith(
      {
        err: new Error('handler failed'),
        eventName: 'catalog.item.created',
        payload: { itemId: 7 },
      },
      'In-process event handler failed',
    );
  });
});
