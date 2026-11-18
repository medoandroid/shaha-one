// DevMeDoAnDrOiD
import React, { useState } from 'react';
import {
  ExternalLink,
  Users,
  CheckCircle2,
  Share2,
  Copy,
  Check,
  Globe,
  Radio
} from 'lucide-react';
import { CommunityFacebookPage } from '../../types';
import { useDirectory } from '../../context/DirectoryContext';

interface ShahaFacebookPagesProps {
  onShowToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ShahaFacebookPages: React.FC<ShahaFacebookPagesProps> = ({ onShowToast }) => {
  const { communityPages } = useDirectory();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activePages = communityPages
    .filter(p => p.isActive)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  if (activePages.length === 0) {
    return null;
  }

  const handleCopyLink = (page: CommunityFacebookPage) => {
    navigator.clipboard.writeText(page.url);
    setCopiedId(page.id);
    if (onShowToast) {
      onShowToast(`تم نسخ رابط صفحة «${page.name}» بنجاح`, 'success');
    }
    setTimeout(() => {
      setCopiedId(null);
    }, 2500);
  };

  const handleSharePage = (page: CommunityFacebookPage) => {
    if (navigator.share) {
      navigator.share({
        title: `${page.name} | SHAHA ONE - شها ون`,
        text: `تابع صفحة ${page.name} على فيسبوك من خلال منصة شها ون:`,
        url: page.url
      }).catch(() => {});
    } else {
      handleCopyLink(page);
    }
  };

  return (
    <section className="space-y-4" dir="rtl" aria-label="صفحات شها على فيسبوك">
      {/* Section Header Card */}
      <div className="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-blue-900/90 via-slate-900 to-indigo-950 text-white border border-blue-500/20 shadow-lg">
        {/* Decorative background glow */}
        <div className="absolute top-0 -left-10 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 right-10 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {/* Facebook Emblem */}
            <div className="w-12 h-12 rounded-2xl bg-[#1877F2] text-white flex items-center justify-center font-black text-2xl shadow-md shadow-blue-500/30 shrink-0 border border-white/20">
              f
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  صفحات شها على فيسبوك
                </h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
                  <span>تحديثات مستمرة</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
                الروابط والصفحات المجتمعية المعتمدة للتواصل ومتابعة أخبار ومناسبات قرية شها
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md text-slate-200 border border-white/10 flex items-center gap-1.5 shrink-0">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>مجتمع شها الرقمي</span>
            </span>
          </div>
        </div>
      </div>

      {/* Pages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {activePages.map((page, index) => {
          const isCopied = copiedId === page.id;

          return (
            <article
              key={page.id}
              className="card-luxe h-full group relative p-5 sm:p-6 hover:border-blue-500/60 dark:hover:border-blue-500/50 hover:-translate-y-0.5 flex flex-col justify-between"
            >
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-[#1877F2] text-white flex items-center justify-center font-black text-2xl shadow-md shadow-blue-500/20 shrink-0 group-hover:scale-105 transition-transform">
                      f
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="card-title text-base sm:text-[17px] text-slate-900 dark:text-white truncate" title={page.name}>
                          {page.name}
                        </h4>
                        {page.isVerified && (
                          <span className="text-blue-500 shrink-0" title="صفحة معتمدة رسمياً">
                            <CheckCircle2 className="w-4 h-4 fill-current text-blue-500" />
                          </span>
                        )}
                      </div>

                      {page.category && (
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block truncate">
                          {page.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {page.followers && (
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 shrink-0 inline-flex items-center gap-1 tabular-nums">
                      <Users className="w-3 h-3 text-blue-500" />
                      <span>{page.followers}</span>
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal min-h-[2.75rem] line-clamp-2">
                  {page.description || 'ملتقى تواصل ومتابعة أخبار وخدمات ومناسبات أهالي قرية شها.'}
                </p>

                <div className="card-meta-panel flex items-center justify-between gap-2 min-h-[42px]">
                  <span dir="ltr" className="text-[11px] font-mono text-slate-600 dark:text-slate-300 truncate text-left">
                    {page.url}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyLink(page)}
                    className="min-h-[32px] min-w-[32px] flex items-center justify-center rounded-lg text-slate-500 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-700 transition-colors shrink-0 cursor-pointer"
                    title="نسخ الرابط"
                    aria-label="نسخ رابط الصفحة"
                  >
                    {isCopied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="card-footer-strip flex items-center gap-2">
                <a
                  href={/^https?:\/\//i.test(page.url) ? page.url : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-h-[44px] px-4 py-2.5 rounded-2xl bg-[#1877F2] hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
                >
                  <span>زيارة الصفحة</span>
                  <ExternalLink className="w-4 h-4 shrink-0" />
                </a>

                <button
                  type="button"
                  onClick={() => handleSharePage(page)}
                  className="min-h-[44px] min-w-[44px] rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer shrink-0 border border-slate-200 dark:border-slate-700"
                  title="مشاركة الصفحة"
                  aria-label={`مشاركة صفحة ${page.name}`}
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

// Copyright (c) 2026 MeDoAnDrOiD. All Rights Reserved.
