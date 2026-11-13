import { Department, AcademicYear, Semester, Subject, QuestionPaper, FilterState, SystemStatistics, ExaminationType } from '../types';
import { filterQuestionPapers, calculateStatistics, slugify, getPaperCompositeKey, deduplicateQuestionPapers } from '../utils/helpers';
import { supabase, isSupabaseConfigured } from './supabase';
import { resolvePdfUrl, getStorageKeysForPaper } from '../utils/pdfGenerator';

/* ───────────────────────── Static seed data ───────────────────────── */

export const INITIAL_ACADEMIC_YEARS: AcademicYear[] = [1, 2, 3, 4].map((n) => ({
  id: `year-${n}`,
  name: `${['1st', '2nd', '3rd', '4th'][n - 1]} Year`,
  yearNumber: n,
}));

export const INITIAL_SEMESTERS: Semester[] = Array.from({ length: 8 }, (_, i) => ({
  id: `sem-${i + 1}`,
  semesterNumber: i + 1,
  academicYearId: `year-${Math.ceil((i + 1) / 2)}`,
  name: `Semester ${i + 1}`,
}));

// [idSuffix, name, slug, code, icon, description]
export const INITIAL_DEPARTMENTS: Department[] = ([
  ['csit', 'Computer Science and Information Technology', 'computer-science-and-information-technology', 'CSIT', 'Laptop', 'Foundations of computing, software systems, algorithms, database architectures, networks, and advanced theoretical computer science.'],
  ['csai', 'Computer Science and Artificial Intelligence', 'computer-science-and-artificial-intelligence', 'CSAI', 'Brain', 'Advanced machine learning, neural networks, natural language processing, and robotic vision.'],
  ['ece', 'Electronics & Communication Engineering', 'electronics-and-communication-engineering', 'ECE', 'Radio', 'Signal processing, semiconductor devices, wireless communication, and embedded hardware.'],
  ['ee', 'Electrical Engineering', 'electrical-engineering', 'EE', 'Zap', 'Power generation, high voltage grids, control systems, machines, and renewable energy.'],
  ['me', 'Mechanical Engineering', 'mechanical-engineering', 'ME', 'Cog', 'Thermodynamics, fluid mechanics, CAD/CAM manufacturing, robotics, and machine design.'],
  ['ce', 'Chemical Engineering', 'chemical-engineering', 'CH', 'FlaskConical', 'Reaction engineering, transport phenomena, chemical process equipment design, thermodynamics, and polymer technology.'],
  ['eie', 'Electronics & Instrumentation Engineering', 'electronics-and-instrumentation-engineering', 'EI', 'Gauge', 'Process instrumentation, sensors & transducers, biomedical systems, industrial automation, and control systems.'],
] as const).map(([id, name, slug, code, iconName, description]) => ({
  id: `dept-${id}`, name, slug, code, description, iconName, createdAt: '2024-01-01T00:00:00.000Z',
}));

/** [name, code, credits, extra?] — category defaults to 'Theory'. */
type Row = [name: string, code: string, credits: number, extra?: Partial<Subject>];

const mk = (dept: string, id: string, sem: number, [subjectName, subjectCode, credits, extra]: Row): Subject => ({
  id: `sub-${id}`, departmentId: `dept-${dept}`, semesterId: `sem-${sem}`,
  subjectName, subjectCode, category: 'Theory', credits, createdAt: '2024-01-01', ...extra,
});

/** One Row[] per semester → ids `sub-{idp}-sem{n}-{i}` (same ids as the original data). */
const scheme = (dept: string, idp: string, sems: Row[][]): Subject[] =>
  sems.flatMap((rows, i) => rows.map((r, j) => mk(dept, `${idp}-sem${i + 1}-${j + 1}`, i + 1, r)));

/** Elective group → ids `{idp}{i}`; rows are [name, code, paperCode?]. */
const elec = (dept: string, idp: string, sem: number, group: string | undefined, rows: string[][], note?: string, credits = 4): Subject[] =>
  rows.map(([n, c, paperCode], i) =>
    mk(dept, `${idp}${i + 1}`, sem, [n, c, credits, { category: 'Elective', electiveGroup: group, paperCode, ...(note && { note }) }]));

/** Rows for EI scheme: [name, code, paperCode, credits = 4]. */
const E = (rows: [string, string, string, number?][]): Row[] =>
  rows.map(([n, c, paperCode, cr = 4]) => [n, c, cr, { paperCode }]);

const SEM = { category: 'Seminar' } as const;
const TRN = { category: 'Training' } as const;
const PRJ = { category: 'Project' } as const;

// Rows shared by several departments
const PH1: Row = ['Engineering Physics-I', 'PH-101T', 4];
const CY1: Row = ['Engineering Chemistry', 'CY-101T', 4];
const MA1: Row = ['Engineering Mathematics-I', 'MA-101T', 4];
const ENG: Row = ['Communicative English', 'HU-101T', 3];
const PH2: Row = ['Engineering Physics-II', 'PH-102T', 4];
const MA2: Row = ['Engineering Mathematics-II', 'MA-102T', 4];
const MA3: Row = ['Engineering Mathematics-III', 'MA-201T', 4];
const MFG: Row = ['Manufacturing Techniques', 'ME-101T', 3];
const CPF: Row = ['Computer Programming and Fundamentals', 'CS-101T', 4];
const CFP: Row = ['Computer Fundamentals & Programming', 'CS-101T', 4];
const EG103: Row = ['Engineering Graphics', 'ME-103T', 3];
const SH_NOTE = 'Offered by Science and Humanities Department';

