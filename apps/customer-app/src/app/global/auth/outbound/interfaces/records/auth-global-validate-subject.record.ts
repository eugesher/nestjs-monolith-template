import { Customer } from '@acme-core/entities';

export type IAuthGlobalValidateSubjectCustomerRecord = Pick<Customer, 'id' | 'email'>;
