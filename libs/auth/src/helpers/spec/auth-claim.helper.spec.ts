import { AuthClaimHelper } from '../auth-claim.helper';

describe('AuthClaimHelper', () => {
  describe('holdsAny', () => {
    it.each([
      ['nothing is required', undefined],
      ['an empty requirement', []],
    ])('admits anyone when %s', (_, required) => {
      const holds = AuthClaimHelper.holdsAny(required, undefined);

      expect(holds).toBe(true);
    });

    it('admits a subject holding any of the required values', () => {
      const holds = AuthClaimHelper.holdsAny(['a', 'b'], ['b', 'z']);

      expect(holds).toBe(true);
    });

    it('refuses a subject holding none of the required values', () => {
      const holds = AuthClaimHelper.holdsAny(['a', 'b'], ['z']);

      expect(holds).toBe(false);
    });

    it('refuses a subject without the claim', () => {
      const holds = AuthClaimHelper.holdsAny(['a'], undefined);

      expect(holds).toBe(false);
    });
  });
});