const csit: Subject[] = [
  ...scheme('csit', 'csit', [
    [PH1, CY1, MA1, ENG, CPF, MFG, EG103],
    [['Basic Electronics Engineering', 'EI-102T', 4], MA2, ['Basic Electrical Engineering', 'EE-102T', 4], PH2, ['Environmental Studies: Scientific & Engineering Aspects.', 'CY-102T', 3], ['Fundamental of Economics', 'HU-102T', 3], ['Basic Mechanical Engineering', 'ME-104T', 4]],
    [['Data Base Management System', 'CS-201T', 4], ['Discrete Mathematical Structure', 'CS-203T', 4], ['Data Structure', 'CS-205T', 4], ['Object Oriented Programming', 'CS-207T', 4], MA3, ['Analog Electronic', 'EI-201T', 4]],
    [['Analysis & Design of Algorithm', 'CS-202T', 4], ['Computer Organisation', 'CS-204T', 4], ['Data Communication', 'CS-206T', 4], ['Industrial Management', 'ME-212T', 3], ['Signal & Systems', 'EC-202T', 4], ['Digital Electronic', 'EC-204T', 4]],
    [['Computer Networks', 'CS-301T', 4], ['Software Engineering', 'CS-303T', 4], ['Principles of Programming Languages', 'CS-305T', 4], ['Theory of Computation', 'CS-307T', 4], ['Operating Systems', 'CS-309T', 4], ['Microprocessor & Their applications', 'EI-309T', 4]],
    [['Compiler Design', 'CS-304T', 4], ['Interactive Computer Graphics', 'CS-306T', 4], ['Distributed Systems', 'CS-308T', 4], ['Programming with JAVA', 'CS-310T', 4], ['Data Mining Techniques', 'CS-312T', 4], ['Digital Signal Processing', 'EC-302T', 4]],
    [['Advanced Computer Architecture', 'CS-401T', 4], ['Modeling & Simulation', 'CS-403T', 4], ['Seminar', 'CS-405', 2, SEM], ['Industrial Training', 'TRN-401', 2, TRN]],
    [['Advanced Computer Networks', 'CS-402T', 4], ['Major Project Lab', 'CS-406P', 8, PRJ]],
  ]),
  // Elective catalogue (not assigned to groups)
  ...([
    [7, 'Network Management Systems', 'CS-431T'], [7, 'Object Oriented Analysis and Design', 'CS-432T'], [7, 'Artificial Neural Networks', 'CS-433T'],
    [7, 'Parallel Computing and Algorithm', 'CS-435T'], [7, 'Fault Tolerance Computing', 'CS-438T'], [7, 'Artificial Intelligence & Expert System', 'CS-439T'],
    [7, 'Advanced Data Base Management System', 'CS-441T'], [7, 'Network Security and Cryptography', 'CS-443T'], [7, 'VLSI Design & Circuit', 'EC-403T'],
    [7, 'Stochastic Models for Computer Applications', 'CS-445T'], [7, 'Digital Image Processing', 'EE-458T'], [7, 'Web Technology', 'CS-447T'],
    [7, 'Distributed database System', 'CS-448T'], [8, 'Internet Programming with .net framework', 'CS-450T'],
    [8, 'Wireless network and Mobile Computing', 'CS-451T'], [8, 'Real Time System', 'CS-452T'],
  ] as [number, string, string][]).map(([s, n, c], i) => mk('csit', `csit-elec-${i + 1}`, s, [n, c, 4, { category: 'Elective' }])),
];

const csai: Subject[] = ([
  [3, 'Python for Data Science & AI', 'BAI-301'], [4, 'Artificial Intelligence Foundations', 'BAI-401'],
  [5, 'Machine Learning Algorithms', 'BAI-501'], [6, 'Deep Learning & Neural Networks', 'BAI-601'],
] as [number, string, string][]).map(([s, n, c], i) => mk('csai', `ai-${i + 1}`, s, [n, c, 4]));

const ece: Subject[] = [
  ...scheme('ece', 'ece', [
    [PH1, CY1, MA1, ENG, CFP, ['Basic Electrical Engineering', 'EE-101T', 4], ['Environments Studies', 'CY-103T', 3]],
    [PH2, MA2, ['Basic Electronics Engineering', 'EL-101T', 4], ENG, CFP, ['Engineering Economics', 'HU-103T', 3]],
    [['Electronics engineering materials', 'EC-201T', 4], ['Electromagnetic theory', 'EC-203T', 4], ['Analog electronics', 'EI-201T', 4], ['Electronic measurement and instrumentation', 'EI-203T', 4], ['Network analysis & Synthesis', 'EE-203T', 4], MA3],
    [['Signal and System', 'EC-202T', 4], ['Digital Electronic', 'EC-204T', 4], ['Leaner Integrated Circuits', 'EI-202T', 4], ['Industrial Management', 'ME-212T', 3], ['Computer Organization', 'CS-204T', 4], ['Element of Electrical Machines', 'EE-202T', 4]],
    [['Analog Communication Systems', 'EC-301T', 4], ['Antenna And Wave Propagation', 'EC-303T', 4], ['Consumer Electronics', 'EC-315T', 4], ['Microprocessor and Their Applications', 'EI-301T', 4], ['Control System', 'EE-301T', 4], ['Power Electronics', 'EE-303T', 4]],
    [['Digital Signal Processing', 'EC-302T', 4], ['Digital Communication System', 'EC-304T', 4], ['Microelectronics', 'EC-308T', 4], ['RADAR And Navigational Aids', 'EC-306T', 4], ['Data Network & Computer Network', 'CS-302T', 4], ['Microcontroller & Embedded System', 'EI-302T', 4]],
    [['Mobile communication', 'EC-415T', 4], ['VLSI design & circuit', 'EC-403T', 4], ['Microwave engineering', 'EE-405T', 4], ['Industrial training', 'EC-407T', 2, TRN], ['Seminar', 'EC-409T', 2, SEM], ['Project-I', 'EC-405P', 4, PRJ]],
    [['Optical fibre communication', 'EC-436T', 4], ['Satellite communication', 'EC-456T', 4], ['Project-II', 'EC-402P', 8, PRJ]],
  ]),
  ...elec('ece', 'ece-sem7-pool-', 7, 'Pool Elective', [['Digital system design', 'EC-433'], ['PC Interfacing', 'EC-452T'], ['Work Study', 'ME-473T'], ['Multimedia', 'CS-402T'], ['PCB Design & Technology', 'EI-451T']]),
  ...elec('ece', 'ece-sem7-open-', 7, 'Open Elective', [['Futuristic material', 'PH-419T'], ['Operation research', 'MA-491T'], ['Polymeric Materials and their Applications', 'CY-401T']]),
  ...elec('ece', 'ece-sem8-pool-', 8, 'Pool Elective', [['Digital Image Processing', 'EC-458T'], ['Microwave Communication', 'EC-450T'], ['DSP Processors and Architecture', 'EC-462T'], ['Fuzzy Logic and Neural Networks', 'EI-412T']]),
  ...elec('ece', 'ece-sem8-open-', 8, 'Open Elective', [['Engineering economics', 'HU-402T'], ['Principle of Management', 'HU-449T'], ['Material Imperfection and Applications', 'PH-429T'], ['Quantitative Methods in Economics', 'HU-409T'], ['Foreign Trade', 'HU-407T']]),
];

