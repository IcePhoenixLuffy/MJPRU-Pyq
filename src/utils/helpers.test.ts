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

test('INITIAL_SUBJECTS contains official CSIT 8-semester structure and 16-course elective catalogue', async () => {
  const { INITIAL_SUBJECTS } = await import('../lib/dataStore');
  const csitSubjects = INITIAL_SUBJECTS.filter((s) => s.departmentId === 'dept-csit');

  // Total CSIT subjects: 7 + 7 + 6 + 6 + 6 + 6 + 4 + 2 + 16 electives = 60
  assert.equal(csitSubjects.length, 60);

  // Check semester distribution of regular courses
  const sem1 = csitSubjects.filter((s) => s.semesterId === 'sem-1');
  const sem2 = csitSubjects.filter((s) => s.semesterId === 'sem-2');
  const sem3 = csitSubjects.filter((s) => s.semesterId === 'sem-3');
  const sem4 = csitSubjects.filter((s) => s.semesterId === 'sem-4');
  const sem5 = csitSubjects.filter((s) => s.semesterId === 'sem-5');
  const sem6 = csitSubjects.filter((s) => s.semesterId === 'sem-6');
  const sem7Regular = csitSubjects.filter((s) => s.semesterId === 'sem-7' && s.category !== 'Elective');
  const sem8Regular = csitSubjects.filter((s) => s.semesterId === 'sem-8' && s.category !== 'Elective');
  const electives = csitSubjects.filter((s) => s.category === 'Elective');

  assert.equal(sem1.length, 7);
  assert.equal(sem2.length, 7);
  assert.equal(sem3.length, 6);
  assert.equal(sem4.length, 6);
  assert.equal(sem5.length, 6);
  assert.equal(sem6.length, 6);
  assert.equal(sem7Regular.length, 4); // CS-401T, CS-403T, CS-405 (Seminar), TRN-401 (Training)
  assert.equal(sem8Regular.length, 2); // CS-402T, CS-406P (Major Project Lab)
  assert.equal(electives.length, 16);  // All 16 elective subjects in catalogue

  // Verify all 16 Elective Catalogue subjects
  const electiveCodes = new Set(electives.map((s) => s.subjectCode));
  const expectedElectiveCodes = [
    'CS-431T', 'CS-432T', 'CS-433T', 'CS-435T', 'CS-438T', 'CS-439T',
    'CS-441T', 'CS-443T', 'EC-403T', 'CS-445T', 'EE-458T', 'CS-447T',
    'CS-448T', 'CS-450T', 'CS-451T', 'CS-452T'
  ];
  for (const code of expectedElectiveCodes) {
    assert.ok(electiveCodes.has(code), `Elective code ${code} should be present in CSIT catalogue`);
  }

  // Verify exact subject names
  const codesMap = new Map(csitSubjects.map((s) => [s.subjectCode, s]));
  assert.equal(codesMap.get('CY-102T')?.subjectName, 'Environmental Studies: Scientific & Engineering Aspects.');
  assert.equal(codesMap.get('CS-101T')?.subjectName, 'Computer Programming and Fundamentals');
  assert.equal(codesMap.get('CS-205T')?.subjectName, 'Data Structure');
  assert.equal(codesMap.get('CS-309T')?.subjectName, 'Operating Systems');
  assert.equal(codesMap.get('CS-405')?.subjectName, 'Seminar');
  assert.equal(codesMap.get('CS-405')?.category, 'Seminar');
  assert.equal(codesMap.get('TRN-401')?.subjectName, 'Industrial Training');
  assert.equal(codesMap.get('TRN-401')?.category, 'Training');
  assert.equal(codesMap.get('CS-406P')?.subjectName, 'Major Project Lab');
  assert.equal(codesMap.get('CS-406P')?.category, 'Project');

  // Verify Laboratory Course exclusion rule:
  // No laboratory courses (Practical category) should be present
  for (const sub of csitSubjects) {
    assert.notEqual(sub.category, 'Practical');
    if (sub.subjectCode !== 'CS-406P') { // CS-406P Major Project Lab is a Project, not a lab
      assert.ok(!sub.subjectName.toLowerCase().includes('laboratory'), `Course ${sub.subjectCode} appears to be a lab`);
      assert.ok(!sub.subjectName.toLowerCase().endsWith(' lab'), `Course ${sub.subjectCode} appears to be a lab`);
    }
  }

  // Ensure excluded labs are not in CSIT
  const allCsitCodes = new Set(csitSubjects.map((s) => s.subjectCode));
  const excludedLabs = ['PH-101P', 'CS-101P', 'ME-101P', 'CY-102P', 'EC-102P', 'CS-102P', 'CS-208P', 'EC-204P', 'CS-202P', 'CS-301P', 'CS-309P', 'EI-309P', 'CS-306P', 'CS-310P', 'EC-302P', 'CS-401P', 'CS-402P'];
  for (const labCode of excludedLabs) {
    assert.ok(!allCsitCodes.has(labCode), `Excluded lab ${labCode} should not be in CSIT`);
  }
});

