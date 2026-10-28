import { acmeApp } from './acme-app.mjs';
import { acmeCore } from './acme-core.mjs';
import { acmeLibs } from './acme-libs.mjs';
import { repo } from './repo.mjs';

export const categories = [...acmeApp, ...acmeCore, ...acmeLibs, ...repo].map(
  ([category, pattern, capture]) => ({ category, pattern, capture }),
);
