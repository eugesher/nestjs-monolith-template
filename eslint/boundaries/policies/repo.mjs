import { from, to } from '../selectors.mjs';

export const repo = ['repo:spec', 'repo:scripts', 'repo:migrations', 'repo:docker-compose'].map(
  (category) => from(category, [to(category)]),
);
