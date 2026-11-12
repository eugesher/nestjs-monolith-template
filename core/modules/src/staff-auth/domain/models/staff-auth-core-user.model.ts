import { UserStatusEnum } from '@acme-libs/kernel';

import type { IStaffAuthCoreUserRecordInput } from '../interfaces';

export class StaffAuthCoreUserModel {
  private constructor(
    public readonly id: string,
    public readonly passwordHash: string,
    public readonly status: UserStatusEnum,
  ) {}

  public static reconstitute(record: IStaffAuthCoreUserRecordInput): StaffAuthCoreUserModel {
    const { id, passwordHash, status } = record;

    return new StaffAuthCoreUserModel(id, passwordHash, status);
  }

  public static normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  public isActive(): boolean {
    return this.status === UserStatusEnum.ACTIVE;
  }
}
