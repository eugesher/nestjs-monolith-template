import { Injectable } from '@nestjs/common';

import { PermissionCodeEnum } from '@acme-libs/kernel';

import type { IPermissionListView } from '../interfaces';

@Injectable()
export class PermissionListUseCase {
  public execute(): IPermissionListView {
    return { codes: Object.values(PermissionCodeEnum) };
  }
}