const ee: Subject[] = [
  ...scheme('ee', 'ee', [
    [PH1, CY1, MA1, ENG, CFP, ['Circuit Theory', 'EE-103N', 4], MFG],
    [PH2, MA2, ['Engineering Graphics', 'ME-107T', 3], ['Basic Electronics Engineering', 'EL-102T', 4], ['Environments Studies', 'CY-103T', 3], ['Fundamentals of Economics', 'HU-103T', 3], ['Basic Mechanical Engineering', 'ME-105T', 4]],
    [MA3, ['Analog Electronics', 'EL-201T', 4], ['Network Analysis & Synthesis', 'EE-201N', 4], ['Electrical Machines-I', 'EE-203N', 4], ['Electrical Measurement and Instrumentation', 'EE-205N', 4], ['Electrical Engineering Materials', 'EE-207N', 4]],
    [['Linear Integrated Circuits', 'EL-202T', 4], ['Digital Electronics', 'EC-204T', 4], ['Computer Organization', 'CS-204T', 4], ['Electrical Machines-II', 'EE-204N', 4], ['Power System-I', 'EE-206N', 4], ['Electromagnetic Field Theory', 'EE-208N', 4]],
    [['Control System', 'EE-301N', 4], ['Power Electronics', 'EE-303N', 4], ['Power System-II', 'EE-305N', 4], ['Microprocessor & their applications', 'EL-301T', 4], ['Signal & System', 'EC-202T', 4]],
    [['Power Plant Engineering', 'EE-304N', 4], ['Computer Simulation of Power System', 'EE-306N', 4], ['Advanced Control System', 'EE-308N', 4], ['Special Purpose Machines', 'EE-310N', 4], ['Elements of Communication Engg.', 'EC-312T', 4]],
    [['Protection & Switchgear', 'EE-401N', 4], ['Electric Drives & Control', 'EE-402N', 4], ['Industrial Training', 'EE-405T', 2, TRN], ['Seminar', 'EE-407T', 2, SEM]],
    [['Major Project', 'EE-410P', 8, PRJ],
     ['Internship', 'EE-412P', 4, { category: 'Practical', note: 'Internship / Practical component (Option with MOOC-I EE-420N)' }],
     ['MOOC-I', 'EE-420N', 4, { category: 'Elective', note: 'MOOC-I online course component (Option with Internship EE-412P)' }]],
  ]),
  ...elec('ee', 'ee-sem5-el', 5, 'Department Elective-I', [['Introduction to Electrical Vehicles', 'EE-307N'], ['Energy Efficiency & Conservation', 'EE-309N'], ['Internet of Things', 'EE-311N'], ['MOOC Course', 'EE-313N']], undefined, 3),
  ...elec('ee', 'ee-sem6-el', 6, 'Department Elective-II', [['SCADA & Energy Management', 'EE-314N'], ['Robotics and Automation', 'EE-316N'], ['FACTSs and Devices', 'EE-318N'], ['MOOC Course', 'EE-320N']], undefined, 3),
  mk('ee', 'ee-sem7-el3', 7, ['Department Elective-III', 'Department Elective-III', 3, { category: 'Elective', electiveGroup: 'Department Elective-III', note: 'Elective course options determined per academic session guidelines' }]),
  mk('ee', 'ee-sem7-oe', 7, ['Open Elective', 'Open Elective', 3, { category: 'Elective', electiveGroup: 'Open Elective', note: 'Interdisciplinary open elective course offered across university departments' }]),
];

const che: Subject[] = [
  ...scheme('ce', 'che', [
    [PH1, CY1, MA1, ENG, CFP, ['Engineering Graphics', 'ME-107T', 3], ['Basic Electrical Engineering (EE, EI & EC)', 'EE-101T', 4], ['Basic Electronics Engineering (ME, CS & CH)', 'EI-101T', 4], ['Environments Studies (EE, EI & EC)', 'CY-103T', 3], ['Engineering economics (ME, CS & CH)', 'HU-103T', 3]],
    [['Engineering Physics-II (All Branches)', 'PH-102T', 4], ['Engineering Mathematics-II (All Branches)', 'MA-102T', 4], ['Basic Electrical Engineering (CS, CH & ME)', 'EE-102T', 4], ['Basic Electronics Engineering (EE, EI & EC)', 'EI-101T', 4], ['Engineering Chemistry (CS, CH & ME)', 'CY-101T', 4], ['Communicative English (EE, EI & EC)', 'HU-101T', 3], ['Computer Fundamentals & Programming (EE, EI & EC)', 'CS-101T', 4], ['Engineering Graphics (ME, CS & CH)', 'ME-107T', 3], ['Environmental Studies (ME, CS & CH)', 'CY-103T', 3], ['Engineering Economics (EE, EI & EC)', 'HU-103T', 3]],
    [['Applied Organic Chemistry', 'CY-201', 4], ['Fluid and Particle Mechanics', 'CE-201', 4], ['Material and Energy Balance', 'CE-203', 4], ['Inorganic Chemical Technology', 'CE-205', 4], ['Chemical Engineering Fluid Mechanics', 'CE-207', 4], ['Mathematics II', 'MA-201', 4]],
    [['Heat Transfer', 'CE-202', 4], ['Chemical Engg Thermodynamics-I', 'CE-204', 4], ['Chemical Reaction Engg-I', 'CE-206', 4], ['Organic Chemical Technology', 'CE-208', 4], ['Material Science', 'ME-212', 3], ['Mathematics-III', 'MA-202', 4]],
    [['Chemical Reaction Engg.-II', 'CE-301', 4], ['Chemical Engg. Thermodynamics-II', 'CE-303', 4], ['Mass Transfer-I', 'CE-305', 4], ['Transport Phenomena', 'CE-307', 4], ['Energy Engg', 'CE-309', 4], ['Process Instrumentation', 'CE-311', 4]],
    [['Process Dynamic & Control', 'CE-302', 4], ['Process Engg & Economics', 'CE-304', 4], ['Equipment Design', 'CE-306', 4], ['Mass Transfer-II', 'CE-308', 4], ['Industrial Pollution Control', 'CE-310', 4]],
    [['Process Equipment Design', 'CE-401', 4], ['Process Utility & Safety', 'CE-403', 4]],
    [['Modelling Simulation & Optimization', 'CE-402', 4], ['Corrosion and Materials of construction', 'CE-404', 4]],
  ]),
  ...elec('ce', 'che-sem6-elec1-', 6, 'Departmental Elective-I', [['Computer Aided Design', 'CE-350'], ['Computer Application in Chemical Engineering', 'CE-352']]),
  ...elec('ce', 'che-sem7-elec2-', 7, 'Departmental Elective-II', [['Petroleum Refining and Petrochemical Technology', 'CE-451'], ['Fertilizer Technology', 'CE-453']]),
  ...elec('ce', 'che-sem7-pool-', 7, 'Pool Elective', [['Environmental Management', 'CE-461'], ['Polymer Science and Technology', 'CE-463']]),
  ...elec('ce', 'che-sem7-open-', 7, 'Open Elective', [['Polymer Technology (Chemistry)', 'CY***'], ['Futuristic Materials', 'PH***'], ['Principle of Management', 'HU**'], ['Foreign Trade', 'HU***']]),
  mk('ce', 'che-sem7-sem-1', 7, ['Report Writing, Seminar and Group Discussion', 'CE-405', 2, SEM]),
  mk('ce', 'che-sem7-trn-1', 7, ['Industrial Training (Colloquium)', 'TRN-401', 2, TRN]),
  ...elec('ce', 'che-sem8-elec3-', 8, 'Departmental Elective-III', [['Membrane Separation Processes', 'CE-450'], ['Fluidization Engineering', 'CE-452']]),
  ...elec('ce', 'che-sem8-elec4-', 8, 'Departmental Elective-IV', [['Solid Waste Management', 'CE-460'], ['Safety and Hazard Analysis in Process Industry', 'CE-462']]),
  mk('ce', 'che-sem8-proj-1', 8, ['Project Work and Viva Voce', 'CE-402P', 8, PRJ]),
];

