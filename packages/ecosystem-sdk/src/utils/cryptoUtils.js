import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const DEFAULT_KEY = 'automobile-ecosystem-master-key-32b-2026';

function getKey(customKey) {
  const rawKey = customKey || process.env.ENCRYPTION_MASTER_KEY || DEFAULT_KEY;
  return crypto.createHash('sha256').update(String(rawKey)).digest();
}

/**
 * Encrypts a plain-text string or JSON object using AES-256-GCM.
 * Returns { ciphertext, iv, authTag }
 */
export function encryptSecret(plainTextOrObject, customKey) {
  const text = typeof plainTextOrObject === 'object' ? JSON.stringify(plainTextOrObject) : String(plainTextOrObject);
  const iv = crypto.randomBytes(16);
  const key = getKey(customKey);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return {
    ciphertext: encrypted,
    iv: iv.toString('hex'),
    authTag: authTag
  };
}

/**
 * Decrypts AES-256-GCM ciphertext using { ciphertext, iv, authTag }.
 */
export function decryptSecret({ ciphertext, iv, authTag }, customKey) {
  const key = getKey(customKey);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));

  let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  try {
    return JSON.parse(decrypted);
  } catch (_) {
    return decrypted;
  }
}
