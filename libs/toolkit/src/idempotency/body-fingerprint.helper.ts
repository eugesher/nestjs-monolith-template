import { createHash } from 'crypto';

export class BodyFingerprintHelper {
  public static compute(value: unknown): string {
    const canonical = JSON.stringify(value, BodyFingerprintHelper.sortObjectKeys) ?? 'null';

    return createHash('sha256').update(canonical, 'utf8').digest('hex');
  }

  private static sortObjectKeys(this: void, _key: string, value: unknown): unknown {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
      return value;
    }

    const source = value as Record<string, unknown>;

    return Object.keys(source)
      .sort()
      .reduce<Record<string, unknown>>((sorted, key) => {
        sorted[key] = source[key];

        return sorted;
      }, {});
  }
}
