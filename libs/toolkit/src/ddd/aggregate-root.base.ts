import { Entity } from './entity.base';
import type { DomainEvent } from './domain-event.base';

export abstract class AggregateRoot<TId> extends Entity<TId> {
  private domainEvents: DomainEvent<TId>[] = [];

  public pullDomainEvents(): DomainEvent<TId>[] {
    const events = this.domainEvents;

    this.domainEvents = [];

    return events;
  }

  protected addDomainEvent(event: DomainEvent<TId>): void {
    this.domainEvents.push(event);
  }
}
