import test from 'node:test';
import assert from 'node:assert/strict';
import { filterQuestionPapers, calculateStatistics, slugify, formatBytes, isValidPdfFile } from './helpers';
import { Department, QuestionPaper, Subject } from '../types';

test('slugify converts titles to URL-safe slugs', () => {
  assert.equal(slugify('Computer Science & Information Technology'), 'computer-science-and-information-technology');
  assert.equal(slugify('B.Tech 4th Year - ME'), 'btech-4th-year-me');
  assert.equal(slugify('Special @#$ Characters'), 'special-characters');
});

test('formatBytes formats file sizes correctly', () => {
  assert.equal(formatBytes(0), '0 KB');
  assert.equal(formatBytes(1024), '1 KB');
  assert.equal(formatBytes(2.5 * 1024 * 1024), '2.5 MB');
});

test('calculateStatistics computes total counts accurately', () => {
  const mockDepts: Department[] = [
    { id: 'd1', name: 'CSIT', slug: 'csit', code: 'CS', description: '', iconName: 'Laptop', createdAt: '2025-01-01' },
    { id: 'd2', name: 'ECE', slug: 'ece', code: 'EC', description: '', iconName: 'Cpu', createdAt: '2025-01-01' }
  ];
  const mockSubjects: Subject[] = [
    { id: 's1', departmentId: 'd1', semesterId: 'sem1', subjectName: 'Data Structures', subjectCode: 'CS301', createdAt: '2025-01-01' }
  ];
  const mockPapers: QuestionPaper[] = [
    {
      id: 'p1',
      departmentId: 'd1',
      subjectId: 's1',
      academicYearId: 'y2',
      semesterId: 'sem3',
      examinationYear: 2024,
      examinationType: 'Regular',
      filePath: 'test.pdf',
      fileName: 'test.pdf',
      fileSizeBytes: 100000,
      pageCount: 3,
      uploadedAt: new Date().toISOString(), // within 30 days
      downloadCount: 50
    }
  ];

  const stats = calculateStatistics(mockDepts, mockSubjects, mockPapers);
  assert.equal(stats.totalDepartments, 2);
  assert.equal(stats.totalSubjects, 1);
  assert.equal(stats.totalQuestionPapers, 1);
  assert.equal(stats.latestUploadsCount, 1);
});

test('filterQuestionPapers filters by department and search query', () => {
  const papers: QuestionPaper[] = [
    {
      id: 'p1',
      departmentId: 'dept-cs',
      subjectId: 'sub-os',
      academicYearId: 'year-2',
      semesterId: 'sem-4',
      examinationYear: 2023,
      examinationType: 'Regular',
      filePath: '/papers/os-2023.pdf',
      fileName: 'os-2023.pdf',
      fileSizeBytes: 200000,
      pageCount: 4,
      uploadedAt: '2024-01-10T00:00:00.000Z',
      downloadCount: 120,
      departmentName: 'Computer Science & Information Technology',
      subjectName: 'Operating Systems',
      subjectCode: 'CS402'
    },
    {
      id: 'p2',
      departmentId: 'dept-me',
      subjectId: 'sub-td',
      academicYearId: 'year-2',
      semesterId: 'sem-3',
      examinationYear: 2022,
      examinationType: 'Carry Over',
      filePath: '/papers/thermo-2022.pdf',
      fileName: 'thermo-2022.pdf',
      fileSizeBytes: 150000,
      pageCount: 3,
      uploadedAt: '2024-02-15T00:00:00.000Z',
      downloadCount: 45,
      departmentName: 'Mechanical Engineering',
      subjectName: 'Thermodynamics',
      subjectCode: 'ME301'
    }
  ];

  // Test department filter
  const csResults = filterQuestionPapers(papers, { departmentId: 'dept-cs', sortBy: 'newest' });
  assert.equal(csResults.length, 1);
  assert.equal(csResults[0].id, 'p1');

  // Test query search by subject code
  const codeResults = filterQuestionPapers(papers, { searchQuery: 'ME301', sortBy: 'newest' });
  assert.equal(codeResults.length, 1);
  assert.equal(codeResults[0].id, 'p2');

  // Test query search by partial subject name
  const nameResults = filterQuestionPapers(papers, { searchQuery: 'Operating', sortBy: 'newest' });
  assert.equal(nameResults.length, 1);
  assert.equal(nameResults[0].id, 'p1');
});

