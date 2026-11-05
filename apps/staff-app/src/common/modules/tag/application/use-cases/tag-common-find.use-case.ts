import { Inject, Injectable } from '@nestjs/common';

import { ITagCommonFindCommand, ITagCommonTagView } from '@acme-staff/contracts/tag';

import { type ITagCommonFindRepositoryPort, TAG_COMMON_FIND_REPOSITORY_PORT } from '../../outbound';

@Injectable()
export class TagCommonFindUseCase {
  constructor(
    @Inject(TAG_COMMON_FIND_REPOSITORY_PORT)
    private readonly repository: ITagCommonFindRepositoryPort,
  ) {}

  public async execute(command: ITagCommonFindCommand): Promise<ITagCommonTagView[]> {
    const { subjectType, subjectId } = command;
    const records = await this.repository.list({ subjectType, subjectId });

    return records.map((record) => ({ id: record.id, name: record.name }));
  }
}
