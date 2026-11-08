import { Scaffold } from './scaffold';

export default function globalSetup(): void {
  Scaffold.removeLeftovers();
}
