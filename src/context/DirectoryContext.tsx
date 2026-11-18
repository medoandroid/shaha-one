// DevMeDoAnDrOiD
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  collection,
  getDocs,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  increment,
  query,
  orderBy
} from 'firebase/firestore';
import { User, onAuthStateChanged } from 'firebase/auth';
import { db, auth, loginWithGoogle, completeGoogleRedirect, logoutUser, handleFirestoreError, OperationType } from '../lib/firebase';
import { apiUrl, fetchWithTimeout, scheduleIdleTask, stripUndefined, withTimeout } from '../lib/net';
import { isOwnerEmail } from '../lib/security';
import { offlineQueue } from '../lib/offlineQueue';
import { reportError } from '../lib/notify';
import { readCache, scheduleCacheWrite, removeCache } from '../utils/storage';
import {
  Category,
  Listing,
  BloodDonor,
  BloodRequest,
  ServiceRequest,
  Report,
  Review,
  CharityInitiative,
  EmergencyNumber,
  AuditRecord,
  AdminPermission,
  AdminMember,
  UserRecord,
  Advertisement,
  AdPlacement,
  VerificationBadge,
  HumanitarianRequest,
  HumanitarianStatus,
  VerificationAuditEntry,
  DonorEntry,
  AdminMessage,
  AdminMessageStatus,
  CommunityFacebookPage,
  ClaimListingRequest,
  CommunitySuggestion,
  FeatureFlagsConfig,
  VillageNews,
  PlatformCredit,
  EmergencyHospitalSchedule
} from '../types';

export interface AdminSession {
  token: string;
  email: string;
  name?: string;
  role?: 'owner' | 'super_admin' | 'admin' | 'moderator';
  permissions?: AdminPermission[];
  mustChangePassword?: boolean;
}

/** Result of a Google sign-in attempt, used by the header and admin modal. */
export interface GoogleSignInResult {
  user: User | null;
  isAdmin: boolean;
  /** True when the browser was redirected to Google (page will navigate). */
  redirected?: boolean;
}

interface DirectoryContextType {
  // Data
  categories: Category[];
  listings: Listing[];
  bloodDonors: BloodDonor[];
  bloodRequests: BloodRequest[];
  serviceRequests: ServiceRequest[];
  reports: Report[];
  reviews: Review[];
  charities: CharityInitiative[];
  emergencyNumbers: EmergencyNumber[];
  advertisements: Advertisement[];
  auditLogs: AuditRecord[];
  verificationBadges: VerificationBadge[];
  humanitarianRequests: HumanitarianRequest[];
  donors: DonorEntry[];
  communityPages: CommunityFacebookPage[];
  adminMessages: AdminMessage[];
  claims: ClaimListingRequest[];
  suggestions: CommunitySuggestion[];
  featureFlags: FeatureFlagsConfig;
  villageNews: VillageNews[];
  platformCredits: PlatformCredit[];
  mansouraSchedule: EmergencyHospitalSchedule[];

  // Users & RBAC
  users: UserRecord[];
  adminMembers: AdminMember[];
  userBanStatus: { isBanned: boolean; banReason?: string; bannedUntil?: string } | null;

  // Auth & Admin
  currentUser: User | null;
  adminSession: AdminSession | null;
  isAdmin: boolean;
  isOwner: boolean;
  canManageAds: boolean;
  hasPermission: (perm: AdminPermission) => boolean;
  isInitializing: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Actions
  signInWithGoogle: () => Promise<GoogleSignInResult>;
  signOut: () => Promise<void>;
  adminLogin: (password: string) => Promise<{ success: boolean; mustChangePassword?: boolean; error?: string }>;
  adminLogout: () => void;
  adminChangePassword: (currentPass: string, newPass: string) => Promise<{ success: boolean; error?: string }>;

