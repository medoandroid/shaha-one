import React from 'react';
import {
  Stethoscope,
  Pill,
  GraduationCap,
  ShoppingCart,
  UtensilsCrossed,
  School,
  FlaskConical,
  Scale,
  BookOpen,
  Landmark,
  Car,
  Wrench,
  PackageCheck,
  HeartHandshake,
  Droplet,
  Phone,
  Shield,
  Zap,
  Building2,
  Building,
  HelpCircle,
  Scissors,
  Sparkles,
  Smartphone,
  Home,
  Sprout,
  PartyPopper,
  Briefcase,
  Store,
  Layers,
  LucideIcon
} from 'lucide-react';
import { Category } from '../../types';

// Map of names to Lucide icons
const iconMap: Record<string, LucideIcon> = {
  Stethoscope,
  Pill,
  GraduationCap,
  ShoppingCart,
  UtensilsCrossed,
  School,
  FlaskConical,
  Scale,
  BookOpen,
  Landmark,
  Car,
  Wrench,
  PackageCheck,
  HeartHandshake,
  Droplet,
  Phone,
  Shield,
  Zap,
  Building,
  Building2,
  Scissors,
  Sparkles,
  Smartphone,
  Home,
  Sprout,
  PartyPopper,
  Briefcase,
  Store,
  Layers
};

// Map of category ID to Lucide icon
const categoryIdToIcon: Record<string, LucideIcon> = {
  doctors: Stethoscope,
  pharmacies: Pill,
  teachers: GraduationCap,
  groceries: ShoppingCart,
  restaurants: UtensilsCrossed,
  schools: School,
  laboratories: FlaskConical,
  lawyers: Scale,
  stationery: BookOpen,
  mosques: Landmark,
  transport: Car,
  craftsmen: Wrench,
  delivery: PackageCheck,
  charity: HeartHandshake,
  blood_bank: Droplet
};

// Map of raw emojis to Lucide icons
const emojiToIcon: Record<string, LucideIcon> = {
  '🩺': Stethoscope,
  '💊': Pill,
  '🎓': GraduationCap,
  '🛒': ShoppingCart,
  '🍽️': UtensilsCrossed,
  '🍽': UtensilsCrossed,
  '🏫': School,
  '🔬': FlaskConical,
  '⚖️': Scale,
  '⚖': Scale,
  '📚': BookOpen,
  '🕌': Landmark,
  '🚗': Car,
  '🚘': Car,
  '🔧': Wrench,
  '🛠️': Wrench,
  '📦': PackageCheck,
  '🤝': HeartHandshake,
  '❤️': HeartHandshake,
  '🩸': Droplet,
  '🚨': Phone,
  '⚡': Zap
};

export interface CategoryVisualMeta {
  Icon: LucideIcon;
  textColor: string;
  bgColor: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
  gradientBg: string;
  shadowColor: string;
}

