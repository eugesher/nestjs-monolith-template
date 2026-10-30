import { Maybe } from '@acme-libs/toolkit';
import { IAuthCommonSubjectView, IAuthCommonValidateSubjectQuery } from '../interfaces';

export interface IAuthCommonPort {
  validateSubject(query: IAuthCommonValidateSubjectQuery): Promise<Maybe<IAuthCommonSubjectView>>;
}

export const AUTH_COMMON_PORT = Symbol('AUTH_COMMON_PORT');
