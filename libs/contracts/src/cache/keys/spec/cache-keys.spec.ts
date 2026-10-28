import { CACHE_KEYS } from '../cache-keys';

describe('CACHE_KEYS', () => {
  describe('reminderSummary', () => {
    it('builds a versioned, namespaced key of the owner', () => {
      const key = CACHE_KEYS.reminderSummary('owner-1');

      expect(key).toBe('acme:reminders:summary:v1:owner-1:__all__');
    });

    it('starts with its prefix, so delByPrefix clears every facet of the owner', () => {
      const prefix = CACHE_KEYS.reminderSummaryPrefix('owner-1');

      expect(prefix).toBe('acme:reminders:summary:v1:owner-1:');
    });

    it('keys of different owners do not share a prefix', () => {
      const key = CACHE_KEYS.reminderSummary('owner-10');

      expect(key.startsWith(CACHE_KEYS.reminderSummaryPrefix('owner-1'))).toBe(false);
    });
  });
});
