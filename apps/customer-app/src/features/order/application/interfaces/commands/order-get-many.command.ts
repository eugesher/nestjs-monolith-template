import { Maybe } from '@acme-libs/toolkit';

export interface IOrderGetManyCommand {
  customerId: string;
  page: Maybe<number>;
  limit: Maybe<number>;
}
