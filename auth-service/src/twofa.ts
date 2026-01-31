import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { getDB } from './db';

export async function generate2FA(id: string) {
  const secret = speakeasy.generateSecret({
    length: 20,
    name: 'Transcendence',
  });

  const db = getDB();
  await new Promise((res, rej) => {
    db.run(
      `UPDATE users SET twofa_secret = ? WHERE id  = ?`,
      [secret.base32, id],
      err => err ? rej(err) : res(null)
    );
  });

  const qr = await QRCode.toDataURL(secret.otpauth_url!);
  return { qr };
}

export function verify2FA(secret: string, token: string) {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 1,
  });
}

