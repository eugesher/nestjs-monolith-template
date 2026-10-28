export interface IEventPublisherPort {
  publish<T extends object>(eventName: string, payload: T): Promise<void>;
}

export const EVENT_PUBLISHER_PORT = Symbol('EVENT_PUBLISHER_PORT');