test('INITIAL_SUBJECTS contains official Electrical Engineering 8-semester structure', async () => {
  const { INITIAL_SUBJECTS } = await import('../lib/dataStore');
  const eeSubjects = INITIAL_SUBJECTS.filter((s) => s.departmentId === 'dept-ee');
  
  // Total subjects in EE across Sem 1-8 (7+7+6+6+9+9+6+3 = 53)
  assert.equal(eeSubjects.length, 53);

  // Check key subject codes from user request
  const codes = new Set(eeSubjects.map((s) => s.subjectCode));
  assert.ok(codes.has('PH-101T'));
  assert.ok(codes.has('EE-103N')); // Circuit Theory
  assert.ok(codes.has('EL-102T')); // Basic Electronics Engineering
  assert.ok(codes.has('EE-201N')); // Network Analysis & Synthesis
  assert.ok(codes.has('EE-204N')); // Electrical Machines-II
  assert.ok(codes.has('EE-307N')); // Introduction to Electrical Vehicles
  assert.ok(codes.has('EE-314N')); // SCADA & Energy Management
  assert.ok(codes.has('EE-401N')); // Protection & Switchgear
  assert.ok(codes.has('EE-410P')); // Major Project
  assert.ok(codes.has('EE-412P')); // Internship
  assert.ok(codes.has('EE-420N')); // MOOC-I
});

test('INITIAL_SUBJECTS contains official Electronics & Communication Engineering 8-semester structure with no lab courses', async () => {
  const { INITIAL_SUBJECTS } = await import('../lib/dataStore');
  const eceSubjects = INITIAL_SUBJECTS.filter((s) => s.departmentId === 'dept-ece');

  // Total subjects in ECE across Sem 1-8: 7 + 6 + 6 + 6 + 6 + 6 + 14 + 12 = 63
  assert.equal(eceSubjects.length, 63);

  // Check semester-wise distribution
  const sem1 = eceSubjects.filter((s) => s.semesterId === 'sem-1');
  const sem2 = eceSubjects.filter((s) => s.semesterId === 'sem-2');
  const sem3 = eceSubjects.filter((s) => s.semesterId === 'sem-3');
  const sem4 = eceSubjects.filter((s) => s.semesterId === 'sem-4');
  const sem5 = eceSubjects.filter((s) => s.semesterId === 'sem-5');
  const sem6 = eceSubjects.filter((s) => s.semesterId === 'sem-6');
  const sem7 = eceSubjects.filter((s) => s.semesterId === 'sem-7');
  const sem8 = eceSubjects.filter((s) => s.semesterId === 'sem-8');

  assert.equal(sem1.length, 7);
  assert.equal(sem2.length, 6);
  assert.equal(sem3.length, 6);
  assert.equal(sem4.length, 6);
  assert.equal(sem5.length, 6);
  assert.equal(sem6.length, 6);
  assert.equal(sem7.length, 14);
  assert.equal(sem8.length, 12);

  // Verify completely NO laboratory courses
  for (const sub of eceSubjects) {
    assert.notEqual(sub.category, 'Practical');
    assert.ok(!sub.subjectName.toLowerCase().includes(' lab'), `Subject ${sub.subjectName} appears to be a lab`);
    assert.ok(!sub.subjectName.toLowerCase().includes('laboratory'), `Subject ${sub.subjectName} appears to be a lab`);
  }

  // Check key codes from user request
  const codes = new Set(eceSubjects.map((s) => s.subjectCode));
  assert.ok(codes.has('PH-101T'));
  assert.ok(codes.has('EE-101T'));
  assert.ok(codes.has('CY-103T'));
  assert.ok(codes.has('EL-101T'));
  assert.ok(codes.has('HU-103T'));
  assert.ok(codes.has('EC-201T'));
  assert.ok(codes.has('EC-202T'));
  assert.ok(codes.has('EC-204T'));
  assert.ok(codes.has('EI-202T'));
  assert.ok(codes.has('EC-301T'));
  assert.ok(codes.has('EC-302T'));
  assert.ok(codes.has('EC-415T'));
  assert.ok(codes.has('EC-403T'));
  assert.ok(codes.has('EE-405T'));
  assert.ok(codes.has('EC-407T')); // Industrial training
  assert.ok(codes.has('EC-409T')); // Seminar
  assert.ok(codes.has('EC-405P')); // Project-I
  assert.ok(codes.has('EC-436T')); // Optical fibre communication
  assert.ok(codes.has('EC-456T')); // Satellite communication
  assert.ok(codes.has('EC-402P')); // Project-II

  // Pool Electives (Sem 7 and Sem 8)
  assert.ok(codes.has('EC-433'));
  assert.ok(codes.has('EC-452T'));
  assert.ok(codes.has('ME-473T'));
  assert.ok(codes.has('CS-402T'));
  assert.ok(codes.has('EI-451T'));
  assert.ok(codes.has('EC-458T'));
  assert.ok(codes.has('EC-450T'));
  assert.ok(codes.has('EC-462T'));
  assert.ok(codes.has('EI-412T'));

  // Open Electives (Sem 7 and Sem 8)
  assert.ok(codes.has('PH-419T'));
  assert.ok(codes.has('MA-491T'));
  assert.ok(codes.has('CY-401T'));
  assert.ok(codes.has('HU-402T'));
  assert.ok(codes.has('HU-449T'));
  assert.ok(codes.has('PH-429T'));
  assert.ok(codes.has('HU-409T'));
  assert.ok(codes.has('HU-407T'));
});


