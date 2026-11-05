import { QuestionPaper, FilterState, SystemStatistics, Department, Subject } from '../types';

/**
 * Filter question papers based on various criteria
 */
export function filterQuestionPapers(
  papers: QuestionPaper[],
  filters: Partial<FilterState>
): QuestionPaper[] {
  return papers.filter((paper) => {
    // Department filter
    if (filters.departmentId && filters.departmentId !== 'all') {
      if (paper.departmentId !== filters.departmentId) return false;
    }

    // Academic Year filter
    if (filters.academicYearId && filters.academicYearId !== 'all') {
      if (paper.academicYearId !== filters.academicYearId) return false;
    }

    // Semester filter
    if (filters.semesterId && filters.semesterId !== 'all') {
      if (paper.semesterId !== filters.semesterId) return false;
    }

    // Subject filter
    if (filters.subjectId && filters.subjectId !== 'all') {
      if (paper.subjectId !== filters.subjectId) return false;
    }

    // Exam Year / Academic Session filter
    if (filters.examinationYear && filters.examinationYear !== 'all') {
      if (!isSessionMatch(paper.examinationYear, filters.examinationYear)) {
        return false;
      }
    }

    // Exam Type filter
    if (filters.examinationType && filters.examinationType !== 'all') {
      if (paper.examinationType !== filters.examinationType) return false;
    }

    // Global Search Query
    if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
      const q = filters.searchQuery.toLowerCase().trim();
      const matchSubject = paper.subjectName?.toLowerCase().includes(q) ?? false;
      const matchCode = paper.subjectCode?.toLowerCase().includes(q) ?? false;
      const matchDept = paper.departmentName?.toLowerCase().includes(q) ?? false;
      const yrStr = String(paper.examinationYear || '').toLowerCase();
      const normYr = normalizeAcademicSession(paper.examinationYear).toLowerCase();
      const matchYear = yrStr.includes(q) || normYr.includes(q);
      const matchDesc = paper.description?.toLowerCase().includes(q) ?? false;
      const matchType = paper.examinationType.toLowerCase().includes(q);

      if (!matchSubject && !matchCode && !matchDept && !matchYear && !matchDesc && !matchType) {
        return false;
      }
    }

    return true;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'oldest':
        return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
      case 'downloads':
        return b.downloadCount - a.downloadCount;
      case 'year_desc':
        return sortAcademicSessionsDesc(a.examinationYear, b.examinationYear);
      case 'newest':
      default:
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    }
  });
}

/**
 * Calculate dynamic platform statistics
 */
export function calculateStatistics(
  departments: Department[],
  subjects: Subject[],
  papers: QuestionPaper[]
): SystemStatistics {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentUploads = papers.filter((p) => {
    const uploadDate = new Date(p.uploadedAt);
    return uploadDate >= thirtyDaysAgo;
  });

  return {
    totalDepartments: departments.length,
    totalSubjects: subjects.length,
    totalQuestionPapers: papers.length,
    latestUploadsCount: recentUploads.length,
  };
}

/**
 * Generate URL safe slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/&/g, '-and-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

/**
 * Formats a 4-digit start year into standard academic session notation (e.g. 2025 -> "2025–26").
 */
export function formatAcademicSession(startYear: number): string {
  const endYearShort = String((startYear + 1) % 100).padStart(2, '0');
  return `${startYear}–${endYearShort}`;
}

/**
 * Normalizes an academic session or calendar year string into canonical representation.
 * Converts "2025-26", "2025—26" to "2025–26" with uniform en-dash.
 * Preserves legacy calendar years (e.g. 2026, 2025) as-is.
 */
export function normalizeAcademicSession(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return '';
  const str = String(val).trim();
  const sessionMatch = str.match(/^(\d{4})[–—\-](\d{2})$/);
  if (sessionMatch) {
    return `${sessionMatch[1]}–${sessionMatch[2]}`;
  }
  return str;
}

/**
 * Checks whether a value represents an academic session formatted as YYYY–YY (e.g., 2025–26 or 2025-26).
 */
export function isAcademicSession(val: string | number | undefined | null): boolean {
  if (val === undefined || val === null) return false;
  const str = String(val).trim();
  return /^(\d{4})[–—\-](\d{2})$/.test(str);
}

/**
 * Checks if a question paper's examination session/year matches a selected filter.
 * Case-insensitive and hyphen/en-dash agnostic.
 */
export function isSessionMatch(
  paperVal: string | number | undefined | null,
  filterVal: string | number | undefined | null
): boolean {
  if (!filterVal || filterVal === 'all') return true;
  if (!paperVal) return false;
  const normPaper = normalizeAcademicSession(paperVal).toLowerCase();
  const normFilter = normalizeAcademicSession(filterVal).toLowerCase();
  return normPaper === normFilter;
}

/**
 * Sorts academic sessions descending.
 * Future sessions (e.g. 2027–28) > 2026–27 > 2025–26 > 2024–25, etc.
 */
