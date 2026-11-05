import { Nullable } from '@acme-libs/toolkit';

import {
  IStaffAuthCoreFindByEmailCommand,
  IStaffAuthCoreFindSubjectCommand,
  IStaffAuthCoreSubjectView,
  IStaffAuthCoreUserView,
} from '../interfaces';

export interface IStaffAuthCorePort {
  findSubject(
    command: IStaffAuthCoreFindSubjectCommand,
  ): Promise<Nullable<IStaffAuthCoreSubjectView>>;
  findByEmail(command: IStaffAuthCoreFindByEmailCommand): Promise<Nullable<IStaffAuthCoreUserView>>;
}

export const STAFF_AUTH_CORE_PORT = Symbol('STAFF_AUTH_CORE_PORT');
