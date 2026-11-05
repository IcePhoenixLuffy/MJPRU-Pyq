import { describe, it } from 'node:test';
import assert from 'node:assert';
import { 
  parseRoute, 
  buildRouteUrl, 
  getParentRoute, 
  resolveDepartmentId, 
  resolveSubject, 
  resolvePaper,
  getPageTitle 
} from '../utils/navigation';
import type { Department, Subject, QuestionPaper } from '../types';

describe('Browser History and Navigation Router', () => {
  const mockDepartments: Department[] = [
    {
      id: 'dept-csit',
      name: 'Computer Science and Information Technology',
      slug: 'csit',
      code: 'CSIT',
      description: 'Computer Science',
      iconName: 'Laptop',
      createdAt: '2024-01-01',
    },
    {
      id: 'dept-ee',
      name: 'Electrical Engineering',
      slug: 'ee',
      code: 'EE',
      description: 'Electrical Engineering',
      iconName: 'Zap',
      createdAt: '2024-01-01',
    },
  ];

  const mockSubjects: Subject[] = [
    {
      id: 'sub-csit-sem2-4',
      departmentId: 'dept-csit',
      semesterId: 'sem-2',
      academicYearId: 'year-1',
      subjectName: 'Engineering Physics-II',
      subjectCode: 'PH-102T',
      category: 'Theory',
      credits: 4,
      createdAt: '2024-01-01',
    },
    {
      id: 'sub-ee-sem2-1',
      departmentId: 'dept-ee',
      semesterId: 'sem-2',
      academicYearId: 'year-1',
      subjectName: 'Engineering Physics-II',
      subjectCode: 'PH-102T',
      category: 'Theory',
      credits: 4,
      createdAt: '2024-01-01',
    },
  ];

  const mockPapers: QuestionPaper[] = [
    {
      id: 'paper-csit-2026',
      departmentId: 'dept-csit',
      academicYearId: 'year-1',
      semesterId: 'sem-2',
      subjectId: 'sub-csit-sem2-4',
      subjectCode: 'PH-102T',
      subjectName: 'Engineering Physics-II',
      examinationYear: 2026,
      examinationType: 'Regular',
      filePath: 'https://example.com/csit_sem2_ph-102t_2026.pdf',
      fileName: 'PH-102T.pdf',
      fileSizeBytes: 256000,
      pageCount: 2,
      downloadCount: 0,
      uploadedAt: '2026-03-01T10:00:00.000Z',
    },
  ];

  it('Parses root path as Homepage route', () => {
    const route = parseRoute('/', '');
    assert.strictEqual(route.tab, 'home');
    assert.strictEqual(route.deptId, undefined);
    assert.strictEqual(route.semId, undefined);
    assert.strictEqual(route.isModal, false);
  });

  it('Parses /departments and query parameters correctly', () => {
    const route = parseRoute('/departments', '?dept=dept-csit&year=year-1&sem=sem-2&subject=sub-csit-sem2-4&paper=paper-csit-2026');
    assert.strictEqual(route.tab, 'departments');
    assert.strictEqual(route.deptId, 'dept-csit');
    assert.strictEqual(route.yearId, 'year-1');
    assert.strictEqual(route.semId, 'sem-2');
    assert.strictEqual(route.subjectId, 'sub-csit-sem2-4');
    assert.strictEqual(route.paperId, 'paper-csit-2026');
    assert.strictEqual(route.isModal, true);
  });

  it('Builds canonical URL matching input route structure', () => {
    const url = buildRouteUrl({
      tab: 'departments',
      deptId: 'dept-csit',
      yearId: 'year-1',
      semId: 'sem-2',
      subjectId: 'sub-csit-sem2-4',
      paperId: 'paper-csit-2026',
    });

    assert.strictEqual(
      url,
      '/departments?dept=dept-csit&year=year-1&sem=sem-2&subject=sub-csit-sem2-4&paper=paper-csit-2026'
    );
  });

  it('Implements the exact 5-step backward navigation hierarchy', () => {
    // Step 5: Viewing Question Paper PDF
    const step5 = {
      tab: 'departments' as const,
      deptId: 'dept-csit',
      yearId: 'year-1',
      semId: 'sem-2',
      subjectId: 'sub-csit-sem2-4',
      paperId: 'paper-csit-2026',
    };

    // Step 5 -> Step 4: From Question Papers -> return to Subject Modal
    const step4 = getParentRoute(step5);
    assert.ok(step4);
    assert.strictEqual(step4.tab, 'departments');
    assert.strictEqual(step4.deptId, 'dept-csit');
    assert.strictEqual(step4.semId, 'sem-2');
    assert.strictEqual(step4.subjectId, 'sub-csit-sem2-4');
    assert.strictEqual(step4.paperId, undefined);
    assert.strictEqual(step4.isModal, true);

    // Step 4 -> Step 3: From Subject -> return to Year/Semester view
    const step3 = getParentRoute(step4);
    assert.ok(step3);
    assert.strictEqual(step3.tab, 'departments');
    assert.strictEqual(step3.deptId, 'dept-csit');
    assert.strictEqual(step3.yearId, 'year-1');
    assert.strictEqual(step3.semId, 'sem-2');
    assert.strictEqual(step3.subjectId, undefined);
    assert.strictEqual(step3.isModal, false);

    // Step 3 -> Step 2: From Year/Semester -> return to Department Selection view
    const step2 = getParentRoute(step3);
    assert.ok(step2);
    assert.strictEqual(step2.tab, 'departments');
    assert.strictEqual(step2.deptId, 'dept-csit');
    assert.strictEqual(step2.yearId, 'all');
    assert.strictEqual(step2.semId, 'all');

    // Step 2 -> Step 1: From Department Selection -> return to Homepage
    const step1 = getParentRoute(step2);
    assert.ok(step1);
    assert.strictEqual(step1.tab, 'home');

    // Step 1 -> External: Homepage returns null so browser pops to previous external page
    const external = getParentRoute(step1);
    assert.strictEqual(external, null);
  });

  it('Resolves department by code, slug or ID flexibly', () => {
    assert.strictEqual(resolveDepartmentId('CSIT', mockDepartments), 'dept-csit');
    assert.strictEqual(resolveDepartmentId('csit', mockDepartments), 'dept-csit');
    assert.strictEqual(resolveDepartmentId('dept-csit', mockDepartments), 'dept-csit');
    assert.strictEqual(resolveDepartmentId('EE', mockDepartments), 'dept-ee');
  });

  it('Resolves subject with department isolation', () => {
    // When dept-csit is specified, resolves CSIT subject
    const csitSub = resolveSubject('PH-102T', mockSubjects, 'dept-csit');
    assert.ok(csitSub);
    assert.strictEqual(csitSub?.id, 'sub-csit-sem2-4');
    assert.strictEqual(csitSub?.departmentId, 'dept-csit');

    // When dept-ee is specified, resolves EE subject
    const eeSub = resolveSubject('PH-102T', mockSubjects, 'dept-ee');
    assert.ok(eeSub);
    assert.strictEqual(eeSub?.id, 'sub-ee-sem2-1');
    assert.strictEqual(eeSub?.departmentId, 'dept-ee');
  });

  it('Resolves paper by ID or filename', () => {
    const paper = resolvePaper('paper-csit-2026', mockPapers);
    assert.ok(paper);
    assert.strictEqual(paper?.id, 'paper-csit-2026');

    const paperByFile = resolvePaper('PH-102T.pdf', mockPapers);
    assert.ok(paperByFile);
    assert.strictEqual(paperByFile?.id, 'paper-csit-2026');
  });

  it('Generates descriptive document title for different navigation routes', () => {
    const homeTitle = getPageTitle({ tab: 'home' });
    assert.ok(homeTitle.includes('MJPRU PYQ'));

    const deptTitle = getPageTitle(
      { tab: 'departments', deptId: 'dept-csit', semId: 'sem-2' },
      { deptName: 'Computer Science and IT', semName: 'Semester 2' }
    );
    assert.strictEqual(deptTitle, 'Computer Science and IT – Semester 2 | MJPRU PYQ');

    const pdfTitle = getPageTitle(
      { tab: 'departments', paperId: 'paper-1' },
      { paperTitle: 'Engineering Physics-II' }
    );
    assert.strictEqual(pdfTitle, 'Engineering Physics-II (PDF) | MJPRU PYQ');
  });
});
