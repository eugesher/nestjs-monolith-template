import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { MysqlErrorHelper } from '@acme-libs/toolkit';

import { AuthCustomerModel, AuthEmailTakenException, IAuthCustomerDraftOutput } from '../../domain';
import {
  AUTH_CREDENTIALS_PORT,
  AUTH_REGISTER_REPOSITORY_PORT,
  type IAuthCredentialsPort,
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
    @Inject(AUTH_CREDENTIALS_PORT)
    private readonly credentials: IAuthCredentialsPort,
    @InjectPinoLogger(AuthRegisterUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: IAuthRegisterCommand): Promise<IAuthRegisterView> {
    const { email, password } = command;

    AuthCustomerModel.assertPasswordStrength(password);

    const passwordHash = await this.credentials.hashPassword(password);
    const draft = AuthCustomerModel.createDraft({ email, passwordHash });
    const id = await this.insert(draft);

    this.logger.info({ customerId: id }, 'Customer registered');

    await this.ledgerService.recordRegistered({ customerId: id, email: draft.email });

    return { id, email: draft.email };
  }

  private async insert(draft: IAuthCustomerDraftOutput): Promise<string> {
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
