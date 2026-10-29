import { Maybe } from '@acme-libs/toolkit';
import {
  ICustomerIdentityCoreAccessTokenView,
  ICustomerIdentityCoreLoginCommand,
  ICustomerIdentityCoreSubjectView,
  ICustomerIdentityCoreValidateSubjectQuery,
} from '../interfaces';

export interface ICustomerIdentityCoreSessionPort {
  login(command: ICustomerIdentityCoreLoginCommand): Promise<ICustomerIdentityCoreAccessTokenView>;
  validateSubject(
    query: ICustomerIdentityCoreValidateSubjectQuery,
  ): Promise<Maybe<ICustomerIdentityCoreSubjectView>>;
}

export const CUSTOMER_IDENTITY_CORE_SESSION_PORT = Symbol('CUSTOMER_IDENTITY_CORE_SESSION_PORT');
