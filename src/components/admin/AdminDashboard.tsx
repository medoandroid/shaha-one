// DevMeDoAnDrOiD
import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  BarChart3,
  ListPlus,
  Inbox,
  AlertTriangle,
  FolderTree,
  Droplet,
  Heart,
  History,
  Settings,
  Download,
  KeyRound,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  Edit,
  Plus,
  Search,
  Star,
  ExternalLink,
  Phone,
  LogOut,
  RefreshCw,
  PhoneCall,
  Users,
  UserX,
  UserCheck,
  Crown,
  ShieldAlert,
  Lock,
  Check,
  Calendar,
  X,
  ArrowUp,
  ArrowDown,
  Megaphone,
  Clock,
  Tag,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  Timer,
  Sliders,
  Sparkles,
  Camera,
  Pin,
  Globe,
  MapPin,
  Truck,
  Mail,
  Lightbulb,
  FileSpreadsheet,
  Newspaper,
  FileText
} from 'lucide-react';
import { useDirectory } from '../../context/DirectoryContext';
import { apiUrl } from '../../lib/net';
import { getErrorHistory, clearErrorHistory, ErrorEntry } from '../../lib/notify';
import { ListingCard } from '../listings/ListingCard';
import { NewsAdmin } from './NewsAdmin';
import { SiteTextsAdmin } from './SiteTextsAdmin';
import {
  Listing,
  Category,
  ServiceRequest,
  Report,
  BloodDonor,
  CharityInitiative,
  UserRecord,
  AdminMember,
  AdminPermission,
  Advertisement,
  AdPlacement,
  AdBadgeType
} from '../../types';
import { CustomSelect } from '../common/CustomSelect';
import { CustomModal } from '../common/CustomModal';
import { CategoryIconBadge } from '../common/CategoryIcon';
import { HorizontalScrollStrip } from '../common/HorizontalScrollStrip';
import { VerificationBadgesAdmin } from './VerificationBadgesAdmin';
import { HumanitarianAidAdmin } from './HumanitarianAidAdmin';
import { ReviewModerationAdmin } from './ReviewModerationAdmin';
import { AdminMessagesTab } from './AdminMessagesTab';
import { CommunityPagesAdmin } from './CommunityPagesAdmin';
import { ClaimsAdmin } from './ClaimsAdmin';
import { DataQualityAdmin } from './DataQualityAdmin';
import { CSVDataImportAdmin } from './CSVDataImportAdmin';
import { CommunitySuggestionsAdmin } from './CommunitySuggestionsAdmin';
import { FeatureFlagsAdmin } from './FeatureFlagsAdmin';
import { EmergencyAdminTab } from './EmergencyAdminTab';
import { PlatformCreditsAdmin } from './PlatformCreditsAdmin';
import { EmergencyScheduleAdmin } from './EmergencyScheduleAdmin';
import { optimizeProfileImage } from '../../utils/imageOptimizer';

// Curated high quality presets for village ads
const AD_IMAGE_PRESETS = [
  {
    id: 'pharmacy',
    label: 'صيدلية وعلاج',
    url: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=800&auto=format&fit=crop&q=80',
    desc: 'بانر طبي لصيدليات ومستلزمات العلاج'
  },
  {
    id: 'clinic',
    label: 'عيادة وأطباء',
    url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=80',
    desc: 'عيادات واستشارات طبية متخصصة'
  },
  {
    id: 'supermarket',
    label: 'سوبر ماركت وأغذية',
    url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80',
    desc: 'عروض بقالة وسوبر ماركت ومنتجات غذائية'
  },
  {
    id: 'restaurant',
    label: 'مطاعم وأكلات',
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
    desc: 'مطاعم وسندوتشات وتوصيل منازل'
  },
  {
    id: 'mechanic',
    label: 'صيانة وورش سيارات',
    url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&auto=format&fit=crop&q=80',
    desc: 'ورش ميكانيكا وصيانة وكهرباء'
  },
  {
    id: 'electronics',
    label: 'موبايل وأجهزة',
    url: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&auto=format&fit=crop&q=80',
    desc: 'محلات وصيانة الهواتف والأجهزة'
  },
  {
    id: 'clothes',
    label: 'ملابس وأزياء',
    url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80',
    desc: 'محلات ملابس وأحذية وأقمشة'
  },
  {
    id: 'education',
    label: 'مكتبات وتصوير',
    url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80',
    desc: 'مكتبات وأدوات مدرسية وخدمات تعليم'
  }
];

