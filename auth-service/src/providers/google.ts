export interface GoogleProfile {
	id: string;
	email: string;
	verified_email: boolean;	
	name: string;
	given_name: string;
	family_name: string;
	picture: string;	
	locale?: string;
}

export const google = {
  auth(state: string): string {
    return (
      'https://accounts.google.com/o/oauth2/v2/auth?' +
      new URLSearchParams({
        client_id: process.env.GOOGLE_ID!,
        redirect_uri: process.env.GOOGLE_CALLBACK!,
        response_type: 'code',
        scope: 'openid email profile',
        state,
      })
    );
  },

  async token(code: string): Promise<string> {
    const r = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_ID!,
        client_secret: process.env.GOOGLE_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.GOOGLE_CALLBACK!,
      }),
    });

    const data = await r.json();

    return data.access_token as string;
  },

  async profile(token: string): Promise<GoogleProfile> {
    const r = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return r.json() as Promise<GoogleProfile>;
  },
};

