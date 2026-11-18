import React, { useState } from 'react';
import {
  Star,
  MessageSquare,
  CheckCircle2,
  Clock,
  Send,
  AlertTriangle,
  User,
  ShieldCheck
} from 'lucide-react';
import { Listing, Review } from '../../types';

interface ProfileReviewsSectionProps {
  listing: Listing;
  reviews: Review[];
  onSubmitReview: (e: React.FormEvent) => Promise<void>;
  userName: string;
  setUserName: (val: string) => void;
  userRating: number;
  setUserRating: (val: number) => void;
  userComment: string;
  setUserComment: (val: string) => void;
  isSubmittingReview: boolean;
}

export const ProfileReviewsSection: React.FC<ProfileReviewsSectionProps> = ({
  listing,
  reviews,
  onSubmitReview,
  userName,
  setUserName,
  userRating,
  setUserRating,
  userComment,
  setUserComment,
  isSubmittingReview
}) => {
  return (
    <div className="space-y-5" dir="rtl">
      {/* 1. Rating Summary Header */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
        <div className="space-y-1">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <MessageSquare className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              تقييمات وآراء أهالي شها
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            تجارب حقيقية موثقة من أهالي القرية والمترددين على النشاط
          </p>
        </div>

        <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/40 px-5 py-3 rounded-2xl">
          <div className="text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">
            {listing.rating ? listing.rating.toFixed(1) : '5.0'}
          </div>
          <div className="space-y-0.5 text-right">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(st => (
                <Star
                  key={st}
                  className={`w-4 h-4 ${
                    st <= Math.round(listing.rating || 5)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-300 dark:text-slate-700'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] font-bold text-slate-500">
              بناءً على {listing.ratingsCount || reviews.length || 1} تقييم
            </span>
          </div>
        </div>
      </div>

      {/* 2. Reviews List */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h4 className="text-sm font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
          التعليقات المنشورة ({reviews.length})
        </h4>

        {reviews.length > 0 ? (
          <div className="space-y-3.5">
            {reviews.map(rev => {
              const isPending = rev.status === 'pending';
              return (
                <div
                  key={rev.id}
                  className={`p-4 rounded-2xl border transition-colors space-y-2 ${
                    isPending
                      ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-slate-900 dark:text-white block">
                          {rev.userName}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('ar-EG') : 'حديثاً'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= rev.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300 dark:text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {rev.comment}
                  </p>

                  {isPending && (
                    <div className="flex items-center gap-1.5 text-[10px] text-amber-600 dark:text-amber-400 font-bold pt-1">
                      <Clock className="w-3 h-3" />
                      <span>تقييمك قيد المراجعة الإدارية وسيظهر للجميع فور الاعتماد</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 space-y-2">
            <Star className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
            <p className="text-xs font-bold">كن أول من يقيّم {listing.name} في شها ون!</p>
          </div>
        )}
      </div>

      {/* 3. Review Submission Form */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Send className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white">
              أضف تقييمك ورأيك في الخدمة
            </h4>
            <p className="text-[11px] text-slate-500">مشاركتك تساعد أهل شها في اختيار الأفضل</p>
          </div>
        </div>

        <form onSubmit={onSubmitReview} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                اسمك الكريم *
              </label>
              <input
                type="text"
                required
                value={userName}
                onChange={e => setUserName(e.target.value)}
                placeholder="اكتب اسمك..."
                className="w-full px-3.5 py-2.5 rounded-2xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                التقييم بالنجوم *
              </label>
              <div className="flex items-center gap-2 p-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 min-h-[44px]">
                {[1, 2, 3, 4, 5].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setUserRating(val)}
                    className="p-1 cursor-pointer transition-transform hover:scale-110 active:scale-95"
                    title={`${val} نجوم`}
                  >
                    <Star
                      className={`w-6 h-6 ${
                        val <= userRating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-black text-amber-600 dark:text-amber-400 mr-2">
                  ({userRating} من 5)
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              تعليقك وتجربتك *
            </label>
            <textarea
              required
              rows={3}
              value={userComment}
              onChange={e => setUserComment(e.target.value)}
              placeholder="اكتب تفاصيل تجربتك، المعاملة، الأسعار، أو جودة الخدمة بشها..."
              className="w-full px-3.5 py-2.5 rounded-2xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none resize-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>نظام تدقيق فوري لمنع الإعلانات المزيفة أو التعليقات المسيئة</span>
            </div>

            <button
              type="submit"
              disabled={isSubmittingReview}
              className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-50 text-white font-black text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer min-h-[44px]"
            >
              {isSubmittingReview ? 'جاري الإرسال...' : 'إرسال التقييم'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
