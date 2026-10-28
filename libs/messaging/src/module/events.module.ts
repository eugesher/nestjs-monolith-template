import { Global, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { EVENT_PUBLISHER_PORT } from '@acme-libs/contracts/messaging';
import { InProcessEventPublisherAdapter } from '../publisher/in-process-event-publisher.adapter';

@Global()
@Module({
  imports: [EventEmitterModule.forRoot({ wildcard: true, delimiter: '.' })],
  providers: [{ provide: EVENT_PUBLISHER_PORT, useClass: InProcessEventPublisherAdapter }],
  exports: [EVENT_PUBLISHER_PORT],
})
export class EventsModule {}
