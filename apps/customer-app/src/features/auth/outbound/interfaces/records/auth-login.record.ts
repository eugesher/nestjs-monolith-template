import { Customer } from '@acme-core/entities';

export type IAuthLoginCustomerRecord = Pick<Customer, 'id' | 'email' | 'passwordHash' | 'status'>;
