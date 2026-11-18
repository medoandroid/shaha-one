// DevMeDoAnDrOiD
import crypto from 'crypto';

/**
 * Standard Authenticated Encryption Engine (AES-256-GCM)
 * Provides authenticated encryption with associated data (AEAD)
 * for sensitive PII at rest (beneficiary details, private admin notes).
 *
 * Format: v1:{iv_hex}:{auth_tag_hex}:{ciphertext_hex}
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const VERSION_PREFIX = 'v1';
const KEY_DOMAIN_SALT = 'shaha-one-aes-256-gcm-field-key-v1';

let cachedKey: Buffer | null = null;
let ephemeralDevSecret: string | null = null;

function getEncryptionKey(): Buffer {
  if (cachedKey) return cachedKey;
  let masterKey = process.env.ENCRYPTION_MASTER_KEY || process.env.SESSION_SECRET;
  if (!masterKey) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('ENCRYPTION_MASTER_KEY or SESSION_SECRET must be set in production.');
    }
    if (!ephemeralDevSecret) {
      ephemeralDevSecret = crypto.randomBytes(32).toString('hex');
    }
    masterKey = ephemeralDevSecret;
  }
  cachedKey = crypto.scryptSync(masterKey, KEY_DOMAIN_SALT, 32);
  return cachedKey;
}

/**
 * Encrypt plaintext string using AES-256-GCM
 */
export function encryptField(plaintext: string, optionalAad?: string): string {
  if (!plaintext || typeof plaintext !== 'string') return plaintext;

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });

  if (optionalAad) {
    cipher.setAAD(Buffer.from(optionalAad, 'utf-8'));
  }

  let ciphertext = cipher.update(plaintext, 'utf-8', 'hex');
  ciphertext += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return `${VERSION_PREFIX}:${iv.toString('hex')}:${authTag.toString('hex')}:${ciphertext}`;
}

/**
 * Decrypt ciphertext string using AES-256-GCM
 * Returns plaintext or falls back to original string if not encrypted
 */
export function decryptField(encryptedText: string, optionalAad?: string): string {
  if (!encryptedText || typeof encryptedText !== 'string') return encryptedText;

  // Check if string matches our version format
  const parts = encryptedText.split(':');
  if (parts.length !== 4 || parts[0] !== VERSION_PREFIX) {
    // String is not encrypted or from legacy unencrypted format
    return encryptedText;
  }

  const [, ivHex, authTagHex, ciphertextHex] = parts;

  try {
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });

    if (optionalAad) {
      decipher.setAAD(Buffer.from(optionalAad, 'utf-8'));
    }

    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(ciphertextHex, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
  } catch (err) {
    console.error('Decryption failed for field. Integrity or key mismatch.', err);
    return '[ENCRYPTED_DATA_INTEGRITY_ERROR]';
  }
}

/**
 * PII Redaction & Masking Utilities
 * Used to sanitize logs, error messages, and non-privileged displays
 */
export function maskPhoneNumber(phone?: string): string {
  if (!phone || typeof phone !== 'string') return '';
  const cleaned = phone.trim();
  if (cleaned.length <= 4) return '****';
  const start = cleaned.slice(0, 3);
  const end = cleaned.slice(-3);
  return `${start}****${end}`;
}

export function maskEmail(email?: string): string {
  if (!email || typeof email !== 'string') return '';
  const parts = email.split('@');
  if (parts.length !== 2) return '****';
  const name = parts[0];
  const domain = parts[1];
  const maskedName = name.length > 2 ? `${name[0]}***${name[name.length - 1]}` : `${name[0]}***`;
  return `${maskedName}@${domain}`;
}

export function redactObject<T extends Record<string, any>>(obj: T): Partial<T> {
  if (!obj || typeof obj !== 'object') return obj;
  const sensitiveKeys = ['password', 'token', 'salt', 'hash', 'secret', 'nationalId'];
  const sanitized: Record<string, any> = Array.isArray(obj) ? [] : {};

  for (const [key, value] of Object.entries(obj)) {
    if (sensitiveKeys.some(s => key.toLowerCase().includes(s))) {
      sanitized[key] = '[REDACTED]';
    } else if (key.toLowerCase().includes('phone')) {
      sanitized[key] = maskPhoneNumber(value);
    } else if (key.toLowerCase().includes('email')) {
      sanitized[key] = maskEmail(value);
    } else if (value && typeof value === 'object') {
      sanitized[key] = redactObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

// Copyright (c) 2026 MeDoAnDrOiD. All Rights Reserved.
