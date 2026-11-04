import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getPaperCompositeKey, deduplicateQuestionPapers } from '../utils/helpers';
import type { QuestionPaper } from '../types';

describe('Duplicate Upload Prevention & Idempotency', () => {
  const sampleCsitPaper1: QuestionPaper = {
    id: 'paper-1741180000000',
    departmentId: 'dept-csit',
    academicYearId: 'year-1',
    semesterId: 'sem-2',
    subjectId: 'sub-csit-sem2-4',
    subjectCode: 'PH-102T',
    subjectName: 'Engineering Physics-II',
    examinationYear: 2026,
    examinationType: 'Regular',
    filePath: 'https://example.supabase.co/storage/v1/object/public/pyq-papers/csit_sem2_ph-102t_2026_regular_1.pdf',
    fileName: 'PH-102T.pdf',
    fileSizeBytes: 256000,
    pageCount: 2,
    downloadCount: 0,
    uploadedAt: '2026-03-01T10:00:00.000Z',
  };

  const sampleCsitPaperDuplicate: QuestionPaper = {
    id: 'storage-csit_sem2_ph-102t_2026_regular_1.pdf',
    departmentId: 'dept-csit',
    academicYearId: 'year-1',
    semesterId: 'sem-2',
    subjectId: 'sub-csit-sem2-4',
    subjectCode: 'PH-102T',
    subjectName: 'Engineering Physics-II',
    examinationYear: 2026,
    examinationType: 'Regular',
    filePath: 'https://example.supabase.co/storage/v1/object/public/pyq-papers/csit_sem2_ph-102t_2026_regular_1.pdf',
    fileName: 'csit_sem2_ph-102t_2026_regular_1.pdf',
    fileSizeBytes: 256000,
    pageCount: 2,
    downloadCount: 0,
    uploadedAt: '2026-03-01T10:00:05.000Z',
  };

  const sampleCsitPaperDbRow: QuestionPaper = {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    departmentId: 'dept-csit',
    academicYearId: 'year-1',
    semesterId: 'sem-2',
    subjectId: 'sub-csit-sem2-4',
    subjectCode: 'PH-102T',
    subjectName: 'Engineering Physics-II',
    examinationYear: 2026,
    examinationType: 'Regular',
    filePath: 'https://example.supabase.co/storage/v1/object/public/pyq-papers/csit_sem2_ph-102t_2026_regular_1.pdf',
    fileName: 'PH-102T.pdf',
    fileSizeBytes: 256000,
    pageCount: 2,
    downloadCount: 0,
    uploadedAt: '2026-03-01T10:00:00.000Z',
  };

  const sampleEePaper: QuestionPaper = {
    id: 'paper-ee-2026',
    departmentId: 'dept-ee',
    academicYearId: 'year-1',
    semesterId: 'sem-2',
    subjectId: 'sub-ee-sem2-1',
    subjectCode: 'PH-102T',
    subjectName: 'Engineering Physics-II',
    examinationYear: 2026,
    examinationType: 'Regular',
    filePath: 'https://example.supabase.co/storage/v1/object/public/pyq-papers/ee_sem2_ph-102t_2026_regular_2.pdf',
    fileName: 'EE_PH-102T.pdf',
    fileSizeBytes: 300000,
    pageCount: 2,
    downloadCount: 0,
    uploadedAt: '2026-03-01T10:05:00.000Z',
  };

  const sampleCsit2025Paper: QuestionPaper = {
    id: 'paper-csit-2025',
    departmentId: 'dept-csit',
    academicYearId: 'year-1',
    semesterId: 'sem-2',
    subjectId: 'sub-csit-sem2-4',
    subjectCode: 'PH-102T',
    subjectName: 'Engineering Physics-II',
    examinationYear: 2025,
    examinationType: 'Regular',
    filePath: 'https://example.supabase.co/storage/v1/object/public/pyq-papers/csit_sem2_ph-102t_2025_regular.pdf',
    fileName: 'PH-102T_2025.pdf',
    fileSizeBytes: 240000,
    pageCount: 2,
    downloadCount: 0,
    uploadedAt: '2025-05-01T10:00:00.000Z',
  };

  it('Generates identical composite keys for matching department, semester, subject, year and exam type', () => {
    const key1 = getPaperCompositeKey(sampleCsitPaper1);
    const key2 = getPaperCompositeKey(sampleCsitPaperDuplicate);
    const key3 = getPaperCompositeKey(sampleCsitPaperDbRow);

    assert.strictEqual(key1, 'dept-csit::sem-2::PH-102T::2026::regular');
    assert.strictEqual(key1, key2);
    assert.strictEqual(key2, key3);
  });

  it('Generates distinct composite keys across different departments with the same subject code', () => {
    const csitKey = getPaperCompositeKey(sampleCsitPaper1);
    const eeKey = getPaperCompositeKey(sampleEePaper);

    assert.notStrictEqual(csitKey, eeKey);
    assert.strictEqual(csitKey, 'dept-csit::sem-2::PH-102T::2026::regular');
    assert.strictEqual(eeKey, 'dept-ee::sem-2::PH-102T::2026::regular');
  });

  it('Deduplicates duplicate entries into exactly ONE record', () => {
    // Simulating multiple entries generated from in-memory, storage scan, and DB
    const listWithDuplicates = [sampleCsitPaper1, sampleCsitPaperDuplicate];
    const deduplicated = deduplicateQuestionPapers(listWithDuplicates);

    assert.strictEqual(deduplicated.length, 1);
    assert.strictEqual(deduplicated[0].departmentId, 'dept-csit');
    assert.strictEqual(deduplicated[0].subjectCode, 'PH-102T');
    assert.strictEqual(deduplicated[0].examinationYear, 2026);
  });

  it('Prefers authoritative Supabase Database UUID row over transient storage or in-memory IDs', () => {
    const mixed = [sampleCsitPaper1, sampleCsitPaperDuplicate, sampleCsitPaperDbRow];
    const deduplicated = deduplicateQuestionPapers(mixed);

    assert.strictEqual(deduplicated.length, 1);
    assert.strictEqual(deduplicated[0].id, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890');
  });

  it('Preserves distinct records when uploading another PDF for a different year or department', () => {
    // 1 CSIT 2026 paper + 1 CSIT 2025 paper + 1 EE 2026 paper
    const papers = [sampleCsitPaper1, sampleCsit2025Paper, sampleEePaper];
    const deduplicated = deduplicateQuestionPapers(papers);

    assert.strictEqual(deduplicated.length, 3);
    assert.ok(deduplicated.some((p) => p.departmentId === 'dept-csit' && p.examinationYear === 2026));
    assert.ok(deduplicated.some((p) => p.departmentId === 'dept-csit' && p.examinationYear === 2025));
    assert.ok(deduplicated.some((p) => p.departmentId === 'dept-ee' && p.examinationYear === 2026));
  });

  it('Replacing an existing PDF updates the file without creating duplicate records', () => {
    const original = sampleCsitPaper1;
    const replacement: QuestionPaper = {
      ...original,
      filePath: 'https://example.supabase.co/storage/v1/object/public/pyq-papers/csit_sem2_ph-102t_2026_regular_v2.pdf',
      fileName: 'PH-102T_Updated.pdf',
      fileSizeBytes: 290000,
      uploadedAt: '2026-03-01T12:00:00.000Z',
    };

    const combined = [original, replacement];
    const deduplicated = deduplicateQuestionPapers(combined);

    assert.strictEqual(deduplicated.length, 1);
    assert.strictEqual(deduplicated[0].fileName, 'PH-102T_Updated.pdf');
    assert.strictEqual(deduplicated[0].fileSizeBytes, 290000);
  });
});
