/**
 * SHAHA ONE | شها ون — Image Optimizer & Storage Management Utility
 * 
 * Provides client-side canvas-based image resizing, WebP/quality compression,
 * MIME verification, external URL probe, and file size constraints to prevent
 * excessive Firestore document growth and optimize client bandwidth.
 */

export interface CompressionResult {
  dataUrl: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  format: 'image/avif' | 'image/webp' | 'image/jpeg';
  width: number;
  height: number;
  savedPercent: number;
}

export type ImageAssetType = 'cover' | 'avatar' | 'gallery';

interface DimensionLimits {
  maxWidth: number;
  maxHeight: number;
  targetMaxBytes: number;
  defaultQuality: number;
}

const ASSET_LIMITS: Record<ImageAssetType, DimensionLimits> = {
  cover: {
    maxWidth: 1200,
    maxHeight: 520,
    targetMaxBytes: 120 * 1024, // ~120KB
    defaultQuality: 0.82
  },
  avatar: {
    maxWidth: 400,
    maxHeight: 400,
    targetMaxBytes: 65 * 1024, // ~65KB
    defaultQuality: 0.85
  },
  gallery: {
    maxWidth: 1024,
    maxHeight: 800,
    targetMaxBytes: 140 * 1024, // ~140KB
    defaultQuality: 0.80
  }
};

/**
 * Format bytes to readable Arabic string
 */
export function formatFileSize(bytes: number): string {
  if (bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Validate that a file is a supported image and within raw file limits
 */
export function validateImageFile(file: File, maxUploadBytes = 15 * 1024 * 1024): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'لم يتم اختيار ملف' };
  }

  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
  if (!validTypes.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: 'نوع الملف غير مدعوم. الصيغ المدعومة: JPG, PNG, WebP, GIF'
    };
  }

  if (file.size > maxUploadBytes) {
    return {
      valid: false,
      error: `حجم الملف كبير جداً (${formatFileSize(file.size)}). الحد الأقصى المسموح به هو ${formatFileSize(maxUploadBytes)}`
    };
  }

  return { valid: true };
}

/**
 * Optimize an uploaded File into a compact WebP/JPEG data URL
 */
export async function optimizeProfileImage(
  file: File,
  assetType: ImageAssetType = 'avatar'
): Promise<CompressionResult> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'ملف الصورة غير صالح');
  }

  const limits = ASSET_LIMITS[assetType];
  const originalSize = file.size;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('فشل قراءة ملف الصورة'));
    };

    reader.onload = (e) => {
      const img = new Image();

      img.onerror = () => {
        reject(new Error('تعذر تحميل الصورة؛ قد يكون الملف تالفاً أو غير مدعوم'));
      };

      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Calculate scaling preserving aspect ratio
        let targetWidth = width;
        let targetHeight = height;

        if (assetType === 'avatar') {
          // Crop to square if avatar is not square
          const minDim = Math.min(width, height);
          const startX = (width - minDim) / 2;
          const startY = (height - minDim) / 2;
          
          const finalDim = Math.min(minDim, limits.maxWidth);
          const canvas = document.createElement('canvas');
          canvas.width = finalDim;
          canvas.height = finalDim;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('فشل معالجة Canvas'));
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, finalDim, finalDim);

          finishCompression(canvas, limits, originalSize, finalDim, finalDim, resolve);
          return;
        }

        // For cover or gallery: preserve aspect ratio
        if (width > limits.maxWidth || height > limits.maxHeight) {
          const ratio = Math.min(limits.maxWidth / width, limits.maxHeight / height);
          targetWidth = Math.round(width * ratio);
          targetHeight = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('فشل معالجة Canvas'));
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        finishCompression(canvas, limits, originalSize, targetWidth, targetHeight, resolve);
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

function finishCompression(
  canvas: HTMLCanvasElement,
  limits: DimensionLimits,
  originalSize: number,
  width: number,
  height: number,
  resolve: (res: CompressionResult) => void
) {
  let format: 'image/avif' | 'image/webp' | 'image/jpeg' = 'image/avif';
  let quality = limits.defaultQuality;
  let dataUrl = canvas.toDataURL(format, quality);

  if (!dataUrl.startsWith('data:image/avif')) {
    format = 'image/webp';
    dataUrl = canvas.toDataURL(format, quality);
  }

  if (!dataUrl.startsWith('data:image/webp') && !dataUrl.startsWith('data:image/avif')) {
    format = 'image/jpeg';
    dataUrl = canvas.toDataURL(format, quality);
  }

  // Calculate size in bytes from base64 data url
  const calcBytes = (url: string) => {
    const head = url.indexOf(',') + 1;
    return Math.round((url.length - head) * 0.75);
  };

  let compressedSize = calcBytes(dataUrl);

  // If still exceeds target max bytes, step down quality gracefully
  while (compressedSize > limits.targetMaxBytes && quality > 0.5) {
    quality -= 0.08;
    dataUrl = canvas.toDataURL(format, quality);
    compressedSize = calcBytes(dataUrl);
  }

  const savedPercent = originalSize > compressedSize
    ? Math.round(((originalSize - compressedSize) / originalSize) * 100)
    : 0;

  resolve({
    dataUrl,
    originalSizeBytes: originalSize,
    compressedSizeBytes: compressedSize,
    format,
    width,
    height,
    savedPercent
  });
}

/**
 * Validate that an external image URL is secure and loads successfully
 */
export async function validateAndProbeImageUrl(url: string, timeoutMs = 7000): Promise<{ valid: boolean; error?: string; width?: number; height?: number }> {
  if (!url || !url.trim()) {
    return { valid: false, error: 'يُرجى إدخال رابط الصورة' };
  }

  const trimmed = url.trim();

  // Security check: Must be HTTP(S) or valid data URL, no javascript:, no file:
  if (!trimmed.startsWith('https://') && !trimmed.startsWith('http://') && !trimmed.startsWith('data:image/')) {
    return { valid: false, error: 'الرابط يجب أن يبدأ بـ https://' };
  }

  if (trimmed.toLowerCase().includes('javascript:') || trimmed.toLowerCase().includes('vbscript:')) {
    return { valid: false, error: 'رابط غير آمن تم رفضه' };
  }

  // In memory image probe
  return new Promise((resolve) => {
    const img = new Image();
    let isSettled = false;

    const timer = setTimeout(() => {
      if (!isSettled) {
        isSettled = true;
        img.src = '';
        resolve({ valid: false, error: 'استغرق تحميل الصورة وقتاً طويلاً. تأكد من أن الرابط مباشر ويعمل للعامة' });
      }
    }, timeoutMs);

    img.onload = () => {
      if (!isSettled) {
        isSettled = true;
        clearTimeout(timer);
        resolve({
          valid: true,
          width: img.naturalWidth || img.width,
          height: img.naturalHeight || img.height
        });
      }
    };

    img.onerror = () => {
      if (!isSettled) {
        isSettled = true;
        clearTimeout(timer);
        resolve({
          valid: false,
          error: 'تعذر تحميل الصورة من هذا الرابط. تأكد من صحة الرابط وسماحه بالعرض المباشر (CORS/Hotlinking)'
        });
      }
    };

    img.crossOrigin = 'anonymous';
    img.src = trimmed;
  });
}
