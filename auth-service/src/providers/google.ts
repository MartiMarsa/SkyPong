export const google = {
      	auth(state) {
	    	return `https://accounts.google.com/o/oauth2/v2/auth?` +
		  	new URLSearchParams({
			client_id: process.env.GOOGLE_ID!,
			redirect_uri: process.env.GOOGLE_CALLBACK!,
			response_type: 'code',
			scope: 'openid email profile',
			state
	  	});
      	},

      	async token(code) {
	    	const r = await fetch(
		  	'https://oauth2.googleapis.com/token',
		  	{
				method: 'POST',
				body: new URLSearchParams({
			      		client_id: process.env.GOOGLE_ID!,
			      		client_secret: process.env.GOOGLE_SECRET!,
			      		code,
			      		grant_type: 'authorization_code',
			      		redirect_uri: process.env.GOOGLE_CALLBACK!
				})
		  	}
	    	);

	    	return (await r.json()).access_token;
      	},

      	async profile(token) {
	    	const r = await fetch(
		  	'https://www.googleapis.com/oauth2/v2/userinfo',
		  	{
				headers: { Authorization: `Bearer ${token}` }
		  	}
	    	);

	    	return r.json();
      	}
};

