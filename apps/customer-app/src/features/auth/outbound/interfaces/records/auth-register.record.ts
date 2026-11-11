import type { Customer } from '@acme-core/entities';

import type { AuthRegisterCustomerInsertOutcomeEnum } from '../../enums/auth-register-customer-insert-outcome.enum';

export type IAuthRegisterCustomerInsertRecord =
  | (Pick<Customer, 'id'> & { outcome: AuthRegisterCustomerInsertOutcomeEnum.INSERTED })
  | { outcome: AuthRegisterCustomerInsertOutcomeEnum.DUPLICATE };
