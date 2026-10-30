import { acmeApp } from './acme-app.mjs';
import { acmeCore } from './acme-core.mjs';
import { acmeLibs } from './acme-libs.mjs';
import { commonModules } from './common-modules.mjs';
import { customerClaims } from './customer-claims.mjs';
import { httpSurface } from './http-surface.mjs';
import { moduleAreas } from './module-areas.mjs';
import { queue } from './queue.mjs';
import { repo } from './repo.mjs';
import { scheduler } from './scheduler.mjs';
import { userEntities } from './user-entities.mjs';

export const policies = [
  ...acmeApp,
  ...moduleAreas,
  ...commonModules,
  ...acmeCore,
  ...acmeLibs,
  ...repo,
  httpSurface,
  ...userEntities,
  customerClaims,
  ...scheduler,
  ...queue,
];
