import { CACHE_KEYS } from '../cache-keys';

describe('CACHE_KEYS', () => {
  it('builds the namespaced health probe key', () => {
    const key = CACHE_KEYS.healthProbe();

    expect(key).toBe('acme:health:probe');
  });

  it('keeps the health probe key out of every reminder summary prefix', () => {
    const key = CACHE_KEYS.healthProbe();

    expect(key.startsWith(CACHE_KEYS.reminderSummaryPrefix(''))).toBe(false);
  });

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

  describe('catalogPage', () => {
    it('builds a versioned, namespaced key of one page window', () => {
      const key = CACHE_KEYS.catalogPage(2, 20);

      expect(key).toBe('acme:catalog:v1:page:2:size:20');
    });

    it('starts with the catalog prefix, so delByPrefix clears every page', () => {
      const prefix = CACHE_KEYS.catalogPrefix();

      expect(prefix).toBe('acme:catalog:v1:');
    });

    it('keeps the catalog keys apart from the reminder summaries', () => {
      const key = CACHE_KEYS.catalogPage(1, 20);

      expect(key.startsWith(CACHE_KEYS.reminderSummaryPrefix(''))).toBe(false);
    });
  });
});
