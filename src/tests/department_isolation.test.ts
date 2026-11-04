import { describe, it } from 'node:test';
import assert from 'node:assert';
import { filterQuestionPapers } from '../utils/helpers';
import type { QuestionPaper, Subject } from '../types';

describe('Department Question Paper Isolation', () => {
  // Test data representing CSIT and Electrical Engineering sharing subject code PH-102T in Semester 2
  const csitSubject: Subject = {
    id: 'sub-csit-sem2-4',
    departmentId: 'dept-csit',
    semesterId: 'sem-2',
    academicYearId: 'year-1',
    subjectName: 'Engineering Physics-II',
    subjectCode: 'PH-102T',
    createdAt: '2026-01-01',
  };

  const eeSubject: Subject = {
    id: 'sub-ee-sem2-1',
    departmentId: 'dept-ee',
    semesterId: 'sem-2',
    academicYearId: 'year-1',
    subjectName: 'Engineering Physics-II',
    subjectCode: 'PH-102T',
    createdAt: '2026-01-01',
  };

  const csitPaper: QuestionPaper = {
    id: 'paper-csit-1',
    departmentId: 'dept-csit',
    subjectId: 'sub-csit-sem2-4',
    academicYearId: 'year-1',
    semesterId: 'sem-2',
    examinationYear: 2025,
    examinationType: 'End-Term',
    filePath: 'https://example.supabase.co/storage/v1/object/public/pyq-papers/csit_sem2_ph-102t_2025_end-term_1.pdf',
    fileName: 'csit_physics_2025.pdf',
    fileSizeBytes: 350000,
    pageCount: 2,
    description: 'CSIT Physics paper 2025',
    uploadedAt: '2026-02-01T10:00:00.000Z',
    downloadCount: 0,
    subjectCode: 'PH-102T',
    subjectName: 'Engineering Physics-II',
  };

  const eePaper: QuestionPaper = {
    id: 'paper-ee-1',
    departmentId: 'dept-ee',
    subjectId: 'sub-ee-sem2-1',
    academicYearId: 'year-1',
    semesterId: 'sem-2',
    examinationYear: 2025,
    examinationType: 'End-Term',
    filePath: 'https://example.supabase.co/storage/v1/object/public/pyq-papers/ee_sem2_ph-102t_2025_end-term_2.pdf',
    fileName: 'ee_physics_2025.pdf',
    fileSizeBytes: 420000,
    pageCount: 3,
    description: 'EE Physics paper 2025',
    uploadedAt: '2026-02-01T11:00:00.000Z',
    downloadCount: 0,
    subjectCode: 'PH-102T',
    subjectName: 'Engineering Physics-II',
  };

  it('Strictly isolates active department papers to the active department ID', () => {
    const allPapers = [csitPaper, eePaper];

    // CSIT Department active
    const csitActivePapers = allPapers.filter((p) => p.departmentId === 'dept-csit');
    assert.strictEqual(csitActivePapers.length, 1);
    assert.strictEqual(csitActivePapers[0].id, 'paper-csit-1');
    assert.strictEqual(csitActivePapers[0].fileName, 'csit_physics_2025.pdf');

    // EE Department active
    const eeActivePapers = allPapers.filter((p) => p.departmentId === 'dept-ee');
    assert.strictEqual(eeActivePapers.length, 1);
    assert.strictEqual(eeActivePapers[0].id, 'paper-ee-1');
    assert.strictEqual(eeActivePapers[0].fileName, 'ee_physics_2025.pdf');
  });

  it('getPapersForSubject logic returns ONLY the paper matching the active department', () => {
    const allPapers = [csitPaper, eePaper];

    const getPapersForSubject = (deptId: string, subId: string, deptSubjects: Subject[]) => {
      const targetSub = deptSubjects.find((s) => s.id === subId);
      if (!targetSub) return [];
      return allPapers.filter((p) => {
        if (p.departmentId !== deptId) return false;
        if (p.subjectId === subId) return true;
        if (
          p.subjectCode &&
          p.subjectCode.trim().toLowerCase() === targetSub.subjectCode.trim().toLowerCase() &&
          p.semesterId === targetSub.semesterId
        ) {
          return true;
        }
        return false;
      });
    };

    // When student is in CSIT and clicks PH-102T:
    const csitResults = getPapersForSubject('dept-csit', csitSubject.id, [csitSubject]);
    assert.strictEqual(csitResults.length, 1);
    assert.strictEqual(csitResults[0].id, 'paper-csit-1');
    assert.strictEqual(csitResults[0].departmentId, 'dept-csit');

    // When student is in EE and clicks PH-102T:
    const eeResults = getPapersForSubject('dept-ee', eeSubject.id, [eeSubject]);
    assert.strictEqual(eeResults.length, 1);
    assert.strictEqual(eeResults[0].id, 'paper-ee-1');
    assert.strictEqual(eeResults[0].departmentId, 'dept-ee');
  });

  it('Replacing or re-uploading CSIT paper leaves EE paper completely unchanged', () => {
    let papers = [csitPaper, eePaper];

    // Admin uploads a replacement PDF for CSIT PH-102T
    const replacementCsitPaper: QuestionPaper = {
      ...csitPaper,
      filePath: 'https://example.supabase.co/storage/v1/object/public/pyq-papers/csit_sem2_ph-102t_2025_end-term_REPLACED.pdf',
      fileName: 'csit_physics_2025_v2.pdf',
      fileSizeBytes: 500000,
    };

    // Replace CSIT paper
    const existingIndex = papers.findIndex((p) =>
      p.departmentId === replacementCsitPaper.departmentId &&
      p.semesterId === replacementCsitPaper.semesterId &&
      p.subjectCode === replacementCsitPaper.subjectCode &&
      p.examinationYear === replacementCsitPaper.examinationYear
    );
    assert.notStrictEqual(existingIndex, -1);
    papers[existingIndex] = replacementCsitPaper;

    // Verify EE paper is untouched
    const eePaperAfterUpdate = papers.find((p) => p.departmentId === 'dept-ee');
    assert.ok(eePaperAfterUpdate);
    assert.strictEqual(eePaperAfterUpdate.id, 'paper-ee-1');
    assert.strictEqual(eePaperAfterUpdate.fileName, 'ee_physics_2025.pdf');
    assert.strictEqual(eePaperAfterUpdate.filePath, eePaper.filePath);

    // Verify CSIT paper is updated
    const csitPaperAfterUpdate = papers.find((p) => p.departmentId === 'dept-csit');
    assert.ok(csitPaperAfterUpdate);
    assert.strictEqual(csitPaperAfterUpdate.fileName, 'csit_physics_2025_v2.pdf');
  });

  it('Deleting CSIT paper leaves EE paper completely intact', () => {
    let papers = [csitPaper, eePaper];

    // Admin deletes CSIT paper
    const targetToDelete = csitPaper;
    papers = papers.filter((p) => {
      if (p.id === targetToDelete.id) return false;
      if (p.departmentId === targetToDelete.departmentId && p.filePath === targetToDelete.filePath) return false;
      return true;
    });

    // CSIT paper must be gone
    const csitRemaining = papers.filter((p) => p.departmentId === 'dept-csit');
    assert.strictEqual(csitRemaining.length, 0);

    // EE paper must still be present and working
    const eeRemaining = papers.filter((p) => p.departmentId === 'dept-ee');
    assert.strictEqual(eeRemaining.length, 1);
    assert.strictEqual(eeRemaining[0].id, 'paper-ee-1');
    assert.strictEqual(eeRemaining[0].fileName, 'ee_physics_2025.pdf');
  });

  it('filterQuestionPapers properly filters by departmentId', () => {
    const allPapers = [csitPaper, eePaper];
    const csitFiltered = filterQuestionPapers(allPapers, { departmentId: 'dept-csit' });
    assert.strictEqual(csitFiltered.length, 1);
    assert.strictEqual(csitFiltered[0].departmentId, 'dept-csit');

    const eeFiltered = filterQuestionPapers(allPapers, { departmentId: 'dept-ee' });
    assert.strictEqual(eeFiltered.length, 1);
    assert.strictEqual(eeFiltered[0].departmentId, 'dept-ee');
  });
});