test('INITIAL_SUBJECTS contains official Chemical Engineering 8-semester structure and elective groups', async () => {
  const { INITIAL_SUBJECTS, INITIAL_DEPARTMENTS } = await import('../lib/dataStore');
  
  // Verify Chemical Engineering department metadata
  const cheDept = INITIAL_DEPARTMENTS.find((d) => d.id === 'dept-ce');
  assert.ok(cheDept, 'Chemical Engineering department exists');
  assert.equal(cheDept?.name, 'Chemical Engineering');
  assert.equal(cheDept?.code, 'CH');

  const cheSubjects = INITIAL_SUBJECTS.filter((s) => s.departmentId === 'dept-ce');

  // Total Chemical Engineering subjects: 10 + 10 + 6 + 6 + 6 + 7 + 12 + 7 = 64
  assert.equal(cheSubjects.length, 64);

  // Check semester distribution
  const sem1 = cheSubjects.filter((s) => s.semesterId === 'sem-1');
  const sem2 = cheSubjects.filter((s) => s.semesterId === 'sem-2');
  const sem3 = cheSubjects.filter((s) => s.semesterId === 'sem-3');
  const sem4 = cheSubjects.filter((s) => s.semesterId === 'sem-4');
  const sem5 = cheSubjects.filter((s) => s.semesterId === 'sem-5');
  const sem6 = cheSubjects.filter((s) => s.semesterId === 'sem-6');
  const sem7 = cheSubjects.filter((s) => s.semesterId === 'sem-7');
  const sem8 = cheSubjects.filter((s) => s.semesterId === 'sem-8');

  assert.equal(sem1.length, 10);
  assert.equal(sem2.length, 10);
  assert.equal(sem3.length, 6);
  assert.equal(sem4.length, 6);
  assert.equal(sem5.length, 6);
  assert.equal(sem6.length, 7);
  assert.equal(sem7.length, 12);
  assert.equal(sem8.length, 7);

  // Verify all 6 Elective Groups exist and are properly populated
  const elec1 = cheSubjects.filter((s) => s.electiveGroup === 'Departmental Elective-I');
  const elec2 = cheSubjects.filter((s) => s.electiveGroup === 'Departmental Elective-II');
  const elec3 = cheSubjects.filter((s) => s.electiveGroup === 'Departmental Elective-III');
  const elec4 = cheSubjects.filter((s) => s.electiveGroup === 'Departmental Elective-IV');
  const poolElec = cheSubjects.filter((s) => s.electiveGroup === 'Pool Elective');
  const openElec = cheSubjects.filter((s) => s.electiveGroup === 'Open Elective');

  assert.equal(elec1.length, 2); // CE-350, CE-352
  assert.equal(elec2.length, 2); // CE-451, CE-453
  assert.equal(elec3.length, 2); // CE-450, CE-452
  assert.equal(elec4.length, 2); // CE-460, CE-462
  assert.equal(poolElec.length, 2); // CE-461, CE-463
  assert.equal(openElec.length, 4); // CY***, PH***, HU**, HU***

  // Verify masked Open Electives codes are preserved verbatim
  const codesSet = new Set(cheSubjects.map((s) => s.subjectCode));
  assert.ok(codesSet.has('CY***'), 'Preserve masked CY*** code');
  assert.ok(codesSet.has('PH***'), 'Preserve masked PH*** code');
  assert.ok(codesSet.has('HU**'), 'Preserve masked HU** code');
  assert.ok(codesSet.has('HU***'), 'Preserve masked HU*** code');

  // Verify Project Work, Seminar, and Industrial Training
  const projectCourse = cheSubjects.find((s) => s.subjectCode === 'CE-402P');
  assert.ok(projectCourse, 'CE-402P Project Work and Viva Voce exists');
  assert.equal(projectCourse?.subjectName, 'Project Work and Viva Voce');
  assert.equal(projectCourse?.category, 'Project');
  assert.equal(projectCourse?.credits, 8);
  assert.equal(projectCourse?.semesterId, 'sem-8');

  const seminarCourse = cheSubjects.find((s) => s.subjectCode === 'CE-405');
  assert.ok(seminarCourse, 'CE-405 Seminar exists');
  assert.equal(seminarCourse?.subjectName, 'Report Writing, Seminar and Group Discussion');
  assert.equal(seminarCourse?.category, 'Seminar');
  assert.equal(seminarCourse?.credits, 2);
  assert.equal(seminarCourse?.semesterId, 'sem-7');

  const trainingCourse = cheSubjects.find((s) => s.subjectCode === 'TRN-401');
  assert.ok(trainingCourse, 'TRN-401 Training exists');
  assert.equal(trainingCourse?.subjectName, 'Industrial Training (Colloquium)');
  assert.equal(trainingCourse?.category, 'Training');
  assert.equal(trainingCourse?.credits, 2);
  assert.equal(trainingCourse?.semesterId, 'sem-7');

  // Verify complete absence of laboratory courses (Practical category)
  for (const sub of cheSubjects) {
    assert.notEqual(sub.category, 'Practical');
    if (sub.subjectCode !== 'CE-402P') {
      assert.ok(!sub.subjectName.toLowerCase().includes('lab'), `Course ${sub.subjectCode} must not be a lab`);
      assert.ok(!sub.subjectName.toLowerCase().includes('laboratory'), `Course ${sub.subjectCode} must not be a lab`);
    }
  }

  // Ensure excluded practical labs are not in Chemical Engineering
  const excludedCheLabs = [
    'PH-101P', 'CY-101P', 'CS-101P', 'EE-101P', 'EI-101P', 'ME-101P',
    'CE-201P', 'CE-203P', 'CY-201P', 'CE-202P', 'CE-204P',
    'CE-301P', 'CE-303P', 'CE-305P', 'CE-302P', 'CE-304P', 'CE-306P',
    'CE-401P', 'CE-403P'
  ];
  for (const labCode of excludedCheLabs) {
    assert.ok(!codesSet.has(labCode), `Laboratory course ${labCode} must be excluded`);
  }
});

