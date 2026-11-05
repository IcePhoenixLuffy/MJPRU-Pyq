import { describe, it } from 'node:test';
import assert from 'node:assert';
import { 
  formatAcademicSession, 
  normalizeAcademicSession, 
  isSessionMatch, 
  sortAcademicSessionsDesc, 
  formatSessionOrYear, 
  formatSessionOptionLabel, 
  getAvailableAcademicSessions,
  getPaperCompositeKey,
  filterQuestionPapers,
  slugify,
  isAcademicSession
} from '../utils/helpers';
import type { QuestionPaper, FilterState } from '../types';

describe('Academic Session Format & System Upgrades', () => {
  describe('formatAcademicSession, normalizeAcademicSession and isAcademicSession', () => {
    it('generates academic session from start year with canonical en-dash', () => {
      assert.strictEqual(formatAcademicSession(2024), '2024–25');
      assert.strictEqual(formatAcademicSession(2025), '2025–26');
      assert.strictEqual(formatAcademicSession(2026), '2026–27');
      assert.strictEqual(formatAcademicSession(2027), '2027–28');
    });

    it('normalizes various dash formats (hyphen, em-dash) into canonical en-dash session', () => {
      assert.strictEqual(normalizeAcademicSession('2025-26'), '2025–26');
      assert.strictEqual(normalizeAcademicSession('2025—26'), '2025–26');
      assert.strictEqual(normalizeAcademicSession('2025–26'), '2025–26');
      assert.strictEqual(normalizeAcademicSession(' 2026-27 '), '2026–27');
    });

    it('validates whether a value is an academic session', () => {
      assert.strictEqual(isAcademicSession('2025–26'), true);
      assert.strictEqual(isAcademicSession('2026-27'), true);
      assert.strictEqual(isAcademicSession('2027—28'), true);
      assert.strictEqual(isAcademicSession(2026), false);
      assert.strictEqual(isAcademicSession('2026'), false);
      assert.strictEqual(isAcademicSession(2024), false);
      assert.strictEqual(isAcademicSession('2024'), false);
      assert.strictEqual(isAcademicSession(''), false);
      assert.strictEqual(isAcademicSession(null), false);
      assert.strictEqual(isAcademicSession(undefined), false);
    });

    it('preserves legacy calendar year values without guessing in raw data', () => {
      assert.strictEqual(normalizeAcademicSession(2026), '2026');
      assert.strictEqual(normalizeAcademicSession('2026'), '2026');
      assert.strictEqual(normalizeAcademicSession(2025), '2025');
      assert.strictEqual(normalizeAcademicSession('2025'), '2025');
    });

    it('formats option labels exclusively with Session prefix (no Calendar Year options)', () => {
      assert.strictEqual(formatSessionOptionLabel('2025–26'), 'Session 2025–26');
      assert.strictEqual(formatSessionOptionLabel('2026–27'), 'Session 2026–27');
      assert.strictEqual(formatSessionOrYear('2025–26'), '2025–26');
    });
  });

  describe('isSessionMatch', () => {
    it('matches session strings regardless of hyphen vs en-dash', () => {
      assert.strictEqual(isSessionMatch('2025–26', '2025-26'), true);
      assert.strictEqual(isSessionMatch('2025-26', '2025–26'), true);
      assert.strictEqual(isSessionMatch('2025–26', '2025–26'), true);
    });

    it('does not conflate different sessions', () => {
      assert.strictEqual(isSessionMatch('2025–26', '2026–27'), false);
      assert.strictEqual(isSessionMatch('2024–25', '2025–26'), false);
    });
  });

  describe('sortAcademicSessionsDesc', () => {
    it('sorts sessions in correct reverse-chronological order (newest session first)', () => {
      const unsorted = ['2023–24', '2026–27', '2024–25', '2027–28', '2025–26', '2022–23'];
      const sorted = [...unsorted].sort(sortAcademicSessionsDesc);

      assert.strictEqual(sorted[0], '2027–28');
      assert.strictEqual(sorted[1], '2026–27');
      assert.strictEqual(sorted[2], '2025–26');
      assert.strictEqual(sorted[3], '2024–25');
      assert.strictEqual(sorted[4], '2023–24');
      assert.strictEqual(sorted[5], '2022–23');
    });
  });

  describe('getAvailableAcademicSessions dynamic generation (ONLY Academic Sessions, NO Calendar Years)', () => {
    it('generates future, current, and historical sessions without hardcoding single years', () => {
      const sessions = getAvailableAcademicSessions([]);
      assert.ok(sessions.includes('2027–28'), 'Should include 2027–28');
      assert.ok(sessions.includes('2026–27'), 'Should include 2026–27');
      assert.ok(sessions.includes('2025–26'), 'Should include 2025–26');
      assert.ok(sessions.includes('2024–25'), 'Should include 2024–25');
      assert.ok(sessions.includes('2023–24'), 'Should include 2023–24');
      assert.ok(sessions.includes('2022–23'), 'Should include 2022–23');

      // Verify EVERY option strictly matches YYYY–YY and NO calendar year options exist
      sessions.forEach((s) => {
        assert.match(s, /^\d{4}–\d{2}$/, `Option "${s}" must be a formatted academic session`);
        assert.ok(!s.includes('Calendar Year'), `Option "${s}" must not contain calendar year terminology`);
      });
    });

    it('does NOT add calendar-year options (e.g. 2026 or 2024) to the dropdown even if present in legacy records', () => {
      const mockPapers: QuestionPaper[] = [
        {
          id: 'p-1',
          departmentId: 'dept-csit',
          academicYearId: 'year-1',
          semesterId: 'sem-1',
          subjectId: 'sub-1',
          subjectCode: 'CS-101',
          subjectName: 'Programming in C',
          examinationYear: 2026, // legacy calendar year
          examinationType: 'Regular',
          filePath: 'papers/cs-101-2026.pdf',
          fileName: 'cs-101-2026.pdf',
          fileSizeBytes: 1000,
          pageCount: 2,
          downloadCount: 0,
          uploadedAt: '2026-01-01T00:00:00Z',
        },
        {
          id: 'p-2',
          departmentId: 'dept-csit',
          academicYearId: 'year-2',
          semesterId: 'sem-3',
          subjectId: 'sub-2',
          subjectCode: 'CS-301',
          subjectName: 'Data Structures',
          examinationYear: '2025–26', // academic session
          examinationType: 'Regular',
          filePath: 'papers/cs-301-2025-26.pdf',
          fileName: 'cs-301-2025-26.pdf',
          fileSizeBytes: 1000,
          pageCount: 2,
          downloadCount: 0,
          uploadedAt: '2026-01-02T00:00:00Z',
        },
      ];

      const sessions = getAvailableAcademicSessions(mockPapers);
      assert.ok(sessions.includes('2025–26'), 'Should include valid 2025–26 session');
      assert.ok(!sessions.includes('2026'), 'Should NOT include calendar year 2026 in dropdown');
      assert.ok(!sessions.includes('Year 2026 (Calendar Year)'), 'Should NOT include Year 2026 (Calendar Year)');
    });
  });

  describe('Multi-semester compatibility in the same academic session', () => {
    it('allows papers from Odd and Even semesters to belong to the same session without key collision', () => {
      const sem1Paper: QuestionPaper = {
        id: 'p-sem1',
        departmentId: 'dept-csit',
        academicYearId: 'year-1',
        semesterId: 'sem-1', // Semester 1 (Odd)
        subjectId: 'sub-csit-sem1-1',
        subjectCode: 'MA-101T',
        subjectName: 'Engineering Mathematics-I',
        examinationYear: '2025–26',
        examinationType: 'Regular',
        filePath: 'papers/ma101t.pdf',
        fileName: 'ma101t.pdf',
        fileSizeBytes: 12000,
        pageCount: 2,
        downloadCount: 0,
        uploadedAt: '2025-12-01T00:00:00Z',
      };

      const sem2Paper: QuestionPaper = {
        id: 'p-sem2',
        departmentId: 'dept-csit',
        academicYearId: 'year-1',
        semesterId: 'sem-2', // Semester 2 (Even)
        subjectId: 'sub-csit-sem2-1',
        subjectCode: 'MA-102T',
        subjectName: 'Engineering Mathematics-II',
        examinationYear: '2025–26', // Same academic session 2025–26!
        examinationType: 'Regular',
        filePath: 'papers/ma102t.pdf',
        fileName: 'ma102t.pdf',
        fileSizeBytes: 12000,
        pageCount: 2,
        downloadCount: 0,
        uploadedAt: '2026-05-01T00:00:00Z',
      };

      const sem1Key = getPaperCompositeKey(sem1Paper);
      const sem2Key = getPaperCompositeKey(sem2Paper);

      assert.notStrictEqual(sem1Key, sem2Key, 'Sem 1 and Sem 2 papers in the same session must have distinct keys');
      assert.ok(sem1Key.includes('sem-1'));
      assert.ok(sem2Key.includes('sem-2'));
      assert.ok(sem1Key.includes('2025–26'));
      assert.ok(sem2Key.includes('2025–26'));
    });
  });

  describe('Storage safe slugification', () => {
    it('converts academic session en-dashes to clean hyphens for storage keys and URLs', () => {
      assert.strictEqual(slugify('2025–26'), '2025-26');
      assert.strictEqual(slugify('2026—27'), '2026-27');
      assert.strictEqual(slugify('CSIT Sem 2 2025–26'), 'csit-sem-2-2025-26');
    });
  });

  describe('Filter by Academic Session and Legacy Years', () => {
    const papers: QuestionPaper[] = [
      {
        id: 'p-session-1',
        departmentId: 'dept-csit',
        academicYearId: 'year-1',
        semesterId: 'sem-2',
        subjectId: 'sub-1',
        subjectCode: 'PH-102T',
        subjectName: 'Physics-II',
        examinationYear: '2025–26',
        examinationType: 'Regular',
        filePath: 'papers/ph102t-2025-26.pdf',
        fileName: 'ph102t-2025-26.pdf',
        fileSizeBytes: 1000,
        pageCount: 2,
        downloadCount: 5,
        uploadedAt: '2026-01-01T00:00:00Z',
      },
      {
        id: 'p-session-2',
        departmentId: 'dept-csit',
        academicYearId: 'year-2',
        semesterId: 'sem-4',
        subjectId: 'sub-2',
        subjectCode: 'CS-401',
        subjectName: 'Operating Systems',
        examinationYear: '2026–27',
        examinationType: 'Regular',
        filePath: 'papers/cs401-2026-27.pdf',
        fileName: 'cs401-2026-27.pdf',
        fileSizeBytes: 1000,
        pageCount: 2,
        downloadCount: 10,
        uploadedAt: '2026-06-01T00:00:00Z',
      },
      {
        id: 'p-legacy-1',
        departmentId: 'dept-csit',
        academicYearId: 'year-1',
        semesterId: 'sem-2',
        subjectId: 'sub-3',
        subjectCode: 'EE-101',
        subjectName: 'Basic Electrical',
        examinationYear: 2026, // legacy calendar year
        examinationType: 'Regular',
        filePath: 'papers/ee101-2026.pdf',
        fileName: 'ee101-2026.pdf',
        fileSizeBytes: 1000,
        pageCount: 2,
        downloadCount: 3,
        uploadedAt: '2026-02-01T00:00:00Z',
      },
    ];

    it('filters correctly by academic session "2025–26"', () => {
      const filters: FilterState = {
        departmentId: 'all',
        academicYearId: 'all',
        semesterId: 'all',
        subjectId: 'all',
        examinationYear: '2025–26',
        examinationType: 'all',
        searchQuery: '',
        sortBy: 'newest',
      };
      const result = filterQuestionPapers(papers, filters);
      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].id, 'p-session-1');
    });

    it('filters correctly even if filter query uses standard hyphen "2025-26"', () => {
      const filters: FilterState = {
        departmentId: 'all',
        academicYearId: 'all',
        semesterId: 'all',
        subjectId: 'all',
        examinationYear: '2025-26',
        examinationType: 'all',
        searchQuery: '',
        sortBy: 'newest',
      };
      const result = filterQuestionPapers(papers, filters);
      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].id, 'p-session-1');
    });

    it('returns all papers (including legacy unassigned) when examinationYear filter is "all"', () => {
      const filters: FilterState = {
        departmentId: 'all',
        academicYearId: 'all',
        semesterId: 'all',
        subjectId: 'all',
        examinationYear: 'all',
        examinationType: 'all',
        searchQuery: '',
        sortBy: 'newest',
      };
      const result = filterQuestionPapers(papers, filters);
      assert.strictEqual(result.length, 3);
    });
  });
});