const categoryThemeMap: Record<string, CategoryVisualMeta> = {
  doctors: {
    Icon: Stethoscope,
    textColor: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/60',
    borderColor: 'border-emerald-200/70 dark:border-emerald-800/60',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-900/60',
    badgeText: 'text-emerald-800 dark:text-emerald-200',
    gradientBg: 'from-emerald-500 to-teal-600',
    shadowColor: 'shadow-emerald-500/20'
  },
  pharmacies: {
    Icon: Pill,
    textColor: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-50 dark:bg-teal-950/60',
    borderColor: 'border-teal-200/70 dark:border-teal-800/60',
    badgeBg: 'bg-teal-100 dark:bg-teal-900/60',
    badgeText: 'text-teal-800 dark:text-teal-200',
    gradientBg: 'from-teal-500 to-cyan-600',
    shadowColor: 'shadow-teal-500/20'
  },
  teachers: {
    Icon: GraduationCap,
    textColor: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/60',
    borderColor: 'border-indigo-200/70 dark:border-indigo-800/60',
    badgeBg: 'bg-indigo-100 dark:bg-indigo-900/60',
    badgeText: 'text-indigo-800 dark:text-indigo-200',
    gradientBg: 'from-indigo-500 to-blue-600',
    shadowColor: 'shadow-indigo-500/20'
  },
  groceries: {
    Icon: ShoppingCart,
    textColor: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-950/60',
    borderColor: 'border-green-200/70 dark:border-green-800/60',
    badgeBg: 'bg-green-100 dark:bg-green-900/60',
    badgeText: 'text-green-800 dark:text-green-200',
    gradientBg: 'from-green-500 to-emerald-600',
    shadowColor: 'shadow-green-500/20'
  },
  restaurants: {
    Icon: UtensilsCrossed,
    textColor: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-950/60',
    borderColor: 'border-orange-200/70 dark:border-orange-800/60',
    badgeBg: 'bg-orange-100 dark:bg-orange-900/60',
    badgeText: 'text-orange-800 dark:text-orange-200',
    gradientBg: 'from-orange-500 to-amber-600',
    shadowColor: 'shadow-orange-500/20'
  },
  schools: {
    Icon: School,
    textColor: 'text-violet-600 dark:text-violet-400',
    bgColor: 'bg-violet-50 dark:bg-violet-950/60',
    borderColor: 'border-violet-200/70 dark:border-violet-800/60',
    badgeBg: 'bg-violet-100 dark:bg-violet-900/60',
    badgeText: 'text-violet-800 dark:text-violet-200',
    gradientBg: 'from-violet-500 to-purple-600',
    shadowColor: 'shadow-violet-500/20'
  },
  laboratories: {
    Icon: FlaskConical,
    textColor: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-cyan-50 dark:bg-cyan-950/60',
    borderColor: 'border-cyan-200/70 dark:border-cyan-800/60',
    badgeBg: 'bg-cyan-100 dark:bg-cyan-900/60',
    badgeText: 'text-cyan-800 dark:text-cyan-200',
    gradientBg: 'from-cyan-500 to-teal-600',
    shadowColor: 'shadow-cyan-500/20'
  },
  lawyers: {
    Icon: Scale,
    textColor: 'text-slate-700 dark:text-slate-300',
    bgColor: 'bg-slate-100 dark:bg-slate-800/70',
    borderColor: 'border-slate-300/70 dark:border-slate-700/60',
    badgeBg: 'bg-slate-200 dark:bg-slate-800',
    badgeText: 'text-slate-800 dark:text-slate-200',
    gradientBg: 'from-slate-700 to-slate-900',
    shadowColor: 'shadow-slate-500/20'
  },
  stationery: {
    Icon: BookOpen,
    textColor: 'text-sky-600 dark:text-sky-400',
    bgColor: 'bg-sky-50 dark:bg-sky-950/60',
    borderColor: 'border-sky-200/70 dark:border-sky-800/60',
    badgeBg: 'bg-sky-100 dark:bg-sky-900/60',
    badgeText: 'text-sky-800 dark:text-sky-200',
    gradientBg: 'from-sky-500 to-blue-600',
    shadowColor: 'shadow-sky-500/20'
  },
  mosques: {
    Icon: Landmark,
    textColor: 'text-emerald-700 dark:text-emerald-300',
    bgColor: 'bg-emerald-50/80 dark:bg-emerald-950/50',
    borderColor: 'border-emerald-200/60 dark:border-emerald-800/50',
    badgeBg: 'bg-emerald-100/90 dark:bg-emerald-900/50',
    badgeText: 'text-emerald-800 dark:text-emerald-200',
    gradientBg: 'from-emerald-600 to-teal-700',
    shadowColor: 'shadow-emerald-600/20'
  },
  transport: {
    Icon: Car,
    textColor: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/60',
    borderColor: 'border-blue-200/70 dark:border-blue-800/60',
    badgeBg: 'bg-blue-100 dark:bg-blue-900/60',
    badgeText: 'text-blue-800 dark:text-blue-200',
    gradientBg: 'from-blue-600 to-sky-600',
    shadowColor: 'shadow-blue-500/20'
  },
  craftsmen: {
    Icon: Wrench,
    textColor: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/60',
    borderColor: 'border-amber-200/70 dark:border-amber-800/60',
    badgeBg: 'bg-amber-100 dark:bg-amber-900/60',
    badgeText: 'text-amber-800 dark:text-amber-200',
    gradientBg: 'from-amber-500 to-yellow-600',
    shadowColor: 'shadow-amber-500/20'
  },
  delivery: {
    Icon: PackageCheck,
    textColor: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-50 dark:bg-teal-950/60',
    borderColor: 'border-teal-200/70 dark:border-teal-800/60',
    badgeBg: 'bg-teal-100 dark:bg-teal-900/60',
    badgeText: 'text-teal-800 dark:text-teal-200',
    gradientBg: 'from-teal-600 to-emerald-600',
    shadowColor: 'shadow-teal-500/20'
  },
  charity: {
    Icon: HeartHandshake,
    textColor: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-50 dark:bg-rose-950/60',
    borderColor: 'border-rose-200/70 dark:border-rose-800/60',
    badgeBg: 'bg-rose-100 dark:bg-rose-900/60',
    badgeText: 'text-rose-800 dark:text-rose-200',
    gradientBg: 'from-rose-500 to-pink-600',
    shadowColor: 'shadow-rose-500/20'
  },
  blood_bank: {
    Icon: Droplet,
    textColor: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/60',
    borderColor: 'border-red-200/70 dark:border-red-800/60',
    badgeBg: 'bg-red-100 dark:bg-red-900/60',
    badgeText: 'text-red-800 dark:text-red-200',
    gradientBg: 'from-red-600 to-rose-700',
    shadowColor: 'shadow-red-500/20'
  }
};

