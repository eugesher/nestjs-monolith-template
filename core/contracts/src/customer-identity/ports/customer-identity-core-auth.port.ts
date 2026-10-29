import { Maybe } from '@acme-libs/toolkit';
import {
  ICustomerIdentityCoreAccessTokenView,
  ICustomerIdentityCoreLoginCommand,
  ICustomerIdentityCoreRegisterCommand,
  ICustomerIdentityCoreRegisterView,
  ICustomerIdentityCoreSubjectView,
  ICustomerIdentityCoreValidateSubjectQuery,
} from '../interfaces';

export interface ICustomerIdentityCoreAuthPort {
  register(
    command: ICustomerIdentityCoreRegisterCommand,
  ): Promise<ICustomerIdentityCoreRegisterView>;
  login(command: ICustomerIdentityCoreLoginCommand): Promise<ICustomerIdentityCoreAccessTokenView>;
  validateSubject(
    query: ICustomerIdentityCoreValidateSubjectQuery,
  ): Promise<Maybe<ICustomerIdentityCoreSubjectView>>;
}

export const CUSTOMER_IDENTITY_CORE_AUTH_PORT = Symbol('CUSTOMER_IDENTITY_CORE_AUTH_PORT');
