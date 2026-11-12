import { AggregateRootBase } from '../aggregate-root.base';
import { DomainEventBase } from '../domain-event.base';

describe('AggregateRootBase', () => {
  describe('pullDomainEvents', () => {
    it('drains the recorded events exactly once', () => {
      class ItemOpenedEvent extends DomainEventBase {
        public constructor(aggregateId: number) {
          super(aggregateId);
        }
      }
      class ItemAggregate extends AggregateRootBase<number> {
        public constructor(id: number) {
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