const defaultVisualMeta: CategoryVisualMeta = {
  Icon: Layers,
  textColor: 'text-blue-600 dark:text-blue-400',
  bgColor: 'bg-blue-50 dark:bg-blue-950/60',
  borderColor: 'border-blue-200/70 dark:border-blue-800/60',
  badgeBg: 'bg-blue-100 dark:bg-blue-900/60',
  badgeText: 'text-blue-800 dark:text-blue-200',
  gradientBg: 'from-blue-600 to-sky-600',
  shadowColor: 'shadow-blue-500/20'
};

export const getCategoryVisuals = (identifier?: string | null): CategoryVisualMeta => {
  if (!identifier) return defaultVisualMeta;

  const clean = identifier.trim();

  // 1. Direct Category ID match
  if (categoryThemeMap[clean]) {
    return categoryThemeMap[clean];
  }

  // 2. Icon name match (e.g. "Stethoscope", "Pill")
  for (const [catId, meta] of Object.entries(categoryThemeMap)) {
    if (meta.Icon.displayName === clean || meta.Icon.name === clean) {
      return meta;
    }
  }

  // 3. Lucide icon name fallback
  if (iconMap[clean]) {
    return {
      ...defaultVisualMeta,
      Icon: iconMap[clean]
    };
  }

  // 4. Emoji fallback
  if (emojiToIcon[clean]) {
    return {
      ...defaultVisualMeta,
      Icon: emojiToIcon[clean]
    };
  }

  // 5. Category ID lookup via categoryIdToIcon
  if (categoryIdToIcon[clean]) {
    return {
      ...defaultVisualMeta,
      Icon: categoryIdToIcon[clean]
    };
  }

  return defaultVisualMeta;
};

interface CategoryIconProps {
  name?: string;
  categoryId?: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  name,
  categoryId,
  className = 'w-6 h-6'
}) => {
  const visuals = getCategoryVisuals(categoryId || name);
  const IconComponent = visuals.Icon;
  return <IconComponent className={className} aria-hidden="true" />;
};

interface CategoryIconBadgeProps {
  category?: Category | { id?: string; icon?: string; nameAr?: string };
  categoryId?: string;
  iconName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'subtle' | 'gradient' | 'solid';
  className?: string;
}

export const CategoryIconBadge: React.FC<CategoryIconBadgeProps> = ({
  category,
  categoryId,
  iconName,
  size = 'md',
  variant = 'subtle',
  className = ''
}) => {
  const targetId = category?.id || categoryId || category?.icon || iconName;
  const visuals = getCategoryVisuals(targetId);
  const Icon = visuals.Icon;

  const sizeClasses = {
    sm: 'w-8 h-8 rounded-xl',
    md: 'w-11 h-11 rounded-2xl',
    lg: 'w-14 h-14 rounded-2xl',
    xl: 'w-16 h-16 sm:w-20 sm:h-20 rounded-3xl'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5 sm:w-6 sm:h-6',
    lg: 'w-7 h-7 sm:w-8 sm:h-8',
    xl: 'w-8 h-8 sm:w-10 sm:h-10'
  };

  let styleClasses = '';
  if (variant === 'gradient') {
    styleClasses = `bg-gradient-to-br ${visuals.gradientBg} text-white shadow-md ${visuals.shadowColor}`;
  } else if (variant === 'solid') {
    styleClasses = `${visuals.badgeBg} ${visuals.badgeText}`;
  } else {
    // subtle
    styleClasses = `${visuals.bgColor} ${visuals.textColor} border ${visuals.borderColor}`;
  }

  return (
    <div
      className={`flex items-center justify-center shrink-0 transition-all duration-300 ${sizeClasses[size]} ${styleClasses} ${className}`}
      aria-hidden="true"
    >
      <Icon className={`${iconSizes[size]} transition-transform duration-300`} strokeWidth={2.2} />
    </div>
  );
};
