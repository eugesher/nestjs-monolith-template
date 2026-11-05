import { TagErrorCodeEnum } from '../enums/tag-error-code.enum';
import { TagBaseException } from './base/tag-base.exception';

export class TagNotFoundException extends TagBaseException {
  public readonly code = TagErrorCodeEnum.TAG_NOT_FOUND;

  constructor(tagId: string, message = `Tag ${tagId} was not found`) {
    super(message);
  }
}
