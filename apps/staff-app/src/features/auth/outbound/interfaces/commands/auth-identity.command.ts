export interface IAuthIdentityFindSubjectCommand {
  userId: string;
}

export interface IAuthIdentityLoginCommand {
  email: string;
  password: string;
}
