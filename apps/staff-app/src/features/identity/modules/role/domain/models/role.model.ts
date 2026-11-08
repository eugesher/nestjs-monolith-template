import { PermissionCodeEnum } from '@acme-libs/kernel';

import {
  IRoleCandidateInput,
  IRoleDraftOutput,
  IRoleRecordInput,
  IRoleSnapshotOutput,
} from '../interfaces';

export class RoleModel {
  public get permissionCodes(): readonly PermissionCodeEnum[] {
    return this.codes;
  }

  private constructor(
    public readonly id: string,
    public readonly name: string,
    private codes: PermissionCodeEnum[],
  ) {}

  public static reconstitute(record: IRoleRecordInput): RoleModel {
    const { id, name, rolePermissions } = record;
    const permissionCodes = rolePermissions.map((rolePermission) => rolePermission.code).sort();

    return new RoleModel(id, name, permissionCodes);
  }

  public static createDraft(candidate: IRoleCandidateInput): IRoleDraftOutput {
    const { name, permissionCodes } = candidate;

    return { name, permissionCodes: [...new Set(permissionCodes)] };
  }

  public reassignPermissions(requested: PermissionCodeEnum[]): void {
    this.codes = [...new Set(requested)];
  }

  public toSnapshot(): IRoleSnapshotOutput {
    return { id: this.id, name: this.name, permissionCodes: [...this.permissionCodes] };
  }
}
