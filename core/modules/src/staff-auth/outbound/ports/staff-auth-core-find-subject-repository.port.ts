import { Nullable } from '@acme-libs/toolkit';

import { IStaffAuthCoreFindSubjectStaffUserRecord } from '../interfaces';

export interface IStaffAuthCoreFindSubjectRepositoryPort {
  findActiveById(id: string): Promise<Nullable<IStaffAuthCoreFindSubjectStaffUserRecord>>;
}

export const STAFF_AUTH_CORE_FIND_SUBJECT_REPOSITORY_PORT = Symbol(
  'STAFF_AUTH_CORE_FIND_SUBJECT_REPOSITORY_PORT',
);
