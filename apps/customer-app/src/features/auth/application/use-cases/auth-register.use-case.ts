import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, type PinoLogger } from 'nestjs-pino';

import {
  AuthCustomerModel,
  AuthEmailTakenException,
  type IAuthCustomerDraftOutput,
} from '../../domain';
import {
  AUTH_CREDENTIALS_PORT,
  AUTH_LEDGER_PORT,
  AUTH_REGISTER_REPOSITORY_PORT,
  AuthRegisterCustomerInsertOutcomeEnum,
  type IAuthCredentialsPort,
  type IAuthLedgerPort,
  type IAuthRegisterRepositoryPort,
} from '../../outbound';
import type { IAuthRegisterCommand, IAuthRegisterView } from '../interfaces';

@Injectable()
export class AuthRegisterUseCase {
  constructor(
    @Inject(AUTH_REGISTER_REPOSITORY_PORT)
    private readonly repository: IAuthRegisterRepositoryPort,
    @Inject(AUTH_CREDENTIALS_PORT)
    private readonly credentials: IAuthCredentialsPort,
    @Inject(AUTH_LEDGER_PORT)
    private readonly ledger: IAuthLedgerPort,
    @InjectPinoLogger(AuthRegisterUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: IAuthRegisterCommand): Promise<IAuthRegisterView> {
    const { email, password } = command;

    AuthCustomerModel.assertPasswordStrength(password);

    const passwordHash = await this.credentials.hashPassword(password);
    const customerDraft = AuthCustomerModel.createDraft({ email, passwordHash });
    const customerId = await this.insert(customerDraft);

    this.logger.info({ customerId }, 'Customer registered');

    await this.ledger.recordRegistered({ customerId });

    return { id: customerId, email: customerDraft.email };
  }

  private async insert(draft: IAuthCustomerDraftOutput): Promise<string> {
    const insertResult = await this.repository.insert(draft);

    if (insertResult.outcome === AuthRegisterCustomerInsertOutcomeEnum.DUPLICATE) {
      throw new AuthEmailTakenException();
    }

    return insertResult.id;
  }
}
