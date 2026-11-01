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
  Gauge,
  Sparkles
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
    <div className="space-y-20 pb-20">
      
      {/* 1. LARGE VIBRANT GRADIENT HERO SECTION */}
      <section className="relative pt-12 md:pt-20 pb-16 overflow-hidden">
        
        {/* Colorful Gradient Blobs matching exact palette */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-gradient-to-br from-[#8bf0ba]/40 via-[#94f0f1]/50 to-[#f2b1d8]/40 blur-[90px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-20 right-10 w-80 h-80 bg-gradient-to-br from-[#ffdc6a]/50 to-[#f2b1d8]/40 blur-[80px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-32 left-10 w-80 h-80 bg-gradient-to-br from-[#8bf0ba]/50 to-[#94f0f1]/40 blur-[75px] rounded-full pointer-events-none -z-10" />
        <div className="absolute -bottom-10 left-1/3 w-96 h-96 bg-gradient-to-tr from-[#94f0f1]/40 to-[#0e0fed]/20 blur-[85px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-7 relative z-10">
          
          {/* Luminous pill kicker */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/85 border border-cyan-200 shadow-xs backdrop-blur-md">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0e0fed] animate-pulse" />
            <span className="text-xs font-bold text-slate-800">M.J.P. Rohilkhand University, Bareilly</span>
            <span className="text-slate-300">&bull;</span>
            <span className="text-xs font-extrabold text-[#0e0fed]">Official Academic Repository</span>
          </div>

          {/* Strong Heading with Rich Gradient Text */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
            Exams Preparation{' '}
            <span className="gradient-text-vibrant block mt-1">Success</span>
          </h1>

          {/* Supporting Text */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-700 font-semibold leading-relaxed">
            Access previous year question papers, explore subjects, and prepare smarter with MJPRU PYQ.
          </p>

          {/* Prominent Global Search Bar with Gradient Border */}
          <div className="max-w-2xl mx-auto pt-2">
            <div className="p-1 rounded-2xl bg-gradient-to-r from-[#8bf0ba] via-[#94f0f1] to-[#f2b1d8] shadow-lg">
              <GlobalSearchBar
                onSearchSubmit={handleSearchSubmit}
                onSelectPaper={onViewPaper}
                availablePapers={allPapers}
              />
            </div>
          </div>

          {/* Action CTAs in Rich Palette Gradients */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
            <button
              onClick={() => onNavigateTab('departments')}
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#0e0fed] to-[#2563eb] text-white font-extrabold text-sm hover:from-[#1b1cff] hover:to-[#1d4ed8] shadow-lg shadow-blue-500/25 active:scale-95 transition-all magnetic-target"
              data-magnetic="true"
            >
              <span>Browse Departments</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigateTab('library')}
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#8bf0ba] via-[#94f0f1] to-[#8bf0ba] text-slate-950 font-extrabold text-sm hover:opacity-90 active:scale-95 transition-all shadow-md shadow-emerald-500/20 border border-emerald-300/60 magnetic-target"
              data-magnetic="true"
            >
              <BookOpen className="w-4 h-4 text-[#0e0fed]" />
              <span>Browse All Papers</span>
            </button>
          </div>

          {/* Key Trust Highlights with gradient icons */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-bold text-slate-700">
            <div className="flex items-center gap-2 bg-white/80 px-3 py-1.5 rounded-full border border-emerald-200 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Verified University Syllabus</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 px-3 py-1.5 rounded-full border border-blue-200 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-[#0e0fed]" />
              <span>Instant PDF In-Browser Preview</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 px-3 py-1.5 rounded-full border border-amber-200 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
              <span>Regular &amp; Back Papers</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DYNAMIC QUICK STATISTICS IN RICH GRADIENT CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* Stat 1: Green -> Blue Underling */}
          <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-white/95 via-emerald-50/70 to-[#8bf0ba]/40 border border-[#8bf0ba]/60 shadow-sm hover:shadow-xl transition-all magnetic-target" data-magnetic="true">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider">
                Total Departments
              </span>
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-[#8bf0ba] to-[#94f0f1] text-slate-900 shadow-2xs">
                <GraduationCap className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tabular-nums">
              {statistics.totalDepartments}
            </div>
            <p className="text-xs text-emerald-800 mt-1 font-bold">B.Tech Engineering Streams</p>
          </div>

          {/* Stat 2: Blue Underling -> Ironic Blues */}
          <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-white/95 via-cyan-50/70 to-[#94f0f1]/40 border border-[#94f0f1]/60 shadow-sm hover:shadow-xl transition-all magnetic-target" data-magnetic="true">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold text-cyan-900 uppercase tracking-wider">
                Question Papers
              </span>
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-[#94f0f1] to-[#0e0fed] text-white shadow-2xs">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tabular-nums">
              {statistics.totalQuestionPapers}
            </div>
            <p className="text-xs text-cyan-800 mt-1 font-bold">Archived Official PYQs</p>
          </div>

          {/* Stat 3: Green -> Pinky Ring */}
          <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-white/95 via-pink-50/70 to-[#f2b1d8]/40 border border-[#f2b1d8]/60 shadow-sm hover:shadow-xl transition-all magnetic-target" data-magnetic="true">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold text-pink-900 uppercase tracking-wider">
                Total Subjects
              </span>
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-[#f2b1d8] to-[#ffdc6a] text-slate-900 shadow-2xs">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tabular-nums">
              {statistics.totalSubjects}
            </div>
            <p className="text-xs text-pink-800 mt-1 font-bold">Across 8 Semesters</p>
          </div>

          {/* Stat 4: Pinky Ring -> Egg Yellows */}
          <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-white/95 via-amber-50/70 to-[#ffdc6a]/40 border border-[#ffdc6a]/60 shadow-sm hover:shadow-xl transition-all magnetic-target" data-magnetic="true">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold text-amber-900 uppercase tracking-wider">
                Recent Uploads
              </span>
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-[#ffdc6a] to-[#8bf0ba] text-slate-900 shadow-2xs">
                <UploadCloud className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tabular-nums">
              {statistics.latestUploadsCount}
            </div>
            <p className="text-xs text-amber-800 mt-1 font-bold">Added in last 30 days</p>
          </div>

        </div>
      </section>

      {/* 3. DYNAMIC DEPARTMENTS SECTION WITH GRADIENT CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#0e0fed]">
              Engineering Faculties
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Explore by Department
            </h2>
            <p className="text-sm text-slate-700 font-medium mt-1 max-w-xl">
              Choose your engineering discipline to view subjects organized chronologically from 1st Year to 4th Year.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('departments')}
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#0e0fed] hover:underline whitespace-nowrap self-start md:self-auto magnetic-target"
            data-magnetic="true"
          >
            <span>View All Departments</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept, idx) => {
            const deptPapersCount = allPapers.filter((p) => p.departmentId === dept.id).length;

            // Alternate gradient highlight ribbons per department
            const gradientAccent = idx % 3 === 0 
              ? 'from-[#8bf0ba] to-[#94f0f1]' 
              : idx % 3 === 1 
                ? 'from-[#94f0f1] to-[#0e0fed]' 
                : 'from-[#f2b1d8] to-[#ffdc6a]';

            return (
              <div
                key={dept.id}
                onClick={() => onSelectDepartment(dept.id)}
                className="group relative bg-white/90 border border-slate-200/90 rounded-3xl p-6 hover:border-[#0e0fed]/50 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-xl flex flex-col justify-between overflow-hidden magnetic-target"
                data-magnetic="true"
              >
                {/* Decorative top gradient bar */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${gradientAccent}`} />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-white to-slate-100 border border-slate-200 group-hover:scale-105 transition-transform shadow-2xs">
                      {getDeptIcon(dept.iconName)}
                    </div>
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 text-[#0e0fed] border border-blue-200/80">
                      {dept.code}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#0e0fed] transition-colors leading-snug">
                    {dept.name}
                  </h3>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed font-medium">
                    {dept.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-600 font-bold">
                    <span className="text-[#0e0fed]">{deptPapersCount}</span> papers available
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#0e0fed] group-hover:translate-x-1.5 transition-transform">
                    <span>Explore</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. RECENTLY UPLOADED PAPERS WITH GRADIENT SURFACES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#0e0fed]">
              Fresh Additions
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Recently Uploaded Papers
            </h2>
            <p className="text-sm text-slate-700 font-medium mt-1">
              Latest semester examination papers submitted to the university database.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('recent')}
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#0e0fed] hover:underline whitespace-nowrap self-start md:self-auto magnetic-target"
            data-magnetic="true"
          >
            <span>View All Recent Papers</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {recentPapers.length === 0 ? (
          <div className="text-center py-12 bg-white/90 border border-slate-200 rounded-3xl p-8">
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
                className="bg-white/90 border border-cyan-200/60 rounded-3xl p-5 hover:border-[#0e0fed]/50 transition-all flex flex-col justify-between group shadow-xs hover:shadow-lg relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-extrabold px-2.5 py-0.5 rounded-md bg-gradient-to-r from-emerald-50 to-cyan-50 text-emerald-800 border border-emerald-200">
                      {paper.subjectCode}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-gradient-to-r from-slate-100 to-blue-50 text-slate-700 border border-slate-200">
                      {paper.examinationType}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#0e0fed] transition-colors leading-snug line-clamp-1">
                    {paper.subjectName}
                  </h4>

                  <div className="text-xs text-slate-600 mt-2 space-y-1 font-medium">
                    <div className="flex items-center gap-1.5 truncate">
                      <GraduationCap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">{paper.departmentName}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-500 text-[11px] font-semibold">
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
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 text-[#0e0fed] text-xs font-extrabold border border-blue-200/60 transition-colors magnetic-target"
                    data-magnetic="true"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View PDF</span>
                  </button>

                  <button
                    onClick={() => onDownloadPaper(paper)}
                    className="flex items-center justify-center p-2 rounded-xl bg-gradient-to-r from-[#8bf0ba] to-[#94f0f1] hover:opacity-90 text-slate-900 transition-all shadow-2xs magnetic-target"
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

      {/* 5. MULTI-COLOR GRADIENT CALLOUT BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-[#0e0fed] via-[#1d4ed8] to-[#94f0f1] p-8 sm:p-12 overflow-hidden shadow-2xl text-white">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#ffdc6a]/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-[#f2b1d8]/30 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-block px-3.5 py-1 rounded-full bg-[#8bf0ba] text-slate-950 text-xs font-extrabold uppercase tracking-wider shadow-sm">
              Smart Exam Strategy
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight">
              Analyze Question Trends &amp; Ace Your Semester Exams
            </h2>
            <p className="text-sm text-blue-100 leading-relaxed font-semibold">
              Practicing previous year papers is proven to boost examination scores by up to 35%. Understand the question weighting, recurring formulas, and section-wise mark distribution.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigateTab('library')}
                className="px-7 py-3.5 rounded-2xl bg-[#ffdc6a] text-slate-950 font-extrabold text-xs sm:text-sm hover:bg-[#ffe58f] transition-all shadow-lg active:scale-95 magnetic-target"
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
