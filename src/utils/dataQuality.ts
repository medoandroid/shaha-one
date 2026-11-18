import { Listing, DuplicatePair } from '../types';

export interface QualityAnalysisResult {
  score: number;
  completenessLevel: 'high' | 'medium' | 'low';
  issues: string[];
}

export function calculateListingQualityScore(listing: Listing): QualityAnalysisResult {
  let score = 0;
  const issues: string[] = [];

  // Name check (20 points)
  if (listing.name && listing.name.trim().length >= 4) {
    score += 20;
  } else {
    issues.push('الاسم قصير جداً أو غير واضح');
  }

  // Primary Phone check (25 points)
  if (listing.phone && (listing.phone.length >= 8 || listing.phone.length <= 14)) {
    score += 25;
  } else {
    issues.push('رقم الهاتف الأساسي مفقود أو غير مكتمل');
  }

  // Address check (20 points)
  if (listing.address && listing.address.trim().length >= 6) {
    score += 20;
  } else {
    issues.push('العنوان ناقص أو ينقصه تحديد المنطقة في شها');
  }

  // Image or Avatar check (15 points)
  if (listing.imageUrl && listing.imageUrl.trim().length > 5) {
    score += 15;
  } else {
    issues.push('لا توجد صورة شخصية أو لوجو للخدمة');
  }

  // Specialty / Description check (10 points)
  if (listing.titleOrSpecialty && listing.titleOrSpecialty.trim().length >= 3) {
    score += 10;
  } else {
    issues.push('التخصص أو المسمى المهني مفقود');
  }

  // Working Hours check (10 points)
  if (listing.workingHours && listing.workingHours.trim().length >= 4) {
    score += 10;
  } else {
    issues.push('لم يتم تحديد مواعيد العمل وساعات الاستقبال');
  }

  let completenessLevel: 'high' | 'medium' | 'low' = 'low';
  if (score >= 80) completenessLevel = 'high';
  else if (score >= 50) completenessLevel = 'medium';

  return { score, completenessLevel, issues };
}

export function findDuplicateListings(listings: Listing[]): DuplicatePair[] {
  const duplicates: DuplicatePair[] = [];

  for (let i = 0; i < listings.length; i++) {
    for (let j = i + 1; j < listings.length; j++) {
      const a = listings[i];
      const b = listings[j];

      // Exact or normalized phone match
      const phoneA = a.phone.replace(/\D/g, '');
      const phoneB = b.phone.replace(/\D/g, '');

      if (phoneA && phoneB && phoneA === phoneB && phoneA.length >= 8) {
        duplicates.push({
          listingA: a,
          listingB: b,
          reason: 'تطابق تام في رقم الهاتف الأساسي',
          similarityScore: 95
        });
        continue;
      }

      // Title/Name similarity check
      const nameA = a.name.trim().toLowerCase();
      const nameB = b.name.trim().toLowerCase();

      if (nameA === nameB && a.categoryId === b.categoryId) {
        duplicates.push({
          listingA: a,
          listingB: b,
          reason: 'تطابق في الاسم والخدمة بنفس القسم',
          similarityScore: 90
        });
      }
    }
  }

  return duplicates;
}
