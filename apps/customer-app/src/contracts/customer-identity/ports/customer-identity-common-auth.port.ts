import { Maybe } from '@acme-libs/toolkit';
import {
  ICustomerIdentityCommonAccessTokenView,
  ICustomerIdentityCommonLoginCommand,
  ICustomerIdentityCommonRegisterCommand,
  ICustomerIdentityCommonRegisterView,
  ICustomerIdentityCommonSubjectView,
  ICustomerIdentityCommonValidateSubjectQuery,
} from '../interfaces';

export interface ICustomerIdentityCommonAuthPort {
  register(
    command: ICustomerIdentityCommonRegisterCommand,
  ): Promise<ICustomerIdentityCommonRegisterView>;
  login(
    command: ICustomerIdentityCommonLoginCommand,
  ): Promise<ICustomerIdentityCommonAccessTokenView>;
  validateSubject(
    query: ICustomerIdentityCommonValidateSubjectQuery,
  ): Promise<Maybe<ICustomerIdentityCommonSubjectView>>;
}

export const CUSTOMER_IDENTITY_COMMON_AUTH_PORT = Symbol('CUSTOMER_IDENTITY_COMMON_AUTH_PORT');
