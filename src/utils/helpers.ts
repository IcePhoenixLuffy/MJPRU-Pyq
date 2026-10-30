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

    // Exam Year filter
    if (filters.examinationYear && filters.examinationYear !== 'all') {
      if (paper.examinationYear.toString() !== filters.examinationYear.toString()) {
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
      const matchYear = paper.examinationYear.toString().includes(q);
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
        return b.examinationYear - a.examinationYear;
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
    .replace(/\s+/g, '-')
    .replace(/&/g, '-and-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
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
