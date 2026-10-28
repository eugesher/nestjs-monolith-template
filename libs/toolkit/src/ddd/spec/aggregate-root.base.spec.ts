import { AggregateRoot } from '../aggregate-root.base';
import { DomainEvent } from '../domain-event.base';

describe('AggregateRoot', () => {
  describe('pullDomainEvents', () => {
    it('drains the recorded events exactly once', () => {
      class ItemOpenedEvent extends DomainEvent {
        constructor(aggregateId: number) {
          super(aggregateId);
        }
      }
      class ItemAggregate extends AggregateRoot<number> {
        constructor(id: number) {
          super(id);
        }

        public open(): void {
          this.addDomainEvent(new ItemOpenedEvent(this.id));
        }
      }
      const item = new ItemAggregate(1);

      item.open();
      item.open();

      const first = item.pullDomainEvents();
      const second = item.pullDomainEvents();

      expect(first.map((event) => event.aggregateId)).toEqual([1, 1]);
      expect(second).toEqual([]);
    });
  });
});
