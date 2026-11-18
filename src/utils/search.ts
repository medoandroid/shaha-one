/**
 * Normalizes Arabic text for flexible and tolerant search matching:
 * - Unifies Alef variants (أ, إ, آ, ٱ -> ا)
 * - Unifies Taa Marbuta and Haa (ة -> ه)
 * - Unifies Yaa and Alef Maqsura (ى -> ي)
 * - Removes Arabic diacritics (tashkeel: fat-ha, damma, kasra, shadda, tanween, sukoon)
 * - Converts Arabic-Indic numbers (٠-٩) to standard (0-9)
 * - Cleans punctuations and extra spaces
 */

export function normalizeArabicText(text: string): string {
  if (!text) return '';

  let normalized = text.trim().toLowerCase();

  // Convert Arabic-Indic digits to Latin digits
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  for (let i = 0; i < 10; i++) {
    normalized = normalized.replaceAll(arabicDigits[i], i.toString());
  }

  // Remove diacritics (tashkeel)
  normalized = normalized.replace(/[\u064B-\u065F\u0670]/g, '');

  // Normalize Alef forms
  normalized = normalized.replace(/[أإآٱ]/g, 'ا');

  // Normalize Taa Marbuta to Haa
  normalized = normalized.replace(/ة/g, 'ه');

  // Normalize Alef Maqsura to Yaa
  normalized = normalized.replace(/ى/g, 'ي');

  // Remove Tatweel (Kashida)
  normalized = normalized.replace(/ـ/g, '');

  // Replace multiple spaces with single space
  normalized = normalized.replace(/\s+/g, ' ');

  return normalized;
}

/**
 * Normalizes phone numbers (removes +2, 002, spaces, dashes)
 */
export function normalizePhoneNumber(phone: string): string {
  if (!phone) return '';
  let cleaned = phone.replace(/[^0-9٠-٩]/g, '');

  // Convert Arabic digits
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  for (let i = 0; i < 10; i++) {
    cleaned = cleaned.replaceAll(arabicDigits[i], i.toString());
  }

  // If starts with 20 (Egypt country code)
  if (cleaned.startsWith('20') && cleaned.length > 10) {
    cleaned = '0' + cleaned.substring(2);
  }

  return cleaned;
}

/**
 * Checks if search query matches target text
 */
export function matchesQuery(target: string | undefined, query: string): boolean {
  if (!target || !query) return false;
  const normalizedTarget = normalizeArabicText(target);
  const normalizedQuery = normalizeArabicText(query);
  return normalizedTarget.includes(normalizedQuery);
}

/**
 * Checks if query matches phone number
 */
export function matchesPhone(phone: string | undefined, query: string): boolean {
  if (!phone || !query) return false;
  const cleanPhone = normalizePhoneNumber(phone);
  const cleanQuery = normalizePhoneNumber(query);
  return cleanPhone.includes(cleanQuery);
}
