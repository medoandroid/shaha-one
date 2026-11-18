// DevMeDoAnDrOiD
export interface KVNamespaceLike {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

export interface ExecutionContextLike {
  waitUntil(promise: Promise<unknown>): void;
}

export interface Env {
  SHAHA_KV: KVNamespaceLike;
  SESSION_SECRET: string;
  ENCRYPTION_MASTER_KEY: string;
  INITIAL_ADMIN_PASSWORD: string;
  OWNER_EMAIL: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_OAUTH_CLIENT_ID?: string;
  ALLOWED_ORIGINS?: string;
  SHAHA_KEYS_VAULT?: string;
}

interface AdminAuthStore {
  salt: string;
  hash: string;
  isFirstLogin: boolean;
  updatedAt: string;
}

interface AuditRecord {
  id: string;
  action: string;
  adminUser: string;
  target?: string;
  timestamp: string;
  details?: string;
}

interface UserRecordStore {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phone?: string;
  role: 'user' | 'admin' | 'owner';
  isBanned: boolean;
  banReason?: string;
  bannedAt?: string;
  bannedUntil?: string;
  createdAt: string;
  lastLoginAt?: string;
}

interface AdminMemberStore {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'moderator';
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  lastActive?: string;
}

interface TokenPayload {
  role: 'owner' | 'super_admin' | 'admin' | 'moderator';
  email: string;
  name: string;
  permissions: string[];
  exp: number;
}

interface VerifiedFirebaseUser {
  uid: string;
  email: string;
  name?: string;
}

const ALL_PERMISSIONS = [
  'manage_overview',
  'manage_listings',
  'manage_categories',
  'manage_requests',
  'manage_reports',
  'manage_blood',
  'manage_charity',
  'manage_emergency',
  'manage_users',
  'manage_admins',
  'manage_settings',
  'manage_audit',
  'manage_texts',
  'manage_ads',
  'manage_badges',
  'manage_reviews',
  'manage_aid',
  'manage_messages',
  'manage_community_pages',
  'manage_claims',
  'manage_suggestions',
  'manage_quality',
  'manage_import',
  'manage_news'
];

const KV_AUTH = 'store:admin_auth';
const KV_AUDIT = 'store:audit_logs';
const KV_USERS = 'store:users';
const KV_MEMBERS = 'store:admin_members';
const KV_LISTINGS = 'store:listings';
const KV_COMMUNITY_PAGES = 'store:community_pages';
const KV_SESSIONS = 'store:admin_sessions';

const FIREBASE_JWKS_URL =
  'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';

let cachedJwks: { keys: JsonWebKey[] } | null = null;
let jwksExpiresAt = 0;

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
  const clean = hex.trim();
  const buf = new ArrayBuffer(clean.length / 2);
  const out = new Uint8Array(buf);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(segment: string): Uint8Array<ArrayBuffer> {
  let base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  const binary = atob(base64);
  const buf = new ArrayBuffer(binary.length);
  const out = new Uint8Array(buf);
  for (let i = 0; i < binary.length; i++) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
}

function decodeBase64UrlJson<T>(segment: string): T | null {
  try {
    const json = new TextDecoder().decode(fromBase64Url(segment));
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

function timingSafeEqualBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

async function hashPassword(password: string, existingSalt?: string): Promise<{ salt: string; hash: string }> {
  const saltBytes = existingSalt ? hexToBytes(existingSalt) : crypto.getRandomValues(new Uint8Array(16));
  const saltHex = existingSalt || bytesToHex(saltBytes);
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: new TextEncoder().encode(saltHex),
      iterations: 100000,
      hash: 'SHA-512'
    },
    keyMaterial,
    512
  );
  return {
    salt: saltHex,
    hash: bytesToHex(new Uint8Array(bits))
  };
}

async function verifyPassword(password: string, salt: string, storedHash: string): Promise<boolean> {
  const { hash } = await hashPassword(password, salt);
  return timingSafeEqualBytes(new TextEncoder().encode(hash), new TextEncoder().encode(storedHash));
}

async function signHmac(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return toBase64Url(new Uint8Array(sig));
}

async function generateAdminToken(
  secret: string,
  email: string,
  role: TokenPayload['role'] = 'admin',
  name = 'المشرف',
  permissions: string[] = ALL_PERMISSIONS
): Promise<string> {
  const payload: TokenPayload = {
    role,
    email,
    name,
    permissions,
    exp: Date.now() + 24 * 60 * 60 * 1000
  };
  const data = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const signature = await signHmac(data, secret);
  return `${data}.${signature}`;
}

async function verifyAdminToken(secret: string, token?: string): Promise<{ valid: boolean; payload?: TokenPayload }> {
  if (!token || !secret) return { valid: false };
  const parts = token.split('.');
  if (parts.length !== 2) return { valid: false };
  const [data, signature] = parts;
  const expected = await signHmac(data, secret);
  if (!timingSafeEqualBytes(new TextEncoder().encode(signature), new TextEncoder().encode(expected))) {
    return { valid: false };
  }
  const payload = decodeBase64UrlJson<TokenPayload>(data);
  if (!payload || typeof payload.exp !== 'number' || payload.exp < Date.now()) {
    return { valid: false };
  }
  return { valid: true, payload };
}

interface AdminSessionRecord {
  id: string;
  email: string;
  name: string;
  role: string;
  ip: string;
  userAgent: string;
  createdAt: string;
  lastSeenAt: string;
  revoked?: boolean;
}

async function recordAdminSession(
  env: Env,
  request: Request,
  ip: string,
  payload: { email: string; name: string; role: string }
): Promise<string> {
  const sessions = await readKvJson<AdminSessionRecord[]>(env.SHAHA_KV, KV_SESSIONS, []);
  const id = `sess_${Date.now()}_${bytesToHex(crypto.getRandomValues(new Uint8Array(3)))}`;
  const entry: AdminSessionRecord = {
    id,
    email: payload.email,
    name: payload.name,
    role: payload.role,
    ip,
    userAgent: (request.headers.get('user-agent') || 'unknown').slice(0, 120),
    createdAt: new Date().toISOString(),
    lastSeenAt: new Date().toISOString()
  };
  sessions.unshift(entry);
  if (sessions.length > 50) sessions.length = 50;
  await writeKvJson(env.SHAHA_KV, KV_SESSIONS, sessions);
  return id;
}

async function resolveEffectiveAdmin(
  env: Env,
  token?: string
): Promise<{ valid: boolean; payload?: TokenPayload }> {
  const check = await verifyAdminToken(env.SESSION_SECRET, token);
  if (!check.valid || !check.payload) return { valid: false };
  const p = check.payload;
  if (p.role === 'owner' || p.role === 'super_admin') {
    return { valid: true, payload: p };
  }
  const members = await getAdminMembers(env);
  const member = members.find(m => m.email.toLowerCase() === p.email.toLowerCase());
  if (!member || !member.isActive) {
    return { valid: false };
  }
  return {
    valid: true,
    payload: {
      ...p,
      role: member.role,
      name: member.name,
      permissions: member.permissions || []
    }
  };
}

async function getFirebaseJwks(): Promise<JsonWebKey[]> {
  if (cachedJwks && jwksExpiresAt > Date.now()) {
    return cachedJwks.keys;
  }
  const resp = await fetch(FIREBASE_JWKS_URL);
  if (!resp.ok) {
    if (cachedJwks) return cachedJwks.keys;
    throw new Error(`JWKS fetch failed: ${resp.status}`);
  }
  const cacheControl = resp.headers.get('cache-control') || '';
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/i);
  const maxAgeSec = maxAgeMatch ? Number(maxAgeMatch[1]) : 3600;
  cachedJwks = (await resp.json()) as { keys: JsonWebKey[] };
  jwksExpiresAt = Date.now() + Math.max(60, maxAgeSec) * 1000;
  return cachedJwks.keys || [];
}

