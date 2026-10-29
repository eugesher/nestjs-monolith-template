import { packages } from './selectors.mjs';

export const eventBus = {
  from: { file: { categories: 'acme-app:processors:presentation' } },
  disallow: [{ ...packages('@nestjs/event-emitter'), dependency: { specifiers: ['!OnEvent'] } }],
  message:
    'a processor consumer only subscribes with OnEvent from @nestjs/event-emitter; events are published through EVENT_PUBLISHER_PORT',
};
