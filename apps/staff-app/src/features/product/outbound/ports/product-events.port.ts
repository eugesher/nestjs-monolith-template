import { IProductEventsPublishCommand } from '../interfaces';

export interface IProductEventsPort {
  publish(command: IProductEventsPublishCommand): Promise<void>;
}

export const PRODUCT_EVENTS_PORT = Symbol('PRODUCT_EVENTS_PORT');
