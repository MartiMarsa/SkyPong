import { google } from './google';

export const providers = {
  google
};

export type ProviderName = keyof typeof providers;
