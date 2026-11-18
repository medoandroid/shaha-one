import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Trash2,
  ExternalLink,
  Plus,
  RefreshCw,
  Sparkles,
  Camera,
  Layers,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  ShieldCheck,
  Save,
  Globe,
  Share2
} from 'lucide-react';
import { Listing, ListingSocialLink } from '../../types';
import {
  optimizeProfileImage,
  validateAndProbeImageUrl,
  formatFileSize,
  CompressionResult
} from '../../utils/imageOptimizer';
import {
  SOCIAL_PLATFORMS,
  SocialPlatformKey,
  sanitizeSocialLinks,
  detectPlatformFromUrl
} from '../../utils/socialPlatforms';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing;
  onSave: (updates: Partial<Listing>) => Promise<boolean>;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

type ModalTab = 'media' | 'social' | 'info';

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  listing,
  onSave,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('media');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState(listing.name || '');
  const [titleOrSpecialty, setTitleOrSpecialty] = useState(listing.titleOrSpecialty || '');
  const [phone, setPhone] = useState(listing.phone || '');
  const [whatsapp, setWhatsapp] = useState(listing.whatsapp || '');
  const [secondaryPhone, setSecondaryPhone] = useState(listing.secondaryPhone || '');
  const [address, setAddress] = useState(listing.address || '');
  const [workingHours, setWorkingHours] = useState(listing.workingHours || '');
  const [description, setDescription] = useState(listing.description || '');

  // Media State - Cover
  const [coverImageUrl, setCoverImageUrl] = useState(listing.coverImageUrl || '');
  const [coverMode, setCoverMode] = useState<'upload' | 'url'>('upload');
  const [coverUrlInput, setCoverUrlInput] = useState('');
  const [coverCompressInfo, setCoverCompressInfo] = useState<CompressionResult | null>(null);
  const [isProcessingCover, setIsProcessingCover] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);

  // Media State - Avatar
  const [imageUrl, setImageUrl] = useState(listing.imageUrl || '');
  const [avatarMode, setAvatarMode] = useState<'upload' | 'url'>('upload');
  const [avatarUrlInput, setAvatarUrlInput] = useState('');
  const [avatarCompressInfo, setAvatarCompressInfo] = useState<CompressionResult | null>(null);
  const [isProcessingAvatar, setIsProcessingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  // Social Links State
  const [socialLinks, setSocialLinks] = useState<ListingSocialLink[]>(() => {
    const list: ListingSocialLink[] = listing.socialLinks ? [...listing.socialLinks] : [];
    // Populate legacy links if not present in array
    if (listing.facebookUrl && !list.some(l => l.url === listing.facebookUrl)) {
      list.push({ title: 'فيسبوك', url: listing.facebookUrl, icon: 'facebook' });
    }
    if (listing.instagramUrl && !list.some(l => l.url === listing.instagramUrl)) {
      list.push({ title: 'انستجرام', url: listing.instagramUrl, icon: 'instagram' });
    }
    if (listing.telegramUrl && !list.some(l => l.url === listing.telegramUrl)) {
      list.push({ title: 'تيليجرام', url: listing.telegramUrl, icon: 'telegram' });
    }
    if (listing.websiteUrl && !list.some(l => l.url === listing.websiteUrl)) {
      list.push({ title: 'الموقع الإلكتروني', url: listing.websiteUrl, icon: 'website' });
    }
    if (listing.tiktokUrl && !list.some(l => l.url === listing.tiktokUrl)) {
      list.push({ title: 'تيك توك', url: listing.tiktokUrl, icon: 'tiktok' });
    }
    if (listing.youtubeUrl && !list.some(l => l.url === listing.youtubeUrl)) {
      list.push({ title: 'يوتيوب', url: listing.youtubeUrl, icon: 'youtube' });
    }
    if (listing.linkedinUrl && !list.some(l => l.url === listing.linkedinUrl)) {
      list.push({ title: 'لينكد إن', url: listing.linkedinUrl, icon: 'linkedin' });
    }
    return list;
  });

  // New Link Builder State
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatformKey>('facebook');
  const [linkInput, setLinkInput] = useState('');
  const [customTitle, setCustomTitle] = useState('');

  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // ---------------- Cover Handlers ----------------
  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverError(null);
    setIsProcessingCover(true);

    try {
      const res = await optimizeProfileImage(file, 'cover');
      setCoverImageUrl(res.dataUrl);
      setCoverCompressInfo(res);
      onShowToast(`تم ضغط صورة الغلاف بنجاح (${formatFileSize(res.compressedSizeBytes)})`, 'success');
    } catch (err: any) {
      setCoverError(err.message || 'تعذر معالجة صورة الغلاف');
      onShowToast(err.message || 'فشل رفع صورة الغلاف', 'error');
    } finally {
      setIsProcessingCover(false);
      if (coverFileInputRef.current) coverFileInputRef.current.value = '';
    }
  };

  const handleApplyCoverUrl = async () => {
    if (!coverUrlInput.trim()) return;
    setCoverError(null);
    setIsProcessingCover(true);

    try {
      const probe = await validateAndProbeImageUrl(coverUrlInput.trim());
      if (!probe.valid) {
        setCoverError(probe.error || 'الرابط غير صالح');
        onShowToast(probe.error || 'الرابط غير صالح', 'error');
      } else {
        setCoverImageUrl(coverUrlInput.trim());
        setCoverCompressInfo(null);
        setCoverUrlInput('');
        onShowToast('تم التحقق من رابط الغلاف بنجاح', 'success');
      }
    } catch {
      setCoverError('تعذر التحقق من الرابط');
    } finally {
      setIsProcessingCover(false);
    }
  };

  // ---------------- Avatar Handlers ----------------
  const handleAvatarFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError(null);
    setIsProcessingAvatar(true);

    try {
      const res = await optimizeProfileImage(file, 'avatar');
      setImageUrl(res.dataUrl);
      setAvatarCompressInfo(res);
      onShowToast(`تم ضغط الصورة الشخصية بنجاح (${formatFileSize(res.compressedSizeBytes)})`, 'success');
    } catch (err: any) {
      setAvatarError(err.message || 'تعذر معالجة الصورة الشخصية');
      onShowToast(err.message || 'فشل معالجة الصورة', 'error');
    } finally {
      setIsProcessingAvatar(false);
      if (avatarFileInputRef.current) avatarFileInputRef.current.value = '';
    }
  };

  const handleApplyAvatarUrl = async () => {
    if (!avatarUrlInput.trim()) return;
    setAvatarError(null);
    setIsProcessingAvatar(true);

    try {
      const probe = await validateAndProbeImageUrl(avatarUrlInput.trim());
      if (!probe.valid) {
        setAvatarError(probe.error || 'الرابط غير صالح');
        onShowToast(probe.error || 'الرابط غير صالح', 'error');
      } else {
        setImageUrl(avatarUrlInput.trim());
        setAvatarCompressInfo(null);
        setAvatarUrlInput('');
        onShowToast('تم التحقق من رابط الصورة بنجاح', 'success');
      }
    } catch {
      setAvatarError('تعذر التحقق من الرابط');
    } finally {
      setIsProcessingAvatar(false);
    }
  };

  // ---------------- Social Links Handlers ----------------
  const handleAddSocialLink = () => {
    if (!linkInput.trim()) {
      onShowToast('يُرجى إدخال الرابط أو اسم المستخدم', 'error');
      return;
    }

    const platformConfig = SOCIAL_PLATFORMS[selectedPlatform];
    const formattedUrl = platformConfig.formatUrl(linkInput.trim());

    if (!platformConfig.isValid(linkInput.trim())) {
      onShowToast('صيغة الرابط غير صحيحة، تأكد من إدخال رابط أو معرّف صحيح', 'error');
      return;
    }

    const finalTitle = customTitle.trim() || platformConfig.nameAr.split(' ')[0];

    // Check duplicate
    if (socialLinks.some(l => l.url.toLowerCase() === formattedUrl.toLowerCase())) {
      onShowToast('هذا الرابط مضاف بالفعل في القائمة', 'info');
      return;
    }

    const newLink: ListingSocialLink = {
      title: finalTitle,
      url: formattedUrl,
      icon: platformConfig.key
    };

    setSocialLinks(prev => [...prev, newLink]);
    setLinkInput('');
    setCustomTitle('');
    onShowToast(`تمت إضافة رابط ${finalTitle} بنجاح`, 'success');
  };

  const handleRemoveSocialLink = (index: number) => {
    setSocialLinks(prev => prev.filter((_, idx) => idx !== index));
    onShowToast('تم حذف الرابط من القائمة', 'info');
  };

  // ---------------- Final Submit Handler ----------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      onShowToast('يُرجى كتابة اسم الملف أو الخدمة', 'error');
      setActiveTab('info');
      return;
    }
    if (!phone.trim()) {
      onShowToast('يُرجى إدخال رقم الهاتف الأساسي', 'error');
      setActiveTab('info');
      return;
    }

    setIsSubmitting(true);

    try {
      const sanitizedLinks = sanitizeSocialLinks(socialLinks);

      // Extract primary platform links for backward compatibility
      const fb = sanitizedLinks.find(l => detectPlatformFromUrl(l.url) === 'facebook')?.url || '';
      const ig = sanitizedLinks.find(l => detectPlatformFromUrl(l.url) === 'instagram')?.url || '';
      const tg = sanitizedLinks.find(l => detectPlatformFromUrl(l.url) === 'telegram')?.url || '';
      const web = sanitizedLinks.find(l => detectPlatformFromUrl(l.url) === 'website')?.url || '';
      const tt = sanitizedLinks.find(l => detectPlatformFromUrl(l.url) === 'tiktok')?.url || '';
      const yt = sanitizedLinks.find(l => detectPlatformFromUrl(l.url) === 'youtube')?.url || '';
      const li = sanitizedLinks.find(l => detectPlatformFromUrl(l.url) === 'linkedin')?.url || '';

      const updates: Partial<Listing> = {
        name: name.trim(),
        titleOrSpecialty: titleOrSpecialty.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim(),
        secondaryPhone: secondaryPhone.trim(),
        address: address.trim() || 'شها، مركز المنصورة',
        workingHours: workingHours.trim(),
        description: description.trim(),
        coverImageUrl: coverImageUrl.trim(),
        imageUrl: imageUrl.trim(),
        socialLinks: sanitizedLinks,
        facebookUrl: fb,
        instagramUrl: ig,
        telegramUrl: tg,
        websiteUrl: web,
        tiktokUrl: tt,
        youtubeUrl: yt,
        linkedinUrl: li
      };

      const success = await onSave(updates);
      if (success) {
        onShowToast('تم حفظ وتحديث الملف التعريفي بنجاح!', 'success');
        onClose();
      } else {
        onShowToast('تعذر حفظ البيانات، يُرجى المحاولة مرة أخرى', 'error');
      }
    } catch (err: any) {
      onShowToast(err.message || 'حدث خطأ أثناء حفظ الملف', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm overflow-y-auto" dir="rtl">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                تعديل الملف الشخصي والغلاف
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                إدارة صورة الغلاف، الأفاتار، وروابط التواصل المعتمدة لـ ({listing.name})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('media')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-black transition-all cursor-pointer ${
              activeTab === 'media'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>الغلاف والصورة الشخصية</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('social')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-black transition-all cursor-pointer ${
              activeTab === 'social'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>روابط التواصل والمنصات ({socialLinks.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-black transition-all cursor-pointer ${
              activeTab === 'info'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>المعلومات وساعات العمل</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1">
          
          {/* TAB 1: MEDIA (COVER & AVATAR) */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              
              {/* --- Cover Banner Section --- */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      صورة غلاف البروفايل (Cover Banner)
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    أبعاد مقترحة: 1200×480 بكسل (أقصى حجم 15MB)
                  </span>
                </div>

                {/* Cover Live Preview */}
                <div className="relative w-full h-36 sm:h-44 rounded-2xl overflow-hidden bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-inner group">
                  {coverImageUrl ? (
                    <>
                      <img
                        src={coverImageUrl}
                        alt="معاينة الغلاف"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCoverImageUrl('');
                          setCoverCompressInfo(null);
                        }}
                        className="absolute top-2 left-2 p-1.5 rounded-xl bg-black/60 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                        title="إزالة الغلاف والعودة للنمط التلقائي"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white/70 p-4 text-center">
                      <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                      <span className="text-xs font-bold">لا يوجد غلاف مخصص حالياً</span>
                      <span className="text-[10px] opacity-70">يتم عرض النمط الافتراضي لشها ون مع تدرج لوني أنيق</span>
                    </div>
                  )}

                  {/* Processing Overlay */}
                  {isProcessingCover && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
                      <span className="text-xs font-bold">جاري ضغط ومعالجة صورة الغلاف...</span>
                    </div>
                  )}
                </div>

                {/* Compression stats pill */}
                {coverCompressInfo && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                    <span className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>تم تحسين الصورة بنجاح: {formatFileSize(coverCompressInfo.compressedSizeBytes)}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-200/50 dark:bg-emerald-900 text-[10px]">
                      وفرت {coverCompressInfo.savedPercent}% من المساحة
                    </span>
                  </div>
                )}

                {coverError && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{coverError}</span>
                  </div>
                )}

                {/* Dual Mode Switcher */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setCoverMode('upload')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      coverMode === 'upload'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    رفع ملف من الجهاز
                  </button>
                  <button
                    type="button"
                    onClick={() => setCoverMode('url')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      coverMode === 'url'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    استخدام رابط مباشر (URL)
                  </button>
                </div>

                {coverMode === 'upload' ? (
                  <div>
                    <input
                      ref={coverFileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleCoverFileUpload}
                      className="hidden"
                      id="cover-upload-input"
                    />
                    <label
                      htmlFor="cover-upload-input"
                      className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 bg-white dark:bg-slate-800/80 flex items-center justify-center gap-2 text-xs font-black text-slate-700 dark:text-slate-300 hover:text-blue-600 cursor-pointer transition-all"
                    >
                      <Upload className="w-4 h-4" />
                      <span>اختر صورة الغلاف من هاتفك أو جهازك (JPG, PNG, WebP)</span>
                    </label>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={coverUrlInput}
                      onChange={(e) => setCoverUrlInput(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl text-xs font-mono bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoverUrl}
                      disabled={isProcessingCover || !coverUrlInput.trim()}
                      className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                    >
                      فحص وتطبيق
                    </button>
                  </div>
                )}
              </div>

              {/* --- Avatar / Logo Section --- */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      الصورة الشخصية أو شعار النشاط (Avatar / Logo)
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    أبعاد مقترحة: 400×400 بكسل
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  {/* Square Avatar Preview */}
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-slate-900 border-2 border-white dark:border-slate-700 shadow-md shrink-0">
                    {imageUrl ? (
                      <>
                        <img
                          src={imageUrl}
                          alt="معاينة الصورة"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImageUrl('');
                            setAvatarCompressInfo(null);
                          }}
                          className="absolute bottom-1 right-1 p-1 rounded-lg bg-black/70 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                          title="حذف الصورة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white text-2xl font-black">
                        {name ? name.slice(0, 1) : 'ش'}
                      </div>
                    )}

                    {isProcessingAvatar && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Actions & compress feedback */}
                  <div className="flex-1 space-y-2">
                    {avatarCompressInfo && (
                      <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                        <span>تم تحسين الصورة إلى {formatFileSize(avatarCompressInfo.compressedSizeBytes)} (وفرت {avatarCompressInfo.savedPercent}%)</span>
                      </div>
                    )}

                    {avatarError && (
                      <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-bold">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{avatarError}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAvatarMode('upload')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          avatarMode === 'upload'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        رفع صورة
                      </button>
                      <button
                        type="button"
                        onClick={() => setAvatarMode('url')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          avatarMode === 'url'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        رابط صورة
                      </button>
                    </div>

                    {avatarMode === 'upload' ? (
                      <div>
                        <input
                          ref={avatarFileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          onChange={handleAvatarFileUpload}
                          className="hidden"
                          id="avatar-upload-input"
                        />
                        <label
                          htmlFor="avatar-upload-input"
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer shadow-xs"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>اختيار ملف من الهاتف / الحاسوب</span>
                        </label>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="https://..."
                          value={avatarUrlInput}
                          onChange={(e) => setAvatarUrlInput(e.target.value)}
                          className="flex-1 px-2.5 py-1.5 rounded-lg text-xs font-mono bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                        />
                        <button
                          type="button"
                          onClick={handleApplyAvatarUrl}
                          disabled={isProcessingAvatar || !avatarUrlInput.trim()}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                        >
                          تطبيق
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SOCIAL PRESENCE & EXTERNAL LINKS */}
          {activeTab === 'social' && (
            <div className="space-y-6">
              
              {/* New Link Creator Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    إضافة منصة أو رابط تواصل جديد
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Platform Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      اختر المنصة
                    </label>
                    <select
                      value={selectedPlatform}
                      onChange={(e) => {
                        setSelectedPlatform(e.target.value as SocialPlatformKey);
                        setCustomTitle('');
                      }}
                      className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white cursor-pointer"
                    >
                      {Object.values(SOCIAL_PLATFORMS).map(p => (
                        <option key={p.key} value={p.key}>
                          {p.nameAr}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Custom Title if platform is custom or user wants to customize */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      عنوان أو اسم الزر (اختياري)
                    </label>
                    <input
                      type="text"
                      placeholder={`مثال: ${SOCIAL_PLATFORMS[selectedPlatform].nameAr.split(' ')[0]}`}
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Input link or handle */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      الرابط أو المعرّف
                    </label>
                    <input
                      type="text"
                      placeholder={SOCIAL_PLATFORMS[selectedPlatform].placeholder}
                      value={linkInput}
                      onChange={(e) => setLinkInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500">
                    {SOCIAL_PLATFORMS[selectedPlatform].helperText}
                  </span>
                  <button
                    type="button"
                    onClick={handleAddSocialLink}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-600/20 cursor-pointer active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة إلى القائمة</span>
                  </button>
                </div>
              </div>

              {/* Added Links List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    الروابط المعتمدة في هذا البروفايل ({socialLinks.length})
                  </span>
                  {socialLinks.length > 0 && (
                    <span className="text-[11px] text-slate-500">
                      تظهر بشكل مميز داخل قسم التواصل في البروفايل
                    </span>
                  )}
                </div>

                {socialLinks.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700 text-slate-400 space-y-2">
                    <Globe className="w-8 h-8 mx-auto opacity-50" />
                    <p className="text-xs font-bold">لم تتم إضافة أي روابط تواصل بعد</p>
                    <p className="text-[11px]">أضف روابط فيسبوك، واتساب، انستجرام، تيليجرام، تيك توك، أو موقعك</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {socialLinks.map((lnk, idx) => {
                      const platformKey = detectPlatformFromUrl(lnk.url);
                      const platformConfig = SOCIAL_PLATFORMS[platformKey] || SOCIAL_PLATFORMS.website;

                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs group"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className={`w-8 h-8 rounded-xl ${platformConfig.bgColor} text-white flex items-center justify-center text-xs font-black shrink-0 shadow-sm`}>
                              {platformConfig.nameAr.slice(0, 1)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-slate-900 dark:text-white">
                                  {lnk.title || platformConfig.nameAr.split(' ')[0]}
                                </span>
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-500">
                                  {platformConfig.nameAr.split(' ')[0]}
                                </span>
                              </div>
                              <a
                                href={lnk.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] font-mono text-blue-600 dark:text-blue-400 hover:underline truncate block"
                              >
                                {lnk.url}
                              </a>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <a
                              href={lnk.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
                              title="فتح وتجربة الرابط"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleRemoveSocialLink(idx)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="حذف هذا الرابط"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: BASIC INFO & HOURS */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الاسم أو العنوان التجاري <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الوصف والمهنة / التخصص
                  </label>
                  <input
                    type="text"
                    value={titleOrSpecialty}
                    onChange={(e) => setTitleOrSpecialty(e.target.value)}
                    placeholder="مثال: استشاري أمراض باطنة / صالون حلاقة رجالي"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    رقم الهاتف الأساسي <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    رقم الواتساب
                  </label>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="اتركه فارغاً لاستخدام رقم الهاتف"
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    رقم هاتف إضافي
                  </label>
                  <input
                    type="tel"
                    value={secondaryPhone}
                    onChange={(e) => setSecondaryPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    العنوان التفصيلي داخل شها
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="شها، بجوار مدرسة..."
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    مواعيد العمل
                  </label>
                  <input
                    type="text"
                    value={workingHours}
                    onChange={(e) => setWorkingHours(e.target.value)}
                    placeholder="مثال: يومياً من 10 صباحاً إلى 10 مساءً"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  نبذة تعريفية وملاحظات للعملاء
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="اكتب نبذة مختصرة عن الخدمات والأسعار والعروض..."
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white resize-none"
                />
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={isSubmitting || isProcessingCover || isProcessingAvatar}
              className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer disabled:opacity-50 transition-all active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري الحفظ في قاعدة البيانات...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>حفظ التعديلات نهائياً</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
