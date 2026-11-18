// Utility to calculate real-time availability status for service listings in Shaha village

export interface AvailabilityStatusInfo {
  status: 'open_now' | 'closed' | 'out_of_hours' | 'accepting_requests' | 'twenty_four_seven';
  label: string;
  colorClass: string;
  bgClass: string;
  dotColorClass: string;
  isAvailableNow: boolean;
}

export function parseWorkingHoursStatus(workingHoursText?: string): AvailabilityStatusInfo {
  if (!workingHoursText || !workingHoursText.trim()) {
    return {
      status: 'accepting_requests',
      label: 'يستقبل استفسارات',
      colorClass: 'text-blue-700 dark:text-blue-300',
      bgClass: 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800',
      dotColorClass: 'bg-blue-500',
      isAvailableNow: true
    };
  }

  const text = workingHoursText.toLowerCase();

  // Check 24 hours
  if (text.includes('24') || text.includes('طوال اليوم') || text.includes('24 ساعة') || text.includes('طوال الأسبوع')) {
    return {
      status: 'twenty_four_seven',
      label: 'متاح 24 ساعة',
      colorClass: 'text-emerald-700 dark:text-emerald-300',
      bgClass: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
      dotColorClass: 'bg-emerald-500 animate-pulse',
      isAvailableNow: true
    };
  }

  // Parse current hour in Cairo (Egypt) time zone
  const now = new Date();
  const currentHour = now.getHours();

  // Try extracting morning and evening hours
  // e.g. "من 9 صباحا حتى 10 مساء"
  let openHour = 9;
  let closeHour = 22;

  if (text.includes('صباحا') || text.includes('صباحاً')) {
    const openMatch = text.match(/(?:من|الساعة)?\s*(\d{1,2})/);
    if (openMatch) openHour = parseInt(openMatch[1], 10);
  }

  if (text.includes('مساء') || text.includes('مساءً') || text.includes('ليلا')) {
    const closeMatch = text.match(/(?:حتى|إلى|الي)?\s*(\d{1,2})/);
    if (closeMatch) {
      let val = parseInt(closeMatch[1], 10);
      if (val < 12) val += 12;
      closeHour = val;
    }
  }

  const isOpenNow = currentHour >= openHour && currentHour < closeHour;

  if (isOpenNow) {
    return {
      status: 'open_now',
      label: 'مفتوح الآن',
      colorClass: 'text-emerald-700 dark:text-emerald-300',
      bgClass: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
      dotColorClass: 'bg-emerald-500 animate-ping',
      isAvailableNow: true
    };
  }

  return {
    status: 'closed',
    label: 'مغلق الآن',
    colorClass: 'text-slate-600 dark:text-slate-400',
    bgClass: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
    dotColorClass: 'bg-slate-400',
    isAvailableNow: false
  };
}

export function getAvailabilityStatus(workingHoursText?: string): { isOpen: boolean; statusText: string; info: AvailabilityStatusInfo } {
  const info = parseWorkingHoursStatus(workingHoursText);
  return {
    isOpen: info.isAvailableNow,
    statusText: info.label,
    info
  };
}
