import { Injectable, ValidationPipe } from '@nestjs/common';

@Injectable()
export class StrictValidationPipe extends ValidationPipe {
  constructor() {
    super({ whitelist: true, transform: true, forbidNonWhitelisted: true });
  }
}
