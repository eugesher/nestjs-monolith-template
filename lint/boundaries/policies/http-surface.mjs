import { packages } from './selectors.mjs';

const diNames = '{DynamicModule,Inject,Injectable,Module}';

export const httpSurface = {
  from: {
    file: {
      categories: {
        anyOf: [
          'acme-app:common:modules:application',
          'acme-app:common:modules:infrastructure',
          'acme-app:common:modules:infrastructure:core-adapters',
          'acme-app:common:modules:infrastructure:common-adapters',
          'acme-app:common:modules:module',
          'acme-app:common:modules:module:facade',
          'acme-core:modules:application',
          'acme-core:modules:infrastructure',
          'acme-core:modules:module',
          'acme-core:modules:module:facade',
          'acme-app:processors:application',
          'acme-app:processors:infrastructure',
          'acme-app:processors:infrastructure:core-adapters',
          'acme-app:processors:infrastructure:common-adapters',
          'acme-app:processors:infrastructure:queue',
          'acme-app:processors:module',
          'acme-app:processors:presentation',
        ],
      },
    },
  },
  allow: [{ ...packages('@nestjs/common'), dependency: { specifiers: [diNames] } }],
  disallow: [{ ...packages('@nestjs/common'), dependency: { specifiers: [`!${diNames}`] } }],
  message: `core and common modules and processors have no HTTP surface: they take only the DI names ${diNames} from @nestjs/common`,
};
