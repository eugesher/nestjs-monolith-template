import { Inject, Injectable } from '@nestjs/common';

import { type IAuthIdentityPort, AUTH_IDENTITY_PORT } from '../../outbound';
import { IAuthRegisterCommand, IAuthRegisterView } from '../interfaces';
import { AuthLedgerService } from '../services/auth-ledger.service';

@Injectable()
export class AuthRegisterUseCase {
  constructor(
    private readonly ledgerService: AuthLedgerService,
    @Inject(AUTH_IDENTITY_PORT)
    private readonly identity: IAuthIdentityPort,
  ) {}

  public async execute(command: IAuthRegisterCommand): Promise<IAuthRegisterView> {
    const { email, password } = command;
    const customer = await this.identity.register({ email, password });

    await this.ledgerService.recordRegistered({ customerId: customer.id });

    return customer;
  }
}