test('INITIAL_SUBJECTS contains official Mechanical Engineering 8-semester structure and elective catalogues', async () => {
  const { INITIAL_SUBJECTS, INITIAL_DEPARTMENTS } = await import('../lib/dataStore');
  
  // Verify Mechanical Engineering department metadata
  const meDept = INITIAL_DEPARTMENTS.find((d) => d.id === 'dept-me');
  assert.ok(meDept, 'Mechanical Engineering department exists');
  assert.equal(meDept?.name, 'Mechanical Engineering');
  assert.equal(meDept?.code, 'ME');

  const meSubjects = INITIAL_SUBJECTS.filter((s) => s.departmentId === 'dept-me');

  // Total Mechanical Engineering subjects: 7 + 7 + 6 + 6 + 6 + 7 + 21 + 5 + 12 = 77
  assert.equal(meSubjects.length, 77);

  // Check semester distribution
  const sem1 = meSubjects.filter((s) => s.semesterId === 'sem-1');
  const sem2 = meSubjects.filter((s) => s.semesterId === 'sem-2');
  const sem3 = meSubjects.filter((s) => s.semesterId === 'sem-3');
  const sem4 = meSubjects.filter((s) => s.semesterId === 'sem-4');
  const sem5 = meSubjects.filter((s) => s.semesterId === 'sem-5');
  const sem6 = meSubjects.filter((s) => s.semesterId === 'sem-6');
  const sem7 = meSubjects.filter((s) => s.semesterId === 'sem-7');
  const sem8 = meSubjects.filter((s) => s.semesterId === 'sem-8');

  assert.equal(sem1.length, 7);
  assert.equal(sem2.length, 7);
  assert.equal(sem3.length, 6);
  assert.equal(sem4.length, 6);
  assert.equal(sem5.length, 6);
  assert.equal(sem6.length, 19); // 6 Theory + 1 Elective-I placeholder + 12 Catalogue electives
  assert.equal(sem7.length, 21); // 2 Theory + 1 Elective-II placeholder + 5 Pool + 10 Open + 1 Seminar + 1 Training + 1 Project-I
  assert.equal(sem8.length, 5);  // 1 Theory + 3 Elective placeholders (III, IV, V) + 1 Project-II

  // Verify key Theory subjects across semesters
  const codes = new Set(meSubjects.map((s) => s.subjectCode));
  assert.ok(codes.has('ME-101T'), 'ME-101T Manufacturing Techniques exists');
  assert.ok(codes.has('ME-103T'), 'ME-103T Engineering Graphics exists');
  assert.ok(codes.has('ME-104T'), 'ME-104T Basic Mechanical Engineering exists');
  assert.ok(codes.has('ME-201T'), 'ME-201T Kinematics of Machines exists');
  assert.ok(codes.has('ME-203T'), 'ME-203T Production Processes-I exists');
  assert.ok(codes.has('ME-205T'), 'ME-205T Fluid Mechanics exists');
  assert.ok(codes.has('ME-202T'), 'ME-202T Dynamics of Machines exists');
  assert.ok(codes.has('ME-204T'), 'ME-204T Mechanics of Solids-I exists');
  assert.ok(codes.has('ME-206T'), 'ME-206T Internal Combustion Engines exists');
  assert.ok(codes.has('ME-301T'), 'ME-301T Mechanics of Solids-II exists');
  assert.ok(codes.has('ME-303T'), 'ME-303T Mechanical Engineering Design-I exists');
  assert.ok(codes.has('ME-305T'), 'ME-305T Energy Conversion exists');
  assert.ok(codes.has('ME-307T'), 'ME-307T Heat Transfer exists');
  assert.ok(codes.has('ME-302T'), 'ME-302T Computer Aided Design exists');
  assert.ok(codes.has('ME-304T'), 'ME-304T Mechanical Engineering Design-II exists');
  assert.ok(codes.has('ME-403T'), 'ME-403T Computer Aided Manufacturing exists');
  assert.ok(codes.has('ME-415T'), 'ME-415T Value Engineering exists');
  assert.ok(codes.has('ME-406T'), 'ME-406T Refrigeration & Air Conditioning exists');

  // Verify all 5 ME-*** placeholders exist for elective slots
  const placeholders = meSubjects.filter((s) => s.subjectCode === 'ME-***');
  assert.equal(placeholders.length, 5);
  const placeholderGroups = new Set(placeholders.map((s) => s.electiveGroup));
  assert.ok(placeholderGroups.has('Elective-I'), 'Elective-I placeholder exists');
  assert.ok(placeholderGroups.has('Elective-II'), 'Elective-II placeholder exists');
  assert.ok(placeholderGroups.has('Elective-III'), 'Elective-III placeholder exists');
  assert.ok(placeholderGroups.has('Elective-IV'), 'Elective-IV placeholder exists');
  assert.ok(placeholderGroups.has('Elective-V'), 'Elective-V placeholder exists');

  // Verify 5 Pool Electives
  const poolElectives = meSubjects.filter((s) => s.electiveGroup === 'Pool Elective');
  assert.equal(poolElectives.length, 5);
  const poolCodes = new Set(poolElectives.map((s) => s.subjectCode));
  assert.ok(poolCodes.has('ME-473T')); // Work Study
  assert.ok(poolCodes.has('EC-475T')); // Audio Engineering
  assert.ok(poolCodes.has('EC-477T')); // Integrated Circuit Technology
  assert.ok(poolCodes.has('CS-479T')); // Artificial Intelligence
  assert.ok(poolCodes.has('CS-481T')); // Image Processing
  for (const pe of poolElectives) {
    assert.equal(pe.note, 'Offered by Engineering Departments');
  }

  // Verify 10 Open Electives
  const openElectives = meSubjects.filter((s) => s.electiveGroup === 'Open Elective');
  assert.equal(openElectives.length, 10);
  const openCodes = new Set(openElectives.map((s) => s.subjectCode));
  assert.ok(openCodes.has('HU-491T')); // Principal of Management
  assert.ok(openCodes.has('MA-491T')); // Operations Research
  assert.ok(openCodes.has('CY-491T')); // Charge Transfer in Plasma
  assert.ok(openCodes.has('HU-493T')); // Introduction to Psychology
  assert.ok(openCodes.has('CY-401T')); // Polymeric Materials and their Applications
  assert.ok(openCodes.has('PH-419T')); // Futuristic Materials
  assert.ok(openCodes.has('PH-429T')); // Material Imperfection and Applications
  assert.ok(openCodes.has('HU-402T')); // Engineering Economics
  assert.ok(openCodes.has('HU-409T')); // Quantitative Methods in Economics
  assert.ok(openCodes.has('HU-407T')); // Foreign Trade
  for (const oe of openElectives) {
    assert.equal(oe.note, 'Offered by Science and Humanities Department');
  }

  // Verify 12 Departmental Elective Catalogue courses
  const catalogueElectives = meSubjects.filter((s) => s.id.startsWith('sub-me-elec-'));
  assert.equal(catalogueElectives.length, 12);
  const catCodes = new Set(catalogueElectives.map((s) => s.subjectCode));
  const expectedCatCodes = [
    'ME-316T', 'ME-318T', 'ME-407T', 'ME-409T', 'ME-413T', 'ME-417T',
    'ME-408T', 'ME-414T', 'ME-412T', 'ME-416T', 'ME-418T', 'ME-422T'
  ];
  for (const c of expectedCatCodes) {
    assert.ok(catCodes.has(c), `Catalogue elective ${c} should be present`);
  }

  // Verify Project-I and Project-II categorized as Project
  const proj1 = meSubjects.find((s) => s.subjectCode === 'ME-405P');
  assert.ok(proj1, 'ME-405P Project-I exists');
  assert.equal(proj1?.category, 'Project');
  assert.equal(proj1?.subjectName, 'Project-I');

  const proj2 = meSubjects.find((s) => s.subjectCode === 'ME-404P');
  assert.ok(proj2, 'ME-404P Project-II exists');
  assert.equal(proj2?.category, 'Project');
  assert.equal(proj2?.subjectName, 'Project-II');

  // Verify Seminar and Industrial Training
  const semCourse = meSubjects.find((s) => s.subjectCode === 'ME-405T');
  assert.ok(semCourse, 'ME-405T Seminar exists');
  assert.equal(semCourse?.category, 'Seminar');

  const trnCourse = meSubjects.find((s) => s.subjectCode === 'ME-401');
  assert.ok(trnCourse, 'ME-401 Industrial Training exists');
  assert.equal(trnCourse?.category, 'Training');

  // Verify complete absence of laboratory courses (no Practical category)
  for (const s of meSubjects) {
    assert.notEqual(s.category, 'Practical');
    if (s.subjectCode !== 'ME-405P' && s.subjectCode !== 'ME-404P') {
      assert.ok(!s.subjectName.toLowerCase().includes('lab'), `Course ${s.subjectCode} must not be a lab`);
      assert.ok(!s.subjectName.toLowerCase().includes('laboratory'), `Course ${s.subjectCode} must not be a lab`);
    }
  }
});

