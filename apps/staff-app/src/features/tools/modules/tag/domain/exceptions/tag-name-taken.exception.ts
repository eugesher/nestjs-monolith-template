import { TagErrorCodeEnum } from '../enums/tag-error-code.enum';
import { TagBaseException } from './base/tag-base.exception';

export class TagNameTakenException extends TagBaseException {
  public readonly code = TagErrorCodeEnum.TAG_NAME_TAKEN;

  constructor(name: string, message = `A tag named ${name} already exists`) {
    super(message);
  }
}
