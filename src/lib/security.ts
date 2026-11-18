// DevMeDoAnDrOiD
/**
 * SHAHA ONE | شها ون — Client-Side Security & Data Encryption Layer
 * 
 * Implements high-grade cryptographic protection using the W3C Web Crypto API
 * (AES-GCM 256-bit, PBKDF2 key derivation, random IV) for encrypting
 * sensitive local cache, citizen contact details, and backup archives.
 */

const OWNER_EMAIL_SHA256 = 'fd442486d8e630f046df515a324f71acfbbe2ffa73b6df9c284e0a4f971c7f48';

export async function isOwnerEmail(email?: string | null): Promise<boolean> {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  if (!normalized || typeof window === 'undefined' || !window.crypto?.subtle) {
    return false;
  }
  const digest = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(normalized));
  const hex = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
  return hex === OWNER_EMAIL_SHA256;
}

// Master system seed salt for client derivation
const APP_SALT = new TextEncoder().encode('shaha_directory_sec_v2_2026');

/**
 * Derives an AES-GCM 256-bit CryptoKey from a passphrase using PBKDF2 with 100,000 iterations.
 */
async function deriveEncryptionKey(passphrase: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: APP_SALT,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts arbitrary sensitive text (e.g. backup exports, private citizen notes, phone tokens)
 * using AES-GCM 256-bit encryption with a unique cryptographic IV.
 */
export async function encryptSensitiveData(
  plainText: string,
  passphrase: string
): Promise<string> {
  if (!passphrase || passphrase.trim().length < 6) {
    throw new Error('يجب إدخال كلمة مرور قوية لتشفير البيانات (6 أحرف على الأقل)');
  }
  try {
    const key = await deriveEncryptionKey(passphrase);
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for AES-GCM
    const encoded = new TextEncoder().encode(plainText);

    const ciphertext = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      encoded
    );

    // Combine IV + Ciphertext into base64 string
    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ciphertext), iv.length);

    let binary = '';
    for (let i = 0; i < combined.length; i++) {
      binary += String.fromCharCode(combined[i]);
    }
    return btoa(binary);
  } catch (err) {
    console.error('Encryption failed:', err);
    throw new Error('فشل تشفير البيانات الحساسة');
  }
}

/**
 * Decrypts data previously encrypted by encryptSensitiveData using the matching passphrase.
 */
export async function decryptSensitiveData(
  encryptedBase64: string,
  passphrase: string
): Promise<string> {
  if (!passphrase || passphrase.trim().length < 6) {
    throw new Error('يجب إدخال كلمة مرور التشفير الصحيحة');
  }
  try {
    const binary = atob(encryptedBase64);
    const combined = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      combined[i] = binary.charCodeAt(i);
    }

    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);

    const key = await deriveEncryptionKey(passphrase);
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      ciphertext
    );

    return new TextDecoder().decode(decryptedBuffer);
  } catch (err) {
    console.error('Decryption failed:', err);
    throw new Error('فشل فك تشفير البيانات — تأكد من كلمة المرور أو سلامة الملف');
  }
}

/**
 * Mask phone numbers for non-admin viewers or audit display to protect citizen privacy.
 * Example: "01012345678" -> "010****5678"
 */
export function maskPhoneNumber(phone?: string): string {
  if (!phone) return '';
  const clean = phone.trim();
  if (clean.length < 8) return clean;
  const start = clean.slice(0, 3);
  const end = clean.slice(-4);
  return `${start}****${end}`;
}

/**
 * Mask email address for public or semi-private audit logs.
 * Example: "ahmed.ali@gmail.com" -> "a***i@gmail.com"
 */
export function maskEmail(email?: string): string {
  if (!email || !email.includes('@')) return email || '';
  const [user, domain] = email.split('@');
  if (user.length <= 2) return `*@${domain}`;
  const first = user[0];
  const last = user[user.length - 1];
  return `${first}***${last}@${domain}`;
}

/**
 * Sanitize plain-text inputs to prevent XSS injection.
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function escapeHtml(input: unknown): string {
  if (input === null || input === undefined) return '';
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function isSafeHttpUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

/**
 * Optimizes an uploaded image using HTML5 Canvas to keep file sizes
 * ultra lightweight (under 250KB) and prevent document size issues.
 */
export function optimizeImageFile(file: File, maxDimension = 800): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Copyright (c) 2026 MeDoAnDrOiD. All Rights Reserved.
