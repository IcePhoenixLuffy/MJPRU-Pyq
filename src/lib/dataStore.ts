import { Department, AcademicYear, Semester, Subject, QuestionPaper, FilterState, SystemStatistics, ExaminationType } from '../types';
import { filterQuestionPapers, calculateStatistics, slugify, getPaperCompositeKey, deduplicateQuestionPapers } from '../utils/helpers';
import { supabase, isSupabaseConfigured } from './supabase';
import { resolvePdfUrl, getStorageKeysForPaper } from '../utils/pdfGenerator';

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
    name: 'Computer Science and Information Technology',
    slug: 'computer-science-and-information-technology',
    code: 'CSIT',
    description: 'Foundations of computing, software systems, algorithms, database architectures, networks, and advanced theoretical computer science.',
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
    code: 'CH',
    description: 'Reaction engineering, transport phenomena, chemical process equipment design, thermodynamics, and polymer technology.',
    iconName: 'FlaskConical',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'dept-eie',
    name: 'Electronics & Instrumentation Engineering',
    slug: 'electronics-and-instrumentation-engineering',
    code: 'EI',
    description: 'Process instrumentation, sensors & transducers, biomedical systems, industrial automation, and control systems.',
    iconName: 'Gauge',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
];

export const INITIAL_SUBJECTS: Subject[] = [
  // CSIT Subjects (Official M.J.P. Rohilkhand University Course Scheme)
  // Semester 1 (Theory Courses)
  { id: 'sub-csit-sem1-1', departmentId: 'dept-csit', semesterId: 'sem-1', subjectName: 'Engineering Physics-I', subjectCode: 'PH-101T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-csit-sem1-2', departmentId: 'dept-csit', semesterId: 'sem-1', subjectName: 'Engineering Chemistry', subjectCode: 'CY-101T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-csit-sem1-3', departmentId: 'dept-csit', semesterId: 'sem-1', subjectName: 'Engineering Mathematics-I', subjectCode: 'MA-101T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-csit-sem1-4', departmentId: 'dept-csit', semesterId: 'sem-1', subjectName: 'Communicative English', subjectCode: 'HU-101T', category: 'Theory', credits: 3, createdAt: '2024-01-01' },
  { id: 'sub-csit-sem1-5', departmentId: 'dept-csit', semesterId: 'sem-1', subjectName: 'Computer Programming and Fundamentals', subjectCode: 'CS-101T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-csit-sem1-6', departmentId: 'dept-csit', semesterId: 'sem-1', subjectName: 'Manufacturing Techniques', subjectCode: 'ME-101T', category: 'Theory', credits: 3, createdAt: '2024-01-01' },
  { id: 'sub-csit-sem1-7', departmentId: 'dept-csit', semesterId: 'sem-1', subjectName: 'Engineering Graphics', subjectCode: 'ME-103T', category: 'Theory', credits: 3, createdAt: '2024-01-01' },

  // Semester 2 (Theory Courses)
  { id: 'sub-csit-sem2-1', departmentId: 'dept-csit', semesterId: 'sem-2', subjectName: 'Basic Electronics Engineering', subjectCode: 'EI-102T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-csit-sem2-2', departmentId: 'dept-csit', semesterId: 'sem-2', subjectName: 'Engineering Mathematics-II', subjectCode: 'MA-102T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-csit-sem2-3', departmentId: 'dept-csit', semesterId: 'sem-2', subjectName: 'Basic Electrical Engineering', subjectCode: 'EE-102T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-csit-sem2-4', departmentId: 'dept-csit', semesterId: 'sem-2', subjectName: 'Engineering Physics-II', subjectCode: 'PH-102T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-csit-sem2-5', departmentId: 'dept-csit', semesterId: 'sem-2', subjectName: 'Environmental Studies: Scientific & Engineering Aspects.', subjectCode: 'CY-102T', category: 'Theory', credits: 3, createdAt: '2024-01-01' },
  { id: 'sub-csit-sem2-6', departmentId: 'dept-csit', semesterId: 'sem-2', subjectName: 'Fundamental of Economics', subjectCode: 'HU-102T', category: 'Theory', credits: 3, createdAt: '2024-01-01' },
  { id: 'sub-csit-sem2-7', departmentId: 'dept-csit', semesterId: 'sem-2', subjectName: 'Basic Mechanical Engineering', subjectCode: 'ME-104T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },

  // Semester 3 (Theory Courses)
  { id: 'sub-csit-sem3-1', departmentId: 'dept-csit', semesterId: 'sem-3', subjectName: 'Data Base Management System', subjectCode: 'CS-201T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-csit-sem3-2', departmentId: 'dept-csit', semesterId: 'sem-3', subjectName: 'Discrete Mathematical Structure', subjectCode: 'CS-203T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-csit-sem3-3', departmentId: 'dept-csit', semesterId: 'sem-3', subjectName: 'Data Structure', subjectCode: 'CS-205T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-csit-sem3-4', departmentId: 'dept-csit', semesterId: 'sem-3', subjectName: 'Object Oriented Programming', subjectCode: 'CS-207T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-csit-sem3-5', departmentId: 'dept-csit', semesterId: 'sem-3', subjectName: 'Engineering Mathematics-III', subjectCode: 'MA-201T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-csit-sem3-6', departmentId: 'dept-csit', semesterId: 'sem-3', subjectName: 'Analog Electronic', subjectCode: 'EI-201T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },

  // Semester 4 (Theory Courses)
  { id: 'sub-csit-sem4-1', departmentId: 'dept-csit', semesterId: 'sem-4', subjectName: 'Analysis & Design of Algorithm', subjectCode: 'CS-202T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-csit-sem4-2', departmentId: 'dept-csit', semesterId: 'sem-4', subjectName: 'Computer Organisation', subjectCode: 'CS-204T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-csit-sem4-3', departmentId: 'dept-csit', semesterId: 'sem-4', subjectName: 'Data Communication', subjectCode: 'CS-206T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-csit-sem4-4', departmentId: 'dept-csit', semesterId: 'sem-4', subjectName: 'Industrial Management', subjectCode: 'ME-212T', category: 'Theory', credits: 3, createdAt: '2024-01-01' },
  { id: 'sub-csit-sem4-5', departmentId: 'dept-csit', semesterId: 'sem-4', subjectName: 'Signal & Systems', subjectCode: 'EC-202T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-csit-sem4-6', departmentId: 'dept-csit', semesterId: 'sem-4', subjectName: 'Digital Electronic', subjectCode: 'EC-204T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },

  // Semester 5 (Theory Courses)
  { id: 'sub-csit-sem5-1', departmentId: 'dept-csit', semesterId: 'sem-5', subjectName: 'Computer Networks', subjectCode: 'CS-301T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-csit-sem5-2', departmentId: 'dept-csit', semesterId: 'sem-5', subjectName: 'Software Engineering', subjectCode: 'CS-303T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-csit-sem5-3', departmentId: 'dept-csit', semesterId: 'sem-5', subjectName: 'Principles of Programming Languages', subjectCode: 'CS-305T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-csit-sem5-4', departmentId: 'dept-csit', semesterId: 'sem-5', subjectName: 'Theory of Computation', subjectCode: 'CS-307T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-csit-sem5-5', departmentId: 'dept-csit', semesterId: 'sem-5', subjectName: 'Operating Systems', subjectCode: 'CS-309T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-csit-sem5-6', departmentId: 'dept-csit', semesterId: 'sem-5', subjectName: 'Microprocessor & Their applications', subjectCode: 'EI-309T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },

  // Semester 6 (Theory Courses)
  { id: 'sub-csit-sem6-1', departmentId: 'dept-csit', semesterId: 'sem-6', subjectName: 'Compiler Design', subjectCode: 'CS-304T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-csit-sem6-2', departmentId: 'dept-csit', semesterId: 'sem-6', subjectName: 'Interactive Computer Graphics', subjectCode: 'CS-306T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-csit-sem6-3', departmentId: 'dept-csit', semesterId: 'sem-6', subjectName: 'Distributed Systems', subjectCode: 'CS-308T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-csit-sem6-4', departmentId: 'dept-csit', semesterId: 'sem-6', subjectName: 'Programming with JAVA', subjectCode: 'CS-310T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-csit-sem6-5', departmentId: 'dept-csit', semesterId: 'sem-6', subjectName: 'Data Mining Techniques', subjectCode: 'CS-312T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-csit-sem6-6', departmentId: 'dept-csit', semesterId: 'sem-6', subjectName: 'Digital Signal Processing', subjectCode: 'EC-302T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },

  // Semester 7 (Theory Courses and Academic Components)
  { id: 'sub-csit-sem7-1', departmentId: 'dept-csit', semesterId: 'sem-7', subjectName: 'Advanced Computer Architecture', subjectCode: 'CS-401T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-csit-sem7-2', departmentId: 'dept-csit', semesterId: 'sem-7', subjectName: 'Modeling & Simulation', subjectCode: 'CS-403T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-csit-sem7-3', departmentId: 'dept-csit', semesterId: 'sem-7', subjectName: 'Seminar', subjectCode: 'CS-405', category: 'Seminar', credits: 2, createdAt: '2024-01-01' },
  { id: 'sub-csit-sem7-4', departmentId: 'dept-csit', semesterId: 'sem-7', subjectName: 'Industrial Training', subjectCode: 'TRN-401', category: 'Training', credits: 2, createdAt: '2024-01-01' },

  // Semester 8 (Theory Course and Major Project)
  { id: 'sub-csit-sem8-1', departmentId: 'dept-csit', semesterId: 'sem-8', subjectName: 'Advanced Computer Networks', subjectCode: 'CS-402T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-csit-sem8-2', departmentId: 'dept-csit', semesterId: 'sem-8', subjectName: 'Major Project Lab', subjectCode: 'CS-406P', category: 'Project', credits: 8, createdAt: '2024-01-01' },

  // CSIT Elective Catalogue (16 Curriculum Electives - Initially Unassigned to specific groups)
  { id: 'sub-csit-elec-1', departmentId: 'dept-csit', semesterId: 'sem-7', subjectName: 'Network Management Systems', subjectCode: 'CS-431T', category: 'Elective', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-csit-elec-2', departmentId: 'dept-csit', semesterId: 'sem-7', subjectName: 'Object Oriented Analysis and Design', subjectCode: 'CS-432T', category: 'Elective', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-csit-elec-3', departmentId: 'dept-csit', semesterId: 'sem-7', subjectName: 'Artificial Neural Networks', subjectCode: 'CS-433T', category: 'Elective', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-csit-elec-4', departmentId: 'dept-csit', semesterId: 'sem-7', subjectName: 'Parallel Computing and Algorithm', subjectCode: 'CS-435T', category: 'Elective', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-csit-elec-5', departmentId: 'dept-csit', semesterId: 'sem-7', subjectName: 'Fault Tolerance Computing', subjectCode: 'CS-438T', category: 'Elective', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-csit-elec-6', departmentId: 'dept-csit', semesterId: 'sem-7', subjectName: 'Artificial Intelligence & Expert System', subjectCode: 'CS-439T', category: 'Elective', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-csit-elec-7', departmentId: 'dept-csit', semesterId: 'sem-7', subjectName: 'Advanced Data Base Management System', subjectCode: 'CS-441T', category: 'Elective', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-csit-elec-8', departmentId: 'dept-csit', semesterId: 'sem-7', subjectName: 'Network Security and Cryptography', subjectCode: 'CS-443T', category: 'Elective', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-csit-elec-9', departmentId: 'dept-csit', semesterId: 'sem-7', subjectName: 'VLSI Design & Circuit', subjectCode: 'EC-403T', category: 'Elective', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-csit-elec-10', departmentId: 'dept-csit', semesterId: 'sem-7', subjectName: 'Stochastic Models for Computer Applications', subjectCode: 'CS-445T', category: 'Elective', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-csit-elec-11', departmentId: 'dept-csit', semesterId: 'sem-7', subjectName: 'Digital Image Processing', subjectCode: 'EE-458T', category: 'Elective', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-csit-elec-12', departmentId: 'dept-csit', semesterId: 'sem-7', subjectName: 'Web Technology', subjectCode: 'CS-447T', category: 'Elective', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-csit-elec-13', departmentId: 'dept-csit', semesterId: 'sem-7', subjectName: 'Distributed database System', subjectCode: 'CS-448T', category: 'Elective', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-csit-elec-14', departmentId: 'dept-csit', semesterId: 'sem-8', subjectName: 'Internet Programming with .net framework', subjectCode: 'CS-450T', category: 'Elective', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-csit-elec-15', departmentId: 'dept-csit', semesterId: 'sem-8', subjectName: 'Wireless network and Mobile Computing', subjectCode: 'CS-451T', category: 'Elective', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-csit-elec-16', departmentId: 'dept-csit', semesterId: 'sem-8', subjectName: 'Real Time System', subjectCode: 'CS-452T', category: 'Elective', credits: 4, createdAt: '2024-01-01' },


  // CSAI Subjects
  { id: 'sub-ai-1', departmentId: 'dept-csai', semesterId: 'sem-3', subjectName: 'Python for Data Science & AI', subjectCode: 'BAI-301', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ai-2', departmentId: 'dept-csai', semesterId: 'sem-4', subjectName: 'Artificial Intelligence Foundations', subjectCode: 'BAI-401', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ai-3', departmentId: 'dept-csai', semesterId: 'sem-5', subjectName: 'Machine Learning Algorithms', subjectCode: 'BAI-501', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ai-4', departmentId: 'dept-csai', semesterId: 'sem-6', subjectName: 'Deep Learning & Neural Networks', subjectCode: 'BAI-601', credits: 4, createdAt: '2024-01-01' },

  // ECE Subjects (Official M.J.P. Rohilkhand University Course Scheme)
  // Semester 1 (Theory Courses)
  { id: 'sub-ece-sem1-1', departmentId: 'dept-ece', semesterId: 'sem-1', subjectName: 'Engineering Physics-I', subjectCode: 'PH-101T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ece-sem1-2', departmentId: 'dept-ece', semesterId: 'sem-1', subjectName: 'Engineering Chemistry', subjectCode: 'CY-101T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ece-sem1-3', departmentId: 'dept-ece', semesterId: 'sem-1', subjectName: 'Engineering Mathematics-I', subjectCode: 'MA-101T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ece-sem1-4', departmentId: 'dept-ece', semesterId: 'sem-1', subjectName: 'Communicative English', subjectCode: 'HU-101T', category: 'Theory', credits: 3, createdAt: '2024-01-01' },
  { id: 'sub-ece-sem1-5', departmentId: 'dept-ece', semesterId: 'sem-1', subjectName: 'Computer Fundamentals & Programming', subjectCode: 'CS-101T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ece-sem1-6', departmentId: 'dept-ece', semesterId: 'sem-1', subjectName: 'Basic Electrical Engineering', subjectCode: 'EE-101T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ece-sem1-7', departmentId: 'dept-ece', semesterId: 'sem-1', subjectName: 'Environments Studies', subjectCode: 'CY-103T', category: 'Theory', credits: 3, createdAt: '2024-01-01' },

  // Semester 2 (Theory Courses)
  { id: 'sub-ece-sem2-1', departmentId: 'dept-ece', semesterId: 'sem-2', subjectName: 'Engineering Physics-II', subjectCode: 'PH-102T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ece-sem2-2', departmentId: 'dept-ece', semesterId: 'sem-2', subjectName: 'Engineering Mathematics-II', subjectCode: 'MA-102T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ece-sem2-3', departmentId: 'dept-ece', semesterId: 'sem-2', subjectName: 'Basic Electronics Engineering', subjectCode: 'EL-101T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ece-sem2-4', departmentId: 'dept-ece', semesterId: 'sem-2', subjectName: 'Communicative English', subjectCode: 'HU-101T', category: 'Theory', credits: 3, createdAt: '2024-01-01' },
  { id: 'sub-ece-sem2-5', departmentId: 'dept-ece', semesterId: 'sem-2', subjectName: 'Computer Fundamentals & Programming', subjectCode: 'CS-101T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ece-sem2-6', departmentId: 'dept-ece', semesterId: 'sem-2', subjectName: 'Engineering Economics', subjectCode: 'HU-103T', category: 'Theory', credits: 3, createdAt: '2024-01-01' },

  // Semester 3 (Theory Courses)
  { id: 'sub-ece-sem3-1', departmentId: 'dept-ece', semesterId: 'sem-3', subjectName: 'Electronics engineering materials', subjectCode: 'EC-201T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ece-sem3-2', departmentId: 'dept-ece', semesterId: 'sem-3', subjectName: 'Electromagnetic theory', subjectCode: 'EC-203T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ece-sem3-3', departmentId: 'dept-ece', semesterId: 'sem-3', subjectName: 'Analog electronics', subjectCode: 'EI-201T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ece-sem3-4', departmentId: 'dept-ece', semesterId: 'sem-3', subjectName: 'Electronic measurement and instrumentation', subjectCode: 'EI-203T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ece-sem3-5', departmentId: 'dept-ece', semesterId: 'sem-3', subjectName: 'Network analysis & Synthesis', subjectCode: 'EE-203T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ece-sem3-6', departmentId: 'dept-ece', semesterId: 'sem-3', subjectName: 'Engineering Mathematics-III', subjectCode: 'MA-201T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },

  // Semester 4 (Theory Courses)
  { id: 'sub-ece-sem4-1', departmentId: 'dept-ece', semesterId: 'sem-4', subjectName: 'Signal and System', subjectCode: 'EC-202T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ece-sem4-2', departmentId: 'dept-ece', semesterId: 'sem-4', subjectName: 'Digital Electronic', subjectCode: 'EC-204T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ece-sem4-3', departmentId: 'dept-ece', semesterId: 'sem-4', subjectName: 'Leaner Integrated Circuits', subjectCode: 'EI-202T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ece-sem4-4', departmentId: 'dept-ece', semesterId: 'sem-4', subjectName: 'Industrial Management', subjectCode: 'ME-212T', category: 'Theory', credits: 3, createdAt: '2024-01-01' },
  { id: 'sub-ece-sem4-5', departmentId: 'dept-ece', semesterId: 'sem-4', subjectName: 'Computer Organization', subjectCode: 'CS-204T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ece-sem4-6', departmentId: 'dept-ece', semesterId: 'sem-4', subjectName: 'Element of Electrical Machines', subjectCode: 'EE-202T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },

  // Semester 5 (Theory Courses)
  { id: 'sub-ece-sem5-1', departmentId: 'dept-ece', semesterId: 'sem-5', subjectName: 'Analog Communication Systems', subjectCode: 'EC-301T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ece-sem5-2', departmentId: 'dept-ece', semesterId: 'sem-5', subjectName: 'Antenna And Wave Propagation', subjectCode: 'EC-303T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ece-sem5-3', departmentId: 'dept-ece', semesterId: 'sem-5', subjectName: 'Consumer Electronics', subjectCode: 'EC-315T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ece-sem5-4', departmentId: 'dept-ece', semesterId: 'sem-5', subjectName: 'Microprocessor and Their Applications', subjectCode: 'EI-301T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ece-sem5-5', departmentId: 'dept-ece', semesterId: 'sem-5', subjectName: 'Control System', subjectCode: 'EE-301T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ece-sem5-6', departmentId: 'dept-ece', semesterId: 'sem-5', subjectName: 'Power Electronics', subjectCode: 'EE-303T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },

  // Semester 6 (Theory Courses)
  { id: 'sub-ece-sem6-1', departmentId: 'dept-ece', semesterId: 'sem-6', subjectName: 'Digital Signal Processing', subjectCode: 'EC-302T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ece-sem6-2', departmentId: 'dept-ece', semesterId: 'sem-6', subjectName: 'Digital Communication System', subjectCode: 'EC-304T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ece-sem6-3', departmentId: 'dept-ece', semesterId: 'sem-6', subjectName: 'Microelectronics', subjectCode: 'EC-308T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ece-sem6-4', departmentId: 'dept-ece', semesterId: 'sem-6', subjectName: 'RADAR And Navigational Aids', subjectCode: 'EC-306T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ece-sem6-5', departmentId: 'dept-ece', semesterId: 'sem-6', subjectName: 'Data Network & Computer Network', subjectCode: 'CS-302T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ece-sem6-6', departmentId: 'dept-ece', semesterId: 'sem-6', subjectName: 'Microcontroller & Embedded System', subjectCode: 'EI-302T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },

  // Semester 7 (Theory Courses and Academic Components)
  { id: 'sub-ece-sem7-1', departmentId: 'dept-ece', semesterId: 'sem-7', subjectName: 'Mobile communication', subjectCode: 'EC-415T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ece-sem7-2', departmentId: 'dept-ece', semesterId: 'sem-7', subjectName: 'VLSI design & circuit', subjectCode: 'EC-403T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ece-sem7-3', departmentId: 'dept-ece', semesterId: 'sem-7', subjectName: 'Microwave engineering', subjectCode: 'EE-405T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ece-sem7-4', departmentId: 'dept-ece', semesterId: 'sem-7', subjectName: 'Industrial training', subjectCode: 'EC-407T', category: 'Training', credits: 2, createdAt: '2024-01-01' },
  { id: 'sub-ece-sem7-5', departmentId: 'dept-ece', semesterId: 'sem-7', subjectName: 'Seminar', subjectCode: 'EC-409T', category: 'Seminar', credits: 2, createdAt: '2024-01-01' },
  { id: 'sub-ece-sem7-6', departmentId: 'dept-ece', semesterId: 'sem-7', subjectName: 'Project-I', subjectCode: 'EC-405P', category: 'Project', credits: 4, createdAt: '2024-01-01' },

  // Semester 7 Pool Elective Options
  { id: 'sub-ece-sem7-pool-1', departmentId: 'dept-ece', semesterId: 'sem-7', subjectName: 'Digital system design', subjectCode: 'EC-433', category: 'Elective', electiveGroup: 'Pool Elective', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ece-sem7-pool-2', departmentId: 'dept-ece', semesterId: 'sem-7', subjectName: 'PC Interfacing', subjectCode: 'EC-452T', category: 'Elective', electiveGroup: 'Pool Elective', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ece-sem7-pool-3', departmentId: 'dept-ece', semesterId: 'sem-7', subjectName: 'Work Study', subjectCode: 'ME-473T', category: 'Elective', electiveGroup: 'Pool Elective', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ece-sem7-pool-4', departmentId: 'dept-ece', semesterId: 'sem-7', subjectName: 'Multimedia', subjectCode: 'CS-402T', category: 'Elective', electiveGroup: 'Pool Elective', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ece-sem7-pool-5', departmentId: 'dept-ece', semesterId: 'sem-7', subjectName: 'PCB Design & Technology', subjectCode: 'EI-451T', category: 'Elective', electiveGroup: 'Pool Elective', credits: 4, createdAt: '2024-01-01' },

  // Semester 7 Open Elective Options
  { id: 'sub-ece-sem7-open-1', departmentId: 'dept-ece', semesterId: 'sem-7', subjectName: 'Futuristic material', subjectCode: 'PH-419T', category: 'Elective', electiveGroup: 'Open Elective', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ece-sem7-open-2', departmentId: 'dept-ece', semesterId: 'sem-7', subjectName: 'Operation research', subjectCode: 'MA-491T', category: 'Elective', electiveGroup: 'Open Elective', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ece-sem7-open-3', departmentId: 'dept-ece', semesterId: 'sem-7', subjectName: 'Polymeric Materials and their Applications', subjectCode: 'CY-401T', category: 'Elective', electiveGroup: 'Open Elective', credits: 4, createdAt: '2024-01-01' },

  // Semester 8 (Theory and Project Courses)
  { id: 'sub-ece-sem8-1', departmentId: 'dept-ece', semesterId: 'sem-8', subjectName: 'Optical fibre communication', subjectCode: 'EC-436T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ece-sem8-2', departmentId: 'dept-ece', semesterId: 'sem-8', subjectName: 'Satellite communication', subjectCode: 'EC-456T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ece-sem8-3', departmentId: 'dept-ece', semesterId: 'sem-8', subjectName: 'Project-II', subjectCode: 'EC-402P', category: 'Project', credits: 8, createdAt: '2024-01-01' },

  // Semester 8 Pool Elective Options
  { id: 'sub-ece-sem8-pool-1', departmentId: 'dept-ece', semesterId: 'sem-8', subjectName: 'Digital Image Processing', subjectCode: 'EC-458T', category: 'Elective', electiveGroup: 'Pool Elective', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ece-sem8-pool-2', departmentId: 'dept-ece', semesterId: 'sem-8', subjectName: 'Microwave Communication', subjectCode: 'EC-450T', category: 'Elective', electiveGroup: 'Pool Elective', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ece-sem8-pool-3', departmentId: 'dept-ece', semesterId: 'sem-8', subjectName: 'DSP Processors and Architecture', subjectCode: 'EC-462T', category: 'Elective', electiveGroup: 'Pool Elective', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ece-sem8-pool-4', departmentId: 'dept-ece', semesterId: 'sem-8', subjectName: 'Fuzzy Logic and Neural Networks', subjectCode: 'EI-412T', category: 'Elective', electiveGroup: 'Pool Elective', credits: 4, createdAt: '2024-01-01' },

  // Semester 8 Open Elective Options
  { id: 'sub-ece-sem8-open-1', departmentId: 'dept-ece', semesterId: 'sem-8', subjectName: 'Engineering economics', subjectCode: 'HU-402T', category: 'Elective', electiveGroup: 'Open Elective', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ece-sem8-open-2', departmentId: 'dept-ece', semesterId: 'sem-8', subjectName: 'Principle of Management', subjectCode: 'HU-449T', category: 'Elective', electiveGroup: 'Open Elective', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ece-sem8-open-3', departmentId: 'dept-ece', semesterId: 'sem-8', subjectName: 'Material Imperfection and Applications', subjectCode: 'PH-429T', category: 'Elective', electiveGroup: 'Open Elective', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ece-sem8-open-4', departmentId: 'dept-ece', semesterId: 'sem-8', subjectName: 'Quantitative Methods in Economics', subjectCode: 'HU-409T', category: 'Elective', electiveGroup: 'Open Elective', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ece-sem8-open-5', departmentId: 'dept-ece', semesterId: 'sem-8', subjectName: 'Foreign Trade', subjectCode: 'HU-407T', category: 'Elective', electiveGroup: 'Open Elective', credits: 4, createdAt: '2024-01-01' },

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

  // Chemical Engineering Subjects (Official M.J.P. Rohilkhand University Course Scheme)
  // First Year — Semester 1 (Theory Courses)
  { id: 'sub-che-sem1-1', departmentId: 'dept-ce', semesterId: 'sem-1', subjectName: 'Engineering Physics-I', subjectCode: 'PH-101T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-che-sem1-2', departmentId: 'dept-ce', semesterId: 'sem-1', subjectName: 'Engineering Chemistry', subjectCode: 'CY-101T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-che-sem1-3', departmentId: 'dept-ce', semesterId: 'sem-1', subjectName: 'Engineering Mathematics-I', subjectCode: 'MA-101T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-che-sem1-4', departmentId: 'dept-ce', semesterId: 'sem-1', subjectName: 'Communicative English', subjectCode: 'HU-101T', category: 'Theory', credits: 3, createdAt: '2024-01-01' },
  { id: 'sub-che-sem1-5', departmentId: 'dept-ce', semesterId: 'sem-1', subjectName: 'Computer Fundamentals & Programming', subjectCode: 'CS-101T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-che-sem1-6', departmentId: 'dept-ce', semesterId: 'sem-1', subjectName: 'Engineering Graphics', subjectCode: 'ME-107T', category: 'Theory', credits: 3, createdAt: '2024-01-01' },
  { id: 'sub-che-sem1-7', departmentId: 'dept-ce', semesterId: 'sem-1', subjectName: 'Basic Electrical Engineering (EE, EI & EC)', subjectCode: 'EE-101T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-che-sem1-8', departmentId: 'dept-ce', semesterId: 'sem-1', subjectName: 'Basic Electronics Engineering (ME, CS & CH)', subjectCode: 'EI-101T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-che-sem1-9', departmentId: 'dept-ce', semesterId: 'sem-1', subjectName: 'Environments Studies (EE, EI & EC)', subjectCode: 'CY-103T', category: 'Theory', credits: 3, createdAt: '2024-01-01' },
  { id: 'sub-che-sem1-10', departmentId: 'dept-ce', semesterId: 'sem-1', subjectName: 'Engineering economics (ME, CS & CH)', subjectCode: 'HU-103T', category: 'Theory', credits: 3, createdAt: '2024-01-01' },

  // First Year — Semester 2 (Theory Courses)
  { id: 'sub-che-sem2-1', departmentId: 'dept-ce', semesterId: 'sem-2', subjectName: 'Engineering Physics-II (All Branches)', subjectCode: 'PH-102T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-che-sem2-2', departmentId: 'dept-ce', semesterId: 'sem-2', subjectName: 'Engineering Mathematics-II (All Branches)', subjectCode: 'MA-102T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-che-sem2-3', departmentId: 'dept-ce', semesterId: 'sem-2', subjectName: 'Basic Electrical Engineering (CS, CH & ME)', subjectCode: 'EE-102T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-che-sem2-4', departmentId: 'dept-ce', semesterId: 'sem-2', subjectName: 'Basic Electronics Engineering (EE, EI & EC)', subjectCode: 'EI-101T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-che-sem2-5', departmentId: 'dept-ce', semesterId: 'sem-2', subjectName: 'Engineering Chemistry (CS, CH & ME)', subjectCode: 'CY-101T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-che-sem2-6', departmentId: 'dept-ce', semesterId: 'sem-2', subjectName: 'Communicative English (EE, EI & EC)', subjectCode: 'HU-101T', category: 'Theory', credits: 3, createdAt: '2024-01-01' },
  { id: 'sub-che-sem2-7', departmentId: 'dept-ce', semesterId: 'sem-2', subjectName: 'Computer Fundamentals & Programming (EE, EI & EC)', subjectCode: 'CS-101T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-che-sem2-8', departmentId: 'dept-ce', semesterId: 'sem-2', subjectName: 'Engineering Graphics (ME, CS & CH)', subjectCode: 'ME-107T', category: 'Theory', credits: 3, createdAt: '2024-01-01' },
  { id: 'sub-che-sem2-9', departmentId: 'dept-ce', semesterId: 'sem-2', subjectName: 'Environmental Studies (ME, CS & CH)', subjectCode: 'CY-103T', category: 'Theory', credits: 3, createdAt: '2024-01-01' },
  { id: 'sub-che-sem2-10', departmentId: 'dept-ce', semesterId: 'sem-2', subjectName: 'Engineering Economics (EE, EI & EC)', subjectCode: 'HU-103T', category: 'Theory', credits: 3, createdAt: '2024-01-01' },

  // Second Year — Semester 3 (Theory Courses)
  { id: 'sub-che-sem3-1', departmentId: 'dept-ce', semesterId: 'sem-3', subjectName: 'Applied Organic Chemistry', subjectCode: 'CY-201', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-che-sem3-2', departmentId: 'dept-ce', semesterId: 'sem-3', subjectName: 'Fluid and Particle Mechanics', subjectCode: 'CE-201', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-che-sem3-3', departmentId: 'dept-ce', semesterId: 'sem-3', subjectName: 'Material and Energy Balance', subjectCode: 'CE-203', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-che-sem3-4', departmentId: 'dept-ce', semesterId: 'sem-3', subjectName: 'Inorganic Chemical Technology', subjectCode: 'CE-205', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-che-sem3-5', departmentId: 'dept-ce', semesterId: 'sem-3', subjectName: 'Chemical Engineering Fluid Mechanics', subjectCode: 'CE-207', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-che-sem3-6', departmentId: 'dept-ce', semesterId: 'sem-3', subjectName: 'Mathematics II', subjectCode: 'MA-201', category: 'Theory', credits: 4, createdAt: '2024-01-01' },

  // Second Year — Semester 4 (Theory Courses)
  { id: 'sub-che-sem4-1', departmentId: 'dept-ce', semesterId: 'sem-4', subjectName: 'Heat Transfer', subjectCode: 'CE-202', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-che-sem4-2', departmentId: 'dept-ce', semesterId: 'sem-4', subjectName: 'Chemical Engg Thermodynamics-I', subjectCode: 'CE-204', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-che-sem4-3', departmentId: 'dept-ce', semesterId: 'sem-4', subjectName: 'Chemical Reaction Engg-I', subjectCode: 'CE-206', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-che-sem4-4', departmentId: 'dept-ce', semesterId: 'sem-4', subjectName: 'Organic Chemical Technology', subjectCode: 'CE-208', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-che-sem4-5', departmentId: 'dept-ce', semesterId: 'sem-4', subjectName: 'Material Science', subjectCode: 'ME-212', category: 'Theory', credits: 3, createdAt: '2024-01-01' },
  { id: 'sub-che-sem4-6', departmentId: 'dept-ce', semesterId: 'sem-4', subjectName: 'Mathematics-III', subjectCode: 'MA-202', category: 'Theory', credits: 4, createdAt: '2024-01-01' },

  // Third Year — Semester 5 (Theory Courses)
  { id: 'sub-che-sem5-1', departmentId: 'dept-ce', semesterId: 'sem-5', subjectName: 'Chemical Reaction Engg.-II', subjectCode: 'CE-301', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-che-sem5-2', departmentId: 'dept-ce', semesterId: 'sem-5', subjectName: 'Chemical Engg. Thermodynamics-II', subjectCode: 'CE-303', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-che-sem5-3', departmentId: 'dept-ce', semesterId: 'sem-5', subjectName: 'Mass Transfer-I', subjectCode: 'CE-305', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-che-sem5-4', departmentId: 'dept-ce', semesterId: 'sem-5', subjectName: 'Transport Phenomena', subjectCode: 'CE-307', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-che-sem5-5', departmentId: 'dept-ce', semesterId: 'sem-5', subjectName: 'Energy Engg', subjectCode: 'CE-309', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-che-sem5-6', departmentId: 'dept-ce', semesterId: 'sem-5', subjectName: 'Process Instrumentation', subjectCode: 'CE-311', category: 'Theory', credits: 4, createdAt: '2024-01-01' },

  // Third Year — Semester 6 (Theory Courses & Departmental Elective-I)
  { id: 'sub-che-sem6-1', departmentId: 'dept-ce', semesterId: 'sem-6', subjectName: 'Process Dynamic & Control', subjectCode: 'CE-302', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-che-sem6-2', departmentId: 'dept-ce', semesterId: 'sem-6', subjectName: 'Process Engg & Economics', subjectCode: 'CE-304', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-che-sem6-3', departmentId: 'dept-ce', semesterId: 'sem-6', subjectName: 'Equipment Design', subjectCode: 'CE-306', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-che-sem6-4', departmentId: 'dept-ce', semesterId: 'sem-6', subjectName: 'Mass Transfer-II', subjectCode: 'CE-308', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-che-sem6-5', departmentId: 'dept-ce', semesterId: 'sem-6', subjectName: 'Industrial Pollution Control', subjectCode: 'CE-310', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-che-sem6-elec1-1', departmentId: 'dept-ce', semesterId: 'sem-6', subjectName: 'Computer Aided Design', subjectCode: 'CE-350', category: 'Elective', electiveGroup: 'Departmental Elective-I', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-che-sem6-elec1-2', departmentId: 'dept-ce', semesterId: 'sem-6', subjectName: 'Computer Application in Chemical Engineering', subjectCode: 'CE-352', category: 'Elective', electiveGroup: 'Departmental Elective-I', credits: 4, createdAt: '2024-01-01' },

  // Fourth Year — Semester 7 (Theory Courses, Electives, Seminar & Industrial Training)
  { id: 'sub-che-sem7-1', departmentId: 'dept-ce', semesterId: 'sem-7', subjectName: 'Process Equipment Design', subjectCode: 'CE-401', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-che-sem7-2', departmentId: 'dept-ce', semesterId: 'sem-7', subjectName: 'Process Utility & Safety', subjectCode: 'CE-403', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-che-sem7-elec2-1', departmentId: 'dept-ce', semesterId: 'sem-7', subjectName: 'Petroleum Refining and Petrochemical Technology', subjectCode: 'CE-451', category: 'Elective', electiveGroup: 'Departmental Elective-II', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-che-sem7-elec2-2', departmentId: 'dept-ce', semesterId: 'sem-7', subjectName: 'Fertilizer Technology', subjectCode: 'CE-453', category: 'Elective', electiveGroup: 'Departmental Elective-II', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-che-sem7-pool-1', departmentId: 'dept-ce', semesterId: 'sem-7', subjectName: 'Environmental Management', subjectCode: 'CE-461', category: 'Elective', electiveGroup: 'Pool Elective', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-che-sem7-pool-2', departmentId: 'dept-ce', semesterId: 'sem-7', subjectName: 'Polymer Science and Technology', subjectCode: 'CE-463', category: 'Elective', electiveGroup: 'Pool Elective', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-che-sem7-open-1', departmentId: 'dept-ce', semesterId: 'sem-7', subjectName: 'Polymer Technology (Chemistry)', subjectCode: 'CY***', category: 'Elective', electiveGroup: 'Open Elective', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-che-sem7-open-2', departmentId: 'dept-ce', semesterId: 'sem-7', subjectName: 'Futuristic Materials', subjectCode: 'PH***', category: 'Elective', electiveGroup: 'Open Elective', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-che-sem7-open-3', departmentId: 'dept-ce', semesterId: 'sem-7', subjectName: 'Principle of Management', subjectCode: 'HU**', category: 'Elective', electiveGroup: 'Open Elective', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-che-sem7-open-4', departmentId: 'dept-ce', semesterId: 'sem-7', subjectName: 'Foreign Trade', subjectCode: 'HU***', category: 'Elective', electiveGroup: 'Open Elective', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-che-sem7-sem-1', departmentId: 'dept-ce', semesterId: 'sem-7', subjectName: 'Report Writing, Seminar and Group Discussion', subjectCode: 'CE-405', category: 'Seminar', credits: 2, createdAt: '2024-01-01' },
  { id: 'sub-che-sem7-trn-1', departmentId: 'dept-ce', semesterId: 'sem-7', subjectName: 'Industrial Training (Colloquium)', subjectCode: 'TRN-401', category: 'Training', credits: 2, createdAt: '2024-01-01' },

  // Fourth Year — Semester 8 (Theory Courses, Electives & Major Project)
  { id: 'sub-che-sem8-1', departmentId: 'dept-ce', semesterId: 'sem-8', subjectName: 'Modelling Simulation & Optimization', subjectCode: 'CE-402', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-che-sem8-2', departmentId: 'dept-ce', semesterId: 'sem-8', subjectName: 'Corrosion and Materials of construction', subjectCode: 'CE-404', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-che-sem8-elec3-1', departmentId: 'dept-ce', semesterId: 'sem-8', subjectName: 'Membrane Separation Processes', subjectCode: 'CE-450', category: 'Elective', electiveGroup: 'Departmental Elective-III', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-che-sem8-elec3-2', departmentId: 'dept-ce', semesterId: 'sem-8', subjectName: 'Fluidization Engineering', subjectCode: 'CE-452', category: 'Elective', electiveGroup: 'Departmental Elective-III', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-che-sem8-elec4-1', departmentId: 'dept-ce', semesterId: 'sem-8', subjectName: 'Solid Waste Management', subjectCode: 'CE-460', category: 'Elective', electiveGroup: 'Departmental Elective-IV', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-che-sem8-elec4-2', departmentId: 'dept-ce', semesterId: 'sem-8', subjectName: 'Safety and Hazard Analysis in Process Industry', subjectCode: 'CE-462', category: 'Elective', electiveGroup: 'Departmental Elective-IV', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-che-sem8-proj-1', departmentId: 'dept-ce', semesterId: 'sem-8', subjectName: 'Project Work and Viva Voce', subjectCode: 'CE-402P', category: 'Project', credits: 8, createdAt: '2024-01-01' },

  // Mechanical Engineering (ME) Subjects (Official M.J.P. Rohilkhand University Course Scheme)
  // First Year — Semester 1 (Theory Courses)
  { id: 'sub-me-sem1-1', departmentId: 'dept-me', semesterId: 'sem-1', subjectName: 'Engineering Physics-I', subjectCode: 'PH-101T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-sem1-2', departmentId: 'dept-me', semesterId: 'sem-1', subjectName: 'Engineering Chemistry', subjectCode: 'CY-101T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-sem1-3', departmentId: 'dept-me', semesterId: 'sem-1', subjectName: 'Engineering Mathematics-I', subjectCode: 'MA-101T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-sem1-4', departmentId: 'dept-me', semesterId: 'sem-1', subjectName: 'Communicative English', subjectCode: 'HU-101T', category: 'Theory', credits: 3, createdAt: '2024-01-01' },
  { id: 'sub-me-sem1-5', departmentId: 'dept-me', semesterId: 'sem-1', subjectName: 'Computer Programming and Fundamentals', subjectCode: 'CS-101T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-sem1-6', departmentId: 'dept-me', semesterId: 'sem-1', subjectName: 'Manufacturing Techniques', subjectCode: 'ME-101T', category: 'Theory', credits: 3, createdAt: '2024-01-01' },
  { id: 'sub-me-sem1-7', departmentId: 'dept-me', semesterId: 'sem-1', subjectName: 'Engineering Graphics', subjectCode: 'ME-103T', category: 'Theory', credits: 3, createdAt: '2024-01-01' },

  // First Year — Semester 2 (Theory Courses)
  { id: 'sub-me-sem2-1', departmentId: 'dept-me', semesterId: 'sem-2', subjectName: 'Basic Electronics Engineering', subjectCode: 'EI-102T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-sem2-2', departmentId: 'dept-me', semesterId: 'sem-2', subjectName: 'Engineering Mathematics-II', subjectCode: 'MA-102T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-sem2-3', departmentId: 'dept-me', semesterId: 'sem-2', subjectName: 'Basic Electrical Engineering', subjectCode: 'EE-102T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-sem2-4', departmentId: 'dept-me', semesterId: 'sem-2', subjectName: 'Engineering Physics-II', subjectCode: 'PH-102T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-sem2-5', departmentId: 'dept-me', semesterId: 'sem-2', subjectName: 'Environmental Studies: Scientific & Engineering Aspects', subjectCode: 'CY-102T', category: 'Theory', credits: 3, createdAt: '2024-01-01' },
  { id: 'sub-me-sem2-6', departmentId: 'dept-me', semesterId: 'sem-2', subjectName: 'Fundamental of Economics', subjectCode: 'HU-102T', category: 'Theory', credits: 3, createdAt: '2024-01-01' },
  { id: 'sub-me-sem2-7', departmentId: 'dept-me', semesterId: 'sem-2', subjectName: 'Basic Mechanical Engineering', subjectCode: 'ME-104T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },

  // Second Year — Semester 3 (Theory Courses)
  { id: 'sub-me-sem3-1', departmentId: 'dept-me', semesterId: 'sem-3', subjectName: 'Kinematics of Machines', subjectCode: 'ME-201T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-sem3-2', departmentId: 'dept-me', semesterId: 'sem-3', subjectName: 'Production Processes-I', subjectCode: 'ME-203T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-sem3-3', departmentId: 'dept-me', semesterId: 'sem-3', subjectName: 'Fluid Mechanics', subjectCode: 'ME-205T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-sem3-4', departmentId: 'dept-me', semesterId: 'sem-3', subjectName: 'Engineering Mathematics-III', subjectCode: 'MA-201T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-sem3-5', departmentId: 'dept-me', semesterId: 'sem-3', subjectName: 'Material Science', subjectCode: 'ME-207T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-sem3-6', departmentId: 'dept-me', semesterId: 'sem-3', subjectName: 'Machines Drawing', subjectCode: 'ME-211T', category: 'Theory', credits: 3, createdAt: '2024-01-01' },

  // Second Year — Semester 4 (Theory Courses)
  { id: 'sub-me-sem4-1', departmentId: 'dept-me', semesterId: 'sem-4', subjectName: 'Dynamics of Machines', subjectCode: 'ME-202T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-sem4-2', departmentId: 'dept-me', semesterId: 'sem-4', subjectName: 'Mechanics of Solids-I', subjectCode: 'ME-204T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-sem4-3', departmentId: 'dept-me', semesterId: 'sem-4', subjectName: 'Internal Combustion Engines', subjectCode: 'ME-206T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-sem4-4', departmentId: 'dept-me', semesterId: 'sem-4', subjectName: 'Production Processes-II', subjectCode: 'ME-208T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-sem4-5', departmentId: 'dept-me', semesterId: 'sem-4', subjectName: 'Principal of Machine Tool Design', subjectCode: 'ME-210T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-sem4-6', departmentId: 'dept-me', semesterId: 'sem-4', subjectName: 'Elements of Electrical Machines', subjectCode: 'EE-202T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },

  // Third Year — Semester 5 (Theory Courses)
  { id: 'sub-me-sem5-1', departmentId: 'dept-me', semesterId: 'sem-5', subjectName: 'Mechanics of Solids-II', subjectCode: 'ME-301T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-sem5-2', departmentId: 'dept-me', semesterId: 'sem-5', subjectName: 'Mechanical Engineering Design-I', subjectCode: 'ME-303T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-sem5-3', departmentId: 'dept-me', semesterId: 'sem-5', subjectName: 'Energy Conversion', subjectCode: 'ME-305T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-sem5-4', departmentId: 'dept-me', semesterId: 'sem-5', subjectName: 'Heat Transfer', subjectCode: 'ME-307T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-sem5-5', departmentId: 'dept-me', semesterId: 'sem-5', subjectName: 'Mechanical Measurement and Metrology', subjectCode: 'ME-309T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-sem5-6', departmentId: 'dept-me', semesterId: 'sem-5', subjectName: 'Production Management', subjectCode: 'ME-311T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },

  // Third Year — Semester 6 (Theory Courses, Elective-I Placeholder & Summer Training Note)
  { id: 'sub-me-sem6-1', departmentId: 'dept-me', semesterId: 'sem-6', subjectName: 'Computer Aided Design', subjectCode: 'ME-302T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-sem6-2', departmentId: 'dept-me', semesterId: 'sem-6', subjectName: 'Mechanical Engineering Design-II', subjectCode: 'ME-304T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-sem6-3', departmentId: 'dept-me', semesterId: 'sem-6', subjectName: 'Production Planning & Control', subjectCode: 'ME-306T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-sem6-4', departmentId: 'dept-me', semesterId: 'sem-6', subjectName: 'Turbo & Fluid Machinery', subjectCode: 'ME-308T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-sem6-5', departmentId: 'dept-me', semesterId: 'sem-6', subjectName: 'Operation Research', subjectCode: 'ME-310T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-sem6-6', departmentId: 'dept-me', semesterId: 'sem-6', subjectName: 'Microprocessor and Applications', subjectCode: 'EI-301T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-sem6-elec1-holder', departmentId: 'dept-me', semesterId: 'sem-6', subjectName: 'Elective-I', subjectCode: 'ME-***', category: 'Elective', electiveGroup: 'Elective-I', credits: 4, note: 'Departmental Elective-I (Configurable from 12-Course ME Elective Catalogue)', createdAt: '2024-01-01' },

  // Fourth Year — Semester 7 (Theory Courses, Elective-II, Pool Electives, Open Electives & Projects)
  { id: 'sub-me-sem7-1', departmentId: 'dept-me', semesterId: 'sem-7', subjectName: 'Computer Aided Manufacturing', subjectCode: 'ME-403T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-sem7-2', departmentId: 'dept-me', semesterId: 'sem-7', subjectName: 'Value Engineering', subjectCode: 'ME-415T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-sem7-elec2-holder', departmentId: 'dept-me', semesterId: 'sem-7', subjectName: 'Elective-II', subjectCode: 'ME-***', category: 'Elective', electiveGroup: 'Elective-II', credits: 4, note: 'Departmental Elective-II (Configurable from ME Elective Catalogue)', createdAt: '2024-01-01' },

  // Semester 7 — Pool Electives (Offered by Engineering Departments)
  { id: 'sub-me-pool-1', departmentId: 'dept-me', semesterId: 'sem-7', subjectName: 'Work Study', subjectCode: 'ME-473T', category: 'Elective', electiveGroup: 'Pool Elective', note: 'Offered by Engineering Departments', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-pool-2', departmentId: 'dept-me', semesterId: 'sem-7', subjectName: 'Audio Engineering', subjectCode: 'EC-475T', category: 'Elective', electiveGroup: 'Pool Elective', note: 'Offered by Engineering Departments', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-pool-3', departmentId: 'dept-me', semesterId: 'sem-7', subjectName: 'Integrated Circuit Technology', subjectCode: 'EC-477T', category: 'Elective', electiveGroup: 'Pool Elective', note: 'Offered by Engineering Departments', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-pool-4', departmentId: 'dept-me', semesterId: 'sem-7', subjectName: 'Artificial Intelligence', subjectCode: 'CS-479T', category: 'Elective', electiveGroup: 'Pool Elective', note: 'Offered by Engineering Departments', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-pool-5', departmentId: 'dept-me', semesterId: 'sem-7', subjectName: 'Image Processing', subjectCode: 'CS-481T', category: 'Elective', electiveGroup: 'Pool Elective', note: 'Offered by Engineering Departments', credits: 4, createdAt: '2024-01-01' },

  // Semester 7 — Open Electives (Offered by Science and Humanities Department)
  { id: 'sub-me-open-1', departmentId: 'dept-me', semesterId: 'sem-7', subjectName: 'Principal of Management', subjectCode: 'HU-491T', category: 'Elective', electiveGroup: 'Open Elective', note: 'Offered by Science and Humanities Department', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-open-2', departmentId: 'dept-me', semesterId: 'sem-7', subjectName: 'Operations Research', subjectCode: 'MA-491T', category: 'Elective', electiveGroup: 'Open Elective', note: 'Offered by Science and Humanities Department', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-open-3', departmentId: 'dept-me', semesterId: 'sem-7', subjectName: 'Charge Transfer in Plasma', subjectCode: 'CY-491T', category: 'Elective', electiveGroup: 'Open Elective', note: 'Offered by Science and Humanities Department', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-open-4', departmentId: 'dept-me', semesterId: 'sem-7', subjectName: 'Introduction to Psychology', subjectCode: 'HU-493T', category: 'Elective', electiveGroup: 'Open Elective', note: 'Offered by Science and Humanities Department', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-open-5', departmentId: 'dept-me', semesterId: 'sem-7', subjectName: 'Polymeric Materials and their Applications', subjectCode: 'CY-401T', category: 'Elective', electiveGroup: 'Open Elective', note: 'Offered by Science and Humanities Department', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-open-6', departmentId: 'dept-me', semesterId: 'sem-7', subjectName: 'Futuristic Materials', subjectCode: 'PH-419T', category: 'Elective', electiveGroup: 'Open Elective', note: 'Offered by Science and Humanities Department', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-open-7', departmentId: 'dept-me', semesterId: 'sem-7', subjectName: 'Material Imperfection and Applications', subjectCode: 'PH-429T', category: 'Elective', electiveGroup: 'Open Elective', note: 'Offered by Science and Humanities Department', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-open-8', departmentId: 'dept-me', semesterId: 'sem-7', subjectName: 'Engineering Economics', subjectCode: 'HU-402T', category: 'Elective', electiveGroup: 'Open Elective', note: 'Offered by Science and Humanities Department', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-open-9', departmentId: 'dept-me', semesterId: 'sem-7', subjectName: 'Quantitative Methods in Economics', subjectCode: 'HU-409T', category: 'Elective', electiveGroup: 'Open Elective', note: 'Offered by Science and Humanities Department', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-open-10', departmentId: 'dept-me', semesterId: 'sem-7', subjectName: 'Foreign Trade', subjectCode: 'HU-407T', category: 'Elective', electiveGroup: 'Open Elective', note: 'Offered by Science and Humanities Department', credits: 4, createdAt: '2024-01-01' },

  // Semester 7 — Other Courses & Project
  { id: 'sub-me-sem7-sem', departmentId: 'dept-me', semesterId: 'sem-7', subjectName: 'Seminar', subjectCode: 'ME-405T', category: 'Seminar', credits: 2, createdAt: '2024-01-01' },
  { id: 'sub-me-sem7-trn', departmentId: 'dept-me', semesterId: 'sem-7', subjectName: 'Industrial Training (Viva)', subjectCode: 'ME-401', category: 'Training', credits: 2, createdAt: '2024-01-01' },
  { id: 'sub-me-sem7-proj1', departmentId: 'dept-me', semesterId: 'sem-7', subjectName: 'Project-I', subjectCode: 'ME-405P', category: 'Project', credits: 4, createdAt: '2024-01-01' },

  // Fourth Year — Semester 8 (Theory Course, Electives III, IV, V & Project-II)
  { id: 'sub-me-sem8-1', departmentId: 'dept-me', semesterId: 'sem-8', subjectName: 'Refrigeration & Air Conditioning', subjectCode: 'ME-406T', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-sem8-elec3-holder', departmentId: 'dept-me', semesterId: 'sem-8', subjectName: 'Elective-III', subjectCode: 'ME-***', category: 'Elective', electiveGroup: 'Elective-III', credits: 4, note: 'Departmental Elective-III (Configurable from ME Elective Catalogue)', createdAt: '2024-01-01' },
  { id: 'sub-me-sem8-elec4-holder', departmentId: 'dept-me', semesterId: 'sem-8', subjectName: 'Elective-IV', subjectCode: 'ME-***', category: 'Elective', electiveGroup: 'Elective-IV', credits: 4, note: 'Departmental Elective-IV (Configurable from ME Elective Catalogue)', createdAt: '2024-01-01' },
  { id: 'sub-me-sem8-elec5-holder', departmentId: 'dept-me', semesterId: 'sem-8', subjectName: 'Elective-V', subjectCode: 'ME-***', category: 'Elective', electiveGroup: 'Elective-V', credits: 4, note: 'Departmental Elective-V (Configurable from ME Elective Catalogue)', createdAt: '2024-01-01' },
  { id: 'sub-me-sem8-proj2', departmentId: 'dept-me', semesterId: 'sem-8', subjectName: 'Project-II', subjectCode: 'ME-404P', category: 'Project', credits: 8, createdAt: '2024-01-01' },

  // Mechanical Engineering Departmental Elective Catalogue (12 Official Subjects)
  { id: 'sub-me-elec-1', departmentId: 'dept-me', semesterId: 'sem-6', subjectName: 'Automotive Mechanics', subjectCode: 'ME-316T', category: 'Elective', note: 'Departmental Elective Catalogue', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-elec-2', departmentId: 'dept-me', semesterId: 'sem-6', subjectName: 'Statistical Quality Control', subjectCode: 'ME-318T', category: 'Elective', note: 'Departmental Elective Catalogue', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-elec-3', departmentId: 'dept-me', semesterId: 'sem-6', subjectName: 'Power Plant Engineering', subjectCode: 'ME-407T', category: 'Elective', note: 'Departmental Elective Catalogue', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-elec-4', departmentId: 'dept-me', semesterId: 'sem-6', subjectName: 'Composite Materials', subjectCode: 'ME-409T', category: 'Elective', note: 'Departmental Elective Catalogue', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-elec-5', departmentId: 'dept-me', semesterId: 'sem-6', subjectName: 'Tribology', subjectCode: 'ME-413T', category: 'Elective', note: 'Departmental Elective Catalogue', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-elec-6', departmentId: 'dept-me', semesterId: 'sem-6', subjectName: 'Advanced Manufacturing Systems', subjectCode: 'ME-417T', category: 'Elective', note: 'Departmental Elective Catalogue', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-elec-7', departmentId: 'dept-me', semesterId: 'sem-6', subjectName: 'Advance Precision Machining Processes', subjectCode: 'ME-408T', category: 'Elective', note: 'Departmental Elective Catalogue', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-elec-8', departmentId: 'dept-me', semesterId: 'sem-6', subjectName: 'Non Conventional Energy Sources', subjectCode: 'ME-414T', category: 'Elective', note: 'Departmental Elective Catalogue', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-elec-9', departmentId: 'dept-me', semesterId: 'sem-6', subjectName: 'Mechanical Vibration', subjectCode: 'ME-412T', category: 'Elective', note: 'Departmental Elective Catalogue', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-elec-10', departmentId: 'dept-me', semesterId: 'sem-6', subjectName: 'Gas Dynamics', subjectCode: 'ME-416T', category: 'Elective', note: 'Departmental Elective Catalogue', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-elec-11', departmentId: 'dept-me', semesterId: 'sem-6', subjectName: 'Maintenance Management', subjectCode: 'ME-418T', category: 'Elective', note: 'Departmental Elective Catalogue', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-me-elec-12', departmentId: 'dept-me', semesterId: 'sem-6', subjectName: 'Principles of Robotics', subjectCode: 'ME-422T', category: 'Elective', note: 'Departmental Elective Catalogue', credits: 4, createdAt: '2024-01-01' },

  // Electronics & Instrumentation Engineering (EI) Subjects (Official M.J.P. Rohilkhand University Course Scheme 2025–26)
  // Semester 1 — 1st Year (Theory Courses)
  { id: 'sub-ei-sem1-1', departmentId: 'dept-eie', semesterId: 'sem-1', subjectName: 'Engineering Physics-I', subjectCode: 'PH-101T', paperCode: '23031', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ei-sem1-2', departmentId: 'dept-eie', semesterId: 'sem-1', subjectName: 'Engineering Chemistry-I', subjectCode: 'CY-101T', paperCode: '23001', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ei-sem1-3', departmentId: 'dept-eie', semesterId: 'sem-1', subjectName: 'Engineering Mathematics-I', subjectCode: 'MA-101T', paperCode: '23021', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ei-sem1-4', departmentId: 'dept-eie', semesterId: 'sem-1', subjectName: 'English Language & Literature', subjectCode: 'HU-101T', paperCode: '23011', category: 'Theory', credits: 3, createdAt: '2024-01-01' },
  { id: 'sub-ei-sem1-5', departmentId: 'dept-eie', semesterId: 'sem-1', subjectName: 'Computer Fundamentals & Programming in C++', subjectCode: 'CS-101T', paperCode: '25201', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ei-sem1-6', departmentId: 'dept-eie', semesterId: 'sem-1', subjectName: 'Basic Electrical Engineering', subjectCode: 'EE-101N', paperCode: '23401', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ei-sem1-7', departmentId: 'dept-eie', semesterId: 'sem-1', subjectName: 'Basic Electronics Engineering', subjectCode: 'EL-101T', paperCode: '25311', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ei-sem1-8', departmentId: 'dept-eie', semesterId: 'sem-1', subjectName: 'Basic Mechanical Engineering', subjectCode: 'BME-505C', paperCode: '23602', category: 'Theory', credits: 4, createdAt: '2024-01-01' },

  // Semester 2 — 1st Year (Theory Courses)
  { id: 'sub-ei-sem2-1', departmentId: 'dept-eie', semesterId: 'sem-2', subjectName: 'Engineering Physics-II', subjectCode: 'PH-102T', paperCode: '23032', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ei-sem2-2', departmentId: 'dept-eie', semesterId: 'sem-2', subjectName: 'Engineering Mathematics-II', subjectCode: 'MA-102T', paperCode: '23022', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ei-sem2-3', departmentId: 'dept-eie', semesterId: 'sem-2', subjectName: 'Engineering Graphics', subjectCode: 'BME-503C', paperCode: '23605', category: 'Theory', credits: 3, createdAt: '2024-01-01' },
  { id: 'sub-ei-sem2-4', departmentId: 'dept-eie', semesterId: 'sem-2', subjectName: 'Basic Electronics Engineering', subjectCode: 'EL-102T', paperCode: '25311', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ei-sem2-5', departmentId: 'dept-eie', semesterId: 'sem-2', subjectName: 'Environmental Studies', subjectCode: 'CY-103T', paperCode: '23003', category: 'Theory', credits: 3, createdAt: '2024-01-01' },
  { id: 'sub-ei-sem2-6', departmentId: 'dept-eie', semesterId: 'sem-2', subjectName: 'Fundamentals of the Economics', subjectCode: 'HU-103T', paperCode: '23013', category: 'Theory', credits: 3, createdAt: '2024-01-01' },
  { id: 'sub-ei-sem2-7', departmentId: 'dept-eie', semesterId: 'sem-2', subjectName: 'Manufacturing Techniques', subjectCode: 'BME-101C', paperCode: '23601', category: 'Theory', credits: 3, createdAt: '2024-01-01' },

  // Semester 3 — 2nd Year (Theory Courses)
  { id: 'sub-ei-sem3-1', departmentId: 'dept-eie', semesterId: 'sem-3', subjectName: 'Analog Electronics', subjectCode: 'EL-201T', paperCode: '25321', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ei-sem3-2', departmentId: 'dept-eie', semesterId: 'sem-3', subjectName: 'Electronic Measurement & Instrumentation', subjectCode: 'EL-203T', paperCode: '25322', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ei-sem3-3', departmentId: 'dept-eie', semesterId: 'sem-3', subjectName: 'Data Structure using C++', subjectCode: 'CS-203T', paperCode: '25212', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ei-sem3-4', departmentId: 'dept-eie', semesterId: 'sem-3', subjectName: 'Electromagnetic Theory', subjectCode: 'EC-203T', paperCode: '23322', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ei-sem3-5', departmentId: 'dept-eie', semesterId: 'sem-3', subjectName: 'Network Analysis & Synthesis', subjectCode: 'EE-201N', paperCode: '23421', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ei-sem3-6', departmentId: 'dept-eie', semesterId: 'sem-3', subjectName: 'Engineering Mathematics-III', subjectCode: 'MA-201T', paperCode: '23023', category: 'Theory', credits: 4, createdAt: '2024-01-01' },

  // Semester 4 — 2nd Year (Theory Courses)
  { id: 'sub-ei-sem4-1', departmentId: 'dept-eie', semesterId: 'sem-4', subjectName: 'Linear Integrated Circuits', subjectCode: 'EL-202T', paperCode: '23531', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ei-sem4-2', departmentId: 'dept-eie', semesterId: 'sem-4', subjectName: 'Signals & Systems', subjectCode: 'EC-202T', paperCode: '23331', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ei-sem4-3', departmentId: 'dept-eie', semesterId: 'sem-4', subjectName: 'Digital Electronic Circuits', subjectCode: 'EL-204T', paperCode: '23532', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ei-sem4-4', departmentId: 'dept-eie', semesterId: 'sem-4', subjectName: 'Computer Organization', subjectCode: 'CS-204T', paperCode: '25222', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ei-sem4-5', departmentId: 'dept-eie', semesterId: 'sem-4', subjectName: 'Solid State Materials and Devices', subjectCode: 'EL-206T', paperCode: '25333', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ei-sem4-6', departmentId: 'dept-eie', semesterId: 'sem-4', subjectName: 'Human Values and Professional Ethics', subjectCode: 'HU-204T', paperCode: '23019', category: 'Theory', credits: 3, createdAt: '2024-01-01' },

  // Semester 5 — 3rd Year (Theory Courses & Pool Elective 1 Catalogue)
  { id: 'sub-ei-sem5-1', departmentId: 'dept-eie', semesterId: 'sem-5', subjectName: 'Analog Communication Systems', subjectCode: 'EC-301T', paperCode: '23341', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ei-sem5-2', departmentId: 'dept-eie', semesterId: 'sem-5', subjectName: 'Microprocessors & Their Applications', subjectCode: 'EL-301T', paperCode: '23541', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ei-sem5-3', departmentId: 'dept-eie', semesterId: 'sem-5', subjectName: 'Sensors and Transducers', subjectCode: 'EL-303T', paperCode: '23542', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ei-sem5-4', departmentId: 'dept-eie', semesterId: 'sem-5', subjectName: 'Antenna Engineering', subjectCode: 'EL-305T', paperCode: '25343', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ei-sem5-5', departmentId: 'dept-eie', semesterId: 'sem-5', subjectName: 'Control Systems', subjectCode: 'EE-301T', paperCode: '23441', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ei-sem5-pool1-1', departmentId: 'dept-eie', semesterId: 'sem-5', subjectName: 'Semiconductor Fabrication technology', subjectCode: 'EL-307T', paperCode: '25344', category: 'Elective', electiveGroup: 'Pool Elective 1', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ei-sem5-pool1-2', departmentId: 'dept-eie', semesterId: 'sem-5', subjectName: 'PCB Design & Technology', subjectCode: 'EL-309T', paperCode: '25345', category: 'Elective', electiveGroup: 'Pool Elective 1', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ei-sem5-pool1-3', departmentId: 'dept-eie', semesterId: 'sem-5', subjectName: 'Mixed Signal Design', subjectCode: 'EL-311T', paperCode: '25346', category: 'Elective', electiveGroup: 'Pool Elective 1', credits: 4, createdAt: '2024-01-01' },

  // Semester 6 — 3rd Year (Theory Courses & Pool Elective 2 Catalogue)
  { id: 'sub-ei-sem6-1', departmentId: 'dept-eie', semesterId: 'sem-6', subjectName: 'Digital Signal Processing', subjectCode: 'EC-302T', paperCode: '23351', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ei-sem6-2', departmentId: 'dept-eie', semesterId: 'sem-6', subjectName: 'Embedded Systems', subjectCode: 'EL-302T', paperCode: '25351', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ei-sem6-3', departmentId: 'dept-eie', semesterId: 'sem-6', subjectName: 'Digital Communication System', subjectCode: 'EC-304T', paperCode: '23352', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ei-sem6-4', departmentId: 'dept-eie', semesterId: 'sem-6', subjectName: 'VLSI Design', subjectCode: 'EL-304T', paperCode: '25352', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ei-sem6-5', departmentId: 'dept-eie', semesterId: 'sem-6', subjectName: 'RF and Microwave engineering', subjectCode: 'EL-306T', paperCode: '25353', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ei-sem6-6', departmentId: 'dept-eie', semesterId: 'sem-6', subjectName: 'Technical Writing', subjectCode: 'EL-308T', paperCode: '25354', category: 'Theory', credits: 3, createdAt: '2024-01-01' },
  { id: 'sub-ei-sem6-pool2-1', departmentId: 'dept-eie', semesterId: 'sem-6', subjectName: 'Artificial Intelligence and Machine Learning', subjectCode: 'EL-310T', paperCode: '25355', category: 'Elective', electiveGroup: 'Pool Elective 2', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ei-sem6-pool2-2', departmentId: 'dept-eie', semesterId: 'sem-6', subjectName: 'Information theory and coding', subjectCode: 'EL-312T', paperCode: '25356', category: 'Elective', electiveGroup: 'Pool Elective 2', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ei-sem6-pool2-3', departmentId: 'dept-eie', semesterId: 'sem-6', subjectName: 'Computational Electromagnetics', subjectCode: 'EL-314T', paperCode: '25357', category: 'Elective', electiveGroup: 'Pool Elective 2', credits: 4, createdAt: '2024-01-01' },

  // Semester 7 — 4th Year (Theory Courses, Open Elective, Pool Electives 3, 4, 5, Training & Seminar)
  { id: 'sub-ei-sem7-1', departmentId: 'dept-eie', semesterId: 'sem-7', subjectName: 'Biomedical Engineering', subjectCode: 'EL-401T', paperCode: '25361', category: 'Theory', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ei-sem7-2', departmentId: 'dept-eie', semesterId: 'sem-7', subjectName: 'Metrology and Calibration', subjectCode: 'EL-403T', paperCode: '25362', category: 'Theory', credits: 4, createdAt: '2024-01-01' },

  // Semester 7 — Open Elective Catalogue
  { id: 'sub-ei-open-1', departmentId: 'dept-eie', semesterId: 'sem-7', subjectName: 'Operation Research', subjectCode: 'MA-491T', paperCode: '23033', category: 'Elective', electiveGroup: 'Open Elective', note: 'Offered by Science and Humanities Department', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ei-open-2', departmentId: 'dept-eie', semesterId: 'sem-7', subjectName: 'Polymeric Materials and their Applications', subjectCode: 'CY-401T', paperCode: '23052', category: 'Elective', electiveGroup: 'Open Elective', note: 'Offered by Science and Humanities Department', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ei-open-3', departmentId: 'dept-eie', semesterId: 'sem-7', subjectName: 'Futuristic Materials', subjectCode: 'PH-419T', paperCode: '23024', category: 'Elective', electiveGroup: 'Open Elective', note: 'Offered by Science and Humanities Department', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ei-open-4', departmentId: 'dept-eie', semesterId: 'sem-7', subjectName: 'Principles of Management', subjectCode: 'HU-449T', paperCode: '23017', category: 'Elective', electiveGroup: 'Open Elective', note: 'Offered by Science and Humanities Department', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ei-open-5', departmentId: 'dept-eie', semesterId: 'sem-7', subjectName: 'Quantitative Methods in Economics', subjectCode: 'HU-409T', paperCode: '23016', category: 'Elective', electiveGroup: 'Open Elective', note: 'Offered by Science and Humanities Department', credits: 4, createdAt: '2024-01-01' },

  // Semester 7 — Pool Elective 3 Catalogue
  { id: 'sub-ei-pool3-1', departmentId: 'dept-eie', semesterId: 'sem-7', subjectName: 'Nano Electronics', subjectCode: 'EL-407T', paperCode: '25365', category: 'Elective', electiveGroup: 'Pool Elective 3', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ei-pool3-2', departmentId: 'dept-eie', semesterId: 'sem-7', subjectName: 'Microwave Integrated Circuit', subjectCode: 'EL-409T', paperCode: '25366', category: 'Elective', electiveGroup: 'Pool Elective 3', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ei-pool3-3', departmentId: 'dept-eie', semesterId: 'sem-7', subjectName: 'Introduction to MEMS', subjectCode: 'EL-411T', paperCode: '25367', category: 'Elective', electiveGroup: 'Pool Elective 3', credits: 4, createdAt: '2024-01-01' },

  // Semester 7 — Pool Elective 4 Catalogue
  { id: 'sub-ei-pool4-1', departmentId: 'dept-eie', semesterId: 'sem-7', subjectName: 'Optical fiber communication', subjectCode: 'EL-413T', paperCode: '25371', category: 'Elective', electiveGroup: 'Pool Elective 4', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ei-pool4-2', departmentId: 'dept-eie', semesterId: 'sem-7', subjectName: 'Wireless communication', subjectCode: 'EL-415T', paperCode: '25372', category: 'Elective', electiveGroup: 'Pool Elective 4', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ei-pool4-3', departmentId: 'dept-eie', semesterId: 'sem-7', subjectName: 'Wireless sensor network', subjectCode: 'EL-417T', paperCode: '25373', category: 'Elective', electiveGroup: 'Pool Elective 4', credits: 4, createdAt: '2024-01-01' },

  // Semester 7 — Pool Elective 5 Catalogue
  { id: 'sub-ei-pool5-1', departmentId: 'dept-eie', semesterId: 'sem-7', subjectName: 'Digital System Design', subjectCode: 'EL-419T', paperCode: '25375', category: 'Elective', electiveGroup: 'Pool Elective 5', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ei-pool5-2', departmentId: 'dept-eie', semesterId: 'sem-7', subjectName: 'Digital Audio Processing', subjectCode: 'EL-421T', paperCode: '25376', category: 'Elective', electiveGroup: 'Pool Elective 5', credits: 4, createdAt: '2024-01-01' },
  { id: 'sub-ei-pool5-3', departmentId: 'dept-eie', semesterId: 'sem-7', subjectName: 'Milli meter wave Device and circuits', subjectCode: 'EL-423T', paperCode: '25377', category: 'Elective', electiveGroup: 'Pool Elective 5', credits: 4, createdAt: '2024-01-01' },

  // Semester 7 — Academic Components
  { id: 'sub-ei-sem7-trn', departmentId: 'dept-eie', semesterId: 'sem-7', subjectName: 'Industrial Training (EI)', subjectCode: 'EL-407', paperCode: '26324', category: 'Training', credits: 2, createdAt: '2024-01-01' },
  { id: 'sub-ei-sem7-sem', departmentId: 'dept-eie', semesterId: 'sem-7', subjectName: 'Seminar (EI)', subjectCode: 'EL-409', paperCode: '26325', category: 'Seminar', credits: 2, createdAt: '2024-01-01' },

  // Semester 8 — 4th Year (Major Project / Internship)
  { id: 'sub-ei-sem8-proj', departmentId: 'dept-eie', semesterId: 'sem-8', subjectName: 'Major Project/Internship', subjectCode: 'EL-402P', paperCode: '26326', category: 'Project', credits: 12, createdAt: '2024-01-01' },
];

export const INITIAL_PAPERS: QuestionPaper[] = [];

const LOCAL_STORAGE_KEY = 'mjpru_pyq_platform_data_v10';
const DELETED_KEYS_STORAGE_KEY = 'mjpru_pyq_deleted_storage_keys_v1';

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
  private deletedStorageKeys = new Set<string>();

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (this.isInitialized) return;

    try {
      // Purge old local storage versions that stored demo/sample papers
      if (typeof localStorage !== 'undefined') {
        const legacyKeys = [
          'mjpru_pyq_platform_data_v8',
          'mjpru_pyq_platform_data_v7',
          'mjpru_pyq_platform_data_v6',
          'mjpru_pyq_platform_data_v5',
          'mjpru_pyq_platform_data_v4',
          'mjpru_pyq_platform_data_v3',
          'mjpru_pyq_platform_data_v2',
          'mjpru_pyq_platform_data_v1',
          'mjpru_pyq_platform_data',
        ];
        legacyKeys.forEach((key) => {
          try {
            localStorage.removeItem(key);
          } catch {
            // ignore
          }
        });
      }

      if (typeof localStorage !== 'undefined') {
        const deletedRaw = localStorage.getItem(DELETED_KEYS_STORAGE_KEY);
        if (deletedRaw) {
          try {
            const list: string[] = JSON.parse(deletedRaw);
            this.deletedStorageKeys = new Set(list);
          } catch {
            this.deletedStorageKeys = new Set();
          }
        }
      }

      const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_KEY) : null;

      if (stored) {
        const parsed: StoredData = JSON.parse(stored);
        this.departments = (parsed.departments || INITIAL_DEPARTMENTS).map((d) => {
          if (d.id === 'dept-csit') {
            return {
              ...d,
              name: 'Computer Science and Information Technology',
              code: 'CSIT',
            };
          }
          if (d.id === 'dept-ce') {
            return {
              ...d,
              name: 'Chemical Engineering',
              code: 'CH',
            };
          }
          if (d.id === 'dept-me') {
            return {
              ...d,
              name: 'Mechanical Engineering',
              code: 'ME',
            };
          }
          if (d.id === 'dept-eie') {
            return {
              ...d,
              name: 'Electronics & Instrumentation Engineering',
              code: 'EI',
            };
          }
          return d;
        });
        
        // Ensure CSIT, Electrical, Electronics & Communication, Chemical, Mechanical, and Electronics & Instrumentation have complete official schemes
        const otherSubjects = (parsed.subjects || []).filter(
          (s) => s.departmentId !== 'dept-csit' && s.departmentId !== 'dept-ee' && s.departmentId !== 'dept-ece' && s.departmentId !== 'dept-ce' && s.departmentId !== 'dept-me' && s.departmentId !== 'dept-eie'
        );
        const csitOfficialSubjects = INITIAL_SUBJECTS.filter((s) => s.departmentId === 'dept-csit');
        const eeOfficialSubjects = INITIAL_SUBJECTS.filter((s) => s.departmentId === 'dept-ee');
        const eceOfficialSubjects = INITIAL_SUBJECTS.filter((s) => s.departmentId === 'dept-ece');
        const cheOfficialSubjects = INITIAL_SUBJECTS.filter((s) => s.departmentId === 'dept-ce');
        const meOfficialSubjects = INITIAL_SUBJECTS.filter((s) => s.departmentId === 'dept-me');
        const eiOfficialSubjects = INITIAL_SUBJECTS.filter((s) => s.departmentId === 'dept-eie');

        // Preserve any custom elective group assignments made by admin in previous sessions for CSIT
        const existingCsitSubMap = new Map(
          (parsed.subjects || []).filter((s) => s.departmentId === 'dept-csit').map((s) => [s.subjectCode, s])
        );
        const mergedCsitSubjects = csitOfficialSubjects.map((sub) => {
          const userSub = existingCsitSubMap.get(sub.subjectCode);
          if (userSub && userSub.electiveGroup) {
            return {
              ...sub,
              electiveGroup: userSub.electiveGroup,
              semesterId: userSub.semesterId || sub.semesterId,
              category: userSub.category || sub.category,
              note: userSub.note || sub.note,
            };
          }
          return sub;
        });

        // Preserve any custom elective group assignments made by admin in previous sessions for Chemical Engineering
        const existingCheSubMap = new Map(
          (parsed.subjects || []).filter((s) => s.departmentId === 'dept-ce').map((s) => [s.subjectCode, s])
        );
        const mergedCheSubjects = cheOfficialSubjects.map((sub) => {
          const userSub = existingCheSubMap.get(sub.subjectCode);
          if (userSub && userSub.electiveGroup) {
            return {
              ...sub,
              electiveGroup: userSub.electiveGroup,
              semesterId: userSub.semesterId || sub.semesterId,
              category: userSub.category || sub.category,
              note: userSub.note || sub.note,
            };
          }
          return sub;
        });

        // Preserve any custom elective group assignments made by admin in previous sessions for Mechanical Engineering
        const existingMeSubMap = new Map(
          (parsed.subjects || []).filter((s) => s.departmentId === 'dept-me').map((s) => [s.subjectCode, s])
        );
        const mergedMeSubjects = meOfficialSubjects.map((sub) => {
          const userSub = existingMeSubMap.get(sub.subjectCode);
          if (userSub && userSub.electiveGroup) {
            return {
              ...sub,
              electiveGroup: userSub.electiveGroup,
              semesterId: userSub.semesterId || sub.semesterId,
              category: userSub.category || sub.category,
              note: userSub.note || sub.note,
            };
          }
          return sub;
        });

        // Preserve any custom elective group assignments made by admin in previous sessions for Electronics & Instrumentation Engineering
        const existingEiSubMap = new Map(
          (parsed.subjects || []).filter((s) => s.departmentId === 'dept-eie').map((s) => [s.subjectCode, s])
        );
        const mergedEiSubjects = eiOfficialSubjects.map((sub) => {
          const userSub = existingEiSubMap.get(sub.subjectCode);
          if (userSub && userSub.electiveGroup) {
            return {
              ...sub,
              electiveGroup: userSub.electiveGroup,
              semesterId: userSub.semesterId || sub.semesterId,
              category: userSub.category || sub.category,
              paperCode: userSub.paperCode || sub.paperCode,
              note: userSub.note || sub.note,
            };
          }
          return sub;
        });

        this.subjects = [...otherSubjects, ...mergedCsitSubjects, ...eeOfficialSubjects, ...eceOfficialSubjects, ...mergedCheSubjects, ...mergedMeSubjects, ...mergedEiSubjects];

        // Clean library starts with 0 demo papers; exclude any old demo paper-1..10 IDs
        const demoIdSet = new Set(['paper-1', 'paper-2', 'paper-3', 'paper-4', 'paper-5', 'paper-6', 'paper-7', 'paper-8', 'paper-9', 'paper-10']);
        const rawPapers = (parsed.papers || []).filter((p) => !demoIdSet.has(p.id));
        this.papers = deduplicateQuestionPapers(rawPapers);

        this.saveToStorage();
      } else {
        this.departments = [...INITIAL_DEPARTMENTS];
        this.subjects = [...INITIAL_SUBJECTS];
        this.papers = [];
        this.saveToStorage();
      }
    } catch {
      this.departments = [...INITIAL_DEPARTMENTS];
      this.subjects = [...INITIAL_SUBJECTS];
      this.papers = [];
    }

    this.isInitialized = true;
    this.hydratePaperMetadata();
  }

  private saveToStorage() {
    if (typeof localStorage === 'undefined') return;
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

  private saveDeletedKeys() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(DELETED_KEYS_STORAGE_KEY, JSON.stringify(Array.from(this.deletedStorageKeys)));
    } catch (e) {
      console.warn('Could not save deleted keys to localStorage:', e);
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
      p.paperCode = sub?.paperCode || p.paperCode;
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
          paper_code: newSub.paperCode || null,
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
          paper_code: updated.paperCode,
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

  // Synchronize question papers with Supabase Database and Storage bucket 'pyq-papers'
  async syncWithSupabase(): Promise<void> {
    if (!isSupabaseConfigured() || !supabase) return;

    try {
      const papersMap = new Map<string, QuestionPaper>();
      const compositeSeen = new Map<string, string>(); // compositeKey -> paperId

      // 1. Fetch from Supabase database table 'question_papers'
      try {
        const { data: dbRows, error: dbErr } = await supabase
          .from('question_papers')
          .select('*')
          .order('uploaded_at', { ascending: false });

        if (!dbErr && dbRows && dbRows.length > 0) {
          dbRows.forEach((row) => {
            if (
              this.deletedStorageKeys.has(row.id) ||
              this.deletedStorageKeys.has(row.file_name) ||
              this.deletedStorageKeys.has(row.file_path)
            ) {
              return;
            }

            const targetSub = this.subjects.find((s) => s.id === row.subject_id);
            const resolvedUrl = resolvePdfUrl(row.file_path);
            const paper: QuestionPaper = {
              id: row.id,
              departmentId: row.department_id,
              subjectId: row.subject_id,
              academicYearId: row.academic_year_id,
              semesterId: row.semester_id,
              examinationYear: row.examination_year,
              examinationType: (row.examination_type as ExaminationType) || 'Regular',
              filePath: resolvedUrl || row.file_path,
              fileName: row.file_name,
              fileSizeBytes: row.file_size_bytes || 0,
              pageCount: row.page_count || 2,
              description: row.description || '',
              downloadCount: row.download_count || 0,
              uploadedAt: row.uploaded_at || new Date().toISOString(),
              subjectCode: targetSub?.subjectCode,
              subjectName: targetSub?.subjectName,
            };

            const compKey = getPaperCompositeKey(paper);
            if (!compositeSeen.has(compKey)) {
              compositeSeen.set(compKey, paper.id);
              papersMap.set(paper.id, paper);
            }
          });
        }
      } catch (dbFetchErr) {
        console.warn('Supabase DB papers fetch fallback:', dbFetchErr);
      }

      // 2. Include active local repository papers (user uploads in current session)
      this.papers.forEach((p) => {
        if (
          p.filePath &&
          !this.deletedStorageKeys.has(p.id) &&
          !this.deletedStorageKeys.has(p.fileName) &&
          !this.deletedStorageKeys.has(p.filePath)
        ) {
          const compKey = getPaperCompositeKey(p);
          if (!compositeSeen.has(compKey)) {
            compositeSeen.set(compKey, p.id);
            papersMap.set(p.id, p);
          } else {
            // If already seen by DB, update in-memory fields if user re-uploaded with newer file
            const existingId = compositeSeen.get(compKey);
            if (existingId && papersMap.has(existingId)) {
              const existingPaper = papersMap.get(existingId)!;
              const pTime = new Date(p.uploadedAt || 0).getTime();
              const existingTime = new Date(existingPaper.uploadedAt || 0).getTime();
              if (pTime > existingTime) {
                existingPaper.filePath = p.filePath;
                existingPaper.fileName = p.fileName;
                existingPaper.fileSizeBytes = p.fileSizeBytes;
                existingPaper.uploadedAt = p.uploadedAt;
              }
            }
          }
        }
      });

      // 3. Fetch all uploaded files from Supabase Storage bucket 'pyq-papers' (only for uncatalogued orphan files)
      try {
        const { data: storageFiles, error: storageErr } = await supabase.storage
          .from('pyq-papers')
          .list();

        if (!storageErr && storageFiles && storageFiles.length > 0) {
          storageFiles.forEach((file) => {
            if (!file.name || !file.name.toLowerCase().endsWith('.pdf')) return;
            if (
              this.deletedStorageKeys.has(file.name) ||
              this.deletedStorageKeys.has(decodeURIComponent(file.name)) ||
              (file.id && this.deletedStorageKeys.has(file.id))
            ) {
              return;
            }

            const publicUrlData = supabase?.storage
              .from('pyq-papers')
              .getPublicUrl(file.name);
            const publicUrl = publicUrlData?.data?.publicUrl || file.name;

            if (this.deletedStorageKeys.has(publicUrl)) return;

            // Check if already accounted for in papersMap
            let alreadyAccounted = false;
            for (const [, p] of papersMap.entries()) {
              if (
                p.filePath === publicUrl ||
                p.filePath.includes(file.name) ||
                p.fileName === file.name
              ) {
                alreadyAccounted = true;
                break;
              }
            }
            if (alreadyAccounted) return;

            // Parse metadata from structured file name
            // Format: ${deptCode}_${semSlug}_${subCode}_${examYear}_${examType}_${timestamp}.pdf
            // or legacy format: ${subCode}_${examYear}_${examType}_${timestamp}.pdf
            const clean = file.name.replace(/\.pdf$/i, '');
            const parts = clean.split('_');
            let deptCode = '';
            let semNumber = 0;
            let subCode = '';
            let examYear = 2025;
            let examType: ExaminationType = 'Regular';

            if (parts.length >= 4) {
              const first = parts[0].toLowerCase();
              const matchedDept = this.departments.find(
                (d) => d.code.toLowerCase() === first || slugify(d.code) === first || d.id === first
              );
              if (matchedDept) {
                deptCode = matchedDept.code;
                const semToken = parts[1].toLowerCase();
                if (semToken.startsWith('sem')) {
                  semNumber = parseInt(semToken.replace('sem', ''), 10) || 0;
                }
                subCode = parts[2].toUpperCase();
                examYear = parseInt(parts[3], 10) || 2025;
                if (parts[4]) {
                  const rawType = parts[4].toLowerCase();
                  if (rawType.includes('back')) examType = 'Back Paper';
                  else if (rawType.includes('carry')) examType = 'Carry Over';
                  else if (rawType.includes('improve')) examType = 'Improvement';
                  else if (rawType.includes('mid')) examType = 'Mid-Term';
                  else if (rawType.includes('end')) examType = 'End-Term';
                  else examType = 'Regular';
                }
              }
            }

            if (!subCode && parts.length >= 1) {
              subCode = parts[0].toUpperCase();
              if (parts.length >= 2) {
                const parsedYear = parseInt(parts[1], 10);
                if (!isNaN(parsedYear) && parsedYear >= 2000) examYear = parsedYear;
              }
              if (parts.length >= 3) {
                const rawType = parts[2].toLowerCase();
                if (rawType.includes('back')) examType = 'Back Paper';
                else if (rawType.includes('carry')) examType = 'Carry Over';
                else if (rawType.includes('improve')) examType = 'Improvement';
                else if (rawType.includes('mid')) examType = 'Mid-Term';
                else if (rawType.includes('end')) examType = 'End-Term';
                else examType = 'Regular';
              }
            }

            const targetDept = deptCode
              ? this.departments.find((d) => d.code.toLowerCase() === deptCode.toLowerCase())
              : null;

            const targetSub = targetDept
              ? this.subjects.find((s) => s.departmentId === targetDept.id && s.subjectCode.toLowerCase() === subCode.toLowerCase())
              : this.subjects.find((s) => s.subjectCode.toLowerCase() === subCode.toLowerCase());

            if (targetSub) {
              const deptId = targetSub.departmentId;
              const semId = targetSub.semesterId;
              const yearId = targetSub.academicYearId || 'year-1';
              const fileSize = (file.metadata as any)?.size || (file as any).size || 256000;

              const paperObj: QuestionPaper = {
                id: file.id || `storage-${file.name}`,
                departmentId: deptId,
                subjectId: targetSub.id,
                academicYearId: yearId,
                semesterId: semId,
                examinationYear: examYear,
                examinationType: examType,
                filePath: publicUrl,
                fileName: file.name,
                fileSizeBytes: fileSize,
                pageCount: 2,
                description: `Examination question paper for ${targetSub.subjectName} (${subCode}).`,
                downloadCount: 0,
                uploadedAt: file.created_at || new Date().toISOString(),
                subjectCode: targetSub.subjectCode,
                subjectName: targetSub.subjectName,
              };

              // Prevent duplicates: verify compositeKey not already registered
              const compKey = getPaperCompositeKey(paperObj);
              if (!compositeSeen.has(compKey)) {
                compositeSeen.set(compKey, paperObj.id);
                papersMap.set(paperObj.id, paperObj);
              } else {
                // If existing record has a placeholder/local path, update it to the live storage URL
                const existingId = compositeSeen.get(compKey);
                if (existingId && papersMap.has(existingId)) {
                  const existingPaper = papersMap.get(existingId)!;
                  if (!existingPaper.filePath.startsWith('http')) {
                    existingPaper.filePath = publicUrl;
                  }
                }
              }
            }
          });
        }
      } catch (storageListErr) {
        console.warn('Supabase storage files sync fallback:', storageListErr);
      }

      this.papers = deduplicateQuestionPapers(Array.from(papersMap.values()));
      this.hydratePaperMetadata();
      this.saveToStorage();
    } catch (err) {
      console.warn('Supabase sync overall fallback:', err);
    }
  }

  // Question Papers
  async getQuestionPapers(filters?: Partial<FilterState>): Promise<QuestionPaper[]> {
    await this.syncWithSupabase();
    this.hydratePaperMetadata();
    if (!filters) return [...this.papers];
    return filterQuestionPapers(this.papers, filters);
  }

  async getQuestionPaperById(id: string): Promise<QuestionPaper | null> {
    await this.syncWithSupabase();
    this.hydratePaperMetadata();
    return this.papers.find((p) => p.id === id) || null;
  }

  async addQuestionPaper(paper: Omit<QuestionPaper, 'id' | 'uploadedAt' | 'downloadCount'>): Promise<QuestionPaper> {
    const resolvedPath = resolvePdfUrl(paper.filePath);
    
    // Lookup target subject to ensure subjectCode and subjectName match
    const targetSub = this.subjects.find((s) => s.id === paper.subjectId);
    const subCode = targetSub?.subjectCode || paper.subjectCode;

    // Canonical composite key for strict idempotency
    const targetCompKey = getPaperCompositeKey({
      departmentId: paper.departmentId,
      semesterId: paper.semesterId,
      subjectId: paper.subjectId,
      subjectCode: subCode,
      examinationYear: paper.examinationYear,
      examinationType: paper.examinationType,
    });

    // Check if an existing paper record exists for this EXACT department, semester, subject, examination year, and examination type
    const existingIndex = this.papers.findIndex((p) => {
      const pSubCode = this.subjects.find((s) => s.id === p.subjectId)?.subjectCode || p.subjectCode;
      return getPaperCompositeKey({
        departmentId: p.departmentId,
        semesterId: p.semesterId,
        subjectId: p.subjectId,
        subjectCode: pSubCode,
        examinationYear: p.examinationYear,
        examinationType: p.examinationType,
      }) === targetCompKey;
    });

    let finalPaper: QuestionPaper;

    if (existingIndex !== -1) {
      // Replace / re-upload: update the existing department paper record in place
      const existing = this.papers[existingIndex];
      finalPaper = {
        ...existing,
        ...paper,
        filePath: resolvedPath,
        id: existing.id,
        uploadedAt: new Date().toISOString(),
        subjectCode: subCode,
        subjectName: targetSub?.subjectName || paper.subjectName,
      };
      this.papers[existingIndex] = finalPaper;
    } else {
      // New paper record uniquely scoped to this department
      finalPaper = {
        ...paper,
        filePath: resolvedPath,
        id: `paper-${Date.now()}`,
        uploadedAt: new Date().toISOString(),
        downloadCount: 0,
        subjectCode: subCode,
        subjectName: targetSub?.subjectName || paper.subjectName,
      };
      this.papers.unshift(finalPaper);
    }

    // Always enforce deduplication in memory
    this.papers = deduplicateQuestionPapers(this.papers);

    // Un-tombstone new keys if this file was re-uploaded
    const newKeys = getStorageKeysForPaper(finalPaper);
    newKeys.forEach((k) => this.deletedStorageKeys.delete(k));
    if (finalPaper.filePath) this.deletedStorageKeys.delete(finalPaper.filePath);
    if (finalPaper.fileName) this.deletedStorageKeys.delete(finalPaper.fileName);
    this.saveDeletedKeys();

    if (isSupabaseConfigured() && supabase) {
      try {
        const payload: Record<string, any> = {
          department_id: finalPaper.departmentId,
          subject_id: finalPaper.subjectId,
          academic_year_id: finalPaper.academicYearId,
          semester_id: finalPaper.semesterId,
          examination_year: finalPaper.examinationYear,
          examination_type: finalPaper.examinationType,
          file_path: resolvedPath,
          file_name: finalPaper.fileName,
          file_size_bytes: finalPaper.fileSizeBytes,
          page_count: finalPaper.pageCount,
          description: finalPaper.description,
          uploaded_at: finalPaper.uploadedAt,
        };

        // Check if record already exists in Supabase by composite tuple
        const { data: existingRows } = await supabase
          .from('question_papers')
          .select('id')
          .eq('department_id', finalPaper.departmentId)
          .eq('semester_id', finalPaper.semesterId)
          .eq('subject_id', finalPaper.subjectId)
          .eq('examination_year', finalPaper.examinationYear)
          .eq('examination_type', finalPaper.examinationType)
          .limit(1);

        if (existingRows && existingRows.length > 0) {
          const existingDbId = existingRows[0].id;
          finalPaper.id = existingDbId;
          const targetIdx = this.papers.findIndex((p) => p === finalPaper || p.id === existingDbId || getPaperCompositeKey(p) === targetCompKey);
          if (targetIdx !== -1) {
            this.papers[targetIdx].id = existingDbId;
          }
          await supabase.from('question_papers').update(payload).eq('id', existingDbId);
        } else {
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(finalPaper.id);
          if (isUuid) payload.id = finalPaper.id;

          const { data: insertedData, error: insertErr } = await supabase
            .from('question_papers')
            .insert(payload)
            .select()
            .single();

          if (insertedData && insertedData.id) {
            finalPaper.id = insertedData.id;
            const targetIdx = this.papers.findIndex((p) => p === finalPaper || getPaperCompositeKey(p) === targetCompKey);
            if (targetIdx !== -1) {
              this.papers[targetIdx].id = insertedData.id;
            }
          }
          if (insertErr) {
            console.warn('Supabase add question paper notice:', insertErr.message);
          }
        }
      } catch (err) {
        console.warn('Supabase add question paper fallback:', err);
      }
    }

    this.papers = deduplicateQuestionPapers(this.papers);
    this.saveToStorage();
    this.hydratePaperMetadata();
    return finalPaper;
  }

  async updateQuestionPaper(id: string, updates: Partial<QuestionPaper>): Promise<QuestionPaper> {
    const index = this.papers.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Paper not found');

    const updated = { ...this.papers[index], ...updates };
    if (updates.filePath) {
      updated.filePath = resolvePdfUrl(updates.filePath);
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        const payload: Record<string, any> = {
          examination_year: updated.examinationYear,
          examination_type: updated.examinationType,
          description: updated.description,
        };
        if (updates.filePath) payload.file_path = updated.filePath;
        if (updates.fileName) payload.file_name = updated.fileName;
        if (updates.fileSizeBytes) payload.file_size_bytes = updated.fileSizeBytes;

        await supabase.from('question_papers').update(payload).eq('id', id);
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
    const target = this.papers.find((p) => p.id === id) || 
                   this.papers.find((p) => p.filePath.includes(id) || p.fileName === id);

    if (!target) {
      console.warn('Target question paper not found for deletion with id:', id);
      return false;
    }

    const candidateStorageKeys = getStorageKeysForPaper(target);

    // 1. Delete corresponding PDF object from Supabase Storage bucket 'pyq-papers'
    if (isSupabaseConfigured() && supabase && candidateStorageKeys.length > 0) {
      try {
        const { data: removeData, error: removeErr } = await supabase.storage
          .from('pyq-papers')
          .remove(candidateStorageKeys);

        if (removeErr) {
          console.error('Supabase storage delete error:', removeErr);
          // Safety requirement: Do not delete database record if Storage deletion fails
          throw new Error(`Storage deletion failed: ${removeErr.message}`);
        } else {
          console.log('Supabase storage removed object(s):', removeData);
        }
      } catch (err: any) {
        console.error('Failed to delete file from Supabase Storage:', err);
        throw err;
      }
    }

    // 2. Delete corresponding database record from 'question_papers' table
    // CRITICAL: MUST strictly isolate by target.departmentId and target.id!
    // NEVER delete across departments with generic unconstrained queries!
    if (isSupabaseConfigured() && supabase) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(target.id);
        if (isUuid) {
          const { error: dbIdErr } = await supabase
            .from('question_papers')
            .delete()
            .eq('id', target.id)
            .eq('department_id', target.departmentId);
          if (dbIdErr) console.warn('Supabase DB delete by id notice:', dbIdErr.message);
        }

        if (target.filePath) {
          const { error: dbPathErr } = await supabase
            .from('question_papers')
            .delete()
            .eq('file_path', target.filePath)
            .eq('department_id', target.departmentId);
          if (dbPathErr) console.warn('Supabase DB delete by file_path notice:', dbPathErr.message);
        }

        if (target.fileName) {
          const { error: dbNameErr } = await supabase
            .from('question_papers')
            .delete()
            .eq('file_name', target.fileName)
            .eq('department_id', target.departmentId);
          if (dbNameErr) console.warn('Supabase DB delete by file_name notice:', dbNameErr.message);
        }
      } catch (dbErr) {
        console.warn('Supabase database paper delete fallback:', dbErr);
      }
    }

    // 3. Register deleted keys so syncWithSupabase won't resurrect them
    candidateStorageKeys.forEach((k) => this.deletedStorageKeys.add(k));
    if (target.filePath) this.deletedStorageKeys.add(target.filePath);
    if (target.fileName) this.deletedStorageKeys.add(target.fileName);
    if (target.id) this.deletedStorageKeys.add(target.id);
    this.saveDeletedKeys();

    // 4. Remove paper from local repository state strictly for this department
    this.papers = this.papers.filter((p) => {
      if (p.id === id || p.id === target.id) return false;
      if (p.departmentId === target.departmentId && (p.filePath === target.filePath || p.fileName === target.fileName)) return false;
      return true;
    });
    this.saveToStorage();
    this.hydratePaperMetadata();

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