const meHolder = (id: string, sem: number, label: string, note: string) =>
  mk('me', id, sem, [label, 'ME-***', 4, { category: 'Elective', electiveGroup: label, note }]);

const me: Subject[] = [
  ...scheme('me', 'me', [
    [PH1, CY1, MA1, ENG, CPF, MFG, EG103],
    [['Basic Electronics Engineering', 'EI-102T', 4], MA2, ['Basic Electrical Engineering', 'EE-102T', 4], PH2, ['Environmental Studies: Scientific & Engineering Aspects', 'CY-102T', 3], ['Fundamental of Economics', 'HU-102T', 3], ['Basic Mechanical Engineering', 'ME-104T', 4]],
    [['Kinematics of Machines', 'ME-201T', 4], ['Production Processes-I', 'ME-203T', 4], ['Fluid Mechanics', 'ME-205T', 4], MA3, ['Material Science', 'ME-207T', 4], ['Machines Drawing', 'ME-211T', 3]],
    [['Dynamics of Machines', 'ME-202T', 4], ['Mechanics of Solids-I', 'ME-204T', 4], ['Internal Combustion Engines', 'ME-206T', 4], ['Production Processes-II', 'ME-208T', 4], ['Principal of Machine Tool Design', 'ME-210T', 4], ['Elements of Electrical Machines', 'EE-202T', 4]],
    [['Mechanics of Solids-II', 'ME-301T', 4], ['Mechanical Engineering Design-I', 'ME-303T', 4], ['Energy Conversion', 'ME-305T', 4], ['Heat Transfer', 'ME-307T', 4], ['Mechanical Measurement and Metrology', 'ME-309T', 4], ['Production Management', 'ME-311T', 4]],
    [['Computer Aided Design', 'ME-302T', 4], ['Mechanical Engineering Design-II', 'ME-304T', 4], ['Production Planning & Control', 'ME-306T', 4], ['Turbo & Fluid Machinery', 'ME-308T', 4], ['Operation Research', 'ME-310T', 4], ['Microprocessor and Applications', 'EI-301T', 4]],
    [['Computer Aided Manufacturing', 'ME-403T', 4], ['Value Engineering', 'ME-415T', 4]],
    [['Refrigeration & Air Conditioning', 'ME-406T', 4]],
  ]),
  meHolder('me-sem6-elec1-holder', 6, 'Elective-I', 'Departmental Elective-I (Configurable from 12-Course ME Elective Catalogue)'),
  meHolder('me-sem7-elec2-holder', 7, 'Elective-II', 'Departmental Elective-II (Configurable from ME Elective Catalogue)'),
  meHolder('me-sem8-elec3-holder', 8, 'Elective-III', 'Departmental Elective-III (Configurable from ME Elective Catalogue)'),
  meHolder('me-sem8-elec4-holder', 8, 'Elective-IV', 'Departmental Elective-IV (Configurable from ME Elective Catalogue)'),
  meHolder('me-sem8-elec5-holder', 8, 'Elective-V', 'Departmental Elective-V (Configurable from ME Elective Catalogue)'),
  ...elec('me', 'me-pool-', 7, 'Pool Elective', [['Work Study', 'ME-473T'], ['Audio Engineering', 'EC-475T'], ['Integrated Circuit Technology', 'EC-477T'], ['Artificial Intelligence', 'CS-479T'], ['Image Processing', 'CS-481T']], 'Offered by Engineering Departments'),
  ...elec('me', 'me-open-', 7, 'Open Elective', [['Principal of Management', 'HU-491T'], ['Operations Research', 'MA-491T'], ['Charge Transfer in Plasma', 'CY-491T'], ['Introduction to Psychology', 'HU-493T'], ['Polymeric Materials and their Applications', 'CY-401T'], ['Futuristic Materials', 'PH-419T'], ['Material Imperfection and Applications', 'PH-429T'], ['Engineering Economics', 'HU-402T'], ['Quantitative Methods in Economics', 'HU-409T'], ['Foreign Trade', 'HU-407T']], SH_NOTE),
  mk('me', 'me-sem7-sem', 7, ['Seminar', 'ME-405T', 2, SEM]),
  mk('me', 'me-sem7-trn', 7, ['Industrial Training (Viva)', 'ME-401', 2, TRN]),
  mk('me', 'me-sem7-proj1', 7, ['Project-I', 'ME-405P', 4, PRJ]),
  mk('me', 'me-sem8-proj2', 8, ['Project-II', 'ME-404P', 8, PRJ]),
  ...elec('me', 'me-elec-', 6, undefined, [['Automotive Mechanics', 'ME-316T'], ['Statistical Quality Control', 'ME-318T'], ['Power Plant Engineering', 'ME-407T'], ['Composite Materials', 'ME-409T'], ['Tribology', 'ME-413T'], ['Advanced Manufacturing Systems', 'ME-417T'], ['Advance Precision Machining Processes', 'ME-408T'], ['Non Conventional Energy Sources', 'ME-414T'], ['Mechanical Vibration', 'ME-412T'], ['Gas Dynamics', 'ME-416T'], ['Maintenance Management', 'ME-418T'], ['Principles of Robotics', 'ME-422T']], 'Departmental Elective Catalogue'),
];

