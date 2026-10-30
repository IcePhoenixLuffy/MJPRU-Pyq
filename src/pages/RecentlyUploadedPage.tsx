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
import { formatBytes } from '../utils/helpers';

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
      
      {/* Header */}
      <div className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-[#0e0fed]">
          Chronological Submissions
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Recently Uploaded Question Papers
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
          Stay up to date with newly digitized question papers uploaded by university academic faculties and contributors.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
        <div className="flex-1 max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search recent uploads..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0e0fed]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 font-bold shrink-0">Department:</span>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#0e0fed]"
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

      {/* Paper Cards Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8 shadow-xs">
          <FileText className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No recently uploaded papers match your criteria</h3>
          <p className="text-xs text-slate-500 mt-1">Try resetting the department or search filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((paper) => (
            <div
              key={paper.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-5 hover:border-[#0e0fed]/40 transition-all flex flex-col justify-between group shadow-xs hover:shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-[#0e0fed] border border-blue-100">
                    {paper.subjectCode}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono font-medium">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>Uploaded {formatDate(paper.uploadedAt)}</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0e0fed] transition-colors leading-snug line-clamp-2">
                  {paper.subjectName}
                </h3>

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
                    <span>{paper.examinationType}</span>
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

    </div>
  );
};
