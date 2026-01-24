import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

const privateKey = fs.readFileSync(path.resolve(__dirname, '../jwt-private.pem'), 'utf-8');

export function generateToken(user: {
	id: string;
	password_version: number;
}) {
	return jwt.sign(
		{ 
			sub: user.id,
			pv: user.password_version,
			iss: 'auth-service',
			aud: 'transcendence',
		},
		privateKey,
		{
			algorithm: 'RS256',
			expiresIn: '1h',
	       	});
}

export function generate2FAToken(userId: string) {
	return jwt.sign(
		{
			sub: userId,
			type: '2fa'
		},
		privateKey,
		{
		  	algorithm: 'RS256',
		  	expiresIn: '5m',
		  	issuer: 'auth-service',
	    	});
}
