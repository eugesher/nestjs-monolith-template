export interface IUserCredentialsPort {
  hashPassword(password: string): Promise<string>;
}

export const USER_CREDENTIALS_PORT = Symbol('USER_CREDENTIALS_PORT');
