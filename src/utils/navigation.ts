import { Department, Subject, QuestionPaper } from '../types';

export interface NavigationRoute {
  tab: 'home' | 'departments' | 'library' | 'recent' | 'about' | 'contact' | 'admin';
  deptId?: string;
  yearId?: string;
  semId?: string;
  subjectId?: string;
  paperId?: string;
  searchQuery?: string;
  isModal?: boolean;
}

/**
 * Parses pathname and search string into a structured NavigationRoute.
 */
export function parseRoute(pathname: string, search: string): NavigationRoute {
  const params = new URLSearchParams(search);

  // Normalize path
  const cleanPath = pathname.toLowerCase().replace(/\/+$/, '') || '/';
  
  let tab: NavigationRoute['tab'] = 'home';
  if (cleanPath.startsWith('/departments')) {
    tab = 'departments';
  } else if (cleanPath.startsWith('/library') || cleanPath.startsWith('/papers') || cleanPath.startsWith('/browse')) {
    tab = 'library';
  } else if (cleanPath.startsWith('/recent')) {
    tab = 'recent';
  } else if (cleanPath.startsWith('/about')) {
    tab = 'about';
  } else if (cleanPath.startsWith('/contact')) {
    tab = 'contact';
  } else if (cleanPath.startsWith('/admin')) {
    tab = 'admin';
  } else {
    const tabParam = params.get('tab')?.toLowerCase();
    if (
      tabParam === 'departments' || 
      tabParam === 'library' || 
      tabParam === 'recent' || 
      tabParam === 'about' || 
      tabParam === 'contact' || 
      tabParam === 'admin'
    ) {
      tab = tabParam as NavigationRoute['tab'];
    }
  }

  const deptParam = params.get('dept') || params.get('department') || undefined;
  const yearParam = params.get('year') || undefined;
  const semParam = params.get('sem') || params.get('semester') || undefined;
  const subjectParam = params.get('subject') || params.get('sub') || undefined;
  const paperParam = params.get('paper') || params.get('paperId') || params.get('pyq') || undefined;
  const queryParam = params.get('q') || params.get('search') || undefined;

  return {
    tab,
    deptId: deptParam || undefined,
    yearId: yearParam || undefined,
    semId: semParam || undefined,
    subjectId: subjectParam || undefined,
    paperId: paperParam || undefined,
    searchQuery: queryParam || undefined,
    isModal: Boolean(paperParam || subjectParam),
  };
}

/**
 * Builds a clean canonical URL path and search query from a NavigationRoute.
 */
export function buildRouteUrl(route: NavigationRoute): string {
  const params = new URLSearchParams();

  let basePath = '/';
  if (route.tab === 'departments') {
    basePath = '/departments';
  } else if (route.tab === 'library') {
    basePath = '/library';
  } else if (route.tab === 'recent') {
    basePath = '/recent';
  } else if (route.tab === 'about') {
    basePath = '/about';
  } else if (route.tab === 'contact') {
    basePath = '/contact';
  } else if (route.tab === 'admin') {
    basePath = '/admin';
  }

  if (route.deptId && route.deptId !== 'all') {
    params.set('dept', route.deptId);
  }
  if (route.yearId && route.yearId !== 'all') {
    params.set('year', route.yearId);
  }
  if (route.semId && route.semId !== 'all') {
    params.set('sem', route.semId);
  }
  if (route.subjectId && route.subjectId !== 'all') {
    params.set('subject', route.subjectId);
  }
  if (route.paperId) {
    params.set('paper', route.paperId);
  }
  if (route.searchQuery && route.searchQuery.trim()) {
    params.set('q', route.searchQuery.trim());
  }

  const queryString = params.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}

/**
 * Determines the logical parent route when moving backwards.
 * Specifically implements:
 * Question Papers (PDF) -> Subject -> Year/Semester -> Department Selection -> Homepage -> External
 */
export function getParentRoute(route: NavigationRoute): NavigationRoute | null {
  if (route.tab === 'departments') {
    // Step 5 -> Step 4: From Question Paper PDF -> return to Subject Modal
    if (route.paperId && route.subjectId) {
      return {
        ...route,
        paperId: undefined,
        isModal: true,
      };
    }

    // From standalone paper on departments page (not under subject modal) -> return to semester/dept
    if (route.paperId && !route.subjectId) {
      return {
        ...route,
        paperId: undefined,
        isModal: false,
      };
    }

    // Step 4 -> Step 3: From Subject Modal -> return to Year/Semester view
    if (route.subjectId) {
      return {
        ...route,
        subjectId: undefined,
        isModal: false,
      };
    }

    // Step 3 -> Step 2: From Year/Semester view -> return to Department Selection view
    if ((route.semId && route.semId !== 'all') || (route.yearId && route.yearId !== 'all')) {
      return {
        tab: 'departments',
        deptId: route.deptId,
        yearId: 'all',
        semId: 'all',
        isModal: false,
      };
    }

    // Step 2 -> Step 1: From Department Selection view -> return to Homepage
    return {
      tab: 'home',
      isModal: false,
    };
  }

  if (route.tab === 'library') {
    // If viewing paper modal in library -> return to library without paper
    if (route.paperId) {
      return {
        ...route,
        paperId: undefined,
        isModal: false,
      };
    }
    // From library -> return to homepage
    return {
      tab: 'home',
      isModal: false,
    };
  }

  if (route.tab === 'recent' || route.tab === 'about' || route.tab === 'contact' || route.tab === 'admin') {
    if (route.paperId) {
      return {
        ...route,
        paperId: undefined,
        isModal: false,
      };
    }
    return {
      tab: 'home',
      isModal: false,
    };
  }

  // Already on homepage: null indicates browser should pop to external history
  return null;
}

