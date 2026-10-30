import React, { useState } from 'react';
import { 
  GraduationCap, 
  ArrowRight, 
  Search, 
  ChevronRight, 
  Laptop,
  Brain,
  Radio,
  Zap,
  Cog,
  FlaskConical,
  Gauge,
  BookOpen,
  FileText,
  Calendar,
  Layers,
  Download,
  Eye,
  CheckCircle2,
  X,
  Info,
  Clock
} from 'lucide-react';
import { Department, QuestionPaper, Subject, AcademicYear, Semester } from '../types';
import { formatBytes } from '../utils/helpers';

interface DepartmentsPageProps {
  departments: Department[];
  subjects: Subject[];
  papers: QuestionPaper[];
  academicYears: AcademicYear[];
  semesters: Semester[];
  onSelectDepartmentForLibrary: (deptId: string) => void;
  onViewPaper: (paper: QuestionPaper) => void;
  onDownloadPaper?: (paper: QuestionPaper) => void;
}

const getDeptIcon = (iconName: string) => {
  switch (iconName) {
    case 'Laptop': return <Laptop className="w-6 h-6 text-[#0e0fed]" />;
    case 'Brain': return <Brain className="w-6 h-6 text-[#0284c7]" />;
    case 'Radio': return <Radio className="w-6 h-6 text-pink-600" />;
    case 'Zap': return <Zap className="w-6 h-6 text-amber-600" />;
    case 'Cog': return <Cog className="w-6 h-6 text-emerald-600" />;
    case 'FlaskConical': return <FlaskConical className="w-6 h-6 text-cyan-700" />;
    case 'Gauge': return <Gauge className="w-6 h-6 text-indigo-600" />;
    default: return <GraduationCap className="w-6 h-6 text-[#0e0fed]" />;
  }
};