export function sortAcademicSessionsDesc(
  a: string | number | undefined | null,
  b: string | number | undefined | null
): number {
  const strA = normalizeAcademicSession(a);
  const strB = normalizeAcademicSession(b);
  const startA = parseInt(strA.slice(0, 4), 10) || 0;
  const startB = parseInt(strB.slice(0, 4), 10) || 0;
  if (startA !== startB) return startB - startA;
  return strB.localeCompare(strA);
}

/**
 * Friendly display helper for cards, badges, and modals.
 * Returns the canonical session format (e.g. "2025–26").
 */
export function formatSessionOrYear(value: number | string | undefined | null): string {
  if (!value) return '';
  return normalizeAcademicSession(value);
}

/**
 * Generates label for dropdown options.
 * Exclusively uses "Session YYYY–YY" format with no calendar year options.
 * E.g. "2025–26" -> "Session 2025–26"
 */
export function formatSessionOptionLabel(value: string | number): string {
  const norm = normalizeAcademicSession(value);
  return `Session ${norm}`;
}

/**
 * Dynamic, future-proof academic session generator.
 * Strictly generates ONLY academic sessions in descending order:
 * - Future academic sessions (e.g. 2027–28, 2026–27) so admins never need code changes
 * - Current and historical academic sessions down to 2017–18
 * - Includes valid academic sessions present in uploaded papers
 * - Excludes single calendar years completely so no calendar-year options appear anywhere.
 */
export function getAvailableAcademicSessions(papers: QuestionPaper[] = []): string[] {
  const currentYear = new Date().getFullYear();
  // Include future sessions (at least currentYear + 1, e.g. 2027-28 when currentYear is 2026)
  const maxStartYear = Math.max(currentYear + 1, 2027);
  const minBaseStartYear = 2017;

  const sessionSet = new Set<string>();

  for (let yr = maxStartYear; yr >= minBaseStartYear; yr--) {
    sessionSet.add(formatAcademicSession(yr));
  }

  // Include ONLY valid academic sessions from existing papers (never calendar years)
  for (const paper of papers) {
    if (paper.examinationYear !== undefined && paper.examinationYear !== null) {
      if (isAcademicSession(paper.examinationYear)) {
        sessionSet.add(normalizeAcademicSession(paper.examinationYear));
      }
    }
  }

  return Array.from(sessionSet).sort(sortAcademicSessionsDesc);
}

/**
 * Backward compatibility alias for getAvailableAcademicSessions.
 */
export function getAvailableExamYears(papers: QuestionPaper[] = []): string[] {
  return getAvailableAcademicSessions(papers);
}

/**
 * Format bytes to readable size
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 KB';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Validates file is PDF
 */
export function isValidPdfFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  if (!isPdf) {
    return { valid: false, error: 'Only PDF documents (.pdf) are permitted' };
  }
  const maxSize = 25 * 1024 * 1024; // 25MB
  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds maximum 25 MB limit' };
  }
  return { valid: true };
}

/**
 * Generates an idempotent, canonical composite key for a question paper.
 * Uniquely identifies a paper by Department, Semester, Subject, Examination Year/Session, and Exam Type.
 */
export function getPaperCompositeKey(paper: {
  departmentId: string;
  semesterId: string;
  subjectId?: string;
  subjectCode?: string;
  examinationYear: number | string;
  examinationType?: string;
}): string {
  const dept = (paper.departmentId || '').trim().toLowerCase();
  const sem = (paper.semesterId || '').trim().toLowerCase();
  const sub = (paper.subjectCode || paper.subjectId || '').trim().toUpperCase();
  const yr = normalizeAcademicSession(paper.examinationYear).toLowerCase();
  const type = (paper.examinationType || 'Regular').trim().toLowerCase();
  return `${dept}::${sem}::${sub}::${yr}::${type}`;
}

/**
 * Deduplicates an array of question papers by their composite key.
 * Keeps the most authoritative record (prefers Supabase DB UUID rows, newer timestamps).
 */
export function deduplicateQuestionPapers(papers: QuestionPaper[]): QuestionPaper[] {
  const map = new Map<string, QuestionPaper>();
  for (const paper of papers) {
    const key = getPaperCompositeKey(paper);
    const existing = map.get(key);
    if (!existing) {
      map.set(key, paper);
    } else {
      const isCurrentUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(paper.id);
      const isExistingUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(existing.id);
      const currentUpload = new Date(paper.uploadedAt || 0).getTime();
      const existingUpload = new Date(existing.uploadedAt || 0).getTime();

      if (isCurrentUuid && !isExistingUuid) {
        if (existingUpload > currentUpload) {
          map.set(key, { ...existing, id: paper.id });
        } else {
          map.set(key, paper);
        }
      } else if (!isCurrentUuid && isExistingUuid) {
        if (currentUpload >= existingUpload) {
          map.set(key, { ...paper, id: existing.id });
        }
      } else {
        if (currentUpload >= existingUpload) {
          map.set(key, paper);
        }
      }
    }
  }
  return Array.from(map.values());
}

