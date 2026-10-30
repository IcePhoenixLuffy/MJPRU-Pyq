import { Department, AcademicYear, Semester, Subject, QuestionPaper, FilterState, SystemStatistics } from '../types';
import { filterQuestionPapers, calculateStatistics, slugify } from '../utils/helpers';
import { supabase, isSupabaseConfigured } from './supabase';

export const INITIAL_ACADEMIC_YEARS: AcademicYear[] = [
  { id: 'year-1', name: '1st Year', yearNumber: 1 },
  { id: 'year-2', name: '2nd Year', yearNumber: 2 },
  { id: 'year-3', name: '3rd Year', yearNumber: 3 },
  { id: 'year-4', name: '4th Year', yearNumber: 4 },
];

export const INITIAL_SEMESTERS: Semester[] = [
  { id: 'sem-1', semesterNumber: 1, academicYearId: 'year-1', name: 'Semester 1' },
  { id: 'sem-2', semesterNumber: 2, academicYearId: 'year-1', name: 'Semester 2' },
  { id: 'sem-3', semesterNumber: 3, academicYearId: 'year-2', name: 'Semester 3' },
  { id: 'sem-4', semesterNumber: 4, academicYearId: 'year-2', name: 'Semester 4' },
  { id: 'sem-5', semesterNumber: 5, academicYearId: 'year-3', name: 'Semester 5' },
  { id: 'sem-6', semesterNumber: 6, academicYearId: 'year-3', name: 'Semester 6' },
  { id: 'sem-7', semesterNumber: 7, academicYearId: 'year-4', name: 'Semester 7' },
  { id: 'sem-8', semesterNumber: 8, academicYearId: 'year-4', name: 'Semester 8' },
];

export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'dept-csit',
    name: 'Computer Science & Information Technology',
    slug: 'computer-science-and-information-technology',
    code: 'CSIT',
    description: 'Foundations of computing, software engineering, databases, algorithms, and networked systems.',
    iconName: 'Laptop',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'dept-csai',
    name: 'Computer Science and Artificial Intelligence',
    slug: 'computer-science-and-artificial-intelligence',
    code: 'CSAI',
    description: 'Advanced machine learning, neural networks, natural language processing, and robotic vision.',
    iconName: 'Brain',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'dept-ece',
    name: 'Electronics & Communication Engineering',
    slug: 'electronics-and-communication-engineering',
    code: 'ECE',
    description: 'Signal processing, semiconductor devices, wireless communication, and embedded hardware.',
    iconName: 'Radio',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'dept-ee',
    name: 'Electrical Engineering',
    slug: 'electrical-engineering',
    code: 'EE',
    description: 'Power generation, high voltage grids, control systems, machines, and renewable energy.',
    iconName: 'Zap',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'dept-me',
    name: 'Mechanical Engineering',
    slug: 'mechanical-engineering',
    code: 'ME',
    description: 'Thermodynamics, fluid mechanics, CAD/CAM manufacturing, robotics, and machine design.',
    iconName: 'Cog',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'dept-ce',
    name: 'Chemical Engineering',
    slug: 'chemical-engineering',
    code: 'CHE',
    description: 'Reaction engineering, transport phenomena, refinery processes, and polymer chemistry.',
    iconName: 'FlaskConical',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'dept-eie',
    name: 'Electronics & Instrumentation Engineering',
    slug: 'electronics-and-instrumentation-engineering',
    code: 'EIE',
    description: 'Process instrumentation, sensors & transducers, biomedical systems, and PLC automation.',
    iconName: 'Gauge',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
];