export const DepartmentsPage: React.FC<DepartmentsPageProps> = ({
  departments,
  subjects,
  papers,
  academicYears,
  semesters,
  onSelectDepartmentForLibrary,
  onViewPaper,
  onDownloadPaper,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(
    // Default to Electrical Engineering if available, else first
    departments.find((d) => d.code === 'EE')?.id || departments[0]?.id || null
  );

  // Electrical Engineering specific navigation states
  const [selectedYearId, setSelectedYearId] = useState<string>('all'); // 'all', 'year-1', 'year-2', 'year-3', 'year-4'
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>('all'); // 'all', 'sem-1' ... 'sem-8'
  const [activeSubjectModal, setActiveSubjectModal] = useState<Subject | null>(null);
  const [subjectExamYearFilter, setSubjectExamYearFilter] = useState<string>('all');

  const filteredDepts = departments.filter((d) => {
    const q = searchQuery.toLowerCase();
    return d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q) || d.description.toLowerCase().includes(q);
  });

  const activeDept = departments.find((d) => d.id === selectedDeptId) || departments[0];
  const isElectrical = activeDept?.code === 'EE' || activeDept?.slug?.includes('electrical');

  const activeDeptSubjects = subjects.filter((s) => s.departmentId === activeDept?.id);
  const activeDeptPapers = papers.filter((p) => p.departmentId === activeDept?.id);

  // Electrical Engineering semester-wise filtering
  const visibleSemesters = semesters.filter((sem) => {
    if (selectedYearId === 'all') return true;
    return sem.academicYearId === selectedYearId;
  });

  const getSubjectsForSemester = (semId: string) => {
    return activeDeptSubjects.filter((s) => s.semesterId === semId);
  };

  const getPapersForSemester = (semId: string) => {
    return activeDeptPapers.filter((p) => p.semesterId === semId);
  };

  const getPapersForSubject = (subId: string) => {
    return activeDeptPapers.filter((p) => p.subjectId === subId);
  };

  const filteredSubjectPapers = activeSubjectModal
    ? getPapersForSubject(activeSubjectModal.id).filter((p) => {
        if (subjectExamYearFilter === 'all') return true;
        return p.examinationYear.toString() === subjectExamYearFilter;
      })
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header with gradient badge */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-[#8bf0ba]/40 to-[#94f0f1]/60 border border-emerald-300 text-xs font-extrabold text-[#0e0fed] shadow-2xs">
          Academic Faculties
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          B.Tech Engineering <span className="gradient-text-vibrant">Departments</span>
        </h1>
        <p className="text-sm text-slate-700 font-medium max-w-2xl leading-relaxed">
          M.J.P. Rohilkhand University offers premier 4-year undergraduate B.Tech degree programs. Select any department below to explore year-wise course subjects, curriculum schemes, and archived previous year question papers.
        </p>
      </div>

      {/* Search Departments */}
      <div className="max-w-md">
        <div className="relative p-0.5 rounded-2xl bg-gradient-to-r from-[#8bf0ba] via-[#94f0f1] to-[#f2b1d8] shadow-xs">
          <div className="relative bg-white/95 rounded-[14px]">
            <Search className="w-4 h-4 text-[#0e0fed] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter departments by name or code..."
              className="w-full pl-10 pr-4 py-2.5 bg-transparent rounded-xl text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none font-medium"
            />
          </div>
        </div>
      </div>

      {/* Main 2-Column Department Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Department List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-black uppercase tracking-wider text-slate-700 px-1">
            Available Departments ({filteredDepts.length})
          </div>

          <div className="space-y-2.5">
            {filteredDepts.map((dept, idx) => {
              const isSelected = dept.id === activeDept?.id;
              const deptPaperCount = papers.filter((p) => p.departmentId === dept.id).length;
              const deptSubjectCount = subjects.filter((s) => s.departmentId === dept.id).length;

              const gradientAccent = idx % 3 === 0 
                ? 'from-[#8bf0ba]/40 to-[#94f0f1]/40' 
                : idx % 3 === 1 
                  ? 'from-[#94f0f1]/40 to-[#0e0fed]/20' 
                  : 'from-[#f2b1d8]/40 to-[#ffdc6a]/40';

              return (
                <button
                  key={dept.id}
                  onClick={() => {
                    setSelectedDeptId(dept.id);
                    setSelectedYearId('all');
                    setSelectedSemesterId('all');
                  }}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 magnetic-target relative overflow-hidden ${
                    isSelected
                      ? 'bg-gradient-to-r from-blue-50/95 via-cyan-50/90 to-emerald-50/80 border-[#0e0fed] shadow-md ring-2 ring-[#0e0fed]/25'
                      : 'bg-white/90 backdrop-blur-md border-slate-200/90 hover:border-slate-300 hover:bg-white shadow-2xs'
                  }`}
                  data-magnetic="true"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`p-2.5 rounded-xl border bg-gradient-to-tr ${gradientAccent} border-slate-200 shadow-2xs shrink-0`}>
                      {getDeptIcon(dept.iconName)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono text-[11px] font-black px-2 py-0.5 rounded-md border ${
                          dept.code === 'EE'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-slate-100 text-slate-800 border-slate-200'
                        }`}>
                          {dept.code}
                        </span>
                        <h3 className={`text-sm font-black truncate ${
                          isSelected ? 'text-[#0e0fed]' : 'text-slate-900'
                        }`}>
                          {dept.name}
                        </h3>
                      </div>
                      <div className="text-xs text-slate-600 mt-1 font-semibold flex items-center gap-1.5">
                        <span>{deptSubjectCount} Subjects</span>
                        <span>&bull;</span>
                        <span>{deptPaperCount} PYQs</span>
                      </div>
                    </div>
                  </div>

                  <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${
                    isSelected ? 'text-[#0e0fed] translate-x-1.5' : 'text-slate-400'
                  }`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Department View */}
        <div className="lg:col-span-8">
          {activeDept ? (
            <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm relative overflow-hidden">
              
              {/* Decorative top ribbon */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#8bf0ba] via-[#94f0f1] via-[#0e0fed] via-[#f2b1d8] to-[#ffdc6a]" />

              {/* Department Header */}
              <div className="border-b border-slate-100 pb-6 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-[#94f0f1]/30 to-[#8bf0ba]/40 border border-cyan-200 shadow-2xs">
                      {getDeptIcon(activeDept.iconName)}
                    </div>
                    <div>
                      <div className="text-xs font-mono font-black text-[#0e0fed]">
                        B.Tech Program &bull; {activeDept.code}
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                        {activeDept.name}
                      </h2>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectDepartmentForLibrary(activeDept.id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#0e0fed] to-[#2563eb] text-white font-black text-xs hover:opacity-95 transition-all shadow-md active:scale-95 magnetic-target"
                    data-magnetic="true"
                  >
                    <span>Browse All {activeDept.code} Papers</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium pt-1">
                  {activeDept.description}
                </p>
              </div>

              {/* ========================================================================= */}
              {/* ELECTRICAL ENGINEERING: SEMESTER-WISE BROWSING STRUCTURE */}
              {/* ========================================================================= */}
              {isElectrical ? (
                <div className="space-y-6">
                  
                  {/* Step Navigation Breadcrumb Bar */}
                  <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-purple-50/80 border border-blue-200/80 rounded-2xl p-3 sm:p-4 shadow-2xs">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs font-bold text-slate-600">
                      <span className="flex items-center gap-1 text-[#0e0fed] font-extrabold">
                        <Zap className="w-3.5 h-3.5" />
                        <span>Electrical Engineering</span>
                      </span>
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                      <span className={selectedYearId !== 'all' ? 'text-[#0e0fed] font-extrabold' : 'text-slate-600'}>
                        {selectedYearId === 'all' ? 'Academic Year' : academicYears.find((y) => y.id === selectedYearId)?.name}
                      </span>
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                      <span className={selectedSemesterId !== 'all' ? 'text-[#0e0fed] font-extrabold' : 'text-slate-600'}>
                        {selectedSemesterId === 'all' ? 'Semester' : semesters.find((s) => s.id === selectedSemesterId)?.name}
                      </span>
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                      <span className="text-slate-500">
                        Theory &amp; Electives
                      </span>
                    </div>
                  </div>

                  {/* Academic Year Filter Selector */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                        1. Select Academic Year
                      </span>
                      <span className="text-xs text-slate-500 font-semibold">
                        4-Year Undergraduate Program
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      <button
                        onClick={() => {
                          setSelectedYearId('all');
                          setSelectedSemesterId('all');
                        }}
                        className={`p-2.5 rounded-xl text-xs font-black transition-all border magnetic-target text-center ${
                          selectedYearId === 'all'
                            ? 'bg-[#0e0fed] text-white border-[#0e0fed] shadow-sm'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                        data-magnetic="true"
                      >
                        All Years (1st - 4th)
                      </button>

                      {academicYears.map((yr) => {
                        const isYearActive = selectedYearId === yr.id;
                        const yrSemNumbers = yr.yearNumber === 1 ? 'Sem 1 & 2' : yr.yearNumber === 2 ? 'Sem 3 & 4' : yr.yearNumber === 3 ? 'Sem 5 & 6' : 'Sem 7 & 8';

                        return (
                          <button
                            key={yr.id}
                            onClick={() => {
                              setSelectedYearId(yr.id);
                              setSelectedSemesterId('all');
                            }}
                            className={`p-2.5 rounded-xl text-xs font-black transition-all border magnetic-target text-center flex flex-col items-center justify-center ${
                              isYearActive
                                ? 'bg-gradient-to-r from-[#0e0fed] to-[#2563eb] text-white border-[#0e0fed] shadow-sm'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                            data-magnetic="true"
                          >
                            <span>{yr.name}</span>
                            <span className={`text-[10px] font-mono mt-0.5 ${
                              isYearActive ? 'text-white/80' : 'text-slate-400'
                            }`}>
                              {yrSemNumbers}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Semester Cards Grid */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                        2. Semester Cards ({visibleSemesters.length})
                      </span>
                      {selectedSemesterId !== 'all' && (
                        <button
                          onClick={() => setSelectedSemesterId('all')}
                          className="text-xs text-[#0e0fed] hover:underline font-extrabold"
                        >
                          View All Semesters
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {visibleSemesters.map((sem) => {
                        const isSelectedSem = selectedSemesterId === sem.id;
                        const semSubs = getSubjectsForSemester(sem.id);
                        const semPapers = getPapersForSemester(sem.id);
                        const theoryCount = semSubs.filter((s) => s.category === 'Theory' || !s.category).length;
                        const yr = academicYears.find((y) => y.id === sem.academicYearId);

                        return (
                          <button
                            key={sem.id}
                            onClick={() => setSelectedSemesterId(isSelectedSem ? 'all' : sem.id)}
                            className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between magnetic-target ${
                              isSelectedSem
                                ? 'bg-gradient-to-br from-blue-50/95 via-cyan-50/90 to-emerald-50/90 border-[#0e0fed] shadow-md ring-2 ring-[#0e0fed]/20'
                                : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
                            }`}
                            data-magnetic="true"
                          >
                            <div className="h-1 w-full bg-gradient-to-r from-[#8bf0ba] to-[#94f0f1] absolute top-0 left-0" />
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-blue-50 text-[#0e0fed] border border-blue-200">
                                  Sem {sem.semesterNumber}
                                </span>
                                <span className="text-[10px] font-bold text-slate-500">
                                  {yr?.name}
                                </span>
                              </div>
                              <h4 className="text-sm font-black text-slate-900 mt-2">
                                {sem.name}
                              </h4>
                            </div>

                            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-600">
                              <span>{theoryCount} Theory</span>
                              <span className={semPapers.length > 0 ? 'text-[#0e0fed] font-extrabold font-mono' : 'text-slate-400'}>
                                {semPapers.length} PYQs
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Render Subjects for Selected Semester or All Semesters */}
                  <div className="space-y-6 pt-2">
                    {visibleSemesters
                      .filter((sem) => selectedSemesterId === 'all' || sem.id === selectedSemesterId)
                      .map((sem) => {
                        const semSubs = getSubjectsForSemester(sem.id);
                        const theoryCourses = semSubs.filter((s) => s.category === 'Theory' || !s.category);
                        const electiveI = semSubs.filter((s) => s.electiveGroup === 'Department Elective-I');
                        const electiveII = semSubs.filter((s) => s.electiveGroup === 'Department Elective-II');
                        const electiveIII = semSubs.filter((s) => s.electiveGroup === 'Department Elective-III');
                        const openElective = semSubs.filter((s) => s.electiveGroup === 'Open Elective');
                        const practicalsAndProjects = semSubs.filter((s) => s.category === 'Practical' || s.category === 'Project' || s.category === 'Training' || s.category === 'Seminar');

                        const yr = academicYears.find((y) => y.id === sem.academicYearId);

                        return (
                          <div 
                            key={sem.id} 
                            className="bg-slate-50/70 border border-slate-200/90 rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xs"
                          >
                            {/* Semester Header Strip */}
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                              <div className="flex items-center gap-2.5">
                                <span className="px-3 py-1 rounded-xl bg-gradient-to-r from-[#0e0fed] to-[#2563eb] text-white font-black text-xs shadow-2xs">
                                  Semester {sem.semesterNumber}
                                </span>
                                <h3 className="text-base font-black text-slate-900">
                                  {sem.name} Curriculum &bull; {yr?.name}
                                </h3>
                              </div>
                              <span className="text-xs font-mono font-bold text-slate-600">
                                {semSubs.length} Courses Total
                              </span>
                            </div>

                            {/* Section: Theory Courses */}
                            {theoryCourses.length > 0 && (
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700">
                                  <BookOpen className="w-4 h-4 text-[#0e0fed]" />
                                  <span>Theory Courses ({theoryCourses.length})</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                  {theoryCourses.map((subject) => (
                                    <SubjectCardItem
                                      key={subject.id}
                                      subject={subject}
                                      semNumber={sem.semesterNumber}
                                      paperCount={getPapersForSubject(subject.id).length}
                                      onOpenSubjectPapers={() => setActiveSubjectModal(subject)}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Section: Semester 5 - Department Elective-I */}
                            {electiveI.length > 0 && (
                              <div className="space-y-3 pt-3 border-t border-slate-200">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-purple-700">
                                    <Layers className="w-4 h-4 text-purple-600" />
                                    <span>Department Elective-I — Available Options ({electiveI.length})</span>
                                  </div>
                                  <span className="text-[11px] font-semibold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                                    Elective Choices
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                  {electiveI.map((subject) => (
                                    <SubjectCardItem
                                      key={subject.id}
                                      subject={subject}
                                      semNumber={sem.semesterNumber}
                                      paperCount={getPapersForSubject(subject.id).length}
                                      onOpenSubjectPapers={() => setActiveSubjectModal(subject)}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Section: Semester 6 - Department Elective-II */}
                            {electiveII.length > 0 && (
                              <div className="space-y-3 pt-3 border-t border-slate-200">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-cyan-800">
                                    <Layers className="w-4 h-4 text-cyan-600" />
                                    <span>Department Elective-II — Available Options ({electiveII.length})</span>
                                  </div>
                                  <span className="text-[11px] font-semibold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                                    Elective Choices
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                  {electiveII.map((subject) => (
                                    <SubjectCardItem
                                      key={subject.id}
                                      subject={subject}
                                      semNumber={sem.semesterNumber}
                                      paperCount={getPapersForSubject(subject.id).length}
                                      onOpenSubjectPapers={() => setActiveSubjectModal(subject)}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Section: Semester 7 - Department Elective-III and Open Elective */}
                            {(electiveIII.length > 0 || openElective.length > 0) && (
                              <div className="space-y-4 pt-3 border-t border-slate-200">
                                {electiveIII.length > 0 && (
                                  <div className="space-y-2.5">
                                    <div className="text-xs font-black uppercase tracking-wider text-indigo-700 flex items-center gap-2">
                                      <Layers className="w-4 h-4 text-indigo-600" />
                                      <span>Department Elective-III</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                      {electiveIII.map((subject) => (
                                        <SubjectCardItem
                                          key={subject.id}
                                          subject={subject}
                                          semNumber={sem.semesterNumber}
                                          paperCount={getPapersForSubject(subject.id).length}
                                          onOpenSubjectPapers={() => setActiveSubjectModal(subject)}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {openElective.length > 0 && (
                                  <div className="space-y-2.5 pt-2">
                                    <div className="text-xs font-black uppercase tracking-wider text-pink-700 flex items-center gap-2">
                                      <Layers className="w-4 h-4 text-pink-600" />
                                      <span>Open Elective</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                      {openElective.map((subject) => (
                                        <SubjectCardItem
                                          key={subject.id}
                                          subject={subject}
                                          semNumber={sem.semesterNumber}
                                          paperCount={getPapersForSubject(subject.id).length}
                                          onOpenSubjectPapers={() => setActiveSubjectModal(subject)}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Section: Practical, Project, Training & Seminar components */}
                            {practicalsAndProjects.length > 0 && (
                              <div className="space-y-3 pt-3 border-t border-slate-200">
                                <div className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                  <span>Practical, Project &amp; Experiential Components</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                  {practicalsAndProjects.map((subject) => (
                                    <SubjectCardItem
                                      key={subject.id}
                                      subject={subject}
                                      semNumber={sem.semesterNumber}
                                      paperCount={getPapersForSubject(subject.id).length}
                                      onOpenSubjectPapers={() => setActiveSubjectModal(subject)}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Mandatory Official Note for Semester 8 */}
                            {sem.semesterNumber === 8 && (
                              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 flex items-start gap-3 shadow-2xs">
                                <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                  <div className="text-xs font-black text-amber-900 uppercase tracking-wide">
                                    Official Faculty Course Guideline
                                  </div>
                                  <p className="text-xs text-amber-800 font-semibold leading-relaxed">
                                    &ldquo;The student shall decide the MOOC course in consultation with the department faculty member and approved by Head of the Department.&rdquo;
                                  </p>
                                </div>
                              </div>
                            )}

                          </div>
                        );
                      })}
                  </div>

                </div>
              ) : (
                /* ========================================================================= */
                /* STANDARD VIEW FOR OTHER 6 DEPARTMENTS (UNTOUCHED / PRESERVED) */
                /* ========================================================================= */
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                      Curriculum &amp; Subjects ({activeDeptSubjects.length})
                    </h3>
                    <span className="text-xs text-slate-600 font-mono font-bold">
                      8 Semesters Total
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeDeptSubjects.map((subject) => {
                      const sem = semesters.find((s) => s.id === subject.semesterId);
                      const subPapers = activeDeptPapers.filter((p) => p.subjectId === subject.id);

                      return (
                        <div
                          key={subject.id}
                          className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col justify-between hover:border-[#0e0fed]/40 transition-all shadow-2xs group"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-mono text-[10px] font-black px-2 py-0.5 rounded bg-blue-50 text-[#0e0fed] border border-blue-200">
                                {subject.subjectCode}
                              </span>
                              <span className="text-[10px] font-bold text-slate-600">
                                Sem {sem?.semesterNumber || 1}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#0e0fed] transition-colors line-clamp-2">
                              {subject.subjectName}
                            </h4>
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-medium">
                            <span>{subPapers.length} papers</span>
                            {subPapers.length > 0 && (
                              <button
                                onClick={() => onViewPaper(subPapers[0])}
                                className="text-[#0e0fed] hover:underline font-extrabold magnetic-target"
                                data-magnetic="true"
                              >
                                View Latest
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Available Question Papers List for Standard Active Department */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                      Question Papers in {activeDept.code} ({activeDeptPapers.length})
                    </h3>

                    {activeDeptPapers.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">
                        No papers uploaded for this department yet. You can upload via Admin Dashboard.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {activeDeptPapers.map((paper) => (
                          <div
                            key={paper.id}
                            className="p-3.5 bg-white border border-slate-200/90 rounded-2xl flex items-center justify-between gap-3 text-xs shadow-2xs"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-black text-[#0e0fed]">{paper.subjectCode}</span>
                                <span className="font-bold text-slate-900 truncate">{paper.subjectName}</span>
                              </div>
                              <div className="text-slate-600 text-[11px] mt-0.5 font-medium">
                                Sem {paper.semesterNumber} &bull; Year {paper.examinationYear} ({paper.examinationType})
                              </div>
                            </div>

                            <button
                              onClick={() => onViewPaper(paper)}
                              className="px-3.5 py-1.5 bg-gradient-to-r from-[#8bf0ba] to-[#94f0f1] hover:opacity-90 text-slate-950 rounded-xl text-xs font-black shrink-0 transition-all shadow-2xs magnetic-target"
                              data-magnetic="true"
                            >
                              View PDF
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="text-center py-16 bg-white/90 border border-slate-200 rounded-3xl text-slate-600 text-sm">
              Select a department on the left to view details.
            </div>
          )}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* DEDICATED SUBJECT PYQ MODAL / SECTION */}
      {/* ========================================================================= */}
      {activeSubjectModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Top gradient ribbon */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#8bf0ba] via-[#94f0f1] via-[#0e0fed] via-[#f2b1d8] to-[#ffdc6a]" />

            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-gradient-to-r from-white via-blue-50/20 to-white">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-black px-2 py-0.5 rounded-lg bg-blue-50 text-[#0e0fed] border border-blue-200">
                    {activeSubjectModal.subjectCode}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {activeSubjectModal.category || 'Theory'}
                  </span>
                  {activeSubjectModal.electiveGroup && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                      {activeSubjectModal.electiveGroup}
                    </span>
                  )}
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                  {activeSubjectModal.subjectName}
                </h3>
                <div className="text-xs text-slate-600 font-semibold flex items-center gap-2">
                  <span>Electrical Engineering</span>
                  <span>&bull;</span>
                  <span>{semesters.find((s) => s.id === activeSubjectModal.semesterId)?.name}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setActiveSubjectModal(null);
                  setSubjectExamYearFilter('all');
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors magnetic-target"
                data-magnetic="true"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Note if applicable */}
            {activeSubjectModal.note && (
              <div className="px-6 py-2.5 bg-blue-50/70 border-b border-blue-100 text-xs text-[#0e0fed] font-semibold flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0" />
                <span>{activeSubjectModal.note}</span>
              </div>
            )}

            {/* Filter by Exam Year */}
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                Examination Papers
              </span>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 font-bold">Filter Year:</span>
                <select
                  value={subjectExamYearFilter}
                  onChange={(e) => setSubjectExamYearFilter(e.target.value)}
                  className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0e0fed]"
                >
                  <option value="all">All Years</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                  <option value="2021">2021</option>
                  <option value="2020">2020</option>
                </select>
              </div>
            </div>

            {/* Papers List or Empty State */}
            <div className="p-6 overflow-y-auto max-h-96 space-y-3">
              {filteredSubjectPapers.length === 0 ? (
                <div className="text-center py-10 px-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl space-y-2">
                  <FileText className="w-10 h-10 text-slate-400 mx-auto" />
                  <h4 className="text-sm font-black text-slate-800">
                    Question papers will be available soon.
                  </h4>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto font-medium">
                    No digitized previous year question papers have been archived for {activeSubjectModal.subjectCode} yet. Faculty members and department administrators can upload question papers through the Admin Portal.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredSubjectPapers.map((paper) => (
                    <div
                      key={paper.id}
                      className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:border-[#0e0fed]/50 transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-[#0e0fed] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {paper.examinationYear}
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {paper.examinationType} Examination
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-2">
                          <span>{formatBytes(paper.fileSizeBytes)}</span>
                          <span>&bull;</span>
                          <span>{paper.pageCount} Pages</span>
                          <span>&bull;</span>
                          <span>{paper.downloadCount} Downloads</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => onViewPaper(paper)}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold transition-colors magnetic-target"
                          data-magnetic="true"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#0e0fed]" />
                          <span>Preview PDF</span>
                        </button>

                        {onDownloadPaper && (
                          <button
                            onClick={() => onDownloadPaper(paper)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-[#8bf0ba] hover:text-slate-950 text-slate-700 transition-all magnetic-target"
                            title="Download PDF"
                            data-magnetic="true"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span className="font-semibold text-slate-700">
                Official M.J.P. Rohilkhand University Question Paper Repository
              </span>
              <button
                onClick={() => setActiveSubjectModal(null)}
                className="font-black text-[#0e0fed] hover:underline"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

interface SubjectCardItemProps {
  subject: Subject;
  semNumber: number;
  paperCount: number;
  onOpenSubjectPapers: () => void;
}

const SubjectCardItem: React.FC<SubjectCardItemProps> = ({
  subject,
  semNumber,
  paperCount,
  onOpenSubjectPapers,
}) => {
  const getCategoryBadgeClass = (category?: string) => {
    switch (category) {
      case 'Elective':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Practical':
      case 'Project':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Training':
      case 'Seminar':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-blue-50 text-[#0e0fed] border-blue-200';
    }
  };

  return (
    <div
      onClick={onOpenSubjectPapers}
      className="bg-white/95 border border-slate-200/90 rounded-2xl p-4 flex flex-col justify-between hover:border-[#0e0fed] hover:shadow-md transition-all cursor-pointer group magnetic-target relative overflow-hidden"
      data-magnetic="true"
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-xs font-black px-2 py-0.5 rounded-lg bg-blue-50 text-[#0e0fed] border border-blue-200 shadow-2xs">
            {subject.subjectCode}
          </span>
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${getCategoryBadgeClass(subject.category)}`}>
              {subject.category || 'Theory'}
            </span>
            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
              Sem {semNumber}
            </span>
          </div>
        </div>

        <h4 className="text-sm font-black text-slate-900 group-hover:text-[#0e0fed] transition-colors line-clamp-2 leading-snug">
          {subject.subjectName}
        </h4>

        {subject.electiveGroup && (
          <div className="text-[11px] font-bold text-purple-700 bg-purple-50/70 border border-purple-100 px-2 py-0.5 rounded-md inline-block">
            {subject.electiveGroup}
          </div>
        )}

        {subject.note && (
          <p className="text-[11px] text-slate-500 italic line-clamp-2">
            {subject.note}
          </p>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <span className={`font-mono font-bold ${paperCount > 0 ? 'text-[#0e0fed]' : 'text-slate-400'}`}>
            {paperCount} {paperCount === 1 ? 'Paper' : 'Papers'}
          </span>
          {paperCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
        </div>

        <button
          type="button"
          className="flex items-center gap-1 font-black text-xs text-[#0e0fed] group-hover:translate-x-1 transition-transform"
        >
          <span>View Papers</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
