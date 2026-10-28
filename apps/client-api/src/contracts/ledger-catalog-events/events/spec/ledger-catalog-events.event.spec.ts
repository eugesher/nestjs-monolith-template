import { LEDGER_CATALOG_EVENTS } from '../ledger-catalog-events.event';

describe('LEDGER_CATALOG_EVENTS', () => {
  it('names every event once, as <context>.<aggregate>.<verb>', () => {
    expect(Object.values(LEDGER_CATALOG_EVENTS)).toEqual([
      'catalog.item.created',
      'catalog.item.renamed',
      'catalog.item.archived',
    ]);
  });

  it.each(Object.values(LEDGER_CATALOG_EVENTS))(
    '%s is three lowercase segments joined by dots, with a past tense verb',
    (name) => {
      expect(name).toMatch(/^[a-z]+\.[a-z]+\.[a-z]+ed$/);
    },
  );
});
