import { packages } from './selectors.mjs';

export const queue = [
  {
    from: { file: { categories: 'acme-app:processors:presentation' } },
    disallow: [
      {
        ...packages('@nestjs/bull'),
        dependency: { specifiers: ['!{OnQueueFailed,Process,Processor}'] },
      },
      { ...packages('bull'), dependency: { specifiers: ['!Job'] } },
    ],
    message:
      'a processor consumer only takes Processor, Process and OnQueueFailed from @nestjs/bull and the Job type from bull; queues are registered in common/shared',
  },
  {
    from: {
      file: {
        categories: [
          'acme-app:features:infrastructure:queue',
          'acme-app:processors:infrastructure:queue',
        ],
      },
    },
    disallow: [
      { ...packages('@nestjs/bull'), dependency: { specifiers: ['!InjectQueue'] } },
      { ...packages('bull'), dependency: { specifiers: ['!Queue'] } },
    ],
    message:
      'a queue adapter only takes InjectQueue from @nestjs/bull and the Queue type from bull; queues are registered in common/shared',
  },
  {
    from: { file: { categories: 'acme-app:common:shared' } },
    disallow: [{ ...packages('@nestjs/bull'), dependency: { specifiers: ['!BullModule'] } }],
    message: 'common/shared only registers queues with BullModule from @nestjs/bull',
  },
  {
    from: { file: { categories: ['acme-app:app:module', 'acme-app:app'] } },
    disallow: [
      {
        ...packages('@nestjs/bull'),
        dependency: { specifiers: ['!{BullModule,BullRootModuleOptions}'] },
      },
    ],
    message:
      'the app only connects Bull to Redis with BullModule from @nestjs/bull; queues are registered in common/shared',
  },
];
