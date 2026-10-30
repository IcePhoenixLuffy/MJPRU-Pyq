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
  Gauge
} from 'lucide-react';
import { Department, QuestionPaper, Subject, AcademicYear, Semester } from '../types';

interface DepartmentsPageProps {
  departments: Department[];
  subjects: Subject[];
  papers: QuestionPaper[];
  academicYears: AcademicYear[];
  semesters: Semester[];
  onSelectDepartmentForLibrary: (deptId: string) => void;
  onViewPaper: (paper: QuestionPaper) => void;
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
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(
    departments[0]?.id || null
  );

  const filteredDepts = departments.filter((d) => {
    const q = searchQuery.toLowerCase();
    return d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q) || d.description.toLowerCase().includes(q);
  });

  const activeDept = departments.find((d) => d.id === selectedDeptId) || departments[0];

  const activeDeptSubjects = subjects.filter((s) => s.departmentId === activeDept?.id);
  const activeDeptPapers = papers.filter((p) => p.departmentId === activeDept?.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header with gradient badge */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-[#8bf0ba]/40 to-[#94f0f1]/60 border border-emerald-300 text-xs font-extrabold text-[#0e0fed]">
          Academic Faculties
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          B.Tech Engineering <span className="gradient-text-vibrant">Departments</span>
        </h1>
        <p className="text-sm text-slate-700 font-medium max-w-2xl leading-relaxed">
          M.J.P. Rohilkhand University offers premier 4-year undergraduate B.Tech degree programs. Select any department below to explore year-wise course subjects and archived previous question papers.
        </p>
      </div>

      {/* Search Departments */}
      <div className="max-w-md">
        <div className="relative p-0.5 rounded-2xl bg-gradient-to-r from-[#94f0f1] to-[#f2b1d8] shadow-xs">
          <div className="relative bg-white rounded-[14px]">
            <Search className="w-4 h-4 text-[#0e0fed] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter departments by name or code..."
              className="w-full pl-10 pr-4 py-2.5 bg-transparent rounded-xl text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Main 2-Column Department Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Department List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-extrabold uppercase tracking-wider text-slate-700 px-1">
            Available Departments ({filteredDepts.length})
          </div>

          <div className="space-y-2.5">
            {filteredDepts.map((dept, idx) => {
              const isSelected = dept.id === activeDept?.id;
              const deptPaperCount = papers.filter((p) => p.departmentId === dept.id).length;

              const gradientAccent = idx % 3 === 0 
                ? 'from-[#8bf0ba]/40 to-[#94f0f1]/40' 
                : idx % 3 === 1 
                  ? 'from-[#94f0f1]/40 to-[#0e0fed]/20' 
                  : 'from-[#f2b1d8]/40 to-[#ffdc6a]/40';

              return (
                <button
                  key={dept.id}
                  onClick={() => setSelectedDeptId(dept.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 magnetic-target relative overflow-hidden ${
                    isSelected
                      ? 'bg-gradient-to-r from-blue-50/90 to-cyan-50/90 border-[#0e0fed] shadow-md ring-2 ring-[#0e0fed]/25'
                      : 'bg-white/90 border-slate-200/90 hover:border-slate-300 hover:bg-white'
                  }`}
                  data-magnetic="true"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`p-2.5 rounded-xl border bg-gradient-to-tr ${gradientAccent} border-slate-200 shadow-2xs`}>
                      {getDeptIcon(dept.iconName)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-extrabold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                          {dept.code}
                        </span>
                        <h3 className={`text-sm font-bold truncate ${
                          isSelected ? 'text-[#0e0fed]' : 'text-slate-900'
                        }`}>
                          {dept.name}
                        </h3>
                      </div>
                      <div className="text-xs text-slate-600 mt-1 font-semibold">
                        {deptPaperCount} question papers archived
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
        <div className="lg:col-span-7">
          {activeDept ? (
            <div className="bg-white/95 border border-cyan-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm relative overflow-hidden">
              
              {/* Decorative top ribbon */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#8bf0ba] via-[#94f0f1] to-[#0e0fed]" />

              {/* Department Header */}
              <div className="border-b border-slate-100 pb-6 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-[#94f0f1]/30 to-[#8bf0ba]/40 border border-cyan-200">
                    {getDeptIcon(activeDept.iconName)}
                  </div>
                  <button
                    onClick={() => onSelectDepartmentForLibrary(activeDept.id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl btn-gradient-blue font-bold text-xs transition-all shadow-xs magnetic-target"
                    data-magnetic="true"
                  >
                    <span>Browse {activeDept.code} Papers</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <div className="text-xs font-mono font-extrabold text-[#0e0fed]">
                    B.Tech Program &bull; {activeDept.code}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                    {activeDept.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed font-medium">
                    {activeDept.description}
                  </p>
                </div>
              </div>

              {/* Semester & Subject Breakdown */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
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
                        className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-2xl p-3.5 flex flex-col justify-between hover:border-cyan-300 transition-colors shadow-2xs"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-mono text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-blue-50 text-[#0e0fed] border border-blue-100">
                              {subject.subjectCode}
                            </span>
                            <span className="text-[10px] font-bold text-slate-600">
                              Sem {sem?.semesterNumber || 1}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-slate-900 line-clamp-2">
                            {subject.subjectName}
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600 font-medium">
                          <span>{subPapers.length} papers</span>
                          {subPapers.length > 0 && (
                            <button
                              onClick={() => onViewPaper(subPapers[0])}
                              className="text-[#0e0fed] hover:underline font-extrabold"
                            >
                              View Latest
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Available Question Papers List for Active Department */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
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
                        className="p-3.5 bg-gradient-to-r from-white to-blue-50/40 border border-slate-200 rounded-2xl flex items-center justify-between gap-3 text-xs shadow-2xs"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-extrabold text-[#0e0fed]">{paper.subjectCode}</span>
                            <span className="font-bold text-slate-900 truncate">{paper.subjectName}</span>
                          </div>
                          <div className="text-slate-600 text-[11px] mt-0.5 font-medium">
                            Sem {paper.semesterNumber} &bull; Year {paper.examinationYear} ({paper.examinationType})
                          </div>
                        </div>

                        <button
                          onClick={() => onViewPaper(paper)}
                          className="px-3.5 py-1.5 bg-gradient-to-r from-[#8bf0ba] to-[#94f0f1] hover:opacity-90 text-slate-950 rounded-xl text-xs font-extrabold shrink-0 transition-all shadow-2xs magnetic-target"
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
          ) : (
            <div className="text-center py-16 bg-white/90 border border-slate-200 rounded-3xl text-slate-600 text-sm">
              Select a department on the left to view details.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
