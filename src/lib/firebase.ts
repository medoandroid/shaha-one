// DevMeDoAnDrOiD
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  User,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  doc,
  getDocFromServer,
  type Firestore
} from 'firebase/firestore';

const firebaseDatabaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID || '';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  ...(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
    ? { measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID }
    : {})
};

let app = firebaseConfig.apiKey ? initializeApp(firebaseConfig) : null;

function createFirestoreInstance(targetApp: ReturnType<typeof initializeApp>, dbId: string): Firestore {
  try {
    return initializeFirestore(
      targetApp,
      {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager()
        })
      },
      dbId || undefined
    );
  } catch {
    return dbId ? getFirestore(targetApp, dbId) : getFirestore(targetApp);
  }
}

export let db: Firestore = app ? createFirestoreInstance(app, firebaseDatabaseId || '') : (null as unknown as Firestore);
export let auth = app ? getAuth(app) : (null as unknown as ReturnType<typeof getAuth>);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export async function initFirebaseConfig(): Promise<void> {
  if (app && db && auth) return;
  try {
    const cached = localStorage.getItem('shaha_fb_cfg_v1');
    if (cached) {
      const remote = JSON.parse(cached) as Record<string, string>;
      if (remote.apiKey && remote.projectId) {
        const resolvedDbId = remote.databaseId || firebaseDatabaseId || '';
        app = initializeApp({
          apiKey: remote.apiKey,
          authDomain: remote.authDomain,
          projectId: remote.projectId,
          storageBucket: remote.storageBucket,
          messagingSenderId: remote.messagingSenderId,
          appId: remote.appId
        });
        db = createFirestoreInstance(app, resolvedDbId);
        auth = getAuth(app);
        return;
      }
    }
  } catch {}

  const apiBase = ((import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_API_BASE_URL || '').replace(/\/+$/, '');
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 3500);
  try {
    const res = await fetch(`${apiBase}/api/firebase-config`, { signal: controller.signal });
    if (!res.ok) {
      throw new Error(`Failed to load Firebase config: HTTP ${res.status}`);
    }
    const remote = (await res.json()) as Record<string, string>;
    try {
      localStorage.setItem('shaha_fb_cfg_v1', JSON.stringify(remote));
    } catch {}
    const resolvedDbId = remote.databaseId || firebaseDatabaseId || '';
    app = initializeApp({
      apiKey: remote.apiKey,
      authDomain: remote.authDomain,
      projectId: remote.projectId,
      storageBucket: remote.storageBucket,
      messagingSenderId: remote.messagingSenderId,
      appId: remote.appId
    });
    db = createFirestoreInstance(app, resolvedDbId);
    auth = getAuth(app);
  } finally {
    window.clearTimeout(timer);
  }
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase connection check: Client might be offline or initializing.');
    }
  }
}

// Auth helpers
const POPUP_FALLBACK_CODES = [
  'auth/popup-blocked',
  'auth/operation-not-supported-in-this-environment',
  'auth/cancelled-popup-request'
];

/**
 * Sign in with Google.
 * Tries a popup first (best UX), then falls back to a full-page redirect when
 * the browser blocks popups or runs as an installed PWA / in-app browser.
 * Returns `null` when a redirect was started (the page will navigate).
 */
export async function loginWithGoogle(): Promise<User | null> {
  try {
    if (!auth) {
      await initFirebaseConfig();
    }
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err) {
    const code = (err as { code?: string })?.code ?? '';

    if (code === 'auth/popup-closed-by-user') {
      throw new AuthFlowError('أُغلقت نافذة تسجيل الدخول قبل إكمال العملية. حاول مرة أخرى.', code);
    }

    if (POPUP_FALLBACK_CODES.includes(code)) {
      await signInWithRedirect(auth, googleProvider);
      return null;
    }

    throw new AuthFlowError(getAuthErrorMessage(code), code);
  }
}

/** Complete a redirect-based Google sign-in after the page reloads. */
export async function completeGoogleRedirect(): Promise<User | null> {
  try {
    const result = await getRedirectResult(auth);
    return result?.user ?? null;
  } catch (err) {
    console.warn('Google redirect sign-in failed:', err);
    return null;
  }
}

export class AuthFlowError extends Error {
  code: string;
  constructor(message: string, code = '') {
    super(message);
    this.name = 'AuthFlowError';
    this.code = code;
  }
}

/** Map Firebase Auth error codes to clear Arabic messages. */
export function getAuthErrorMessage(code?: string): string {
  switch (code) {
    case 'auth/popup-blocked':
      return 'منع المتصفح النافذة المنبثقة. سيتم فتح صفحة تسجيل الدخول بدلاً منها.';
    case 'auth/unauthorized-domain':
      return 'هذا النطاق غير مصرّح به لتسجيل الدخول. أضف النطاق في إعدادات Firebase Authentication.';
    case 'auth/operation-not-allowed':
      return 'تسجيل الدخول بـ Google غير مفعّل حالياً في إعدادات المشروع.';
    case 'auth/network-request-failed':
      return 'تعذر الاتصال بالإنترنت. تحقق من الشبكة ثم حاول مجدداً.';
    case 'auth/too-many-requests':
      return 'محاولات كثيرة خلال وقت قصير. انتظر قليلاً ثم حاول مجدداً.';
    case 'auth/user-disabled':
      return 'تم تعطيل هذا الحساب. تواصل مع إدارة المنصة.';
    case 'auth/account-exists-with-different-credential':
      return 'هذا البريد مسجّل بطريقة دخول أخرى. استخدم نفس طريقة الدخول السابقة.';
    default:
      return 'تعذر إكمال تسجيل الدخول. تحقق من اتصالك وحاول مرة أخرى.';
  }
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// Copyright (c) 2026 MeDoAnDrOiD. All Rights Reserved.