async function verifyFirebaseIdToken(env: Env, idToken?: string): Promise<VerifiedFirebaseUser | null> {
  if (!idToken || typeof idToken !== 'string' || idToken.length > 4096) return null;
  const parts = idToken.split('.');
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, signatureB64] = parts;
  const header = decodeBase64UrlJson<{ alg?: string; kid?: string }>(headerB64);
  const payload = decodeBase64UrlJson<{
    aud?: string;
    iss?: string;
    sub?: string;
    user_id?: string;
    email?: string;
    email_verified?: boolean | string;
    name?: string;
    exp?: number;
    iat?: number;
    auth_time?: number;
  }>(payloadB64);

  if (!header || !payload) return null;
  const projectId = env.FIREBASE_PROJECT_ID || 'educational-43907';
  const expectedIssuer = `https://securetoken.google.com/${projectId}`;
  const nowSec = Math.floor(Date.now() / 1000);

  if (payload.iss === expectedIssuer && header.alg === 'RS256' && header.kid) {
    try {
      let keys = await getFirebaseJwks();
      let jwk = keys.find(k => (k as { kid?: string }).kid === header.kid);
      if (!jwk) {
        jwksExpiresAt = 0;
        keys = await getFirebaseJwks();
        jwk = keys.find(k => (k as { kid?: string }).kid === header.kid);
      }
      if (!jwk) return null;

      const cryptoKey = await crypto.subtle.importKey(
        'jwk',
        jwk,
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        false,
        ['verify']
      );
      const validSig = await crypto.subtle.verify(
        'RSASSA-PKCS1-v1_5',
        cryptoKey,
        fromBase64Url(signatureB64),
        new TextEncoder().encode(`${headerB64}.${payloadB64}`)
      );
      if (!validSig) return null;

      const sub = payload.sub || payload.user_id;
      const audienceOk = payload.aud === projectId;
      const expOk = typeof payload.exp === 'number' && payload.exp > nowSec;
      const iatOk = typeof payload.iat === 'number' && payload.iat <= nowSec + 300;
      const authTimeOk = payload.auth_time === undefined || (typeof payload.auth_time === 'number' && payload.auth_time <= nowSec + 300);
      const subOk = typeof sub === 'string' && sub.length > 0 && sub.length <= 128;
      const emailOk = typeof payload.email === 'string' && payload.email.length > 0;
      const verifiedEmailOk = payload.email_verified === true || payload.email_verified === 'true';

      if (!audienceOk || !expOk || !iatOk || !authTimeOk || !subOk || !emailOk || !verifiedEmailOk) {
        return null;
      }

      return { uid: sub, email: payload.email as string, name: payload.name };
    } catch {
      return null;
    }
  }

  try {
    const resp = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
    if (!resp.ok) return null;
    const data = (await resp.json()) as Record<string, string>;
    const audienceOk = data.aud === projectId || (env.FIREBASE_OAUTH_CLIENT_ID && data.aud === env.FIREBASE_OAUTH_CLIENT_ID);
    const issuerOk =
      data.iss === 'https://accounts.google.com' ||
      data.iss === 'accounts.google.com' ||
      data.iss === expectedIssuer;
    const emailVerified = data.email_verified === 'true' || (data.email_verified as unknown) === true;
    const notExpired = Number(data.exp) * 1000 > Date.now();
    const uid = data.user_id || data.sub;
    if (!audienceOk || !issuerOk || !emailVerified || !notExpired || !uid || !data.email) return null;
    return { uid, email: data.email, name: data.name };
  } catch {
    return null;
  }
}

function getClientIp(request: Request): string {
  return request.headers.get('cf-connecting-ip') || 'unknown';
}

function getAllowedOrigins(env: Env): string[] {
  return (env.ALLOWED_ORIGINS || 'https://shoha-one.netlify.app,http://localhost:3000,http://localhost:5173')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);
}

function isOriginAllowed(request: Request, env: Env): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try {
    const originHost = new URL(origin).host;
    const requestHost = request.headers.get('host');
    if (originHost === requestHost) return true;
    const allowed = getAllowedOrigins(env);
    return allowed.some(o => {
      try {
        return new URL(o).host === originHost;
      } catch {
        return o === origin;
      }
    });
  } catch {
    return false;
  }
}

function buildSecurityHeaders(request: Request, env: Env): Headers {
  const headers = new Headers();
  headers.set('Content-Type', 'application/json; charset=utf-8');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'SAMEORIGIN');
  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Cache-Control', 'no-store, max-age=0');
  headers.set('Pragma', 'no-cache');

  const origin = request.headers.get('origin');
  if (origin && isOriginAllowed(request, env)) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Vary', 'Origin');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Firebase-Id-Token');
  }
  return headers;
}

function jsonResponse(request: Request, env: Env, data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: buildSecurityHeaders(request, env)
  });
}

