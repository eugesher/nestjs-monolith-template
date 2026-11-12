import type { Nullable } from '@acme-libs/toolkit';

import type {
  IStaffAuthCoreFindSubjectCommand,
  IStaffAuthCoreLoginCommand,
  IStaffAuthCoreLoginView,
  IStaffAuthCoreSubjectView,
} from '../interfaces';

export interface IStaffAuthCorePort {
  handleFindSubject(
    command: IStaffAuthCoreFindSubjectCommand,
  ): Promise<Nullable<IStaffAuthCoreSubjectView>>;
  handleLogin(command: IStaffAuthCoreLoginCommand): Promise<IStaffAuthCoreLoginView>;
}

export const STAFF_AUTH_CORE_PORT = Symbol('STAFF_AUTH_CORE_PORT');
