import { INestApplicationContext, Injectable, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { OnEvent } from '@nestjs/event-emitter';
import { LoggerModule, PinoLogger } from 'nestjs-pino';

import { EVENT_PUBLISHER_PORT, IEventPublisherPort } from '@acme-libs/contracts/messaging';
import { CorrelationContextHelper } from '@acme-libs/observability';
import { EventsModule } from '../events.module';

describe('EventsModule', () => {
  let received: { pattern: string; payload: unknown; correlationId: string }[];
  let context: INestApplicationContext;
  let publisher: IEventPublisherPort;

  beforeEach(async () => {
    received = [];

    @Injectable()
    class CatalogListener {
      @OnEvent('catalog.item.created')
      public onCreated(payload: unknown): void {
        received.push({
          pattern: 'catalog.item.created',
          payload,
          correlationId: CorrelationContextHelper.current('CatalogListener'),
        });
      }

      @OnEvent('catalog.item.*')
      public onAny(payload: unknown): void {
        received.push({
          pattern: 'catalog.item.*',
          payload,
          correlationId: CorrelationContextHelper.current('CatalogListener'),
        });
      }

      @OnEvent('catalog.item.failed')
      public onFailed(): Promise<void> {
        return Promise.reject(new Error('handler failed'));
      }
    }

    @Module({
      imports: [LoggerModule.forRoot({ pinoHttp: { level: 'silent' } }), EventsModule],
      providers: [CatalogListener],
    })
    class TestModule {}

    context = await NestFactory.createApplicationContext(TestModule, { logger: false });
    publisher = context.get(EVENT_PUBLISHER_PORT);
  });

  afterEach(async () => {
    await context.close();
    Object.assign(PinoLogger, { root: undefined });
  });

  it('delivers an event published in a request context with the same correlationId', async () => {
    await CorrelationContextHelper.run('request-id', () =>
      publisher.publish('catalog.item.created', { itemId: 7 }),
    );

    expect(received).toEqual([
      { pattern: 'catalog.item.created', payload: { itemId: 7 }, correlationId: 'request-id' },
      { pattern: 'catalog.item.*', payload: { itemId: 7 }, correlationId: 'request-id' },
    ]);
  });

  it('resolves the publish even when a handler rejects', async () => {
    const published = publisher.publish('catalog.item.failed', { itemId: 7 });

    await expect(published).resolves.toBeUndefined();
  });
});
