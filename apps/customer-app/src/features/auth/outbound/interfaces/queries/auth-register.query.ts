import type { Customer } from '@acme-core/entities';

export type IAuthRegisterCustomerInsertQuery = Pick<Customer, 'email' | 'passwordHash' | 'status'>;