test('INITIAL_SUBJECTS contains official Electronics & Instrumentation Engineering (EI) 2025-26 curriculum structure', async () => {
  const { INITIAL_SUBJECTS, INITIAL_DEPARTMENTS } = await import('../lib/dataStore');

  // Verify EI department metadata
  const eiDept = INITIAL_DEPARTMENTS.find((d) => d.id === 'dept-eie');
  assert.ok(eiDept, 'Electronics & Instrumentation Engineering department exists');
  assert.equal(eiDept?.name, 'Electronics & Instrumentation Engineering');
  assert.equal(eiDept?.code, 'EI');

  const eiSubjects = INITIAL_SUBJECTS.filter((s) => s.departmentId === 'dept-eie');

  // Total EI official non-lab subjects across 8 semesters: 8 + 7 + 6 + 6 + 8 + 9 + 18 + 1 = 63
  assert.equal(eiSubjects.length, 63);

  // Check semester distribution
  const sem1 = eiSubjects.filter((s) => s.semesterId === 'sem-1');
  const sem2 = eiSubjects.filter((s) => s.semesterId === 'sem-2');
  const sem3 = eiSubjects.filter((s) => s.semesterId === 'sem-3');
  const sem4 = eiSubjects.filter((s) => s.semesterId === 'sem-4');
  const sem5 = eiSubjects.filter((s) => s.semesterId === 'sem-5');
  const sem6 = eiSubjects.filter((s) => s.semesterId === 'sem-6');
  const sem7 = eiSubjects.filter((s) => s.semesterId === 'sem-7');
  const sem8 = eiSubjects.filter((s) => s.semesterId === 'sem-8');

  assert.equal(sem1.length, 8, 'Semester 1 has 8 theory courses');
  assert.equal(sem2.length, 7, 'Semester 2 has 7 theory courses');
  assert.equal(sem3.length, 6, 'Semester 3 has 6 theory courses');
  assert.equal(sem4.length, 6, 'Semester 4 has 6 theory courses');
  assert.equal(sem5.length, 8, 'Semester 5 has 5 core theory courses + 3 Pool Elective 1 courses');
  assert.equal(sem6.length, 9, 'Semester 6 has 6 core theory courses + 3 Pool Elective 2 courses');
  assert.equal(sem7.length, 18, 'Semester 7 has 2 theory + 5 Open Electives + 9 Pool Electives (3/4/5) + 1 Training + 1 Seminar');
  assert.equal(sem8.length, 1, 'Semester 8 has 1 Major Project / Internship');

  // Verify Paper Code coverage: all 63 subjects must have valid paperCode
  for (const s of eiSubjects) {
    assert.ok(s.paperCode, `Subject ${s.subjectCode} must have an official university paper code`);
    assert.match(s.paperCode, /^\d{5}$/, `Paper code ${s.paperCode} for ${s.subjectCode} must be a 5-digit code`);
  }

  // Spot-check key subject & paper codes
  const ph101 = eiSubjects.find((s) => s.subjectCode === 'PH-101T');
  assert.equal(ph101?.paperCode, '23031');
  assert.equal(ph101?.subjectName, 'Engineering Physics-I');

  const bme505 = eiSubjects.find((s) => s.subjectCode === 'BME-505C');
  assert.equal(bme505?.paperCode, '23602');

  const ee301t = eiSubjects.find((s) => s.subjectCode === 'EE-301T');
  assert.equal(ee301t?.paperCode, '23441');
  assert.equal(ee301t?.subjectName, 'Control Systems');

  // Verify Pool Elective 1 (Semester 5: 3 options)
  const pool1 = eiSubjects.filter((s) => s.electiveGroup === 'Pool Elective 1');
  assert.equal(pool1.length, 3);
  const pool1Codes = new Set(pool1.map((s) => s.subjectCode));
  assert.ok(pool1Codes.has('EL-307T')); // Computer Architecture and Organization (25344)
  assert.ok(pool1Codes.has('EL-309T')); // Principles of Communication (25345)
  assert.ok(pool1Codes.has('EL-311T')); // Telemetry and SCADA (25346)

  // Verify Pool Elective 2 (Semester 6: 3 options)
  const pool2 = eiSubjects.filter((s) => s.electiveGroup === 'Pool Elective 2');
  assert.equal(pool2.length, 3);
  const pool2Codes = new Set(pool2.map((s) => s.subjectCode));
  assert.ok(pool2Codes.has('EL-310T')); // Artificial Neural Networks and Fuzzy Logic (25355)
  assert.ok(pool2Codes.has('EL-312T')); // Intelligent Instrumentation (25356)
  assert.ok(pool2Codes.has('EL-314T')); // Industrial Automation and Robotics (25357)

  // Verify Pool Elective 3 (Semester 7: 3 options)
  const pool3 = eiSubjects.filter((s) => s.electiveGroup === 'Pool Elective 3');
  assert.equal(pool3.length, 3);
  const pool3Codes = new Set(pool3.map((s) => s.subjectCode));
  assert.ok(pool3Codes.has('EL-407T')); // Biomedical Signal Processing (25365)
  assert.ok(pool3Codes.has('EL-409T')); // Analytical Instrumentation (25366)
  assert.ok(pool3Codes.has('EL-411T')); // Power Plant Instrumentation (25367)

  // Verify Pool Elective 4 (Semester 7: 3 options)
  const pool4 = eiSubjects.filter((s) => s.electiveGroup === 'Pool Elective 4');
  assert.equal(pool4.length, 3);
  const pool4Codes = new Set(pool4.map((s) => s.subjectCode));
  assert.ok(pool4Codes.has('EL-413T')); // Micro Electro Mechanical Systems (25371)
  assert.ok(pool4Codes.has('EL-415T')); // Optoelectronics and Fiber Optics (25372)
  assert.ok(pool4Codes.has('EL-417T')); // Optimal Control Systems (25373)

  // Verify Pool Elective 5 (Semester 7: 3 options)
  const pool5 = eiSubjects.filter((s) => s.electiveGroup === 'Pool Elective 5');
  assert.equal(pool5.length, 3);
  const pool5Codes = new Set(pool5.map((s) => s.subjectCode));
  assert.ok(pool5Codes.has('EL-419T')); // Distributed Control System (25375)
  assert.ok(pool5Codes.has('EL-421T')); // Digital Image Processing (25376)
  assert.ok(pool5Codes.has('EL-423T')); // Virtual Instrumentation (25377)

  // Verify Open Electives in Semester 7 (5 options)
  const openElectives = eiSubjects.filter((s) => s.electiveGroup === 'Open Elective');
  assert.equal(openElectives.length, 5);
  const openCodes = new Set(openElectives.map((s) => s.subjectCode));
  assert.ok(openCodes.has('MA-491T')); // Operations Research (23033)
  assert.ok(openCodes.has('CY-401T')); // Polymeric Materials and their Applications (23052)
  assert.ok(openCodes.has('PH-419T')); // Futuristic Materials (23024)
  assert.ok(openCodes.has('HU-449T')); // Principles of Management (23017)
  assert.ok(openCodes.has('HU-409T')); // Quantitative Methods in Economics (23016)

  // Verify Academic & Training Components
  const project = eiSubjects.find((s) => s.subjectCode === 'EL-402P');
  assert.ok(project, 'EL-402P Major Project/Internship exists');
  assert.equal(project?.subjectName, 'Major Project/Internship');
  assert.equal(project?.category, 'Project');
  assert.equal(project?.credits, 12);
  assert.equal(project?.paperCode, '26326');
  assert.equal(project?.semesterId, 'sem-8');

  const training = eiSubjects.find((s) => s.subjectCode === 'EL-407');
  assert.ok(training, 'EL-407 Industrial Training exists');
  assert.equal(training?.category, 'Training');
  assert.equal(training?.credits, 2);
  assert.equal(training?.paperCode, '26324');
  assert.equal(training?.semesterId, 'sem-7');

  const seminar = eiSubjects.find((s) => s.subjectCode === 'EL-409');
  assert.ok(seminar, 'EL-409 Seminar exists');
  assert.equal(seminar?.category, 'Seminar');
  assert.equal(seminar?.credits, 2);
  assert.equal(seminar?.paperCode, '26325');
  assert.equal(seminar?.semesterId, 'sem-7');

  // Verify complete absence of laboratory courses
  const excludedLabs = [
    'CY-101P', 'CS-101P', 'EE-101P', 'EL-101P', 'PH-101P', 'EL-102P',
    'BME-501P', 'EL-201P', 'EL-203P', 'EL-204P', 'EL-206P', 'EL-208P',
    'EC-301P', 'EL-301P', 'EL-303P', 'EL-307P', 'EL-302P', 'EC-304P',
    'EL-304P', 'EL-401P', 'EL-405P'
  ];
  const allCodes = new Set(eiSubjects.map((s) => s.subjectCode));
  for (const lab of excludedLabs) {
    assert.ok(!allCodes.has(lab), `Practical lab ${lab} must not be in EI curriculum`);
  }
  for (const s of eiSubjects) {
    assert.notEqual(s.category, 'Practical');
    if (s.subjectCode !== 'EL-402P') {
      assert.ok(!s.subjectName.toLowerCase().includes('lab'), `Course ${s.subjectCode} must not be a lab`);
      assert.ok(!s.subjectName.toLowerCase().includes('laboratory'), `Course ${s.subjectCode} must not be a lab`);
    }
  }
});