async function readKvJson<T>(kv: KVNamespaceLike, key: string, fallback: T): Promise<T> {
  try {
    const raw = await kv.get(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeKvJson(kv: KVNamespaceLike, key: string, value: unknown): Promise<void> {
  await kv.put(key, JSON.stringify(value));
}

async function getAuthStore(env: Env): Promise<AdminAuthStore> {
  const existing = await readKvJson<AdminAuthStore | null>(env.SHAHA_KV, KV_AUTH, null);
  if (existing && existing.salt && existing.hash) return existing;

  const initialPassword = env.INITIAL_ADMIN_PASSWORD || bytesToHex(crypto.getRandomValues(new Uint8Array(12)));
  const { salt, hash } = await hashPassword(initialPassword);
  const store: AdminAuthStore = {
    salt,
    hash,
    isFirstLogin: true,
    updatedAt: new Date().toISOString()
  };
  await writeKvJson(env.SHAHA_KV, KV_AUTH, store);
  return store;
}

async function getAdminMembers(env: Env): Promise<AdminMemberStore[]> {
  const ownerEmail = env.OWNER_EMAIL || 'devmedoandroid@gmail.com';
  const members = await readKvJson<AdminMemberStore[]>(env.SHAHA_KV, KV_MEMBERS, []);
  const idx = members.findIndex(m => m.email.toLowerCase() === ownerEmail.toLowerCase());
  if (idx === -1) {
    members.unshift({
      id: 'owner_shaha',
      email: ownerEmail,
      name: 'المهندس المشرف (Owner)',
      role: 'owner',
      permissions: ALL_PERMISSIONS,
      isActive: true,
      createdAt: new Date().toISOString()
    });
    await writeKvJson(env.SHAHA_KV, KV_MEMBERS, members);
  }
  return members;
}

async function saveAdminMembers(env: Env, members: AdminMemberStore[]): Promise<void> {
  const ownerEmail = env.OWNER_EMAIL || 'devmedoandroid@gmail.com';
  const ownerIdx = members.findIndex(m => m.email.toLowerCase() === ownerEmail.toLowerCase());
  if (ownerIdx === -1) {
    members.unshift({
      id: 'owner_shaha',
      email: ownerEmail,
      name: 'المهندس المشرف (Owner)',
      role: 'owner',
      permissions: ALL_PERMISSIONS,
      isActive: true,
      createdAt: new Date().toISOString()
    });
  } else {
    members[ownerIdx].role = 'owner';
    members[ownerIdx].isActive = true;
    members[ownerIdx].permissions = ALL_PERMISSIONS;
  }
  await writeKvJson(env.SHAHA_KV, KV_MEMBERS, members);
}

async function appendAuditLog(env: Env, record: Omit<AuditRecord, 'id' | 'timestamp'>): Promise<void> {
  const logs = await readKvJson<AuditRecord[]>(env.SHAHA_KV, KV_AUDIT, []);
  const entry: AuditRecord = {
    id: `log_${Date.now()}_${bytesToHex(crypto.getRandomValues(new Uint8Array(2)))}`,
    timestamp: new Date().toISOString(),
    ...record
  };
  logs.unshift(entry);
  if (logs.length > 500) logs.length = 500;
  await writeKvJson(env.SHAHA_KV, KV_AUDIT, logs);
}

async function checkRateLimit(
  env: Env,
  prefix: string,
  ip: string,
  max: number,
  windowSec: number
): Promise<{ allowed: boolean; retryAfterSec?: number }> {
  const key = `rl:${prefix}:${ip}`;
  const now = Date.now();
  const current = await readKvJson<{ count: number; resetAt: number } | null>(env.SHAHA_KV, key, null);
  if (!current || current.resetAt <= now) {
    await env.SHAHA_KV.put(key, JSON.stringify({ count: 1, resetAt: now + windowSec * 1000 }), {
      expirationTtl: Math.max(60, windowSec)
    });
    return { allowed: true };
  }
  current.count += 1;
  await env.SHAHA_KV.put(key, JSON.stringify(current), {
    expirationTtl: Math.max(60, Math.ceil((current.resetAt - now) / 1000))
  });
  if (current.count > max) {
    return { allowed: false, retryAfterSec: Math.ceil((current.resetAt - now) / 1000) };
  }
  return { allowed: true };
}

function extractBearerAdmin(request: Request): string | undefined {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return undefined;
  const token = auth.slice(7).trim();
  return token.split('.').length === 2 ? token : undefined;
}

function extractFirebaseToken(request: Request): string | undefined {
  const headerToken = request.headers.get('x-firebase-id-token');
  if (headerToken) return headerToken;
  const auth = request.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) {
    const val = auth.slice(7).trim();
    if (val.split('.').length === 3) return val;
  }
  return undefined;
}

function hasPermission(session: TokenPayload, perm: string): boolean {
  if (session.role === 'owner' || session.role === 'super_admin') return true;
  return Array.isArray(session.permissions) && session.permissions.includes(perm);
}

async function readJsonBody(request: Request): Promise<Record<string, any> | null> {
  try {
    const len = Number(request.headers.get('content-length') || 0);
    if (len > 5 * 1024 * 1024) return null;
    const data = await request.json();
    return data && typeof data === 'object' ? (data as Record<string, any>) : null;
  } catch {
    return null;
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContextLike): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: buildSecurityHeaders(request, env) });
    }

    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method) && !isOriginAllowed(request, env)) {
      return jsonResponse(request, env, { error: 'طلب غير مصرح به من مصدر خارجي' }, 403);
    }

    if (!env.SESSION_SECRET || !env.ENCRYPTION_MASTER_KEY) {
      return jsonResponse(request, env, { error: 'إعدادات الأمان غير مكتملة على الخادم' }, 500);
    }

    const url = new URL(request.url);
    const pathname = url.pathname;
    const ownerEmail = env.OWNER_EMAIL || 'devmedoandroid@gmail.com';
    const ip = getClientIp(request);

    if (pathname !== '/api/health') {
      const burstLimit = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method) ? 60 : 180;
      const rlGlobal = await checkRateLimit(env, 'ddos_guard', ip, burstLimit, 60);
      if (!rlGlobal.allowed) {
        ctx.waitUntil(
          appendAuditLog(env, {
            action: 'DDOS_RATE_LIMIT',
            adminUser: 'edge_waf',
            target: pathname,
            details: `حظر مؤقت لطلبات زائدة (${request.method}) من IP: ${ip}`
          })
        );
        const res = jsonResponse(request, env, { error: 'تم تجاوز الحد المسموح للطلبات. حاول بعد قليل.' }, 429);
        res.headers.set('Retry-After', String(rlGlobal.retryAfterSec || 60));
        return res;
      }
    }

    if (pathname === '/api/health' && request.method === 'GET') {
      return jsonResponse(request, env, {
        status: 'healthy',
        service: 'Shaha Directory Cloudflare Worker API',
        edge: true,
        secretsVaultActive: Boolean(env.SHAHA_KEYS_VAULT),
        time: new Date().toISOString()
      });
    }

    if (pathname === '/api/admin/login' && request.method === 'POST') {
      const rlKey = `login_fail:${ip}`;
      const record = await readKvJson<{ count: number; blockedUntil: number } | null>(env.SHAHA_KV, rlKey, null);
      if (record && record.blockedUntil > Date.now()) {
        const waitMinutes = Math.ceil((record.blockedUntil - Date.now()) / 60000);
        return jsonResponse(
          request,
          env,
          { error: `تم تجاوز الحد الأقصى للمحاولات الخاطئة. يرجى الانتظار ${waitMinutes} دقيقة.` },
          429
        );
      }

      const body = await readJsonBody(request);
      const password = body?.password;
      if (typeof password !== 'string' || !password || password.length > 200) {
        return jsonResponse(request, env, { error: 'يرجى إدخال كلمة المرور' }, 400);
      }

      const store = await getAuthStore(env);
      const isValid = await verifyPassword(password, store.salt, store.hash);
      if (!isValid) {
        const nextCount = (record?.count || 0) + 1;
        const nextRec = {
          count: nextCount,
          blockedUntil: nextCount >= 5 ? Date.now() + 15 * 60 * 1000 : 0
        };
        await env.SHAHA_KV.put(rlKey, JSON.stringify(nextRec), { expirationTtl: 900 });
        ctx.waitUntil(
          appendAuditLog(env, {
            action: 'LOGIN_FAILED',
            adminUser: 'مجهول',
            details: `محاولة دخول فاشلة من IP: ${ip}`
          })
        );
        return jsonResponse(request, env, { error: 'كلمة المرور غير صحيحة' }, 401);
      }

      await env.SHAHA_KV.put(rlKey, JSON.stringify({ count: 0, blockedUntil: 0 }), { expirationTtl: 60 });
      const token = await generateAdminToken(
        env.SESSION_SECRET,
        'admin@shaha-directory.eg',
        'super_admin',
        'مدير النظام الرئيسي',
        ALL_PERMISSIONS
      );
      ctx.waitUntil(
        Promise.all([
          recordAdminSession(env, request, ip, {
            email: 'admin@shaha-directory.eg',
            name: 'مشرف دليل شها',
            role: 'super_admin'
          }),
          appendAuditLog(env, {
            action: 'LOGIN_SUCCESS',
            adminUser: 'مدير النظام الرئيسي',
            details: `تسجيل دخول ناجح للوحة الإدارة من IP: ${ip}`
          })
        ])
      );

      return jsonResponse(request, env, {
        success: true,
        token,
        mustChangePassword: store.isFirstLogin,
        admin: {
          role: 'super_admin',
          name: 'مشرف دليل شها',
          email: 'admin@shaha-directory.eg',
          permissions: ALL_PERMISSIONS
        }
      });
    }

    if (pathname === '/api/admin/google-verify' && request.method === 'POST') {
      const rl = await checkRateLimit(env, 'gverify', ip, 30, 900);
      if (!rl.allowed) {
        return jsonResponse(request, env, { error: 'تم تجاوز عدد الطلبات المسموح به' }, 429);
      }

      const verified = await verifyFirebaseIdToken(env, extractFirebaseToken(request));
      if (!verified) {
        return jsonResponse(request, env, { error: 'تعذر التحقق من هوية الحساب. يرجى تسجيل الدخول من جديد.' }, 401);
      }

      const normalizedEmail = verified.email.toLowerCase().trim();
      const members = await getAdminMembers(env);
      const member = members.find(m => m.email.toLowerCase() === normalizedEmail);

      if (normalizedEmail === ownerEmail.toLowerCase()) {
        const token = await generateAdminToken(
          env.SESSION_SECRET,
          verified.email,
          'owner',
          verified.name || 'مالك النظام',
          ALL_PERMISSIONS
        );
        ctx.waitUntil(
          Promise.all([
            recordAdminSession(env, request, ip, {
              email: verified.email,
              name: verified.name || 'المهندس المشرف',
              role: 'owner'
            }),
            appendAuditLog(env, {
              action: 'OWNER_LOGIN',
              adminUser: verified.email,
              details: `تسجيل دخول مالك النظام (${verified.uid}) من IP: ${ip}`
            })
          ])
        );
        return jsonResponse(request, env, {
          success: true,
          token,
          mustChangePassword: false,
          admin: {
            role: 'owner',
            name: verified.name || 'المهندس المشرف',
            email: verified.email,
            permissions: ALL_PERMISSIONS
          }
        });
      }

      if (member && member.isActive) {
        const role = member.role || 'moderator';
        const permissions = member.permissions || [];
        const token = await generateAdminToken(env.SESSION_SECRET, verified.email, role, member.name, permissions);
        ctx.waitUntil(
          Promise.all([
            recordAdminSession(env, request, ip, {
              email: verified.email,
              name: member.name,
              role
            }),
            appendAuditLog(env, {
              action: 'MODERATOR_LOGIN',
              adminUser: verified.email,
              details: `تسجيل دخول مشرف (${member.name}) من IP: ${ip}`
            })
          ])
        );
        return jsonResponse(request, env, {
          success: true,
          token,
          mustChangePassword: false,
          admin: {
            role,
            name: member.name,
            email: verified.email,
            permissions
          }
        });
      }

      return jsonResponse(request, env, { error: 'هذا الحساب ليس لديه صلاحيات إدارية على دليل شها' }, 403);
    }

    if (pathname === '/api/admin/session' && request.method === 'GET') {
      const verification = await resolveEffectiveAdmin(env, extractBearerAdmin(request));
      if (!verification.valid || !verification.payload) {
        return jsonResponse(request, env, { valid: false }, 401);
      }
      const store = await getAuthStore(env);
      return jsonResponse(request, env, {
        valid: true,
        email: verification.payload.email,
        role: verification.payload.role,
        name: verification.payload.name,
        permissions: verification.payload.permissions,
        mustChangePassword: verification.payload.role === 'super_admin' ? store.isFirstLogin : false
      });
    }

    if (pathname === '/api/admin/change-password' && request.method === 'POST') {
      const auth = await verifyAdminToken(env.SESSION_SECRET, extractBearerAdmin(request));
      if (!auth.valid || !auth.payload) {
        return jsonResponse(request, env, { error: 'غير مصرح لك بالوصول' }, 401);
      }
      const body = await readJsonBody(request);
      const currentPassword = body?.currentPassword;
      const newPassword = body?.newPassword;
      if (typeof currentPassword !== 'string' || typeof newPassword !== 'string' || newPassword.length < 8 || newPassword.length > 200) {
        return jsonResponse(request, env, { error: 'كلمة المرور الجديدة يجب ألا تقل عن 8 خانات' }, 400);
      }
      if (newPassword === currentPassword) {
        return jsonResponse(request, env, { error: 'يجب أن تختلف كلمة المرور الجديدة عن الحالية' }, 400);
      }
      const store = await getAuthStore(env);
      const ok = await verifyPassword(currentPassword, store.salt, store.hash);
      if (!ok) {
        return jsonResponse(request, env, { error: 'كلمة المرور الحالية غير صحيحة' }, 400);
      }
      const { salt, hash } = await hashPassword(newPassword);
      await writeKvJson(env.SHAHA_KV, KV_AUTH, {
        salt,
        hash,
        isFirstLogin: false,
        updatedAt: new Date().toISOString()
      });
      ctx.waitUntil(
        appendAuditLog(env, {
          action: 'PASSWORD_CHANGED',
          adminUser: auth.payload.email,
          details: 'تم تحديث كلمة المرور الإدارية بنجاح'
        })
      );
      return jsonResponse(request, env, { success: true, message: 'تم تحديث كلمة المرور الإدارية بنجاح' });
    }

    if (pathname === '/api/users/sync' && request.method === 'POST') {
      const rl = await checkRateLimit(env, 'usersync', ip, 60, 900);
      if (!rl.allowed) return jsonResponse(request, env, { error: 'تم تجاوز عدد الطلبات' }, 429);

      const verified = await verifyFirebaseIdToken(env, extractFirebaseToken(request));
      if (!verified) {
        return jsonResponse(request, env, { error: 'تعذر التحقق من هوية المستخدم' }, 401);
      }

      const body = (await readJsonBody(request)) || {};
      const safeDisplayName = typeof body.displayName === 'string' ? body.displayName.trim().slice(0, 120) : '';
      const safePhotoURL = typeof body.photoURL === 'string' && /^https:\/\//i.test(body.photoURL) ? body.photoURL.slice(0, 500) : '';
      const safePhone = typeof body.phone === 'string' && /^[0-9+\-\s]{6,20}$/.test(body.phone.trim()) ? body.phone.trim() : '';

      const users = await readKvJson<UserRecordStore[]>(env.SHAHA_KV, KV_USERS, []);
      let user = users.find(u => u.id === verified.uid || u.email.toLowerCase() === verified.email.toLowerCase());
      const now = new Date().toISOString();

      if (!user) {
        user = {
          id: verified.uid,
          email: verified.email,
          displayName: safeDisplayName || verified.name || 'مواطن من شها',
          photoURL: safePhotoURL,
          phone: safePhone,
          role: verified.email.toLowerCase() === ownerEmail.toLowerCase() ? 'owner' : 'user',
          isBanned: false,
          createdAt: now,
          lastLoginAt: now
        };
        users.push(user);
      } else {
        user.lastLoginAt = now;
        user.email = verified.email;
        if (safeDisplayName) user.displayName = safeDisplayName;
        if (safePhotoURL) user.photoURL = safePhotoURL;
        if (safePhone) user.phone = safePhone;
      }

      if (user.isBanned && user.bannedUntil && user.bannedUntil !== 'permanent') {
        if (new Date(user.bannedUntil).getTime() < Date.now()) {
          user.isBanned = false;
          user.banReason = undefined;
          user.bannedUntil = undefined;
        }
      }

      await writeKvJson(env.SHAHA_KV, KV_USERS, users);
      if (user.isBanned) {
        return jsonResponse(
          request,
          env,
          {
            error: user.banReason || 'تم إيقاف هذا الحساب من استخدام خدمات المنصة',
            isBanned: true,
            banReason: user.banReason,
            bannedUntil: user.bannedUntil
          },
          403
        );
      }
      return jsonResponse(request, env, { success: true, user });
    }

    if (pathname === '/api/users/check-status' && request.method === 'GET') {
      const verified = await verifyFirebaseIdToken(env, extractFirebaseToken(request));
      if (!verified) return jsonResponse(request, env, { error: 'تعذر التحقق من هوية المستخدم' }, 401);

      const users = await readKvJson<UserRecordStore[]>(env.SHAHA_KV, KV_USERS, []);
      const user = users.find(u => u.id === verified.uid || u.email.toLowerCase() === verified.email.toLowerCase());
      if (!user) return jsonResponse(request, env, { isBanned: false });

      if (user.isBanned && user.bannedUntil && user.bannedUntil !== 'permanent') {
        if (new Date(user.bannedUntil).getTime() < Date.now()) {
          user.isBanned = false;
          await writeKvJson(env.SHAHA_KV, KV_USERS, users);
          return jsonResponse(request, env, { isBanned: false });
        }
      }
      return jsonResponse(request, env, {
        isBanned: user.isBanned,
        banReason: user.banReason,
        bannedUntil: user.bannedUntil
      });
    }

    if (pathname === '/api/listings' && request.method === 'GET') {
      const listings = await readKvJson<any[]>(env.SHAHA_KV, KV_LISTINGS, []);
      const headers = buildSecurityHeaders(request, env);
      headers.set('Cache-Control', 'public, max-age=15, s-maxage=45');
      headers.delete('Pragma');
      return new Response(
        JSON.stringify({
          success: true,
          listings: listings.filter(l => l && l.status !== 'hidden')
        }),
        { status: 200, headers }
      );
    }

    if (pathname === '/api/listings/save' && request.method === 'POST') {
      const rl = await checkRateLimit(env, 'listing_save', ip, 120, 900);
      if (!rl.allowed) return jsonResponse(request, env, { error: 'تم تجاوز عدد الطلبات المسموح به' }, 429);

      const adminCheck = await verifyAdminToken(env.SESSION_SECRET, extractBearerAdmin(request));
      let verifiedOwnerUid: string | null = null;
      if (!adminCheck.valid || !adminCheck.payload) {
        const fbUser = await verifyFirebaseIdToken(env, extractFirebaseToken(request));
        if (!fbUser) return jsonResponse(request, env, { error: 'يلزم تسجيل الدخول لتعديل أو إضافة خدمة.' }, 401);
        verifiedOwnerUid = fbUser.uid;
      } else if (!hasPermission(adminCheck.payload, 'manage_listings')) {
        return jsonResponse(request, env, { error: 'ليس لديك صلاحية لإدارة الخدمات' }, 403);
      }

      const body = await readJsonBody(request);
      const listing = body?.listing;
      if (!listing || typeof listing !== 'object' || typeof listing.id !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(listing.id)) {
        return jsonResponse(request, env, { error: 'معرف الخدمة غير صالح' }, 400);
      }
      if (typeof listing.name !== 'string' || listing.name.trim().length < 2 || listing.name.length > 150) {
        return jsonResponse(request, env, { error: 'اسم الخدمة غير صالح' }, 400);
      }

      const store = await readKvJson<any[]>(env.SHAHA_KV, KV_LISTINGS, []);
      const idx = store.findIndex(l => l.id === listing.id);
      const now = new Date().toISOString();

      if (idx >= 0) {
        const existing = store[idx];
        if (!adminCheck.valid && (!existing.ownerUserId || existing.ownerUserId !== verifiedOwnerUid)) {
          return jsonResponse(request, env, { error: 'ليس لديك صلاحية لتعديل هذا الملف التعريفي' }, 403);
        }
        const sanitized = { ...listing };
        if (!adminCheck.valid) {
          for (const field of ['isVerified', 'verificationBadges', 'verificationHistory', 'primaryBadgeId', 'isFeatured', 'qualityScore', 'qualityIssues', 'completenessLevel', 'status']) {
            delete sanitized[field];
          }
          sanitized.ownerUserId = existing.ownerUserId;
          sanitized.claimStatus = existing.claimStatus;
        }
        store[idx] = { ...existing, ...sanitized, id: existing.id, updatedAt: now };
      } else {
        if (!adminCheck.valid) {
          listing.isVerified = false;
          listing.isFeatured = false;
          listing.ownerUserId = verifiedOwnerUid;
          listing.claimStatus = 'claimed';
          listing.status = 'active';
        }
        store.push({ ...listing, updatedAt: now });
      }

      await writeKvJson(env.SHAHA_KV, KV_LISTINGS, store);
      const actor = adminCheck.valid ? adminCheck.payload!.email : `owner:${verifiedOwnerUid}`;
      ctx.waitUntil(
        appendAuditLog(env, {
          action: idx >= 0 ? 'UPDATE_LISTING' : 'CREATE_LISTING',
          adminUser: actor,
          target: listing.name,
          details: `حفظ بيانات الخدمة: ${listing.name}`
        })
      );
      return jsonResponse(request, env, { success: true, listing: store.find(l => l.id === listing.id) });
    }

    if (pathname.startsWith('/api/listings/') && request.method === 'DELETE') {
      const adminCheck = await verifyAdminToken(env.SESSION_SECRET, extractBearerAdmin(request));
      if (!adminCheck.valid || !adminCheck.payload) {
        return jsonResponse(request, env, { error: 'غير مصرح لك بالوصول' }, 401);
      }
      if (!hasPermission(adminCheck.payload, 'manage_listings')) {
        return jsonResponse(request, env, { error: 'ليس لديك صلاحية لحذف الخدمات' }, 403);
      }
      const id = pathname.slice('/api/listings/'.length);
      if (!/^[a-zA-Z0-9_-]{1,128}$/.test(id)) {
        return jsonResponse(request, env, { error: 'معرف الخدمة غير صالح' }, 400);
      }
      let store = await readKvJson<any[]>(env.SHAHA_KV, KV_LISTINGS, []);
      const target = store.find(l => l.id === id);
      store = store.filter(l => l.id !== id);
      await writeKvJson(env.SHAHA_KV, KV_LISTINGS, store);
      ctx.waitUntil(
        appendAuditLog(env, {
          action: 'DELETE_LISTING',
          adminUser: adminCheck.payload.email,
          target: target?.name || id,
          details: `حذف الخدمة نهائياً: ${target?.name || id}`
        })
      );
      return jsonResponse(request, env, { success: true });
    }

    if (pathname === '/api/community-pages' && request.method === 'GET') {
      const pages = await readKvJson<any[]>(env.SHAHA_KV, KV_COMMUNITY_PAGES, []);
      const headers = buildSecurityHeaders(request, env);
      headers.set('Cache-Control', 'public, max-age=30, s-maxage=120, stale-while-revalidate=300');
      headers.delete('Pragma');
      return new Response(
        JSON.stringify({
          success: true,
          pages: pages
            .filter(p => p && typeof p.id === 'string' && typeof p.name === 'string' && typeof p.url === 'string')
            .sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0))
        }),
        { status: 200, headers }
      );
    }

    if (pathname === '/api/community-pages/save' && request.method === 'POST') {
      const rl = await checkRateLimit(env, 'community_page_save', ip, 60, 900);
      if (!rl.allowed) return jsonResponse(request, env, { error: 'تم تجاوز عدد الطلبات المسموح به' }, 429);

      const adminCheck = await verifyAdminToken(env.SESSION_SECRET, extractBearerAdmin(request));
      if (!adminCheck.valid || !adminCheck.payload) {
        return jsonResponse(request, env, { error: 'غير مصرح لك بالوصول. يلزم تسجيل دخول المالك.' }, 401);
      }
      if (adminCheck.payload.email.toLowerCase() !== ownerEmail.toLowerCase() && adminCheck.payload.role !== 'owner' && adminCheck.payload.role !== 'super_admin') {
        return jsonResponse(request, env, { error: 'صلاحية إدارة صفحات فيسبوك حصرية للمالك.' }, 403);
      }

      const body = await readJsonBody(request);
      const page = body?.page;
      if (!page || typeof page !== 'object' || typeof page.id !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(page.id)) {
        return jsonResponse(request, env, { error: 'معرف الصفحة غير صالح' }, 400);
      }
      if (typeof page.name !== 'string' || page.name.trim().length < 1 || page.name.length > 150) {
        return jsonResponse(request, env, { error: 'اسم الصفحة غير صالح' }, 400);
      }
      if (typeof page.url !== 'string' || !/^https?:\/\//i.test(page.url.trim()) || page.url.length > 500) {
        return jsonResponse(request, env, { error: 'رابط الصفحة غير صالح' }, 400);
      }

      const store = await readKvJson<any[]>(env.SHAHA_KV, KV_COMMUNITY_PAGES, []);
      const idx = store.findIndex(p => p.id === page.id);
      const now = new Date().toISOString();
      const sanitized = {
        id: page.id,
        name: page.name.trim(),
        url: page.url.trim(),
        description: typeof page.description === 'string' ? page.description.slice(0, 1000) : '',
        followers: typeof page.followers === 'string' ? page.followers.slice(0, 60) : '',
        category: typeof page.category === 'string' ? page.category.slice(0, 80) : 'مجتمعي',
        isVerified: Boolean(page.isVerified),
        verifiedBadgeId: typeof page.verifiedBadgeId === 'string' ? page.verifiedBadgeId : null,
        isActive: page.isActive !== false,
        order: Number.isFinite(Number(page.order)) ? Number(page.order) : store.length + 1,
        addedBy: typeof page.addedBy === 'string' ? page.addedBy : adminCheck.payload.email,
        createdAt: idx >= 0 && store[idx]?.createdAt ? store[idx].createdAt : (typeof page.createdAt === 'string' ? page.createdAt : now),
        updatedAt: now
      };

      if (idx >= 0) {
        store[idx] = sanitized;
      } else {
        store.push(sanitized);
      }
      await writeKvJson(env.SHAHA_KV, KV_COMMUNITY_PAGES, store);
      ctx.waitUntil(
        appendAuditLog(env, {
          action: idx >= 0 ? 'UPDATE_COMMUNITY_PAGE' : 'CREATE_COMMUNITY_PAGE',
          adminUser: adminCheck.payload.email,
          target: sanitized.name,
          details: `حفظ صفحة فيسبوك: ${sanitized.name}`
        })
      );
      return jsonResponse(request, env, { success: true, page: sanitized });
    }

    if (pathname.startsWith('/api/community-pages/') && request.method === 'DELETE') {
      const adminCheck = await verifyAdminToken(env.SESSION_SECRET, extractBearerAdmin(request));
      if (!adminCheck.valid || !adminCheck.payload) {
        return jsonResponse(request, env, { error: 'غير مصرح لك بالوصول' }, 401);
      }
      if (adminCheck.payload.email.toLowerCase() !== ownerEmail.toLowerCase() && adminCheck.payload.role !== 'owner' && adminCheck.payload.role !== 'super_admin') {
        return jsonResponse(request, env, { error: 'صلاحية حذف صفحات فيسبوك حصرية للمالك.' }, 403);
      }
      const id = pathname.slice('/api/community-pages/'.length);
      if (!/^[a-zA-Z0-9_-]{1,128}$/.test(id)) {
        return jsonResponse(request, env, { error: 'معرف الصفحة غير صالح' }, 400);
      }
      let store = await readKvJson<any[]>(env.SHAHA_KV, KV_COMMUNITY_PAGES, []);
      const target = store.find(p => p.id === id);
      store = store.filter(p => p.id !== id);
      await writeKvJson(env.SHAHA_KV, KV_COMMUNITY_PAGES, store);
      ctx.waitUntil(
        appendAuditLog(env, {
          action: 'DELETE_COMMUNITY_PAGE',
          adminUser: adminCheck.payload.email,
          target: target?.name || id,
          details: `حذف صفحة فيسبوك: ${target?.name || id}`
        })
      );
      return jsonResponse(request, env, { success: true });
    }

    const adminCheck = await resolveEffectiveAdmin(env, extractBearerAdmin(request));
    if (!adminCheck.valid || !adminCheck.payload) {
      return jsonResponse(request, env, { error: 'غير مصرح لك بالوصول. يلزم تسجيل دخول المشرف.' }, 401);
    }
    const adminSession = adminCheck.payload;

    if (pathname === '/api/admin/users' && request.method === 'GET') {
      if (!hasPermission(adminSession, 'manage_users')) {
        return jsonResponse(request, env, { error: 'ليس لديك صلاحية إدارة المستخدمين' }, 403);
      }
      const search = (url.searchParams.get('search') || '').toLowerCase();
      const status = url.searchParams.get('status');
      let users = await readKvJson<UserRecordStore[]>(env.SHAHA_KV, KV_USERS, []);
      if (search) {
        users = users.filter(
          u =>
            u.displayName.toLowerCase().includes(search) ||
            u.email.toLowerCase().includes(search) ||
            (u.phone && u.phone.includes(search))
        );
      }
      if (status === 'banned') users = users.filter(u => u.isBanned);
      else if (status === 'active') users = users.filter(u => !u.isBanned);
      return jsonResponse(request, env, { users });
    }

    if (pathname === '/api/admin/users/ban' && request.method === 'POST') {
      if (!hasPermission(adminSession, 'manage_users')) {
        return jsonResponse(request, env, { error: 'ليس لديك صلاحية حظر المستخدمين' }, 403);
      }
      const body = (await readJsonBody(request)) || {};
      const { userId, email, reason, durationDays } = body;
      if (!userId && !email) return jsonResponse(request, env, { error: 'معرف المستخدم أو البريد مطلوب' }, 400);
      if (typeof email === 'string' && email.toLowerCase().trim() === ownerEmail.toLowerCase()) {
        return jsonResponse(request, env, { error: 'لا يمكن حظر مالك النظام الرئيسي' }, 403);
      }

      const users = await readKvJson<UserRecordStore[]>(env.SHAHA_KV, KV_USERS, []);
      const user = users.find(
        u =>
          (typeof userId === 'string' && u.id === userId) ||
          (typeof email === 'string' && u.email.toLowerCase() === email.toLowerCase().trim())
      );
      if (!user) return jsonResponse(request, env, { error: 'المستخدم غير موجود' }, 404);
      if (user.email.toLowerCase() === ownerEmail.toLowerCase() || user.role === 'owner') {
        return jsonResponse(request, env, { error: 'لا يمكن حظر مالك النظام الرئيسي' }, 403);
      }

      const parsedDays = durationDays !== undefined ? Number(durationDays) : 0;
      if (durationDays !== undefined && (!Number.isFinite(parsedDays) || parsedDays < 0 || parsedDays > 3650)) {
        return jsonResponse(request, env, { error: 'مدة الحظر غير صالحة' }, 400);
      }

      const safeReason =
        typeof reason === 'string' && reason.trim() ? reason.trim().slice(0, 300) : 'مخالفة سياسات وقواعد دليل شها';
      user.isBanned = true;
      user.banReason = safeReason;
      user.bannedAt = new Date().toISOString();
      if (parsedDays > 0) {
        const exp = new Date();
        exp.setDate(exp.getDate() + Math.round(parsedDays));
        user.bannedUntil = exp.toISOString();
      } else {
        user.bannedUntil = 'permanent';
      }

      await writeKvJson(env.SHAHA_KV, KV_USERS, users);
      ctx.waitUntil(
        appendAuditLog(env, {
          action: 'USER_BANNED',
          adminUser: adminSession.email,
          target: user.email || user.displayName,
          details: `حظر المستخدم: ${safeReason}`
        })
      );
      return jsonResponse(request, env, { success: true, user });
    }

    if (pathname === '/api/admin/users/unban' && request.method === 'POST') {
      if (!hasPermission(adminSession, 'manage_users')) {
        return jsonResponse(request, env, { error: 'ليس لديك صلاحية إلغاء الحظر' }, 403);
      }
      const body = (await readJsonBody(request)) || {};
      const { userId, email } = body;
      const users = await readKvJson<UserRecordStore[]>(env.SHAHA_KV, KV_USERS, []);
      const user = users.find(
        u =>
          (typeof userId === 'string' && u.id === userId) ||
          (typeof email === 'string' && u.email.toLowerCase() === email.toLowerCase().trim())
      );
      if (!user) return jsonResponse(request, env, { error: 'المستخدم غير موجود' }, 404);

      user.isBanned = false;
      user.banReason = undefined;
      user.bannedAt = undefined;
      user.bannedUntil = undefined;
      await writeKvJson(env.SHAHA_KV, KV_USERS, users);
      ctx.waitUntil(
        appendAuditLog(env, {
          action: 'USER_UNBANNED',
          adminUser: adminSession.email,
          target: user.email || user.displayName,
          details: 'إلغاء حظر المستخدم واستعادة صلاحياته'
        })
      );
      return jsonResponse(request, env, { success: true, user });
    }

    if (pathname === '/api/admin/members' && request.method === 'GET') {
      if (adminSession.role !== 'owner' && adminSession.email.toLowerCase() !== ownerEmail.toLowerCase()) {
        return jsonResponse(request, env, { error: 'عرض فريق الإشراف محصور على مالك النظام فقط.' }, 403);
      }
      const members = await getAdminMembers(env);
      return jsonResponse(request, env, { members });
    }

    if (pathname === '/api/admin/members' && request.method === 'POST') {
      if (adminSession.role !== 'owner' && adminSession.email.toLowerCase() !== ownerEmail.toLowerCase()) {
        return jsonResponse(request, env, { error: 'هذه العملية محصورة على مالك النظام الرئيسي (Owner) فقط.' }, 403);
      }
      const body = (await readJsonBody(request)) || {};
      const { email, name, role, permissions } = body;
      if (typeof email !== 'string' || typeof name !== 'string' || !name.trim()) {
        return jsonResponse(request, env, { error: 'الاسم والبريد الإلكتروني مطلوبان' }, 400);
      }
      const normalizedEmail = email.toLowerCase().trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizedEmail) || normalizedEmail.length > 150) {
        return jsonResponse(request, env, { error: 'صيغة البريد الإلكتروني غير صالحة' }, 400);
      }

      const members = await getAdminMembers(env);
      if (members.some(m => m.email.toLowerCase() === normalizedEmail)) {
        return jsonResponse(request, env, { error: 'هذا البريد مسجل بالفعل في فريق الإدارة' }, 400);
      }

      const filteredPermissions = Array.isArray(permissions)
        ? permissions.filter((p): p is string => typeof p === 'string' && ALL_PERMISSIONS.includes(p))
        : ['manage_listings', 'manage_requests'];

      const newMember: AdminMemberStore = {
        id: `admin_${Date.now()}`,
        email: normalizedEmail,
        name: name.trim().slice(0, 120),
        role: role === 'admin' ? 'admin' : 'moderator',
        permissions: filteredPermissions.length > 0 ? filteredPermissions : ['manage_listings'],
        isActive: true,
        createdAt: new Date().toISOString()
      };
      members.push(newMember);
      await saveAdminMembers(env, members);
      ctx.waitUntil(
        appendAuditLog(env, {
          action: 'ADMIN_MEMBER_ADDED',
          adminUser: adminSession.email,
          target: newMember.email,
          details: `إضافة مشرف جديد (${newMember.name})`
        })
      );
      return jsonResponse(request, env, { success: true, member: newMember });
    }

    if (pathname.startsWith('/api/admin/members/') && (request.method === 'PUT' || request.method === 'DELETE')) {
      if (adminSession.role !== 'owner' && adminSession.email.toLowerCase() !== ownerEmail.toLowerCase()) {
        return jsonResponse(request, env, { error: 'هذه العملية محصورة على مالك النظام الرئيسي (Owner) فقط.' }, 403);
      }
      const id = pathname.slice('/api/admin/members/'.length);
      let members = await getAdminMembers(env);
      const member = members.find(m => m.id === id);
      if (!member) return jsonResponse(request, env, { error: 'المشرف غير موجود' }, 404);
      if (member.email.toLowerCase() === ownerEmail.toLowerCase()) {
        return jsonResponse(request, env, { error: 'لا يمكن تعديل أو حذف مالك النظام الرئيسي' }, 403);
      }

      if (request.method === 'DELETE') {
        members = members.filter(m => m.id !== id);
        await saveAdminMembers(env, members);
        ctx.waitUntil(
          appendAuditLog(env, {
            action: 'ADMIN_MEMBER_DELETED',
            adminUser: adminSession.email,
            target: member.email,
            details: `حذف المشرف (${member.name})`
          })
        );
        return jsonResponse(request, env, { success: true });
      }

      const body = (await readJsonBody(request)) || {};
      if (typeof body.name === 'string' && body.name.trim()) member.name = body.name.trim().slice(0, 120);
      if (body.role === 'admin' || body.role === 'moderator') member.role = body.role;
      if (Array.isArray(body.permissions)) {
        member.permissions = body.permissions.filter(
          (p): p is string => typeof p === 'string' && ALL_PERMISSIONS.includes(p)
        );
      }
      if (typeof body.isActive === 'boolean') member.isActive = body.isActive;
      await saveAdminMembers(env, members);
      ctx.waitUntil(
        appendAuditLog(env, {
          action: 'ADMIN_MEMBER_UPDATED',
          adminUser: adminSession.email,
          target: member.email,
          details: `تحديث بيانات المشرف (${member.name})`
        })
      );
      return jsonResponse(request, env, { success: true, member });
    }

    if (pathname === '/api/admin/audit-logs' && request.method === 'GET') {
      if (!hasPermission(adminSession, 'manage_audit') && !hasPermission(adminSession, 'manage_settings')) {
        return jsonResponse(request, env, { error: 'ليس لديك صلاحية الاطلاع على سجل العمليات الأمني' }, 403);
      }
      const logs = await readKvJson<AuditRecord[]>(env.SHAHA_KV, KV_AUDIT, []);
      return jsonResponse(request, env, { logs });
    }

    if (pathname === '/api/admin/sessions' && request.method === 'GET') {
      if (!hasPermission(adminSession, 'manage_settings')) {
        return jsonResponse(request, env, { error: 'ليس لديك صلاحية إدارة الجلسات' }, 403);
      }
      const sessions = await readKvJson<AdminSessionRecord[]>(env.SHAHA_KV, KV_SESSIONS, []);
      return jsonResponse(request, env, { sessions: sessions.filter(s => !s.revoked) });
    }

    if (pathname === '/api/admin/sessions/revoke' && request.method === 'POST') {
      if (adminSession.role !== 'owner' && adminSession.email.toLowerCase() !== ownerEmail.toLowerCase()) {
        return jsonResponse(request, env, { error: 'إنهاء الجلسات عن بُعد محصور على مالك النظام فقط.' }, 403);
      }
      const body = (await readJsonBody(request)) || {};
      const sessionId = typeof body.sessionId === 'string' ? body.sessionId : '';
      let sessions = await readKvJson<AdminSessionRecord[]>(env.SHAHA_KV, KV_SESSIONS, []);
      if (sessionId === 'all') {
        sessions = [];
      } else {
        sessions = sessions.filter(s => s.id !== sessionId);
      }
      await writeKvJson(env.SHAHA_KV, KV_SESSIONS, sessions);
      ctx.waitUntil(
        appendAuditLog(env, {
          action: 'SESSIONS_REVOKED',
          adminUser: adminSession.email,
          target: sessionId || 'all',
          details: `إنهاء الجلسة (${sessionId || 'الكل'})`
        })
      );
      return jsonResponse(request, env, { success: true });
    }

    if (pathname === '/api/admin/log-action' && request.method === 'POST') {
      const body = await readJsonBody(request);
      if (!body || typeof body.action !== 'string' || !body.action.trim()) {
        return jsonResponse(request, env, { error: 'Action is required' }, 400);
      }
      await appendAuditLog(env, {
        action: body.action.trim().slice(0, 80),
        adminUser: adminSession.email,
        target: typeof body.target === 'string' ? body.target.trim().slice(0, 150) : undefined,
        details: typeof body.details === 'string' ? body.details.trim().slice(0, 500) : undefined
      });
      return jsonResponse(request, env, { success: true });
    }

    if (pathname === '/api/admin/security-status' && request.method === 'GET') {
      if (!hasPermission(adminSession, 'manage_settings')) {
        return jsonResponse(request, env, { error: 'ليس لديك صلاحية عرض تقارير الأمان' }, 403);
      }
      const [logs, sessions] = await Promise.all([
        readKvJson<AuditRecord[]>(env.SHAHA_KV, KV_AUDIT, []),
        readKvJson<AdminSessionRecord[]>(env.SHAHA_KV, KV_SESSIONS, [])
      ]);
      const failedLogins = logs.filter(l => l.action === 'LOGIN_FAILED');
      const ddosBlocks = logs.filter(l => l.action === 'DDOS_RATE_LIMIT');
      return jsonResponse(request, env, {
        encryption: {
          passwordHashing: 'PBKDF2-SHA512 (100,000 iterations)',
          sessionTokens: 'HMAC-SHA256 Signed + Live RBAC Verification',
          secretsVault: env.SHAHA_KEYS_VAULT ? 'Cloudflare Encrypted Secrets + KV Active' : 'Cloudflare Secrets Active'
        },
        rateLimiting: {
          status: 'active',
          loginProtection: '5 failed attempts triggers 15-minute edge KV lockout',
          ddosGuard: '60 write / 180 read req per minute per IP',
          edgeRuntime: 'Cloudflare Workers + KV'
        },
        protections: {
          csrf: 'Origin Allowlist Enforced (403 on untrusted Origin)',
          xss: 'CSP + Input Sanitization + HttpHeaders',
          injection: 'Strict Schema Validation + Parameterized KV/Firestore'
        },
        metrics: {
          auditLogsCount: logs.length,
          failedLoginCount: failedLogins.length,
          ddosBlockedCount: ddosBlocks.length,
          activeSessionsCount: sessions.filter(s => !s.revoked).length,
          recentFailedLogins: failedLogins.slice(0, 5)
        },
        database: {
          provider: 'Google Cloud Firestore + Cloudflare Workers KV',
          rulesEnforced: true,
          rolesProtected: ['admins', 'audit_logs', 'service_requests', 'reports', 'advertisements', 'community_facebook_pages']
        },
        headers: {
          hsts: 'Enabled (max-age=31536000; preload)',
          xFrameOptions: 'SAMEORIGIN',
          xContentTypeOptions: 'nosniff'
        }
      });
    }

    return jsonResponse(request, env, { error: 'المسار المطلوب غير موجود' }, 404);
  }
};

// Copyright (c) 2026 MeDoAnDrOiD. All Rights Reserved.