const ei: Subject[] = [
  ...scheme('eie', 'ei', [
    E([['Engineering Physics-I', 'PH-101T', '23031'], ['Engineering Chemistry-I', 'CY-101T', '23001'], ['Engineering Mathematics-I', 'MA-101T', '23021'], ['English Language & Literature', 'HU-101T', '23011', 3], ['Computer Fundamentals & Programming in C++', 'CS-101T', '25201'], ['Basic Electrical Engineering', 'EE-101N', '23401'], ['Basic Electronics Engineering', 'EL-101T', '25311'], ['Basic Mechanical Engineering', 'BME-505C', '23602']]),
    E([['Engineering Physics-II', 'PH-102T', '23032'], ['Engineering Mathematics-II', 'MA-102T', '23022'], ['Engineering Graphics', 'BME-503C', '23605', 3], ['Basic Electronics Engineering', 'EL-102T', '25311'], ['Environmental Studies', 'CY-103T', '23003', 3], ['Fundamentals of the Economics', 'HU-103T', '23013', 3], ['Manufacturing Techniques', 'BME-101C', '23601', 3]]),
    E([['Analog Electronics', 'EL-201T', '25321'], ['Electronic Measurement & Instrumentation', 'EL-203T', '25322'], ['Data Structure using C++', 'CS-203T', '25212'], ['Electromagnetic Theory', 'EC-203T', '23322'], ['Network Analysis & Synthesis', 'EE-201N', '23421'], ['Engineering Mathematics-III', 'MA-201T', '23023']]),
    E([['Linear Integrated Circuits', 'EL-202T', '23531'], ['Signals & Systems', 'EC-202T', '23331'], ['Digital Electronic Circuits', 'EL-204T', '23532'], ['Computer Organization', 'CS-204T', '25222'], ['Solid State Materials and Devices', 'EL-206T', '25333'], ['Human Values and Professional Ethics', 'HU-204T', '23019', 3]]),
    E([['Analog Communication Systems', 'EC-301T', '23341'], ['Microprocessors & Their Applications', 'EL-301T', '23541'], ['Sensors and Transducers', 'EL-303T', '23542'], ['Antenna Engineering', 'EL-305T', '25343'], ['Control Systems', 'EE-301T', '23441']]),
    E([['Digital Signal Processing', 'EC-302T', '23351'], ['Embedded Systems', 'EL-302T', '25351'], ['Digital Communication System', 'EC-304T', '23352'], ['VLSI Design', 'EL-304T', '25352'], ['RF and Microwave engineering', 'EL-306T', '25353'], ['Technical Writing', 'EL-308T', '25354', 3]]),
    E([['Biomedical Engineering', 'EL-401T', '25361'], ['Metrology and Calibration', 'EL-403T', '25362']]),
    [],
  ]),
  ...elec('eie', 'ei-sem5-pool1-', 5, 'Pool Elective 1', [['Semiconductor Fabrication technology', 'EL-307T', '25344'], ['PCB Design & Technology', 'EL-309T', '25345'], ['Mixed Signal Design', 'EL-311T', '25346']]),
  ...elec('eie', 'ei-sem6-pool2-', 6, 'Pool Elective 2', [['Artificial Intelligence and Machine Learning', 'EL-310T', '25355'], ['Information theory and coding', 'EL-312T', '25356'], ['Computational Electromagnetics', 'EL-314T', '25357']]),
  ...elec('eie', 'ei-open-', 7, 'Open Elective', [['Operation Research', 'MA-491T', '23033'], ['Polymeric Materials and their Applications', 'CY-401T', '23052'], ['Futuristic Materials', 'PH-419T', '23024'], ['Principles of Management', 'HU-449T', '23017'], ['Quantitative Methods in Economics', 'HU-409T', '23016']], SH_NOTE),
  ...elec('eie', 'ei-pool3-', 7, 'Pool Elective 3', [['Nano Electronics', 'EL-407T', '25365'], ['Microwave Integrated Circuit', 'EL-409T', '25366'], ['Introduction to MEMS', 'EL-411T', '25367']]),
  ...elec('eie', 'ei-pool4-', 7, 'Pool Elective 4', [['Optical fiber communication', 'EL-413T', '25371'], ['Wireless communication', 'EL-415T', '25372'], ['Wireless sensor network', 'EL-417T', '25373']]),
  ...elec('eie', 'ei-pool5-', 7, 'Pool Elective 5', [['Digital System Design', 'EL-419T', '25375'], ['Digital Audio Processing', 'EL-421T', '25376'], ['Milli meter wave Device and circuits', 'EL-423T', '25377']]),
  mk('eie', 'ei-sem7-trn', 7, ['Industrial Training (EI)', 'EL-407', 2, { ...TRN, paperCode: '26324' }]),
  mk('eie', 'ei-sem7-sem', 7, ['Seminar (EI)', 'EL-409', 2, { ...SEM, paperCode: '26325' }]),
  mk('eie', 'ei-sem8-proj', 8, ['Major Project/Internship', 'EL-402P', 12, { ...PRJ, paperCode: '26326' }]),
];

export const INITIAL_SUBJECTS: Subject[] = [...csit, ...csai, ...ece, ...ee, ...che, ...me, ...ei];
export const INITIAL_PAPERS: QuestionPaper[] = [];

/* ───────────────────────── Helpers ───────────────────────── */

const STORAGE_KEY = 'mjpru_pyq_platform_data_v10';
const DELETED_KEY = 'mjpru_pyq_deleted_storage_keys_v1';
const LEGACY_KEYS = ['mjpru_pyq_platform_data', ...Array.from({ length: 9 }, (_, i) => `mjpru_pyq_platform_data_v${i + 1}`)];
const MANAGED_DEPTS = new Set(['csit', 'ee', 'ece', 'ce', 'me', 'eie'].map((d) => `dept-${d}`));
const CUSTOM_SUBJECT_ID = /^sub-\d{10,}$/;
const DEMO_PAPER_ID = /^paper-([1-9]|10)$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const BUCKET = 'pyq-papers';

const uid = () => `${Date.now()}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

const lsGet = <T,>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};
const lsSet = (key: string, value: unknown) => {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Could not save ${key}:`, e);
  }
};

type Db = NonNullable<typeof supabase>;

/** Runs a Supabase write and actually surfaces `{ error }` (supabase-js doesn't throw on it). */
const remote = async (label: string, fn: (db: Db) => PromiseLike<{ error: { message: string } | null }>) => {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    const { error } = await fn(supabase);
    if (error) console.warn(`Supabase ${label}:`, error.message);
  } catch (e) {
    console.warn(`Supabase ${label}:`, e);
  }
};

const subjectRow = (s: Subject) => ({
  id: s.id,
  department_id: s.departmentId,
  semester_id: s.semesterId,
  subject_name: s.subjectName,
  subject_code: s.subjectCode,
  credits: s.credits || 4,
  category: s.category || 'Theory',
  elective_group: s.electiveGroup || null,
  note: s.note || null,
  paper_code: s.paperCode || null,
});

const parseSession = (t?: string): number | string => {
  if (!t) return '2025–26';
  const m = t.match(/^(\d{4})[–—-](\d{2})$/);
  if (m) return `${m[1]}–${m[2]}`;
  const y = parseInt(t, 10);
  return !isNaN(y) && y >= 2000 ? y : t;
};

const parseExamType = (raw = ''): ExaminationType => {
  const t = raw.toLowerCase();
  if (t.includes('back')) return 'Back Paper';
  if (t.includes('carry')) return 'Carry Over';
  if (t.includes('improve')) return 'Improvement';
  if (t.includes('mid')) return 'Mid-Term';
  if (t.includes('end')) return 'End-Term';
  return 'Regular';
};

interface StoredData {
  departments: Department[];
  subjects: Subject[];
  papers: QuestionPaper[];
}

type CompKeyInput = Pick<QuestionPaper, 'departmentId' | 'semesterId' | 'subjectId' | 'subjectCode' | 'examinationYear' | 'examinationType'>;

/* ───────────────────────── Store ───────────────────────── */

export class DataStore {
  private departments: Department[] = [];
  private subjects: Subject[] = [];
  private papers: QuestionPaper[] = [];
  private readonly academicYears = INITIAL_ACADEMIC_YEARS;
  private readonly semesters = INITIAL_SEMESTERS;
  private deletedKeys = new Set<string>();

