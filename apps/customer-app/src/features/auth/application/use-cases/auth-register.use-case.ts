import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { MysqlErrorHelper } from '@acme-libs/toolkit';

import { AuthCustomerModel, AuthEmailTakenException, IAuthCustomerDraft } from '../../domain';
import {
  AUTH_PASSWORD_HASHER_PORT,
  AUTH_REGISTER_REPOSITORY_PORT,
  type IAuthPasswordHasherPort,
  type IAuthRegisterRepositoryPort,
} from '../../outbound';
import { IAuthRegisterCommand, IAuthRegisterView } from '../interfaces';
import { AuthLedgerService } from '../services/auth-ledger.service';

@Injectable()
export class AuthRegisterUseCase {
  constructor(
    private readonly ledgerService: AuthLedgerService,
    @Inject(AUTH_REGISTER_REPOSITORY_PORT)
    private readonly repository: IAuthRegisterRepositoryPort,
    @Inject(AUTH_PASSWORD_HASHER_PORT)
    private readonly passwordHasher: IAuthPasswordHasherPort,
    @InjectPinoLogger(AuthRegisterUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: IAuthRegisterCommand): Promise<IAuthRegisterView> {
    const { email, password } = command;

    AuthCustomerModel.assertPasswordStrength(password);

    const passwordHash = await this.passwordHasher.hash(password);
    const draft = AuthCustomerModel.createDraft({ email, passwordHash });
    const id = await this.insert(draft);
    const customer = AuthCustomerModel.reconstitute({ id, ...draft });

    this.logger.info({ customerId: customer.id }, 'Customer registered');

    await this.ledgerService.recordRegistered({ customerId: customer.id, email: customer.email });

    return { id: customer.id, email: customer.email };
  }

  private async insert(draft: IAuthCustomerDraft): Promise<string> {
    try {
      return await this.repository.insert(draft);
    } catch (error) {
      if (MysqlErrorHelper.isDuplicateKey(error)) {
        throw new AuthEmailTakenException(draft.email);
      }

      throw error;
    }
  }
}
