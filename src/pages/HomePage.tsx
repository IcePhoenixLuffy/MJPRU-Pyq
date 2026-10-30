import React from 'react';
import { 
  GraduationCap, 
  FileText, 
  BookOpen, 
  UploadCloud, 
  ArrowRight, 
  Download, 
  Eye, 
  CheckCircle2,
  Laptop,
  Brain,
  Radio,
  Zap,
  Cog,
  FlaskConical,
  Gauge
} from 'lucide-react';
import { Department, QuestionPaper, SystemStatistics } from '../types';
import { GlobalSearchBar } from '../components/common/GlobalSearchBar';
import { formatBytes } from '../utils/helpers';

interface HomePageProps {
  departments: Department[];
  recentPapers: QuestionPaper[];
  allPapers: QuestionPaper[];
  statistics: SystemStatistics;
  onSelectDepartment: (deptId: string) => void;
  onViewPaper: (paper: QuestionPaper) => void;
  onDownloadPaper: (paper: QuestionPaper) => void;
  onNavigateTab: (tab: string, query?: string) => void;
}

const getDeptIcon = (iconName: string) => {
  switch (iconName) {
    case 'Laptop': return <Laptop className="w-6 h-6 text-emerald-600" />;
    case 'Brain': return <Brain className="w-6 h-6 text-blue-600" />;
    case 'Radio': return <Radio className="w-6 h-6 text-pink-600" />;
    case 'Zap': return <Zap className="w-6 h-6 text-amber-500" />;
    case 'Cog': return <Cog className="w-6 h-6 text-teal-600" />;
    case 'FlaskConical': return <FlaskConical className="w-6 h-6 text-cyan-600" />;
    case 'Gauge': return <Gauge className="w-6 h-6 text-indigo-600" />;
    default: return <GraduationCap className="w-6 h-6 text-blue-600" />;
  }
};