// Curated avatar presets for service profiles and professionals in Shaha
const LISTING_AVATAR_PRESETS = [
  { id: 'doctor', label: 'طبيب / عيادة', url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80' },
  { id: 'pharmacy', label: 'صيدلية', url: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=400&auto=format&fit=crop&q=80' },
  { id: 'teacher', label: 'معلم / دروس', url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=400&auto=format&fit=crop&q=80' },
  { id: 'grocery', label: 'بقالة وماركت', url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400&auto=format&fit=crop&q=80' },
  { id: 'restaurant', label: 'مطعم ومأكولات', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&auto=format&fit=crop&q=80' },
  { id: 'workshop', label: 'صيانة وورشة', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&auto=format&fit=crop&q=80' },
  { id: 'barber', label: 'حلاقة ورعاية', url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&auto=format&fit=crop&q=80' },
  { id: 'delivery', label: 'سيارات وتوصيل', url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&auto=format&fit=crop&q=80' }
];

// Client-side canvas image optimizer for instant base64 uploads without file size bloat
function optimizeImageFile(file: File, maxDimension = 800): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = maxDimension;
        const maxHeight = maxDimension;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const PERMISSION_CONFIG: { id: AdminPermission; label: string; desc: string }[] = [
  { id: 'manage_overview', label: 'لوحة الإحصائيات والقيادة', desc: 'عرض الإحصائيات العامة وأرقام الزيارات والمكالمات' },
  { id: 'manage_listings', label: 'إدارة الأرقام والخدمات', desc: 'إضافة وتعديل وحذف جهات الاتصال والأماكن' },
  { id: 'manage_categories', label: 'إدارة الأقسام', desc: 'تعديل وترتيب الأقسام الـ 15 والتصنيفات الفرعية' },
  { id: 'manage_ads', label: 'إدارة الإعلانات والعروض', desc: 'إضافة وتعديل وإخفاء وتحديد مواعيد الإعلانات والبانرات' },
  { id: 'manage_news', label: 'أخبار قرية شها', desc: 'نشر وتعديل وحذف أخبار وإعلانات القرية' },
  { id: 'manage_requests', label: 'طلبات الإضافة والموافقة', desc: 'مراجعة وقبول أو رفض طلبات إضافة الأرقام الجديدة' },
  { id: 'manage_claims', label: 'طلبات الملكية', desc: 'مراجعة واعتماد طلبات توثيق ملكية الخدمات' },
  { id: 'manage_reports', label: 'البلاغات والشكاوى', desc: 'معالجة بلاغات الأرقام الخاطئة والمغلقة' },
  { id: 'manage_reviews', label: 'مراجعة التقييمات', desc: 'اعتماد أو رفض تقييمات وآراء أهالي شها ومنع التقييمات الوهمية' },
  { id: 'manage_messages', label: 'صندوق رسائل المواطنين', desc: 'قراءة والرد على استفسارات وشكاوى ومراسلات الأهالي' },
  { id: 'manage_suggestions', label: 'اقتراحات الأهالي', desc: 'مراجعة واعتماد مقترحات تطوير المنصة' },
  { id: 'manage_blood', label: 'بنك الدم', desc: 'إدارة متبرعي ونداءات بنك الدم بشها' },
  { id: 'manage_charity', label: 'المبادرات الخيرية', desc: 'إدارة مبادرات وحملات تواصل الخيرية' },
  { id: 'manage_aid', label: 'المساعدات الإنسانية', desc: 'مراجعة طلبات المساعدة والحالات الإنسانية' },
  { id: 'manage_emergency', label: 'أرقام وجداول الطوارئ', desc: 'تعديل أرقام الإسعاف والشرطة وجداول طوارئ المنصورة' },
  { id: 'manage_badges', label: 'علامات التوثيق', desc: 'إنشاء وتخصيص علامات التوثيق ومنحها للأرقام والخدمات' },
  { id: 'manage_quality', label: 'جودة البيانات والمكرر', desc: 'كشف السجلات المكررة ومراقبة اكتمال البيانات' },
  { id: 'manage_import', label: 'استيراد CSV', desc: 'استيراد بيانات الخدمات بكميات كبيرة' },
  { id: 'manage_texts', label: 'المحتوى والنصوص', desc: 'تعديل النصوص الثابتة وإعدادات الواجهة' },
  { id: 'manage_community_pages', label: 'صفحات شها على فيسبوك', desc: 'إضافة وتعديل وتوثيق الروابط والصفحات المجتمعية' },
  { id: 'manage_users', label: 'إدارة المستخدمين', desc: 'مراجعة المستخدمين وحظر الحسابات المخالفة' },
  { id: 'manage_audit', label: 'سجل العمليات (Audit)', desc: 'مراقبة سجل النشاط والأحداث الأمنية' },
  { id: 'manage_admins', label: 'إدارة المشرفين (خاص بالأونر)', desc: 'تعيين المشرفين وتوزيع الصلاحيات' },
  { id: 'manage_settings', label: 'الإعدادات والأمان', desc: 'تقرير الأمان والجلسات والنسخ الاحتياطي وكلمة المرور' }
];

const ROLE_PRESETS: { id: string; label: string; permissions: AdminPermission[] }[] = [
  { id: 'requests_only', label: 'مراجع طلبات فقط', permissions: ['manage_requests'] },
  { id: 'content_editor', label: 'محرر أخبار وإعلانات', permissions: ['manage_news', 'manage_ads'] },
  { id: 'directory_mod', label: 'مشرف الدليل والبلاغات', permissions: ['manage_listings', 'manage_categories', 'manage_requests', 'manage_reports', 'manage_reviews'] },
  { id: 'community_mod', label: 'مشرف الطوارئ والخيرية وبنك الدم', permissions: ['manage_emergency', 'manage_blood', 'manage_charity', 'manage_aid'] }
];

interface AdminDashboardProps {
  onClose: () => void;
  onSuccessToast: (msg: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onClose,
  onSuccessToast
}) => {
  const {
    isOwner,
    categories,
    listings,
    serviceRequests,
    reports,
    bloodDonors,
    bloodRequests,
    charities,
    emergencyNumbers,
    advertisements,
    verificationBadges,
    humanitarianRequests,
    adminMessages,
    communityPages,
    claims,
    suggestions,
    reviews,
    auditLogs,
    users,
    adminMembers,
    adminSession,
    currentUser,
    adminLogout,
    adminChangePassword,
    approveServiceRequest,
    rejectServiceRequest,
    resolveReport,
    dismissReport,
    saveListing,
    deleteListing,
    bulkUpdateListings,
    bulkDeleteListings,
    saveCategory,
    deleteCategory,
    saveAdvertisement,
    deleteAdvertisement,
    toggleAdvertisementStatus,
    toggleAdvertisementPin,
    updateAdvertisementPriority,
    isAdActiveNow,
    saveBloodDonor,
    deleteBloodDonor,
    refreshAuditLogs,
    syncSeedDataToFirestore,
    fetchUsers,
    banUser,
    unbanUser,
    fetchAdminMembers,
    addAdminMember,
    updateAdminMember,
    deleteAdminMember,
    villageNews
  } = useDirectory();

  const [activeAdminTab, setActiveAdminTab] = useState<
    'overview' | 'listings' | 'requests' | 'reports' | 'categories' | 'ads' | 'news' | 'texts' | 'emergency' | 'blood' | 'charity' | 'badges' | 'aid' | 'messages' | 'community_pages' | 'reviews' | 'users' | 'admins' | 'audit' | 'settings' | 'claims' | 'suggestions' | 'quality' | 'import' | 'flags' | 'platform_credits' | 'mansoura_schedule'
  >('overview');

  const [tabGroupFilter, setTabGroupFilter] = useState<'all' | 'directory' | 'moderation' | 'community' | 'system'>('all');
  const [tabQuickSearch, setTabQuickSearch] = useState('');
  const isTabLoading = false;

  const handleTabChange = (tab: any) => {
    setActiveAdminTab(tab);
  };

  // Advertisement Management State
  const [editingAd, setEditingAd] = useState<Partial<Advertisement> | null>(null);
  const [adSearch, setAdSearch] = useState('');
  const [adStatusFilter, setAdStatusFilter] = useState<'all' | 'pinned' | 'active' | 'paused' | 'expired' | 'scheduled'>('all');
  const [adPlacementFilter, setAdPlacementFilter] = useState<'all' | AdPlacement>('all');
  const [adImageSourceMode, setAdImageSourceMode] = useState<'upload' | 'url' | 'presets'>('upload');
  const [isUploadingAdImage, setIsUploadingAdImage] = useState(false);

  // Listing Editor & Batch Operations State
  const [editingListing, setEditingListing] = useState<Partial<Listing> | null>(null);
  const [listingSearch, setListingSearch] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState('all');
  const [listingStatusFilter, setListingStatusFilter] = useState<'all' | 'active' | 'hidden' | 'verified'>('all');
  const [selectedListingIds, setSelectedListingIds] = useState<string[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [listingPhotoSourceMode, setListingPhotoSourceMode] = useState<'upload' | 'url' | 'presets'>('upload');
  const [isUploadingListingPhoto, setIsUploadingListingPhoto] = useState(false);

  // Change Password State
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Category Editor State
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [newSubcatInput, setNewSubcatInput] = useState('');

  // User Management State
  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [selectedUserToBan, setSelectedUserToBan] = useState<UserRecord | null>(null);
  const [banReason, setBanReason] = useState('مخالفة معايير وشروط استخدام منصة شها ون');
  const [banDurationDays, setBanDurationDays] = useState<number>(7);
  const [isBanning, setIsBanning] = useState(false);

  const [selectedRequestIds, setSelectedRequestIds] = useState<string[]>([]);
  const [bulkRequestConfirm, setBulkRequestConfirm] = useState<{ type: 'approve' | 'reject'; ids: string[] } | null>(null);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const [securityStatus, setSecurityStatus] = useState<any>(null);
  const [activeSessionsList, setActiveSessionsList] = useState<any[]>([]);
  const [isLoadingSecurity, setIsLoadingSecurity] = useState(false);
  const [errorLogs, setErrorLogs] = useState<ErrorEntry[]>(() => getErrorHistory());
  const [deletedTrash, setDeletedTrash] = useState<Listing[]>(() => {
    try {
      const raw = localStorage.getItem('shaha_deleted_trash_v1');
      return raw ? (JSON.parse(raw) as Listing[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (editingListing && !editingListing.id && (editingListing.name || editingListing.phone)) {
      try {
        localStorage.setItem('shaha_listing_draft_v1', JSON.stringify(editingListing));
      } catch {}
    }
  }, [editingListing]);

  const pushToTrash = (items: Listing[]) => {
    if (items.length === 0) return;
    setDeletedTrash(prev => {
      const next = [...items, ...prev.filter(p => !items.some(i => i.id === p.id))].slice(0, 20);
      try {
        localStorage.setItem('shaha_deleted_trash_v1', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const restoreFromTrash = async (item: Listing) => {
    await saveListing({ ...item, status: 'active' });
    setDeletedTrash(prev => {
      const next = prev.filter(p => p.id !== item.id);
      try {
        localStorage.setItem('shaha_deleted_trash_v1', JSON.stringify(next));
      } catch {}
      return next;
    });
    onSuccessToast(`تمت استعادة «${item.name}» إلى الدليل بنجاح`);
  };

  // Admin Management State
  const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
  const [editingAdminMember, setEditingAdminMember] = useState<AdminMember | null>(null);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'moderator' | 'admin'>('moderator');
  const [newAdminPermissions, setNewAdminPermissions] = useState<AdminPermission[]>([
    'manage_listings',
    'manage_requests'
  ]);

  // Check if current session has specific permission
  const hasPermission = (perm: AdminPermission) => {
    if (isOwner || adminSession?.role === 'super_admin') return true;
    return adminSession?.permissions?.includes(perm) ?? false;
  };

  const loadSecurityStatus = async () => {
    if (!adminSession?.token || !hasPermission('manage_settings')) return;
    setIsLoadingSecurity(true);
    try {
      const [secRes, sessRes] = await Promise.all([
        fetch(apiUrl('/api/admin/security-status'), {
          headers: { Authorization: `Bearer ${adminSession.token}` }
        }),
        fetch(apiUrl('/api/admin/sessions'), {
          headers: { Authorization: `Bearer ${adminSession.token}` }
        })
      ]);
      if (secRes.ok) {
        setSecurityStatus(await secRes.json());
      }
      if (sessRes.ok) {
        const d = await sessRes.json();
        setActiveSessionsList(Array.isArray(d.sessions) ? d.sessions : []);
      }
    } catch {
      // keep existing state
    } finally {
      setIsLoadingSecurity(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    if (!adminSession?.token || !isOwner) return;
    if (!confirm('هل تريد تأكيد إنهاء هذه الجلسة؟')) return;
    try {
      const res = await fetch(apiUrl('/api/admin/sessions/revoke'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminSession.token}`
        },
        body: JSON.stringify({ sessionId })
      });
      if (res.ok) {
        onSuccessToast('تم إنهاء الجلسة بنجاح');
        await loadSecurityStatus();
      }
    } catch {}
  };

  const allowedTabIds = React.useMemo(() => {
    const map: { id: string; ok: boolean }[] = [
      { id: 'overview', ok: hasPermission('manage_overview') },
      { id: 'listings', ok: hasPermission('manage_listings') },
      { id: 'categories', ok: hasPermission('manage_categories') },
      { id: 'ads', ok: hasPermission('manage_ads') },
      { id: 'news', ok: hasPermission('manage_news') },
      { id: 'badges', ok: hasPermission('manage_badges') },
      { id: 'texts', ok: hasPermission('manage_texts') },
      { id: 'requests', ok: hasPermission('manage_requests') },
      { id: 'claims', ok: hasPermission('manage_claims') },
      { id: 'reports', ok: hasPermission('manage_reports') },
      { id: 'reviews', ok: hasPermission('manage_reviews') },
      { id: 'messages', ok: hasPermission('manage_messages') },
      { id: 'suggestions', ok: hasPermission('manage_suggestions') },
      { id: 'quality', ok: hasPermission('manage_quality') },
      { id: 'import', ok: hasPermission('manage_import') },
      { id: 'emergency', ok: hasPermission('manage_emergency') },
      { id: 'mansoura_schedule', ok: hasPermission('manage_emergency') },
      { id: 'blood', ok: hasPermission('manage_blood') },
      { id: 'charity', ok: hasPermission('manage_charity') },
      { id: 'aid', ok: hasPermission('manage_aid') },
      { id: 'community_pages', ok: isOwner || hasPermission('manage_community_pages') },
      { id: 'users', ok: hasPermission('manage_users') },
      { id: 'admins', ok: isOwner },
      { id: 'flags', ok: isOwner },
      { id: 'platform_credits', ok: isOwner },
      { id: 'audit', ok: hasPermission('manage_audit') || hasPermission('manage_settings') },
      { id: 'settings', ok: hasPermission('manage_settings') }
    ];
    return map.filter(m => m.ok).map(m => m.id);
  }, [isOwner, adminSession?.role, adminSession?.permissions]);

  useEffect(() => {
    if (allowedTabIds.length > 0 && !allowedTabIds.includes(activeAdminTab)) {
      setActiveAdminTab(allowedTabIds[0] as any);
    }
  }, [allowedTabIds, activeAdminTab]);

  // Fetch users, admins, or security status on tab change (strictly gated)
  useEffect(() => {
    if (activeAdminTab === 'users' && hasPermission('manage_users')) {
      fetchUsers(userSearch, userStatusFilter !== 'all' ? userStatusFilter : undefined);
    } else if (activeAdminTab === 'admins' && isOwner) {
      fetchAdminMembers();
    } else if (activeAdminTab === 'settings' && hasPermission('manage_settings')) {
      void loadSecurityStatus();
    }
  }, [activeAdminTab, userSearch, userStatusFilter]);

  // Stats Calculations
  const pendingRequests = serviceRequests.filter(r => r.status === 'pending');
  const pendingReports = reports.filter(r => r.status === 'pending');
  const pendingClaimsCount = claims.filter(c => c.status === 'pending').length;
  const pendingSuggestionsCount = suggestions.filter(s => s.status === 'pending').length;
  const pendingReviewsCount = reviews.filter(r => r.status === 'pending').length;
  const newAidCount = humanitarianRequests.filter(h => h.status === 'new').length;
  const newMessagesCount = adminMessages.filter(m => m.status === 'new').length;
  const totalCalls = listings.reduce((acc, curr) => acc + (curr.callsCount || 0), 0);
  const totalViews = listings.reduce((acc, curr) => acc + (curr.viewsCount || 0), 0);

  const filteredListings = useMemo(() => {
    return listings.filter(l => {
      if (selectedCatFilter !== 'all' && l.categoryId !== selectedCatFilter) return false;
      if (listingStatusFilter === 'active' && l.status !== 'active') return false;
      if (listingStatusFilter === 'hidden' && l.status !== 'hidden') return false;
      if (listingStatusFilter === 'verified' && !l.isVerified) return false;
      if (listingSearch.trim()) {
        const q = listingSearch.toLowerCase();
        return (
          l.name.toLowerCase().includes(q) ||
          l.phone.includes(q) ||
          (l.titleOrSpecialty && l.titleOrSpecialty.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [listings, selectedCatFilter, listingStatusFilter, listingSearch]);

  const handleSaveListingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingListing?.name || !editingListing?.phone) return;

    await saveListing(editingListing);
    try {
      localStorage.removeItem('shaha_listing_draft_v1');
    } catch {}
    onSuccessToast('تم حفظ بيانات الخدمة وتحديث الدليل بنجاح!');
    setEditingListing(null);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.nameAr || !editingCategory?.id) return;

    const fullCat: Category = {
      id: editingCategory.id,
      nameAr: editingCategory.nameAr,
      icon: editingCategory.icon || 'HelpCircle',
      descriptionAr: editingCategory.descriptionAr || '',
      order: editingCategory.order || categories.length + 1,
      isActive: editingCategory.isActive ?? true,
      subcategories: editingCategory.subcategories || []
    };

    await saveCategory(fullCat);
    onSuccessToast('تم حفظ القسم بنجاح!');
    setEditingCategory(null);
  };

  // Advertisement Handlers
  const handleAdImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingAd) return;
    setIsUploadingAdImage(true);
    try {
      const dataUrl = await optimizeImageFile(file);
      setEditingAd(prev => prev ? { ...prev, imageUrl: dataUrl } : null);
      onSuccessToast('تم ضغط وتجهيز صورة الإعلان بنجاح!');
    } catch (err) {
      console.error('Image processing failed', err);
      alert('حدث خطأ أثناء معالجة الصورة، يرجى تجربة صورة أخرى');
    } finally {
      setIsUploadingAdImage(false);
    }
  };

  const handleSaveAdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAd?.title) return;

    await saveAdvertisement(editingAd);
    onSuccessToast('تم حفظ بيانات الإعلان وتحديث ظهوره في الدليل بنجاح!');
    setEditingAd(null);
  };

  const handleToggleAd = async (ad: Advertisement) => {
    const nextState = !ad.isActive;
    await toggleAdvertisementStatus(ad.id, nextState);
    onSuccessToast(nextState ? `تم تفعيل إظهار إعلان «${ad.title}» بالدليل` : `تم إيقاف إعلان «${ad.title}» وإخفاؤه`);
  };

  const handleDeleteAd = async (ad: Advertisement) => {
    if (confirm(`هل أنت متأكد من حذف إعلان «${ad.title}» نهائياً من الدليل؟`)) {
      await deleteAdvertisement(ad.id);
      onSuccessToast('تم حذف الإعلان بنجاح');
    }
  };

  // Batch Operations Execution
  const handleBulkVerify = async (verified: boolean) => {
    if (selectedListingIds.length === 0) return;
    await bulkUpdateListings(selectedListingIds, { isVerified: verified });
    onSuccessToast(verified ? `تم توثيق ${selectedListingIds.length} أرقام بنجاح` : `تم إلغاء توثيق ${selectedListingIds.length} أرقام`);
    setSelectedListingIds([]);
  };

  const handleBulkStatus = async (status: 'active' | 'hidden') => {
    if (selectedListingIds.length === 0) return;
    await bulkUpdateListings(selectedListingIds, { status });
    onSuccessToast(status === 'active' ? `تم نشر ${selectedListingIds.length} أرقام بالدليل` : `تم إخفاء ${selectedListingIds.length} أرقام من الدليل`);
    setSelectedListingIds([]);
  };

  const handleBulkDelete = async () => {
    if (selectedListingIds.length === 0) return;
    if (confirm(`هل أنت متأكد من حذف ${selectedListingIds.length} أرقام محددة من الدليل؟ (يمكنك استعادتها من سلة المحذوفات)`)) {
      const toTrash = listings.filter(l => selectedListingIds.includes(l.id));
      pushToTrash(toTrash);
      await bulkDeleteListings(selectedListingIds);
      onSuccessToast(`تم حذف ${selectedListingIds.length} أرقام (متاحة للاستعادة في سلة المحذوفات)`);
      setSelectedListingIds([]);
    }
  };

  // Category Reorder Execution
  const handleMoveCategory = async (cat: Category, direction: 'up' | 'down') => {
    const sorted = [...categories].sort((a, b) => a.order - b.order);
    const index = sorted.findIndex(c => c.id === cat.id);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sorted.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const neighbor = sorted[targetIndex];

    const currentOrder = cat.order;
    const neighborOrder = neighbor.order === currentOrder ? (direction === 'up' ? currentOrder - 1 : currentOrder + 1) : neighbor.order;

    await saveCategory({ ...cat, order: neighborOrder });
    await saveCategory({ ...neighbor, order: currentOrder });
    onSuccessToast('تم تعديل ترتيب الأقسام بنجاح');
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (newPass !== confirmPass) {
      setPassError('كلمة المرور الجديدة غير متطابقة مع التأكيد');
      return;
    }
    if (newPass.length < 6) {
      setPassError('كلمة المرور يجب ألا تقل عن 6 خانات');
      return;
    }

    setIsChangingPass(true);
    const res = await adminChangePassword(currentPass, newPass);
    setIsChangingPass(false);

    if (res.success) {
      setPassSuccess('تم تغيير كلمة المرور الإدارية بنجاح!');
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
    } else {
      setPassError(res.error || 'فشل تغيير كلمة المرور');
    }
  };

  // User Ban Execution
  const handleConfirmBan = async () => {
    if (!selectedUserToBan) return;
    setIsBanning(true);
    const success = await banUser(selectedUserToBan.id, selectedUserToBan.email, banReason, banDurationDays);
    setIsBanning(false);
    if (success) {
      onSuccessToast(`تم حظر حساب ${selectedUserToBan.displayName || selectedUserToBan.email} بنجاح`);
      setSelectedUserToBan(null);
      fetchUsers();
    }
  };

  const handleConfirmUnban = async (user: UserRecord) => {
    if (confirm(`هل أنت متأكد من إلغاء حظر حساب ${user.displayName || user.email}؟`)) {
      const success = await unbanUser(user.id, user.email);
      if (success) {
        onSuccessToast(`تم إلغاء حظر ${user.displayName || user.email} واستعادة صلاحياته بنجاح`);
        fetchUsers();
      }
    }
  };

  // Add Moderator Execution
  const handleAddModeratorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminName.trim() || !newAdminEmail.trim()) {
      alert('يرجى ملء الاسم والبريد الإلكتروني');
      return;
    }

    const success = await addAdminMember(newAdminEmail.trim(), newAdminName.trim(), newAdminRole, newAdminPermissions);
    if (success) {
      onSuccessToast(`تم تعيين المشرف ${newAdminName} بنجاح!`);
      setIsAddAdminModalOpen(false);
      setNewAdminName('');
      setNewAdminEmail('');
      setNewAdminPermissions(['manage_listings', 'manage_requests']);
      fetchAdminMembers();
    }
  };

  // Update Moderator Execution
  const handleUpdateModeratorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdminMember) return;

    const success = await updateAdminMember(editingAdminMember.id, {
      name: editingAdminMember.name,
      role: editingAdminMember.role,
      permissions: editingAdminMember.permissions,
      isActive: editingAdminMember.isActive
    });

    if (success) {
      onSuccessToast('تم تحديث صلاحيات المشرف بنجاح!');
      setEditingAdminMember(null);
      fetchAdminMembers();
    }
  };

  // Export to CSV / JSON
  const handleExportData = (type: 'csv' | 'json') => {
    if (type === 'json') {
      const backupData = {
        exportedAt: new Date().toISOString(),
        categories,
        listings,
        bloodDonors,
        charities,
        emergencyNumbers
      };
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shaha_directory_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      onSuccessToast('تم تصدير النسخة الاحتياطية الكاملة بصيغة JSON');
    } else {
      const headers = ['ID', 'الاسم', 'القسم', 'التخصص', 'الهاتف', 'واتساب', 'العنوان', 'الحالة'];
      const rows = listings.map(l => [
        `"${l.id}"`,
        `"${l.name}"`,
        `"${l.categoryId}"`,
        `"${l.titleOrSpecialty || ''}"`,
        `"${l.phone}"`,
        `"${l.whatsapp || ''}"`,
        `"${l.address}"`,
        `"${l.status}"`
      ]);
      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shaha_listings_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      onSuccessToast('تم تصدير قائمة الأرقام والخدمات إلى ملف Excel / CSV');
    }
  };

  return (
    <div className="bg-slate-100 dark:bg-slate-950 min-h-screen text-right" dir="rtl">
      
      {/* Top Admin Bar */}
      <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black ${
              isOwner ? 'bg-amber-500 text-slate-950' : 'bg-blue-600 text-white'
            }`}>
              {isOwner ? <Crown className="w-5 h-5" /> : <ShieldCheck className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  لوحة تحكم إدارة منصة شها ون
                </h1>
                {isOwner ? (
                  <span className="text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 flex items-center gap-1">
                    <Crown className="w-3 h-3" /> مالك النظام (Owner)
                  </span>
                ) : (
                  <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                    مشرف معتمد
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                الحساب: {adminSession?.email || currentUser?.email || 'admin@shaha-directory.eg'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExportData('json')}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors cursor-pointer"
              title="نسخ احتياطي شامل"
            >
              <Download className="w-3.5 h-3.5" />
              <span>نسخة احتياطية</span>
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all cursor-pointer"
            >
              العودة للدليل
            </button>
            <button
              onClick={adminLogout}
              className="p-2 text-slate-400 hover:text-red-500 rounded-lg cursor-pointer"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* First Login Change Password Alert */}
        {adminSession?.mustChangePassword && (
          <div className="bg-amber-50 dark:bg-amber-950/70 border-t border-b border-amber-200 dark:border-amber-800 px-4 py-2.5 flex items-center justify-between text-xs font-bold text-amber-800 dark:text-amber-200">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                تنبيه أمني: يُرجى تغيير كلمة المرور الإدارية الابتدائية الآن لتأمين لوحة التحكم.
              </span>
            </div>
            <button
              onClick={() => setActiveAdminTab('settings')}
              className="underline hover:text-amber-950 shrink-0 cursor-pointer"
            >
              تغيير كلمة المرور الآن
            </button>
          </div>
        )}
      </header>

      {/* Admin Content Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Admin Tab Group Filter & Quick Jump Search */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-3 sm:p-4 mb-6 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'all', label: 'كل الأقسام' },
                { id: 'directory', label: 'الدليل والمحتوى' },
                { id: 'moderation', label: 'الطلبات والرقابة' },
                { id: 'community', label: 'المجتمع والطوارئ' },
                { id: 'system', label: 'النظام والأمان' }
              ].map(group => (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => setTabGroupFilter(group.id as typeof tabGroupFilter)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    tabGroupFilter === group.id
                      ? 'bg-slate-900 text-white dark:bg-blue-600'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {group.label}
                </button>
              ))}
            </div>

            <div className="relative md:w-64">
              <input
                type="text"
                value={tabQuickSearch}
                onChange={(e) => setTabQuickSearch(e.target.value)}
                placeholder="بحث سريع عن أداة أو قسم..."
                className="w-full pr-9 pl-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Horizontal Navigation Tabs with Desktop Left/Right Arrows & Wheel Scroll */}
          <HorizontalScrollStrip contentClassName="pb-1 pt-1" ariaLabel="أقسام لوحة التحكم">
            <div className="flex items-center gap-2 w-max">
              {[
                { id: 'overview', label: 'الإحصائيات والقيادة', icon: BarChart3, permission: 'manage_overview' as AdminPermission, group: 'all' },
                { id: 'listings', label: `الأرقام والخدمات (${listings.length})`, icon: ListPlus, permission: 'manage_listings' as AdminPermission, group: 'directory' },
                { id: 'categories', label: `الأقسام (${categories.length})`, icon: FolderTree, permission: 'manage_categories' as AdminPermission, group: 'directory' },
                { id: 'ads', label: `الإعلانات والبانرات (${advertisements.length})`, icon: Megaphone, highlight: true, permission: 'manage_ads' as AdminPermission, group: 'directory' },
                { id: 'news', label: `أخبار شها (${villageNews.length})`, icon: Newspaper, highlight: true, permission: 'manage_news' as AdminPermission, group: 'directory' },
                { id: 'badges', label: `علامات التوثيق (${verificationBadges.length})`, icon: ShieldCheck, highlight: true, permission: 'manage_badges' as AdminPermission, group: 'directory' },
                { id: 'texts', label: 'المحتوى والنصوص', icon: FileText, highlight: true, permission: 'manage_texts' as AdminPermission, group: 'directory' },
                { id: 'requests', label: `طلبات الإضافة (${pendingRequests.length})`, icon: Inbox, badge: pendingRequests.length, permission: 'manage_requests' as AdminPermission, group: 'moderation' },
                { id: 'claims', label: `طلبات الملكية (${pendingClaimsCount})`, icon: ShieldCheck, highlight: true, permission: 'manage_claims' as AdminPermission, badge: pendingClaimsCount, group: 'moderation' },
                { id: 'reports', label: `البلاغات (${pendingReports.length})`, icon: AlertTriangle, badge: pendingReports.length, permission: 'manage_reports' as AdminPermission, group: 'moderation' },
                { id: 'reviews', label: `التقييمات (${pendingReviewsCount})`, icon: Star, highlight: true, permission: 'manage_reviews' as AdminPermission, badge: pendingReviewsCount, group: 'moderation' },
                { id: 'messages', label: `رسائل المواطنين (${adminMessages.length})`, icon: Mail, highlight: true, permission: 'manage_messages' as AdminPermission, badge: newMessagesCount, group: 'moderation' },
                { id: 'suggestions', label: `اقتراحات الأهالي (${pendingSuggestionsCount})`, icon: Lightbulb, highlight: true, permission: 'manage_suggestions' as AdminPermission, badge: pendingSuggestionsCount, group: 'moderation' },
                { id: 'quality', label: 'جودة البيانات والمكرر', icon: ShieldAlert, highlight: true, permission: 'manage_quality' as AdminPermission, group: 'directory' },
                { id: 'import', label: 'استيراد CSV', icon: FileSpreadsheet, highlight: true, permission: 'manage_import' as AdminPermission, group: 'directory' },
                { id: 'emergency', label: `أرقام الطوارئ (${emergencyNumbers.length})`, icon: PhoneCall, highlight: true, permission: 'manage_emergency' as AdminPermission, group: 'community' },
                { id: 'mansoura_schedule', label: 'جدول طوارئ المنصورة', icon: Calendar, highlight: true, permission: 'manage_emergency' as AdminPermission, group: 'community' },
                { id: 'blood', label: `بنك الدم (${bloodDonors.length})`, icon: Droplet, permission: 'manage_blood' as AdminPermission, group: 'community' },
                { id: 'charity', label: 'الخيرية', icon: Heart, permission: 'manage_charity' as AdminPermission, group: 'community' },
                { id: 'aid', label: `المساعدات (${humanitarianRequests.length})`, icon: Heart, highlight: true, permission: 'manage_aid' as AdminPermission, badge: newAidCount, group: 'community' },
                { id: 'community_pages', label: `صفحات فيسبوك (${communityPages.length})`, icon: Globe, highlight: true, ownerOnly: true, group: 'community' },
                { id: 'users', label: 'إدارة المستخدمين', icon: Users, highlight: true, permission: 'manage_users' as AdminPermission, group: 'system' },
                { id: 'admins', label: 'فريق الإشراف (RBAC)', icon: ShieldAlert, highlight: true, ownerOnly: true, group: 'system' },
                { id: 'flags', label: 'مفاتيح الخصائص', icon: Sliders, highlight: true, ownerOnly: true, group: 'system' },
                { id: 'platform_credits', label: 'صُنّاع المنصة', icon: Sparkles, highlight: true, ownerOnly: true, group: 'system' },
                { id: 'audit', label: 'سجل العمليات Audit', icon: History, permission: 'manage_audit' as AdminPermission, group: 'system' },
                { id: 'settings', label: 'الإعدادات والأمان', icon: Settings, permission: 'manage_settings' as AdminPermission, group: 'system' }
              ]
                .filter(tab => (!tab.ownerOnly || isOwner) && (!(tab as any).permission || hasPermission((tab as any).permission)))
                .filter(tab => tabGroupFilter === 'all' || tab.group === 'all' || tab.group === tabGroupFilter)
                .filter(tab => !tabQuickSearch.trim() || tab.label.toLowerCase().includes(tabQuickSearch.trim().toLowerCase()))
                .map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeAdminTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id as any)}
                      className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                          : tab.highlight
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 hover:bg-amber-100'
                          : 'bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{tab.label}</span>
                      {Boolean(tab.badge) && (
                        <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[11px] flex items-center justify-center font-bold">
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>
          </HorizontalScrollStrip>
        </div>

        {/* Skeleton Loading State Indicator for Tab Switches */}
        {isTabLoading ? (
          <div className="space-y-6 animate-pulse p-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-28 rounded-3xl bg-slate-200 dark:bg-slate-800" />
              ))}
            </div>
            <div className="h-64 rounded-3xl bg-slate-200 dark:bg-slate-800 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-40 rounded-3xl bg-slate-200 dark:bg-slate-800" />
              <div className="h-40 rounded-3xl bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
        ) : (
          <>
            {/* ================= TAB 1: OVERVIEW ================= */}
            {activeAdminTab === 'overview' && hasPermission('manage_overview') && (
          <div className="space-y-6">
            {/* Quick Actions Command Bar */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">مركز القيادة السريع</h2>
                <p className="text-xs text-slate-500">تحكم فوري في خدمات القرية، المراجعات المعلقة، والنسخ الاحتياطي</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleTabChange('listings');
                    setEditingListing({
                      categoryId: 'doctors',
                      name: '',
                      phone: '',
                      status: 'active',
                      isVerified: true
                    });
                  }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة خدمة جديدة</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExportData('csv')}
                  className="px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>تصدير CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExportData('json')}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>نسخة JSON</span>
                </button>
              </div>
            </div>

            {/* KPI Cards (Clickable to jump directly) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                type="button"
                onClick={() => handleTabChange('listings')}
                className="text-right bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 shadow-xs transition-all cursor-pointer"
              >
                <div className="text-slate-400 text-xs font-bold">إجمالي الخدمات والأرقام</div>
                <div className="text-3xl font-black text-slate-900 dark:text-white mt-1 tabular-nums">{listings.length}</div>
                <div className="text-[11px] text-emerald-600 font-bold mt-1">
                  {listings.filter(l => l.status === 'active').length} نشط • {totalViews} مشاهدة
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('requests')}
                className="text-right bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-amber-400 shadow-xs transition-all cursor-pointer"
              >
                <div className="text-slate-400 text-xs font-bold">طلبات الإضافة المعلقة</div>
                <div className="text-3xl font-black text-amber-600 mt-1 tabular-nums">{pendingRequests.length}</div>
                <div className="text-[11px] text-slate-500 mt-1">اضغط للمراجعة والاعتماد الفوري</div>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('blood')}
                className="text-right bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-rose-400 shadow-xs transition-all cursor-pointer"
              >
                <div className="text-slate-400 text-xs font-bold">متبرعو بنك الدم بشها</div>
                <div className="text-3xl font-black text-rose-600 mt-1 tabular-nums">{bloodDonors.length}</div>
                <div className="text-[11px] text-rose-500 mt-1">متطوع مسجل بقاعدة البيانات</div>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('listings')}
                className="text-right bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 shadow-xs transition-all cursor-pointer"
              >
                <div className="text-slate-400 text-xs font-bold">إجمالي الاتصالات المسجلة</div>
                <div className="text-3xl font-black text-blue-600 mt-1 tabular-nums">{totalCalls}</div>
                <div className="text-[11px] text-blue-500 mt-1">اتصال مباشر من أهالي شها</div>
              </button>
            </div>

            {/* Pending Review Queue & Top Services */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Inbox className="w-4 h-4 text-amber-600" />
                  <span>طابور المهام والمراجعات السريعة</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { tab: 'requests', label: 'طلبات إضافة', count: pendingRequests.length, color: 'text-amber-600' },
                    { tab: 'claims', label: 'طلبات ملكية', count: pendingClaimsCount, color: 'text-blue-600' },
                    { tab: 'reports', label: 'بلاغات معلقة', count: pendingReports.length, color: 'text-red-600' },
                    { tab: 'reviews', label: 'تقييمات للمراجعة', count: pendingReviewsCount, color: 'text-purple-600' },
                    { tab: 'messages', label: 'رسائل جديدة', count: newMessagesCount, color: 'text-emerald-600' },
                    { tab: 'aid', label: 'حالات إنسانية', count: newAidCount, color: 'text-rose-600' }
                  ].map(item => (
                    <button
                      key={item.tab}
                      type="button"
                      onClick={() => handleTabChange(item.tab as any)}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200/80 dark:border-slate-700/80 text-right transition-colors cursor-pointer"
                    >
                      <div className={`text-xl font-black tabular-nums ${item.color}`}>{item.count}</div>
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">{item.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <span>أكثر الخدمات تفاعلاً في Firebase</span>
                </h3>
                {listings.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">لا توجد خدمات مسجلة في قاعدة البيانات بعد.</p>
                ) : (
                  <div className="space-y-2">
                    {[...listings]
                      .sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0))
                      .slice(0, 5)
                      .map(item => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60"
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.name}</div>
                            <div className="text-[11px] text-slate-500 truncate">{item.phone}</div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 text-[11px] font-bold">
                            <span className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 tabular-nums">
                              {item.viewsCount || 0} مشاهدة
                            </span>
                            <span className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 tabular-nums">
                              {item.callsCount || 0} اتصال
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: LISTINGS MANAGEMENT ================= */}
        {activeAdminTab === 'listings' && hasPermission('manage_listings') && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800">
              <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={listingSearch}
                    onChange={(e) => setListingSearch(e.target.value)}
                    placeholder="ابحث بالاسم أو الهاتف في الأرقام المسجلة..."
                    className="w-full pl-3 pr-9 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <div className="sm:w-56">
                  <CustomSelect
                    options={[
                      { value: 'all', label: 'كل الأقسام' },
                      ...categories.map(c => ({
                        value: c.id,
                        label: c.nameAr,
                        icon: <CategoryIconBadge category={c} size="sm" />
                      }))
                    ]}
                    value={selectedCatFilter}
                    onChange={(val) => setSelectedCatFilter(val)}
                    placeholder="تصفية بالقسم..."
                    searchable={true}
                  />
                </div>

                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
                  {[
                    { id: 'all', label: 'الكل' },
                    { id: 'active', label: 'نشط' },
                    { id: 'hidden', label: 'مخفي' },
                    { id: 'verified', label: 'موثق' }
                  ].map(st => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setListingStatusFilter(st.id as typeof listingStatusFilter)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        listingStatusFilter === st.id
                          ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setEditingListing({
                  categoryId: 'doctors',
                  name: '',
                  phone: '',
                  status: 'active',
                  isVerified: true
                })}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة رقم جديد مباشرة</span>
              </button>
            </div>

            {/* Batch Operations Bar */}
            {filteredListings.length > 0 && (
              <div className="bg-slate-50 dark:bg-slate-800/80 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectedListingIds.length > 0 && selectedListingIds.length === filteredListings.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedListingIds(filteredListings.map(l => l.id));
                        } else {
                          setSelectedListingIds([]);
                        }
                      }}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                    <span>تحديد الكل ({filteredListings.length})</span>
                  </label>

                  {selectedListingIds.length > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                      تم اختيار {selectedListingIds.length} عنصر
                    </span>
                  )}
                </div>

                {selectedListingIds.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={() => handleBulkVerify(true)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer"
                    >
                      توثيق المحدد ✓
                    </button>
                    <button
                      onClick={() => handleBulkVerify(false)}
                      className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 transition-colors cursor-pointer"
                    >
                      إلغاء التوثيق
                    </button>
                    <button
                      onClick={() => handleBulkStatus('hidden')}
                      className="px-3 py-1.5 rounded-xl bg-amber-600 text-white hover:bg-amber-700 transition-colors cursor-pointer"
                    >
                      إخفاء
                    </button>
                    <button
                      onClick={() => handleBulkStatus('active')}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                      نشر
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className="px-3 py-1.5 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer"
                    >
                      حذف المحدد
                    </button>
                  </div>
                )}
              </div>
            )}

            {deletedTrash.length > 0 && (
              <div className="p-4 rounded-3xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-900 dark:text-amber-200">
                    سلة المحذوفات والاستعادة الفورية (Rollback - {deletedTrash.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setDeletedTrash([]);
                      try { localStorage.removeItem('shaha_deleted_trash_v1'); } catch {}
                    }}
                    className="text-[11px] font-bold text-amber-700 hover:underline cursor-pointer"
                  >
                    إفراغ السلة
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {deletedTrash.slice(0, 6).map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => void restoreFromTrash(item)}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-emerald-50 hover:border-emerald-400 cursor-pointer"
                    >
                      استعادة: {item.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Listings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredListings.map(listing => (
                <div
                  key={listing.id}
                  className={`p-4 rounded-3xl bg-white dark:bg-slate-900 border transition-all shadow-xs flex flex-col justify-between gap-3 ${
                    selectedListingIds.includes(listing.id)
                      ? 'border-blue-500 ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedListingIds.includes(listing.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedListingIds(prev => [...prev, listing.id]);
                            } else {
                              setSelectedListingIds(prev => prev.filter(id => id !== listing.id));
                            }
                          }}
                          className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                        />
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                          {categories.find(c => c.id === listing.categoryId)?.nameAr || listing.categoryId}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {listing.isVerified && <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold">موثق ✓</span>}
                        {listing.isFeatured && <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-bold">مميز ★</span>}
                        {listing.status === 'hidden' && <span className="text-[10px] bg-slate-400 text-white px-2 py-0.5 rounded-full font-bold">مخفي</span>}
                      </div>
                    </div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">{listing.name}</h3>
                    {listing.titleOrSpecialty && (
                      <p className="text-xs text-slate-500 font-semibold">{listing.titleOrSpecialty}</p>
                    )}
                    <p className="text-xs font-mono font-bold text-emerald-600 mt-2">{listing.phone}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{listing.address}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => setEditingListing(listing)}
                      className="flex-1 min-w-[64px] py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={async () => {
                        const nextVal = !listing.isVerified;
                        await bulkUpdateListings([listing.id], { isVerified: nextVal });
                        onSuccessToast(nextVal ? `تم توثيق ${listing.name}` : `تم إلغاء توثيق ${listing.name}`);
                      }}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                        listing.isVerified
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                      title={listing.isVerified ? 'إلغاء التوثيق' : 'توثيق'}
                    >
                      {listing.isVerified ? 'إلغاء توثيق' : 'توثيق'}
                    </button>
                    <button
                      onClick={async () => {
                        const nextStatus = listing.status === 'hidden' ? 'active' : 'hidden';
                        await bulkUpdateListings([listing.id], { status: nextStatus });
                        onSuccessToast(nextStatus === 'hidden' ? `تم إخفاء ${listing.name}` : `تم إظهار ${listing.name}`);
                      }}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                        listing.status === 'hidden'
                          ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                      title={listing.status === 'hidden' ? 'إظهار' : 'إخفاء'}
                    >
                      {listing.status === 'hidden' ? 'إظهار' : 'إخفاء'}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`هل أنت متأكد من حذف ${listing.name} من الدليل؟`)) {
                          pushToTrash([listing]);
                          deleteListing(listing.id);
                          onSuccessToast('تم حذف الرقم (يمكنك استعادته من سلة المحذوفات)');
                        }
                      }}
                      className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Listing Edit Modal */}
            {editingListing && (
              <CustomModal
                isOpen={Boolean(editingListing)}
                onClose={() => setEditingListing(null)}
                title={editingListing.id ? 'تعديل بيانات الرقم أو الخدمة' : 'إضافة رقم جديد للدليل مباشرة'}
                subtitle="تأكد من دقة رقم الهاتف ومطابقة العنوان داخل قرية شها"
              >
                <form onSubmit={handleSaveListingSubmit} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <CustomSelect
                      label="القسم التابع له *"
                      required
                      options={categories.map(c => ({
                        value: c.id,
                        label: c.nameAr,
                        icon: <CategoryIconBadge category={c} size="sm" />
                      }))}
                      value={editingListing.categoryId || 'doctors'}
                      onChange={(val) => setEditingListing({ ...editingListing, categoryId: val })}
                      searchable={true}
                    />

                    <CustomSelect
                      label="نوع الملف والكيان *"
                      value={editingListing.entityType || 'service'}
                      onChange={(val) => setEditingListing({ ...editingListing, entityType: val as any })}
                      searchable={false}
                      options={[
                        { value: 'person', label: 'شخص ومهني (طبيب، مدرس، حرفي، محامي)' },
                        { value: 'shop', label: 'محل ونشاط تجاري (صيدلية، سوبرماركت، مطعم)' },
                        { value: 'company', label: 'شركة ومؤسسة (معامل، مكاتب، مقاولات)' },
                        { value: 'service', label: 'خدمة وحرفة معتمدة' },
                        { value: 'place', label: 'مكان ومرفق عام (مدرسة، بنك، وحدة صحية)' }
                      ]}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الاسم أو المحل *</label>
                      <input
                        type="text"
                        required
                        value={editingListing.name || ''}
                        onChange={(e) => setEditingListing({ ...editingListing, name: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">التخصص</label>
                      <input
                        type="text"
                        value={editingListing.titleOrSpecialty || ''}
                        onChange={(e) => setEditingListing({ ...editingListing, titleOrSpecialty: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الهاتف الأساسي *</label>
                      <input
                        type="tel"
                        required
                        value={editingListing.phone || ''}
                        onChange={(e) => setEditingListing({ ...editingListing, phone: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">واتساب</label>
                      <input
                        type="tel"
                        value={editingListing.whatsapp || ''}
                        onChange={(e) => setEditingListing({ ...editingListing, whatsapp: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">العنوان بشها *</label>
                      <input
                        type="text"
                        required
                        value={editingListing.address || ''}
                        onChange={(e) => setEditingListing({ ...editingListing, address: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">مواعيد وساعات العمل</label>
                      <input
                        type="text"
                        value={editingListing.workingHours || ''}
                        onChange={(e) => setEditingListing({ ...editingListing, workingHours: e.target.value })}
                        placeholder="مثال: يومياً من 5م إلى 10م ما عدا الجمعة"
                        className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      />
                    </div>
                  </div>

                  {/* Bio Description */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      نبذة تعريفية تفصيلية (Profile Bio)
                    </label>
                    <textarea
                      rows={2}
                      value={editingListing.description || ''}
                      onChange={(e) => setEditingListing({ ...editingListing, description: e.target.value })}
                      placeholder="اكتب نبذة عن النشاط، الخبرات، والخدمات التي تظهر في بروفايل الدليل..."
                      className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none resize-none"
                    />
                  </div>

                  {/* Cover and Experience */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          صورة غلاف البروفايل (Cover Banner)
                        </label>
                        {editingListing.coverImageUrl && (
                          <button
                            type="button"
                            onClick={() => setEditingListing({ ...editingListing, coverImageUrl: '' })}
                            className="text-[10px] text-rose-600 hover:underline font-bold"
                          >
                            إزالة الغلاف
                          </button>
                        )}
                      </div>

                      {editingListing.coverImageUrl && (
                        <div className="relative w-full h-20 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-900">
                          <img
                            src={editingListing.coverImageUrl}
                            alt="غلاف"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <input
                          type="url"
                          value={editingListing.coverImageUrl || ''}
                          onChange={(e) => setEditingListing({ ...editingListing, coverImageUrl: e.target.value })}
                          placeholder="رابط مباشر https://..."
                          className="flex-1 px-3 py-2 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        />
                        <label className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0">
                          <Upload className="w-3.5 h-3.5" />
                          <span>رفع</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file || !editingListing) return;
                              try {
                                const res = await optimizeProfileImage(file, 'cover');
                                setEditingListing({ ...editingListing, coverImageUrl: res.dataUrl });
                                onSuccessToast('تم ضغط ورفع صورة الغلاف بنجاح!');
                              } catch (err: any) {
                                alert(err.message || 'فشل معالجة صورة الغلاف');
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        سنوات الخبرة (اختياري)
                      </label>
                      <input
                        type="text"
                        value={editingListing.experienceYears || ''}
                        onChange={(e) => setEditingListing({ ...editingListing, experienceYears: e.target.value })}
                        placeholder="مثال: 12"
                        className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      />
                    </div>
                  </div>

                  {/* Geolocation Section */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        <span>الموقع الجغرافي وخريطة شها</span>
                      </span>
                      <label className="flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingListing.showMap !== false}
                          onChange={(e) => setEditingListing({ ...editingListing, showMap: e.target.checked })}
                          className="rounded text-emerald-600"
                        />
                        <span>إظهار الخريطة في البروفايل</span>
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">خط العرض (Latitude)</label>
                        <input
                          type="number"
                          step="any"
                          value={editingListing.latitude ?? ''}
                          onChange={(e) => setEditingListing({ ...editingListing, latitude: e.target.value ? parseFloat(e.target.value) : undefined })}
                          placeholder="31.0506"
                          className="w-full px-2.5 py-1.5 rounded-lg text-xs font-mono bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">خط الطول (Longitude)</label>
                        <input
                          type="number"
                          step="any"
                          value={editingListing.longitude ?? ''}
                          onChange={(e) => setEditingListing({ ...editingListing, longitude: e.target.value ? parseFloat(e.target.value) : undefined })}
                          placeholder="31.4246"
                          className="w-full px-2.5 py-1.5 rounded-lg text-xs font-mono bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">رابط خرائط جوجل (Google Maps URL)</label>
                      <input
                        type="url"
                        value={editingListing.googleMapsUrl || ''}
                        onChange={(e) => setEditingListing({ ...editingListing, googleMapsUrl: e.target.value })}
                        placeholder="https://maps.google.com/..."
                        className="w-full px-2.5 py-1.5 rounded-lg text-xs font-mono bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                      />
                    </div>
                  </div>

                  {/* Social Media Presence */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-blue-600" />
                      <span>حسابات التواصل والروابط الخارجية</span>
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">فيسبوك (Facebook)</label>
                        <input
                          type="url"
                          value={editingListing.facebookUrl || ''}
                          onChange={(e) => setEditingListing({ ...editingListing, facebookUrl: e.target.value })}
                          placeholder="https://facebook.com/..."
                          className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">انستجرام (Instagram)</label>
                        <input
                          type="url"
                          value={editingListing.instagramUrl || ''}
                          onChange={(e) => setEditingListing({ ...editingListing, instagramUrl: e.target.value })}
                          placeholder="https://instagram.com/..."
                          className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">تيليجرام (Telegram)</label>
                        <input
                          type="url"
                          value={editingListing.telegramUrl || ''}
                          onChange={(e) => setEditingListing({ ...editingListing, telegramUrl: e.target.value })}
                          placeholder="https://t.me/..."
                          className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">تيك توك (TikTok)</label>
                        <input
                          type="url"
                          value={editingListing.tiktokUrl || ''}
                          onChange={(e) => setEditingListing({ ...editingListing, tiktokUrl: e.target.value })}
                          placeholder="https://tiktok.com/@..."
                          className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">يوتيوب (YouTube)</label>
                        <input
                          type="url"
                          value={editingListing.youtubeUrl || ''}
                          onChange={(e) => setEditingListing({ ...editingListing, youtubeUrl: e.target.value })}
                          placeholder="https://youtube.com/@..."
                          className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">لينكد إن (LinkedIn)</label>
                        <input
                          type="url"
                          value={editingListing.linkedinUrl || ''}
                          onChange={(e) => setEditingListing({ ...editingListing, linkedinUrl: e.target.value })}
                          placeholder="https://linkedin.com/in/..."
                          className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">البريد الإلكتروني (Email)</label>
                        <input
                          type="email"
                          value={editingListing.email || ''}
                          onChange={(e) => setEditingListing({ ...editingListing, email: e.target.value })}
                          placeholder="doctor@example.com"
                          className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">الموقع الإلكتروني (Website)</label>
                        <input
                          type="url"
                          value={editingListing.websiteUrl || ''}
                          onChange={(e) => setEditingListing({ ...editingListing, websiteUrl: e.target.value })}
                          placeholder="https://..."
                          className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Profile Photo / Storefront Image Section */}
                  <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-slate-800/80 border border-blue-200/80 dark:border-slate-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-blue-600" />
                        <span>صورة الملف الشخصي أو صورة المحل / الشعار (اختياري)</span>
                      </label>
                      {editingListing.imageUrl && (
                        <button
                          type="button"
                          onClick={() => setEditingListing({ ...editingListing, imageUrl: '' })}
                          className="text-[11px] font-bold text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>إزالة الصورة</span>
                        </button>
                      )}
                    </div>

                    {/* Preview if present */}
                    {editingListing.imageUrl && (
                      <div className="flex items-center gap-3 p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                        <img
                          src={editingListing.imageUrl}
                          alt="معاينة الصورة"
                          className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div className="flex-1">
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                            تم اعتماد صورة البروفايل للخدمة
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5 block">
                            تظهر الصورة كأفاتار رسمي بالبطاقة والملف الشخصي للمواطنين
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Mode Tabs */}
                    <div className="flex items-center gap-1.5 p-1 bg-white/80 dark:bg-slate-700/60 rounded-xl border border-slate-200 dark:border-slate-600">
                      <button
                        type="button"
                        onClick={() => setListingPhotoSourceMode('upload')}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          listingPhotoSourceMode === 'upload'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-300 hover:text-blue-600'
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>رفع من الجهاز</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setListingPhotoSourceMode('presets')}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          listingPhotoSourceMode === 'presets'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-300 hover:text-blue-600'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>أفاتار مهني جاهز</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setListingPhotoSourceMode('url')}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          listingPhotoSourceMode === 'url'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-300 hover:text-blue-600'
                        }`}
                      >
                        <LinkIcon className="w-3.5 h-3.5" />
                        <span>رابط (URL)</span>
                      </button>
                    </div>

                    {/* Mode 1: File Upload */}
                    {listingPhotoSourceMode === 'upload' && (
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                        <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-blue-300 dark:border-blue-800 rounded-xl cursor-pointer hover:bg-blue-50/50 dark:hover:bg-slate-800 transition-all min-h-[44px]">
                          <Upload className={`w-5 h-5 text-blue-600 ${isUploadingListingPhoto ? 'animate-bounce' : ''}`} />
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {isUploadingListingPhoto ? 'جاري ضغط ومعالجة الصورة...' : 'اضغط لاختيار صورة شخصية أو شعار من الهاتف/الكمبيوتر'}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isUploadingListingPhoto}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file || !editingListing) return;
                              setIsUploadingListingPhoto(true);
                              try {
                                const dataUrl = await optimizeImageFile(file, 600);
                                setEditingListing({ ...editingListing, imageUrl: dataUrl });
                                onSuccessToast('تم حفظ وضغط صورة البروفايل بنجاح!');
                              } catch {
                                alert('حدث خطأ أثناء معالجة الصورة');
                              } finally {
                                setIsUploadingListingPhoto(false);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}

                    {/* Mode 2: Presets Grid */}
                    {listingPhotoSourceMode === 'presets' && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-500 block">اختر صورة أو أيقونة بروفايل مناسبة للتخصص:</span>
                        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                          {LISTING_AVATAR_PRESETS.map((avatar) => (
                            <button
                              key={avatar.id}
                              type="button"
                              onClick={() => setEditingListing({ ...editingListing, imageUrl: avatar.url })}
                              className={`p-1 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                                editingListing.imageUrl === avatar.url
                                  ? 'bg-blue-50 dark:bg-blue-950 border-blue-600 ring-2 ring-blue-500/30'
                                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                              }`}
                            >
                              <img
                                src={avatar.url}
                                alt={avatar.label}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                              <span className="text-[9px] font-bold truncate max-w-full text-slate-700 dark:text-slate-300">
                                {avatar.label}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Mode 3: Direct URL */}
                    {listingPhotoSourceMode === 'url' && (
                      <div>
                        <input
                          type="url"
                          value={editingListing.imageUrl || ''}
                          onChange={(e) => setEditingListing({ ...editingListing, imageUrl: e.target.value })}
                          placeholder="https://example.com/photo.jpg"
                          className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 pt-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingListing.isVerified ?? true}
                        onChange={(e) => setEditingListing({ ...editingListing, isVerified: e.target.checked })}
                        className="rounded text-blue-600"
                      />
                      <span>رقم موثق</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingListing.isFeatured ?? false}
                        onChange={(e) => setEditingListing({ ...editingListing, isFeatured: e.target.checked })}
                        className="rounded text-amber-500"
                      />
                      <span>خدمة مميزة</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingListing.deliveryAvailable ?? false}
                        onChange={(e) => setEditingListing({ ...editingListing, deliveryAvailable: e.target.checked })}
                        className="rounded text-teal-600"
                      />
                      <span>توصيل للمنازل</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingListing.status === 'active'}
                        onChange={(e) => setEditingListing({ ...editingListing, status: e.target.checked ? 'active' : 'hidden' })}
                        className="rounded text-emerald-600"
                      />
                      <span>منشور في الدليل</span>
                    </label>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => setIsPreviewOpen(true)}
                      className="py-3 px-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:bg-amber-100"
                    >
                      <Eye className="w-4 h-4" />
                      <span>معاينة البطاقة قبل النشر</span>
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-md"
                    >
                      حفظ وتثبيت البيانات
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingListing(null)}
                      className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs cursor-pointer"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              </CustomModal>
            )}

            {/* Listing Preview Modal */}
            {isPreviewOpen && editingListing && (
              <CustomModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                title="معاينة شكل البطاقة للمواطنين"
                subtitle="هكذا ستظهر البطاقة لأهالي شها على أجهزة الموبايل والكمبيوتر"
              >
                <div className="py-2">
                  <ListingCard
                    listing={{
                      id: editingListing.id || 'preview_id',
                      categoryId: editingListing.categoryId || 'doctors',
                      name: editingListing.name || 'اسم الخدمة / المحل',
                      titleOrSpecialty: editingListing.titleOrSpecialty || 'التخصص والمهنة',
                      phone: editingListing.phone || '01000000000',
                      whatsapp: editingListing.whatsapp,
                      address: editingListing.address || 'شها – مركز المنصورة',
                      imageUrl: editingListing.imageUrl,
                      workingHours: editingListing.workingHours,
                      isVerified: editingListing.isVerified ?? true,
                      isFeatured: editingListing.isFeatured ?? false,
                      status: editingListing.status || 'active',
                      viewsCount: 12,
                      callsCount: 4,
                      rating: 5.0,
                      ratingsCount: 1
                    }}
                    onOpenDetails={() => {}}
                    onCopyPhone={() => {}}
                  />
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => setIsPreviewOpen(false)}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs cursor-pointer"
                    >
                      إغلاق المعاينة والعودة للتحرير
                    </button>
                  </div>
                </div>
              </CustomModal>
            )}
          </div>
        )}

        {/* ================= TAB 3: REQUESTS ================= */}
        {activeAdminTab === 'requests' && hasPermission('manage_requests') && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                طلبات إضافة الأرقام والخدمات المقدمة من أهالي شها ({pendingRequests.length} طلب بانتظار المراجعة)
              </h3>
              {pendingRequests.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectedRequestIds.length > 0 && selectedRequestIds.length === pendingRequests.length}
                      onChange={() => {
                        if (selectedRequestIds.length === pendingRequests.length) {
                          setSelectedRequestIds([]);
                        } else {
                          setSelectedRequestIds(pendingRequests.map(r => r.id));
                        }
                      }}
                      className="w-4 h-4 accent-emerald-600 rounded"
                    />
                    <span>تحديد الكل ({pendingRequests.length})</span>
                  </label>

                  {selectedRequestIds.length > 0 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setBulkRequestConfirm({ type: 'approve', ids: [...selectedRequestIds] })}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>موافقة ونشر المحدد ({selectedRequestIds.length})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setBulkRequestConfirm({ type: 'reject', ids: [...selectedRequestIds] })}
                        className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>رفض المحدد ({selectedRequestIds.length})</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {pendingRequests.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl text-center border border-slate-200 dark:border-slate-800">
                <p className="text-sm text-slate-500 font-bold">لا توجد طلبات جديدة بانتظار الاعتماد حالياً.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map(req => {
                  const isSelected = selectedRequestIds.includes(req.id);
                  return (
                    <div
                      key={req.id}
                      className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                        isSelected
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            setSelectedRequestIds(prev =>
                              prev.includes(req.id) ? prev.filter(id => id !== req.id) : [...prev, req.id]
                            );
                          }}
                          aria-label={`تحديد ${req.serviceName}`}
                          className="mt-1.5 w-4 h-4 accent-emerald-600 rounded cursor-pointer shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                              {categories.find(c => c.id === req.categoryId)?.nameAr || req.categoryId}
                            </span>
                            <span className="text-xs text-slate-400">مقدم من: {req.applicantName} ({req.applicantPhone})</span>
                          </div>
                          <h4 className="text-base font-black text-slate-900 dark:text-white">{req.serviceName}</h4>
                          <p className="text-xs font-mono font-bold text-blue-600 mt-1">الهاتف: {req.phone}</p>
                          <p className="text-xs text-slate-500 mt-0.5">العنوان: {req.address}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={async () => {
                            const ok = await approveServiceRequest(req);
                            if (ok) {
                              setSelectedRequestIds(prev => prev.filter(id => id !== req.id));
                              onSuccessToast(`تم اعتماد وتوثيق ${req.serviceName} ونشره في الدليل فوراً`);
                            }
                          }}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>اعتماد ونشر في الدليل</span>
                        </button>
                        <button
                          onClick={() => setBulkRequestConfirm({ type: 'reject', ids: [req.id] })}
                          className="px-3 py-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold cursor-pointer"
                        >
                          رفض
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {bulkRequestConfirm && (
              <CustomModal
                isOpen={true}
                onClose={() => !isBulkProcessing && setBulkRequestConfirm(null)}
                title={bulkRequestConfirm.type === 'approve' ? 'تأكيد الاعتماد الجماعي' : 'تأكيد الرفض'}
              >
                <div className="space-y-4 text-right" dir="rtl">
                  <p className="text-sm text-slate-700 dark:text-slate-300 font-bold leading-relaxed">
                    {bulkRequestConfirm.type === 'approve'
                      ? `هل تريد بالتأكيد اعتماد ونشر (${bulkRequestConfirm.ids.length}) طلب في الدليل العام الآن؟`
                      : `هل تريد بالتأكيد رفض (${bulkRequestConfirm.ids.length}) طلب وإزالتها من قائمة الانتظار؟`}
                  </p>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      disabled={isBulkProcessing}
                      onClick={() => setBulkRequestConfirm(null)}
                      className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer"
                    >
                      إلغاء
                    </button>
                    <button
                      type="button"
                      disabled={isBulkProcessing}
                      onClick={async () => {
                        setIsBulkProcessing(true);
                        try {
                          const targets = pendingRequests.filter(r => bulkRequestConfirm.ids.includes(r.id));
                          if (bulkRequestConfirm.type === 'approve') {
                            await Promise.allSettled(targets.map(r => approveServiceRequest(r)));
                            onSuccessToast(`تم اعتماد ونشر ${targets.length} طلب بنجاح`);
                          } else {
                            await Promise.allSettled(bulkRequestConfirm.ids.map(id => rejectServiceRequest(id)));
                            onSuccessToast(`تم رفض ${bulkRequestConfirm.ids.length} طلب بنجاح`);
                          }
                          setSelectedRequestIds(prev => prev.filter(id => !bulkRequestConfirm.ids.includes(id)));
                          setBulkRequestConfirm(null);
                        } finally {
                          setIsBulkProcessing(false);
                        }
                      }}
                      className={`px-4 py-2 rounded-xl text-white text-xs font-bold cursor-pointer ${
                        bulkRequestConfirm.type === 'approve'
                          ? 'bg-emerald-600 hover:bg-emerald-700'
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      {isBulkProcessing ? 'جارٍ التنفيذ…' : 'تأكيد التنفيذ'}
                    </button>
                  </div>
                </div>
              </CustomModal>
            )}
          </div>
        )}

        {/* ================= TAB 4: REPORTS ================= */}
        {activeAdminTab === 'reports' && hasPermission('manage_reports') && (
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              بلاغات المواطنين عن الأرقام الخاطئة أو المغلقة ({pendingReports.length})
            </h3>
            {pendingReports.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl text-center border border-slate-200 dark:border-slate-800">
                <p className="text-sm text-slate-500 font-bold">لا توجد بلاغات معلقة حالياً، جميع أرقام الدليل مدققة.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingReports.map(rep => (
                  <div
                    key={rep.id}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4"
                  >
                    <div>
                      <span className="text-xs font-bold text-red-600">بلاغ: {rep.reportType}</span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{rep.listingName || rep.listingId}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{rep.details}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={async () => {
                          await resolveReport(rep.id);
                          onSuccessToast('تم تصحيح البلاغ وإغلاقه بنجاح');
                        }}
                        className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
                      >
                        تم التصحيح
                      </button>
                      <button
                        onClick={async () => {
                          await dismissReport(rep.id);
                          onSuccessToast('تم تجاهل البلاغ');
                        }}
                        className="px-3 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold cursor-pointer"
                      >
                        تجاهل
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 5: CATEGORIES (DYNAMIC MANAGEMENT) ================= */}
        {activeAdminTab === 'categories' && hasPermission('manage_categories') && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  إدارة وترتيب أقسام شها ون ({categories.length} قسماً)
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  يمكنك إضافة أقسام جديدة، تعديل التخصصات الفرعية، وإعادة ترتيب الأقسام على الصفحة الرئيسية للمواطنين.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingCategory({
                    id: 'cat_' + Date.now(),
                    nameAr: '',
                    icon: '🌟',
                    descriptionAr: '',
                    order: categories.length + 1,
                    isActive: true,
                    subcategories: []
                  });
                  setNewSubcatInput('');
                }}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-2 shadow-xs cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة قسم جديد للدليل</span>
              </button>
            </div>

            {/* Categories Cards Grid with Reordering & Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...categories].sort((a, b) => a.order - b.order).map((cat, idx, arr) => (
                <div
                  key={cat.id}
                  className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all shadow-xs flex flex-col justify-between gap-4 ${
                    cat.isActive !== false ? 'border-slate-200 dark:border-slate-800' : 'border-amber-300 dark:border-amber-800 opacity-70'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <CategoryIconBadge category={cat} size="sm" />
                        <div>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white">{cat.nameAr}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">الترتيب: #{cat.order}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {cat.isActive !== false ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                            نشط
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 font-bold">
                            معطل
                          </span>
                        )}

                        {/* Move Up / Down Buttons */}
                        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 mr-1">
                          <button
                            disabled={idx === 0}
                            onClick={() => handleMoveCategory(cat, 'up')}
                            className="p-1 text-slate-600 dark:text-slate-300 hover:text-blue-600 disabled:opacity-30 cursor-pointer"
                            title="تحريك لأعلى"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            disabled={idx === arr.length - 1}
                            onClick={() => handleMoveCategory(cat, 'down')}
                            className="p-1 text-slate-600 dark:text-slate-300 hover:text-blue-600 disabled:opacity-30 cursor-pointer"
                            title="تحريك لأسفل"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                      {cat.descriptionAr || 'بدون وصف'}
                    </p>

                    {/* Subcategories tags */}
                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                      {cat.subcategories && cat.subcategories.length > 0 ? (
                        cat.subcategories.map((sub, sIdx) => (
                          <span
                            key={sIdx}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                          >
                            {sub}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-400">لا توجد تخصصات فرعية مضافة</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setEditingCategory({ ...cat });
                        setNewSubcatInput('');
                      }}
                      className="flex-1 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>تعديل القسم والتخصصات</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`هل أنت متأكد من حذف قسم «${cat.nameAr}» نهائياً؟`)) {
                          deleteCategory(cat.id);
                          onSuccessToast(`تم حذف قسم ${cat.nameAr} بنجاح`);
                        }
                      }}
                      className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                      title="حذف القسم"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Category Edit / Create Modal */}
            {editingCategory && (
              <CustomModal
                isOpen={Boolean(editingCategory)}
                onClose={() => setEditingCategory(null)}
                title={editingCategory.nameAr ? `تعديل قسم «${editingCategory.nameAr}»` : 'إضافة قسم خدمي جديد'}
                subtitle="تحكم كامل في الأقسام والتخصصات الفرعية والأيقونات وترتيب الظهور بالدليل"
              >
                <form onSubmit={handleCategorySubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        اسم القسم بالعربية *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingCategory.nameAr || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingCategory({
                            ...editingCategory,
                            nameAr: val
                          });
                        }}
                        placeholder="مثال: ورش وميكانيكا السيارات أو مغاسل الملابس"
                        className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        معرّف القسم الإنجليزي (ID) *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingCategory.id || ''}
                        onChange={(e) => setEditingCategory({ ...editingCategory, id: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
                        placeholder="auto_generated"
                        className="w-full px-3 py-2.5 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Icon Selector with Visual Presets */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        أيقونة القسم (اختر أيقونة من القائمة أو اكتب إيموجي) *
                      </label>
                      <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-md">
                        المحدد: {editingCategory.icon || 'HelpCircle'}
                      </span>
                    </div>

                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        required
                        value={editingCategory.icon || ''}
                        onChange={(e) => setEditingCategory({ ...editingCategory, icon: e.target.value })}
                        placeholder="رمز الأيقونة أو الإيموجي (مثل Stethoscope أو 🩺)"
                        className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none text-right font-mono"
                      />
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0">
                        <CategoryIconBadge
                          category={{
                            id: editingCategory.id || 'preview',
                            nameAr: editingCategory.nameAr || 'معاينة',
                            icon: editingCategory.icon || 'Sparkles'
                          }}
                          size="sm"
                        />
                      </div>
                    </div>

                    {/* Quick Icon Presets Grid */}
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                      <p className="text-[11px] font-bold text-slate-500 mb-2">أيقونات جاهزة سريعة للاختيار المباشر:</p>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 max-h-32 overflow-y-auto">
                        {[
                          { id: 'Stethoscope', emoji: '🩺', label: 'أطباء' },
                          { id: 'Pill', emoji: '💊', label: 'صيدليات' },
                          { id: 'GraduationCap', emoji: '🎓', label: 'معلمين' },
                          { id: 'ShoppingCart', emoji: '🛒', label: 'بقالة' },
                          { id: 'UtensilsCrossed', emoji: '🍽️', label: 'مطاعم' },
                          { id: 'Wrench', emoji: '🔧', label: 'صيانة' },
                          { id: 'Car', emoji: '🚗', label: 'سيارات' },
                          { id: 'School', emoji: '🏫', label: 'مدارس' },
                          { id: 'FlaskConical', emoji: '🧪', label: 'معامل' },
                          { id: 'Scale', emoji: '⚖️', label: 'محامين' },
                          { id: 'BookOpen', emoji: '📚', label: 'مكتبات' },
                          { id: 'Landmark', emoji: '🏛️', label: 'مساجد' },
                          { id: 'PackageCheck', emoji: '📦', label: 'شحن' },
                          { id: 'HeartHandshake', emoji: '🤝', label: 'خيرية' },
                          { id: 'Droplet', emoji: '🩸', label: 'دم' },
                          { id: 'Scissors', emoji: '✂️', label: 'حلاقة' },
                          { id: 'Sparkles', emoji: '✨', label: 'تنظيف' },
                          { id: 'Smartphone', emoji: '📱', label: 'إلكترونيات' },
                          { id: 'Home', emoji: '🏠', label: 'عقارات' },
                          { id: 'Sprout', emoji: '🌱', label: 'زراعة' },
                          { id: 'Briefcase', emoji: '💼', label: 'مهن' },
                          { id: 'Store', emoji: '🏪', label: 'محلات' },
                          { id: 'Layers', emoji: '🗂️', label: 'متنوع' }
                        ].map((ico) => (
                          <button
                            key={ico.id}
                            type="button"
                            onClick={() => setEditingCategory({ ...editingCategory, icon: ico.id })}
                            className={`p-1.5 rounded-lg border text-center transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer min-h-[44px] ${
                              editingCategory.icon === ico.id
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                : 'bg-white dark:bg-slate-700/80 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:border-blue-400'
                            }`}
                          >
                            <span className="text-sm">{ico.emoji}</span>
                            <span className="text-[9px] font-bold truncate max-w-full">{ico.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      وصف القسم لأهالي القرية
                    </label>
                    <textarea
                      rows={2}
                      value={editingCategory.descriptionAr || ''}
                      onChange={(e) => setEditingCategory({ ...editingCategory, descriptionAr: e.target.value })}
                      placeholder="وصف مختصر يوضح نوع الخدمات التابعة لهذا القسم في شها..."
                      className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none resize-none"
                    />
                  </div>

                  {/* Subcategories Management */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        التخصصات الفرعية ({editingCategory.subcategories?.length || 0})
                      </label>
                      <span className="text-[11px] text-slate-400">
                        اضغط Enter أو الزر لإضافة تخصص جديد
                      </span>
                    </div>

                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newSubcatInput}
                        onChange={(e) => setNewSubcatInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (newSubcatInput.trim()) {
                              setEditingCategory({
                                ...editingCategory,
                                subcategories: [...(editingCategory.subcategories || []), newSubcatInput.trim()]
                              });
                              setNewSubcatInput('');
                            }
                          }
                        }}
                        placeholder="اكتب التخصص واضغط Enter أو زر الإضافة..."
                        className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none min-h-[44px]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newSubcatInput.trim()) {
                            setEditingCategory({
                              ...editingCategory,
                              subcategories: [...(editingCategory.subcategories || []), newSubcatInput.trim()]
                            });
                            setNewSubcatInput('');
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs cursor-pointer hover:bg-blue-700 min-h-[44px] flex items-center gap-1 shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>إضافة تخصص</span>
                      </button>
                    </div>

                    {/* Quick specialty suggestions */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                      <span className="text-[11px] font-bold text-slate-400">اقتراحات سريعة:</span>
                      {[
                        'صيانة فورية',
                        'ورشة وتركيب',
                        'خدمة منازل',
                        'بيع وشراء',
                        'استشاري',
                        'أخصائي',
                        'توصيل طلبات',
                        'قطع غيار',
                        'طوارئ 24 ساعة'
                      ].map((sug, sI) => {
                        const alreadyHas = editingCategory.subcategories?.includes(sug);
                        if (alreadyHas) return null;
                        return (
                          <button
                            key={sI}
                            type="button"
                            onClick={() => {
                              setEditingCategory({
                                ...editingCategory,
                                subcategories: [...(editingCategory.subcategories || []), sug]
                              });
                            }}
                            className="text-[10px] font-bold px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-colors"
                          >
                            + {sug}
                          </button>
                        );
                      })}
                    </div>

                    {/* Subcategories tags list with remove button */}
                    <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 min-h-12 max-h-36 overflow-y-auto">
                      {editingCategory.subcategories && editingCategory.subcategories.length > 0 ? (
                        editingCategory.subcategories.map((sub, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-xs"
                          >
                            <span>{sub}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCategory({
                                  ...editingCategory,
                                  subcategories: editingCategory.subcategories?.filter((_, idx) => idx !== i)
                                });
                              }}
                              className="text-slate-400 hover:text-red-500 cursor-pointer p-0.5"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 py-1">لا توجد تخصصات مضافة بعد. يمكنك إضافة تخصصات جديدة بالأعلى.</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer min-h-[44px]">
                      <input
                        type="checkbox"
                        checked={editingCategory.isActive ?? true}
                        onChange={(e) => setEditingCategory({ ...editingCategory, isActive: e.target.checked })}
                        className="rounded text-blue-600 w-4 h-4 cursor-pointer"
                      />
                      <span>تفعيل ظهور القسم للجمهور بالدليل</span>
                    </label>

                    <span className="text-xs text-slate-400 font-mono">
                      الترتيب الحالي: #{editingCategory.order || 1}
                    </span>
                  </div>

                  <div className="pt-4 flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-md min-h-[44px] active:scale-95 transition-all"
                    >
                      حفظ وتثبيت القسم
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingCategory(null)}
                      className="px-5 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs cursor-pointer min-h-[44px]"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              </CustomModal>
            )}
          </div>
        )}

        {/* ================= TAB: ADVERTISEMENTS & PROMOTIONS (ADVANCED) ================= */}
        {activeAdminTab === 'ads' && !hasPermission('manage_ads') && (
          <div className="p-10 bg-white dark:bg-slate-900 rounded-3xl border border-red-200 dark:border-red-900/60 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              قسم الإعلانات والعروض محمي ومخصص للمصرح لهم فقط
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              إضافة أو تعديل أو تثبيت الإعلانات محصورة فقط على مالك النظام الرئيسي أو المشرفين الممنوحين صراحةً صلاحية (إدارة الإعلانات والعروض manage_ads).
            </p>
          </div>
        )}

        {activeAdminTab === 'ads' && hasPermission('manage_ads') && (
          <div className="space-y-6">
            {/* Header & Stats Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    نظام إدارة الإعلانات والعروض الترويجية بشها ({advertisements.length} إعلان)
                  </h3>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    تحكم فوري وجدولة زمنية
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  يمكنك إضافة إعلانات وبانرات، إخفاؤها أو إظهارها في أي لحظة، وتحديد تاريخ ووقت ظهور الإعلان وانتهائه تلقائياً.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingAd({
                    id: 'ad_' + Date.now(),
                    title: '',
                    subtitle: '',
                    description: '',
                    placement: 'hero_slider',
                    badgeType: 'offer',
                    badgeText: 'عرض خاص',
                    ctaText: 'اتصل الآن',
                    phone: '',
                    whatsapp: '',
                    discountPercent: '',
                    startDate: '',
                    endDate: '',
                    isActive: true,
                    priority: advertisements.length + 1,
                    viewsCount: 0,
                    clicksCount: 0,
                    backgroundColor: 'gradient_emerald',
                    targetCategory: 'all'
                  });
                }}
                className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer shrink-0 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة إعلان جديد</span>
              </button>
            </div>

            {/* Performance Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[11px] font-bold text-slate-500">إجمالي الإعلانات</span>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {advertisements.length}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[11px] font-bold text-emerald-600">معروض ونشط الآن</span>
                <div className="text-2xl font-black text-emerald-600 mt-1">
                  {advertisements.filter(a => isAdActiveNow(a)).length}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[11px] font-bold text-slate-400">مخفي / متوقف</span>
                <div className="text-2xl font-black text-slate-600 dark:text-slate-400 mt-1">
                  {advertisements.filter(a => !a.isActive).length}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[11px] font-bold text-blue-600">المشاهدات (Views)</span>
                <div className="text-2xl font-black text-blue-600 mt-1">
                  {advertisements.reduce((acc, curr) => acc + (curr.viewsCount || 0), 0)}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[11px] font-bold text-amber-600">النقرات (Clicks)</span>
                <div className="text-2xl font-black text-amber-600 mt-1">
                  {advertisements.reduce((acc, curr) => acc + (curr.clicksCount || 0), 0)}
                </div>
              </div>
            </div>

            {/* Filter and Search Controls */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Search */}
                <div className="sm:col-span-2 relative">
                  <input
                    type="text"
                    value={adSearch}
                    onChange={(e) => setAdSearch(e.target.value)}
                    placeholder="ابحث في الإعلانات بالعنوان أو الوصف أو رقم الهاتف..."
                    className="w-full pl-4 pr-10 py-3 rounded-2xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none min-h-[44px]"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Placement Filter */}
                <div className="w-full sm:w-64">
                  <CustomSelect
                    value={adPlacementFilter}
                    onChange={(val) => setAdPlacementFilter(val as any)}
                    searchable={false}
                    size="md"
                    options={[
                      { value: 'all', label: 'جميع مواضع العرض' },
                      { value: 'top_banner', label: 'شريط إعلاني علوي (Top Banner)' },
                      { value: 'hero_slider', label: 'بانر رئيسي مميز (Hero Slider)' },
                      { value: 'popup_modal', label: 'نافذة منبثقة (Popup Modal)' },
                      { value: 'feed_interstitial', label: 'داخل الخدمات والبحث (In-Feed)' }
                    ]}
                  />
                </div>
              </div>

              {/* Status Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
                {[
                  { id: 'all', label: 'جميع الإعلانات' },
                  { id: 'pinned', label: '📌 المثبتة بالصدارة' },
                  { id: 'active', label: 'معروض ونشط الآن' },
                  { id: 'paused', label: 'مخفي ومتوقف' },
                  { id: 'scheduled', label: 'مجدول للمستقبل' },
                  { id: 'expired', label: 'منتهي الصلاحية' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setAdStatusFilter(tab.id as any)}
                    className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                      adStatusFilter === tab.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Advertisements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {advertisements
                .filter(ad => {
                  // Search query
                  if (adSearch.trim()) {
                    const q = adSearch.toLowerCase();
                    const matchTitle = ad.title?.toLowerCase().includes(q);
                    const matchSub = ad.subtitle?.toLowerCase().includes(q);
                    const matchPhone = ad.phone?.includes(q);
                    if (!matchTitle && !matchSub && !matchPhone) return false;
                  }

                  // Placement filter
                  if (adPlacementFilter !== 'all' && ad.placement !== adPlacementFilter) {
                    return false;
                  }

                  // Status filter
                  const now = Date.now();
                  const isScheduled = ad.startDate && new Date(ad.startDate).getTime() > now;
                  const isExpired = ad.endDate && new Date(ad.endDate).getTime() < now;
                  const isCurrentlyActive = isAdActiveNow(ad);

                  if (adStatusFilter === 'pinned' && !ad.isPinned) return false;
                  if (adStatusFilter === 'active' && !isCurrentlyActive) return false;
                  if (adStatusFilter === 'paused' && ad.isActive) return false;
                  if (adStatusFilter === 'scheduled' && !isScheduled) return false;
                  if (adStatusFilter === 'expired' && !isExpired) return false;

                  return true;
                })
                .map((ad) => {
                  const isCurrentlyActive = isAdActiveNow(ad);
                  const isScheduled = ad.startDate && new Date(ad.startDate).getTime() > Date.now();
                  const isExpired = ad.endDate && new Date(ad.endDate).getTime() < Date.now();

                  return (
                    <div
                      key={ad.id}
                      className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all shadow-xs flex flex-col justify-between gap-4 ${
                        isCurrentlyActive
                          ? 'border-emerald-300 dark:border-emerald-800/80 shadow-emerald-500/5'
                          : 'border-slate-200 dark:border-slate-800 opacity-80'
                      }`}
                    >
                      <div>
                        {/* Badges Row */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {ad.isPinned && (
                              <span className="text-[11px] font-black px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 flex items-center gap-1 shadow-xs">
                                <Pin className="w-3 h-3 rotate-45" />
                                <span>مثبت بالصدارة</span>
                              </span>
                            )}

                            {/* Placement Badge */}
                            <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800">
                              {ad.placement === 'top_banner' && 'شريط علوي'}
                              {ad.placement === 'hero_slider' && 'بانر رئيسي'}
                              {ad.placement === 'popup_modal' && 'نافذة منبثقة'}
                              {ad.placement === 'feed_interstitial' && 'بين الخدمات'}
                            </span>

                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              أولوية: {ad.priority || 1}
                            </span>

                            {ad.badgeText && (
                              <span className="text-[11px] font-black px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                                {ad.badgeText}
                              </span>
                            )}

                            {ad.discountPercent && (
                              <span className="text-[11px] font-black px-2 py-0.5 rounded-lg bg-emerald-600 text-white">
                                خصم {ad.discountPercent}
                              </span>
                            )}
                          </div>

                          {/* Status Badge */}
                          <div>
                            {isCurrentlyActive ? (
                              <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-black">
                                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                                <span>معروض بالدليل</span>
                              </span>
                            ) : isScheduled ? (
                              <span className="text-[11px] px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold">
                                مجدول للمستقبل
                              </span>
                            ) : isExpired ? (
                              <span className="text-[11px] px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold">
                                منتهي الصلاحية
                              </span>
                            ) : (
                              <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400 font-bold">
                                متوقف ومخفي
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Visual Image Preview if ad has an image */}
                        {ad.imageUrl && (
                          <div className="w-full h-28 rounded-2xl overflow-hidden mb-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 relative">
                            <img
                              src={ad.imageUrl}
                              alt={ad.title}
                              className={`w-full h-full ${ad.imageFit === 'contain' ? 'object-contain' : 'object-cover'}`}
                              onError={(e) => {
                                (e.currentTarget.parentElement as HTMLElement).style.display = 'none';
                              }}
                            />
                            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] font-bold text-white">
                              صورة معتمدة
                            </div>
                          </div>
                        )}

                        {/* Ad Title & Details */}
                        <h4 className="text-base font-black text-slate-900 dark:text-white leading-snug">
                          {ad.title}
                        </h4>

                        {ad.subtitle && (
                          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1">
                            {ad.subtitle}
                          </p>
                        )}

                        {ad.description && (
                          <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                            {ad.description}
                          </p>
                        )}

                        {/* Ad Features Tags (Image, Skip, Duration) */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                          {ad.imageUrl ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              🖼️ يحتوي صورة
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                              بدون صورة
                            </span>
                          )}

                          {ad.allowSkip === false ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                              🔒 تخطي مقيد ({ad.skipTimerSeconds || 5}ث)
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                              ⚡ تخطي فوري متاح
                            </span>
                          )}

                          {ad.displayDurationSeconds && ad.displayDurationSeconds > 0 ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              ⏳ إغلاق بعد {ad.displayDurationSeconds}ث
                            </span>
                          ) : null}
                        </div>

                        {/* Scheduling & Contacts Info */}
                        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                          <div>
                            <span className="text-slate-400 block font-bold">فترة الظهور والجدولة:</span>
                            <span className="text-slate-700 dark:text-slate-300 font-semibold">
                              {ad.startDate || ad.endDate
                                ? `${ad.startDate || 'فوري'} ⬅️ ${ad.endDate || 'مستمر'}`
                                : 'مستمر دائماً دون انتهاء'}
                            </span>
                          </div>

                          <div>
                            <span className="text-slate-400 block font-bold">بيانات التواصل:</span>
                            <span className="font-mono font-bold text-blue-600">
                              {ad.phone || ad.whatsapp || 'بدون هاتف'}
                            </span>
                          </div>
                        </div>

                        {/* Stats counters */}
                        <div className="flex items-center gap-4 mt-2.5 text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl">
                          <div>
                            المشاهدات: <strong className="text-slate-900 dark:text-white font-mono">{ad.viewsCount || 0}</strong>
                          </div>
                          <div>
                            النقرات: <strong className="text-slate-900 dark:text-white font-mono">{ad.clicksCount || 0}</strong>
                          </div>
                          <div>
                            معدل التفاعل: <strong className="text-emerald-600 font-mono">
                              {ad.viewsCount && ad.viewsCount > 0
                                ? `${(((ad.clicksCount || 0) / ad.viewsCount) * 100).toFixed(1)}%`
                                : '0%'}
                            </strong>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons & Instant Toggle */}
                      <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                        {/* Instant Show / Hide Toggle Button */}
                        <button
                          onClick={() => handleToggleAd(ad)}
                          className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs transition-all cursor-pointer min-h-[44px] flex items-center justify-center gap-1.5 ${
                            ad.isActive
                              ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                        >
                          <span>{ad.isActive ? '⏸️ إخفاء من الدليل' : '🟢 إظهار وتفعيل بالدليل'}</span>
                        </button>

                        {/* Instant Pin / Unpin Toggle */}
                        <button
                          onClick={async () => {
                            await toggleAdvertisementPin(ad.id, !ad.isPinned);
                            onSuccessToast(ad.isPinned ? 'تم إلغاء تثبيت الإعلان' : 'تم تثبيت الإعلان بالصدارة 📌');
                          }}
                          className={`p-2.5 rounded-xl font-bold text-xs min-h-[44px] min-w-[44px] flex items-center justify-center gap-1 cursor-pointer transition-all ${
                            ad.isPinned
                              ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-amber-600'
                          }`}
                          title={ad.isPinned ? 'إلغاء التثبيت من الصدارة' : 'تثبيت الإعلان في الصدارة'}
                        >
                          <Pin className={`w-4 h-4 ${ad.isPinned ? 'rotate-45 fill-current' : ''}`} />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => setEditingAd({ ...ad })}
                          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                          title="تعديل الإعلان والمواعيد"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteAd(ad)}
                          className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950 hover:bg-rose-100 text-rose-600 font-bold text-xs min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                          title="حذف الإعلان نهائياً"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Advertisement Create / Edit Modal */}
            {editingAd && (
              <CustomModal
                isOpen={Boolean(editingAd)}
                onClose={() => setEditingAd(null)}
                title={editingAd.title ? `تعديل إعلان «${editingAd.title}»` : 'إضافة إعلان أو عرض ترويجي جديد'}
                subtitle="حدد موضع العرض، نصوص الإعلان، أرقام التواصل، والجدولة الزمنية للظهور"
              >
                <form onSubmit={handleSaveAdSubmit} className="space-y-4">
                  {/* Title & Placement */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        عنوان الإعلان الرئيسي *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingAd.title || ''}
                        onChange={(e) => setEditingAd({ ...editingAd, title: e.target.value })}
                        placeholder="مثال: خصم 20% بمناسبة الافتتاح لدى صيدلية الأمل"
                        className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none min-h-[44px]"
                      />
                    </div>

                    <div>
                      <CustomSelect
                        label="موضع ظهور الإعلان *"
                        value={editingAd.placement || 'hero_slider'}
                        onChange={(val) => setEditingAd({ ...editingAd, placement: val as any })}
                        searchable={false}
                        size="md"
                        options={[
                          { value: 'hero_slider', label: 'بانر رئيسي مميز (Hero Slider) – أعلى الرئيسية' },
                          { value: 'top_banner', label: 'شريط إعلاني علوي (Top Banner) – فوق الهيدر' },
                          { value: 'popup_modal', label: 'نافذة منبثقة (Popup Modal) – تظهر للزائر' },
                          { value: 'feed_interstitial', label: 'داخل الخدمات والبحث (In-Feed) – وسط القوائم' }
                        ]}
                      />
                    </div>
                  </div>

                  {/* Target Category */}
                  <div>
                    <CustomSelect
                      label="القسم المستهدف بالدليل (اختياري)"
                      value={editingAd.targetCategory || 'all'}
                      onChange={(val) => setEditingAd({ ...editingAd, targetCategory: val })}
                      searchable={false}
                      size="md"
                      options={[
                        { value: 'all', label: 'جميع أقسام الدليل (عام لكافة أهالي شها)' },
                        ...categories.map(c => ({
                          value: c.id,
                          label: `قسم: ${c.nameAr}`
                        }))
                      ]}
                    />
                  </div>

                  {/* ================= OPTIONAL IMAGE SECTION ================= */}
                  <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-slate-800/80 border border-blue-200/80 dark:border-slate-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-blue-600" />
                        <span>صورة الإعلان (اختياري حسب الرغبة)</span>
                      </label>
                      {editingAd.imageUrl ? (
                        <button
                          type="button"
                          onClick={() => setEditingAd({ ...editingAd, imageUrl: '' })}
                          className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>إزالة الصورة والعودة لنصي فقط</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-bold">لا توجد صورة محددة حالياً</span>
                      )}
                    </div>

                    {/* Image Preview if present */}
                    {editingAd.imageUrl ? (
                      <div className="space-y-2.5">
                        <div className="relative w-full h-40 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                          <img
                            src={editingAd.imageUrl}
                            alt="معاينة صورة الإعلان"
                            className={`w-full h-full ${editingAd.imageFit === 'contain' ? 'object-contain' : 'object-cover'}`}
                          />
                          <div className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-xs text-[11px] font-bold text-white flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-300" />
                            <span>معاينة الصورة الحية</span>
                          </div>
                        </div>

                        {/* Image Fit and Change Controls */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-600 dark:text-slate-300 text-[11px]">طريقة العرض:</span>
                            <button
                              type="button"
                              onClick={() => setEditingAd({ ...editingAd, imageFit: 'cover' })}
                              className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                                editingAd.imageFit !== 'contain'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                              }`}
                            >
                              ملء كامل (Cover)
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingAd({ ...editingAd, imageFit: 'contain' })}
                              className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                                editingAd.imageFit === 'contain'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                              }`}
                            >
                              احتواء الصورة (Contain)
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {/* Source Selection Tabs */}
                    <div>
                      <div className="flex items-center gap-1.5 p-1 bg-white/80 dark:bg-slate-700/60 rounded-xl border border-slate-200 dark:border-slate-600 mb-3">
                        <button
                          type="button"
                          onClick={() => setAdImageSourceMode('upload')}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            adImageSourceMode === 'upload'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-slate-600 dark:text-slate-300 hover:text-blue-600'
                          }`}
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>رفع من الجهاز</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setAdImageSourceMode('presets')}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            adImageSourceMode === 'presets'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-slate-600 dark:text-slate-300 hover:text-blue-600'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>قوالب شها الجاهزة</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setAdImageSourceMode('url')}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            adImageSourceMode === 'url'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-slate-600 dark:text-slate-300 hover:text-blue-600'
                          }`}
                        >
                          <LinkIcon className="w-3.5 h-3.5" />
                          <span>رابط خارجي (URL)</span>
                        </button>
                      </div>

                      {/* Mode 1: File Upload */}
                      {adImageSourceMode === 'upload' && (
                        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                          <label className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-blue-300 dark:border-blue-800 rounded-xl cursor-pointer hover:bg-blue-50/50 dark:hover:bg-slate-800 transition-all">
                            <Upload className={`w-6 h-6 text-blue-600 ${isUploadingAdImage ? 'animate-bounce' : ''}`} />
                            <div>
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                                {isUploadingAdImage ? 'جاري ضغط ومعالجة الصورة...' : 'اضغط لاختيار صورة من هاتفك أو جهازك'}
                              </span>
                              <span className="text-[10px] text-slate-400 mt-0.5 block">
                                يتم ضغط الصورة وتحسينها تلقائياً لتحميل فوري خفيف
                              </span>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              disabled={isUploadingAdImage}
                              onChange={handleAdImageUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      )}

                      {/* Mode 2: Presets Grid */}
                      {adImageSourceMode === 'presets' && (
                        <div className="space-y-2">
                          <p className="text-[11px] font-bold text-slate-500">اختر قالباً جاهزاً عالي الجودة بنقرة واحدة:</p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {AD_IMAGE_PRESETS.map((preset) => (
                              <button
                                key={preset.id}
                                type="button"
                                onClick={() => setEditingAd({ ...editingAd, imageUrl: preset.url })}
                                className={`p-2 rounded-xl text-right border transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                                  editingAd.imageUrl === preset.url
                                    ? 'bg-blue-50 dark:bg-blue-950/80 border-blue-600 ring-2 ring-blue-500/30'
                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                                }`}
                              >
                                <div className="w-full h-16 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700">
                                  <img
                                    src={preset.url}
                                    alt={preset.label}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                  />
                                </div>
                                <div>
                                  <span className="text-xs font-black text-slate-900 dark:text-white block truncate">
                                    {preset.label}
                                  </span>
                                  <span className="text-[9px] text-slate-400 block truncate">
                                    {preset.desc}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Mode 3: Direct URL */}
                      {adImageSourceMode === 'url' && (
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            رابط الصورة المباشر (URL)
                          </label>
                          <input
                            type="url"
                            value={editingAd.imageUrl || ''}
                            onChange={(e) => setEditingAd({ ...editingAd, imageUrl: e.target.value })}
                            placeholder="https://example.com/banner.jpg"
                            className="w-full px-3 py-2.5 rounded-xl text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none min-h-[44px]"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Subtitle & Badge */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        عنوان فرعي أو ملخص
                      </label>
                      <input
                        type="text"
                        value={editingAd.subtitle || ''}
                        onChange={(e) => setEditingAd({ ...editingAd, subtitle: e.target.value })}
                        placeholder="مثال: خدمة 24 ساعة وتوصيل مجاني لكافة أهالي شها"
                        className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none min-h-[44px]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        شارة الإعلان (Badge)
                      </label>
                      <input
                        type="text"
                        value={editingAd.badgeText || ''}
                        onChange={(e) => setEditingAd({ ...editingAd, badgeText: e.target.value })}
                        placeholder="عرض خاص أو افتتاح جديد"
                        className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none min-h-[44px]"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      تفاصيل الإعلان والعرض
                    </label>
                    <textarea
                      rows={2}
                      value={editingAd.description || ''}
                      onChange={(e) => setEditingAd({ ...editingAd, description: e.target.value })}
                      placeholder="تفاصيل العرض، الشروط، المزايا المقدمة لأهالي شها..."
                      className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none resize-none"
                    />
                  </div>

                  {/* Contacts & CTA */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        رقم الهاتف للاتصال
                      </label>
                      <input
                        type="tel"
                        value={editingAd.phone || ''}
                        onChange={(e) => setEditingAd({ ...editingAd, phone: e.target.value })}
                        placeholder="01000000000"
                        className="w-full px-3 py-2.5 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none min-h-[44px]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        رقم الواتساب
                      </label>
                      <input
                        type="tel"
                        value={editingAd.whatsapp || ''}
                        onChange={(e) => setEditingAd({ ...editingAd, whatsapp: e.target.value })}
                        placeholder="01000000000"
                        className="w-full px-3 py-2.5 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none min-h-[44px]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        نص زر الإجراء (CTA)
                      </label>
                      <input
                        type="text"
                        value={editingAd.ctaText || ''}
                        onChange={(e) => setEditingAd({ ...editingAd, ctaText: e.target.value })}
                        placeholder="اتصل الآن أو اطلب عبر واتساب"
                        className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none min-h-[44px]"
                      />
                    </div>
                  </div>

                  {/* ================= SKIP & DISPLAY DURATION CONTROL ================= */}
                  <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Timer className="w-4 h-4 text-amber-600" />
                        <span>التحكم في التخطي ومدة العرض (Skip & Display Timers)</span>
                      </label>
                      <span className="text-[11px] text-amber-700 dark:text-amber-400 font-bold">
                        خاص بالنوافذ المنبثقة والبانرات
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Allow Skip Checkbox */}
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-200/80 dark:border-amber-900/60">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer min-h-[40px]">
                          <input
                            type="checkbox"
                            checked={editingAd.allowSkip !== false}
                            onChange={(e) => setEditingAd({ ...editingAd, allowSkip: e.target.checked })}
                            className="rounded text-amber-600 w-4 h-4 cursor-pointer"
                          />
                          <span>السماح بالتخطي الفوري للزائر</span>
                        </label>
                        <span className="text-[10px] text-slate-400 block pr-6">
                          عند إلغاء التحديد، يُلزم الزائر بالانتظار حتى انتهاء مؤقت التخطي.
                        </span>
                      </div>

                      {/* Skip countdown timer */}
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-200/80 dark:border-amber-900/60">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          مدة انتظار التخطي الإجباري (بالثواني):
                        </span>
                        <input
                          type="number"
                          min="0"
                          max="60"
                          value={editingAd.skipTimerSeconds ?? (editingAd.allowSkip === false ? 5 : 0)}
                          onChange={(e) => setEditingAd({ ...editingAd, skipTimerSeconds: Number(e.target.value) })}
                          placeholder="0 أو 5 ثوانٍ"
                          className="w-full px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-400 mt-0.5 block">
                          يظهر عداد مثل: «تخطي بعد 5 ثوانٍ»
                        </span>
                      </div>
                    </div>

                    {/* Auto-close display duration */}
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-200/80 dark:border-amber-900/60">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        مدة بقاء الإعلان قبل الإغلاق التلقائي (بالثواني - اختياري):
                      </span>
                      <input
                        type="number"
                        min="0"
                        max="300"
                        value={editingAd.displayDurationSeconds ?? 0}
                        onChange={(e) => setEditingAd({ ...editingAd, displayDurationSeconds: Number(e.target.value) })}
                        placeholder="0 (اتركه 0 للبقاء حتى يغلقه الزائر)"
                        className="w-full px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        مثال: 15 ثانية ليُغلق تلقائياً بعد مرور 15 ثانية دون إزعاج.
                      </span>
                    </div>
                  </div>

                  {/* Scheduling (Start Date & End Date) */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span>الجدولة وتحديد وقت العرض (اختياري)</span>
                      </label>
                      <span className="text-[11px] text-slate-400">اتركها فارغة ليبقى الإعلان معروضاً دائماً</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-[11px] font-bold text-slate-500 mb-1 block">تاريخ بدء الظهور:</span>
                        <input
                          type="date"
                          value={editingAd.startDate?.slice(0, 10) || ''}
                          onChange={(e) => setEditingAd({ ...editingAd, startDate: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:outline-none min-h-[40px]"
                        />
                      </div>

                      <div>
                        <span className="text-[11px] font-bold text-slate-500 mb-1 block">تاريخ انتهاء الإعلان:</span>
                        <input
                          type="date"
                          value={editingAd.endDate?.slice(0, 10) || ''}
                          onChange={(e) => setEditingAd({ ...editingAd, endDate: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:outline-none min-h-[40px]"
                        />
                      </div>
                    </div>

                    {/* Quick duration presets */}
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[11px] font-bold text-slate-400">فترات سريعة:</span>
                      <button
                        type="button"
                        onClick={() => {
                          const now = new Date();
                          const end = new Date(now.getTime() + 7 * 86400000);
                          setEditingAd({
                            ...editingAd,
                            startDate: now.toISOString().slice(0, 10),
                            endDate: end.toISOString().slice(0, 10)
                          });
                        }}
                        className="text-[10px] font-bold px-2 py-1 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-blue-500 cursor-pointer"
                      >
                        أسبوع واحد
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const now = new Date();
                          const end = new Date(now.getTime() + 30 * 86400000);
                          setEditingAd({
                            ...editingAd,
                            startDate: now.toISOString().slice(0, 10),
                            endDate: end.toISOString().slice(0, 10)
                          });
                        }}
                        className="text-[10px] font-bold px-2 py-1 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-blue-500 cursor-pointer"
                      >
                        شهر كامل
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingAd({
                            ...editingAd,
                            startDate: '',
                            endDate: ''
                          });
                        }}
                        className="text-[10px] font-bold px-2 py-1 rounded-md bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 cursor-pointer"
                      >
                        مستمر دائماً (بدون انتهاء)
                      </button>
                    </div>
                  </div>

                  {/* Background Color Gradient */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      لون وثيم البانر
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        { id: 'gradient_emerald', label: 'أخضر زمردي', bg: 'bg-emerald-600' },
                        { id: 'gradient_blue', label: 'أزرق كلاسيك', bg: 'bg-blue-600' },
                        { id: 'gradient_rose', label: 'أحمر عاجل', bg: 'bg-rose-600' },
                        { id: 'gradient_purple', label: 'بنفسجي ملكي', bg: 'bg-purple-600' },
                        { id: 'gradient_amber', label: 'ذهبي / برتقالي', bg: 'bg-amber-600' }
                      ].map((theme) => (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() => setEditingAd({ ...editingAd, backgroundColor: theme.id })}
                          className={`p-2 rounded-xl text-center flex flex-col items-center gap-1 border cursor-pointer min-h-[44px] ${
                            editingAd.backgroundColor === theme.id
                              ? 'border-slate-900 dark:border-white ring-2 ring-blue-500/20 shadow-xs'
                              : 'border-slate-200 dark:border-slate-700 opacity-80 hover:opacity-100'
                          }`}
                        >
                          <span className={`w-4 h-4 rounded-full ${theme.bg}`} />
                          <span className="text-[10px] font-bold truncate">{theme.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ================= PIN & PRIORITY ADVANCED CONTROLS ================= */}
                  <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-900/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Pin className="w-4 h-4 text-amber-600 rotate-45" />
                        <span>تحكم التثبيت وأولوية الظهور (Pinned & Priority Control)</span>
                      </label>
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded-full">
                        خاص بالمشرفين
                      </span>
                    </div>

                    {/* Pin Checkbox */}
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-900/40">
                      <label className="flex items-center gap-2.5 text-xs font-black text-slate-800 dark:text-slate-100 cursor-pointer min-h-[40px]">
                        <input
                          type="checkbox"
                          checked={editingAd.isPinned ?? false}
                          onChange={(e) => setEditingAd({ ...editingAd, isPinned: e.target.checked })}
                          className="rounded text-amber-600 w-4.5 h-4.5 cursor-pointer"
                        />
                        <span>📌 تثبيت هذا الإعلان في صدارة الدليل بأعلى أولوية (Pinned to Top)</span>
                      </label>
                      <span className="text-[10px] text-slate-400 block pr-7">
                        الإعلانات المثبتة تظهر دائماً في بداية القوائم والسلايدرات قبل الإعلانات العادية.
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Priority Score 1 - 10 */}
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-900/40">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            درجة الأولوية (1 إلى 10):
                          </span>
                          <span className="text-xs font-mono font-black text-amber-600">
                            {editingAd.priority || 1} / 10
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={editingAd.priority ?? 1}
                          onChange={(e) => setEditingAd({ ...editingAd, priority: Number(e.target.value) })}
                          className="w-full accent-amber-500 cursor-pointer"
                        />
                        <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                          <span>1 (عادي)</span>
                          <span>5 (متوسط)</span>
                          <span>10 (قصوى VIP)</span>
                        </div>
                      </div>

                      {/* Display Rotation Mode */}
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-900/40">
                        <CustomSelect
                          label="طريقة الظهور والتدوير:"
                          value={editingAd.displayRotation || (editingAd.isPinned ? 'pinned' : 'priority')}
                          onChange={(val) => setEditingAd({ ...editingAd, displayRotation: val as any })}
                          searchable={false}
                          size="sm"
                          options={[
                            { value: 'pinned', label: 'تثبيت دائم بالصدارة (Pinned)', colorDot: 'bg-amber-500' },
                            { value: 'priority', label: 'حسب درجة الأهمية (Priority Ranked)', colorDot: 'bg-blue-500' },
                            { value: 'random', label: 'تدوير عشوائي ذكي وعادل (Smart Random)', colorDot: 'bg-emerald-500' }
                          ]}
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          التدوير العشوائي يضمن التوزيع العادل لمرات الظهور
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Active Toggle */}
                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer min-h-[44px]">
                      <input
                        type="checkbox"
                        checked={editingAd.isActive ?? true}
                        onChange={(e) => setEditingAd({ ...editingAd, isActive: e.target.checked })}
                        className="rounded text-blue-600 w-4 h-4 cursor-pointer"
                      />
                      <span>تفعيل الإعلان (يمكنك إخفاؤه أو إظهاره فوراً في أي وقت)</span>
                    </label>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-md min-h-[44px] active:scale-95 transition-all"
                    >
                      حفظ وتثبيت الإعلان
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingAd(null)}
                      className="px-5 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs cursor-pointer min-h-[44px]"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              </CustomModal>
            )}
          </div>
        )}

        {/* ================= VILLAGE NEWS TAB ================= */}
        {activeAdminTab === 'news' && hasPermission('manage_news') && (
          <NewsAdmin onSuccessToast={onSuccessToast} />
        )}

        {/* ================= SITE TEXTS TAB ================= */}
        {activeAdminTab === 'texts' && hasPermission('manage_texts') && (
          <SiteTextsAdmin onSuccessToast={onSuccessToast} />
        )}

        {/* ================= EMERGENCY NUMBERS MANAGEMENT TAB ================= */}
        {activeAdminTab === 'emergency' && hasPermission('manage_emergency') && (
          <EmergencyAdminTab onSuccessToast={onSuccessToast} />
        )}

        {/* ================= MANSOURA EMERGENCY SCHEDULE TAB ================= */}
        {activeAdminTab === 'mansoura_schedule' && hasPermission('manage_emergency') && (
          <EmergencyScheduleAdmin />
        )}

        {/* ================= PLATFORM CONTRIBUTORS / CREDITS TAB ================= */}
        {activeAdminTab === 'platform_credits' && isOwner && (
          <PlatformCreditsAdmin />
        )}

        {/* ================= TAB 6: BLOOD BANK ================= */}
        {activeAdminTab === 'blood' && hasPermission('manage_blood') && (
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              إدارة بنك متبرعي الدم بشها ({bloodDonors.length} متبرع)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {bloodDonors.map(donor => (
                <div
                  key={donor.id}
                  className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-black px-2 py-0.5 rounded-md bg-rose-600 text-white">
                        {donor.bloodGroup}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{donor.name}</span>
                    </div>
                    <p className="text-xs font-mono font-bold text-emerald-600">{donor.phone}</p>
                    <p className="text-[10px] text-slate-400">المنطقة: {donor.area}</p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`حذف المتبرع ${donor.name}؟`)) {
                        deleteBloodDonor(donor.id);
                        onSuccessToast('تم حذف المتبرع');
                      }
                    }}
                    className="p-2 text-slate-400 hover:text-red-500 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 7: CHARITY ================= */}
        {activeAdminTab === 'charity' && hasPermission('manage_charity') && (
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              المبادرات الخيرية
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {charities.map(ch => (
                <div
                  key={ch.id}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2"
                >
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">{ch.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{ch.description}</p>
                  <p className="text-xs font-mono font-bold text-emerald-600">هاتف: {ch.phone}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB: VERIFICATION BADGES ================= */}
        {activeAdminTab === 'badges' && hasPermission('manage_badges') && (
          <VerificationBadgesAdmin onSuccessToast={onSuccessToast} />
        )}

        {/* ================= TAB: HUMANITARIAN AID ================= */}
        {activeAdminTab === 'aid' && hasPermission('manage_aid') && (
          <HumanitarianAidAdmin onSuccessToast={onSuccessToast} />
        )}

        {/* ================= TAB: CITIZEN MESSAGES ================= */}
        {activeAdminTab === 'messages' && hasPermission('manage_messages') && (
          <AdminMessagesTab onSuccessToast={onSuccessToast} />
        )}

        {/* ================= TAB: COMMUNITY FACEBOOK PAGES ================= */}
        {activeAdminTab === 'community_pages' && (isOwner || hasPermission('manage_community_pages')) && (
          <CommunityPagesAdmin onSuccessToast={onSuccessToast} />
        )}

        {/* ================= TAB: REVIEWS MODERATION ================= */}
        {activeAdminTab === 'reviews' && hasPermission('manage_reviews') && (
          <ReviewModerationAdmin onSuccessToast={onSuccessToast} />
        )}

        {/* ================= TAB 8: USERS MANAGEMENT (ADVANCED) ================= */}
        {activeAdminTab === 'users' && hasPermission('manage_users') && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="ابحث بالاسم أو البريد أو الهاتف في المستخدمين..."
                    className="w-full pl-3 pr-9 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <div className="sm:w-56">
                  <CustomSelect
                    options={[
                      { value: 'all', label: 'جميع الحالات' },
                      { value: 'active', label: 'الحسابات النشطة فقط' },
                      { value: 'banned', label: 'الحسابات المحظورة فقط' }
                    ]}
                    value={userStatusFilter}
                    onChange={(val) => setUserStatusFilter(val)}
                    placeholder="حالة الحساب..."
                    searchable={false}
                  />
                </div>
              </div>

              <button
                onClick={() => fetchUsers(userSearch, userStatusFilter !== 'all' ? userStatusFilter : undefined)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                title="تحديث القائمة"
              >
                <RefreshCw className="w-4 h-4" />
                <span>تحديث</span>
              </button>
            </div>

            {/* Users Table / Grid */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
              {users.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-sm">
                  لا يوجد مستخدمون مسجلون مطابقون للبحث.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {users.map(u => {
                    const isUserOwner = u.role === 'owner';
                    return (
                      <div
                        key={u.id}
                        className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                          u.isBanned ? 'bg-red-50/40 dark:bg-red-950/20' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          {u.photoURL ? (
                            <img
                              src={u.photoURL}
                              alt={u.displayName || ''}
                              className="w-11 h-11 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                              {u.displayName ? u.displayName[0] : 'U'}
                            </div>
                          )}

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-slate-900 dark:text-white">
                                {u.displayName || 'أحد أهالي شها'}
                              </span>
                              {isUserOwner ? (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black flex items-center gap-1">
                                  <Crown className="w-3 h-3" /> المالك الرئيسي
                                </span>
                              ) : u.role === 'admin' ? (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold">
                                  مشرف
                                </span>
                              ) : (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                                  مستخدم عادي
                                </span>
                              )}

                              {u.isBanned ? (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-600 text-white font-black flex items-center gap-1">
                                  <UserX className="w-3 h-3" /> محظور
                                </span>
                              ) : (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1">
                                  <UserCheck className="w-3 h-3" /> نشط
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-500 mt-0.5">{u.email}</p>

                            {u.isBanned && (
                              <div className="text-[11px] text-red-600 dark:text-red-400 font-medium mt-1">
                                <span>سبب الحظر: {u.banReason || 'مخالفة الشروط'}</span>
                                {u.bannedUntil && (
                                  <span className="mr-2">
                                    • المدة: {u.bannedUntil === 'permanent' ? 'حظر دائم' : `ينتهي في ${new Date(u.bannedUntil).toLocaleDateString('ar-EG')}`}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Ban / Unban Action Buttons */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {isUserOwner ? (
                            <span className="text-xs text-amber-600 dark:text-amber-400 font-bold px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                              حساب محمي
                            </span>
                          ) : u.isBanned ? (
                            <button
                              onClick={() => handleConfirmUnban(u)}
                              className="px-3.5 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>فك الحظر</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => setSelectedUserToBan(u)}
                              className="px-3.5 py-2 rounded-xl text-xs font-black bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 border border-red-200 dark:border-red-800 flex items-center gap-1.5 cursor-pointer transition-colors"
                            >
                              <UserX className="w-3.5 h-3.5" />
                              <span>حظر المستخدم</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Ban Modal */}
            {selectedUserToBan && (
              <CustomModal
                isOpen={Boolean(selectedUserToBan)}
                onClose={() => setSelectedUserToBan(null)}
                title={`حظر المستخدم: ${selectedUserToBan.displayName || selectedUserToBan.email}`}
                subtitle="سيتم منع الحساب فوراً من طلب إضافة أرقام جديدة أو كتابة تقييمات أو طلبات بنك الدم"
                icon={<UserX className="w-5 h-5 text-red-600" />}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      سبب الحظر
                    </label>
                    <CustomSelect
                      options={[
                        { value: 'مخالفة معايير وشروط استخدام منصة شها ون', label: 'مخالفة معايير وشروط الاستخدام' },
                        { value: 'نشر أرقام وهمية أو مضللة', label: 'نشر أرقام وهمية أو مضللة' },
                        { value: 'إساءة استخدام المنصة والتكرار العشوائي', label: 'إساءة استخدام المنصة والتكرار العشوائي' },
                        { value: 'انتحال صفة أو نشاط تجاري دون إذن', label: 'انتحال صفة أو نشاط تجاري دون إذن' }
                      ]}
                      value={banReason}
                      onChange={(val) => setBanReason(val)}
                      searchable={false}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      مدة الحظر
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { label: '24 ساعة', days: 1 },
                        { label: '7 أيام', days: 7 },
                        { label: '30 يوماً', days: 30 },
                        { label: 'حظر دائم', days: 0 }
                      ].map(dur => (
                        <button
                          key={dur.days}
                          type="button"
                          onClick={() => setBanDurationDays(dur.days)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            banDurationDays === dur.days
                              ? 'bg-red-600 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          {dur.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-medium">
                    يتم تسجيل عملية الحظر وسببها في سجل العمليات الإدارية (Audit Log) فور التأكيد.
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      disabled={isBanning}
                      onClick={handleConfirmBan}
                      className="flex-1 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isBanning ? 'جاري التنفيذ...' : 'تأكيد الحظر فوراً'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedUserToBan(null)}
                      className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs cursor-pointer"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              </CustomModal>
            )}
          </div>
        )}

        {/* ================= TAB 9: ADMIN MEMBERS & RBAC (OWNER ONLY) ================= */}
        {activeAdminTab === 'admins' && isOwner && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-l from-amber-500/10 via-amber-500/5 to-transparent p-5 rounded-3xl border border-amber-500/30">
              <div>
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-600" />
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    فريق الإشراف والصلاحيات الموزعة (Role-Based Access Control)
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  بصفتك مالك النظام الرئيسي (Owner)، يمكنك تفويض المهام للمشرفين بدقة (إدارة الأرقام، مراجعة الطلبات، بنك الدم...) مع ضمان بقاء الصلاحيات السيادية محصورة لك وحدك.
                </p>
              </div>

              <button
                onClick={() => setIsAddAdminModalOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة مشرف جديد</span>
              </button>
            </div>

            {/* Admin Members List */}
            <div className="grid grid-cols-1 gap-4">
              {adminMembers.map(member => {
                const isMemberOwner = member.role === 'owner';
                return (
                  <div
                    key={member.id}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          {member.name}
                        </span>
                        {isMemberOwner ? (
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black flex items-center gap-1">
                            <Crown className="w-3 h-3" /> المالك الرئيسي
                          </span>
                        ) : (
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
                            مشرف مفوض
                          </span>
                        )}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          member.isActive
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {member.isActive ? 'نشط' : 'معطل'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 font-mono">{member.email}</p>

                      {/* Permissions Chips */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-3">
                        {PERMISSION_CONFIG.map(p => {
                          const hasIt = isMemberOwner || member.permissions?.includes(p.id);
                          return (
                            <span
                              key={p.id}
                              className={`text-[10px] px-2 py-0.5 rounded-lg font-bold transition-colors ${
                                hasIt
                                  ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50'
                                  : 'bg-slate-100 dark:bg-slate-800/40 text-slate-400 line-through opacity-40'
                              }`}
                              title={p.desc}
                            >
                              {p.label}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                      {isMemberOwner ? (
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-xl border border-amber-200/50">
                          صلاحيات سيادية كاملة
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() => setEditingAdminMember(member)}
                            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                          >
                            تعديل الصلاحيات
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm(`هل أنت متأكد من حذف المشرف ${member.name}؟`)) {
                                const ok = await deleteAdminMember(member.id);
                                if (ok) onSuccessToast('تم حذف المشرف من النظام بنجاح');
                              }
                            }}
                            className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                            title="حذف المشرف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal: Add New Moderator */}
            {isAddAdminModalOpen && (
              <CustomModal
                isOpen={isAddAdminModalOpen}
                onClose={() => setIsAddAdminModalOpen(false)}
                title="إضافة وتعيين مشرف جديد لمنصة شها ون"
                subtitle="حدد بريد المشرف المسجل وصلاحياته المحددة بدقة"
                icon={<ShieldCheck className="w-5 h-5 text-amber-600" />}
              >
                <form onSubmit={handleAddModeratorSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      اسم المشرف *
                    </label>
                    <input
                      type="text"
                      required
                      value={newAdminName}
                      onChange={(e) => setNewAdminName(e.target.value)}
                      placeholder="مثال: أ. محمد الشربيني"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      البريد الإلكتروني (Google Account) *
                    </label>
                    <input
                      type="email"
                      required
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      placeholder="user@gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      قوالب الأدوار الجاهزة (Custom Role Presets):
                    </label>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {ROLE_PRESETS.map(preset => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setNewAdminPermissions([...preset.permissions])}
                          className="px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[11px] font-bold hover:bg-amber-100 cursor-pointer"
                        >
                          {preset.label}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setNewAdminPermissions([])}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold hover:bg-slate-200 cursor-pointer"
                      >
                        مسح التحديد
                      </button>
                    </div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      تحديد الصلاحيات الممنوحة للمشرف ({newAdminPermissions.length} صلاحية):
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1">
                      {PERMISSION_CONFIG.filter(p => p.id !== 'manage_admins').map(p => {
                        const isChecked = newAdminPermissions.includes(p.id);
                        return (
                          <label
                            key={p.id}
                            className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-colors ${
                              isChecked
                                ? 'bg-blue-50/70 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800'
                                : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewAdminPermissions(prev => [...prev, p.id]);
                                } else {
                                  setNewAdminPermissions(prev => prev.filter(x => x !== p.id));
                                }
                              }}
                              className="mt-0.5 rounded text-blue-600"
                            />
                            <div>
                              <div className="text-xs font-bold text-slate-900 dark:text-white">{p.label}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">{p.desc}</div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer"
                    >
                      تأكيد وحفظ المشرف
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddAdminModalOpen(false)}
                      className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs cursor-pointer"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              </CustomModal>
            )}

            {/* Modal: Edit Existing Moderator Permissions */}
            {editingAdminMember && (
              <CustomModal
                isOpen={Boolean(editingAdminMember)}
                onClose={() => setEditingAdminMember(null)}
                title={`تعديل صلاحيات المشرف: ${editingAdminMember.name}`}
                subtitle={editingAdminMember.email}
                icon={<Edit className="w-5 h-5 text-blue-600" />}
              >
                <form onSubmit={handleUpdateModeratorSubmit} className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">حالة الحساب</span>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                      <input
                        type="checkbox"
                        checked={editingAdminMember.isActive}
                        onChange={(e) => setEditingAdminMember({ ...editingAdminMember, isActive: e.target.checked })}
                        className="rounded text-blue-600"
                      />
                      <span>{editingAdminMember.isActive ? 'حساب نشط' : 'حساب معطل مؤقتاً'}</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      الصلاحيات النشطة:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1">
                      {PERMISSION_CONFIG.filter(p => p.id !== 'manage_admins').map(p => {
                        const isChecked = editingAdminMember.permissions?.includes(p.id);
                        return (
                          <label
                            key={p.id}
                            className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-colors ${
                              isChecked
                                ? 'bg-blue-50/70 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800'
                                : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const currentPerms = editingAdminMember.permissions || [];
                                if (e.target.checked) {
                                  setEditingAdminMember({
                                    ...editingAdminMember,
                                    permissions: [...currentPerms, p.id]
                                  });
                                } else {
                                  setEditingAdminMember({
                                    ...editingAdminMember,
                                    permissions: currentPerms.filter(x => x !== p.id)
                                  });
                                }
                              }}
                              className="mt-0.5 rounded text-blue-600"
                            />
                            <div>
                              <div className="text-xs font-bold text-slate-900 dark:text-white">{p.label}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">{p.desc}</div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      تحديث الصلاحيات
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingAdminMember(null)}
                      className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs cursor-pointer"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              </CustomModal>
            )}
          </div>
        )}

        {/* ================= TAB: CLAIMS ================= */}
        {activeAdminTab === 'claims' && hasPermission('manage_claims') && (
          <ClaimsAdmin onSuccessToast={onSuccessToast} />
        )}

        {/* ================= TAB: SUGGESTIONS ================= */}
        {activeAdminTab === 'suggestions' && hasPermission('manage_suggestions') && (
          <CommunitySuggestionsAdmin onSuccessToast={onSuccessToast} />
        )}

        {/* ================= TAB: DATA QUALITY ================= */}
        {activeAdminTab === 'quality' && hasPermission('manage_quality') && (
          <DataQualityAdmin onSuccessToast={onSuccessToast} />
        )}

        {/* ================= TAB: CSV IMPORT ================= */}
        {activeAdminTab === 'import' && hasPermission('manage_import') && (
          <CSVDataImportAdmin onSuccessToast={onSuccessToast} />
        )}

        {/* ================= TAB: FEATURE FLAGS ================= */}
        {activeAdminTab === 'flags' && isOwner && (
          <FeatureFlagsAdmin onSuccessToast={onSuccessToast} />
        )}

        {/* ================= TAB 10: AUDIT LOGS ================= */}
        {activeAdminTab === 'audit' && (hasPermission('manage_audit') || hasPermission('manage_settings')) && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600" />
                <span>سجل العمليات الإدارية والمراجعات Audit Log</span>
              </h3>
              <button
                onClick={refreshAuditLogs}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-100 cursor-pointer"
                title="تحديث السجل"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
              {auditLogs.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {auditLogs.map(log => (
                    <div key={log.id} className="p-4 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-blue-600">{log.action}</span>
                          {log.target && <span className="text-slate-700 dark:text-slate-300 font-semibold">• {log.target}</span>}
                        </div>
                        {log.details && <p className="text-slate-500">{log.details}</p>}
                      </div>
                      <div className="text-left shrink-0 text-[11px] text-slate-400">
                        <span>{new Date(log.timestamp).toLocaleString('ar-EG')}</span>
                        <span className="block text-slate-500 font-bold">{log.adminUser}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="p-8 text-center text-xs text-slate-400">لا توجد سجلات بعد.</p>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 11: SETTINGS & SECURITY CENTER ================= */}
        {activeAdminTab === 'settings' && hasPermission('manage_settings') && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>مركز الأمان والمراقبة الحية (Security Operations)</span>
                </h3>
                <button
                  type="button"
                  onClick={() => void loadSecurityStatus()}
                  disabled={isLoadingSecurity}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSecurity ? 'animate-spin' : ''}`} />
                  <span>تحديث الفحص</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
                  <div className="font-black text-emerald-800 dark:text-emerald-300">حماية DDoS & Rate Limit</div>
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">
                    {securityStatus?.rateLimiting?.ddosGuard || '60 كتابة / 180 قراءة بالدقيقة لكل IP'}
                  </div>
                  <div className="text-[11px] font-bold mt-1.5">
                    المحظورين: {securityStatus?.metrics?.ddosBlockedCount ?? 0}
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
                  <div className="font-black text-blue-800 dark:text-blue-300">التشفير والجلسات</div>
                  <div className="text-[11px] text-blue-700 dark:text-blue-400 mt-1">
                    {securityStatus?.encryption?.passwordHashing || 'PBKDF2-SHA512 + HMAC-SHA256'}
                  </div>
                  <div className="text-[11px] font-bold mt-1.5">
                    الجلسات النشطة: {activeSessionsList.length}
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
                  <div className="font-black text-amber-800 dark:text-amber-300">محاولات الدخول الفاشلة</div>
                  <div className="text-[11px] text-amber-700 dark:text-amber-400 mt-1">
                    {securityStatus?.rateLimiting?.loginProtection || 'قفل 15 دقيقة بعد 5 محاولات'}
                  </div>
                  <div className="text-[11px] font-bold mt-1.5">
                    المسجّلة: {securityStatus?.metrics?.failedLoginCount ?? 0}
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900">
                  <div className="font-black text-purple-800 dark:text-purple-300">حماية CSRF & XSS & SQLi</div>
                  <div className="text-[11px] text-purple-700 dark:text-purple-400 mt-1">
                    {securityStatus?.protections?.csrf || 'Origin Allowlist + CSP + Schema Validation'}
                  </div>
                  <div className="text-[11px] font-bold mt-1.5">
                    سجلات المراجعة: {securityStatus?.metrics?.auditLogsCount ?? auditLogs.length}
                  </div>
                </div>
              </div>

              {activeSessionsList.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">
                      الجلسات والأجهزة النشطة ({activeSessionsList.length})
                    </h4>
                    {isOwner && (
                      <button
                        type="button"
                        onClick={() => void handleRevokeSession('all')}
                        className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
                      >
                        إنهاء جميع الجلسات
                      </button>
                    )}
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    {activeSessionsList.slice(0, 8).map(sess => (
                      <div key={sess.id} className="p-3 flex items-center justify-between gap-3 text-xs bg-slate-50/50 dark:bg-slate-800/30">
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">
                            {sess.name} <span className="text-[10px] font-mono text-slate-500">({sess.email})</span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            IP: <span className="font-mono">{sess.ip}</span> • {new Date(sess.createdAt).toLocaleString('ar-EG')}
                          </div>
                        </div>
                        {isOwner && (
                          <button
                            type="button"
                            onClick={() => void handleRevokeSession(sess.id)}
                            className="px-2.5 py-1 rounded-lg bg-red-100 text-red-700 text-[11px] font-bold hover:bg-red-200 cursor-pointer shrink-0"
                          >
                            إنهاء
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <span>مركز إشعارات الأخطاء التقنية ({errorLogs.length})</span>
                </h3>
                {errorLogs.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      clearErrorHistory();
                      setErrorLogs([]);
                      onSuccessToast('تم مسح سجل الأخطاء');
                    }}
                    className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
                  >
                    مسح السجل
                  </button>
                )}
              </div>
              {errorLogs.length === 0 ? (
                <p className="text-xs text-slate-500">لا توجد أخطاء مسجلة حالياً، جميع العمليات تعمل باستقرار.</p>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-xs">
                  {errorLogs.slice(0, 10).map(err => (
                    <div key={err.id} className="p-3 bg-red-50/30 dark:bg-red-950/10 flex items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-red-700 dark:text-red-300">{err.message}</div>
                        {err.context && <div className="text-[11px] font-mono text-slate-500 mt-0.5">{err.context}</div>}
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">{new Date(err.timestamp).toLocaleString('ar-EG')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-500" />
                <span>تغيير كلمة المرور الإدارية</span>
              </h3>

              {passError && (
                <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>{passError}</span>
                </div>
              )}
              {passSuccess && (
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{passSuccess}</span>
                </div>
              )}

              <form onSubmit={handleChangePasswordSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    كلمة المرور الحالية *
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    كلمة المرور الجديدة * (6 خانات على الأقل)
                  </label>
                  <input
                    type="password"
                    required
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    تأكيد كلمة المرور الجديدة *
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isChangingPass}
                  className="w-full py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isChangingPass ? 'جاري التحديث المشفر...' : 'تأكيد وحفظ كلمة المرور الجديدة'}
                </button>
              </form>
            </div>

            {/* Backup & Export Box */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-blue-600" />
                <span>تصدير البيانات والنسخ الاحتياطي للدليل</span>
              </h4>
              <p className="text-xs text-slate-500">
                يمكنك تحميل كامل قاعدة بيانات الدليل للاحتفاظ بها أو فتحها في برامج Excel.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleExportData('csv')}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all text-center cursor-pointer"
                >
                  تصدير CSV (Excel)
                </button>
                <button
                  onClick={() => handleExportData('json')}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all text-center cursor-pointer"
                >
                  تصدير نسخة JSON كاملة
                </button>
              </div>
            </div>

            {/* Sync to Firestore Cloud Box */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-emerald-600" />
                <span>مزامنة أقسام وخدمات شها الأساسية مع سحابة Firestore</span>
              </h4>
              <p className="text-xs text-slate-500">
                تقوم هذه العملية بحفظ كافة الأقسام الـ 15 وأرقام الطوارئ الرسمية والمؤسسات العامة المعتمدة في Firestore بشكل دائم ومترابط.
              </p>
              <button
                onClick={async () => {
                  const res = await syncSeedDataToFirestore();
                  if (res.success) {
                    onSuccessToast(`تمت مزامنة وحفظ ${res.count} عنصر أساسي في Firestore السحابية بنجاح!`);
                  } else {
                    onSuccessToast('تم تنفيذ المزامنة مع الحفاظ على البيانات الحالية');
                  }
                }}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>بدء مزامنة قاعدة البيانات السحابية</span>
              </button>
            </div>
          </div>
        )}
      </>
    )}

      </div>
    </div>
  );
};

// Copyright (c) 2026 MeDoAnDrOiD. All Rights Reserved.
