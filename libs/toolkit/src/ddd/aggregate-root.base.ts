import { EntityBase } from './entity.base';
import type { DomainEventBase } from './domain-event.base';

export abstract class AggregateRootBase<TId> extends EntityBase<TId> {
  private domainEvents: DomainEventBase<TId>[] = [];

  public pullDomainEvents(): DomainEventBase<TId>[] {
    const pulledEvents = this.domainEvents;

    this.domainEvents = [];

    return pulledEvents;
  }

  protected addDomainEvent(event: DomainEventBase<TId>): void {
    this.domainEvents.push(event);
  }
}
