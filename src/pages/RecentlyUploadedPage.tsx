import React, { useState } from 'react';
import { 
  Eye, 
  Download, 
  GraduationCap, 
  FileText, 
  Clock, 
  Search 
} from 'lucide-react';
import { QuestionPaper, Department } from '../types';
import { formatBytes, formatSessionOrYear } from '../utils/helpers';

interface RecentlyUploadedPageProps {
  papers: QuestionPaper[];
  departments: Department[];
  onViewPaper: (paper: QuestionPaper) => void;
  onDownloadPaper: (paper: QuestionPaper) => void;
}

export const RecentlyUploadedPage: React.FC<RecentlyUploadedPageProps> = ({
  papers,
  departments,
  onViewPaper,
  onDownloadPaper,
}) => {
  const [selectedDept, setSelectedDept] = useState('all');
  const [search, setSearch] = useState('');

  const sorted = [...papers].sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );

  const filtered = sorted.filter((p) => {
    if (selectedDept !== 'all' && p.departmentId !== selectedDept) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = p.subjectName?.toLowerCase().includes(q);
      const matchCode = p.subjectCode?.toLowerCase().includes(q);
      const matchDept = p.departmentName?.toLowerCase().includes(q);
      return matchName || matchCode || matchDept;
    }
    return true;
  });

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner with Gradient Backing */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-white/60 bg-gradient-to-r from-white/90 via-[#94f0f1]/25 to-[#f2b1d8]/30 shadow-sm backdrop-blur-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#8bf0ba]/30 to-[#ffdc6a]/30 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
        <div className="relative space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-[#0e0fed]/20 text-[11px] font-extrabold uppercase tracking-wider text-[#0e0fed] shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#0e0fed] animate-pulse" />
            <span>Chronological Submissions</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Recently Uploaded <span className="gradient-text-primary">Question Papers</span>
          </h1>
          <p className="text-sm text-slate-700 max-w-2xl leading-relaxed font-medium">
            Stay up to date with newly digitized question papers uploaded for student examination preparation.
          </p>
        </div>
      </div>

      {/* Filter Bar with Gradient Border */}
      <div className="p-0.5 rounded-2xl bg-gradient-to-r from-[#8bf0ba]/60 via-[#94f0f1]/60 to-[#f2b1d8]/60 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white/95 rounded-[14px] p-4 backdrop-blur-sm">
          <div className="flex-1 max-w-md relative">
            <Search className="w-4 h-4 text-[#0e0fed] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search recent uploads..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0e0fed] font-medium"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-700 font-extrabold shrink-0">Department:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0e0fed] cursor-pointer"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.code} - {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Paper Cards Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white/90 border border-slate-200/90 rounded-3xl p-8 shadow-xs">
          <FileText className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            {papers.length === 0 ? 'No question papers uploaded yet' : 'No recently uploaded papers match your criteria'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {papers.length === 0
              ? 'New examination question papers will appear here in chronological order once uploaded through the Admin Portal.'
              : 'Try resetting the department or search filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((paper, index) => {
            const ribbons = [
              'from-[#8bf0ba] to-[#94f0f1]',
              'from-[#f2b1d8] to-[#ffdc6a]',
              'from-[#94f0f1] to-[#0e0fed]',
              'from-[#8bf0ba] to-[#f2b1d8]',
            ];
            const ribbonClass = ribbons[index % ribbons.length];

            return (
              <div
                key={paper.id}
                className="relative bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl overflow-hidden hover:border-[#0e0fed]/50 transition-all flex flex-col justify-between group shadow-sm hover:shadow-xl magnetic-target"
                data-magnetic="true"
              >
                {/* Colorful top accent stripe */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${ribbonClass}`} />

                <div className="p-5">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-extrabold px-2.5 py-0.5 rounded-lg bg-blue-50 text-[#0e0fed] border border-blue-200 shadow-2xs">
                      {paper.subjectCode}
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-mono font-bold bg-amber-50 border border-amber-200/70 px-2 py-0.5 rounded-md">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>{formatDate(paper.uploadedAt)}</span>
                    </div>
                  </div>

                  <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-[#0e0fed] transition-colors leading-snug line-clamp-2">
                    {paper.subjectName}
                  </h3>

                  <div className="text-xs text-slate-600 mt-2 space-y-1.5">
                    <div className="flex items-center gap-1.5 truncate font-medium">
                      <GraduationCap className="w-3.5 h-3.5 text-[#0e0fed] shrink-0" />
                      <span className="truncate">{paper.departmentName}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-slate-500 text-[11px] font-semibold">
                      <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-700">Sem {paper.semesterNumber}</span>
                      <span>&bull;</span>
                      <span className="px-1.5 py-0.5 bg-blue-50 text-[#0e0fed] font-bold rounded">Session {formatSessionOrYear(paper.examinationYear)}</span>
                      <span>&bull;</span>
                      <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded">{paper.examinationType}</span>
                      <span>&bull;</span>
                      <span className="font-mono text-slate-500">{formatBytes(paper.fileSizeBytes)}</span>
                    </div>
                  </div>

                  {paper.description && (
                    <p className="text-[11px] text-slate-600 mt-2 line-clamp-2 italic bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                      {paper.description}
                    </p>
                  )}
                </div>

                <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onViewPaper(paper)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-gradient-to-r hover:from-[#94f0f1]/30 hover:to-[#8bf0ba]/30 hover:text-[#0e0fed] text-slate-800 text-xs font-extrabold transition-all border border-slate-200/80 magnetic-target"
                    data-magnetic="true"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#0e0fed]" />
                    <span>View Paper</span>
                  </button>

                  <button
                    onClick={() => onDownloadPaper(paper)}
                    className="flex items-center justify-center p-2 rounded-xl bg-slate-100 hover:bg-[#8bf0ba] hover:text-slate-900 text-slate-700 transition-all border border-slate-200/80 shadow-2xs magnetic-target"
                    title="Download PDF"
                    aria-label={`Download ${paper.subjectName} PDF`}
                    data-magnetic="true"
                  >
                    <Download className="w-4 h-4 text-slate-800" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
