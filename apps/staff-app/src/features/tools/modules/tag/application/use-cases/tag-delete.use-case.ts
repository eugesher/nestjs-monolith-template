import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { type ITagDeleteRepositoryPort, TAG_DELETE_REPOSITORY_PORT } from '../../outbound';
import { ITagDeleteCommand } from '../interfaces';
import { TagAccessService } from '../services/tag-access.service';

@Injectable()
export class TagDeleteUseCase {
  constructor(
    private readonly accessService: TagAccessService,
    @Inject(TAG_DELETE_REPOSITORY_PORT)
    private readonly repository: ITagDeleteRepositoryPort,
    @InjectPinoLogger(TagDeleteUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: ITagDeleteCommand): Promise<void> {
    const { tagId } = command;

    await this.accessService.load({ tagId });
    await this.repository.delete(tagId);

    this.logger.info({ tagId }, 'Tag deleted');
  }
}
