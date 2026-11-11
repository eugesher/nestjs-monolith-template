import type { Customer } from '@acme-core/entities';

export type IAuthLoginCustomerRecord = Pick<Customer, 'id' | 'passwordHash' | 'status'>;