  constructor() {
    this.load();
  }

  /* ── persistence ── */

  private load() {
    const seed = () => {
      this.departments = [...INITIAL_DEPARTMENTS];
      this.subjects = [...INITIAL_SUBJECTS];
      this.papers = [];
    };

    try {
      LEGACY_KEYS.forEach((k) => { try { localStorage.removeItem(k); } catch { /* ignore */ } });
      this.deletedKeys = new Set(lsGet<string[]>(DELETED_KEY) ?? []);

      const stored = lsGet<StoredData>(STORAGE_KEY);
      if (!stored) {
        seed();
      } else {
        const initDept = new Map(INITIAL_DEPARTMENTS.map((d) => [d.id, d]));
        this.departments = (stored.departments ?? INITIAL_DEPARTMENTS).map((d) => {
          const init = initDept.get(d.id);
          return init ? { ...d, name: init.name, code: init.code } : d;
        });
        const deptIds = new Set(this.departments.map((d) => d.id));

        // Official schemes win, but keep admin-assigned elective metadata (matched by ID, not subject code).
        const storedSubjects = stored.subjects ?? [];
        const userById = new Map(storedSubjects.map((s) => [s.id, s]));
        const official = INITIAL_SUBJECTS.filter((s) => MANAGED_DEPTS.has(s.departmentId) && deptIds.has(s.departmentId)).map((s) => {
          const u = userById.get(s.id);
          return u?.electiveGroup
            ? { ...s, electiveGroup: u.electiveGroup, semesterId: u.semesterId || s.semesterId, category: u.category || s.category, paperCode: u.paperCode || s.paperCode, note: u.note || s.note }
            : s;
        });
        // Keep non-managed departments' subjects, plus admin-added subjects in managed departments.
        const kept = storedSubjects.filter((s) => !MANAGED_DEPTS.has(s.departmentId) || CUSTOM_SUBJECT_ID.test(s.id));
        this.subjects = [...kept.filter((s) => !MANAGED_DEPTS.has(s.departmentId) || !official.some((o) => o.id === s.id)), ...official];

        this.papers = deduplicateQuestionPapers((stored.papers ?? []).filter((p) => !DEMO_PAPER_ID.test(p.id)));
      }
      this.save();
    } catch {
      seed();
    }
    this.hydrate();
  }

  private save() {
    lsSet(STORAGE_KEY, { departments: this.departments, subjects: this.subjects, papers: this.papers } satisfies StoredData);
  }

  private saveDeleted() {
    lsSet(DELETED_KEY, Array.from(this.deletedKeys));
  }

  private commit() {
    this.save();
    this.hydrate();
  }

  private hydrate() {
    const dept = new Map(this.departments.map((d) => [d.id, d]));
    const sub = new Map(this.subjects.map((s) => [s.id, s]));
    const sem = new Map(this.semesters.map((s) => [s.id, s]));
    const year = new Map(this.academicYears.map((y) => [y.id, y]));

    this.papers.forEach((p) => {
      const s = sub.get(p.subjectId);
      p.departmentName = dept.get(p.departmentId)?.name || 'Department of Technology';
      p.subjectName = s?.subjectName || 'Engineering Subject';
      p.subjectCode = s?.subjectCode || 'BT-000';
      p.paperCode = s?.paperCode || p.paperCode;
      p.semesterNumber = sem.get(p.semesterId)?.semesterNumber || 1;
      p.academicYearName = year.get(p.academicYearId)?.name || 'Academic Year';
    });
  }

  private isDeleted(...keys: (string | null | undefined)[]) {
    return keys.some((k) => k && this.deletedKeys.has(k));
  }

  private semesterNumber = (id: string) => this.semesters.find((s) => s.id === id)?.semesterNumber;

  private compKey(p: CompKeyInput) {
    const subjectCode = this.subjects.find((s) => s.id === p.subjectId)?.subjectCode || p.subjectCode;
    return getPaperCompositeKey({
      departmentId: p.departmentId, semesterId: p.semesterId, subjectId: p.subjectId,
      subjectCode, examinationYear: p.examinationYear, examinationType: p.examinationType,
    });
  }

  /* ── departments ── */

