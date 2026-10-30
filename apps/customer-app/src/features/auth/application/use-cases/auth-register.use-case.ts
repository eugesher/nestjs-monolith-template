import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import {
  CREDENTIALS_PASSWORD_HASHER_PORT,
  type ICredentialsPasswordHasherPort,
} from '@acme-libs/contracts/credentials';
import { AuthCustomerModel } from '../../domain';
import { AUTH_REGISTER_REPOSITORY_PORT, type IAuthRegisterRepositoryPort } from '../../outbound';
import { IAuthRegisterCommand, IAuthRegisterView } from '../interfaces';
import { AuthLedgerService } from '../services/auth-ledger.service';

@Injectable()
export class AuthRegisterUseCase {
  constructor(
    private readonly ledgerService: AuthLedgerService,
    @Inject(AUTH_REGISTER_REPOSITORY_PORT)
    private readonly repository: IAuthRegisterRepositoryPort,
    @Inject(CREDENTIALS_PASSWORD_HASHER_PORT)
    private readonly passwordHasher: ICredentialsPasswordHasherPort,
    @InjectPinoLogger(AuthRegisterUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: IAuthRegisterCommand): Promise<IAuthRegisterView> {
    const { email, password } = command;

    AuthCustomerModel.assertPasswordStrength(password);

    const passwordHash = await this.passwordHasher.hash(password);
    const customer = AuthCustomerModel.register({ email, passwordHash });

    await this.repository.insert(customer);

    this.logger.info({ customerId: customer.id }, 'Customer registered');

    await this.ledgerService.recordRegistered({ customerId: customer.id, email: customer.email });

    return { id: customer.id, email: customer.email };
  }
}