  // Citizen Actions
  submitServiceRequest: (req: Omit<ServiceRequest, 'id' | 'status' | 'createdAt'>) => Promise<boolean>;
  submitReport: (report: Omit<Report, 'id' | 'status' | 'createdAt'>) => Promise<boolean>;
  submitReview: (review: Omit<Review, 'id' | 'createdAt' | 'status'>) => Promise<boolean>;
  registerBloodDonor: (donor: Omit<BloodDonor, 'id' | 'createdAt'>) => Promise<boolean>;
  submitBloodRequest: (request: Omit<BloodRequest, 'id' | 'status' | 'createdAt'>) => Promise<boolean>;
  submitHumanitarianRequest: (req: Omit<HumanitarianRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  recordListingCall: (listingId: string) => Promise<void>;
  recordListingView: (listingId: string) => Promise<void>;
  recordListingShare: (listingId: string) => Promise<void>;
  recordQrScan: (listingId: string) => Promise<void>;

  // Donors Directory Operations
  submitDonorEntry: (entry: Omit<DonorEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateDonorStatus: (id: string, status: 'available' | 'paused' | 'fulfilled') => Promise<boolean>;
  updateDonorEntry: (id: string, data: Partial<DonorEntry>) => Promise<boolean>;
  deleteDonorEntry: (id: string) => Promise<boolean>;

  // Admin & Owner Messaging Operations
  sendAdminMessage: (msg: Omit<AdminMessage, 'id' | 'createdAt' | 'status' | 'isRead'>) => Promise<boolean>;
  replyAdminMessage: (id: string, reply: string, status?: AdminMessageStatus) => Promise<boolean>;
  updateAdminMessageStatus: (id: string, status: AdminMessageStatus) => Promise<boolean>;
  markAdminMessageAsRead: (id: string) => Promise<boolean>;
  deleteAdminMessage: (id: string) => Promise<boolean>;

  // Community Facebook Pages Operations
  saveCommunityPage: (page: Partial<CommunityFacebookPage> & { id?: string }) => Promise<boolean>;
  deleteCommunityPage: (id: string) => Promise<boolean>;
  toggleVerifyCommunityPage: (id: string, badgeId?: string) => Promise<boolean>;

  // Claims & Ownership Operations
  submitListingClaim: (claim: Omit<ClaimListingRequest, 'id' | 'status' | 'createdAt'>) => Promise<boolean>;
  reviewListingClaim: (claimId: string, status: 'approved' | 'rejected', adminNotes?: string) => Promise<boolean>;

  // Community Suggestions & Voting
  submitCommunitySuggestion: (suggestion: Omit<CommunitySuggestion, 'id' | 'upvotes' | 'status' | 'createdAt'>) => Promise<boolean>;
  upvoteSuggestion: (suggestionId: string) => Promise<boolean>;
  reviewCommunitySuggestion: (suggestionId: string, status: 'approved' | 'implemented' | 'rejected') => Promise<boolean>;

  // Feature Flags
  updateFeatureFlags: (flags: Partial<FeatureFlagsConfig>) => Promise<boolean>;

  // Village News Operations
  saveVillageNews: (news: Partial<VillageNews> & { id?: string }) => Promise<boolean>;
  deleteVillageNews: (id: string) => Promise<boolean>;
  toggleNewsPin: (id: string, isPinned: boolean) => Promise<boolean>;

  // Platform Credits Operations
  savePlatformCredit: (credit: Partial<PlatformCredit> & { id?: string }) => Promise<boolean>;
  deletePlatformCredit: (id: string) => Promise<boolean>;

  // Mansoura Emergency Schedule Operations
  saveMansouraSchedule: (schedule: EmergencyHospitalSchedule) => Promise<boolean>;

  // Advertisement & Offers Operations
  saveAdvertisement: (ad: Partial<Advertisement> & { id?: string }) => Promise<boolean>;
  deleteAdvertisement: (adId: string) => Promise<boolean>;
  toggleAdvertisementStatus: (adId: string, isActive: boolean) => Promise<boolean>;
  toggleAdvertisementPin: (adId: string, isPinned: boolean) => Promise<boolean>;
  updateAdvertisementPriority: (adId: string, priority: number) => Promise<boolean>;
  recordAdView: (adId: string) => Promise<void>;
  recordAdClick: (adId: string) => Promise<void>;
  isAdActiveNow: (ad: Advertisement) => boolean;
  getOrderedAds: (placement?: AdPlacement | 'all', categoryId?: string, mode?: 'smart' | 'random' | 'pinned_first') => Advertisement[];

  // Dynamic Verification Badges Operations
  saveVerificationBadge: (badge: Partial<VerificationBadge> & { id?: string }) => Promise<boolean>;
  deleteVerificationBadge: (badgeId: string) => Promise<boolean>;
  assignBadgeToListing: (listingId: string, badgeId: string, reason?: string) => Promise<boolean>;
  removeBadgeFromListing: (listingId: string, badgeId: string) => Promise<boolean>;
  setPrimaryBadgeForListing: (listingId: string, badgeId: string) => Promise<boolean>;

  // Humanitarian Aid Operations
  updateHumanitarianStatus: (id: string, status: HumanitarianStatus, notes?: string) => Promise<boolean>;
  updateHumanitarianProgress: (id: string, amountRaised: number) => Promise<boolean>;
  deleteHumanitarianRequest: (id: string) => Promise<boolean>;

  // Reviews Moderation Operations
  moderateReview: (reviewId: string, status: 'approved' | 'rejected' | 'flagged', rejectionReason?: string) => Promise<boolean>;
  deleteReview: (reviewId: string) => Promise<boolean>;

  // Admin Operations
  approveServiceRequest: (request: ServiceRequest, modifiedData?: Partial<Listing>) => Promise<boolean>;
  rejectServiceRequest: (requestId: string) => Promise<boolean>;
  resolveReport: (reportId: string) => Promise<boolean>;
  dismissReport: (reportId: string) => Promise<boolean>;
  saveListing: (listing: Partial<Listing> & { id?: string }) => Promise<boolean>;
  updateListingProfile: (listingId: string, updates: Partial<Listing>) => Promise<boolean>;
  deleteListing: (listingId: string) => Promise<boolean>;
  bulkUpdateListings: (listingIds: string[], updates: Partial<Listing>) => Promise<boolean>;
  bulkDeleteListings: (listingIds: string[]) => Promise<boolean>;
  saveCategory: (category: Category) => Promise<boolean>;
  deleteCategory: (categoryId: string) => Promise<boolean>;
  saveEmergencyNumber: (emergency: EmergencyNumber) => Promise<boolean>;
  deleteEmergencyNumber: (emergencyId: string) => Promise<boolean>;
  saveCharity: (charity: CharityInitiative) => Promise<boolean>;
  deleteCharity: (charityId: string) => Promise<boolean>;
  saveBloodDonor: (donor: BloodDonor) => Promise<boolean>;
  deleteBloodDonor: (donorId: string) => Promise<boolean>;
  updateBloodRequestStatus: (requestId: string, status: 'urgent' | 'fulfilled' | 'closed') => Promise<boolean>;
  deleteBloodRequest: (requestId: string) => Promise<boolean>;
  logAdminAction: (action: string, target?: string, details?: string) => Promise<void>;
  refreshAuditLogs: () => Promise<void>;
  syncSeedDataToFirestore: () => Promise<{ success: boolean; count: number }>;

  // User Management & RBAC API
  fetchUsers: (search?: string, status?: string) => Promise<void>;
  banUser: (userId: string, email: string, reason: string, durationDays: number) => Promise<boolean>;
  unbanUser: (userId: string, email: string) => Promise<boolean>;
  fetchAdminMembers: () => Promise<void>;
  addAdminMember: (email: string, name: string, role: string, permissions: AdminPermission[]) => Promise<boolean>;
  updateAdminMember: (id: string, updates: Partial<AdminMember>) => Promise<boolean>;
  deleteAdminMember: (id: string) => Promise<boolean>;

  // PWA & Connectivity
  isOnline: boolean;
  isInstallable: boolean;
  installApp: () => Promise<void>;
}

const DirectoryContext = createContext<DirectoryContextType | null>(null);

export const DirectoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (typeof window !== 'undefined' && !localStorage.getItem('shaha_firebase_only_v1')) {
    [
      'shaha_listings_cache',
      'shaha_donors_cache',
      'shaha_aid_cache',
      'shaha_messages_cache',
      'shaha_news_cache',
      'shaha_charities_cache',
      'shaha_ads_cache',
      'shaha_pages_cache'
    ].forEach(k => removeCache(k));
    try {
      localStorage.setItem('shaha_firebase_only_v1', '1');
    } catch {
      // Ignore storage quota errors
    }
  }

  const [categories, setCategories] = useState<Category[]>(() =>
    readCache('shaha_categories_cache', [])
  );

  const [listings, setListings] = useState<Listing[]>(() =>
    readCache('shaha_listings_cache', [])
  );

  const [bloodDonors, setBloodDonors] = useState<BloodDonor[]>(() =>
    readCache('shaha_blood_donors_cache', [])
  );

  const [bloodRequests, setBloodRequests] = useState<BloodRequest[]>(() =>
    readCache('shaha_blood_requests_cache', [])
  );

  const [emergencyNumbers, setEmergencyNumbers] = useState<EmergencyNumber[]>(() =>
    readCache('shaha_emergency_cache', [])
  );

  const [charities, setCharities] = useState<CharityInitiative[]>(() =>
    readCache('shaha_charities_cache', [])
  );

  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>(() =>
    readCache('shaha_requests_cache', [])
  );

  const [reports, setReports] = useState<Report[]>(() =>
    readCache('shaha_reports_cache', [])
  );

  const [reviews, setReviews] = useState<Review[]>(() =>
    readCache('shaha_reviews_cache', [])
  );

  const [advertisements, setAdvertisements] = useState<Advertisement[]>(() =>
    readCache('shaha_ads_cache', [])
  );

  const [verificationBadges, setVerificationBadges] = useState<VerificationBadge[]>(() =>
    readCache('shaha_badges_cache', [])
  );

  const [humanitarianRequests, setHumanitarianRequests] = useState<HumanitarianRequest[]>(() =>
    readCache('shaha_aid_cache', [])
  );

  const [donors, setDonors] = useState<DonorEntry[]>(() =>
    readCache('shaha_donors_cache', [])
  );

  const [communityPages, setCommunityPages] = useState<CommunityFacebookPage[]>(() =>
    readCache('shaha_pages_cache', [])
  );

  const [adminMessages, setAdminMessages] = useState<AdminMessage[]>(() =>
    readCache('shaha_messages_cache', [])
  );

  const [claims, setClaims] = useState<ClaimListingRequest[]>(() =>
    readCache('shaha_claims_cache', [])
  );

  const [suggestions, setSuggestions] = useState<CommunitySuggestion[]>(() =>
    readCache('shaha_suggestions_cache', [])
  );

  const [featureFlags, setFeatureFlags] = useState<FeatureFlagsConfig>(() =>
    readCache('shaha_feature_flags', {
      enableClaims: true,
      enableReviews: true,
      enableCommunityVoting: true,
      enableDataQualityScanner: true,
      enableDirectMessaging: true,
      enableSmartNotifications: true,
      enableScheduledPublishing: true,
      enableCSVImport: true
    })
  );

  const [villageNews, setVillageNews] = useState<VillageNews[]>(() =>
    readCache('shaha_news_cache', [])
  );

  const [platformCredits, setPlatformCredits] = useState<PlatformCredit[]>(() =>
    readCache('shaha_platform_credits', [])
  );

  const [mansouraSchedule, setMansouraSchedule] = useState<EmergencyHospitalSchedule[]>(() =>
    readCache('shaha_mansoura_schedule', [])
  );

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [adminMembers, setAdminMembers] = useState<AdminMember[]>([]);
  const [userBanStatus, setUserBanStatus] = useState<{ isBanned: boolean; banReason?: string; bannedUntil?: string } | null>(null);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [adminSession, setAdminSession] = useState<AdminSession | null>(() => {
    const saved = localStorage.getItem('shaha_admin_token');
    if (!saved) return null;
    const email = localStorage.getItem('shaha_admin_email') || 'admin@shaha-directory.eg';
    const meta = readCache<Partial<AdminSession>>('shaha_admin_meta', {});
    return {
      token: saved,
      email,
      name: meta.name,
      role: meta.role,
      permissions: meta.permissions,
      mustChangePassword: meta.mustChangePassword
    };
  });

  const [verifiedOwnerEmail, setVerifiedOwnerEmail] = useState(false);

  useEffect(() => {
    let active = true;
    const email = currentUser?.email || adminSession?.email;
    if (!email) {
      setVerifiedOwnerEmail(false);
      return;
    }
    void isOwnerEmail(email).then(ok => {
      if (active) setVerifiedOwnerEmail(ok);
    });
    return () => {
      active = false;
    };
  }, [currentUser?.email, adminSession?.email]);

  const isOwner = Boolean(adminSession?.role === 'owner' || verifiedOwnerEmail);

  const hasPermission = useCallback(
    (perm: AdminPermission): boolean => {
      if (isOwner || adminSession?.role === 'super_admin') return true;
      return adminSession?.permissions?.includes(perm) ?? false;
    },
    [isOwner, adminSession?.role, adminSession?.permissions]
  );

  const canManageAds = hasPermission('manage_ads');

  const isAdmin = Boolean(adminSession?.token || verifiedOwnerEmail);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('shaha_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const [isInitializing, setIsInitializing] = useState(true);
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? window.navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // PWA Install Prompt Listener
  useEffect(() => {
    const handlePrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handlePrompt);
    window.addEventListener('appinstalled', () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;
    try {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice?.outcome === 'accepted') {
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    } catch {
      // ignore
    }
  };

  // Synchronize dark theme class and data-theme on document element and body
  useEffect(() => {
    const root = document.documentElement;
    const isDark = theme === 'dark';
    if (isDark) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
      document.body?.classList.add('dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
      document.body?.classList.remove('dark');
    }
    localStorage.setItem('shaha_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      const nextTheme = prev === 'light' ? 'dark' : 'light';
      const root = document.documentElement;
      if (nextTheme === 'dark') {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
        root.style.colorScheme = 'dark';
        document.body?.classList.add('dark');
      } else {
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
        root.style.colorScheme = 'light';
        document.body?.classList.remove('dark');
      }
      localStorage.setItem('shaha_theme', nextTheme);
      return nextTheme;
    });
  };

  // Verify an admin/moderator Google account with the server and persist the session.
  const verifyAdminAccess = async (user: User): Promise<boolean> => {
    try {
      const idToken = await withTimeout(user.getIdToken(), 8000);
      if (!idToken) return false;

      const resp = await fetchWithTimeout(apiUrl('/api/admin/google-verify'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Firebase-Id-Token': idToken
        }
      }, 8000);

      if (!resp.ok) return false;
      const data = await resp.json();
      if (!data?.token) return false;

      const nextSession: AdminSession = {
        token: data.token,
        email: user.email || '',
        name: data.admin?.name,
        role: data.admin?.role,
        permissions: data.admin?.permissions,
        mustChangePassword: false
      };
      setAdminSession(nextSession);
      localStorage.setItem('shaha_admin_token', data.token);
      localStorage.setItem('shaha_admin_email', user.email || '');
      scheduleCacheWrite('shaha_admin_meta', {
        name: nextSession.name,
        role: nextSession.role,
        permissions: nextSession.permissions,
        mustChangePassword: false
      }, 0);
      return true;
    } catch {
      return false;
    }
  };

  // Monitor Firebase Auth State & Sync with server.
  // Server enrichment runs in the background with timeouts, so a slow API
  // never leaves the interface waiting or frozen.
  useEffect(() => {
    void completeGoogleRedirect();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsInitializing(false);

      if (!user?.email) {
        setUserBanStatus(null);
        return;
      }

      void (async () => {
        const syncWork = (async () => {
          try {
            const idToken = await withTimeout(user.getIdToken(), 8000).catch(() => '');
            if (!idToken) return;

            const syncRes = await fetchWithTimeout(apiUrl('/api/users/sync'), {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Firebase-Id-Token': idToken
              },
              body: JSON.stringify({
                displayName: user.displayName || '',
                photoURL: user.photoURL || ''
              })
            }, 8000);
            const syncData = await syncRes.json().catch(() => null);

            if (syncRes.ok && syncData?.user) {
              setUserBanStatus({
                isBanned: Boolean(syncData.user.isBanned),
                banReason: syncData.user.banReason,
                bannedUntil: syncData.user.bannedUntil
              });
            } else if (syncRes.status === 403 && syncData?.isBanned) {
              setUserBanStatus({
                isBanned: true,
                banReason: syncData.banReason,
                bannedUntil: syncData.bannedUntil
              });
            }
          } catch (err) {
            console.warn('User sync error', err);
          }
        })();

        await Promise.allSettled([syncWork, verifyAdminAccess(user)]);
      })();
    });

    return () => unsubscribe();
  }, []);

  // Validate admin token on startup and fetch permissions
  useEffect(() => {
    if (adminSession?.token) {
      fetchWithTimeout(apiUrl('/api/admin/session'), {
        headers: { Authorization: `Bearer ${adminSession.token}` }
      }, 8000)
        .then(res => res.json())
        .then(data => {
          if (!data.valid) {
            setAdminSession(null);
            localStorage.removeItem('shaha_admin_token');
            localStorage.removeItem('shaha_admin_email');
            removeCache('shaha_admin_meta');
          } else {
            setAdminSession(prev => {
              if (!prev) return null;
              const updated: AdminSession = {
                ...prev,
                role: data.role,
                name: data.name,
                permissions: data.permissions,
                mustChangePassword: data.mustChangePassword
              };
              scheduleCacheWrite('shaha_admin_meta', {
                name: updated.name,
                role: updated.role,
                permissions: updated.permissions,
                mustChangePassword: updated.mustChangePassword
              }, 0);
              return updated;
            });
          }
        })
        .catch(() => {
          // Keep cached state
        });
    }
  }, [adminSession?.token]);

  useEffect(() => {
    return scheduleIdleTask(() => {
      fetch(apiUrl('/api/listings'))
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.listings) && data.listings.length > 0) {
            setListings(prev => {
              const map = new Map<string, Listing>();
              prev.forEach(l => map.set(l.id, l));
              data.listings.forEach((srv: Listing) => {
                const cur = map.get(srv.id);
                if (!cur || new Date(srv.updatedAt || 0).getTime() >= new Date(cur.updatedAt || 0).getTime()) {
                  map.set(srv.id, { ...cur, ...srv });
                }
              });
              const merged = Array.from(map.values());
              scheduleCacheWrite('shaha_listings_cache', merged);
              return merged;
            });
          }
        })
        .catch(() => {
          // server fetch optional
        });

      fetch(apiUrl('/api/community-pages'))
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.pages) && data.pages.length > 0) {
            setCommunityPages(prev => {
              const map = new Map<string, CommunityFacebookPage>();
              prev.forEach(p => map.set(p.id, p));
              data.pages.forEach((srv: CommunityFacebookPage) => {
                const cur = map.get(srv.id);
                if (!cur || new Date(srv.updatedAt || 0).getTime() >= new Date(cur.updatedAt || 0).getTime()) {
                  map.set(srv.id, { ...cur, ...srv });
                }
              });
              const merged = Array.from(map.values()).sort((a, b) => (a.order || 0) - (b.order || 0));
              scheduleCacheWrite('shaha_pages_cache', merged);
              return merged;
            });
          }
        })
        .catch(() => {
          // server fetch optional
        });
    }, 400);
  }, []);

  useEffect(() => {
    let stopTier1: (() => void) | undefined;
    let isDisposed = false;

    const loadReferenceCollections = async () => {
      try {
        const [catSnap, emSnap] = await Promise.all([
          getDocs(collection(db, 'categories')),
          getDocs(collection(db, 'emergency_numbers'))
        ]);
        if (isDisposed) return;

        if (!catSnap.empty) {
          const list: Category[] = [];
          catSnap.forEach(docSnap => {
            list.push({ ...docSnap.data(), id: docSnap.id } as Category);
          });
          list.sort((a, b) => a.order - b.order);
          setCategories(list);
          scheduleCacheWrite('shaha_categories_cache', list);
        } else {
          const { INITIAL_CATEGORIES } = await import('../data/initialData');
          if (!isDisposed) setCategories(INITIAL_CATEGORIES);
        }

        if (!emSnap.empty) {
          const list: EmergencyNumber[] = [];
          emSnap.forEach(docSnap => {
            list.push({ ...docSnap.data(), id: docSnap.id } as EmergencyNumber);
          });
          list.sort((a, b) => a.order - b.order);
          setEmergencyNumbers(list);
          scheduleCacheWrite('shaha_emergency_cache', list);
        } else {
          const { INITIAL_EMERGENCY_NUMBERS } = await import('../data/initialData');
          if (!isDisposed) setEmergencyNumbers(INITIAL_EMERGENCY_NUMBERS);
        }
      } catch (err) {
        console.warn('Reference collections fetch notice:', err instanceof Error ? err.message : err);
      }
    };

    const startTier1Sync = () => {
      void loadReferenceCollections();

      if (!isAdmin) {
        const lastSync = Number(localStorage.getItem('shaha_tier1_sync_ts') || '0');
        const hasCached = listings.length > 0 && Date.now() - lastSync < 180000;
        if (hasCached) return;

        void Promise.all([
          getDocs(collection(db, 'listings')).catch(() => null),
          getDocs(collection(db, 'advertisements')).catch(() => null),
          getDocs(collection(db, 'village_news')).catch(() => null),
          getDocs(collection(db, 'community_facebook_pages')).catch(() => null)
        ]).then(([listSnap, adsSnap, newsSnap, pagesSnap]) => {
          if (isDisposed) return;

          if (listSnap) {
            const list: Listing[] = [];
            listSnap.forEach(docSnap => {
              list.push({ ...docSnap.data(), id: docSnap.id } as Listing);
            });
            setListings(prev => {
              const map = new Map<string, Listing>();
              prev.forEach(item => map.set(item.id, item));
              list.forEach(item => map.set(item.id, item));
              const merged = Array.from(map.values());
              scheduleCacheWrite('shaha_listings_cache', merged);
              return merged;
            });
          }

          if (adsSnap) {
            const list: Advertisement[] = [];
            adsSnap.forEach(docSnap => {
              list.push({ ...docSnap.data(), id: docSnap.id } as Advertisement);
            });
            list.sort((a, b) => (b.priority || 0) - (a.priority || 0));
            setAdvertisements(list);
            scheduleCacheWrite('shaha_ads_cache', list);
          }

          if (newsSnap) {
            const list: VillageNews[] = [];
            newsSnap.forEach(docSnap => {
              list.push({ ...docSnap.data(), id: docSnap.id } as VillageNews);
            });
            list.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
            setVillageNews(list);
            scheduleCacheWrite('shaha_news_cache', list);
          }

          if (pagesSnap && !pagesSnap.empty) {
            const list: CommunityFacebookPage[] = [];
            pagesSnap.forEach(docSnap => {
              list.push({ ...docSnap.data(), id: docSnap.id } as CommunityFacebookPage);
            });
            setCommunityPages(prev => {
              const map = new Map<string, CommunityFacebookPage>();
              prev.forEach(item => map.set(item.id, item));
              list.forEach(item => map.set(item.id, item));
              const merged = Array.from(map.values()).sort((a, b) => (a.order || 0) - (b.order || 0));
              scheduleCacheWrite('shaha_pages_cache', merged);
              return merged;
            });
          }

          try {
            localStorage.setItem('shaha_tier1_sync_ts', String(Date.now()));
          } catch {}
        });
        return;
      }

      const unsubListings = onSnapshot(
        collection(db, 'listings'),
        (snapshot) => {
          const list: Listing[] = [];
          snapshot.forEach(docSnap => {
            list.push({ ...docSnap.data(), id: docSnap.id } as Listing);
          });
          setListings(list);
          scheduleCacheWrite('shaha_listings_cache', list);
        },
        (error) => {
          console.warn('Firestore listings listener notice:', error.message);
        }
      );

      const unsubAds = onSnapshot(
        collection(db, 'advertisements'),
        (snapshot) => {
          const list: Advertisement[] = [];
          snapshot.forEach(docSnap => {
            list.push({ ...docSnap.data(), id: docSnap.id } as Advertisement);
          });
          list.sort((a, b) => (b.priority || 0) - (a.priority || 0));
          setAdvertisements(list);
          scheduleCacheWrite('shaha_ads_cache', list);
        },
        (error) => {
          console.warn('Firestore advertisements listener notice:', error.message);
        }
      );

      const unsubNews = onSnapshot(
        collection(db, 'village_news'),
        (snapshot) => {
          const list: VillageNews[] = [];
          snapshot.forEach(docSnap => {
            list.push({ ...docSnap.data(), id: docSnap.id } as VillageNews);
          });
          list.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
          setVillageNews(list);
          scheduleCacheWrite('shaha_news_cache', list);
        },
        (error) => {
          console.warn('Firestore village_news listener notice:', error.message);
        }
      );

      const unsubCommunityPages = onSnapshot(
        collection(db, 'community_facebook_pages'),
        (snapshot) => {
          if (snapshot.empty) return;
          const list: CommunityFacebookPage[] = [];
          snapshot.forEach(docSnap => {
            list.push({ ...docSnap.data(), id: docSnap.id } as CommunityFacebookPage);
          });
          setCommunityPages(prev => {
            const map = new Map<string, CommunityFacebookPage>();
            prev.forEach(item => map.set(item.id, item));
            list.forEach(item => {
              const cur = map.get(item.id);
              if (!cur || new Date(item.updatedAt || 0).getTime() >= new Date(cur.updatedAt || 0).getTime()) {
                map.set(item.id, item);
              }
            });
            const merged = Array.from(map.values()).sort((a, b) => (a.order || 0) - (b.order || 0));
            scheduleCacheWrite('shaha_pages_cache', merged);
            return merged;
          });
        },
        (error) => {
          console.warn('Firestore community_facebook_pages listener notice:', error.message);
        }
      );

      stopTier1 = () => {
        unsubListings();
        unsubAds();
        unsubNews();
        unsubCommunityPages();
      };
    };

    const startTier2Fetch = async () => {
      try {
        const [
          donorsSnap,
          bloodReqSnap,
          charitiesSnap,
          reviewsSnap,
          badgesSnap,
          aidSnap,
          donorsDirSnap,
          suggestionsSnap,
          creditsSnap,
          mansouraSnap
        ] = await Promise.all([
          getDocs(collection(db, 'blood_donors')).catch(() => null),
          getDocs(collection(db, 'blood_requests')).catch(() => null),
          getDocs(collection(db, 'charity_initiatives')).catch(() => null),
          getDocs(collection(db, 'reviews')).catch(() => null),
          getDocs(collection(db, 'verification_badges')).catch(() => null),
          getDocs(collection(db, 'humanitarian_requests')).catch(() => null),
          getDocs(collection(db, 'donors_directory')).catch(() => null),
          getDocs(collection(db, 'suggestions')).catch(() => null),
          getDocs(collection(db, 'platform_credits')).catch(() => null),
          getDocs(collection(db, 'mansoura_schedule')).catch(() => null)
        ]);
        if (isDisposed) return;

        if (donorsSnap) {
          const list: BloodDonor[] = [];
          donorsSnap.forEach(d => list.push({ ...d.data(), id: d.id } as BloodDonor));
          setBloodDonors(list);
          scheduleCacheWrite('shaha_blood_donors_cache', list);
        }

        if (bloodReqSnap) {
          const list: BloodRequest[] = [];
          bloodReqSnap.forEach(d => list.push({ ...d.data(), id: d.id } as BloodRequest));
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setBloodRequests(list);
          scheduleCacheWrite('shaha_blood_requests_cache', list);
        }

        if (charitiesSnap) {
          const list: CharityInitiative[] = [];
          charitiesSnap.forEach(d => list.push({ ...d.data(), id: d.id } as CharityInitiative));
          setCharities(list);
          scheduleCacheWrite('shaha_charities_cache', list);
        }

        if (reviewsSnap) {
          const list: Review[] = [];
          reviewsSnap.forEach(d => list.push({ ...d.data(), id: d.id } as Review));
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setReviews(list);
          scheduleCacheWrite('shaha_reviews_cache', list);
        }

        if (badgesSnap && !badgesSnap.empty) {
          const list: VerificationBadge[] = [];
          badgesSnap.forEach(d => list.push({ ...d.data(), id: d.id } as VerificationBadge));
          list.sort((a, b) => (b.priority || 0) - (a.priority || 0));
          setVerificationBadges(list);
          scheduleCacheWrite('shaha_badges_cache', list);
        } else if (badgesSnap?.empty) {
          const { INITIAL_VERIFICATION_BADGES } = await import('../data/initialData');
          if (!isDisposed) setVerificationBadges(INITIAL_VERIFICATION_BADGES);
        }

        if (aidSnap) {
          const list: HumanitarianRequest[] = [];
          aidSnap.forEach(d => list.push({ ...d.data(), id: d.id } as HumanitarianRequest));
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setHumanitarianRequests(list);
          scheduleCacheWrite('shaha_aid_cache', list);
        }

        if (donorsDirSnap) {
          const list: DonorEntry[] = [];
          donorsDirSnap.forEach(d => list.push({ ...d.data(), id: d.id } as DonorEntry));
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setDonors(list);
          scheduleCacheWrite('shaha_donors_cache', list);
        }

        if (suggestionsSnap) {
          const list: CommunitySuggestion[] = [];
          suggestionsSnap.forEach(d => list.push({ ...d.data(), id: d.id } as CommunitySuggestion));
          list.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
          setSuggestions(list);
          scheduleCacheWrite('shaha_suggestions_cache', list);
        }

        if (creditsSnap && !creditsSnap.empty) {
          const list: PlatformCredit[] = [];
          creditsSnap.forEach(d => list.push({ ...d.data(), id: d.id } as PlatformCredit));
          list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
          setPlatformCredits(list);
          scheduleCacheWrite('shaha_platform_credits', list);
        } else if (creditsSnap?.empty) {
          const { INITIAL_PLATFORM_CREDITS } = await import('../data/initialData');
          if (!isDisposed) setPlatformCredits(INITIAL_PLATFORM_CREDITS);
        }

        if (mansouraSnap && !mansouraSnap.empty) {
          const list: EmergencyHospitalSchedule[] = [];
          mansouraSnap.forEach(d => list.push({ ...d.data(), id: d.id } as EmergencyHospitalSchedule));
          setMansouraSchedule(list);
          scheduleCacheWrite('shaha_mansoura_schedule', list);
        } else if (mansouraSnap?.empty) {
          const { INITIAL_MANSOURA_SCHEDULE } = await import('../data/initialData');
          if (!isDisposed) setMansouraSchedule(INITIAL_MANSOURA_SCHEDULE);
        }
      } catch (err) {
        console.warn('Tier 2 Firestore sync notice:', err instanceof Error ? err.message : err);
      }
    };

    const rafId = window.requestAnimationFrame(startTier1Sync);
    const cancelTier2 = scheduleIdleTask(() => {
      void startTier2Fetch();
    }, 900);
    return () => {
      isDisposed = true;
      window.cancelAnimationFrame(rafId);
      cancelTier2();
      stopTier1?.();
    };
  }, [isAdmin]);

  // Admin listeners for service_requests, reports, and admin_messages when admin is logged in
  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    const unsubRequests = onSnapshot(
      collection(db, 'service_requests'),
      (snapshot) => {
        const list: ServiceRequest[] = [];
        snapshot.forEach(docSnap => {
          list.push({ ...docSnap.data(), id: docSnap.id } as ServiceRequest);
        });
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setServiceRequests(list);
        localStorage.setItem('shaha_requests_cache', JSON.stringify(list));
      },
      (error) => {
        // Only log if not permission error during logout
        console.warn('Service requests listener:', error.message);
      }
    );

    const unsubReports = onSnapshot(
      collection(db, 'reports'),
      (snapshot) => {
        const list: Report[] = [];
        snapshot.forEach(docSnap => {
          list.push({ ...docSnap.data(), id: docSnap.id } as Report);
        });
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setReports(list);
        localStorage.setItem('shaha_reports_cache', JSON.stringify(list));
      },
      (error) => {
        console.warn('Reports listener:', error.message);
      }
    );

    const unsubMessages = onSnapshot(
      collection(db, 'admin_messages'),
      (snapshot) => {
        const list: AdminMessage[] = [];
        snapshot.forEach(docSnap => {
          list.push({ ...docSnap.data(), id: docSnap.id } as AdminMessage);
        });
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setAdminMessages(list);
        localStorage.setItem('shaha_messages_cache', JSON.stringify(list));
      },
      (error) => {
        console.warn('Admin messages listener:', error.message);
      }
    );

    const unsubClaims = onSnapshot(
      collection(db, 'claims'),
      (snapshot) => {
        const list: ClaimListingRequest[] = [];
        snapshot.forEach(docSnap => {
          list.push({ ...docSnap.data(), id: docSnap.id } as ClaimListingRequest);
        });
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setClaims(list);
        localStorage.setItem('shaha_claims_cache', JSON.stringify(list));
      },
      (error) => {
        console.warn('Claims listener:', error.message);
      }
    );

    return () => {
      unsubRequests();
      unsubReports();
      unsubMessages();
      unsubClaims();
    };
  }, [adminSession, currentUser]);

  // Load audit logs
  const refreshAuditLogs = async () => {
    if (!adminSession?.token) return;
    try {
      const res = await fetch(apiUrl('/api/admin/audit-logs'), {
        headers: { Authorization: `Bearer ${adminSession.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Failed to load audit logs', err);
    }
  };

  useEffect(() => {
    if (adminSession?.token) {
      refreshAuditLogs();
    }
  }, [adminSession?.token]);

  const logAdminAction = async (action: string, target?: string, details?: string) => {
    if (!adminSession?.token) return;
    try {
      await fetch(apiUrl('/api/admin/log-action'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminSession.token}`
        },
        body: JSON.stringify({ action, target, details })
      });
      refreshAuditLogs();
    } catch {
      // ignore
    }
  };

  // Auth Functions
  const signInWithGoogleAction = async (): Promise<GoogleSignInResult> => {
    const user = await loginWithGoogle();
    if (!user) {
      // A redirect was started; the page reloads and onAuthStateChanged finishes the flow.
      return { user: null, isAdmin: false, redirected: true };
    }
    const isAdmin = await verifyAdminAccess(user);
    return { user, isAdmin };
  };

  const signOutAction = async () => {
    const currentEmail = currentUser?.email?.toLowerCase().trim();
    await logoutUser();
    setUserBanStatus(null);
    if (currentEmail && adminSession?.email?.toLowerCase().trim() === currentEmail) {
      setAdminSession(null);
      localStorage.removeItem('shaha_admin_token');
      localStorage.removeItem('shaha_admin_email');
      removeCache('shaha_admin_meta');
    }
  };

  const adminLogin = async (password: string) => {
    try {
      const res = await fetchWithTimeout(apiUrl('/api/admin/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      }, 12000);
      const data = await res.json().catch(() => ({} as {
        error?: string;
        token?: string;
        admin?: { email?: string; name?: string; role?: AdminSession['role']; permissions?: AdminPermission[] };
        mustChangePassword?: boolean;
      }));
      if (!res.ok) {
        return { success: false, error: data.error || 'فشل تسجيل الدخول' };
      }
      if (!data.token) {
        return { success: false, error: 'استجابة غير متوقعة من الخادم. حاول مرة أخرى.' };
      }
      const nextSession: AdminSession = {
        token: data.token,
        email: data.admin?.email || 'admin@shaha-directory.eg',
        name: data.admin?.name,
        role: data.admin?.role || 'super_admin',
        permissions: data.admin?.permissions,
        mustChangePassword: data.mustChangePassword
      };
      setAdminSession(nextSession);
      localStorage.setItem('shaha_admin_token', data.token);
      localStorage.setItem('shaha_admin_email', nextSession.email);
      scheduleCacheWrite('shaha_admin_meta', {
        name: nextSession.name,
        role: nextSession.role,
        permissions: nextSession.permissions,
        mustChangePassword: nextSession.mustChangePassword
      }, 0);
      return { success: true, mustChangePassword: data.mustChangePassword };
    } catch {
      return { success: false, error: 'تعذر الاتصال بخادم الإدارة. تحقق من الشبكة وحاول مجدداً.' };
    }
  };

  const adminLogout = () => {
    setAdminSession(null);
    localStorage.removeItem('shaha_admin_token');
    localStorage.removeItem('shaha_admin_email');
    removeCache('shaha_admin_meta');
  };

  const adminChangePassword = async (currentPassword: string, newPassword: string) => {
    if (!adminSession?.token) return { success: false, error: 'غير مسجل كمسؤول' };
    try {
      const res = await fetch(apiUrl('/api/admin/change-password'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminSession.token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'تعذر تغيير كلمة المرور' };
      }
      setAdminSession(prev => prev ? { ...prev, mustChangePassword: false } : null);
      return { success: true };
    } catch (err) {
      return { success: false, error: 'حدث خطأ بالاتصال أثناء تحديث كلمة المرور' };
    }
  };

  // Citizen Actions
  const submitServiceRequest = async (req: Omit<ServiceRequest, 'id' | 'status' | 'createdAt'>) => {
    if (userBanStatus?.isBanned) {
      alert(`عذراً، تم حظر هذا الحساب من إرسال طلبات الإضافة بسبب: ${userBanStatus.banReason || 'مخالفة الشروط'}`);
      return false;
    }

    const id = 'req_' + Date.now();
    const newRequest: ServiceRequest = {
      ...req,
      id,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    const cleanRequest = stripUndefined(newRequest as unknown as Record<string, unknown>);
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      offlineQueue.enqueue('SUBMIT_SERVICE_REQUEST', cleanRequest, id);
      setServiceRequests(prev => [newRequest, ...prev]);
      return true;
    }

    try {
      await setDoc(doc(db, 'service_requests', id), cleanRequest);
      setServiceRequests(prev => [newRequest, ...prev]);
      return true;
    } catch (error) {
      offlineQueue.enqueue('SUBMIT_SERVICE_REQUEST', cleanRequest, id);
      reportError('تم حفظ الطلب محلياً وستتم مزامنته تلقائياً فور عودة الاتصال.', error instanceof Error ? error.message : String(error));
      setServiceRequests(prev => [newRequest, ...prev]);
      return true;
    }
  };

  useEffect(() => {
    const handler = (ev: Event) => {
      const op = (ev as CustomEvent<{ actionType: string; payload: any }>).detail;
      if (!op) return;
      if (op.actionType === 'SUBMIT_SERVICE_REQUEST' && op.payload?.id) {
        void setDoc(doc(db, 'service_requests', op.payload.id), stripUndefined(op.payload)).catch(() => {});
      }
    };
    window.addEventListener('shaha_process_queued_op', handler);
    return () => window.removeEventListener('shaha_process_queued_op', handler);
  }, []);

  const submitReport = async (rep: Omit<Report, 'id' | 'status' | 'createdAt'>) => {
    const id = 'rep_' + Date.now();
    const newReport: Report = {
      ...rep,
      id,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'reports', id), newReport);
      setReports(prev => [newReport, ...prev]);
      return true;
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.CREATE, `reports/${id}`);
      } catch {
        const current = JSON.parse(localStorage.getItem('shaha_reports_cache') || '[]');
        current.unshift(newReport);
        localStorage.setItem('shaha_reports_cache', JSON.stringify(current));
        setReports(current);
        return true;
      }
      return false;
    }
  };

  const submitReview = async (rev: Omit<Review, 'id' | 'createdAt' | 'status'>) => {
    if (userBanStatus?.isBanned) {
      alert(`عذراً، هذا الحساب محظور من إضافة تقييمات بسبب: ${userBanStatus.banReason || 'مخالفة الشروط'}`);
      return false;
    }

    // Anti-spam rate limiting: 3 minutes between reviews for the same listing
    const lastSubKey = `shaha_last_rev_${rev.listingId}`;
    const lastSubTime = localStorage.getItem(lastSubKey);
    if (lastSubTime && Date.now() - Number(lastSubTime) < 180000 && !isAdmin) {
      alert('لقد قمت بإضافة تقييم مؤخراً لهذه الخدمة. يُرجى الانتظار قليلاً لمنع التكرار.');
      return false;
    }

    const id = 'rev_' + Date.now();
    const isAutoApproved = isAdmin || isOwner;
    const newReview: Review = {
      ...rev,
      id,
      status: isAutoApproved ? 'approved' : 'pending',
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'reviews', id), newReview);
      setReviews(prev => [newReview, ...prev]);
      localStorage.setItem(lastSubKey, Date.now().toString());

      // If approved, update listing average rating optimistically
      if (newReview.status === 'approved') {
        const listing = listings.find(l => l.id === rev.listingId);
        if (listing) {
          const count = (listing.ratingsCount || 0) + 1;
          const currentAvg = listing.rating || 5;
          const newAvg = Number(((currentAvg * (count - 1) + rev.rating) / count).toFixed(1));
          const updated = { ...listing, rating: newAvg, ratingsCount: count };
          setListings(prev => prev.map(l => l.id === listing.id ? updated : l));
          updateDoc(doc(db, 'listings', listing.id), {
            rating: newAvg,
            ratingsCount: count
          }).catch(() => {});
        }
      }
      return true;
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.CREATE, `reviews/${id}`);
      } catch {
        const current = JSON.parse(localStorage.getItem('shaha_reviews_cache') || '[]');
        current.unshift(newReview);
        localStorage.setItem('shaha_reviews_cache', JSON.stringify(current));
        setReviews(current);
        return true;
      }
      return false;
    }
  };

  const moderateReview = async (reviewId: string, status: 'approved' | 'rejected' | 'flagged', rejectionReason?: string): Promise<boolean> => {
    try {
      await updateDoc(doc(db, 'reviews', reviewId), {
        status,
        rejectionReason: rejectionReason || '',
        moderatedBy: adminSession?.email || currentUser?.email || 'admin',
        moderatedAt: new Date().toISOString()
      });
    } catch {
      // fallback
    }

    setReviews(prev => prev.map(r => r.id === reviewId ? {
      ...r,
      status,
      rejectionReason,
      moderatedBy: (adminSession?.email || currentUser?.email) ?? undefined,
      moderatedAt: new Date().toISOString()
    } : r));

    // Recalculate listing rating if approved
    const review = reviews.find(r => r.id === reviewId);
    if (review && status === 'approved') {
      const listing = listings.find(l => l.id === review.listingId);
      if (listing) {
        const count = (listing.ratingsCount || 0) + 1;
        const currentAvg = listing.rating || 5;
        const newAvg = Number(((currentAvg * (count - 1) + review.rating) / count).toFixed(1));
        const updated = { ...listing, rating: newAvg, ratingsCount: count };
        setListings(prev => prev.map(l => l.id === listing.id ? updated : l));
        updateDoc(doc(db, 'listings', listing.id), { rating: newAvg, ratingsCount: count }).catch(() => {});
      }
    }

    logAdminAction('MODERATE_REVIEW', reviewId, `تحديث حالة التقييم إلى ${status}${rejectionReason ? ` (السبب: ${rejectionReason})` : ''}`);
    return true;
  };

  const deleteReview = async (reviewId: string): Promise<boolean> => {
    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
    } catch {}
    setReviews(prev => prev.filter(r => r.id !== reviewId));
    logAdminAction('DELETE_REVIEW', reviewId, 'تم حذف التقييم نهائياً');
    return true;
  };

  const registerBloodDonor = async (donor: Omit<BloodDonor, 'id' | 'createdAt'>) => {
    if (userBanStatus?.isBanned) {
      alert(`عذراً، هذا الحساب محظور حالياً بسبب: ${userBanStatus.banReason || 'مخالفة الشروط'}`);
      return false;
    }

    const id = 'donor_' + Date.now();
    const newDonor: BloodDonor = {
      ...donor,
      id,
      createdAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'blood_donors', id), newDonor);
      setBloodDonors(prev => [newDonor, ...prev]);
      return true;
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.CREATE, `blood_donors/${id}`);
      } catch {
        const current = JSON.parse(localStorage.getItem('shaha_donors_cache') || '[]');
        current.unshift(newDonor);
        localStorage.setItem('shaha_donors_cache', JSON.stringify(current));
        setBloodDonors(current);
        return true;
      }
      return false;
    }
  };

  const submitBloodRequest = async (request: Omit<BloodRequest, 'id' | 'status' | 'createdAt'>) => {
    if (userBanStatus?.isBanned) {
      alert(`عذراً، هذا الحساب محظور حالياً من إرسال نداءات الدم بسبب: ${userBanStatus.banReason || 'مخالفة الشروط'}`);
      return false;
    }

    const id = 'breq_' + Date.now();
    const newRequest: BloodRequest = {
      ...request,
      id,
      status: 'urgent',
      createdAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'blood_requests', id), newRequest);
      setBloodRequests(prev => [newRequest, ...prev]);
      return true;
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.CREATE, `blood_requests/${id}`);
      } catch {
        const current = JSON.parse(localStorage.getItem('shaha_blood_requests_cache') || '[]');
        current.unshift(newRequest);
        localStorage.setItem('shaha_blood_requests_cache', JSON.stringify(current));
        setBloodRequests(current);
        return true;
      }
      return false;
    }
  };

  const recordListingCall = async (listingId: string) => {
    setListings(prev => prev.map(l => l.id === listingId ? { ...l, callsCount: (l.callsCount || 0) + 1 } : l));
    try {
      await updateDoc(doc(db, 'listings', listingId), {
        callsCount: increment(1)
      });
    } catch {
      // Non-critical metric
    }
  };

  const recordListingView = async (listingId: string): Promise<void> => {
    setListings(prev => prev.map(l => l.id === listingId ? { ...l, viewsCount: (l.viewsCount || 0) + 1 } : l));
    try {
      await updateDoc(doc(db, 'listings', listingId), {
        viewsCount: increment(1)
      });
    } catch {
      // Non-critical metric
    }
  };

  const recordListingShare = async (listingId: string): Promise<void> => {
    setListings(prev => prev.map(l => l.id === listingId ? { ...l, sharesCount: (l.sharesCount || 0) + 1 } : l));
    try {
      await updateDoc(doc(db, 'listings', listingId), {
        sharesCount: increment(1)
      });
    } catch {
      // Non-critical
    }
  };

  const recordQrScan = async (listingId: string): Promise<void> => {
    setListings(prev => prev.map(l => l.id === listingId ? {
      ...l,
      qrScansCount: (l.qrScansCount || 0) + 1,
      viewsCount: (l.viewsCount || 0) + 1
    } : l));
    try {
      await updateDoc(doc(db, 'listings', listingId), {
        qrScansCount: increment(1),
        viewsCount: increment(1)
      });
    } catch {
      // Non-critical
    }
  };

  // ================= HUMANITARIAN AID OPERATIONS =================
  const submitHumanitarianRequest = async (req: Omit<HumanitarianRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    const id = 'aid_' + Date.now();
    const newReq: HumanitarianRequest = {
      ...req,
      id,
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'humanitarian_requests', id), newReq);
      setHumanitarianRequests(prev => [newReq, ...prev]);
      localStorage.setItem('shaha_aid_cache', JSON.stringify([newReq, ...humanitarianRequests]));
      return true;
    } catch (err) {
      setHumanitarianRequests(prev => [newReq, ...prev]);
      return true;
    }
  };

  const updateHumanitarianStatus = async (id: string, status: HumanitarianStatus, notes?: string): Promise<boolean> => {
    try {
      await updateDoc(doc(db, 'humanitarian_requests', id), {
        status,
        adminNotes: notes || '',
        updatedAt: new Date().toISOString()
      });
    } catch {}
    setHumanitarianRequests(prev => {
      const next = prev.map(r => r.id === id ? { ...r, status, adminNotes: notes || r.adminNotes, updatedAt: new Date().toISOString() } : r);
      localStorage.setItem('shaha_aid_cache', JSON.stringify(next));
      return next;
    });
    logAdminAction('UPDATE_AID_STATUS', id, `تحديث حالة طلب المساعدة إلى: ${status}`);
    return true;
  };

  const updateHumanitarianProgress = async (id: string, amountRaised: number): Promise<boolean> => {
    try {
      await updateDoc(doc(db, 'humanitarian_requests', id), {
        amountRaised,
        updatedAt: new Date().toISOString()
      });
    } catch {}
    setHumanitarianRequests(prev => {
      const next = prev.map(r => r.id === id ? { ...r, amountRaised, updatedAt: new Date().toISOString() } : r);
      localStorage.setItem('shaha_aid_cache', JSON.stringify(next));
      return next;
    });
    return true;
  };

  const deleteHumanitarianRequest = async (id: string): Promise<boolean> => {
    try {
      await deleteDoc(doc(db, 'humanitarian_requests', id));
    } catch {}
    setHumanitarianRequests(prev => {
      const next = prev.filter(r => r.id !== id);
      localStorage.setItem('shaha_aid_cache', JSON.stringify(next));
      return next;
    });
    logAdminAction('DELETE_AID_REQUEST', id, 'تم حذف طلب المساعدة');
    return true;
  };

  // ================= DONORS DIRECTORY OPERATIONS =================
  const submitDonorEntry = async (entry: Omit<DonorEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    const id = 'donor_' + Date.now();
    const newEntry: DonorEntry = {
      ...entry,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'donors_directory', id), newEntry);
      setDonors(prev => [newEntry, ...prev]);
      localStorage.setItem('shaha_donors_cache', JSON.stringify([newEntry, ...donors]));
      return true;
    } catch {
      setDonors(prev => [newEntry, ...prev]);
      return true;
    }
  };

  const updateDonorStatus = async (id: string, status: 'available' | 'paused' | 'fulfilled'): Promise<boolean> => {
    try {
      await updateDoc(doc(db, 'donors_directory', id), {
        status,
        updatedAt: new Date().toISOString()
      });
    } catch {}
    setDonors(prev => {
      const next = prev.map(d => d.id === id ? { ...d, status, updatedAt: new Date().toISOString() } : d);
      localStorage.setItem('shaha_donors_cache', JSON.stringify(next));
      return next;
    });
    logAdminAction('UPDATE_DONOR_STATUS', id, `تعديل حالة المتبرع إلى: ${status}`);
    return true;
  };

  const updateDonorEntry = async (id: string, data: Partial<DonorEntry>): Promise<boolean> => {
    try {
      await updateDoc(doc(db, 'donors_directory', id), {
        ...data,
        updatedAt: new Date().toISOString()
      });
    } catch {}
    setDonors(prev => {
      const next = prev.map(d => d.id === id ? { ...d, ...data, updatedAt: new Date().toISOString() } : d);
      localStorage.setItem('shaha_donors_cache', JSON.stringify(next));
      return next;
    });
    logAdminAction('UPDATE_DONOR_ENTRY', id, 'تعديل بيانات المتبرع');
    return true;
  };

  const deleteDonorEntry = async (id: string): Promise<boolean> => {
    try {
      await deleteDoc(doc(db, 'donors_directory', id));
    } catch {}
    setDonors(prev => {
      const next = prev.filter(d => d.id !== id);
      localStorage.setItem('shaha_donors_cache', JSON.stringify(next));
      return next;
    });
    logAdminAction('DELETE_DONOR_ENTRY', id, 'حذف متبرع من الدليل');
    return true;
  };

  // ================= ADMIN & OWNER MESSAGING OPERATIONS =================
  const sendAdminMessage = async (msg: Omit<AdminMessage, 'id' | 'createdAt' | 'status' | 'isRead'>): Promise<boolean> => {
    const id = 'msg_' + Date.now();
    const newMsg: AdminMessage = {
      ...msg,
      id,
      status: 'new',
      isRead: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'admin_messages', id), newMsg);
      setAdminMessages(prev => [newMsg, ...prev]);
      localStorage.setItem('shaha_messages_cache', JSON.stringify([newMsg, ...adminMessages]));
      return true;
    } catch {
      setAdminMessages(prev => [newMsg, ...prev]);
      return true;
    }
  };

  const replyAdminMessage = async (id: string, reply: string, status: AdminMessageStatus = 'replied'): Promise<boolean> => {
    const adminUser = adminSession?.email || currentUser?.email || 'admin';
    const now = new Date().toISOString();
    try {
      await updateDoc(doc(db, 'admin_messages', id), {
        adminReply: reply,
        repliedBy: adminUser,
        repliedAt: now,
        status,
        isRead: true,
        updatedAt: now
      });
    } catch {}
    setAdminMessages(prev => {
      const next = prev.map(m => m.id === id ? { ...m, adminReply: reply, repliedBy: adminUser, repliedAt: now, status, isRead: true, updatedAt: now } : m);
      localStorage.setItem('shaha_messages_cache', JSON.stringify(next));
      return next;
    });
    logAdminAction('REPLY_ADMIN_MESSAGE', id, `الرد على رسالة المستخدم: ${reply.substring(0, 30)}...`);
    return true;
  };

  const updateAdminMessageStatus = async (id: string, status: AdminMessageStatus): Promise<boolean> => {
    try {
      await updateDoc(doc(db, 'admin_messages', id), {
        status,
        updatedAt: new Date().toISOString()
      });
    } catch {}
    setAdminMessages(prev => {
      const next = prev.map(m => m.id === id ? { ...m, status, updatedAt: new Date().toISOString() } : m);
      localStorage.setItem('shaha_messages_cache', JSON.stringify(next));
      return next;
    });
    logAdminAction('UPDATE_MESSAGE_STATUS', id, `تغيير حالة الرسالة إلى: ${status}`);
    return true;
  };

  const markAdminMessageAsRead = async (id: string): Promise<boolean> => {
    try {
      await updateDoc(doc(db, 'admin_messages', id), { isRead: true });
    } catch {}
    setAdminMessages(prev => {
      const next = prev.map(m => m.id === id ? { ...m, isRead: true } : m);
      localStorage.setItem('shaha_messages_cache', JSON.stringify(next));
      return next;
    });
    return true;
  };

  const deleteAdminMessage = async (id: string): Promise<boolean> => {
    try {
      await deleteDoc(doc(db, 'admin_messages', id));
    } catch {}
    setAdminMessages(prev => {
      const next = prev.filter(m => m.id !== id);
      localStorage.setItem('shaha_messages_cache', JSON.stringify(next));
      return next;
    });
    logAdminAction('DELETE_ADMIN_MESSAGE', id, 'حذف رسالة من صندوق الوارد');
    return true;
  };

  // ================= COMMUNITY FACEBOOK PAGES OPERATIONS =================
  const saveCommunityPage = async (page: Partial<CommunityFacebookPage> & { id?: string }): Promise<boolean> => {
    const id = page.id || 'page_' + Date.now();
    const payload: CommunityFacebookPage = {
      id,
      name: page.name?.trim() || 'صفحة مجتمعية',
      url: page.url?.trim() || 'https://www.facebook.com/elshhawya',
      description: page.description?.trim() || '',
      followers: page.followers?.trim() || '',
      category: page.category?.trim() || 'مجتمعي',
      isVerified: page.isVerified ?? false,
      ...(page.verifiedBadgeId ? { verifiedBadgeId: page.verifiedBadgeId } : {}),
      isActive: page.isActive ?? true,
      order: page.order ?? (communityPages.length + 1),
      addedBy: page.addedBy || (adminSession?.email || currentUser?.email || 'owner'),
      createdAt: page.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const cleanPayload = stripUndefined(payload as unknown as Record<string, unknown>);
    const [fsResult, kvResult] = await Promise.allSettled([
      setDoc(doc(db, 'community_facebook_pages', id), cleanPayload),
      adminSession?.token
        ? fetchWithTimeout(apiUrl('/api/community-pages/save'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${adminSession.token}`
            },
            body: JSON.stringify({ page: cleanPayload })
          }, 10000).then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return true;
          })
        : Promise.reject(new Error('no_admin_token'))
    ]);

    const savedRemote = fsResult.status === 'fulfilled' || kvResult.status === 'fulfilled';
    if (!savedRemote) {
      return false;
    }

    setCommunityPages(prev => {
      const next = [payload, ...prev.filter(p => p.id !== id)].sort((a, b) => a.order - b.order);
      scheduleCacheWrite('shaha_pages_cache', next);
      return next;
    });
    logAdminAction('SAVE_COMMUNITY_PAGE', id, `حفظ صفحة فيسبوك: ${payload.name}`);
    return true;
  };

  const deleteCommunityPage = async (id: string): Promise<boolean> => {
    const [fsResult, kvResult] = await Promise.allSettled([
      deleteDoc(doc(db, 'community_facebook_pages', id)),
      adminSession?.token
        ? fetchWithTimeout(apiUrl(`/api/community-pages/${id}`), {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${adminSession.token}`
            }
          }, 10000).then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return true;
          })
        : Promise.reject(new Error('no_admin_token'))
    ]);

    if (fsResult.status !== 'fulfilled' && kvResult.status !== 'fulfilled') {
      return false;
    }

    setCommunityPages(prev => {
      const next = prev.filter(p => p.id !== id);
      scheduleCacheWrite('shaha_pages_cache', next);
      return next;
    });
    logAdminAction('DELETE_COMMUNITY_PAGE', id, 'حذف صفحة مجتمعية');
    return true;
  };

  const toggleVerifyCommunityPage = async (id: string, badgeId?: string): Promise<boolean> => {
    const target = communityPages.find(p => p.id === id);
    if (!target) return false;
    const newVerified = !target.isVerified;
    const updatedPage: CommunityFacebookPage = {
      ...target,
      isVerified: newVerified,
      ...(newVerified ? { verifiedBadgeId: badgeId || 'vb_official' } : {}),
      updatedAt: new Date().toISOString()
    };
    if (!newVerified) {
      delete updatedPage.verifiedBadgeId;
    }

    const [fsResult, kvResult] = await Promise.allSettled([
      updateDoc(doc(db, 'community_facebook_pages', id), {
        isVerified: newVerified,
        verifiedBadgeId: newVerified ? (badgeId || 'vb_official') : null,
        updatedAt: updatedPage.updatedAt
      }),
      adminSession?.token
        ? fetchWithTimeout(apiUrl('/api/community-pages/save'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${adminSession.token}`
            },
            body: JSON.stringify({ page: stripUndefined(updatedPage as unknown as Record<string, unknown>) })
          }, 10000).then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return true;
          })
        : Promise.reject(new Error('no_admin_token'))
    ]);

    if (fsResult.status !== 'fulfilled' && kvResult.status !== 'fulfilled') {
      return false;
    }

    setCommunityPages(prev => {
      const next = prev.map(p => (p.id === id ? updatedPage : p));
      scheduleCacheWrite('shaha_pages_cache', next);
      return next;
    });
    logAdminAction('TOGGLE_VERIFY_PAGE', id, `${newVerified ? 'توثيق' : 'إلغاء توثيق'} صفحة فيسبوك: ${target.name}`);
    return true;
  };

  // ================= CLAIMS & OWNERSHIP OPERATIONS =================
  const submitListingClaim = async (claimData: Omit<ClaimListingRequest, 'id' | 'status' | 'createdAt'>): Promise<boolean> => {
    const id = 'claim_' + Date.now();
    const payload: ClaimListingRequest = {
      ...claimData,
      id,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'claims', id), payload);
    } catch {}

    setClaims(prev => {
      const next = [payload, ...prev];
      localStorage.setItem('shaha_claims_cache', JSON.stringify(next));
      return next;
    });

    return true;
  };

  const reviewListingClaim = async (claimId: string, status: 'approved' | 'rejected', adminNotes?: string): Promise<boolean> => {
    const target = claims.find(c => c.id === claimId);
    if (!target) return false;

    const updatedAt = new Date().toISOString();
    try {
      await updateDoc(doc(db, 'claims', claimId), {
        status,
        adminNotes: adminNotes || null,
        reviewedBy: adminSession?.email || currentUser?.email || 'admin',
        reviewedAt: updatedAt
      });

      if (status === 'approved') {
        // Link listing claimStatus
        await updateDoc(doc(db, 'listings', target.listingId), {
          claimStatus: 'claimed',
          ownerUserId: target.applicantUserId || null,
          isVerified: true
        });
        setListings(prev => prev.map(l => l.id === target.listingId ? {
          ...l,
          claimStatus: 'claimed',
          ownerUserId: target.applicantUserId || undefined,
          isVerified: true
        } : l));
      }
    } catch {}

    setClaims(prev => {
      const next = prev.map(c => c.id === claimId ? { ...c, status, adminNotes, reviewedAt: updatedAt } : c);
      localStorage.setItem('shaha_claims_cache', JSON.stringify(next));
      return next;
    });

    logAdminAction('REVIEW_CLAIM', claimId, `تغيير حالة طلب ملكية الخدمة (${target.listingName}) إلى: ${status}`);
    return true;
  };

  // ================= COMMUNITY SUGGESTIONS OPERATIONS =================
  const submitCommunitySuggestion = async (suggData: Omit<CommunitySuggestion, 'id' | 'upvotes' | 'status' | 'createdAt'>): Promise<boolean> => {
    const id = 'sugg_' + Date.now();
    const payload: CommunitySuggestion = {
      ...suggData,
      id,
      upvotes: 1,
      votedUsers: currentUser?.uid ? [currentUser.uid] : [],
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'suggestions', id), payload);
    } catch {}

    setSuggestions(prev => {
      const next = [payload, ...prev];
      localStorage.setItem('shaha_suggestions_cache', JSON.stringify(next));
      return next;
    });

    return true;
  };

  const upvoteSuggestion = async (suggestionId: string): Promise<boolean> => {
    const target = suggestions.find(s => s.id === suggestionId);
    if (!target) return false;

    const uid = currentUser?.uid || 'anon_' + Date.now();
    const currentVoted = target.votedUsers || [];
    if (currentVoted.includes(uid)) return true;

    const newVoted = [...currentVoted, uid];
    const newUpvotes = (target.upvotes || 0) + 1;

    try {
      await updateDoc(doc(db, 'suggestions', suggestionId), {
        upvotes: newUpvotes,
        votedUsers: newVoted
      });
    } catch {}

    setSuggestions(prev => {
      const next = prev.map(s => s.id === suggestionId ? { ...s, upvotes: newUpvotes, votedUsers: newVoted } : s);
      localStorage.setItem('shaha_suggestions_cache', JSON.stringify(next));
      return next;
    });

    return true;
  };

  const reviewCommunitySuggestion = async (suggestionId: string, status: 'approved' | 'implemented' | 'rejected'): Promise<boolean> => {
    try {
      await updateDoc(doc(db, 'suggestions', suggestionId), { status });
    } catch {}

    setSuggestions(prev => {
      const next = prev.map(s => s.id === suggestionId ? { ...s, status } : s);
      localStorage.setItem('shaha_suggestions_cache', JSON.stringify(next));
      return next;
    });

    logAdminAction('REVIEW_SUGGESTION', suggestionId, `تحديث حالة الاقتراح إلى: ${status}`);
    return true;
  };

  // ================= FEATURE FLAGS OPERATIONS =================
  const updateFeatureFlags = async (flags: Partial<FeatureFlagsConfig>): Promise<boolean> => {
    const updated = { ...featureFlags, ...flags };
    setFeatureFlags(updated);
    localStorage.setItem('shaha_feature_flags', JSON.stringify(updated));
    logAdminAction('UPDATE_FEATURE_FLAGS', 'إعدادات المنصة', 'تحديث مفاتيح تشغيل الخصائص');
    return true;
  };

  // ================= VILLAGE NEWS OPERATIONS =================
  const saveVillageNews = async (news: Partial<VillageNews> & { id?: string }): Promise<boolean> => {
    const isNew = !news.id;
    const id = news.id || 'news_' + Date.now();
    const payload: VillageNews = {
      id,
      title: news.title || '',
      summary: news.summary || '',
      content: news.content || '',
      imageUrl: news.imageUrl || '',
      category: news.category || 'general',
      categoryLabel: news.categoryLabel || 'أخبار عامة',
      publishedAt: news.publishedAt || new Date().toISOString(),
      publisherName: news.publisherName || (adminSession?.name || 'إدارة شها ون'),
      isPinned: news.isPinned ?? false,
      isUrgent: news.isUrgent ?? false,
      viewsCount: news.viewsCount ?? 0,
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'village_news', id), payload, { merge: true });
    } catch {}

    setVillageNews(prev => {
      const exists = prev.some(n => n.id === id);
      const next = exists ? prev.map(n => n.id === id ? payload : n) : [payload, ...prev];
      next.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      localStorage.setItem('shaha_news_cache', JSON.stringify(next));
      return next;
    });

    logAdminAction(isNew ? 'CREATE_NEWS' : 'UPDATE_NEWS', payload.title, `حفظ خبر: ${payload.title}`);
    return true;
  };

  const deleteVillageNews = async (id: string): Promise<boolean> => {
    try {
      await deleteDoc(doc(db, 'village_news', id));
    } catch {}

    setVillageNews(prev => {
      const next = prev.filter(n => n.id !== id);
      localStorage.setItem('shaha_news_cache', JSON.stringify(next));
      return next;
    });

    logAdminAction('DELETE_NEWS', id, 'حذف خبر من المنصة');
    return true;
  };

  const toggleNewsPin = async (id: string, isPinned: boolean): Promise<boolean> => {
    try {
      await updateDoc(doc(db, 'village_news', id), { isPinned });
    } catch {}

    setVillageNews(prev => {
      const next = prev.map(n => n.id === id ? { ...n, isPinned } : n);
      localStorage.setItem('shaha_news_cache', JSON.stringify(next));
      return next;
    });

    logAdminAction('PIN_NEWS', id, `${isPinned ? 'تثبيت' : 'إلغاء تثبيت'} الخبر`);
    return true;
  };

  // ================= PLATFORM CREDITS OPERATIONS =================
  const savePlatformCredit = async (credit: Partial<PlatformCredit> & { id?: string }): Promise<boolean> => {
    const isNew = !credit.id;
    const id = credit.id || 'credit_' + Date.now();
    const payload: PlatformCredit = {
      id,
      name: credit.name || '',
      role: credit.role || '',
      description: credit.description || '',
      link: credit.link || '',
      avatarUrl: credit.avatarUrl || '',
      order: credit.order ?? platformCredits.length + 1,
      isActive: credit.isActive ?? true,
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'platform_credits', id), payload, { merge: true });
    } catch {}

    setPlatformCredits(prev => {
      const exists = prev.some(c => c.id === id);
      const next = exists ? prev.map(c => c.id === id ? payload : c) : [...prev, payload];
      next.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      localStorage.setItem('shaha_platform_credits', JSON.stringify(next));
      return next;
    });

    logAdminAction(isNew ? 'CREATE_CREDIT' : 'UPDATE_CREDIT', payload.name, `حفظ المساهم: ${payload.name}`);
    return true;
  };

  const deletePlatformCredit = async (id: string): Promise<boolean> => {
    try {
      await deleteDoc(doc(db, 'platform_credits', id));
    } catch {}

    setPlatformCredits(prev => {
      const next = prev.filter(c => c.id !== id);
      localStorage.setItem('shaha_platform_credits', JSON.stringify(next));
      return next;
    });

    logAdminAction('DELETE_CREDIT', id, 'حذف مساهم من القائمة');
    return true;
  };

  // ================= MANSOURA EMERGENCY SCHEDULE OPERATIONS =================
  const saveMansouraSchedule = async (schedule: EmergencyHospitalSchedule): Promise<boolean> => {
    const payload: EmergencyHospitalSchedule = {
      ...schedule,
      lastUpdated: new Date().toISOString(),
      updatedBy: adminSession?.name || adminSession?.email || 'الأدمن'
    };

    try {
      await setDoc(doc(db, 'mansoura_schedule', schedule.id), payload, { merge: true });
    } catch {}

    setMansouraSchedule(prev => {
      const exists = prev.some(s => s.id === schedule.id);
      const next = exists ? prev.map(s => s.id === schedule.id ? payload : s) : [...prev, payload];
      localStorage.setItem('shaha_mansoura_schedule', JSON.stringify(next));
      return next;
    });

    logAdminAction('UPDATE_MANSOURA_SCHEDULE', schedule.id, `تحديث جدول طوارئ المنصورة - ${schedule.title}`);
    return true;
  };

  // ================= DYNAMIC VERIFICATION BADGES OPERATIONS =================
  const saveVerificationBadge = async (badge: Partial<VerificationBadge> & { id?: string }): Promise<boolean> => {
    const id = badge.id || 'vb_' + Date.now();
    const payload: VerificationBadge = {
      id,
      nameAr: badge.nameAr || '',
      descriptionAr: badge.descriptionAr || '',
      color: badge.color || 'blue',
      icon: badge.icon || 'ShieldCheck',
      targetEntityTypes: badge.targetEntityTypes || ['person', 'shop', 'service', 'place'],
      priority: badge.priority ?? 5,
      isActive: badge.isActive ?? true,
      isOfficial: badge.isOfficial ?? true,
      createdAt: badge.createdAt || new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'verification_badges', id), payload, { merge: true });
    } catch {}
    setVerificationBadges(prev => {
      const exists = prev.some(b => b.id === id);
      const next = exists ? prev.map(b => b.id === id ? payload : b) : [...prev, payload];
      next.sort((a, b) => (b.priority || 0) - (a.priority || 0));
      localStorage.setItem('shaha_badges_cache', JSON.stringify(next));
      return next;
    });
    logAdminAction('SAVE_BADGE', payload.nameAr, 'تم حفظ شارة التوثيق وتعديل خصائصها');
    return true;
  };

  const deleteVerificationBadge = async (badgeId: string): Promise<boolean> => {
    try {
      await deleteDoc(doc(db, 'verification_badges', badgeId));
    } catch {}
    setVerificationBadges(prev => {
      const next = prev.filter(b => b.id !== badgeId);
      localStorage.setItem('shaha_badges_cache', JSON.stringify(next));
      return next;
    });
    // Remove this badge from all listings that had it
    setListings(prev => prev.map(l => l.verificationBadges?.includes(badgeId) ? {
      ...l,
      verificationBadges: l.verificationBadges.filter(id => id !== badgeId)
    } : l));
    logAdminAction('DELETE_BADGE', badgeId, 'تم حذف شارة التوثيق');
    return true;
  };

  const assignBadgeToListing = async (listingId: string, badgeId: string, reason?: string): Promise<boolean> => {
    const badge = verificationBadges.find(b => b.id === badgeId);
    const listing = listings.find(l => l.id === listingId);
    if (!listing || !badge) return false;

    const currentBadges = listing.verificationBadges || [];
    if (currentBadges.includes(badgeId)) return true;

    const newBadges = [...currentBadges, badgeId];
    const newEntry: VerificationAuditEntry = {
      badgeId,
      badgeName: badge.nameAr,
      grantedBy: adminSession?.email || currentUser?.email || 'admin',
      grantedAt: new Date().toISOString(),
      reason: reason || 'مراجعة وتوثيق رسمي من إدارة الدليل'
    };
    const newHistory = [...(listing.verificationHistory || []), newEntry];

    const primaryBadgeId = listing.primaryBadgeId || badgeId;
    try {
      await updateDoc(doc(db, 'listings', listingId), {
        verificationBadges: newBadges,
        verificationHistory: newHistory,
        isVerified: true,
        primaryBadgeId
      });
    } catch {}

    setListings(prev => prev.map(l => l.id === listingId ? {
      ...l,
      verificationBadges: newBadges,
      verificationHistory: newHistory,
      isVerified: true,
      primaryBadgeId
    } : l));

    logAdminAction('ASSIGN_BADGE', `${badge.nameAr} -> ${listing.name}`, `منح علامة التوثيق: ${reason || 'معتمد'}`);
    return true;
  };

  const removeBadgeFromListing = async (listingId: string, badgeId: string): Promise<boolean> => {
    const listing = listings.find(l => l.id === listingId);
    if (!listing) return false;

    const newBadges = (listing.verificationBadges || []).filter(id => id !== badgeId);
    const newPrimaryBadgeId = listing.primaryBadgeId === badgeId ? (newBadges[0] || undefined) : listing.primaryBadgeId;
    try {
      await updateDoc(doc(db, 'listings', listingId), {
        verificationBadges: newBadges,
        isVerified: newBadges.length > 0,
        primaryBadgeId: newPrimaryBadgeId || ''
      });
    } catch {}

    setListings(prev => prev.map(l => l.id === listingId ? {
      ...l,
      verificationBadges: newBadges,
      isVerified: newBadges.length > 0,
      primaryBadgeId: newPrimaryBadgeId
    } : l));

    logAdminAction('REVOKE_BADGE', listing.name, `سحب شارة التوثيق (${badgeId})`);
    return true;
  };

  const setPrimaryBadgeForListing = async (listingId: string, badgeId: string): Promise<boolean> => {
    const listing = listings.find(l => l.id === listingId);
    if (!listing) return false;

    try {
      await updateDoc(doc(db, 'listings', listingId), {
        primaryBadgeId: badgeId
      });
    } catch {}

    setListings(prev => prev.map(l => l.id === listingId ? { ...l, primaryBadgeId: badgeId } : l));
    logAdminAction('SET_PRIMARY_BADGE', listing.name, `تعيين شارة التوثيق الأساسية (${badgeId})`);
    return true;
  };

  // ================= ADMIN OPERATIONS =================
  const approveServiceRequest = async (request: ServiceRequest, modifiedData?: Partial<Listing>) => {
    const listingId = 'list_' + Date.now();
    const newListing: Listing = {
      id: listingId,
      categoryId: request.categoryId,
      subcategoryId: request.subcategoryId || request.specialty || '',
      name: request.serviceName,
      titleOrSpecialty: request.specialty || '',
      phone: request.phone,
      whatsapp: request.whatsapp || request.phone,
      address: request.address || 'قرية شها - مركز المنصورة',
      workingHours: request.workingHours || 'يومياً',
      description: request.notes || '',
      imageUrl: request.imageUrl || '',
      isVerified: true,
      status: 'active',
      viewsCount: 0,
      callsCount: 0,
      rating: 5,
      ratingsCount: 1,
      createdAt: new Date().toISOString(),
      ...modifiedData
    };

    const cleanListing = stripUndefined(newListing as unknown as Record<string, unknown>);
    setListings(prev => [newListing, ...prev]);
    setServiceRequests(prev => prev.map(r => r.id === request.id ? { ...r, status: 'approved' } : r));

    const tasks: Promise<unknown>[] = [
      setDoc(doc(db, 'listings', listingId), cleanListing),
      updateDoc(doc(db, 'service_requests', request.id), { status: 'approved' })
    ];
    if (adminSession?.token) {
      tasks.push(
        fetchWithTimeout(apiUrl('/api/listings/save'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminSession.token}`
          },
          body: JSON.stringify({ listing: cleanListing })
        }, 10000)
      );
    }

    await Promise.allSettled(tasks);
    logAdminAction('APPROVE_SERVICE', request.serviceName, `تم قبول ونشر الخدمة في قسم ${request.categoryId}`);
    return true;
  };

  const rejectServiceRequest = async (requestId: string) => {
    try {
      await updateDoc(doc(db, 'service_requests', requestId), { status: 'rejected' });
      setServiceRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'rejected' } : r));
      logAdminAction('REJECT_SERVICE', requestId, 'تم رفض طلب الخدمة');
      return true;
    } catch {
      setServiceRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'rejected' } : r));
      return true;
    }
  };

  const resolveReport = async (reportId: string) => {
    try {
      await updateDoc(doc(db, 'reports', reportId), { status: 'resolved' });
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'resolved' } : r));
      logAdminAction('RESOLVE_REPORT', reportId, 'تم حل البلاغ وتصحيح البيانات');
      return true;
    } catch {
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'resolved' } : r));
      return true;
    }
  };

  const dismissReport = async (reportId: string) => {
    try {
      await updateDoc(doc(db, 'reports', reportId), { status: 'dismissed' });
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'dismissed' } : r));
      logAdminAction('DISMISS_REPORT', reportId, 'تم حفظ البلاغ');
      return true;
    } catch {
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'dismissed' } : r));
      return true;
    }
  };

  const saveListing = async (listing: Partial<Listing> & { id?: string }) => {
    const isNew = !listing.id;
    const id = listing.id || 'list_' + Date.now();
    const existing = listings.find(l => l.id === id);

    const payload: Listing = {
      ...existing,
      ...listing,
      id,
      categoryId: listing.categoryId || existing?.categoryId || 'doctors',
      name: listing.name !== undefined ? listing.name : (existing?.name || ''),
      phone: listing.phone !== undefined ? listing.phone : (existing?.phone || ''),
      address: listing.address !== undefined ? listing.address : (existing?.address || 'شها'),
      status: listing.status || existing?.status || 'active',
      subcategoryId: listing.subcategoryId !== undefined ? listing.subcategoryId : (existing?.subcategoryId || ''),
      titleOrSpecialty: listing.titleOrSpecialty !== undefined ? listing.titleOrSpecialty : (existing?.titleOrSpecialty || ''),
      whatsapp: listing.whatsapp !== undefined ? listing.whatsapp : (existing?.whatsapp || ''),
      secondaryPhone: listing.secondaryPhone !== undefined ? listing.secondaryPhone : (existing?.secondaryPhone || ''),
      workingHours: listing.workingHours !== undefined ? listing.workingHours : (existing?.workingHours || ''),
      description: listing.description !== undefined ? listing.description : (existing?.description || ''),
      imageUrl: listing.imageUrl !== undefined ? listing.imageUrl : (existing?.imageUrl || ''),
      coverImageUrl: listing.coverImageUrl !== undefined ? listing.coverImageUrl : (existing?.coverImageUrl || ''),
      photos: listing.photos !== undefined ? listing.photos : (existing?.photos || []),
      socialLinks: listing.socialLinks !== undefined ? listing.socialLinks : (existing?.socialLinks || []),
      facebookUrl: listing.facebookUrl !== undefined ? listing.facebookUrl : (existing?.facebookUrl || ''),
      instagramUrl: listing.instagramUrl !== undefined ? listing.instagramUrl : (existing?.instagramUrl || ''),
      telegramUrl: listing.telegramUrl !== undefined ? listing.telegramUrl : (existing?.telegramUrl || ''),
      websiteUrl: listing.websiteUrl !== undefined ? listing.websiteUrl : (existing?.websiteUrl || ''),
      tiktokUrl: listing.tiktokUrl !== undefined ? listing.tiktokUrl : (existing?.tiktokUrl || ''),
      youtubeUrl: listing.youtubeUrl !== undefined ? listing.youtubeUrl : (existing?.youtubeUrl || ''),
      linkedinUrl: listing.linkedinUrl !== undefined ? listing.linkedinUrl : (existing?.linkedinUrl || ''),
      email: listing.email !== undefined ? listing.email : (existing?.email || ''),
      googleMapsUrl: listing.googleMapsUrl !== undefined ? listing.googleMapsUrl : (existing?.googleMapsUrl || ''),
      isVerified: listing.isVerified !== undefined ? listing.isVerified : (existing?.isVerified ?? true),
      isFeatured: listing.isFeatured !== undefined ? listing.isFeatured : (existing?.isFeatured ?? false),
      deliveryAvailable: listing.deliveryAvailable !== undefined ? listing.deliveryAvailable : (existing?.deliveryAvailable ?? false),
      viewsCount: listing.viewsCount !== undefined ? listing.viewsCount : (existing?.viewsCount ?? 0),
      callsCount: listing.callsCount !== undefined ? listing.callsCount : (existing?.callsCount ?? 0),
      sharesCount: listing.sharesCount !== undefined ? listing.sharesCount : (existing?.sharesCount ?? 0),
      qrScansCount: listing.qrScansCount !== undefined ? listing.qrScansCount : (existing?.qrScansCount ?? 0),
      rating: listing.rating !== undefined ? listing.rating : (existing?.rating ?? 5.0),
      ratingsCount: listing.ratingsCount !== undefined ? listing.ratingsCount : (existing?.ratingsCount ?? 1),
      entityType: listing.entityType || existing?.entityType || 'service',
      ownerUserId: listing.ownerUserId !== undefined ? listing.ownerUserId : (existing?.ownerUserId || ''),
      claimStatus: listing.claimStatus || existing?.claimStatus || 'unclaimed',
      createdAt: listing.createdAt || existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 1. Immediately update local state & cache so UI reflects change instantly
    setListings(prev => {
      const exists = prev.some(l => l.id === id);
      const next = exists ? prev.map(l => l.id === id ? payload : l) : [payload, ...prev];
      try {
        localStorage.setItem('shaha_listings_cache', JSON.stringify(next));
      } catch (e) {
        console.warn('LocalStorage error', e);
      }
      return next;
    });

    const cleanListing = stripUndefined(payload as unknown as Record<string, unknown>);
    let firestoreWritten = false;
    try {
      await setDoc(doc(db, 'listings', id), cleanListing, { merge: true });
      firestoreWritten = true;
    } catch (fsErr) {
      console.warn('Firestore direct write notice:', fsErr);
    }

    // 3. Write to Server API (ensures persistence when admin logged in via password or network offline)
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (adminSession?.token) {
        headers['Authorization'] = `Bearer ${adminSession.token}`;
      } else if (currentUser) {
        try {
          headers['X-Firebase-Id-Token'] = await currentUser.getIdToken();
        } catch {
          // No token available; the server will reject the request.
        }
      }
      const saveRes = await fetch(apiUrl('/api/listings/save'), {
        method: 'POST',
        headers,
        body: JSON.stringify({ listing: payload })
      });
      if (!saveRes.ok) {
        const errData = await saveRes.json().catch(() => null);
        console.warn('Server listing sync rejected:', errData?.error || saveRes.status);
      }
    } catch (serverErr) {
      console.warn('Server listing sync notice:', serverErr);
    }

    logAdminAction(isNew ? 'CREATE_LISTING' : 'UPDATE_LISTING', payload.name, `تم حفظ بيانات ${payload.name}`);
    return true;
  };

  const updateListingProfile = async (listingId: string, updates: Partial<Listing>): Promise<boolean> => {
    return saveListing({ ...updates, id: listingId });
  };

  const deleteListing = async (listingId: string) => {
    try {
      await deleteDoc(doc(db, 'listings', listingId));
    } catch {
      // ignore
    }

    // Also delete from server
    if (adminSession?.token) {
      try {
        await fetch(apiUrl(`/api/listings/${listingId}`), {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${adminSession.token}` }
        });
      } catch {}
    }

    const target = listings.find(l => l.id === listingId)?.name || listingId;
    setListings(prev => {
      const next = prev.filter(l => l.id !== listingId);
      try {
        localStorage.setItem('shaha_listings_cache', JSON.stringify(next));
      } catch {}
      return next;
    });
    logAdminAction('DELETE_LISTING', target, 'تم حذف الرقم من الدليل');
    return true;
  };

  const bulkUpdateListings = async (listingIds: string[], updates: Partial<Listing>) => {
    const cleanUpdates = stripUndefined(updates as unknown as Record<string, unknown>);
    const now = new Date().toISOString();

    let nextSnapshot: Listing[] = [];
    setListings(prev => {
      nextSnapshot = prev.map(l => listingIds.includes(l.id) ? { ...l, ...updates, updatedAt: now } : l);
      scheduleCacheWrite('shaha_listings_cache', nextSnapshot);
      return nextSnapshot;
    });

    const fsTasks = listingIds.map(id =>
      updateDoc(doc(db, 'listings', id), { ...cleanUpdates, updatedAt: now }).catch(() => {})
    );
    const kvTasks = adminSession?.token
      ? nextSnapshot
          .filter(l => listingIds.includes(l.id))
          .map(item =>
            fetch(apiUrl('/api/listings/save'), {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${adminSession.token}`
              },
              body: JSON.stringify({ listing: stripUndefined(item as unknown as Record<string, unknown>) })
            }).catch(() => {})
          )
      : [];

    await Promise.allSettled([...fsTasks, ...kvTasks]);
    logAdminAction('BULK_UPDATE_LISTINGS', `${listingIds.length} عنصر`, 'تحديث جماعي لحالة الأرقام');
    return true;
  };

  const bulkDeleteListings = async (listingIds: string[]) => {
    setListings(prev => {
      const next = prev.filter(l => !listingIds.includes(l.id));
      scheduleCacheWrite('shaha_listings_cache', next);
      return next;
    });

    const fsTasks = listingIds.map(id => deleteDoc(doc(db, 'listings', id)).catch(() => {}));
    const kvTasks = adminSession?.token
      ? listingIds.map(id =>
          fetch(apiUrl(`/api/listings/${id}`), {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${adminSession.token}` }
          }).catch(() => {})
        )
      : [];

    await Promise.allSettled([...fsTasks, ...kvTasks]);
    logAdminAction('BULK_DELETE_LISTINGS', `${listingIds.length} عنصر`, 'حذف جماعي للأرقام من الدليل');
    return true;
  };

  const saveCategory = async (cat: Category) => {
    try {
      await setDoc(doc(db, 'categories', cat.id), cat, { merge: true });
    } catch {
      // ignore
    }
    setCategories(prev => {
      const exists = prev.some(c => c.id === cat.id);
      const updated = exists ? prev.map(c => c.id === cat.id ? cat : c) : [...prev, cat].sort((a, b) => a.order - b.order);
      try {
        localStorage.setItem('shaha_categories_cache', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    logAdminAction('SAVE_CATEGORY', cat.nameAr, 'تم حفظ القسم والتخصصات');
    return true;
  };

  const deleteCategory = async (catId: string) => {
    try {
      await deleteDoc(doc(db, 'categories', catId));
    } catch {
      // ignore
    }
    setCategories(prev => {
      const updated = prev.filter(c => c.id !== catId);
      try {
        localStorage.setItem('shaha_categories_cache', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    logAdminAction('DELETE_CATEGORY', catId, 'تم حذف القسم');
    return true;
  };

  const saveEmergencyNumber = async (em: EmergencyNumber) => {
    try {
      await setDoc(doc(db, 'emergency_numbers', em.id), em, { merge: true });
    } catch {
      // ignore
    }
    setEmergencyNumbers(prev => {
      const exists = prev.some(e => e.id === em.id);
      if (exists) return prev.map(e => e.id === em.id ? em : e);
      return [...prev, em].sort((a, b) => a.order - b.order);
    });
    logAdminAction('SAVE_EMERGENCY', em.titleAr, 'تم تعديل رقم طوارئ');
    return true;
  };

  const deleteEmergencyNumber = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'emergency_numbers', id));
    } catch {
      // ignore
    }
    setEmergencyNumbers(prev => prev.filter(e => e.id !== id));
    return true;
  };

  const saveCharity = async (ch: CharityInitiative) => {
    try {
      await setDoc(doc(db, 'charity_initiatives', ch.id), ch, { merge: true });
    } catch {
      // ignore
    }
    setCharities(prev => {
      const exists = prev.some(c => c.id === ch.id);
      if (exists) return prev.map(c => c.id === ch.id ? ch : c);
      return [ch, ...prev];
    });
    return true;
  };

  const deleteCharity = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'charity_initiatives', id));
    } catch {
      // ignore
    }
    setCharities(prev => prev.filter(c => c.id !== id));
    return true;
  };

  const saveBloodDonor = async (donor: BloodDonor) => {
    try {
      await setDoc(doc(db, 'blood_donors', donor.id), donor, { merge: true });
    } catch {
      // ignore
    }
    setBloodDonors(prev => {
      const exists = prev.some(d => d.id === donor.id);
      if (exists) return prev.map(d => d.id === donor.id ? donor : d);
      return [donor, ...prev];
    });
    return true;
  };

  const deleteBloodDonor = async (donorId: string) => {
    try {
      await deleteDoc(doc(db, 'blood_donors', donorId));
    } catch {
      // ignore
    }
    setBloodDonors(prev => prev.filter(d => d.id !== donorId));
    return true;
  };

  const updateBloodRequestStatus = async (requestId: string, status: 'urgent' | 'fulfilled' | 'closed') => {
    try {
      await updateDoc(doc(db, 'blood_requests', requestId), { status });
    } catch {
      // ignore
    }
    setBloodRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r));
    return true;
  };

  const deleteBloodRequest = async (requestId: string) => {
    try {
      await deleteDoc(doc(db, 'blood_requests', requestId));
    } catch {
      // ignore
    }
    setBloodRequests(prev => prev.filter(r => r.id !== requestId));
    return true;
  };

  // ==================== Advertisement & Offers Methods ====================

  const isAdActiveNow = (ad: Advertisement): boolean => {
    if (!ad.isActive) return false;
    const now = Date.now();
    if (ad.startDate) {
      const start = new Date(ad.startDate).getTime();
      if (!isNaN(start) && start > now) return false;
    }
    if (ad.endDate) {
      const end = new Date(ad.endDate).getTime();
      const adjustedEnd = ad.endDate.length <= 10 ? end + 86400000 - 1 : end;
      if (!isNaN(adjustedEnd) && adjustedEnd < now) return false;
    }
    return true;
  };

  const saveAdvertisement = async (ad: Partial<Advertisement> & { id?: string }): Promise<boolean> => {
    if (!canManageAds) {
      alert('عذراً، إضافة وتعديل الإعلانات محصورة فقط على مالك النظام أو المشرف المفوض بصلاحية (إدارة الإعلانات).');
      return false;
    }
    const isNew = !ad.id;
    const id = ad.id || 'ad_' + Date.now();
    const payload: Advertisement = {
      id,
      title: ad.title || '',
      subtitle: ad.subtitle || '',
      description: ad.description || '',
      placement: ad.placement || 'hero_slider',
      badgeType: ad.badgeType || (ad.isPinned ? 'pinned' : 'offer'),
      badgeText: ad.badgeText || (ad.isPinned ? '📌 إعلان مثبت' : ''),
      imageUrl: ad.imageUrl || '',
      linkUrl: ad.linkUrl || '',
      ctaText: ad.ctaText || 'عرض التفاصيل',
      phone: ad.phone || '',
      whatsapp: ad.whatsapp || '',
      discountPercent: ad.discountPercent || '',
      startDate: ad.startDate || '',
      endDate: ad.endDate || '',
      isActive: ad.isActive ?? true,
      isPinned: ad.isPinned ?? false,
      priority: ad.priority ?? 1,
      order: ad.order ?? 0,
      displayRotation: ad.displayRotation || (ad.isPinned ? 'pinned' : 'priority'),
      viewsCount: ad.viewsCount ?? 0,
      clicksCount: ad.clicksCount ?? 0,
      backgroundColor: ad.backgroundColor || 'gradient_blue',
      targetCategory: ad.targetCategory || 'all',
      createdAt: ad.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'advertisements', id), payload, { merge: true });
    } catch {
      // fallback
    }

    setAdvertisements(prev => {
      const exists = prev.some(item => item.id === id);
      const next = exists ? prev.map(item => item.id === id ? payload : item) : [payload, ...prev];
      next.sort((a, b) => {
        if (Boolean(a.isPinned) !== Boolean(b.isPinned)) return a.isPinned ? -1 : 1;
        const prioDiff = (b.priority || 0) - (a.priority || 0);
        if (prioDiff !== 0) return prioDiff;
        return (a.order || 0) - (b.order || 0);
      });
      localStorage.setItem('shaha_ads_cache', JSON.stringify(next));
      return next;
    });

    logAdminAction(
      isNew ? 'CREATE_ADVERTISEMENT' : 'UPDATE_ADVERTISEMENT',
      payload.title,
      `تم حفظ الإعلان «${payload.title}» - موضع: ${payload.placement}${payload.isPinned ? ' (📌 مثبت)' : ''}`
    );
    return true;
  };

  const toggleAdvertisementPin = async (adId: string, isPinned: boolean): Promise<boolean> => {
    if (!canManageAds) {
      alert('عذراً، صلاحية تثبيت أو إلغاء تثبيت الإعلانات محصورة فقط على مالك النظام أو المشرف المفوض.');
      return false;
    }
    try {
      await updateDoc(doc(db, 'advertisements', adId), {
        isPinned,
        updatedAt: new Date().toISOString()
      });
    } catch {
      // ignore
    }
    setAdvertisements(prev => {
      const next = prev.map(a => a.id === adId ? { ...a, isPinned, updatedAt: new Date().toISOString() } : a);
      next.sort((a, b) => {
        if (Boolean(a.isPinned) !== Boolean(b.isPinned)) return a.isPinned ? -1 : 1;
        return (b.priority || 0) - (a.priority || 0);
      });
      localStorage.setItem('shaha_ads_cache', JSON.stringify(next));
      return next;
    });
    const adTitle = advertisements.find(a => a.id === adId)?.title || adId;
    logAdminAction(
      isPinned ? 'PIN_ADVERTISEMENT' : 'UNPIN_ADVERTISEMENT',
      adTitle,
      isPinned ? 'تم تثبيت الإعلان في صدارة الدليل 📌' : 'تم إلغاء تثبيت الإعلان'
    );
    return true;
  };

  const updateAdvertisementPriority = async (adId: string, priority: number): Promise<boolean> => {
    if (!canManageAds) {
      alert('عذراً، صلاحية تعديل أولوية الإعلانات محصورة فقط على مالك النظام أو المشرف المفوض.');
      return false;
    }
    try {
      await updateDoc(doc(db, 'advertisements', adId), {
        priority,
        updatedAt: new Date().toISOString()
      });
    } catch {
      // ignore
    }
    setAdvertisements(prev => {
      const next = prev.map(a => a.id === adId ? { ...a, priority, updatedAt: new Date().toISOString() } : a);
      next.sort((a, b) => {
        if (Boolean(a.isPinned) !== Boolean(b.isPinned)) return a.isPinned ? -1 : 1;
        return (b.priority || 0) - (a.priority || 0);
      });
      localStorage.setItem('shaha_ads_cache', JSON.stringify(next));
      return next;
    });
    return true;
  };

  const getOrderedAds = (
    placement?: AdPlacement | 'all',
    categoryId?: string,
    mode: 'smart' | 'random' | 'pinned_first' = 'smart'
  ): Advertisement[] => {
    let filtered = advertisements.filter(ad => isAdActiveNow(ad));

    if (placement && placement !== 'all') {
      filtered = filtered.filter(ad => ad.placement === placement);
    }

    if (categoryId && categoryId !== 'all') {
      filtered = filtered.filter(ad => !ad.targetCategory || ad.targetCategory === 'all' || ad.targetCategory === categoryId);
    }

    // Separate pinned from unpinned
    const pinned = filtered.filter(ad => ad.isPinned);
    const unpinned = filtered.filter(ad => !ad.isPinned);

    pinned.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    if (mode === 'random') {
      // Randomize unpinned items for fair rotation
      const shuffled = [...unpinned];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return [...pinned, ...shuffled];
    }

    // Default 'smart' or 'pinned_first':
    unpinned.sort((a, b) => {
      const prioDiff = (b.priority || 0) - (a.priority || 0);
      if (prioDiff !== 0) return prioDiff;
      return (a.viewsCount || 0) - (b.viewsCount || 0);
    });

    return [...pinned, ...unpinned];
  };

  const deleteAdvertisement = async (adId: string): Promise<boolean> => {
    if (!canManageAds) {
      alert('عذراً، صلاحية حذف الإعلانات محصورة فقط على مالك النظام أو المشرف المفوض.');
      return false;
    }
    try {
      await deleteDoc(doc(db, 'advertisements', adId));
    } catch {
      // ignore
    }
    const targetTitle = advertisements.find(a => a.id === adId)?.title || adId;
    setAdvertisements(prev => {
      const next = prev.filter(a => a.id !== adId);
      localStorage.setItem('shaha_ads_cache', JSON.stringify(next));
      return next;
    });
    logAdminAction('DELETE_ADVERTISEMENT', targetTitle, 'تم حذف الإعلان نهائياً');
    return true;
  };

  const toggleAdvertisementStatus = async (adId: string, isActive: boolean): Promise<boolean> => {
    if (!canManageAds) {
      alert('عذراً، صلاحية تفعيل أو إيقاف الإعلانات محصورة فقط على مالك النظام أو المشرف المفوض.');
      return false;
    }
    try {
      await updateDoc(doc(db, 'advertisements', adId), {
        isActive,
        updatedAt: new Date().toISOString()
      });
    } catch {
      // ignore
    }
    setAdvertisements(prev => {
      const next = prev.map(a => a.id === adId ? { ...a, isActive, updatedAt: new Date().toISOString() } : a);
      localStorage.setItem('shaha_ads_cache', JSON.stringify(next));
      return next;
    });
    const adTitle = advertisements.find(a => a.id === adId)?.title || adId;
    logAdminAction(
      isActive ? 'ACTIVATE_ADVERTISEMENT' : 'PAUSE_ADVERTISEMENT',
      adTitle,
      isActive ? 'تم تفعيل ظهور الإعلان بالدليل' : 'تم إيقاف ظهور الإعلان مؤقتاً'
    );
    return true;
  };

  const recordAdView = async (adId: string): Promise<void> => {
    try {
      await updateDoc(doc(db, 'advertisements', adId), {
        viewsCount: increment(1)
      });
    } catch {
      // ignore
    }
    setAdvertisements(prev =>
      prev.map(a => a.id === adId ? { ...a, viewsCount: (a.viewsCount || 0) + 1 } : a)
    );
  };

  const recordAdClick = async (adId: string): Promise<void> => {
    try {
      await updateDoc(doc(db, 'advertisements', adId), {
        clicksCount: increment(1)
      });
    } catch {
      // ignore
    }
    setAdvertisements(prev =>
      prev.map(a => a.id === adId ? { ...a, clicksCount: (a.clicksCount || 0) + 1 } : a)
    );
  };

  const syncSeedDataToFirestore = async (): Promise<{ success: boolean; count: number }> => {
    let count = 0;
    try {
      const {
        INITIAL_CATEGORIES,
        INITIAL_EMERGENCY_NUMBERS,
        INITIAL_PUBLIC_LISTINGS,
        INITIAL_CHARITY_INITIATIVES,
        INITIAL_ADVERTISEMENTS
      } = await import('../data/initialData');
      for (const cat of INITIAL_CATEGORIES) {
        await setDoc(doc(db, 'categories', cat.id), cat, { merge: true });
        count++;
      }
      for (const em of INITIAL_EMERGENCY_NUMBERS) {
        await setDoc(doc(db, 'emergency_numbers', em.id), em, { merge: true });
        count++;
      }
      for (const list of INITIAL_PUBLIC_LISTINGS) {
        await setDoc(doc(db, 'listings', list.id), list, { merge: true });
        count++;
      }
      for (const ch of INITIAL_CHARITY_INITIATIVES) {
        await setDoc(doc(db, 'charity_initiatives', ch.id), ch, { merge: true });
        count++;
      }
      for (const ad of INITIAL_ADVERTISEMENTS) {
        await setDoc(doc(db, 'advertisements', ad.id), ad, { merge: true });
        count++;
      }
      logAdminAction('SYNC_SEED_DATA', 'الأقسام والخدمات والإعلانات', `تمت مزامنة ${count} عنصر بنجاح`);
      return { success: true, count };
    } catch (err) {
      console.error('Failed to sync seed data to Firestore', err);
      return { success: false, count };
    }
  };

  // ==================== User Management & RBAC API ====================

  const fetchUsers = async (search?: string, status?: string) => {
    if (!adminSession?.token) return;
    try {
      const query = new URLSearchParams();
      if (search) query.set('search', search);
      if (status) query.set('status', status);

      const res = await fetch(apiUrl(`/api/admin/users?${query.toString()}`), {
        headers: { Authorization: `Bearer ${adminSession.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  const banUser = async (userId: string, email: string, reason: string, durationDays: number): Promise<boolean> => {
    if (!adminSession?.token) return false;
    try {
      const res = await fetch(apiUrl('/api/admin/users/ban'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminSession.token}`
        },
        body: JSON.stringify({ userId, email, reason, durationDays })
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(prev => prev.map(u => (u.id === userId || u.email === email ? data.user : u)));
        refreshAuditLogs();
        return true;
      } else {
        alert(data.error || 'تعذر حظر المستخدم');
        return false;
      }
    } catch (err) {
      alert('فشل الاتصال بالخادم لحظر المستخدم');
      return false;
    }
  };

  const unbanUser = async (userId: string, email: string): Promise<boolean> => {
    if (!adminSession?.token) return false;
    try {
      const res = await fetch(apiUrl('/api/admin/users/unban'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminSession.token}`
        },
        body: JSON.stringify({ userId, email })
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(prev => prev.map(u => (u.id === userId || u.email === email ? data.user : u)));
        refreshAuditLogs();
        return true;
      } else {
        alert(data.error || 'تعذر إلغاء الحظر');
        return false;
      }
    } catch (err) {
      alert('فشل الاتصال بالخادم لإلغاء الحظر');
      return false;
    }
  };

  const fetchAdminMembers = async () => {
    if (!adminSession?.token) return;
    try {
      const res = await fetch(apiUrl('/api/admin/members'), {
        headers: { Authorization: `Bearer ${adminSession.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAdminMembers(data.members || []);
      }
    } catch (err) {
      console.error('Failed to fetch admin members', err);
    }
  };

  const addAdminMember = async (email: string, name: string, role: string, permissions: AdminPermission[]): Promise<boolean> => {
    if (!adminSession?.token) return false;
    try {
      const res = await fetch(apiUrl('/api/admin/members'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminSession.token}`
        },
        body: JSON.stringify({ email, name, role, permissions })
      });
      const data = await res.json();
      if (res.ok) {
        setAdminMembers(prev => [...prev, data.member]);
        refreshAuditLogs();
        return true;
      } else {
        alert(data.error || 'تعذر إضافة المشرف');
        return false;
      }
    } catch (err) {
      alert('فشل الاتصال بالخادم');
      return false;
    }
  };

  const updateAdminMember = async (id: string, updates: Partial<AdminMember>): Promise<boolean> => {
    if (!adminSession?.token) return false;
    try {
      const res = await fetch(apiUrl(`/api/admin/members/${id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminSession.token}`
        },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (res.ok) {
        setAdminMembers(prev => prev.map(m => m.id === id ? data.member : m));
        refreshAuditLogs();
        return true;
      } else {
        alert(data.error || 'تعذر تحديث المشرف');
        return false;
      }
    } catch (err) {
      alert('فشل الاتصال بالخادم');
      return false;
    }
  };

  const deleteAdminMember = async (id: string): Promise<boolean> => {
    if (!adminSession?.token) return false;
    try {
      const res = await fetch(apiUrl(`/api/admin/members/${id}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminSession.token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setAdminMembers(prev => prev.filter(m => m.id !== id));
        refreshAuditLogs();
        return true;
      } else {
        alert(data.error || 'تعذر حذف المشرف');
        return false;
      }
    } catch (err) {
      alert('فشل الاتصال بالخادم');
      return false;
    }
  };

  return (
    <DirectoryContext.Provider
      value={{
        categories,
        listings,
        bloodDonors,
        bloodRequests,
        serviceRequests,
        reports,
        reviews,
        charities,
        emergencyNumbers,
        advertisements,
        auditLogs,
        verificationBadges,
        humanitarianRequests,
        donors,
        communityPages,
        adminMessages,
        claims,
        suggestions,
        featureFlags,
        villageNews,
        platformCredits,
        mansouraSchedule,

        users,
        adminMembers,
        userBanStatus,

        currentUser,
        adminSession,
        isAdmin,
        isOwner,
        canManageAds,
        hasPermission,
        isInitializing,
        isOnline,
        isInstallable,
        installApp,
        theme,
        toggleTheme,

        signInWithGoogle: signInWithGoogleAction,
        signOut: signOutAction,
        adminLogin,
        adminLogout,
        adminChangePassword,

        submitServiceRequest,
        submitReport,
        submitReview,
        registerBloodDonor,
        submitBloodRequest,
        submitHumanitarianRequest,
        recordListingCall,
        recordListingView,
        recordListingShare,
        recordQrScan,

        submitDonorEntry,
        updateDonorStatus,
        updateDonorEntry,
        deleteDonorEntry,

        sendAdminMessage,
        replyAdminMessage,
        updateAdminMessageStatus,
        markAdminMessageAsRead,
        deleteAdminMessage,

        saveCommunityPage,
        deleteCommunityPage,
        toggleVerifyCommunityPage,

        submitListingClaim,
        reviewListingClaim,

        submitCommunitySuggestion,
        upvoteSuggestion,
        reviewCommunitySuggestion,

        updateFeatureFlags,

        saveVillageNews,
        deleteVillageNews,
        toggleNewsPin,

        savePlatformCredit,
        deletePlatformCredit,
        saveMansouraSchedule,

        saveAdvertisement,
        deleteAdvertisement,
        toggleAdvertisementStatus,
        toggleAdvertisementPin,
        updateAdvertisementPriority,
        recordAdView,
        recordAdClick,
        isAdActiveNow,
        getOrderedAds,

        saveVerificationBadge,
        deleteVerificationBadge,
        assignBadgeToListing,
        removeBadgeFromListing,
        setPrimaryBadgeForListing,

        updateHumanitarianStatus,
        updateHumanitarianProgress,
        deleteHumanitarianRequest,

        moderateReview,
        deleteReview,

        approveServiceRequest,
        rejectServiceRequest,
        resolveReport,
        dismissReport,
        saveListing,
        updateListingProfile,
        deleteListing,
        bulkUpdateListings,
        bulkDeleteListings,
        saveCategory,
        deleteCategory,
        saveEmergencyNumber,
        deleteEmergencyNumber,
        saveCharity,
        deleteCharity,
        saveBloodDonor,
        deleteBloodDonor,
        updateBloodRequestStatus,
        deleteBloodRequest,
        syncSeedDataToFirestore,
        logAdminAction,
        refreshAuditLogs,

        fetchUsers,
        banUser,
        unbanUser,
        fetchAdminMembers,
        addAdminMember,
        updateAdminMember,
        deleteAdminMember
      }}
    >
      {children}
    </DirectoryContext.Provider>
  );
};

export const useDirectory = () => {
  const context = useContext(DirectoryContext);
  if (!context) {
    throw new Error('useDirectory must be used within a DirectoryProvider');
  }
  return context;
};

// Copyright (c) 2026 MeDoAnDrOiD. All Rights Reserved.
