import { Inject, Injectable } from '@nestjs/common';

import type { ITagCommonFindCommand, ITagCommonTagView } from '@acme-staff/contracts/tag';

import { TAG_COMMON_FIND_REPOSITORY_PORT, type ITagCommonFindRepositoryPort } from '../../outbound';

@Injectable()
export class TagCommonFindUseCase {
  constructor(
    @Inject(TAG_COMMON_FIND_REPOSITORY_PORT)
    private readonly repository: ITagCommonFindRepositoryPort,
  ) {}

  public async execute(command: ITagCommonFindCommand): Promise<ITagCommonTagView[]> {
    const { subjectType, subjectId } = command;
    const subjectTagRecords = await this.repository.list({ subjectType, subjectId });

    return subjectTagRecords.map((record) => ({ id: record.id, name: record.name }));
  }
}
