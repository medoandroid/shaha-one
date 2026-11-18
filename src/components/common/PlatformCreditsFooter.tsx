import React from 'react';
import { useDirectory } from '../../context/DirectoryContext';
import { ExternalLink, Heart, Code, UserCheck, Sparkles } from 'lucide-react';

export const PlatformCreditsFooter: React.FC = () => {
  const { platformCredits } = useDirectory();

  const activeCredits = (platformCredits && platformCredits.length > 0)
    ? platformCredits.filter(c => c.isActive !== false)
    : [
        {
          id: 'dev_mohamed_ayman',
          name: 'Mohamed Ayman',
          role: 'التطوير والتنفيذ',
          description: 'مطور المنصة',
          link: 'https://medoandroid.github.io/DevMeDoAnDrOiD/',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          isActive: true
        },
        {
          id: 'idea_reda_elkhshen',
          name: 'M : Reda Elkhshen 🇫🇷',
          role: 'صاحب الفكرة والمشاركة والدعم',
          description: 'داعم فكرة المنصة',
          link: 'https://www.facebook.com/reda.elkhshen',
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
          isActive: true
        }
      ];

  return (
    <section className="relative overflow-hidden my-6 rounded-2xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white p-5 md:p-6 shadow-xl border border-emerald-500/20 dir-rtl">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4">
        {/* Header Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-medium border border-emerald-500/30">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>وراء SHAHA ONE</span>
        </div>

        {/* Motivational Subtitle Quote */}
        <p className="text-sm md:text-base font-medium text-slate-200 leading-relaxed max-w-2xl mx-auto italic">
          «فكرة بدأت بمشاركة وتشجيع، وتحولت إلى منصة رقمية لخدمة أهل شها.»
        </p>

        {/* Credits Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 max-w-2xl mx-auto text-right">
          {activeCredits.map((credit) => (
            <a
              key={credit.id}
              href={credit.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center gap-3.5 p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/50 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              {/* Profile / Role Badge Icon */}
              <div className="relative shrink-0">
                {credit.avatarUrl ? (
                  <img
                    src={credit.avatarUrl}
                    alt={credit.name}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-500/40 group-hover:ring-emerald-400 transition-all"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-base shadow-sm">
                    {credit.name.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <span className="absolute -bottom-1 -left-1 p-0.5 rounded-full bg-slate-900 border border-slate-700 text-emerald-400">
                  {credit.role.includes('تطوير') ? (
                    <Code className="w-3 h-3" />
                  ) : (
                    <Heart className="w-3 h-3 text-amber-400 fill-amber-400/20" />
                  )}
                </span>
              </div>

              {/* Text Info */}
              <div className="min-w-0 flex-1">
                <div className="text-xs text-emerald-400 font-semibold mb-0.5 flex items-center gap-1">
                  <span>{credit.role}</span>
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                  {credit.name}
                </h4>
                {credit.description && (
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {credit.description}
                  </p>
                )}
              </div>

              {/* Link Icon */}
              <div className="shrink-0 p-1.5 rounded-lg bg-slate-700/50 group-hover:bg-emerald-500/20 text-slate-400 group-hover:text-emerald-300 transition-all">
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
