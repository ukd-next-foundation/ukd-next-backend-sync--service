import crypto from 'node:crypto';

export function hashString(input: string) {
  const hash = crypto.createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}
