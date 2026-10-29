import { acmeApp } from './acme-app.mjs';
import { acmeCore } from './acme-core.mjs';
import { acmeLibs } from './acme-libs.mjs';
import { commonModules } from './common-modules.mjs';
import { eventBus } from './event-bus.mjs';
import { httpSurface } from './http-surface.mjs';
import { identityAdmin } from './identity-admin.mjs';
import { moduleAreas } from './module-areas.mjs';
import { repo } from './repo.mjs';
import { scheduler } from './scheduler.mjs';

export const policies = [
  ...acmeApp,
  ...moduleAreas,
  ...commonModules,
  ...acmeCore,
  ...acmeLibs,
  ...repo,
  httpSurface,
  eventBus,
  identityAdmin,
  ...scheduler,
];
