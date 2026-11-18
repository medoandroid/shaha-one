export type AppRoute =
  | { page: 'home' }
  | { page: 'categories' }
  | { page: 'category'; categoryId: string; subcategory?: string }
  | { page: 'listing'; listingId: string }
  | { page: 'emergency' }
  | { page: 'blood' }
  | { page: 'charity' }
  | { page: 'about' }
  | { page: 'ads' }
  | { page: 'news'; category?: string; articleId?: string }
  | { page: 'admin' };

export interface FilterState {
  searchQuery: string;
  sortBy: 'all' | 'popular' | 'latest' | 'verified';
  pageNumber: number;
}

/**
 * Parses the current window URL search parameters into an AppRoute
 */
export function parseCurrentRoute(): AppRoute {
  if (typeof window === 'undefined') {
    return { page: 'home' };
  }

  const params = new URLSearchParams(window.location.search);
  const page = params.get('page') || '';
  const listingId = params.get('listing') || params.get('id');

  // Handle direct listing links (?listing=xxx or ?page=listing&id=xxx)
  if (page === 'listing' && listingId) {
    return { page: 'listing', listingId };
  }
  if (!page && listingId) {
    return { page: 'listing', listingId };
  }

  if (page === 'category') {
    const categoryId = params.get('id') || params.get('category') || 'doctors';
    const subcategory = params.get('sub') || undefined;
    return { page: 'category', categoryId, subcategory };
  }

  if (page === 'categories') return { page: 'categories' };
  if (page === 'emergency') return { page: 'emergency' };
  if (page === 'blood') return { page: 'blood' };
  if (page === 'charity') return { page: 'charity' };
  if (page === 'about') return { page: 'about' };
  if (page === 'ads' || page === 'offers') return { page: 'ads' };
  if (page === 'news') {
    const category = params.get('cat') || undefined;
    const articleId = params.get('article') || params.get('id') || undefined;
    return { page: 'news', category, articleId };
  }
  if (page === 'admin') return { page: 'admin' };

  return { page: 'home' };
}

/**
 * Builds a search string from an AppRoute
 */
export function buildRouteUrl(route: AppRoute): string {
  switch (route.page) {
    case 'home':
      return window.location.pathname;
    case 'categories':
      return `${window.location.pathname}?page=categories`;
    case 'category': {
      const p = new URLSearchParams();
      p.set('page', 'category');
      p.set('id', route.categoryId);
      if (route.subcategory) {
        p.set('sub', route.subcategory);
      }
      return `${window.location.pathname}?${p.toString()}`;
    }
    case 'listing':
      return `${window.location.pathname}?page=listing&id=${encodeURIComponent(route.listingId)}`;
    case 'emergency':
      return `${window.location.pathname}?page=emergency`;
    case 'blood':
      return `${window.location.pathname}?page=blood`;
    case 'charity':
      return `${window.location.pathname}?page=charity`;
    case 'about':
      return `${window.location.pathname}?page=about`;
    case 'ads':
      return `${window.location.pathname}?page=ads`;
    case 'news': {
      const p = new URLSearchParams();
      p.set('page', 'news');
      if (route.category) p.set('cat', route.category);
      if (route.articleId) p.set('article', route.articleId);
      return `${window.location.pathname}?${p.toString()}`;
    }
    case 'admin':
      return `${window.location.pathname}?page=admin`;
    default:
      return window.location.pathname;
  }
}

/**
 * Navigates to a route using HTML5 History API and dispatches a popstate event
 */
export function navigateTo(route: AppRoute, replace = false) {
  const url = buildRouteUrl(route);
  if (replace) {
    window.history.replaceState({ route }, '', url);
  } else {
    window.history.pushState({ route }, '', url);
  }
  window.dispatchEvent(new Event('shaha_navigate'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Native back navigation: pops browser history if available, or falls back to specified route
 */
export function goBack(fallbackRoute: AppRoute = { page: 'home' }) {
  if (typeof window !== 'undefined') {
    if (window.history.length > 1 && window.history.state?.route) {
      window.history.back();
      return;
    }
  }
  navigateTo(fallbackRoute);
}

/**
 * Dynamically updates document title and open-graph meta tags for SEO and smooth sharing
 */
export function updateSeoMeta(title: string, description?: string) {
  if (typeof document === 'undefined') return;

  const fullTitle = `${title} | SHAHA ONE - شها ون`;
  document.title = fullTitle;

  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', fullTitle);

  const desc = description || 'منصتك الرقمية المتكاملة لخدمات أهالي شها - مركز المنصورة - محافظة الدقهلية. شها كلها.. أقرب وأسهل في مكان واحد.';
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', desc);

  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', desc);
}
