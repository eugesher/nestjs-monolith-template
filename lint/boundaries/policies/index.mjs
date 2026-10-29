import { acmeApp } from './acme-app.mjs';
import { acmeCore } from './acme-core.mjs';
import { acmeLibs } from './acme-libs.mjs';
import { commonModules } from './common-modules.mjs';
import { customerClaims } from './customer-claims.mjs';
import { httpSurface } from './http-surface.mjs';
import { identityModules } from './identity-modules.mjs';
import { moduleAreas } from './module-areas.mjs';
import { queue } from './queue.mjs';
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
  ...identityModules,
  customerClaims,
  ...scheduler,
  ...queue,
];
