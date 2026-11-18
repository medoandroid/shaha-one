/**
 * SHAHA ONE | شها ون — Social Platforms & External Links Configuration
 * 
 * Supports:
 * - Facebook
 * - WhatsApp
 * - Instagram
 * - Telegram
 * - TikTok
 * - YouTube
 * - LinkedIn
 * - Website
 * - Custom Links
 */

import { ListingSocialLink } from '../types';

export type SocialPlatformKey =
  | 'facebook'
  | 'whatsapp'
  | 'instagram'
  | 'telegram'
  | 'tiktok'
  | 'youtube'
  | 'linkedin'
  | 'website'
  | 'custom';

export interface SocialPlatformConfig {
  key: SocialPlatformKey;
  nameAr: string;
  placeholder: string;
  helperText: string;
  defaultIcon: string;
  brandColor: string;
  bgColor: string;
  textColor: string;
  formatUrl: (input: string) => string;
  isValid: (input: string) => boolean;
}

export const SOCIAL_PLATFORMS: Record<SocialPlatformKey, SocialPlatformConfig> = {
  facebook: {
    key: 'facebook',
    nameAr: 'فيسبوك (Facebook)',
    placeholder: 'https://facebook.com/username أو اسم الصفحة',
    helperText: 'رابط الصفحة الشخصية أو صفحة النشاط على فيسبوك',
    defaultIcon: 'facebook',
    brandColor: '#1877F2',
    bgColor: 'bg-blue-600',
    textColor: 'text-blue-600',
    formatUrl: (input: string) => {
      let trimmed = input.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
      if (trimmed.startsWith('facebook.com/') || trimmed.startsWith('www.facebook.com/') || trimmed.startsWith('fb.com/')) {
        return `https://${trimmed}`;
      }
      return `https://www.facebook.com/${trimmed.replace(/^@/, '')}`;
    },
    isValid: (input: string) => {
      const formatted = SOCIAL_PLATFORMS.facebook.formatUrl(input);
      return formatted.startsWith('https://') && formatted.length > 15;
    }
  },
  whatsapp: {
    key: 'whatsapp',
    nameAr: 'واتساب (WhatsApp)',
    placeholder: '010XXXXXXXX أو 2010XXXXXXXX',
    helperText: 'رقم الواتساب للتواصل والرد المباشر',
    defaultIcon: 'whatsapp',
    brandColor: '#25D366',
    bgColor: 'bg-emerald-600',
    textColor: 'text-emerald-600',
    formatUrl: (input: string) => {
      let trimmed = input.trim().replace(/[^0-9]/g, '');
      if (!trimmed) return '';
      if (trimmed.startsWith('0')) {
        trimmed = '20' + trimmed.substring(1);
      } else if (!trimmed.startsWith('20') && trimmed.length === 10) {
        trimmed = '20' + trimmed;
      }
      return `https://wa.me/${trimmed}`;
    },
    isValid: (input: string) => {
      const digits = input.trim().replace(/[^0-9]/g, '');
      return digits.length >= 10;
    }
  },
  instagram: {
    key: 'instagram',
    nameAr: 'انستجرام (Instagram)',
    placeholder: 'https://instagram.com/username أو @username',
    helperText: 'حساب انستجرام لعرض الصور والأعمال',
    defaultIcon: 'instagram',
    brandColor: '#E1306C',
    bgColor: 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600',
    textColor: 'text-rose-600',
    formatUrl: (input: string) => {
      let trimmed = input.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
      if (trimmed.startsWith('instagram.com/') || trimmed.startsWith('www.instagram.com/')) {
        return `https://${trimmed}`;
      }
      return `https://www.instagram.com/${trimmed.replace(/^@/, '')}`;
    },
    isValid: (input: string) => {
      const formatted = SOCIAL_PLATFORMS.instagram.formatUrl(input);
      return formatted.startsWith('https://') && formatted.length > 16;
    }
  },
  telegram: {
    key: 'telegram',
    nameAr: 'تيليجرام (Telegram)',
    placeholder: 'https://t.me/username أو @username',
    helperText: 'قناة أو حساب تيليجرام للتواصل والملفات',
    defaultIcon: 'telegram',
    brandColor: '#229ED9',
    bgColor: 'bg-sky-500',
    textColor: 'text-sky-500',
    formatUrl: (input: string) => {
      let trimmed = input.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
      if (trimmed.startsWith('t.me/') || trimmed.startsWith('telegram.me/')) {
        return `https://${trimmed}`;
      }
      return `https://t.me/${trimmed.replace(/^@/, '')}`;
    },
    isValid: (input: string) => {
      const formatted = SOCIAL_PLATFORMS.telegram.formatUrl(input);
      return formatted.startsWith('https://') && formatted.length > 10;
    }
  },
  tiktok: {
    key: 'tiktok',
    nameAr: 'تيك توك (TikTok)',
    placeholder: 'https://www.tiktok.com/@username أو @username',
    helperText: 'حساب تيك توك لعرض الفيديوهات والمنتجات',
    defaultIcon: 'tiktok',
    brandColor: '#000000',
    bgColor: 'bg-black',
    textColor: 'text-black dark:text-white',
    formatUrl: (input: string) => {
      let trimmed = input.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
      if (trimmed.startsWith('tiktok.com/') || trimmed.startsWith('www.tiktok.com/')) {
        return `https://${trimmed}`;
      }
      const handle = trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
      return `https://www.tiktok.com/${handle}`;
    },
    isValid: (input: string) => {
      const formatted = SOCIAL_PLATFORMS.tiktok.formatUrl(input);
      return formatted.startsWith('https://') && formatted.length > 18;
    }
  },
  youtube: {
    key: 'youtube',
    nameAr: 'يوتيوب (YouTube)',
    placeholder: 'https://youtube.com/@channel أو رابط القناة',
    helperText: 'قناة يوتيوب لعرض الشروحات والمقاطع المرئية',
    defaultIcon: 'youtube',
    brandColor: '#FF0000',
    bgColor: 'bg-red-600',
    textColor: 'text-red-600',
    formatUrl: (input: string) => {
      let trimmed = input.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
      if (trimmed.startsWith('youtube.com/') || trimmed.startsWith('www.youtube.com/') || trimmed.startsWith('youtu.be/')) {
        return `https://${trimmed}`;
      }
      const channel = trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
      return `https://www.youtube.com/${channel}`;
    },
    isValid: (input: string) => {
      const formatted = SOCIAL_PLATFORMS.youtube.formatUrl(input);
      return formatted.startsWith('https://') && formatted.length > 16;
    }
  },
  linkedin: {
    key: 'linkedin',
    nameAr: 'لينكد إن (LinkedIn)',
    placeholder: 'https://linkedin.com/in/username أو رابط الصفحة',
    helperText: 'الملف المهني الرسمي على شبكة LinkedIn',
    defaultIcon: 'linkedin',
    brandColor: '#0A66C2',
    bgColor: 'bg-blue-700',
    textColor: 'text-blue-700',
    formatUrl: (input: string) => {
      let trimmed = input.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
      if (trimmed.startsWith('linkedin.com/') || trimmed.startsWith('www.linkedin.com/')) {
        return `https://${trimmed}`;
      }
      return `https://www.linkedin.com/in/${trimmed.replace(/^@/, '')}`;
    },
    isValid: (input: string) => {
      const formatted = SOCIAL_PLATFORMS.linkedin.formatUrl(input);
      return formatted.startsWith('https://') && formatted.length > 18;
    }
  },
  website: {
    key: 'website',
    nameAr: 'الموقع الإلكتروني (Website)',
    placeholder: 'https://example.com',
    helperText: 'رابط الموقع الرسمي أو المتجر الإلكتروني',
    defaultIcon: 'globe',
    brandColor: '#4F46E5',
    bgColor: 'bg-indigo-600',
    textColor: 'text-indigo-600',
    formatUrl: (input: string) => {
      let trimmed = input.trim();
      if (!trimmed) return '';
      if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
        return `https://${trimmed}`;
      }
      return trimmed;
    },
    isValid: (input: string) => {
      const formatted = SOCIAL_PLATFORMS.website.formatUrl(input);
      return (formatted.startsWith('https://') || formatted.startsWith('http://')) && formatted.length > 10;
    }
  },
  custom: {
    key: 'custom',
    nameAr: 'رابط مخصص آخر',
    placeholder: 'https://...',
    helperText: 'رابط لأي منصة أو خدمة أخرى يحددها المستخدم',
    defaultIcon: 'link',
    brandColor: '#64748B',
    bgColor: 'bg-slate-700',
    textColor: 'text-slate-700 dark:text-slate-300',
    formatUrl: (input: string) => {
      let trimmed = input.trim();
      if (!trimmed) return '';
      if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
        return `https://${trimmed}`;
      }
      return trimmed;
    },
    isValid: (input: string) => {
      const formatted = SOCIAL_PLATFORMS.custom.formatUrl(input);
      return (formatted.startsWith('https://') || formatted.startsWith('http://')) && formatted.length > 8;
    }
  }
};