  async getDepartments(): Promise<Department[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('departments').select('*').order('name');
        if (!error && data?.length) {
          return data.map((d) => ({
            id: d.id, name: d.name, slug: d.slug, code: d.code, description: d.description || '',
            iconName: d.icon_name || 'GraduationCap', createdAt: d.created_at,
          }));
        }
      } catch (err) {
        console.warn('Supabase departments fetch fallback:', err);
      }
    }
    return [...this.departments];
  }

  async addDepartment(dept: Omit<Department, 'id' | 'createdAt' | 'slug'>): Promise<Department> {
    const d: Department = { ...dept, id: `dept-${uid()}`, slug: slugify(dept.name), createdAt: new Date().toISOString() };
    await remote('add department', (db) =>
      db.from('departments').insert({ id: d.id, name: d.name, slug: d.slug, code: d.code, description: d.description, icon_name: d.iconName }));
    this.departments.push(d);
    this.commit();
    return d;
  }

  async updateDepartment(id: string, updates: Partial<Department>): Promise<Department> {
    const i = this.departments.findIndex((d) => d.id === id);
    if (i === -1) throw new Error('Department not found');
    const d = { ...this.departments[i], ...updates, slug: updates.name ? slugify(updates.name) : this.departments[i].slug };
    await remote('update department', (db) =>
      db.from('departments').update({ name: d.name, slug: d.slug, code: d.code, description: d.description, icon_name: d.iconName }).eq('id', id));
    this.departments[i] = d;
    this.commit();
    return d;
  }

  async deleteDepartment(id: string): Promise<boolean> {
    await remote('delete department', (db) => db.from('departments').delete().eq('id', id));
    this.departments = this.departments.filter((d) => d.id !== id);
    this.subjects = this.subjects.filter((s) => s.departmentId !== id);
    this.papers = this.papers.filter((p) => p.departmentId !== id);
    this.commit();
    return true;
  }

  /* ── academic years & semesters ── */

  getAcademicYears(): AcademicYear[] {
    return [...this.academicYears];
  }

  getSemesters(academicYearId?: string): Semester[] {
    return academicYearId && academicYearId !== 'all'
      ? this.semesters.filter((s) => s.academicYearId === academicYearId)
      : [...this.semesters];
  }

  /* ── subjects ── */

  async getSubjects(departmentId?: string, semesterId?: string): Promise<Subject[]> {
    return this.subjects.filter(
      (s) => (!departmentId || departmentId === 'all' || s.departmentId === departmentId) &&
             (!semesterId || semesterId === 'all' || s.semesterId === semesterId));
  }

  async addSubject(sub: Omit<Subject, 'id' | 'createdAt'>): Promise<Subject> {
    const s: Subject = { ...sub, id: `sub-${uid()}`, createdAt: new Date().toISOString() };
    await remote('add subject', (db) => db.from('subjects').insert(subjectRow(s)));
    this.subjects.push(s);
    this.commit();
    return s;
  }

  async updateSubject(id: string, updates: Partial<Subject>): Promise<Subject> {
    const i = this.subjects.findIndex((s) => s.id === id);
    if (i === -1) throw new Error('Subject not found');
    const s = { ...this.subjects[i], ...updates };
    await remote('update subject', (db) => db.from('subjects').update(subjectRow(s)).eq('id', id));
    this.subjects[i] = s;
    this.commit();
    return s;
  }

  async deleteSubject(id: string): Promise<boolean> {
    await remote('delete subject', (db) => db.from('subjects').delete().eq('id', id));
    this.subjects = this.subjects.filter((s) => s.id !== id);
    this.papers = this.papers.filter((p) => p.subjectId !== id);
    this.save();
    return true;
  }

  /* ── Supabase sync ── */

  /** Structured: dept_semN_subCode_session_type_ts.pdf — legacy: subCode_session_type_ts.pdf */
  private parseFileName(fileName: string) {
    const parts = fileName.replace(/\.pdf$/i, '').split('_');
    const first = parts[0].toLowerCase();
    const dept = parts.length >= 4
      ? this.departments.find((d) => d.code.toLowerCase() === first || slugify(d.code) === first || d.id === first)
      : undefined;
    const o = dept ? 2 : 0;
    return {
      dept,
      sem: dept ? parseInt(parts[1].toLowerCase().replace(/^sem/, ''), 10) || 0 : 0,
      subCode: (parts[o] || '').toUpperCase(),
      examYear: parseSession(parts[o + 1]),
      examType: parseExamType(parts[o + 2]),
    };
  }

  async syncWithSupabase(): Promise<void> {
    if (!isSupabaseConfigured() || !supabase) return;
    const db = supabase;

    try {
      const papers = new Map<string, QuestionPaper>();
      const seen = new Map<string, string>(); // compositeKey -> paperId
      /** Registers a paper; returns the already-registered duplicate, or null if newly added. */
      const add = (p: QuestionPaper): QuestionPaper | null => {
        const k = getPaperCompositeKey(p);
        const existing = seen.get(k);
        if (existing) return papers.get(existing) ?? null;
        seen.set(k, p.id);
        papers.set(p.id, p);
        return null;
      };

      // 1. Database rows
      try {
        const { data: rows, error } = await db.from('question_papers').select('*').order('uploaded_at', { ascending: false });
        if (error) console.warn('Supabase papers fetch:', error.message);
        (rows ?? []).forEach((row) => {
          if (this.isDeleted(row.id, row.file_name, row.file_path)) return;
          const sub = this.subjects.find((s) => s.id === row.subject_id);
          add({
            id: row.id,
            departmentId: row.department_id,
            subjectId: row.subject_id,
            academicYearId: row.academic_year_id,
            semesterId: row.semester_id,
            examinationYear: row.examination_year,
            examinationType: (row.examination_type as ExaminationType) || 'Regular',
            filePath: resolvePdfUrl(row.file_path) || row.file_path,
            fileName: row.file_name,
            fileSizeBytes: row.file_size_bytes || 0,
            pageCount: row.page_count || 2,
            description: row.description || '',
            downloadCount: row.download_count || 0,
            uploadedAt: row.uploaded_at || new Date().toISOString(),
            subjectCode: sub?.subjectCode,
            subjectName: sub?.subjectName,
          });
        });
      } catch (e) {
        console.warn('Supabase DB papers fetch fallback:', e);
      }

      // 2. Local papers (this session's uploads / not yet in DB)
      this.papers.forEach((p) => {
        if (!p.filePath || this.isDeleted(p.id, p.fileName, p.filePath)) return;
        const dup = add(p);
        if (!dup) return;
        if (new Date(p.uploadedAt || 0) > new Date(dup.uploadedAt || 0)) {
          Object.assign(dup, { filePath: p.filePath, fileName: p.fileName, fileSizeBytes: p.fileSizeBytes, uploadedAt: p.uploadedAt });
        }
        dup.downloadCount = Math.max(dup.downloadCount, p.downloadCount);
      });

      // 3. Orphan files in storage that have no catalogued record
      try {
        // NOTE: list() is not paginated beyond `limit`; page with `offset` if the bucket may exceed 1000 files.
        const { data: files, error } = await db.storage.from(BUCKET).list(undefined, { limit: 1000 });
        if (error) console.warn('Supabase storage list:', error.message);

        (files ?? []).forEach((file) => {
          if (!file.name?.toLowerCase().endsWith('.pdf')) return;
          if (this.isDeleted(file.name, decodeURIComponent(file.name), file.id)) return;

          const publicUrl = db.storage.from(BUCKET).getPublicUrl(file.name).data?.publicUrl || file.name;
          if (this.isDeleted(publicUrl)) return;
          for (const p of papers.values()) {
            if (p.filePath === publicUrl || p.filePath.includes(file.name) || p.fileName === file.name) return;
          }

          const { dept, sem, subCode, examYear, examType } = this.parseFileName(file.name);
          const code = subCode.toLowerCase();
          // Subject codes repeat across semesters/departments, so prefer the semester encoded in the file name.
          const cands = this.subjects.filter((s) => s.subjectCode.toLowerCase() === code && (!dept || s.departmentId === dept.id));
          const sub = cands.find((s) => this.semesterNumber(s.semesterId) === sem) ?? cands[0];
          if (!sub) return;

          const paper: QuestionPaper = {
            id: file.id || `storage-${file.name}`,
            departmentId: sub.departmentId,
            subjectId: sub.id,
            academicYearId: this.semesters.find((s) => s.id === sub.semesterId)?.academicYearId ?? 'year-1',
            semesterId: sub.semesterId,
            examinationYear: examYear,
            examinationType: examType,
            filePath: publicUrl,
            fileName: file.name,
            fileSizeBytes: file.metadata?.size ?? 256000,
            pageCount: 2,
            description: `Examination question paper for ${sub.subjectName} (${subCode}).`,
            downloadCount: 0,
            uploadedAt: file.created_at || new Date().toISOString(),
            subjectCode: sub.subjectCode,
            subjectName: sub.subjectName,
          };
          const dup = add(paper);
          if (dup && !dup.filePath.startsWith('http')) dup.filePath = publicUrl;
        });
      } catch (e) {
        console.warn('Supabase storage files sync fallback:', e);
      }

      this.papers = deduplicateQuestionPapers(Array.from(papers.values()));
      this.commit();
    } catch (err) {
      console.warn('Supabase sync overall fallback:', err);
    }
  }

  /* ── question papers ── */

  async getQuestionPapers(filters?: Partial<FilterState>): Promise<QuestionPaper[]> {
    await this.syncWithSupabase();
    this.hydrate();
    return filters ? filterQuestionPapers(this.papers, filters) : [...this.papers];
  }

  async getQuestionPaperById(id: string): Promise<QuestionPaper | null> {
    await this.syncWithSupabase();
    this.hydrate();
    return this.papers.find((p) => p.id === id) || null;
  }

  async addQuestionPaper(paper: Omit<QuestionPaper, 'id' | 'uploadedAt' | 'downloadCount'>): Promise<QuestionPaper> {
    const filePath = resolvePdfUrl(paper.filePath);
    const sub = this.subjects.find((s) => s.id === paper.subjectId);
    const subjectCode = sub?.subjectCode || paper.subjectCode;
    const subjectName = sub?.subjectName || paper.subjectName;

    const targetKey = this.compKey({ ...paper, subjectCode });
    const idx = this.papers.findIndex((p) => this.compKey(p) === targetKey);
    const existing = idx === -1 ? undefined : this.papers[idx];

    const finalPaper: QuestionPaper = {
      downloadCount: 0,
      ...existing,
      ...paper,
      filePath,
      id: existing?.id ?? `paper-${uid()}`,
      uploadedAt: new Date().toISOString(),
      subjectCode,
      subjectName,
    };
    if (existing) this.papers[idx] = finalPaper;
    else this.papers.unshift(finalPaper);
    this.papers = deduplicateQuestionPapers(this.papers);

    // Un-tombstone on re-upload
    [...getStorageKeysForPaper(finalPaper), finalPaper.filePath, finalPaper.fileName].forEach((k) => k && this.deletedKeys.delete(k));
    this.saveDeleted();

    if (isSupabaseConfigured() && supabase) {
      try {
        const payload: Record<string, unknown> = {
          department_id: finalPaper.departmentId,
          subject_id: finalPaper.subjectId,
          academic_year_id: finalPaper.academicYearId,
          semester_id: finalPaper.semesterId,
          examination_year: finalPaper.examinationYear,
          examination_type: finalPaper.examinationType,
          file_path: filePath,
          file_name: finalPaper.fileName,
          file_size_bytes: finalPaper.fileSizeBytes,
          page_count: finalPaper.pageCount,
          description: finalPaper.description,
          uploaded_at: finalPaper.uploadedAt,
        };

        const { data: found, error: findErr } = await supabase
          .from('question_papers')
          .select('id')
          .eq('department_id', finalPaper.departmentId)
          .eq('semester_id', finalPaper.semesterId)
          .eq('subject_id', finalPaper.subjectId)
          .eq('examination_year', finalPaper.examinationYear)
          .eq('examination_type', finalPaper.examinationType)
          .limit(1);
        if (findErr) console.warn('Supabase paper lookup:', findErr.message);

        if (found?.length) {
          finalPaper.id = found[0].id;
          await remote('update paper', (db) => db.from('question_papers').update(payload).eq('id', finalPaper.id));
        } else {
          if (UUID.test(finalPaper.id)) payload.id = finalPaper.id;
          const { data: inserted, error } = await supabase.from('question_papers').insert(payload).select().single();
          if (inserted?.id) finalPaper.id = inserted.id;
          if (error) console.warn('Supabase add question paper:', error.message);
        }

        // Propagate the DB-assigned id to the in-memory record
        const i = this.papers.findIndex((p) => p === finalPaper || this.compKey(p) === targetKey);
        if (i !== -1) this.papers[i].id = finalPaper.id;
      } catch (err) {
        console.warn('Supabase add question paper fallback:', err);
      }
    }

    this.papers = deduplicateQuestionPapers(this.papers);
    this.commit();
    return finalPaper;
  }

  async updateQuestionPaper(id: string, updates: Partial<QuestionPaper>): Promise<QuestionPaper> {
    const i = this.papers.findIndex((p) => p.id === id);
    if (i === -1) throw new Error('Paper not found');

    const updated = { ...this.papers[i], ...updates };
    if (updates.filePath) updated.filePath = resolvePdfUrl(updates.filePath);

    const payload: Record<string, unknown> = {
      examination_year: updated.examinationYear,
      examination_type: updated.examinationType,
      description: updated.description,
    };
    if (updates.filePath) payload.file_path = updated.filePath;
    if (updates.fileName) payload.file_name = updated.fileName;
    if (updates.fileSizeBytes) payload.file_size_bytes = updated.fileSizeBytes;
    await remote('update paper', (db) => db.from('question_papers').update(payload).eq('id', id));

    this.papers[i] = updated;
    this.commit();
    return updated;
  }

  async deleteQuestionPaper(id: string): Promise<boolean> {
    const target = this.papers.find((p) => p.id === id) ?? this.papers.find((p) => p.fileName === id || p.filePath?.includes(id));
    if (!id || !target) {
      console.warn('Target question paper not found for deletion with id:', id);
      return false;
    }

    const keys = getStorageKeysForPaper(target);

    // 1. Storage first — abort (and keep the DB row) if it fails
    if (isSupabaseConfigured() && supabase && keys.length) {
      const { error } = await supabase.storage.from(BUCKET).remove(keys);
      if (error) throw new Error(`Storage deletion failed: ${error.message}`);
    }

    // 2. DB rows, always scoped to this paper's department AND subject
    const matches: [string, string][] = [];
    if (UUID.test(target.id)) matches.push(['id', target.id]);
    if (target.filePath) matches.push(['file_path', target.filePath]);
    if (target.fileName) matches.push(['file_name', target.fileName]);
    for (const [col, val] of matches) {
      await remote(`delete paper by ${col}`, (db) =>
        db.from('question_papers').delete().eq(col, val).eq('department_id', target.departmentId).eq('subject_id', target.subjectId));
    }

    // 3. Tombstone so sync can't resurrect it
    [...keys, target.filePath, target.fileName, target.id].forEach((k) => k && this.deletedKeys.add(k));
    this.saveDeleted();

    // 4. Local state
    this.papers = this.papers.filter((p) =>
      p.id !== id && p.id !== target.id &&
      !(p.departmentId === target.departmentId && (p.filePath === target.filePath || p.fileName === target.fileName)));
    this.commit();
    return true;
  }

  incrementDownloadCount(id: string): void {
    const paper = this.papers.find((p) => p.id === id);
    if (!paper) return;
    paper.downloadCount += 1;
    this.save();
    if (UUID.test(id)) {
      // Fire-and-forget; an atomic SQL increment (RPC) would be safer under concurrent downloads.
      void remote('download count', (db) => db.from('question_papers').update({ download_count: paper.downloadCount }).eq('id', id));
    }
  }

  /* ── statistics / reset ── */

  async getStatistics(): Promise<SystemStatistics> {
    return calculateStatistics(this.departments, this.subjects, this.papers);
  }

  resetToSampleData(): void {
    this.departments = [...INITIAL_DEPARTMENTS];
    this.subjects = [...INITIAL_SUBJECTS];
    this.papers = [...INITIAL_PAPERS];
    this.commit();
  }
}

export const dataStore = new DataStore();