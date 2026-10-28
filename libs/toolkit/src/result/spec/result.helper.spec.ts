import { ResultHelper } from '../result.helper';

describe('ResultHelper', () => {
  describe('ok', () => {
    it('wraps a value as a success', () => {
      const result = ResultHelper.ok(7);

      expect(result).toEqual({ ok: true, value: 7 });
    });
  });

  describe('err', () => {
    it('wraps an error as a failure', () => {
      const result = ResultHelper.err('ITEM_NOT_FOUND');

      expect(result).toEqual({ ok: false, error: 'ITEM_NOT_FOUND' });
    });
  });
});
