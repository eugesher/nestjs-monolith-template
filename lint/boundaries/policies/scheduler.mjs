import { packages } from './selectors.mjs';

export const scheduler = [
  {
    from: { file: { categories: 'acme-app:processors:presentation' } },
    disallow: [
      {
        ...packages('@nestjs/schedule'),
        dependency: { specifiers: ['!{Cron,CronExpression}'] },
      },
    ],
    message:
      'a processor consumer only schedules with Cron and CronExpression from @nestjs/schedule; the app sets up ScheduleModule',
  },
  {
    from: { file: { categories: ['acme-app:app:module', 'acme-app:app'] } },
    disallow: [
      { ...packages('@nestjs/schedule'), dependency: { specifiers: ['!ScheduleModule'] } },
    ],
    message:
      'the app only sets up ScheduleModule from @nestjs/schedule; schedules belong to processor consumers',
  },
  {
    from: { file: { categories: 'acme-app:test' } },
    disallow: [
      { ...packages('@nestjs/schedule'), dependency: { specifiers: ['!SchedulerRegistry'] } },
    ],
    message:
      'the e2e code only takes SchedulerRegistry from @nestjs/schedule, to fire a schedule by its name',
  },
];