export const HomePage: React.FC<HomePageProps> = ({
  departments,
  recentPapers,
  allPapers,
  statistics,
  onSelectDepartment,
  onViewPaper,
  onDownloadPaper,
  onNavigateTab,
}) => {
  const handleSearchSubmit = (query: string) => {
    onNavigateTab('library', query);
  };

  return (
    <div className="space-y-20 pb-16">
      
      {/* 1. HERO SECTION WITH SOFT LIGHT GRADIENTS */}
      <section className="relative pt-12 md:pt-20 pb-14 overflow-hidden">
        {/* Soft, luminous ambient background gradients using the exact palette */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[400px] bg-gradient-to-tr from-[#94f0f1]/25 via-[#8bf0ba]/20 to-[#f2b1d8]/25 blur-[100px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-10 right-10 w-80 h-80 bg-[#ffdc6a]/20 blur-[90px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-28 left-8 w-72 h-72 bg-[#8bf0ba]/25 blur-[80px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          
          {/* University Kicker */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>M.J.P. Rohilkhand University, Bareilly</span>
            <span className="text-slate-300">&bull;</span>
            <span className="text-[#0e0fed] font-bold">Official Academic Repository</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
            Your Exams. Your Preparation.{' '}
            <span className="gradient-text-primary block mt-1">Your Success.</span>
          </h1>

          {/* Supporting Text */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
            Access previous year question papers, explore subjects, and prepare smarter with MJPRU PYQ.
          </p>

          {/* Global Search Bar */}
          <div className="max-w-2xl mx-auto pt-2">
            <GlobalSearchBar
              onSearchSubmit={handleSearchSubmit}
              onSelectPaper={onViewPaper}
              availablePapers={allPapers}
            />
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
            <button
              onClick={() => onNavigateTab('departments')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#0e0fed] to-[#2563eb] text-white font-bold text-sm hover:opacity-95 shadow-md shadow-blue-500/20 active:scale-95 transition-all magnetic-target"
              data-magnetic="true"
            >
              <span>Browse Departments</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigateTab('library')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-slate-300 text-slate-800 font-bold text-sm hover:bg-slate-50 hover:border-slate-400 active:scale-95 transition-all shadow-xs magnetic-target"
              data-magnetic="true"
            >
              <BookOpen className="w-4 h-4 text-[#0e0fed]" />
              <span>Browse All Papers</span>
            </button>
          </div>

          {/* Trust Highlights */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Verified University Syllabus</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>Instant PDF In-Browser Preview</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-500" />
              <span>Regular &amp; Back Papers</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DYNAMIC QUICK STATISTICS IN BRIGHT CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs relative overflow-hidden group hover:border-[#8bf0ba] hover:shadow-md transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#8bf0ba]/20 rounded-bl-full pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Departments
              </span>
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                <GraduationCap className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tabular-nums">
              {statistics.totalDepartments}
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">B.Tech Engineering Streams</p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs relative overflow-hidden group hover:border-[#94f0f1] hover:shadow-md transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#94f0f1]/30 rounded-bl-full pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Question Papers
              </span>
              <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-600">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tabular-nums">
              {statistics.totalQuestionPapers}
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">Archived Official PYQs</p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs relative overflow-hidden group hover:border-[#f2b1d8] hover:shadow-md transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#f2b1d8]/30 rounded-bl-full pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Subjects
              </span>
              <div className="p-2.5 rounded-xl bg-pink-50 text-pink-600">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tabular-nums">
              {statistics.totalSubjects}
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">Across 8 Semesters</p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs relative overflow-hidden group hover:border-[#ffdc6a] hover:shadow-md transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#ffdc6a]/30 rounded-bl-full pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Recent Uploads
              </span>
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                <UploadCloud className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tabular-nums">
              {statistics.latestUploadsCount}
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">Added in last 30 days</p>
          </div>

        </div>
      </section>

      {/* 3. DYNAMIC DEPARTMENTS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#0e0fed]">
              Engineering Faculties
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Explore by Department
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-xl">
              Choose your engineering discipline to view subjects organized chronologically from 1st Year to 4th Year.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('departments')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0e0fed] hover:underline whitespace-nowrap self-start md:self-auto magnetic-target"
            data-magnetic="true"
          >
            <span>View All Departments</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => {
            const deptPapersCount = allPapers.filter((p) => p.departmentId === dept.id).length;

            return (
              <div
                key={dept.id}
                onClick={() => onSelectDepartment(dept.id)}
                className="group relative bg-white border border-slate-200/90 rounded-2xl p-6 hover:border-[#0e0fed]/50 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-xl flex flex-col justify-between magnetic-target"
                data-magnetic="true"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 group-hover:scale-105 group-hover:bg-blue-50 transition-all">
                      {getDeptIcon(dept.iconName)}
                    </div>
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                      {dept.code}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#0e0fed] transition-colors leading-snug">
                    {dept.name}
                  </h3>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {dept.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-600 font-medium">
                    <span className="text-slate-900 font-bold">{deptPapersCount}</span> papers available
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0e0fed] group-hover:translate-x-1 transition-transform">
                    <span>Explore</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. RECENTLY UPLOADED PAPERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#0e0fed]">
              Fresh Additions
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Recently Uploaded Papers
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Latest semester examination papers submitted to the university database.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('recent')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0e0fed] hover:underline whitespace-nowrap self-start md:self-auto magnetic-target"
            data-magnetic="true"
          >
            <span>View All Recent Papers</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {recentPapers.length === 0 ? (
          <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl p-8">
            <FileText className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No question papers uploaded yet</h3>
            <p className="text-xs text-slate-500 mt-1">
              Check back soon or upload papers through the admin dashboard.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentPapers.slice(0, 6).map((paper) => (
              <div
                key={paper.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 hover:border-[#0e0fed]/40 transition-all flex flex-col justify-between group shadow-xs hover:shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {paper.subjectCode}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {paper.examinationType}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#0e0fed] transition-colors leading-snug line-clamp-1">
                    {paper.subjectName}
                  </h4>

                  <div className="text-xs text-slate-600 mt-2 space-y-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{paper.departmentName}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-500 text-[11px] font-medium">
                      <span>Sem {paper.semesterNumber}</span>
                      <span>&bull;</span>
                      <span>Year {paper.examinationYear}</span>
                      <span>&bull;</span>
                      <span>{formatBytes(paper.fileSizeBytes)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onViewPaper(paper)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors magnetic-target"
                    data-magnetic="true"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#0e0fed]" />
                    <span>View PDF</span>
                  </button>

                  <button
                    onClick={() => onDownloadPaper(paper)}
                    className="flex items-center justify-center p-2 rounded-xl bg-slate-100 hover:bg-[#8bf0ba] hover:text-slate-900 text-slate-700 transition-all magnetic-target"
                    title="Download PDF"
                    aria-label={`Download ${paper.subjectName} PDF`}
                    data-magnetic="true"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. PREPARATION CALLOUT BANNER (LIGHT GRADIENT ACCENTS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-[#0e0fed] via-[#1d4ed8] to-[#1e40af] p-8 sm:p-12 overflow-hidden shadow-xl text-white">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#8bf0ba]/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 right-20 w-56 h-56 bg-[#f2b1d8]/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-block px-3 py-1 rounded-full bg-[#8bf0ba] text-slate-900 text-xs font-extrabold uppercase tracking-wider">
              Smart Exam Strategy
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight">
              Analyze Question Trends &amp; Ace Your Semester Exams
            </h2>
            <p className="text-sm text-blue-100 leading-relaxed font-medium">
              Practicing previous year papers is proven to boost examination scores by up to 35%. Understand the question weighting, recurring formulas, and section-wise mark distribution.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigateTab('library')}
                className="px-6 py-3.5 rounded-xl bg-[#ffdc6a] text-slate-950 font-extrabold text-xs sm:text-sm hover:bg-[#ffe58f] transition-all shadow-md active:scale-95 magnetic-target"
                data-magnetic="true"
              >
                Start Practicing Question Papers
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
