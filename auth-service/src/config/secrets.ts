import fs from 'fs';
import path from 'path';

function readSecret(name: string): string | undefined {
  const path = `/run/secrets/${name}`;
  if (fs.existsSync(path)) {
    return fs.readFileSync(path, 'utf8').trim();
  }
  return undefined;
}

export const GOOGLE_ID =
  readSecret('google_id') ?? process.env.GOOGLE_ID!;

export const GOOGLE_SECRET =
  readSecret('google_secret') ?? process.env.GOOGLE_SECRET!;
