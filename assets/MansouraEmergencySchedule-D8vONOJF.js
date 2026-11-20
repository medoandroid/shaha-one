import{a as e}from"./rolldown-runtime-BWaJ3C7D.js";import{Dn as t,Kn as n,L as r,Tn as i,X as a,Yn as o,an as s,et as c,h as l,mn as u,tt as d,xn as f}from"./vendor-react-C3SaPPMM.js";import{_ as p,p as m}from"./index-BsjIN5Ts.js";var h=e(o(),1);async function g(e){if(!e)return!1;try{if(navigator.clipboard&&window.isSecureContext)return await navigator.clipboard.writeText(e),!0}catch{}try{let t=document.createElement(`textarea`);t.value=e,t.style.position=`fixed`,t.style.left=`-999999px`,t.style.top=`-999999px`,t.setAttribute(`readonly`,``),document.body.appendChild(t),t.focus(),t.select();let n=document.execCommand(`copy`);return document.body.removeChild(t),n}catch{return!1}}var _=n(),v=({compactTeaser:e=!1,onOpenFullView:n})=>{let{mansouraSchedule:o}=m(),[s,u]=(0,h.useState)(!e),[v,b]=(0,h.useState)(null),[x,S]=(0,h.useState)(!1),{cairoDayKey:C,cairoDayName:w,cairoDateFormatted:T}=(0,h.useMemo)(()=>{try{let e=new Date,t=new Intl.DateTimeFormat(`ar-EG`,{timeZone:`Africa/Cairo`,weekday:`long`,year:`numeric`,month:`long`,day:`numeric`}),n=t.formatToParts(e).find(e=>e.type===`weekday`)?.value||``;return{cairoDayKey:[`sunday`,`monday`,`tuesday`,`wednesday`,`thursday`,`friday`,`saturday`][new Date(e.toLocaleString(`en-US`,{timeZone:`Africa/Cairo`})).getDay()],cairoDayName:n||`اليوم`,cairoDateFormatted:t.format(e)}}catch{return{cairoDayKey:`saturday`,cairoDayName:`اليوم`,cairoDateFormatted:``}}},[]),E=(o&&o.length>0?o:[{id:`mansoura_weekly`,title:`جدول استقبال الطوارئ في مستشفيات المنصورة`,days:[{dayKey:`saturday`,dayName:`السبت`,hospitalName:`مستشفى المنصورة الدولي`,phone:`0502222854`,notes:`قسم الاستقبال والدخلة الرئيسية`},{dayKey:`sunday`,dayName:`الأحد`,hospitalName:`مستشفى طوارئ جامعة المنصورة`,phone:`0502265472`,notes:`شارع جيهان - العيادات المجمعة`},{dayKey:`monday`,dayName:`الاثنين`,hospitalName:`مستشفى المنصورة التخصصي`,phone:`0502222854`,notes:`العام المباشر - قناة السويس`},{dayKey:`tuesday`,dayName:`الثلاثاء`,hospitalName:`مستشفى طوارئ جامعة المنصورة`,phone:`0502265472`,notes:`استقبال الحالات الحرجة`},{dayKey:`wednesday`,dayName:`الأربعاء`,hospitalName:`مستشفى المنصورة الدولي`,phone:`0502222854`,notes:`استقبال الجراحة والباطنة`},{dayKey:`thursday`,dayName:`الخميس`,hospitalName:`مستشفى طوارئ جامعة المنصورة`,phone:`0502265472`,notes:`استقبال طوارئ الجامعة`},{dayKey:`friday`,dayName:`الجمعة`,hospitalName:`مستشفى المنصورة التخصصي`,phone:`0502222854`,notes:`طوارئ عاجلة طوال 24 ساعة`}],importantPhones:[{label:`مستشفى المنصورة الدولي`,phone:`0502222854`},{label:`مستشفى طوارئ جامعة المنصورة`,phone:`0502265472`},{label:`الإسعاف الوطني`,phone:`123`}],isActive:!0}])[0],D=E.days.find(e=>e.dayKey===C)||E.days[0],O=async e=>{await g(e),b(e),setTimeout(()=>b(null),2500)},k=async()=>{let e=`🚨 جدول استقبال الطوارئ بمستشفيات المنصورة اليوم (${D.dayName}):\n🏥 ${D.hospitalName}\n📞 للاتصال المباشر: ${D.phone}\n🚑 الإسعاف: 123\nعبر دليل شها ون SHAHA ONE`;if(navigator.share)try{await navigator.share({title:`جدول طوارئ مستشفيات المنصورة - شها ون`,text:e,url:window.location.href});return}catch{}await g(e),S(!0),setTimeout(()=>S(!1),2500)},A=()=>{let e=E.days.find(e=>e.dayKey===C)||E.days[0],t=`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <title>جدول طوارئ مستشفيات المنصورة - شها ون</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
    body {
      font-family: 'Cairo', system-ui, sans-serif;
      direction: rtl;
      text-align: right;
      padding: 24px;
      color: #0f172a;
      background: #ffffff;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 12px;
      margin-bottom: 20px;
    }
    .header h1 {
      font-size: 22px;
      font-weight: 900;
      color: #0284c7;
      margin: 0 0 4px 0;
    }
    .header h2 {
      font-size: 16px;
      font-weight: 800;
      color: #e11d48;
      margin: 4px 0;
    }
    .header p {
      font-size: 11px;
      color: #64748b;
      margin: 0;
    }
    .today-box {
      background-color: #f0fdf4;
      border: 2px solid #22c55e;
      border-radius: 12px;
      padding: 14px 18px;
      margin-bottom: 20px;
    }
    .today-box h3 {
      margin: 0 0 4px 0;
      font-size: 13px;
      color: #15803d;
    }
    .today-box p {
      margin: 0;
      font-size: 16px;
      font-weight: 900;
      color: #0f172a;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 10px 14px;
      font-size: 13px;
    }
    th {
      background-color: #f1f5f9;
      font-weight: 800;
      color: #1e293b;
    }
    tr.today-row {
      background-color: #ecfdf5;
      font-weight: bold;
    }
    .phones-header {
      font-weight: 800;
      font-size: 13px;
      margin-bottom: 10px;
      color: #e11d48;
    }
    .phones-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }
    .phone-card {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 10px;
      background-color: #f8fafc;
    }
    .phone-card strong {
      display: block;
      font-size: 12px;
      color: #334155;
    }
    .phone-card span {
      font-size: 14px;
      font-weight: 800;
      color: #e11d48;
      direction: ltr;
      display: inline-block;
    }
    .footer {
      text-align: center;
      font-size: 11px;
      color: #94a3b8;
      border-top: 1px solid #e2e8f0;
      padding-top: 12px;
      margin-top: 24px;
    }
    @media print {
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>SHAHA ONE | شها ون</h1>
    <h2>جدول استقبال الطوارئ في مستشفيات المنصورة</h2>
    <p>تاريخ المستند: ${p(T)} (توقيت مصر)</p>
  </div>

  <div class="today-box">
    <h3>المستشفى المُستقبِل اليوم (${p(e.dayName)}):</h3>
    <p>${p(e.hospitalName)} &mdash; هاتف الطوارئ: <span style="direction: ltr; display: inline-block;">${p(e.phone)}</span> (${p(e.notes||`استقبال عاجل`)})</p>
  </div>

  <table>
    <thead>
      <tr>
        <th>اليوم</th>
        <th>المستشفى المستقبل للحالات</th>
        <th>رقم هاتف الطوارئ</th>
        <th>ملاحظات والتفاصيل</th>
      </tr>
    </thead>
    <tbody>
      ${E.days.map(e=>`
        <tr class="${e.dayKey===C?`today-row`:``}">
          <td><strong>${p(e.dayName)}</strong> ${e.dayKey===C?`(اليوم)`:``}</td>
          <td><strong>${p(e.hospitalName)}</strong></td>
          <td style="direction: ltr; text-align: right;"><strong>${p(e.phone)}</strong></td>
          <td>${p(e.notes||`استقبال عاجل طوال اليوم`)}</td>
        </tr>
      `).join(``)}
    </tbody>
  </table>

  <div class="phones-header">
    أرقام الطوارئ السريعة بالمنصورة وشها:
  </div>
  <div class="phones-grid">
    ${E.importantPhones.map(e=>`
      <div class="phone-card">
        <strong>${p(e.label)}</strong>
        <span>${p(e.phone)}</span>
      </div>
    `).join(``)}
  </div>

  <div class="footer">
    تم طباعة هذا المستند المعتمد من دليل شها ون SHAHA ONE &mdash; قرية شها، مركز المنصورة، محافظة الدقهلية
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 250);
    };
  <\/script>
</body>
</html>`;try{let e=window.open(``,`_blank`,`width=850,height=900`);if(e){e.opener=null,e.document.open(),e.document.write(t),e.document.close();return}}catch{}window.print()};return e?(0,_.jsxs)(`section`,{className:`animate-reveal-up relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#1b1220] to-slate-950 text-white p-4 sm:p-5 shadow-xl border border-rose-500/25 dir-rtl`,children:[(0,_.jsx)(`div`,{className:`absolute inset-0 pointer-events-none`,style:{background:`radial-gradient(circle at 12% 18%, rgba(244, 63, 94, 0.16) 0%, transparent 45%), radial-gradient(circle at 88% 85%, rgba(16, 185, 129, 0.12) 0%, transparent 45%)`}}),(0,_.jsxs)(`div`,{className:`relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4`,children:[(0,_.jsxs)(`div`,{className:`space-y-2 flex-1 min-w-0`,children:[(0,_.jsxs)(`div`,{className:`flex items-center gap-2 flex-wrap`,children:[(0,_.jsxs)(`span`,{className:`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-200 text-xs font-black border border-rose-500/35`,children:[(0,_.jsx)(`span`,{className:`w-2 h-2 rounded-full bg-rose-400 animate-pulse`}),(0,_.jsxs)(`span`,{children:[`استقبال الطوارئ اليوم (`,w,`)`]})]}),(0,_.jsx)(`span`,{className:`text-[11px] font-bold text-slate-300 bg-white/[0.07] px-2.5 py-1 rounded-full border border-white/10`,children:T.split(` `).slice(0,3).join(` `)})]}),(0,_.jsxs)(`h3`,{className:`font-display text-lg sm:text-xl font-black text-amber-300 flex items-center gap-2.5`,children:[(0,_.jsx)(`span`,{className:`w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0`,children:(0,_.jsx)(t,{className:`w-5 h-5 text-rose-400`})}),(0,_.jsx)(`span`,{className:`truncate`,children:D.hospitalName})]}),(0,_.jsxs)(`div`,{className:`flex items-center gap-2 flex-wrap pt-0.5`,children:[(0,_.jsxs)(`a`,{href:`tel:${D.phone}`,className:`font-mono font-bold text-emerald-300 hover:text-white text-xs sm:text-sm bg-emerald-950/70 hover:bg-emerald-700 border border-emerald-700/60 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors active:scale-95`,children:[(0,_.jsx)(d,{className:`w-3.5 h-3.5`}),(0,_.jsx)(`span`,{dir:`ltr`,children:D.phone})]}),(0,_.jsxs)(`a`,{href:`tel:123`,className:`font-mono font-bold text-rose-300 hover:text-white text-xs sm:text-sm bg-rose-950/70 hover:bg-rose-700 border border-rose-700/60 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors active:scale-95`,children:[(0,_.jsx)(c,{className:`w-3.5 h-3.5`}),(0,_.jsx)(`span`,{children:`الإسعاف: 123`})]})]})]}),(0,_.jsx)(`div`,{className:`flex items-center gap-2 shrink-0 w-full md:w-auto`,children:(0,_.jsxs)(`button`,{type:`button`,onClick:n||(()=>u(e=>!e)),className:`w-full md:w-auto h-9 sm:h-10 px-4 rounded-xl text-xs font-black bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-md shadow-rose-950/35 transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer`,children:[(0,_.jsx)(i,{className:`w-3.5 h-3.5`}),(0,_.jsx)(`span`,{children:`جدول الأسبوع بالكامل`})]})})]}),s&&!n&&(0,_.jsx)(`div`,{className:`relative z-10 mt-4 pt-4 border-t border-rose-900/60`,children:(0,_.jsx)(y,{currentSchedule:E,cairoDayKey:C,copyToClipboard:O,copiedPhone:v,handleShare:k,shareSuccess:x,handlePrint:A})})]}):(0,_.jsxs)(`div`,{className:`bg-white dark:bg-slate-900 rounded-2xl p-5 md:p-6 shadow-xl border border-slate-200 dark:border-slate-800 dir-rtl my-6 print:border-none print:shadow-none print:p-0`,children:[(0,_.jsxs)(`div`,{className:`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800`,children:[(0,_.jsxs)(`div`,{className:`space-y-1`,children:[(0,_.jsxs)(`div`,{className:`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-800`,children:[(0,_.jsx)(l,{className:`w-3.5 h-3.5 text-rose-600 dark:text-rose-400 animate-pulse`}),(0,_.jsx)(`span`,{children:`خدمات الصحة والطوارئ - المنصورة وشها`})]}),(0,_.jsxs)(`h2`,{className:`text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5`,children:[(0,_.jsx)(i,{className:`w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0`}),(0,_.jsx)(`span`,{children:`جدول استقبال الطوارئ في مستشفيات المنصورة`})]}),(0,_.jsx)(`p`,{className:`text-xs text-slate-500 dark:text-slate-400`,children:`الجدول الأسبوعي المعتمد لتبادل أيام الاستقبال بالمستشفيات الرئيسية – يتم التحديث تلقائياً بحسب التوقيت المحلي للمملكة ومصر.`})]}),(0,_.jsxs)(`div`,{className:`flex items-center gap-2 shrink-0 print:hidden`,children:[(0,_.jsxs)(`button`,{onClick:k,className:`py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer`,children:[x?(0,_.jsx)(f,{className:`w-4 h-4 text-emerald-500`}):(0,_.jsx)(r,{className:`w-4 h-4 text-blue-500`}),(0,_.jsx)(`span`,{children:x?`تم النسخ!`:`مشاركة الجدول`})]}),(0,_.jsxs)(`button`,{onClick:A,className:`py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer`,children:[(0,_.jsx)(a,{className:`w-4 h-4 text-emerald-500`}),(0,_.jsx)(`span`,{children:`طباعة`})]})]})]}),(0,_.jsx)(y,{currentSchedule:E,cairoDayKey:C,copyToClipboard:O,copiedPhone:v,handleShare:k,shareSuccess:x,handlePrint:A})]})},y=({currentSchedule:e,cairoDayKey:t,copyToClipboard:n,copiedPhone:r,handlePrint:i})=>(0,_.jsxs)(`div`,{className:`space-y-6`,children:[(()=>{let n=e.days.find(e=>e.dayKey===t)||e.days[0];return(0,_.jsx)(`div`,{className:`bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-4 md:p-5 shadow-md border-2 border-emerald-500/60 relative overflow-hidden`,children:(0,_.jsxs)(`div`,{className:`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`,children:[(0,_.jsxs)(`div`,{className:`space-y-1`,children:[(0,_.jsxs)(`div`,{className:`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/40`,children:[(0,_.jsx)(u,{className:`w-4 h-4 text-emerald-400`}),(0,_.jsxs)(`span`,{children:[`المستشفى المُستقبِل اليوم (`,n.dayName,`)`]})]}),(0,_.jsx)(`h3`,{className:`text-lg md:text-xl font-black text-amber-300 mt-1`,children:n.hospitalName}),n.notes&&(0,_.jsx)(`p`,{className:`text-xs text-slate-300 font-medium`,children:n.notes})]}),(0,_.jsx)(`div`,{className:`flex items-center gap-2 shrink-0`,children:(0,_.jsxs)(`a`,{href:`tel:${n.phone}`,className:`py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer`,children:[(0,_.jsx)(d,{className:`w-4 h-4`}),(0,_.jsxs)(`span`,{children:[`اتصال بالفور: `,n.phone]})]})})]})})})(),(0,_.jsx)(`div`,{className:`overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800`,children:(0,_.jsxs)(`table`,{className:`w-full text-right text-sm`,children:[(0,_.jsx)(`thead`,{children:(0,_.jsxs)(`tr`,{className:`bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800`,children:[(0,_.jsx)(`th`,{className:`py-3 px-4`,children:`اليوم`}),(0,_.jsx)(`th`,{className:`py-3 px-4`,children:`المستشفى المستقبل للحالات`}),(0,_.jsx)(`th`,{className:`py-3 px-4`,children:`رقم هاتف الطوارئ`}),(0,_.jsx)(`th`,{className:`py-3 px-4`,children:`ملاحظات والتفاصيل`})]})}),(0,_.jsx)(`tbody`,{className:`divide-y divide-slate-200 dark:divide-slate-800`,children:e.days.map(e=>{let i=e.dayKey===t;return(0,_.jsxs)(`tr`,{className:`transition-colors ${i?`bg-emerald-50/90 dark:bg-emerald-950/40 font-bold text-slate-900 dark:text-white`:`hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300`}`,children:[(0,_.jsx)(`td`,{className:`py-3.5 px-4`,children:(0,_.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,_.jsx)(`span`,{className:`font-bold`,children:e.dayName}),i&&(0,_.jsx)(`span`,{className:`px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold animate-pulse`,children:`اليوم`})]})}),(0,_.jsx)(`td`,{className:`py-3.5 px-4 font-extrabold text-slate-900 dark:text-white`,children:e.hospitalName}),(0,_.jsx)(`td`,{className:`py-3.5 px-4`,children:(0,_.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,_.jsxs)(`a`,{href:`tel:${e.phone}`,className:`font-mono text-emerald-600 dark:text-emerald-400 hover:underline font-bold text-sm dir-ltr flex items-center gap-1.5`,children:[(0,_.jsx)(d,{className:`w-3.5 h-3.5`}),(0,_.jsx)(`span`,{children:e.phone})]}),(0,_.jsx)(`button`,{onClick:()=>n(e.phone),className:`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors print:hidden`,title:`نسخ الرقم`,children:r===e.phone?(0,_.jsx)(f,{className:`w-3.5 h-3.5 text-emerald-500`}):(0,_.jsx)(s,{className:`w-3.5 h-3.5`})})]})}),(0,_.jsx)(`td`,{className:`py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400`,children:e.notes||`استقبال عاجل طوال اليوم`})]},e.dayKey)})})]})}),(0,_.jsxs)(`div`,{className:`bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700/80`,children:[(0,_.jsxs)(`h4`,{className:`text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2`,children:[(0,_.jsx)(c,{className:`w-4 h-4 text-rose-500`}),(0,_.jsx)(`span`,{children:`أرقام الطوارئ المباشرة الهامة بالمنصورة:`})]}),(0,_.jsx)(`div`,{className:`grid grid-cols-1 sm:grid-cols-3 gap-3`,children:e.importantPhones.map((e,t)=>(0,_.jsxs)(`a`,{href:`tel:${e.phone}`,className:`flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-rose-500 dark:hover:border-rose-400 transition-all shadow-sm group`,children:[(0,_.jsxs)(`div`,{className:`min-w-0`,children:[(0,_.jsx)(`p`,{className:`text-xs font-semibold text-slate-700 dark:text-slate-300 truncate`,children:e.label}),(0,_.jsx)(`p`,{className:`text-sm font-mono font-black text-rose-600 dark:text-rose-400 dir-ltr text-right group-hover:underline`,children:e.phone})]}),(0,_.jsx)(`div`,{className:`w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0`,children:(0,_.jsx)(d,{className:`w-4 h-4`})})]},t))})]}),(0,_.jsxs)(`div`,{className:`flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 print:hidden`,children:[(0,_.jsx)(`span`,{className:`text-xs text-slate-500 dark:text-slate-400`,children:`يمكنك طباعة النسخة المعالجة معتمدة للاستخدام الورقي بأمان.`}),(0,_.jsxs)(`button`,{onClick:i,className:`py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm`,children:[(0,_.jsx)(a,{className:`w-4 h-4 text-emerald-400`}),(0,_.jsx)(`span`,{children:`طباعة الجدول المعتمد`})]})]})]});export{v as t};