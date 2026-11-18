import React from 'react';
import { Heart, Phone, ShieldCheck, MapPin, CheckCircle2, UserCheck, HeartHandshake } from 'lucide-react';
import { useDirectory } from '../../context/DirectoryContext';

export const CharitySection: React.FC = () => {
  const { charities } = useDirectory();

  const activeCharities = charities.filter(c => c.isActive);

  return (
    <section className="mb-14">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-emerald-900/10 mb-8 border border-emerald-500/30">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold text-emerald-100">
            <Heart className="w-4 h-4 fill-white text-white" />
            <span>تكافل وتراحم أهل قرية شها</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            قسم تواصل الخيرية والمساعدات الإنسانية
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 font-medium leading-relaxed">
            الجمعيات المشهرة وصناديق التكافل المعتمدة في شها لكفالة الأيتام وتوفير الأجهزة الطبية مجاناً ومساعدة الأسر المتعففة في سرية تامة وحفظ لكرامة الجميع.
          </p>
        </div>
      </div>

      {/* Privacy Guarantee Note */}
      <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl p-4 mb-8 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
          <p className="font-bold">ميثاق الخصوصية والكرامة الإنسانية في شها ون:</p>
          <p className="leading-relaxed">
            تلتزم إدارة منصة شها ون بعدم نشر أسماء أو صور أو بيانات شخصية للأسر أو الحالات المتعففة مراعاة للخصوصية وحفظاً للمشاعر. جميع التبرعات والمساعدات تمر عبر اللجان المعتمدة وأمناء العمل الخيري الموثوقين بالقرية.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {activeCharities.map((item) => (
          <div
            key={item.id}
            className="card-luxe h-full p-5 sm:p-6 hover:border-emerald-400 dark:hover:border-emerald-600 hover:-translate-y-0.5 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  مبادرة أهلية موثقة
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>معتمد بشها</span>
                </span>
              </div>

              <h3 className="card-title text-lg text-slate-900 dark:text-white">
                {item.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                {item.description}
              </p>

              {item.privacyNotice && (
                <div className="text-[11px] font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/40 p-3 rounded-2xl border border-emerald-200/70 dark:border-emerald-800/60 leading-relaxed">
                  {item.privacyNotice}
                </div>
              )}

              {(item.contactPerson || item.address) && (
                <div className="card-meta-panel text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
                  {item.contactPerson && (
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>المسؤول: {item.contactPerson}</span>
                    </div>
                  )}
                  {item.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>المقر: {item.address}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="card-footer-strip flex items-center gap-3">
              <a
                href={`tel:${item.phone}`}
                className="flex-1 min-h-[44px] py-2.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/20 active:scale-95 transition-all"
              >
                <Phone className="w-4 h-4 shrink-0" />
                <span>للتبرع والتواصل</span>
                <span dir="ltr" className="tabular-nums opacity-95">({item.phone})</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
