import { acmeApp } from './acme-app.mjs';
import { acmeCore } from './acme-core.mjs';
import { acmeLibs } from './acme-libs.mjs';
import { commonModules } from './common-modules.mjs';
import { httpSurface } from './http-surface.mjs';
import { moduleAreas } from './module-areas.mjs';
import { repo } from './repo.mjs';

export const policies = [
  ...acmeApp,
  ...moduleAreas,
  ...commonModules,
  ...acmeCore,
  ...acmeLibs,
  ...repo,
  httpSurface,
];
