import { createHash } from 'crypto';

import type { Maybe } from '../types/utility.type';

export class BodyFingerprintHelper {
  public static compute(value: unknown): string {
    const canonical =
      (JSON.stringify(value, BodyFingerprintHelper.sortObjectKeys) as Maybe<string>) ?? 'null';

    return createHash('sha256').update(canonical, 'utf8').digest('hex');
  }

  private static sortObjectKeys(this: void, _key: string, value: unknown): unknown {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
      return value;
    }

    const sourceObject = value as Record<string, unknown>;

    return Object.keys(sourceObject)
      .sort()
      .reduce<Record<string, unknown>>((sorted, key) => {
        sorted[key] = sourceObject[key];

        return sorted;
      }, {});
  }
}
