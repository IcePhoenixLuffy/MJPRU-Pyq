import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Layers, 
  BookOpen, 
  Plus, 
  Trash2, 
  Edit3, 
  UploadCloud, 
  Check, 
  Copy, 
  Database, 
  AlertCircle, 
  LogOut, 
  Lock, 
  Eye, 
  GraduationCap,
  FileText
} from 'lucide-react';
import { Department, Subject, QuestionPaper, AcademicYear, Semester, ExaminationType } from '../types';
import { isValidPdfFile, slugify } from '../utils/helpers';
import { SUPABASE_SQL_SETUP, isSupabaseConfigured } from '../lib/supabase';

interface AdminDashboardProps {
  departments: Department[];
  subjects: Subject[];
  papers: QuestionPaper[];
  academicYears: AcademicYear[];
  semesters: Semester[];
  onAddDepartment: (dept: Omit<Department, 'id' | 'createdAt' | 'slug'>) => Promise<Department>;
  onUpdateDepartment: (id: string, updates: Partial<Department>) => Promise<Department>;
  onDeleteDepartment: (id: string) => Promise<boolean>;
  onAddSubject: (subject: Omit<Subject, 'id' | 'createdAt'>) => Promise<Subject>;
  onUpdateSubject: (id: string, updates: Partial<Subject>) => Promise<Subject>;
  onDeleteSubject: (id: string) => Promise<boolean>;
  onAddPaper: (paper: Omit<QuestionPaper, 'id' | 'uploadedAt' | 'downloadCount'>) => Promise<QuestionPaper>;
  onUpdatePaper: (id: string, updates: Partial<QuestionPaper>) => Promise<QuestionPaper>;
  onDeletePaper: (id: string) => Promise<boolean>;
  onResetData: () => void;
  onViewPaper: (paper: QuestionPaper) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  departments,
  subjects,
  papers,
  academicYears,
  semesters,
  onAddDepartment,
  onUpdateDepartment,
  onDeleteDepartment,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
  onAddPaper,
  onDeletePaper,
  onResetData,
  onViewPaper,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [adminEmail, setAdminEmail] = useState('admin@mjpru.ac.in');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [authError, setAuthError] = useState('');

