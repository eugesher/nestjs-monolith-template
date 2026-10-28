import { BodyFingerprintHelper } from '../body-fingerprint.helper';

describe('BodyFingerprintHelper', () => {
  describe('compute', () => {
    it('returns the SHA-256 of the canonical JSON', () => {
      const fingerprint = BodyFingerprintHelper.compute({ b: 2, a: 1 });

      expect(fingerprint).toBe('43258cff783fe7036d8a43033f830adfc60ec037382473548ac742b888292777');
    });

    it('is stable across key order at every depth', () => {
      const sorted = BodyFingerprintHelper.compute({ a: 1, b: { c: 2, d: 3 } });
      const shuffled = BodyFingerprintHelper.compute({ b: { d: 3, c: 2 }, a: 1 });

      expect(shuffled).toBe(sorted);
    });

    it('is sensitive to array order — a reordered list is a different body', () => {
      const ordered = BodyFingerprintHelper.compute({ xs: [1, 2] });
      const reordered = BodyFingerprintHelper.compute({ xs: [2, 1] });

      expect(reordered).not.toBe(ordered);
    });

    it('distinguishes a value from its string form', () => {
      const number = BodyFingerprintHelper.compute({ a: 1 });
      const string = BodyFingerprintHelper.compute({ a: '1' });

      expect(string).not.toBe(number);
    });

    it('drops undefined but keeps null', () => {
      const plain = BodyFingerprintHelper.compute({ a: 1 });
      const withUndefined = BodyFingerprintHelper.compute({ a: 1, b: undefined });
      const withNull = BodyFingerprintHelper.compute({ a: 1, b: null });

      expect(withUndefined).toBe(plain);
      expect(withNull).not.toBe(plain);
    });

    it('fingerprints a top-level undefined as JSON null', () => {
      const fingerprint = BodyFingerprintHelper.compute(undefined);

      expect(fingerprint).toBe('74234e98afe7498fb5daf1f36ac2d78acc339464f950703b8c019892f982b90b');
    });
  });
});
