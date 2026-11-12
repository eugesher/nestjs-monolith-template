import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class ThrottleGuard extends ThrottlerGuard {
  private static readonly MESSAGE = 'Too many requests';

  protected override throwThrottlingException(): never {
    const status = HttpStatus.TOO_MANY_REQUESTS;

    throw new HttpException({ statusCode: status, message: ThrottleGuard.MESSAGE }, status);
  }
}
