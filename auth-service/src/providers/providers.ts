import { google } from './google';

interface OAuthProvider {
	auth(state: string): string;
	token(code: string): Promise<string>;
	profile(token: string): Promise<any>;
}

export const providers: Record<string, OAuthProvider> = {
  google
};

export type ProviderName = keyof typeof providers;
