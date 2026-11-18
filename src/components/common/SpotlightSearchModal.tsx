import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  X,
  Phone,
  ExternalLink,
  ChevronLeft,
  Building2,
  Stethoscope,
  Pill,
  GraduationCap,
  Store,
  Sparkles,
  ArrowRight,
  Clock,
  Globe,
  Droplet,
  Heart,
  PhoneCall,
  CheckCircle2
} from 'lucide-react';
import { useDirectory } from '../../context/DirectoryContext';
import { Listing, Category, EmergencyNumber, CommunityFacebookPage } from '../../types';
import { navigateTo } from '../../utils/navigation';
import { IconicVerifiedBadge } from './IconicVerifiedBadge';

interface SpotlightSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectListing: (listing: Listing) => void;
  onCallListing?: (listing: Listing) => void;
  onShowToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const SpotlightSearchModal: React.FC<SpotlightSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectListing,
  onCallListing,
  onShowToast
}) => {
  const {
    listings,
    categories,
    emergencyNumbers,
    communityPages
  } = useDirectory();

  const [query, setQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'listings' | 'emergency' | 'pages'>('all');
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto-focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
      setSelectedFilter('all');
    }
  }, [isOpen]);

  // Global ESC key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Search Results
  const normalizedQuery = query.trim().toLowerCase();

  const filteredListings = useMemo(() => {
    if (!normalizedQuery) return listings.slice(0, 5);
    return listings
      .filter(l => {
        if (l.status === 'hidden') return false;
        return (
          l.name.toLowerCase().includes(normalizedQuery) ||
          (l.titleOrSpecialty && l.titleOrSpecialty.toLowerCase().includes(normalizedQuery)) ||
          (l.phone && l.phone.includes(normalizedQuery)) ||
          (l.address && l.address.toLowerCase().includes(normalizedQuery)) ||
          (l.description && l.description.toLowerCase().includes(normalizedQuery))
        );
      })
      .slice(0, 8);
  }, [listings, normalizedQuery]);

  const filteredEmergency = useMemo(() => {
    if (!normalizedQuery) return [];
    return emergencyNumbers.filter(em =>
      em.titleAr.toLowerCase().includes(normalizedQuery) ||
      em.phone.includes(normalizedQuery) ||
      (em.descriptionAr && em.descriptionAr.toLowerCase().includes(normalizedQuery))
    );
  }, [emergencyNumbers, normalizedQuery]);

  const filteredPages = useMemo(() => {
    if (!normalizedQuery) return [];
    return communityPages.filter(p =>
      p.isActive && (
        p.name.toLowerCase().includes(normalizedQuery) ||
        (p.description && p.description.toLowerCase().includes(normalizedQuery))
      )
    );
  }, [communityPages, normalizedQuery]);

  if (!isOpen) return null;

  const totalResults =
    (selectedFilter === 'all' || selectedFilter === 'listings' ? filteredListings.length : 0) +
    (selectedFilter === 'all' || selectedFilter === 'emergency' ? filteredEmergency.length : 0) +
    (selectedFilter === 'all' || selectedFilter === 'pages' ? filteredPages.length : 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] animate-scale-up mt-6 sm:mt-0"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Header Input */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-600/30">
            <Search className="w-5 h-5" />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="ابحث بالاسم، التخصص، رقم الهاتف، أو اسم المحل في شها..."
            className="flex-1 bg-transparent text-sm sm:text-base font-bold text-slate-900 dark:text-white placeholder-slate-400 outline-none"
          />

          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition-colors"
              title="مسح البحث"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <span>ESC</span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-2 overflow-x-auto scrollbar-none bg-white dark:bg-slate-900">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'listings', label: `الأرقام والخدمات (${filteredListings.length})` },
            { id: 'emergency', label: `الطوارئ (${filteredEmergency.length})` },
            { id: 'pages', label: `صفحات فيسبوك (${filteredPages.length})` }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedFilter === f.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 max-h-[60vh] scrollbar-thin">
          {totalResults === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                لا توجد نتائج مطابقة لـ «{query}»
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                جرّب البحث بكلمة أخرى، أو باسم الطبيب أو المحل مباشرة، أو تصفح الأقسام من القائمة الرئيسية.
              </p>
            </div>
          ) : (
            <>
              {/* Listings Group */}
              {(selectedFilter === 'all' || selectedFilter === 'listings') && filteredListings.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider px-2">
                    {normalizedQuery ? 'الأرقام والخدمات المطابقة' : 'خدمات مقترحة وشائعة'}
                  </div>
                  <div className="space-y-1.5">
                    {filteredListings.map(listing => (
                      <div
                        key={listing.id}
                        onClick={() => {
                          onSelectListing(listing);
                          onClose();
                        }}
                        className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50/70 dark:hover:bg-blue-950/40 border border-slate-200/70 dark:border-slate-800 hover:border-blue-300 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {listing.imageUrl ? (
                            <img
                              src={listing.imageUrl}
                              alt={listing.name}
                              className="w-11 h-11 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-black text-sm shrink-0 border border-blue-200 dark:border-blue-800">
                              {listing.name.slice(0, 1)}
                            </div>
                          )}

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-sm font-black text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                                {listing.name}
                              </h4>
                              {listing.primaryBadgeId && (
                                <IconicVerifiedBadge
                                  badgeId={listing.primaryBadgeId}
                                  size="sm"
                                  className="inline-flex"
                                />
                              )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {listing.titleOrSpecialty || listing.address}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <a
                            href={`tel:${listing.phone}`}
                            onClick={e => {
                              e.stopPropagation();
                              if (onCallListing) onCallListing(listing);
                            }}
                            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                            title={`اتصال بـ ${listing.name}`}
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline font-mono dir-ltr">{listing.phone}</span>
                          </a>
                          <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-1 transition-transform" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Emergency Numbers Group */}
              {(selectedFilter === 'all' || selectedFilter === 'emergency') && filteredEmergency.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-black text-red-500 uppercase tracking-wider px-2">
                    أرقام الطوارئ السريعة
                  </div>
                  <div className="space-y-1.5">
                    {filteredEmergency.map(em => (
                      <div
                        key={em.id}
                        className="p-3 rounded-2xl bg-red-50/60 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                            <PhoneCall className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
                              {em.titleAr}
                            </h4>
                            <p className="text-xs text-slate-500 truncate">{em.descriptionAr}</p>
                          </div>
                        </div>

                        <a
                          href={`tel:${em.phone}`}
                          className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs shrink-0"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span className="font-mono font-bold text-sm">{em.phone}</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Facebook Pages Group */}
              {(selectedFilter === 'all' || selectedFilter === 'pages') && filteredPages.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-black text-blue-600 uppercase tracking-wider px-2">
                    صفحات شها على فيسبوك
                  </div>
                  <div className="space-y-1.5">
                    {filteredPages.map(page => (
                      <div
                        key={page.id}
                        className="p-3 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/40 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-[#1877F2] text-white flex items-center justify-center font-black text-lg shrink-0">
                            f
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
                              {page.name}
                            </h4>
                            <p className="text-xs text-slate-500 truncate">{page.category || page.url}</p>
                          </div>
                        </div>

                        <a
                          href={page.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-[#1877F2] hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shrink-0"
                        >
                          <span>زيارة</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer info bar */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 font-medium px-4">
          <span>منصة شها ون • بحث فوري شامل</span>
          <span className="font-mono text-[11px]">⌘K / Ctrl+K</span>
        </div>
      </div>
    </div>
  );
};
