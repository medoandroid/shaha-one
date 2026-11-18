import React, { useState, useEffect } from 'react';
import {
  Newspaper,
  Search,
  Tag,
  Pin,
  AlertTriangle,
  Calendar,
  Eye,
  Share2,
  Check,
  X,
  Megaphone,
  Building2,
  Sparkles,
  HeartPulse,
  LayoutGrid,
  List,
  ChevronLeft,
  ArrowLeft
} from 'lucide-react';
import { useDirectory } from '../context/DirectoryContext';
import { VillageNews, NewsCategory } from '../types';
import { updateSeoMeta, navigateTo } from '../utils/navigation';
import { HorizontalScrollStrip } from '../components/common/HorizontalScrollStrip';

interface NewsPageProps {
  initialCategory?: string;
  initialArticleId?: string;
}

export const NewsPage: React.FC<NewsPageProps> = ({
  initialCategory,
  initialArticleId
}) => {
  const { villageNews } = useDirectory();
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory | 'all'>(
    (initialCategory as NewsCategory) || 'all'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeNews, setActiveNews] = useState<VillageNews | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoading] = useState(false);

  useEffect(() => {
    updateSeoMeta(
      'أخبار وتنويهات شها اليومية',
      'التغطية الرسمية المباشرة لأخبار وقرارات وخدمات قرية شها لحظة بلحظة.'
    );
  }, []);

  // Deep-link auto-open article modal if URL contains article ID
  useEffect(() => {
    if (initialArticleId && villageNews.length > 0) {
      const match = villageNews.find(n => n.id === initialArticleId);
      if (match) setActiveNews(match);
    }
  }, [initialArticleId, villageNews]);

  const categories: { id: NewsCategory | 'all'; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'all', label: 'جميع الأخبار', icon: Newspaper },
    { id: 'emergency', label: 'طوارئ وإغاثة', icon: AlertTriangle },
    { id: 'services', label: 'خدمات وتطوير', icon: Building2 },
    { id: 'general', label: 'أخبار عامة', icon: Megaphone },
    { id: 'projects', label: 'مشروعات شها', icon: Sparkles },
    { id: 'events', label: 'فعاليات ومناسبات', icon: HeartPulse }
  ];

  const filteredNews = villageNews.filter(news => {
    const matchesCat = selectedCategory === 'all' || news.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      news.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      news.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (news.content && news.content.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const pinnedNews = villageNews.filter(n => n.isPinned || n.isUrgent);

  const handleShare = (news: VillageNews, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `${news.title}\n\n${news.summary}\n\nتابع أحدث أخبار وتحديثات شها عبر منصة SHAHA ONE: ${window.location.origin}/?page=news&article=${news.id}`;
    if (navigator.share) {
      navigator.share({
        title: news.title,
        text: shareText,
        url: `${window.location.origin}/?page=news&article=${news.id}`
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      setCopiedId(news.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffMinutes = Math.floor((Date.now() - date.getTime()) / (1000 * 60));
      if (diffMinutes < 60) return `منذ ${Math.max(1, diffMinutes)} دقيقة`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `منذ ${diffHours} ساعة`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `منذ ${diffDays} يوم`;
      return date.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <section className="page-hero p-6 sm:p-10">
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 text-emerald-200 text-xs font-bold border border-white/15 backdrop-blur-md">
            <Newspaper className="w-4 h-4 text-emerald-300" />
            <span>المركز الإخباري الموحد لقرية شها</span>
          </div>

          <h1 className="font-display text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            أخبار وإعلانات شها الهامة لحظة بلحظة
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            منصتك الرقمية الموثوقة لمتابعة كافة المستجدات والخدمات والقرارات الخدمية والخيرية والصحية الصادرة عن المؤسسات واللجان المجتمعية بشها.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-emerald-200 pt-2">
            <span className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-xl border border-white/10">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>{villageNews.length} خبراً ومستجداً مسجلاً</span>
            </span>
            <span className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-xl border border-white/10">
              <Pin className="w-4 h-4 text-amber-400" />
              <span>{pinnedNews.length} تنويه مثبت بالصدارة</span>
            </span>
          </div>
        </div>

        {/* Decorative Background Graphic */}
        <div className="absolute left-[-20px] bottom-[-20px] opacity-10 pointer-events-none">
          <Newspaper className="w-72 h-72 text-emerald-400" />
        </div>
      </section>

      {/* Urgent Breaking Ticker Banner */}
      {pinnedNews.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-600/20 to-amber-500/15 border border-amber-500/40 p-3 sm:p-4 backdrop-blur-md shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2 shrink-0 bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm animate-pulse">
              <Megaphone className="w-3.5 h-3.5" />
              <span>تنويهات هامة بالصدارة</span>
            </div>
            <div className="flex-1 overflow-x-auto no-scrollbar scroll-smooth">
              <div className="flex items-center gap-4 text-xs sm:text-sm font-bold text-slate-900 dark:text-amber-100 whitespace-nowrap">
                {pinnedNews.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveNews(item)}
                    className="flex items-center gap-2 hover:underline hover:text-amber-600 dark:hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    {item.isUrgent && (
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
                    )}
                    <span>{item.title}</span>
                    <ChevronLeft className="w-4 h-4 opacity-60" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Control Bar: Search & Category Pills & View Mode */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="ابحث في الأخبار والقرارات والتنبيهات..."
              className="w-full pr-10 pl-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-xs sm:text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
          </div>

          {/* Grid vs List View Toggle */}
          <div className="flex items-center gap-2 justify-end">
            <span className="text-xs text-slate-400 font-semibold hidden sm:inline">شكل العرض:</span>
            <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="عرض الشبكة"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="عرض القائمة"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <HorizontalScrollStrip contentClassName="flex items-center gap-2 pb-1 pt-1" ariaLabel="تصنيفات الأخبار">
          {categories.map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-[1.02]'
                    : 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/70 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-emerald-500'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </HorizontalScrollStrip>
      </div>

      {/* Skeleton Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 space-y-4 animate-pulse"
            >
              <div className="h-44 bg-slate-200 dark:bg-slate-700 rounded-2xl w-full" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-3/4" />
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-lg w-full" />
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-lg w-2/3" />
            </div>
          ))}
        </div>
      ) : filteredNews.length > 0 ? (
        /* News List / Grid */
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'flex flex-col gap-4'
          }
        >
          {filteredNews.map(item => (
            <article
              key={item.id}
              onClick={() => setActiveNews(item)}
              className={`card-luxe h-full group relative hover:border-emerald-500/50 hover:-translate-y-0.5 overflow-hidden cursor-pointer ${
                viewMode === 'list' ? 'flex flex-col sm:flex-row items-stretch' : 'flex flex-col justify-between'
              }`}
            >
              <div
                className={`relative bg-slate-900 overflow-hidden shrink-0 ${
                  viewMode === 'list' ? 'w-full sm:w-64 h-48 sm:h-auto' : 'h-48 w-full'
                }`}
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 flex items-center justify-center p-6 text-center">
                    <Newspaper className="w-12 h-12 text-emerald-500/30 group-hover:scale-110 transition-transform" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

                <div className="absolute top-3 right-3 left-3 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-600/95 text-white backdrop-blur-md shadow-sm">
                    <Tag className="w-3 h-3" />
                    <span>{item.categoryLabel || item.category}</span>
                  </span>

                  <div className="flex items-center gap-1.5">
                    {item.isPinned && (
                      <span className="p-1.5 rounded-full bg-amber-500 text-white shadow-md" title="خبر مثبت">
                        <Pin className="w-3.5 h-3.5 fill-white" />
                      </span>
                    )}
                    {item.isUrgent && (
                      <span className="p-1.5 rounded-full bg-red-600 text-white shadow-md animate-pulse" title="عاجل">
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>

                <div className="absolute bottom-3 right-3 text-[11px] font-medium text-slate-200 flex items-center gap-1 bg-black/45 px-2.5 py-1 rounded-full backdrop-blur-sm">
                  <Calendar className="w-3 h-3 text-emerald-400" />
                  <span>{formatRelativeTime(item.publishedAt)}</span>
                </div>
              </div>

              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h2 className="card-title text-base sm:text-[17px] text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 min-h-[2.8rem]">
                    {item.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                <div className="card-footer-strip flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 tabular-nums">
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.viewsCount || 0} مشاهدة</span>
                    </span>
                    {item.publisherName && (
                      <span className="truncate max-w-[140px] font-medium text-slate-700 dark:text-slate-300">
                        {item.publisherName}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={e => handleShare(item, e)}
                    className="min-h-[36px] flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">تم النسخ</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-bold">مشاركة</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="card-luxe p-12 text-center border-dashed space-y-3">
          <Newspaper className="w-12 h-12 text-slate-400 mx-auto opacity-40" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">لا توجد أخبار تطابق البحث والتحديد</h3>
          <p className="text-xs text-slate-500">جرب تغيير تصنيف الأخبار أو البحث بكلمات أخرى</p>
        </div>
      )}

      {/* Full Article Modal */}
      {activeNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div
            className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 px-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-sm">
                  {activeNews.categoryLabel || activeNews.category}
                </span>
                {activeNews.isUrgent && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-600 text-white animate-pulse">
                    عاجل
                  </span>
                )}
              </div>
              <button
                onClick={() => setActiveNews(null)}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 no-scrollbar">
              {activeNews.imageUrl && (
                <div className="rounded-2xl overflow-hidden max-h-80 w-full bg-slate-900 shadow-md">
                  <img
                    src={activeNews.imageUrl}
                    alt={activeNews.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-3">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug">
                  {activeNews.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                    {formatRelativeTime(activeNews.publishedAt)}
                  </span>
                  {activeNews.publisherName && (
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      الناشر: {activeNews.publisherName}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {activeNews.viewsCount || 0} مشاهدة
                  </span>
                </div>
              </div>

              <div className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed space-y-4 whitespace-pre-line">
                {activeNews.content || activeNews.summary}
              </div>
            </div>

            {/* Actions Footer */}
            <div className="p-4 px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 flex items-center justify-between">
              <button
                onClick={e => handleShare(activeNews, e)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>{copiedId === activeNews.id ? 'تم نسخ رابط الخبر!' : 'مشاركة الخبر'}</span>
              </button>

              <button
                onClick={() => setActiveNews(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
