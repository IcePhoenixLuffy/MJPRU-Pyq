export interface Department {
  id: string;
  name: string;
  slug: string;
  code: string;
  description: string;
  iconName: string;
  createdAt: string;
}

export interface AcademicYear {
  id: string;
  name: string;
  yearNumber: number; // 1, 2, 3, 4
}

export interface Semester {
  id: string;
  semesterNumber: number; // 1 to 8
  academicYearId: string;
  name: string;
}

export interface Subject {
  id: string;
  departmentId: string;
  semesterId: string;
  academicYearId?: string;
  subjectName: string;
  subjectCode: string;
  paperCode?: string;
  credits?: number;
  category?: 'Theory' | 'Elective' | 'Practical' | 'Project' | 'Seminar' | 'Training';
  electiveGroup?: string;
  note?: string;
  createdAt: string;
}

export type ExaminationType = 
  | 'Regular'
  | 'Back Paper'
  | 'Carry Over'
  | 'Improvement'
  | 'Mid-Term'
  | 'End-Term';

export interface QuestionPaper {
  id: string;
  departmentId: string;
  subjectId: string;
  academicYearId: string;
  semesterId: string;
  examinationYear: number;
  examinationType: ExaminationType;
  filePath: string;
  fileName: string;
  fileSizeBytes: number;
  pageCount: number;
  description?: string;
  uploadedAt: string;
  downloadCount: number;
  paperCode?: string;
  // Joined / Denormalized fields for UI convenience
  departmentName?: string;
  subjectName?: string;
  subjectCode?: string;
  semesterNumber?: number;
  academicYearName?: string;
}

export interface FilterState {
  departmentId: string;
  academicYearId: string;
  semesterId: string;
  subjectId: string;
  examinationYear: string;
  examinationType: string;
  searchQuery: string;
  sortBy: 'newest' | 'oldest' | 'downloads' | 'year_desc';
}

export interface SystemStatistics {
  totalDepartments: number;
  totalSubjects: number;
  totalQuestionPapers: number;
  latestUploadsCount: number;
}
