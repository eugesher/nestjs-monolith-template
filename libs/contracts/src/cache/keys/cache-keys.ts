const ROOT = 'acme';
const REMINDER_SUMMARY_KEY_VERSION = 'v1';
const CATALOG_KEY_VERSION = 'v1';
const ALL_FACETS = '__all__';

export const CACHE_KEYS = {
  healthProbe: (): string => `${ROOT}:health:probe`,
  reminderSummaryPrefix: (ownerId: string): string =>
    `${ROOT}:reminders:summary:${REMINDER_SUMMARY_KEY_VERSION}:${ownerId}:`,
  reminderSummary: (ownerId: string): string =>
    `${CACHE_KEYS.reminderSummaryPrefix(ownerId)}${ALL_FACETS}`,
  catalogPrefix: (): string => `${ROOT}:catalog:${CATALOG_KEY_VERSION}:`,
  catalogPage: (page: number, size: number): string =>
    `${CACHE_KEYS.catalogPrefix()}page:${page}:size:${size}`,
};
