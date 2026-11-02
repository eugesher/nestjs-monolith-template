export interface IAuthAccessTokenPort {
  issue(userId: string): Promise<string>;
}

export const AUTH_ACCESS_TOKEN_PORT = Symbol('AUTH_ACCESS_TOKEN_PORT');