export const INITIAL_SUBJECTS: Subject[] = [
  // CSIT Subjects
  { id: 'sub-cs-1', departmentId: 'dept-csit', semesterId: 'sem-1', subjectName: 'Engineering Mathematics-I', subjectCode: 'BAS-103', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-cs-2', departmentId: 'dept-csit', semesterId: 'sem-1', subjectName: 'Programming for Problem Solving (C)', subjectCode: 'BCS-101', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-cs-3', departmentId: 'dept-csit', semesterId: 'sem-3', subjectName: 'Data Structures using C', subjectCode: 'BCS-301', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-cs-4', departmentId: 'dept-csit', semesterId: 'sem-3', subjectName: 'Discrete Structures & Graph Theory', subjectCode: 'BCS-303', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-cs-5', departmentId: 'dept-csit', semesterId: 'sem-4', subjectName: 'Operating Systems', subjectCode: 'BCS-401', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-cs-6', departmentId: 'dept-csit', semesterId: 'sem-5', subjectName: 'Database Management Systems', subjectCode: 'BCS-501', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-cs-7', departmentId: 'dept-csit', semesterId: 'sem-6', subjectName: 'Computer Networks', subjectCode: 'BCS-602', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-cs-8', departmentId: 'dept-csit', semesterId: 'sem-7', subjectName: 'Cloud Computing & Distributed Systems', subjectCode: 'BCS-701', credits: 3, createdAt: '2024-01-01' },

  // CSAI Subjects
  { id: 'sub-ai-1', departmentId: 'dept-csai', semesterId: 'sem-3', subjectName: 'Python for Data Science & AI', subjectCode: 'BAI-301', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ai-2', departmentId: 'dept-csai', semesterId: 'sem-4', subjectName: 'Artificial Intelligence Foundations', subjectCode: 'BAI-401', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ai-3', departmentId: 'dept-csai', semesterId: 'sem-5', subjectName: 'Machine Learning Algorithms', subjectCode: 'BAI-501', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ai-4', departmentId: 'dept-csai', semesterId: 'sem-6', subjectName: 'Deep Learning & Neural Networks', subjectCode: 'BAI-601', credits: 4, createdAt: '2024-01-01' },

  // ECE Subjects
  { id: 'sub-ec-1', departmentId: 'dept-ece', semesterId: 'sem-3', subjectName: 'Electronic Devices & Circuits', subjectCode: 'BEC-301', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ec-2', departmentId: 'dept-ece', semesterId: 'sem-4', subjectName: 'Digital System Design & VHDL', subjectCode: 'BEC-402', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ec-3', departmentId: 'dept-ece', semesterId: 'sem-5', subjectName: 'Microprocessors & Microcontrollers', subjectCode: 'BEC-501', credits: 4, createdAt: '2024-01-01' },

  // EE Subjects (Official M.J.P. Rohilkhand University Course Scheme)
  // Semester 1 (Theory Courses)
  { id: 'sub-ee-sem1-1', departmentId: 'dept-ee', semesterId: 'sem-1', subjectName: 'Engineering Physics-I', subjectCode: 'PH-101T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ee-sem1-2', departmentId: 'dept-ee', semesterId: 'sem-1', subjectName: 'Engineering Chemistry', subjectCode: 'CY-101T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ee-sem1-3', departmentId: 'dept-ee', semesterId: 'sem-1', subjectName: 'Engineering Mathematics-I', subjectCode: 'MA-101T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ee-sem1-4', departmentId: 'dept-ee', semesterId: 'sem-1', subjectName: 'Communicative English', subjectCode: 'HU-101T', category: 'Theory', credits: 3, createdAt: '2024-01-01' },
  { id: 'sub-ee-sem1-5', departmentId: 'dept-ee', semesterId: 'sem-1', subjectName: 'Computer Fundamentals & Programming', subjectCode: 'CS-101T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ee-sem1-6', departmentId: 'dept-ee', semesterId: 'sem-1', subjectName: 'Circuit Theory', subjectCode: 'EE-103N', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ee-sem1-7', departmentId: 'dept-ee', semesterId: 'sem-1', subjectName: 'Manufacturing Techniques', subjectCode: 'ME-101T', category: 'Theory', credits: 3, createdAt: '2024-01-01' },

  // Semester 2 (Theory Courses)
  { id: 'sub-ee-sem2-1', departmentId: 'dept-ee', semesterId: 'sem-2', subjectName: 'Engineering Physics-II', subjectCode: 'PH-102T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ee-sem2-2', departmentId: 'dept-ee', semesterId: 'sem-2', subjectName: 'Engineering Mathematics-II', subjectCode: 'MA-102T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ee-sem2-3', departmentId: 'dept-ee', semesterId: 'sem-2', subjectName: 'Engineering Graphics', subjectCode: 'ME-107T', category: 'Theory', credits: 3, createdAt: '2024-01-01' },
  { id: 'sub-ee-sem2-4', departmentId: 'dept-ee', semesterId: 'sem-2', subjectName: 'Basic Electronics Engineering', subjectCode: 'EL-102T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ee-sem2-5', departmentId: 'dept-ee', semesterId: 'sem-2', subjectName: 'Environments Studies', subjectCode: 'CY-103T', category: 'Theory', credits: 3, createdAt: '2024-01-01' },
  { id: 'sub-ee-sem2-6', departmentId: 'dept-ee', semesterId: 'sem-2', subjectName: 'Fundamentals of Economics', subjectCode: 'HU-103T', category: 'Theory', credits: 3, createdAt: '2024-01-01' },
  { id: 'sub-ee-sem2-7', departmentId: 'dept-ee', semesterId: 'sem-2', subjectName: 'Basic Mechanical Engineering', subjectCode: 'ME-105T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },

  // Semester 3 (Theory Courses)
  { id: 'sub-ee-sem3-1', departmentId: 'dept-ee', semesterId: 'sem-3', subjectName: 'Engineering Mathematics-III', subjectCode: 'MA-201T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ee-sem3-2', departmentId: 'dept-ee', semesterId: 'sem-3', subjectName: 'Analog Electronics', subjectCode: 'EL-201T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ee-sem3-3', departmentId: 'dept-ee', semesterId: 'sem-3', subjectName: 'Network Analysis & Synthesis', subjectCode: 'EE-201N', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ee-sem3-4', departmentId: 'dept-ee', semesterId: 'sem-3', subjectName: 'Electrical Machines-I', subjectCode: 'EE-203N', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ee-sem3-5', departmentId: 'dept-ee', semesterId: 'sem-3', subjectName: 'Electrical Measurement and Instrumentation', subjectCode: 'EE-205N', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ee-sem3-6', departmentId: 'dept-ee', semesterId: 'sem-3', subjectName: 'Electrical Engineering Materials', subjectCode: 'EE-207N', category: 'Theory', credits: 4, createdAt: '2024-01-01' },

  // Semester 4 (Theory Courses)
  { id: 'sub-ee-sem4-1', departmentId: 'dept-ee', semesterId: 'sem-4', subjectName: 'Linear Integrated Circuits', subjectCode: 'EL-202T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ee-sem4-2', departmentId: 'dept-ee', semesterId: 'sem-4', subjectName: 'Digital Electronics', subjectCode: 'EC-204T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ee-sem4-3', departmentId: 'dept-ee', semesterId: 'sem-4', subjectName: 'Computer Organization', subjectCode: 'CS-204T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ee-sem4-4', departmentId: 'dept-ee', semesterId: 'sem-4', subjectName: 'Electrical Machines-II', subjectCode: 'EE-204N', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ee-sem4-5', departmentId: 'dept-ee', semesterId: 'sem-4', subjectName: 'Power System-I', subjectCode: 'EE-206N', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ee-sem4-6', departmentId: 'dept-ee', semesterId: 'sem-4', subjectName: 'Electromagnetic Field Theory', subjectCode: 'EE-208N', category: 'Theory', credits: 4, createdAt: '2024-01-01' },

  // Semester 5 (Theory Courses & Department Elective-I)
  { id: 'sub-ee-sem5-1', departmentId: 'dept-ee', semesterId: 'sem-5', subjectName: 'Control System', subjectCode: 'EE-301N', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ee-sem5-2', departmentId: 'dept-ee', semesterId: 'sem-5', subjectName: 'Power Electronics', subjectCode: 'EE-303N', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ee-sem5-3', departmentId: 'dept-ee', semesterId: 'sem-5', subjectName: 'Power System-II', subjectCode: 'EE-305N', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ee-sem5-4', departmentId: 'dept-ee', semesterId: 'sem-5', subjectName: 'Microprocessor & their applications', subjectCode: 'EL-301T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ee-sem5-5', departmentId: 'dept-ee', semesterId: 'sem-5', subjectName: 'Signal & System', subjectCode: 'EC-202T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  // Department Elective-I Options:
  { id: 'sub-ee-sem5-el1', departmentId: 'dept-ee', semesterId: 'sem-5', subjectName: 'Introduction to Electrical Vehicles', subjectCode: 'EE-307N', category: 'Elective', electiveGroup: 'Department Elective-I', credits: 3, createdAt: '2024-01-01' },
  { id: 'sub-ee-sem5-el2', departmentId: 'dept-ee', semesterId: 'sem-5', subjectName: 'Energy Efficiency & Conservation', subjectCode: 'EE-309N', category: 'Elective', electiveGroup: 'Department Elective-I', credits: 3, createdAt: '2024-01-01' },
  { id: 'sub-ee-sem5-el3', departmentId: 'dept-ee', semesterId: 'sem-5', subjectName: 'Internet of Things', subjectCode: 'EE-311N', category: 'Elective', electiveGroup: 'Department Elective-I', credits: 3, createdAt: '2024-01-01' },
  { id: 'sub-ee-sem5-el4', departmentId: 'dept-ee', semesterId: 'sem-5', subjectName: 'MOOC Course', subjectCode: 'EE-313N', category: 'Elective', electiveGroup: 'Department Elective-I', credits: 3, createdAt: '2024-01-01' },

  // Semester 6 (Theory Courses & Department Elective-II)
  { id: 'sub-ee-sem6-1', departmentId: 'dept-ee', semesterId: 'sem-6', subjectName: 'Power Plant Engineering', subjectCode: 'EE-304N', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ee-sem6-2', departmentId: 'dept-ee', semesterId: 'sem-6', subjectName: 'Computer Simulation of Power System', subjectCode: 'EE-306N', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ee-sem6-3', departmentId: 'dept-ee', semesterId: 'sem-6', subjectName: 'Advanced Control System', subjectCode: 'EE-308N', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ee-sem6-4', departmentId: 'dept-ee', semesterId: 'sem-6', subjectName: 'Special Purpose Machines', subjectCode: 'EE-310N', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ee-sem6-5', departmentId: 'dept-ee', semesterId: 'sem-6', subjectName: 'Elements of Communication Engg.', subjectCode: 'EC-312T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  // Department Elective-II Options:
  { id: 'sub-ee-sem6-el1', departmentId: 'dept-ee', semesterId: 'sem-6', subjectName: 'SCADA & Energy Management', subjectCode: 'EE-314N', category: 'Elective', electiveGroup: 'Department Elective-II', credits: 3, createdAt: '2024-01-01' },
  { id: 'sub-ee-sem6-el2', departmentId: 'dept-ee', semesterId: 'sem-6', subjectName: 'Robotics and Automation', subjectCode: 'EE-316N', category: 'Elective', electiveGroup: 'Department Elective-II', credits: 3, createdAt: '2024-01-01' },
  { id: 'sub-ee-sem6-el3', departmentId: 'dept-ee', semesterId: 'sem-6', subjectName: 'FACTSs and Devices', subjectCode: 'EE-318N', category: 'Elective', electiveGroup: 'Department Elective-II', credits: 3, createdAt: '2024-01-01' },
  { id: 'sub-ee-sem6-el4', departmentId: 'dept-ee', semesterId: 'sem-6', subjectName: 'MOOC Course', subjectCode: 'EE-320N', category: 'Elective', electiveGroup: 'Department Elective-II', credits: 3, createdAt: '2024-01-01' },

  // Semester 7 (Theory Courses, Department Elective-III & Open Elective)
  { id: 'sub-ee-sem7-1', departmentId: 'dept-ee', semesterId: 'sem-7', subjectName: 'Protection & Switchgear', subjectCode: 'EE-401N', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ee-sem7-2', departmentId: 'dept-ee', semesterId: 'sem-7', subjectName: 'Electric Drives & Control', subjectCode: 'EE-402N', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ee-sem7-3', departmentId: 'dept-ee', semesterId: 'sem-7', subjectName: 'Industrial Training', subjectCode: 'EE-405T', category: 'Training', credits: 2, createdAt: '2024-01-01' },
  { id: 'sub-ee-sem7-4', departmentId: 'dept-ee', semesterId: 'sem-7', subjectName: 'Seminar', subjectCode: 'EE-407T', category: 'Seminar', credits: 2, createdAt: '2024-01-01' },
  { id: 'sub-ee-sem7-el3', departmentId: 'dept-ee', semesterId: 'sem-7', subjectName: 'Department Elective-III', subjectCode: 'Department Elective-III', category: 'Elective', electiveGroup: 'Department Elective-III', note: 'Elective course options determined per academic session guidelines', credits: 3, createdAt: '2024-01-01' },
  { id: 'sub-ee-sem7-oe', departmentId: 'dept-ee', semesterId: 'sem-7', subjectName: 'Open Elective', subjectCode: 'Open Elective', category: 'Elective', electiveGroup: 'Open Elective', note: 'Interdisciplinary open elective course offered across university departments', credits: 3, createdAt: '2024-01-01' },

  // Semester 8 (Theory / Project / Practical Components)
  { id: 'sub-ee-sem8-1', departmentId: 'dept-ee', semesterId: 'sem-8', subjectName: 'Major Project', subjectCode: 'EE-410P', category: 'Project', credits: 8, createdAt: '2024-01-01' },
  { id: 'sub-ee-sem8-2', departmentId: 'dept-ee', semesterId: 'sem-8', subjectName: 'Internship', subjectCode: 'EE-412P', category: 'Practical', note: 'Internship / Practical component (Option with MOOC-I EE-420N)', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ee-sem8-3', departmentId: 'dept-ee', semesterId: 'sem-8', subjectName: 'MOOC-I', subjectCode: 'EE-420N', category: 'Elective', note: 'MOOC-I online course component (Option with Internship EE-412P)', credits: 4, createdAt: '2024-01-01' },

  // ME Subjects
  { id: 'sub-me-1', departmentId: 'dept-me', semesterId: 'sem-3', subjectName: 'Engineering Thermodynamics', subjectCode: 'BME-301', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-2', departmentId: 'dept-me', semesterId: 'sem-4', subjectName: 'Fluid Mechanics & Machinery', subjectCode: 'BME-401', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-3', departmentId: 'dept-me', semesterId: 'sem-5', subjectName: 'Heat & Mass Transfer', subjectCode: 'BME-502', credits: 4, createdAt: '2024-01-01' },

  // CHE Subjects
  { id: 'sub-che-1', departmentId: 'dept-ce', semesterId: 'sem-3', subjectName: 'Fluid Flow & Particle Mechanics', subjectCode: 'BCH-301', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-che-2', departmentId: 'dept-ce', semesterId: 'sem-4', subjectName: 'Chemical Engineering Thermodynamics', subjectCode: 'BCH-401', credits: 4, createdAt: '2024-01-01' },

  // EIE Subjects
  { id: 'sub-eie-1', departmentId: 'dept-eie', semesterId: 'sem-3', subjectName: 'Transducers & Sensors Engineering', subjectCode: 'BEI-301', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-eie-2', departmentId: 'dept-eie', semesterId: 'sem-4', subjectName: 'Control Systems Engineering', subjectCode: 'BEI-401', credits: 4, createdAt: '2024-01-01' },
];

export const INITIAL_PAPERS: QuestionPaper[] = [
  {
    id: 'paper-1',
    departmentId: 'dept-csit',
    subjectId: 'sub-cs-3',
    academicYearId: 'year-2',
    semesterId: 'sem-3',
    examinationYear: 2024,
    examinationType: 'Regular',
    filePath: '/papers/mjpru_bcs301_2024.pdf',
    fileName: 'MJPRU_BCS301_DataStructures_2024.pdf',
    fileSizeBytes: 245000,
    pageCount: 2,
    description: 'End Semester Regular Examination 2024 with AVL Trees, Graphs, and B-Trees questions.',
    uploadedAt: '2024-10-15T09:30:00.000Z',
    downloadCount: 342,
  },
  {
    id: 'paper-2',
    departmentId: 'dept-csit',
    subjectId: 'sub-cs-5',
    academicYearId: 'year-2',
    semesterId: 'sem-4',
    examinationYear: 2023,
    examinationType: 'Regular',
    filePath: '/papers/mjpru_bcs401_2023.pdf',
    fileName: 'MJPRU_BCS401_OperatingSystems_2023.pdf',
    fileSizeBytes: 210000,
    pageCount: 2,
    description: 'Semester 4 Official Paper covering Process Scheduling, Deadlock Avoidance, and Paging.',
    uploadedAt: '2024-09-20T11:00:00.000Z',
    downloadCount: 289,
  },
  {
    id: 'paper-3',
    departmentId: 'dept-csit',
    subjectId: 'sub-cs-6',
    academicYearId: 'year-3',
    semesterId: 'sem-5',
    examinationYear: 2024,
    examinationType: 'Regular',
    filePath: '/papers/mjpru_bcs501_2024.pdf',
    fileName: 'MJPRU_BCS501_DBMS_2024.pdf',
    fileSizeBytes: 198000,
    pageCount: 2,
    description: 'Normalization (BCNF, 4NF), Relational Algebra queries, and ACID recovery protocols.',
    uploadedAt: '2024-10-02T14:15:00.000Z',
    downloadCount: 412,
  },
  {
    id: 'paper-4',
    departmentId: 'dept-csai',
    subjectId: 'sub-ai-2',
    academicYearId: 'year-2',
    semesterId: 'sem-4',
    examinationYear: 2024,
    examinationType: 'Regular',
    filePath: '/papers/mjpru_bai401_2024.pdf',
    fileName: 'MJPRU_BAI401_AI_Foundations_2024.pdf',
    fileSizeBytes: 280000,
    pageCount: 2,
    description: 'Heuristic Search (A*, AO*), First-Order Logic resolution, and Expert System inference.',
    uploadedAt: '2024-10-18T10:00:00.000Z',
    downloadCount: 310,
  },
  {
    id: 'paper-5',
    departmentId: 'dept-csai',
    subjectId: 'sub-ai-3',
    academicYearId: 'year-3',
    semesterId: 'sem-5',
    examinationYear: 2023,
    examinationType: 'Back Paper',
    filePath: '/papers/mjpru_bai501_2023_back.pdf',
    fileName: 'MJPRU_BAI501_MachineLearning_2023_BP.pdf',
    fileSizeBytes: 312000,
    pageCount: 2,
    description: 'Back Paper examination for SVM, Random Forests, Gradient Descent convergence, and Clustering.',
    uploadedAt: '2024-08-11T16:20:00.000Z',
    downloadCount: 167,
  },
  {
    id: 'paper-6',
    departmentId: 'dept-ece',
    subjectId: 'sub-ec-1',
    academicYearId: 'year-2',
    semesterId: 'sem-3',
    examinationYear: 2023,
    examinationType: 'Regular',
    filePath: '/papers/mjpru_bec301_2023.pdf',
    fileName: 'MJPRU_BEC301_EDC_2023.pdf',
    fileSizeBytes: 265000,
    pageCount: 2,
    description: 'PN junction diode breakdown, BJT hybrid parameters, and MOSFET amplifier characteristics.',
    uploadedAt: '2024-07-04T12:00:00.000Z',
    downloadCount: 195,
  },
  {
    id: 'paper-7',
    departmentId: 'dept-ee',
    subjectId: 'sub-ee-sem3-3',
    academicYearId: 'year-2',
    semesterId: 'sem-3',
    examinationYear: 2024,
    examinationType: 'Regular',
    filePath: '/papers/mjpru_ee201n_2024.pdf',
    fileName: 'MJPRU_EE201N_NetworkAnalysis_2024.pdf',
    fileSizeBytes: 220000,
    pageCount: 2,
    description: 'Thevenin, Norton, Superposition theorems, Laplace transforms in two-port network synthesis.',
    uploadedAt: '2024-09-30T08:45:00.000Z',
    downloadCount: 230,
  },
  {
    id: 'paper-8',
    departmentId: 'dept-me',
    subjectId: 'sub-me-1',
    academicYearId: 'year-2',
    semesterId: 'sem-3',
    examinationYear: 2024,
    examinationType: 'Regular',
    filePath: '/papers/mjpru_bme301_2024.pdf',
    fileName: 'MJPRU_BME301_Thermodynamics_2024.pdf',
    fileSizeBytes: 275000,
    pageCount: 2,
    description: 'First & Second Laws, Carnot & Rankine Cycles, Entropy generation, and Exergy analysis.',
    uploadedAt: '2024-10-22T13:10:00.000Z',
    downloadCount: 278,
  },
  {
    id: 'paper-9',
    departmentId: 'dept-ce',
    subjectId: 'sub-che-1',
    academicYearId: 'year-2',
    semesterId: 'sem-3',
    examinationYear: 2023,
    examinationType: 'Regular',
    filePath: '/papers/mjpru_bch301_2023.pdf',
    fileName: 'MJPRU_BCH301_FluidFlow_2023.pdf',
    fileSizeBytes: 235000,
    pageCount: 2,
    description: 'Bernoulli equation, Navier-Stokes, Boundary layer thickness, and packed bed pressure drops.',
    uploadedAt: '2024-06-19T10:30:00.000Z',
    downloadCount: 140,
  },
  {
    id: 'paper-10',
    departmentId: 'dept-eie',
    subjectId: 'sub-eie-2',
    academicYearId: 'year-2',
    semesterId: 'sem-4',
    examinationYear: 2024,
    examinationType: 'Regular',
    filePath: '/papers/mjpru_bei401_2024.pdf',
    fileName: 'MJPRU_BEI401_ControlSystems_2024.pdf',
    fileSizeBytes: 245000,
    pageCount: 2,
    description: 'Root Locus techniques, Bode plots, Phase & Gain Margins, and state transition matrices.',
    uploadedAt: '2024-10-25T15:00:00.000Z',
    downloadCount: 184,
  },
];

const LOCAL_STORAGE_KEY = 'mjpru_pyq_platform_data_v3';

interface StoredData {
  departments: Department[];
  subjects: Subject[];
  papers: QuestionPaper[];
}

export class DataStore {
  private departments: Department[] = [];
  private subjects: Subject[] = [];
  private papers: QuestionPaper[] = [];
  private academicYears: AcademicYear[] = INITIAL_ACADEMIC_YEARS;
  private semesters: Semester[] = INITIAL_SEMESTERS;
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (this.isInitialized) return;

    try {
      // Check v3 or migrate from v2
      let stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!stored) {
        stored = localStorage.getItem('mjpru_pyq_platform_data_v2');
      }

      if (stored) {
        const parsed: StoredData = JSON.parse(stored);
        this.departments = parsed.departments || INITIAL_DEPARTMENTS;
        
        // Ensure Electrical Engineering has the complete official scheme
        const nonEeSubjects = (parsed.subjects || []).filter((s) => s.departmentId !== 'dept-ee');
        const eeOfficialSubjects = INITIAL_SUBJECTS.filter((s) => s.departmentId === 'dept-ee');
        this.subjects = [...nonEeSubjects, ...eeOfficialSubjects];

        // Migrate any papers that referenced the old EE placeholder subject id
        this.papers = (parsed.papers || INITIAL_PAPERS).map((p) => {
          if (p.subjectId === 'sub-ee-1' || p.subjectId === 'sub-ee-3') {
            return {
              ...p,
              subjectId: 'sub-ee-sem3-3',
              subjectCode: 'EE-201N',
              subjectName: 'Network Analysis & Synthesis',
            };
          }
          return p;
        });

        this.saveToStorage();
      } else {
        this.departments = [...INITIAL_DEPARTMENTS];
        this.subjects = [...INITIAL_SUBJECTS];
        this.papers = [...INITIAL_PAPERS];
        this.saveToStorage();
      }
    } catch {
      this.departments = [...INITIAL_DEPARTMENTS];
      this.subjects = [...INITIAL_SUBJECTS];
      this.papers = [...INITIAL_PAPERS];
    }

    this.isInitialized = true;
    this.hydratePaperMetadata();
  }

  private saveToStorage() {
    try {
      const data: StoredData = {
        departments: this.departments,
        subjects: this.subjects,
        papers: this.papers,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
  }

  private hydratePaperMetadata() {
    const deptMap = new Map(this.departments.map((d) => [d.id, d]));
    const subMap = new Map(this.subjects.map((s) => [s.id, s]));
    const semMap = new Map(this.semesters.map((s) => [s.id, s]));
    const yearMap = new Map(this.academicYears.map((y) => [y.id, y]));

    this.papers.forEach((p) => {
      const dept = deptMap.get(p.departmentId);
      const sub = subMap.get(p.subjectId);
      const sem = semMap.get(p.semesterId);
      const year = yearMap.get(p.academicYearId);

      p.departmentName = dept?.name || 'Department of Technology';
      p.subjectName = sub?.subjectName || 'Engineering Subject';
      p.subjectCode = sub?.subjectCode || 'BT-000';
      p.semesterNumber = sem?.semesterNumber || 1;
      p.academicYearName = year?.name || 'Academic Year';
    });
  }

  // Departments
  async getDepartments(): Promise<Department[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('departments').select('*').order('name');
        if (!error && data && data.length > 0) {
          return data.map((d) => ({
            id: d.id,
            name: d.name,
            slug: d.slug,
            code: d.code,
            description: d.description || '',
            iconName: d.icon_name || 'GraduationCap',
            createdAt: d.created_at,
          }));
        }
      } catch (err) {
        console.warn('Supabase departments fetch fallback:', err);
      }
    }
    return [...this.departments];
  }

  async addDepartment(dept: Omit<Department, 'id' | 'createdAt' | 'slug'>): Promise<Department> {
    const newDept: Department = {
      ...dept,
      id: `dept-${Date.now()}`,
      slug: slugify(dept.name),
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('departments').insert({
          id: newDept.id,
          name: newDept.name,
          slug: newDept.slug,
          code: newDept.code,
          description: newDept.description,
          icon_name: newDept.iconName,
        });
      } catch (err) {
        console.warn('Supabase add department fallback:', err);
      }
    }

    this.departments.push(newDept);
    this.saveToStorage();
    this.hydratePaperMetadata();
    return newDept;
  }

  async updateDepartment(id: string, updates: Partial<Department>): Promise<Department> {
    const index = this.departments.findIndex((d) => d.id === id);
    if (index === -1) throw new Error('Department not found');

    const updated = {
      ...this.departments[index],
      ...updates,
      slug: updates.name ? slugify(updates.name) : this.departments[index].slug,
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('departments').update({
          name: updated.name,
          slug: updated.slug,
          code: updated.code,
          description: updated.description,
          icon_name: updated.iconName,
        }).eq('id', id);
      } catch (err) {
        console.warn('Supabase update department fallback:', err);
      }
    }

    this.departments[index] = updated;
    this.saveToStorage();
    this.hydratePaperMetadata();
    return updated;
  }

  async deleteDepartment(id: string): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('departments').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete department fallback:', err);
      }
    }

    this.departments = this.departments.filter((d) => d.id !== id);
    // Also remove associated subjects and papers
    this.subjects = this.subjects.filter((s) => s.departmentId !== id);
    this.papers = this.papers.filter((p) => p.departmentId !== id);
    this.saveToStorage();
    return true;
  }

  // Academic Years & Semesters
  getAcademicYears(): AcademicYear[] {
    return [...this.academicYears];
  }

  getSemesters(academicYearId?: string): Semester[] {
    if (academicYearId && academicYearId !== 'all') {
      return this.semesters.filter((s) => s.academicYearId === academicYearId);
    }
    return [...this.semesters];
  }

  // Subjects
  async getSubjects(departmentId?: string, semesterId?: string): Promise<Subject[]> {
    let list = [...this.subjects];
    if (departmentId && departmentId !== 'all') {
      list = list.filter((s) => s.departmentId === departmentId);
    }
    if (semesterId && semesterId !== 'all') {
      list = list.filter((s) => s.semesterId === semesterId);
    }
    return list;
  }

  async addSubject(sub: Omit<Subject, 'id' | 'createdAt'>): Promise<Subject> {
    const newSub: Subject = {
      ...sub,
      id: `sub-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('subjects').insert({
          id: newSub.id,
          department_id: newSub.departmentId,
          semester_id: newSub.semesterId,
          subject_name: newSub.subjectName,
          subject_code: newSub.subjectCode,
          credits: newSub.credits || 4,
          category: newSub.category || 'Theory',
          elective_group: newSub.electiveGroup || null,
          note: newSub.note || null,
        });
      } catch (err) {
        console.warn('Supabase add subject fallback:', err);
      }
    }

    this.subjects.push(newSub);
    this.saveToStorage();
    this.hydratePaperMetadata();
    return newSub;
  }

  async updateSubject(id: string, updates: Partial<Subject>): Promise<Subject> {
    const index = this.subjects.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Subject not found');

    const updated = { ...this.subjects[index], ...updates };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('subjects').update({
          subject_name: updated.subjectName,
          subject_code: updated.subjectCode,
          department_id: updated.departmentId,
          semester_id: updated.semesterId,
          credits: updated.credits,
          category: updated.category,
          elective_group: updated.electiveGroup,
          note: updated.note,
        }).eq('id', id);
      } catch (err) {
        console.warn('Supabase update subject fallback:', err);
      }
    }

    this.subjects[index] = updated;
    this.saveToStorage();
    this.hydratePaperMetadata();
    return updated;
  }

  async deleteSubject(id: string): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('subjects').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete subject fallback:', err);
      }
    }

    this.subjects = this.subjects.filter((s) => s.id !== id);
    this.papers = this.papers.filter((p) => p.subjectId !== id);
    this.saveToStorage();
    return true;
  }

  // Question Papers
  async getQuestionPapers(filters?: Partial<FilterState>): Promise<QuestionPaper[]> {
    this.hydratePaperMetadata();
    if (!filters) return [...this.papers];
    return filterQuestionPapers(this.papers, filters);
  }

  async getQuestionPaperById(id: string): Promise<QuestionPaper | null> {
    this.hydratePaperMetadata();
    return this.papers.find((p) => p.id === id) || null;
  }

  async addQuestionPaper(paper: Omit<QuestionPaper, 'id' | 'uploadedAt' | 'downloadCount'>): Promise<QuestionPaper> {
    const newPaper: QuestionPaper = {
      ...paper,
      id: `paper-${Date.now()}`,
      uploadedAt: new Date().toISOString(),
      downloadCount: 0,
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('question_papers').insert({
          id: newPaper.id,
          department_id: newPaper.departmentId,
          subject_id: newPaper.subjectId,
          academic_year_id: newPaper.academicYearId,
          semester_id: newPaper.semesterId,
          examination_year: newPaper.examinationYear,
          examination_type: newPaper.examinationType,
          file_path: newPaper.filePath,
          file_name: newPaper.fileName,
          file_size_bytes: newPaper.fileSizeBytes,
          page_count: newPaper.pageCount,
          description: newPaper.description,
        });
      } catch (err) {
        console.warn('Supabase add question paper fallback:', err);
      }
    }

    this.papers.unshift(newPaper);
    this.saveToStorage();
    this.hydratePaperMetadata();
    return newPaper;
  }

  async updateQuestionPaper(id: string, updates: Partial<QuestionPaper>): Promise<QuestionPaper> {
    const index = this.papers.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Paper not found');

    const updated = { ...this.papers[index], ...updates };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('question_papers').update({
          examination_year: updated.examinationYear,
          examination_type: updated.examinationType,
          description: updated.description,
        }).eq('id', id);
      } catch (err) {
        console.warn('Supabase update paper fallback:', err);
      }
    }

    this.papers[index] = updated;
    this.saveToStorage();
    this.hydratePaperMetadata();
    return updated;
  }

  async deleteQuestionPaper(id: string): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('question_papers').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete paper fallback:', err);
      }
    }

    this.papers = this.papers.filter((p) => p.id !== id);
    this.saveToStorage();
    return true;
  }

  incrementDownloadCount(id: string): void {
    const paper = this.papers.find((p) => p.id === id);
    if (paper) {
      paper.downloadCount += 1;
      this.saveToStorage();
    }
  }

  // Statistics
  async getStatistics(): Promise<SystemStatistics> {
    return calculateStatistics(this.departments, this.subjects, this.papers);
  }

  // Reset to sample university data
  resetToSampleData(): void {
    this.departments = [...INITIAL_DEPARTMENTS];
    this.subjects = [...INITIAL_SUBJECTS];
    this.papers = [...INITIAL_PAPERS];
    this.saveToStorage();
    this.hydratePaperMetadata();
  }
}

export const dataStore = new DataStore();