/**
 * Normalizes a department identifier (matches by ID, code, or slug).
 */
export function resolveDepartmentId(
  raw: string | undefined | null,
  departments: Department[]
): string | undefined {
  if (!raw || raw === 'all') return undefined;
  const clean = raw.trim().toLowerCase();
  const match = departments.find(
    (d) =>
      d.id.toLowerCase() === clean ||
      d.code.toLowerCase() === clean ||
      d.slug.toLowerCase() === clean
  );
  return match ? match.id : undefined;
}

/**
 * Normalizes a subject identifier (matches by ID, subjectCode, or paperCode).
 */
export function resolveSubject(
  raw: string | undefined | null,
  subjects: Subject[],
  deptId?: string
): Subject | null {
  if (!raw || raw === 'all') return null;
  const clean = raw.trim().toLowerCase();

  // First check in the target department if specified
  if (deptId && deptId !== 'all') {
    const deptMatch = subjects.find(
      (s) =>
        s.departmentId === deptId &&
        (s.id.toLowerCase() === clean ||
          s.subjectCode.toLowerCase() === clean ||
          (s.paperCode && s.paperCode.toLowerCase() === clean))
    );
    if (deptMatch) return deptMatch;
  }

  // General search across all subjects
  const match = subjects.find(
    (s) =>
      s.id.toLowerCase() === clean ||
      s.subjectCode.toLowerCase() === clean ||
      (s.paperCode && s.paperCode.toLowerCase() === clean)
  );
  return match || null;
}

/**
 * Resolves paper by ID or file path.
 */
export function resolvePaper(
  raw: string | undefined | null,
  papers: QuestionPaper[]
): QuestionPaper | null {
  if (!raw) return null;
  const clean = raw.trim().toLowerCase();
  return (
    papers.find(
      (p) =>
        p.id.toLowerCase() === clean ||
        p.fileName.toLowerCase() === clean ||
        p.filePath.toLowerCase().includes(clean)
    ) || null
  );
}

/**
 * Generates an appropriate descriptive browser tab title for the current route.
 */
export function getPageTitle(
  route: NavigationRoute,
  details?: {
    deptName?: string;
    deptCode?: string;
    semName?: string;
    subName?: string;
    subCode?: string;
    paperTitle?: string;
  }
): string {
  const base = 'MJPRU PYQ – Independent Question Paper Library';

  if (route.paperId && details?.paperTitle) {
    return `${details.paperTitle} (PDF) | MJPRU PYQ`;
  }

  if (route.subjectId && details?.subName) {
    const codePart = details.subCode ? ` (${details.subCode})` : '';
    return `${details.subName}${codePart} PYQ | MJPRU PYQ`;
  }

  if (route.tab === 'departments') {
    if (details?.deptName && details?.semName && route.semId && route.semId !== 'all') {
      return `${details.deptName} – ${details.semName} | MJPRU PYQ`;
    }
    if (details?.deptName) {
      return `${details.deptName} (${details.deptCode || 'B.Tech'}) | MJPRU PYQ`;
    }
    return `B.Tech Engineering Departments | MJPRU PYQ`;
  }

  if (route.tab === 'library') {
    if (route.searchQuery) {
      return `Search: "${route.searchQuery}" | MJPRU PYQ`;
    }
    return `Browse Question Paper Library | MJPRU PYQ`;
  }

  if (route.tab === 'recent') {
    return `Recently Uploaded Examination Papers | MJPRU PYQ`;
  }

  if (route.tab === 'about') {
    return `About MJPRU PYQ – Academic Mission & Disclaimer`;
  }

  if (route.tab === 'contact') {
    return `Contact & Academic Inquiries | MJPRU PYQ`;
  }

  if (route.tab === 'admin') {
    return `Administrator Portal | MJPRU PYQ`;
  }

  return base;
}

/**
 * Calculates a stable page-transition key for top-level navigation.
 * Note: filter criteria, dropdowns, and search queries (q) are deliberately excluded
 * so that changing filters or typing in search inputs does NOT replay page transition animations.
 */
export function getPageTransitionKey(route: NavigationRoute): string {
  return route.tab;
}

/**
 * Checks if a route update is an actual page navigation
 * (e.g. changing tabs, departments, semesters, or opening a subject)
 * rather than just changing search queries or in-page filters.
 */
export function isPageNavigation(prev: NavigationRoute, next: NavigationRoute): boolean {
  if (prev.tab !== next.tab) return true;
  if (prev.tab === 'departments') {
    if (prev.deptId !== next.deptId) return true;
    if (prev.semId !== next.semId) return true;
    if (prev.yearId !== next.yearId) return true;
    if (prev.subjectId !== next.subjectId) return true;
  }
  return false;
}

