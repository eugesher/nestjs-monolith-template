import { DomainEvent } from '../domain-event.base';

describe('DomainEvent', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: new Date('2026-10-28T10:00:00.000Z') });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('records its aggregate id, the time it occurred and a fresh UUID v4 id', () => {
    class ItemOpenedEvent extends DomainEvent {
      constructor(aggregateId: number) {
        super(aggregateId);
      }
    }

    const event = new ItemOpenedEvent(7);

    expect(event.aggregateId).toBe(7);
    expect(event.occurredAt).toEqual(new Date('2026-10-28T10:00:00.000Z'));
    expect(event.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it('gives every event its own id', () => {
    class ItemOpenedEvent extends DomainEvent {
      constructor(aggregateId: number) {
        super(aggregateId);
      }
    }

    const first = new ItemOpenedEvent(7);
    const second = new ItemOpenedEvent(7);

    expect(first.id).not.toBe(second.id);
  });
});