  const [activeTab, setActiveTab] = useState<'overview' | 'departments' | 'subjects' | 'papers' | 'supabase'>('overview');

  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Department Form
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptDescription, setDeptDescription] = useState('');
  const [deptIcon, setDeptIcon] = useState('GraduationCap');

  // Subject Form
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectDeptId, setSubjectDeptId] = useState(departments[0]?.id || '');
  const [subjectSemId, setSubjectSemId] = useState(semesters[0]?.id || '');
  const [subjectCredits, setSubjectCredits] = useState(4);
  const [subjectCategory, setSubjectCategory] = useState<'Theory' | 'Elective' | 'Practical' | 'Project' | 'Seminar' | 'Training'>('Theory');
  const [subjectElectiveGroup, setSubjectElectiveGroup] = useState('');
  const [subjectNote, setSubjectNote] = useState('');
  const [subjectFilterDeptId, setSubjectFilterDeptId] = useState('all');
  const [subjectFilterQuery, setSubjectFilterQuery] = useState('');

  // PYQ Upload Form
  const [paperDeptId, setPaperDeptId] = useState(departments[0]?.id || '');
  const [paperYearId, setPaperYearId] = useState(academicYears[0]?.id || '');
  const [paperSemId, setPaperSemId] = useState(semesters[0]?.id || '');
  const [paperSubjectId, setPaperSubjectId] = useState('');
  const [paperExamYear, setPaperExamYear] = useState<number>(2024);
  const [paperExamType, setPaperExamType] = useState<ExaminationType>('Regular');
  const [paperDescription, setPaperDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // SQL Copy State
  const [copiedSql, setCopiedSql] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminEmail && adminPassword.length >= 6) {
      setIsAuthenticated(true);
      setAuthError('');
      showToast('Logged in successfully as Administrator.');
    } else {
      setAuthError('Please enter valid administrator credentials.');
    }
  };

  const uploadableSubjects = subjects.filter(
    (s) => s.departmentId === paperDeptId && s.semesterId === paperSemId
  );

  const handleDeptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName || !deptCode) {
      showToast('Department name and code are required.', 'error');
      return;
    }

    try {
      if (editingDeptId) {
        await onUpdateDepartment(editingDeptId, {
          name: deptName,
          code: deptCode,
          description: deptDescription,
          iconName: deptIcon,
        });
        showToast(`Department "${deptName}" updated successfully.`);
      } else {
        await onAddDepartment({
          name: deptName,
          code: deptCode,
          description: deptDescription,
          iconName: deptIcon,
        });
        showToast(`New department "${deptName}" created successfully.`);
      }

      setEditingDeptId(null);
      setDeptName('');
      setDeptCode('');
      setDeptDescription('');
    } catch {
      showToast('Failed to save department.', 'error');
    }
  };

  const handleEditDept = (dept: Department) => {
    setEditingDeptId(dept.id);
    setDeptName(dept.name);
    setDeptCode(dept.code);
    setDeptDescription(dept.description);
    setDeptIcon(dept.iconName);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleDeleteDept = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete department "${name}"? This will also remove its associated subjects and papers.`)) {
      await onDeleteDepartment(id);
      showToast(`Department "${name}" deleted.`);
    }
  };

  const handleSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName || !subjectCode) {
      showToast('Subject name and code are required.', 'error');
      return;
    }

    try {
      if (editingSubjectId) {
        await onUpdateSubject(editingSubjectId, {
          subjectName,
          subjectCode,
          departmentId: subjectDeptId,
          semesterId: subjectSemId,
          credits: Number(subjectCredits),
          category: subjectCategory,
          electiveGroup: subjectElectiveGroup || undefined,
          note: subjectNote || undefined,
        });
        showToast(`Subject "${subjectCode}" updated successfully.`);
      } else {
        await onAddSubject({
          subjectName,
          subjectCode,
          departmentId: subjectDeptId,
          semesterId: subjectSemId,
          credits: Number(subjectCredits),
          category: subjectCategory,
          electiveGroup: subjectElectiveGroup || undefined,
          note: subjectNote || undefined,
        });
        showToast(`New subject "${subjectCode}" added successfully.`);
      }

      setEditingSubjectId(null);
      setSubjectName('');
      setSubjectCode('');
      setSubjectElectiveGroup('');
      setSubjectNote('');
    } catch {
      showToast('Failed to save subject.', 'error');
    }
  };

  const handleEditSubject = (sub: Subject) => {
    setEditingSubjectId(sub.id);
    setSubjectName(sub.subjectName);
    setSubjectCode(sub.subjectCode);
    setSubjectDeptId(sub.departmentId);
    setSubjectSemId(sub.semesterId);
    setSubjectCredits(sub.credits || 4);
    setSubjectCategory(sub.category || 'Theory');
    setSubjectElectiveGroup(sub.electiveGroup || '');
    setSubjectNote(sub.note || '');
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleDeleteSubject = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete subject "${name}"?`)) {
      await onDeleteSubject(id);
      showToast(`Subject "${name}" deleted.`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validation = isValidPdfFile(file);
      if (!validation.valid) {
        showToast(validation.error || 'Invalid PDF file.', 'error');
        setSelectedFile(null);
        e.target.value = '';
        return;
      }
      setSelectedFile(file);
    }
  };

  const handlePaperSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paperDeptId || !paperYearId || !paperSemId || !paperSubjectId) {
      showToast('Please select Department, Academic Year, Semester, and Subject.', 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);

    const targetSubject = subjects.find((s) => s.id === paperSubjectId);
    const subCode = targetSubject?.subjectCode || 'BT-000';
    const fileName = selectedFile 
      ? selectedFile.name 
      : `MJPRU_${subCode}_${paperExamYear}_${paperExamType}.pdf`;

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 25;
      });
    }, 150);

    setTimeout(async () => {
      clearInterval(interval);
      setUploadProgress(100);

      try {
        await onAddPaper({
          departmentId: paperDeptId,
          academicYearId: paperYearId,
          semesterId: paperSemId,
          subjectId: paperSubjectId,
          examinationYear: Number(paperExamYear),
          examinationType: paperExamType,
          filePath: `/papers/${slugify(fileName)}`,
          fileName,
          fileSizeBytes: selectedFile ? selectedFile.size : 256000,
          pageCount: 2,
          description: paperDescription || `Official university question paper for ${subCode}.`,
        });

        setIsUploading(false);
        setUploadProgress(0);
        setSelectedFile(null);
        setPaperDescription('');
        showToast(`Question Paper for ${subCode} (${paperExamYear}) uploaded successfully.`);
      } catch {
        setIsUploading(false);
        showToast('Failed to upload question paper.', 'error');
      }
    }, 700);
  };

  const handleDeletePaper = async (id: string, name: string) => {
    if (window.confirm(`Delete question paper "${name}"?`)) {
      await onDeletePaper(id);
      showToast(`Question paper deleted.`);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
    showToast('Supabase SQL schema copied to clipboard!');
  };

  // -------------------------------------------------------------
  // LOGIN SCREEN (LIGHT GRADIENT THEME)
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="p-0.5 rounded-3xl bg-gradient-to-br from-[#8bf0ba] via-[#94f0f1] to-[#f2b1d8] shadow-xl">
          <div className="bg-white/95 backdrop-blur-md rounded-[22px] p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#94f0f1]/30 via-[#8bf0ba]/30 to-[#f2b1d8]/30 text-[#0e0fed] flex items-center justify-center mx-auto border border-blue-200/80 shadow-sm">
                <Lock className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-black text-slate-900">Administrator Access</h1>
              <p className="text-xs text-slate-600 font-medium">
                Sign in to manage departments, subjects, and upload question paper PDFs.
              </p>
            </div>

            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Admin Email</label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@mjpru.ac.in"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#0e0fed] focus:ring-2 focus:ring-[#0e0fed]/20 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Password</label>
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#0e0fed] focus:ring-2 focus:ring-[#0e0fed]/20 font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-[#0e0fed] to-[#2563eb] text-white font-extrabold text-xs rounded-xl hover:opacity-95 transition-all shadow-md active:scale-95 magnetic-target"
                data-magnetic="true"
              >
                Sign In to Admin Portal
              </button>
            </form>

            <div className="pt-2 border-t border-slate-100 text-center">
              <span className="text-[11px] text-slate-500 font-semibold">
                Default credentials pre-filled for university demo access.
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // AUTHENTICATED DASHBOARD (LIGHT THEME)
  // -------------------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2 animate-in slide-in-from-right duration-200 ${
          toastMessage.type === 'error'
            ? 'bg-red-50 border-red-200 text-red-700'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          {toastMessage.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Header & Logout */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-white/95 via-[#94f0f1]/25 to-[#f2b1d8]/30 border border-white/70 shadow-sm backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-[#0e0fed]">
              Administrative Console
            </span>
            <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border font-bold ${
              isSupabaseConfigured()
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-amber-50 text-amber-700 border-amber-300'
            }`}>
              {isSupabaseConfigured() ? '● Supabase Connected' : '○ Local Storage Engine'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            MJPRU PYQ <span className="gradient-text-primary">Management System</span>
          </h1>
          <p className="text-xs text-slate-600 mt-1 font-semibold">
            Logged in as <span className="text-[#0e0fed] font-mono font-bold">{adminEmail}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onResetData}
            className="px-3.5 py-2 bg-white/90 border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-extrabold transition-all shadow-2xs magnetic-target active:scale-95"
            title="Restore sample university data"
            data-magnetic="true"
          >
            Reset Sample Data
          </button>

          <button
            onClick={() => setIsAuthenticated(false)}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-50 border border-red-200 hover:bg-red-100 text-red-700 rounded-xl text-xs font-extrabold transition-all magnetic-target active:scale-95"
            data-magnetic="true"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Admin Sub-navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl text-xs font-black shadow-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all magnetic-target ${
            activeTab === 'overview'
              ? 'bg-gradient-to-r from-[#0e0fed] to-[#2563eb] text-white shadow-md'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
          }`}
          data-magnetic="true"
        >
          <Layers className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('departments')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all magnetic-target ${
            activeTab === 'departments'
              ? 'bg-gradient-to-r from-[#0e0fed] to-[#2563eb] text-white shadow-md'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
          }`}
          data-magnetic="true"
        >
          <GraduationCap className="w-4 h-4" />
          <span>Departments ({departments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('subjects')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all magnetic-target ${
            activeTab === 'subjects'
              ? 'bg-gradient-to-r from-[#0e0fed] to-[#2563eb] text-white shadow-md'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
          }`}
          data-magnetic="true"
        >
          <BookOpen className="w-4 h-4" />
          <span>Subjects ({subjects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('papers')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all magnetic-target ${
            activeTab === 'papers'
              ? 'bg-gradient-to-r from-[#0e0fed] to-[#2563eb] text-white shadow-md'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
          }`}
          data-magnetic="true"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload &amp; Manage Papers ({papers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('supabase')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all magnetic-target ${
            activeTab === 'supabase'
              ? 'bg-gradient-to-r from-[#0e0fed] to-[#2563eb] text-white shadow-md'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
          }`}
          data-magnetic="true"
        >
          <Database className="w-4 h-4" />
          <span>Supabase &amp; SQL Setup</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 1. OVERVIEW TAB */}
      {/* ========================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="relative overflow-hidden p-6 bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-sm hover:shadow-md transition-all">
              <div className="h-1.5 w-full bg-gradient-to-r from-[#8bf0ba] to-[#94f0f1] absolute top-0 left-0" />
              <div className="text-xs text-slate-500 font-extrabold uppercase">Departments</div>
              <div className="text-3xl font-black text-slate-900 mt-1 font-mono">{departments.length}</div>
              <div className="text-xs text-emerald-700 font-bold mt-2">Dynamic branches supported</div>
            </div>

            <div className="relative overflow-hidden p-6 bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-sm hover:shadow-md transition-all">
              <div className="h-1.5 w-full bg-gradient-to-r from-[#94f0f1] to-[#0e0fed] absolute top-0 left-0" />
              <div className="text-xs text-slate-500 font-extrabold uppercase">Subjects</div>
              <div className="text-3xl font-black text-slate-900 mt-1 font-mono">{subjects.length}</div>
              <div className="text-xs text-[#0e0fed] font-bold mt-2">Across Semesters 1 to 8</div>
            </div>

            <div className="relative overflow-hidden p-6 bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-sm hover:shadow-md transition-all">
              <div className="h-1.5 w-full bg-gradient-to-r from-[#f2b1d8] to-[#ffdc6a] absolute top-0 left-0" />
              <div className="text-xs text-slate-500 font-extrabold uppercase">Question Papers</div>
              <div className="text-3xl font-black text-slate-900 mt-1 font-mono">{papers.length}</div>
              <div className="text-xs text-pink-700 font-bold mt-2">Active in digital catalog</div>
            </div>

            <div className="relative overflow-hidden p-6 bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-sm hover:shadow-md transition-all">
              <div className="h-1.5 w-full bg-gradient-to-r from-[#8bf0ba] to-[#ffdc6a] absolute top-0 left-0" />
              <div className="text-xs text-slate-500 font-extrabold uppercase">Total Downloads</div>
              <div className="text-3xl font-black text-slate-900 mt-1 font-mono">
                {papers.reduce((sum, p) => sum + p.downloadCount, 0)}
              </div>
              <div className="text-xs text-amber-700 font-bold mt-2">Student paper retrievals</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div 
              onClick={() => setActiveTab('papers')} 
              className="p-6 bg-white border border-slate-200/90 rounded-3xl hover:border-[#0e0fed] cursor-pointer transition-all space-y-3 shadow-xs hover:shadow-lg magnetic-target"
              data-magnetic="true"
            >
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl w-fit">
                <UploadCloud className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Upload Question Paper</h3>
              <p className="text-xs text-slate-600">
                Add an official PDF examination paper with branch, semester, course code, and exam type.
              </p>
            </div>

            <div 
              onClick={() => setActiveTab('departments')} 
              className="p-6 bg-white border border-slate-200/90 rounded-3xl hover:border-[#0e0fed] cursor-pointer transition-all space-y-3 shadow-xs hover:shadow-lg magnetic-target"
              data-magnetic="true"
            >
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl w-fit">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Add New Department</h3>
              <p className="text-xs text-slate-600">
                Scale the platform beyond B.Tech with new academic faculties and engineering disciplines.
              </p>
            </div>

            <div 
              onClick={() => setActiveTab('supabase')} 
              className="p-6 bg-white border border-slate-200/90 rounded-3xl hover:border-[#0e0fed] cursor-pointer transition-all space-y-3 shadow-xs hover:shadow-lg magnetic-target"
              data-magnetic="true"
            >
              <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl w-fit">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Supabase SQL Editor</h3>
              <p className="text-xs text-slate-600">
                View database schema, RLS policies, and Storage bucket scripts to run in your Supabase project.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. DEPARTMENTS TAB */}
      {/* ========================================================= */}
      {activeTab === 'departments' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
              <span>{editingDeptId ? 'Edit Department' : 'Add New Department'}</span>
              {editingDeptId && (
                <button
                  onClick={() => {
                    setEditingDeptId(null);
                    setDeptName('');
                    setDeptCode('');
                    setDeptDescription('');
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
              )}
            </h2>

            <form onSubmit={handleDeptSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Department Name</label>
                <input
                  type="text"
                  required
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  placeholder="e.g. Artificial Intelligence & Data Science"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#0e0fed]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Department Code / Acronym</label>
                <input
                  type="text"
                  required
                  value={deptCode}
                  onChange={(e) => setDeptCode(e.target.value.toUpperCase())}
                  placeholder="e.g. AIDS"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:outline-none focus:border-[#0e0fed]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Description</label>
                <textarea
                  rows={3}
                  value={deptDescription}
                  onChange={(e) => setDeptDescription(e.target.value)}
                  placeholder="Overview of branch curriculum, specialized domains..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#0e0fed]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Icon Type</label>
                <select
                  value={deptIcon}
                  onChange={(e) => setDeptIcon(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#0e0fed]"
                >
                  <option value="Laptop">Laptop / Software</option>
                  <option value="Brain">Brain / AI &amp; ML</option>
                  <option value="Radio">Radio / Communication</option>
                  <option value="Zap">Zap / Electrical</option>
                  <option value="Cog">Cog / Mechanical</option>
                  <option value="FlaskConical">Flask / Chemical</option>
                  <option value="Gauge">Gauge / Instrumentation</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#0e0fed] text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition-all shadow-sm magnetic-target"
                data-magnetic="true"
              >
                {editingDeptId ? 'Save Department Changes' : 'Create Department'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Configured Departments ({departments.length})
            </h2>

            <div className="space-y-2.5">
              {departments.map((dept) => {
                const subCount = subjects.filter((s) => s.departmentId === dept.id).length;
                const paperCount = papers.filter((p) => p.departmentId === dept.id).length;

                return (
                  <div
                    key={dept.id}
                    className="p-4 bg-white border border-slate-200/90 rounded-2xl flex items-center justify-between gap-4 shadow-2xs"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-[#0e0fed] border border-blue-100">
                          {dept.code}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 truncate">{dept.name}</h3>
                      </div>
                      <div className="text-xs text-slate-500 font-medium">
                        {subCount} subjects &bull; {paperCount} question papers
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleEditDept(dept)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors magnetic-target"
                        title="Edit Department"
                        data-magnetic="true"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteDept(dept.id, dept.name)}
                        className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors magnetic-target"
                        title="Delete Department"
                        data-magnetic="true"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. SUBJECTS TAB */}
      {/* ========================================================= */}
      {activeTab === 'subjects' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
              <span>{editingSubjectId ? 'Edit Subject' : 'Add Subject'}</span>
              {editingSubjectId && (
                <button
                  onClick={() => {
                    setEditingSubjectId(null);
                    setSubjectName('');
                    setSubjectCode('');
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
              )}
            </h2>

            <form onSubmit={handleSubjectSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Department</label>
                <select
                  value={subjectDeptId}
                  onChange={(e) => setSubjectDeptId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#0e0fed]"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.code} - {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Semester</label>
                <select
                  value={subjectSemId}
                  onChange={(e) => setSubjectSemId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#0e0fed]"
                >
                  {semesters.map((s) => (
                    <option key={s.id} value={s.id}>
                      Semester {s.semesterNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Subject Name</label>
                <input
                  type="text"
                  required
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="e.g. Distributed Database Management"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#0e0fed]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Course / Subject Code</label>
                <input
                  type="text"
                  required
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value.toUpperCase())}
                  placeholder="e.g. BCS-501"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:outline-none focus:border-[#0e0fed]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Category</label>
                  <select
                    value={subjectCategory}
                    onChange={(e) => setSubjectCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#0e0fed]"
                  >
                    <option value="Theory">Theory Course</option>
                    <option value="Elective">Elective Option</option>
                    <option value="Practical">Practical / Lab</option>
                    <option value="Project">Major Project</option>
                    <option value="Training">Industrial Training</option>
                    <option value="Seminar">Seminar</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Credits</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={subjectCredits}
                    onChange={(e) => setSubjectCredits(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#0e0fed]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Elective Group (Optional)</label>
                  {subjectElectiveGroup && (
                    <button
                      type="button"
                      onClick={() => setSubjectElectiveGroup('')}
                      className="text-[10px] text-slate-400 hover:text-slate-600"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={subjectElectiveGroup}
                  onChange={(e) => setSubjectElectiveGroup(e.target.value)}
                  placeholder="e.g. Pool Elective, Open Elective, Department Elective-I"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#0e0fed]"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['Elective-I', 'Elective-II', 'Elective-III', 'Elective-IV', 'Elective-V', 'Departmental Elective-I', 'Departmental Elective-II', 'Departmental Elective-III', 'Departmental Elective-IV', 'Pool Elective', 'Open Elective'].map((group) => (
                    <button
                      key={group}
                      type="button"
                      onClick={() => {
                        setSubjectElectiveGroup(group);
                        if (subjectCategory === 'Theory') setSubjectCategory('Elective');
                      }}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-colors ${
                        subjectElectiveGroup === group
                          ? 'bg-[#0e0fed] text-white border-[#0e0fed]'
                          : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200'
                      }`}
                    >
                      + {group}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Guidance / Note (Optional)</label>
                <input
                  type="text"
                  value={subjectNote}
                  onChange={(e) => setSubjectNote(e.target.value)}
                  placeholder="e.g. Decided in consultation with faculty member"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#0e0fed]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-[#0e0fed] to-[#2563eb] text-white font-bold text-xs rounded-xl hover:opacity-95 transition-all shadow-sm magnetic-target"
                data-magnetic="true"
              >
                {editingSubjectId ? 'Save Subject Changes' : 'Create Subject'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Active Subjects ({subjects.length})
              </h2>

              <div className="flex items-center gap-2">
                <select
                  value={subjectFilterDeptId}
                  onChange={(e) => setSubjectFilterDeptId(e.target.value)}
                  className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
                >
                  <option value="all">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.code}</option>
                  ))}
                </select>

                <input
                  type="text"
                  value={subjectFilterQuery}
                  onChange={(e) => setSubjectFilterQuery(e.target.value)}
                  placeholder="Search code or name..."
                  className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none w-36"
                />
              </div>
            </div>

            <div className="max-h-[600px] overflow-y-auto space-y-2.5 pr-1">
              {subjects
                .filter((sub) => {
                  if (subjectFilterDeptId !== 'all' && sub.departmentId !== subjectFilterDeptId) return false;
                  if (subjectFilterQuery) {
                    const q = subjectFilterQuery.toLowerCase();
                    return sub.subjectCode.toLowerCase().includes(q) || sub.subjectName.toLowerCase().includes(q);
                  }
                  return true;
                })
                .map((sub) => {
                const dept = departments.find((d) => d.id === sub.departmentId);
                const sem = semesters.find((s) => s.id === sub.semesterId);

                return (
                  <div
                    key={sub.id}
                    className="p-3.5 bg-white border border-slate-200/90 rounded-2xl flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-[#0e0fed] border border-blue-100">
                          {sub.subjectCode}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 truncate">{sub.subjectName}</h4>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                          {sub.category || 'Theory'}
                        </span>
                        {sub.electiveGroup && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-100">
                            {sub.electiveGroup}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {dept?.code} &bull; Sem {sem?.semesterNumber} &bull; {sub.credits || 4} Credits
                        {sub.note && ` • Note: ${sub.note}`}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleEditSubject(sub)}
                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors magnetic-target"
                        title="Edit Subject"
                        data-magnetic="true"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteSubject(sub.id, sub.subjectName)}
                        className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors magnetic-target"
                        title="Delete Subject"
                        data-magnetic="true"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. PYQ PAPER UPLOAD TAB */}
      {/* ========================================================= */}
      {activeTab === 'papers' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-[#0e0fed]" />
              <span>Upload PDF Question Paper</span>
            </h2>

            <form onSubmit={handlePaperSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Question Paper PDF Document</label>
                <div className="border-2 border-dashed border-slate-300 hover:border-[#0e0fed] rounded-2xl p-5 text-center cursor-pointer transition-colors bg-slate-50">
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="paper-file-input"
                  />
                  <label htmlFor="paper-file-input" className="cursor-pointer block space-y-1.5">
                    <FileText className="w-8 h-8 text-[#0e0fed] mx-auto" />
                    <div className="text-xs font-bold text-slate-800">
                      {selectedFile ? selectedFile.name : 'Click to select or drop PDF file'}
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Accepts .pdf format only (Max 25 MB)
                    </p>
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Department</label>
                <select
                  value={paperDeptId}
                  onChange={(e) => setPaperDeptId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#0e0fed]"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.code} - {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Academic Year</label>
                  <select
                    value={paperYearId}
                    onChange={(e) => setPaperYearId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#0e0fed]"
                  >
                    {academicYears.map((y) => (
                      <option key={y.id} value={y.id}>
                        {y.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Semester</label>
                  <select
                    value={paperSemId}
                    onChange={(e) => setPaperSemId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#0e0fed]"
                  >
                    {semesters.map((s) => (
                      <option key={s.id} value={s.id}>
                        Semester {s.semesterNumber}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Subject</label>
                <select
                  required
                  value={paperSubjectId}
                  onChange={(e) => setPaperSubjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#0e0fed]"
                >
                  <option value="">-- Choose Subject ({uploadableSubjects.length} available) --</option>
                  {uploadableSubjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.subjectCode} - {s.subjectName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Exam Year</label>
                  <select
                    value={paperExamYear}
                    onChange={(e) => setPaperExamYear(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#0e0fed]"
                  >
                    {[2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018].map((yr) => (
                      <option key={yr} value={yr}>
                        Year {yr}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Exam Type</label>
                  <select
                    value={paperExamType}
                    onChange={(e) => setPaperExamType(e.target.value as ExaminationType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#0e0fed]"
                  >
                    <option value="Regular">Regular</option>
                    <option value="Back Paper">Back Paper</option>
                    <option value="Carry Over">Carry Over</option>
                    <option value="Improvement">Improvement</option>
                    <option value="Mid-Term">Mid-Term</option>
                    <option value="End-Term">End-Term</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Notes / Optional Description</label>
                <input
                  type="text"
                  value={paperDescription}
                  onChange={(e) => setPaperDescription(e.target.value)}
                  placeholder="e.g. End Semester Regular Examination with answer key notes"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#0e0fed]"
                />
              </div>

              {isUploading && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs text-slate-600 font-bold">
                    <span>Uploading and verifying PDF...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-200" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isUploading}
                className="w-full py-3 bg-[#0e0fed] disabled:opacity-50 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition-all shadow-sm magnetic-target"
                data-magnetic="true"
              >
                {isUploading ? 'Uploading to Repository...' : 'Upload Question Paper'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Uploaded Question Papers ({papers.length})
            </h2>

            <div className="max-h-[650px] overflow-y-auto space-y-2.5 pr-1">
              {papers.map((paper) => (
                <div
                  key={paper.id}
                  className="p-3.5 bg-white border border-slate-200/90 rounded-2xl flex items-center justify-between gap-3 text-xs shadow-2xs"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#0e0fed]">{paper.subjectCode}</span>
                      <span className="font-bold text-slate-900 truncate">{paper.subjectName}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {paper.departmentName} &bull; Sem {paper.semesterNumber} &bull; {paper.examinationYear} ({paper.examinationType})
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onViewPaper(paper)}
                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors magnetic-target"
                      title="Preview PDF"
                      data-magnetic="true"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeletePaper(paper.id, paper.subjectName || '')}
                      className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors magnetic-target"
                      title="Delete Question Paper"
                      data-magnetic="true"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. SUPABASE & SQL CONFIGURATION TAB */}
      {/* ========================================================= */}
      {activeTab === 'supabase' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Database className="w-5 h-5 text-[#0e0fed]" />
                  <span>Supabase Backend Integration &amp; SQL Schema</span>
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Connect your live Supabase project for PostgreSQL persistence, auth, and cloud PDF storage.
                </p>
              </div>

              <button
                onClick={handleCopySql}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0e0fed] text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition-all shadow-sm magnetic-target"
                data-magnetic="true"
              >
                {copiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSql ? 'SQL Copied!' : 'Copy SQL Script'}</span>
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
              <div className="font-bold text-slate-900">How to Connect Supabase:</div>
              <ol className="list-decimal list-inside space-y-1 text-slate-600">
                <li>Create a free project on <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-[#0e0fed] font-bold hover:underline">Supabase.com</a>.</li>
                <li>Go to <strong>Project Settings &rarr; API</strong> and copy your Project URL and anon public key.</li>
                <li>Set them in your environment variables:
                  <code className="block bg-white border border-slate-200 p-2.5 rounded-xl text-slate-800 font-mono mt-1 shadow-2xs">
                    VITE_SUPABASE_URL=https://your-project.supabase.co<br />
                    VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
                  </code>
                </li>
                <li>Go to the <strong>SQL Editor</strong> in Supabase, paste the script below, and run it.</li>
              </ol>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
                <span>Migration Script (Tables, Indexes, RLS Policies, Storage)</span>
                <span className="font-mono text-[11px]">PostgreSQL 15+</span>
              </div>
              <pre className="p-4 bg-slate-900 text-slate-100 rounded-2xl text-xs font-mono overflow-x-auto max-h-96 shadow-inner">
                {SUPABASE_SQL_SETUP}
              </pre>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
