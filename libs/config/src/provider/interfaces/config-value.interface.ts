import type { IConfigValueProperties } from './config-value-properties.interface';

export interface IConfigValueProvideOptions<Property extends keyof IConfigValueProperties> {
  injectionToken: symbol;
  configProperty: Property;
}
