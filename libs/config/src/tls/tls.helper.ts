import { readFileSync } from 'fs';

import type { Maybe } from '@acme-libs/toolkit';

export class TlsHelper {
  public static options(caPath: string): Maybe<{ ca: string }> {
    if (caPath === '') {
      return undefined;
    }

    const ca = readFileSync(caPath, 'utf8');

    return { ca };
  }
}