/**
 * Infer platform key from an arbitrary URL
 */
export function detectPlatformFromUrl(url: string): SocialPlatformKey {
  const lower = url.toLowerCase();
  if (lower.includes('facebook.com') || lower.includes('fb.me') || lower.includes('fb.com')) return 'facebook';
  if (lower.includes('wa.me') || lower.includes('whatsapp.com')) return 'whatsapp';
  if (lower.includes('instagram.com') || lower.includes('instagr.am')) return 'instagram';
  if (lower.includes('t.me') || lower.includes('telegram.me')) return 'telegram';
  if (lower.includes('tiktok.com')) return 'tiktok';
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
  if (lower.includes('linkedin.com')) return 'linkedin';
  return 'website';
}

/**
 * Normalize and sanitize an array of social links
 */
export function sanitizeSocialLinks(links: ListingSocialLink[]): ListingSocialLink[] {
  if (!Array.isArray(links)) return [];
  const result: ListingSocialLink[] = [];

  for (const lnk of links) {
    if (!lnk || !lnk.url || !lnk.url.trim()) continue;
    let url = lnk.url.trim();
    // Ensure no script injections
    if (url.toLowerCase().startsWith('javascript:') || url.toLowerCase().startsWith('data:')) {
      continue;
    }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    result.push({
      title: lnk.title?.trim() || 'رابط خارجي',
      url,
      icon: lnk.icon || detectPlatformFromUrl(url)
    });
  }

  return result;
}
