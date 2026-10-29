import { IItemEventsPublishCommand } from '../interfaces';

export interface IItemEventsPort {
  publish(command: IItemEventsPublishCommand): Promise<void>;
}

export const ITEM_EVENTS_PORT = Symbol('ITEM_EVENTS_PORT');
