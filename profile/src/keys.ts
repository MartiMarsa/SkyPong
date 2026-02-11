import fs from 'fs';
import path from 'path';

const DEFAULT_PUBLIC_KEY_PATH = '/app/keys/jwt-public.pem';

/**
 * Resolves the key path, using an environment variable if provided,
 * or falling back to the default path.
 * 
 * @param envValue - The environment variable value for the key path.
 * @param fallback - The default fallback path for the key.
 * @returns The resolved key path.
 */
function resolveKeyPath(envValue: string | undefined, fallback: string): string {
    const trimmed = envValue?.trim();
    return trimmed && trimmed.length > 0 ? trimmed : fallback;
}

/**
 * Reads the public key from the specified path.
 * If the key does not exist, it logs an error and exits the process.
 * 
 * @returns The contents of the public key file.
 */
function readPublicKeyOrExit(): string {
    const publicKeyPath = resolveKeyPath(process.env.JWT_PUBLIC_KEY_PATH, DEFAULT_PUBLIC_KEY_PATH);

    if (!fs.existsSync(publicKeyPath)) {
        console.error(
            [
                `Missing JWT public key file.`,
                `Searched path: ${publicKeyPath}`,
                `Set JWT_PUBLIC_KEY_PATH to the correct path or provide the key in the container.`,
                'Fix options:',
                `- Copy jwt-public.pem into /app/keys`,
                `- Mount a volume/secret (e.g. /run/secrets/jwt-public.pem) and point JWT_PUBLIC_KEY_PATH to it`,
            ].join('\n')
        );
        process.exit(1);
    }

    return fs.readFileSync(publicKeyPath, 'utf-8');
}

const publicKey = readPublicKeyOrExit();
export { publicKey };
