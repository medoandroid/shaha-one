// DevMeDoAnDrOiD
import React from 'react';
import {
  AlertTriangle,
  Ambulance,
  BookOpen,
  Building2,
  Car,
  Check,
  Droplet,
  Flame,
  FlaskConical,
  GraduationCap,
  HeartHandshake,
  Hospital,
  Landmark,
  Layers,
  MapPin,
  Newspaper,
  PackageCheck,
  PartyPopper,
  PhoneCall,
  Pill,
  Pin,
  Scale,
  School,
  ShieldAlert,
  ShoppingCart,
  Siren,
  Smartphone,
  Sparkles,
  Star,
  Stethoscope,
  Store,
  UtensilsCrossed,
  Wrench,
  X,
  Zap,
  type LucideIcon
} from 'lucide-react';

const EMOJI_TO_SVG: Record<string, { Icon: LucideIcon; colorClass?: string }> = {
  '🩺': { Icon: Stethoscope, colorClass: 'text-teal-600 dark:text-teal-400' },
  '💊': { Icon: Pill, colorClass: 'text-emerald-600 dark:text-emerald-400' },
  '🎓': { Icon: GraduationCap, colorClass: 'text-blue-600 dark:text-blue-400' },
  '🛒': { Icon: ShoppingCart, colorClass: 'text-amber-600 dark:text-amber-400' },
  '🍽️': { Icon: UtensilsCrossed, colorClass: 'text-orange-600 dark:text-orange-400' },
  '🍽': { Icon: UtensilsCrossed, colorClass: 'text-orange-600 dark:text-orange-400' },
  '🏫': { Icon: School, colorClass: 'text-indigo-600 dark:text-indigo-400' },
  '🔬': { Icon: FlaskConical, colorClass: 'text-cyan-600 dark:text-cyan-400' },
  '🧪': { Icon: FlaskConical, colorClass: 'text-cyan-600 dark:text-cyan-400' },
  '⚖️': { Icon: Scale, colorClass: 'text-slate-700 dark:text-slate-300' },
  '⚖': { Icon: Scale, colorClass: 'text-slate-700 dark:text-slate-300' },
  '📚': { Icon: BookOpen, colorClass: 'text-blue-700 dark:text-blue-300' },
  '🏛️': { Icon: Landmark, colorClass: 'text-emerald-700 dark:text-emerald-300' },
  '🏛': { Icon: Landmark, colorClass: 'text-emerald-700 dark:text-emerald-300' },
  '🕌': { Icon: Landmark, colorClass: 'text-emerald-700 dark:text-emerald-300' },
  '🚗': { Icon: Car, colorClass: 'text-sky-600 dark:text-sky-400' },
  '🔧': { Icon: Wrench, colorClass: 'text-amber-600 dark:text-amber-400' },
  '📦': { Icon: PackageCheck, colorClass: 'text-teal-600 dark:text-teal-400' },
  '🤝': { Icon: HeartHandshake, colorClass: 'text-rose-600 dark:text-rose-400' },
  '🩸': { Icon: Droplet, colorClass: 'text-rose-600 dark:text-rose-400' },
  '🚨': { Icon: Siren, colorClass: 'text-red-600 dark:text-red-400' },
  '🚑': { Icon: Ambulance, colorClass: 'text-red-600 dark:text-red-400' },
  '🚔': { Icon: ShieldAlert, colorClass: 'text-blue-600 dark:text-blue-400' },
  '🏥': { Icon: Hospital, colorClass: 'text-rose-600 dark:text-rose-400' },
  '📞': { Icon: PhoneCall, colorClass: 'text-emerald-600 dark:text-emerald-400' },
  '📍': { Icon: MapPin, colorClass: 'text-blue-600 dark:text-blue-400' },
  '📰': { Icon: Newspaper, colorClass: 'text-emerald-600 dark:text-emerald-400' },
  '⚡': { Icon: Zap, colorClass: 'text-amber-500' },
  '🔥': { Icon: Flame, colorClass: 'text-orange-500' },
  '✨': { Icon: Sparkles, colorClass: 'text-amber-500' },
  '⭐': { Icon: Star, colorClass: 'text-amber-500' },
  '★': { Icon: Star, colorClass: 'text-amber-500' },
  '🌟': { Icon: Sparkles, colorClass: 'text-amber-500' },
  '📌': { Icon: Pin, colorClass: 'text-amber-600 dark:text-amber-400' },
  '🎉': { Icon: PartyPopper, colorClass: 'text-emerald-600 dark:text-emerald-400' },
  '⚠': { Icon: AlertTriangle, colorClass: 'text-amber-500' },
  '⚠️': { Icon: AlertTriangle, colorClass: 'text-amber-500' },
  '📲': { Icon: Smartphone, colorClass: 'text-blue-600 dark:text-blue-400' },
  '📱': { Icon: Smartphone, colorClass: 'text-blue-600 dark:text-blue-400' },
  '🏪': { Icon: Store, colorClass: 'text-teal-600 dark:text-teal-400' },
  '🏢': { Icon: Building2, colorClass: 'text-blue-600 dark:text-blue-400' },
  '✓': { Icon: Check, colorClass: 'text-emerald-600 dark:text-emerald-400' },
  '✕': { Icon: X, colorClass: 'text-rose-600 dark:text-rose-400' }
};

interface EmojiGlyphProps {
  value: string;
  label?: string;
  sizeClass?: string;
  className?: string;
}

export const EmojiGlyph: React.FC<EmojiGlyphProps> = ({
  value,
  label,
  sizeClass = 'w-4 h-4',
  className = ''
}) => {
  const trimmed = value.trim();
  const mapped = EMOJI_TO_SVG[trimmed];

  if (mapped) {
    const { Icon, colorClass } = mapped;
    return (
      <Icon
        className={`inline-block shrink-0 ${sizeClass} ${colorClass ?? ''} ${className}`}
        aria-hidden={label ? undefined : true}
        aria-label={label}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={label || trimmed}
      className={`emoji-safe ${className}`}
    >
      {trimmed}
    </span>
  );
};

// Copyright (c) 2026 MeDoAnDrOiD. All Rights Reserved.
