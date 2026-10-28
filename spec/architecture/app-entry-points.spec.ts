import { readFileSync } from 'fs';
import * as path from 'path';

import '../support/lint';

describe('app entry points', () => {
  it('tsconfig publishes exactly these app entry points, no wildcards', () => {
    const tsconfig = JSON.parse(
      readFileSync(path.resolve(__dirname, '../../tsconfig.json'), 'utf8'),
    ) as { compilerOptions: { paths: Record<string, string[]> } };

    const appAliases = Object.keys(tsconfig.compilerOptions.paths).filter(
      (alias) => alias.startsWith('@acme-admin') || alias.startsWith('@acme-client'),
    );

    expect(appAliases).toEqual([]);
  });
});
