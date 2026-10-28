import { from, fromLib, libContracts, libs, own, packages, to } from '../selectors.mjs';

export const acmeLibs = [
  from('acme-libs', [to('acme-libs', own('lib')), to('acme-libs:contracts', own('lib'))]),
  from('acme-libs:contracts', [to('acme-libs:contracts', own('lib')), libs('kernel', 'toolkit')]),
  fromLib(
    [
      'auth',
      'cache',
      'config',
      'database',
      'health',
      'http',
      'messaging',
      'observability',
      'openapi',
    ],
    [libs('kernel', 'toolkit')],
  ),
  fromLib('cache', [libs('observability')]),
  fromLib('health', [libs('observability'), libContracts('cache')]),
  fromLib('observability', [libs('config')]),
  fromLib('config', [packages('@nestjs/common', '@nestjs/config')]),
  fromLib('toolkit', [packages('crypto')]),
];
