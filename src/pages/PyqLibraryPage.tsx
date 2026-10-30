import React, { useState, useMemo } from 'react';
import { 
  Filter, 
  Search, 
  GraduationCap, 
  Download, 
  Eye, 
  RotateCcw, 
  LayoutGrid, 
  List, 
  FileText,
  SlidersHorizontal
} from 'lucide-react';
import { Department, AcademicYear, Semester, Subject, QuestionPaper, FilterState, ExaminationType } from '../types';
import { formatBytes, filterQuestionPapers } from '../utils/helpers';

interface PyqLibraryPageProps {
  departments: Department[];
  academicYears: AcademicYear[];
  semesters: Semester[];
  subjects: Subject[];
  papers: QuestionPaper[];
  onViewPaper: (paper: QuestionPaper) => void;
  onDownloadPaper: (paper: QuestionPaper) => void;
  initialDepartmentId?: string;
  initialQuery?: string;
}

export const PyqLibraryPage: React.FC<PyqLibraryPageProps> = ({
  departments,
  academicYears,
  semesters,
  subjects,
  papers,
  onViewPaper,
  onDownloadPaper,
  initialDepartmentId = 'all',
  initialQuery = '',
}) => {
  const [filters, setFilters] = useState<FilterState>({
    departmentId: initialDepartmentId || 'all',
    academicYearId: 'all',
    semesterId: 'all',
    subjectId: 'all',
    examinationYear: 'all',
    examinationType: 'all',
    searchQuery: initialQuery || '',
    sortBy: 'newest',
  });

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const availableSemesters = useMemo(() => {
    if (filters.academicYearId && filters.academicYearId !== 'all') {
      return semesters.filter((s) => s.academicYearId === filters.academicYearId);
    }
    return semesters;
  }, [filters.academicYearId, semesters]);

  const availableSubjects = useMemo(() => {
    return subjects.filter((s) => {
      if (filters.departmentId !== 'all' && s.departmentId !== filters.departmentId) return false;
      if (filters.semesterId !== 'all' && s.semesterId !== filters.semesterId) return false;
      return true;
    });
  }, [filters.departmentId, filters.semesterId, subjects]);

  const availableExamYears = useMemo(() => {
    const years = Array.from(new Set(papers.map((p) => p.examinationYear))).sort((a, b) => b - a);
    return years;
  }, [papers]);

  const examTypes: ExaminationType[] = [
    'Regular',
    'Back Paper',
    'Carry Over',
    'Improvement',
    'Mid-Term',
    'End-Term',
  ];

  const filteredPapers = useMemo(() => {
    return filterQuestionPapers(papers, filters);
  }, [papers, filters]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'academicYearId' && value !== 'all') {
        const s = semesters.find((sem) => sem.id === prev.semesterId);
        if (s && s.academicYearId !== value) {
          next.semesterId = 'all';
        }
      }
      if (key === 'departmentId' || key === 'semesterId') {
        next.subjectId = 'all';
      }
      return next;
    });
  };

  const handleResetFilters = () => {
    setFilters({
      departmentId: 'all',
      academicYearId: 'all',
      semesterId: 'all',
      subjectId: 'all',
      examinationYear: 'all',
      examinationType: 'all',
      searchQuery: '',
      sortBy: 'newest',
    });
  };

  const activeFilterCount = [
    filters.departmentId !== 'all',
    filters.academicYearId !== 'all',
    filters.semesterId !== 'all',
    filters.subjectId !== 'all',
    filters.examinationYear !== 'all',
    filters.examinationType !== 'all',
    Boolean(filters.searchQuery),
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-[#94f0f1]/40 to-[#0e0fed]/20 border border-blue-200 text-xs font-extrabold text-[#0e0fed]">
            Archival Catalog
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
            Browse Question Paper <span className="gradient-text-vibrant">Library</span>
          </h1>
          <p className="text-sm text-slate-700 font-medium mt-1 max-w-xl">
            Navigate through university department, academic year, semester, and subjects.
          </p>
        </div>

        {/* View switcher & filter button on mobile */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-xs font-bold text-slate-800 border border-cyan-300 shadow-xs"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#0e0fed]" />
            <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
          </button>

          <div className="hidden sm:flex items-center bg-white border border-cyan-200/80 rounded-2xl p-1 text-slate-600 shadow-xs">
            <button
              onClick={() => setViewMode('grid')}
              aria-label="Grid View"
              className={`p-1.5 rounded-xl transition-colors ${
                viewMode === 'grid' ? 'bg-gradient-to-r from-blue-50 to-cyan-50 text-[#0e0fed] font-extrabold shadow-2xs' : 'hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              aria-label="List View"
              className={`p-1.5 rounded-xl transition-colors ${
                viewMode === 'list' ? 'bg-gradient-to-r from-blue-50 to-cyan-50 text-[#0e0fed] font-extrabold shadow-2xs' : 'hover:text-slate-900'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Filter Sidebar + Papers Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Filter Controls Sidebar in styled card */}
        <aside className={`lg:col-span-3 space-y-5 bg-white/95 border border-cyan-200/80 rounded-3xl p-6 shadow-xs relative overflow-hidden ${
          mobileFilterOpen ? 'block' : 'hidden lg:block'
        }`}>
          {/* Subtle top gradient line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8bf0ba] via-[#94f0f1] to-[#f2b1d8]" />

          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
              <Filter className="w-4 h-4 text-[#0e0fed]" />
              <span>Hierarchical Filters</span>
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-xs text-slate-600 hover:text-[#0e0fed] font-extrabold transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Search Query inside library */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">Search Within Library</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filters.searchQuery}
                onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                placeholder="Subject code, keyword..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0e0fed]"
              />
            </div>
          </div>

          {/* Department Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">Department</label>
            <select
              value={filters.departmentId}
              onChange={(e) => handleFilterChange('departmentId', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#0e0fed]"
            >
              <option value="all">All Departments ({departments.length})</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.code} - {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Academic Year Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">Academic Year</label>
            <select
              value={filters.academicYearId}
              onChange={(e) => handleFilterChange('academicYearId', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#0e0fed]"
            >
              <option value="all">All Academic Years (1st - 4th)</option>
              {academicYears.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.name}
                </option>
              ))}
            </select>
          </div>

          {/* Semester Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">Semester</label>
            <select
              value={filters.semesterId}
              onChange={(e) => handleFilterChange('semesterId', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#0e0fed]"
            >
              <option value="all">All Semesters (1 - 8)</option>
              {availableSemesters.map((s) => (
                <option key={s.id} value={s.id}>
                  Semester {s.semesterNumber}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">Subject</label>
            <select
              value={filters.subjectId}
              onChange={(e) => handleFilterChange('subjectId', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#0e0fed]"
            >
              <option value="all">All Subjects ({availableSubjects.length})</option>
              {availableSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.subjectCode} - {s.subjectName}
                </option>
              ))}
            </select>
          </div>

          {/* Examination Year Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">Examination Year</label>
            <select
              value={filters.examinationYear}
              onChange={(e) => handleFilterChange('examinationYear', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#0e0fed]"
            >
              <option value="all">All Examination Years</option>
              {availableExamYears.map((yr) => (
                <option key={yr} value={yr.toString()}>
                  Year {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Examination Type Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">Examination Type</label>
            <select
              value={filters.examinationType}
              onChange={(e) => handleFilterChange('examinationType', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#0e0fed]"
            >
              <option value="all">All Examination Types</option>
              {examTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-800">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#0e0fed]"
            >
              <option value="newest">Recently Uploaded First</option>
              <option value="oldest">Oldest First</option>
              <option value="year_desc">Exam Year (2024 to 2020)</option>
              <option value="downloads">Most Downloaded</option>
            </select>
          </div>
        </aside>

        {/* Papers Results Section */}
        <div className="lg:col-span-9 space-y-4">
          
          {/* Results Summary Bar with subtle gradient border */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-white/95 border border-cyan-200/80 rounded-2xl text-xs text-slate-700 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[#0e0fed] font-mono text-sm tabular-nums">
                {filteredPapers.length}
              </span>
              <span className="font-bold">Question Papers Found</span>
              {activeFilterCount > 0 && (
                <span className="text-slate-500 font-medium">
                  &bull; {activeFilterCount} active filters
                </span>
              )}
            </div>

            {activeFilterCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-[#0e0fed] hover:underline font-extrabold"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Empty State */}
          {filteredPapers.length === 0 ? (
            <div className="text-center py-20 bg-white/95 border border-slate-200 rounded-3xl p-8 space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
                <FileText className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-base font-bold text-slate-800">No question papers match your filters</h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Try broadening your search query, selecting another semester or exam type, or resetting filters.
                </p>
                <div className="pt-4">
                  <button
                    onClick={handleResetFilters}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 text-[#0e0fed] font-extrabold text-xs rounded-xl transition-all magnetic-target"
                    data-magnetic="true"
                  >
                    Reset All Filters
                  </button>
                </div>
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPapers.map((paper, idx) => {
                const ribbonGradient = idx % 2 === 0 ? 'from-[#8bf0ba] to-[#94f0f1]' : 'from-[#f2b1d8] to-[#ffdc6a]';

                return (
                  <div
                    key={paper.id}
                    className="bg-white/95 border border-cyan-200/80 rounded-3xl p-5 hover:border-[#0e0fed]/50 transition-all flex flex-col justify-between group shadow-xs hover:shadow-xl relative overflow-hidden"
                  >
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${ribbonGradient}`} />

                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded-md bg-gradient-to-r from-emerald-50 to-cyan-50 text-emerald-800 border border-emerald-200">
                          {paper.subjectCode}
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {paper.examinationType}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0e0fed] transition-colors leading-snug line-clamp-2">
                        {paper.subjectName}
                      </h3>

                      <div className="text-xs text-slate-600 mt-3 space-y-1 font-medium">
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

                      {paper.description && (
                        <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 italic">
                          {paper.description}
                        </p>
                      )}
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
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="bg-white/95 border border-cyan-200/80 rounded-3xl divide-y divide-slate-100 overflow-hidden shadow-xs">
              {filteredPapers.map((paper) => (
                <div
                  key={paper.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded-md bg-blue-50 text-[#0e0fed] border border-blue-200">
                        {paper.subjectCode}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {paper.examinationType}
                      </span>
                      <span className="text-xs text-slate-600 font-mono font-bold">
                        Exam Year: {paper.examinationYear}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">
                      {paper.subjectName}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-medium">
                      <span>{paper.departmentName}</span>
                      <span>&bull;</span>
                      <span>Semester {paper.semesterNumber}</span>
                      <span>&bull;</span>
                      <span>{formatBytes(paper.fileSizeBytes)}</span>
                      <span>&bull;</span>
                      <span>{paper.downloadCount} downloads</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onViewPaper(paper)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 text-[#0e0fed] text-xs font-extrabold border border-blue-200 transition-colors magnetic-target"
                      data-magnetic="true"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View PDF</span>
                    </button>

                    <button
                      onClick={() => onDownloadPaper(paper)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#8bf0ba] to-[#94f0f1] hover:opacity-90 text-slate-900 text-xs font-extrabold transition-colors magnetic-target"
                      data-magnetic="true"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
