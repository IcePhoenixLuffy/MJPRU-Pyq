import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { QuestionPaper } from '../../types';
import { formatSessionOrYear, normalizeAcademicSession } from '../../utils/helpers';

interface GlobalSearchBarProps {
  onSearchSubmit: (query: string) => void;
  onSelectPaper: (paper: QuestionPaper) => void;
  availablePapers: QuestionPaper[];
  initialQuery?: string;
  placeholder?: string;
  className?: string;
}

export const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({
  onSearchSubmit,
  onSelectPaper,
  availablePapers,
  initialQuery = '',
  placeholder = 'Search by subject name, code (e.g. BCS-301), department, semester, year...',
  className = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Handle outside click to close suggestions
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Filter matches for suggestions dropdown
  const trimmed = query.trim().toLowerCase();
  const suggestions = trimmed.length >= 2
    ? availablePapers
        .filter((paper) => {
          const matchSub = paper.subjectName?.toLowerCase().includes(trimmed);
          const matchCode = paper.subjectCode?.toLowerCase().includes(trimmed);
          const matchDept = paper.departmentName?.toLowerCase().includes(trimmed);
          const rawYear = String(paper.examinationYear || '').toLowerCase();
          const normYear = normalizeAcademicSession(paper.examinationYear).toLowerCase();
          const matchYear = rawYear.includes(trimmed) || normYear.includes(trimmed);
          const matchSem = `semester ${paper.semesterNumber}`.includes(trimmed);
          return matchSub || matchCode || matchDept || matchYear || matchSem;
        })
        .slice(0, 6)
    : [];

  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
    onSearchSubmit('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsOpen(false);
      onSearchSubmit(query);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelectSuggestion = (paper: QuestionPaper) => {
    setIsOpen(false);
    onSelectPaper(paper);
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Gradient glow wrapper border */}
      <div className="relative p-0.5 rounded-2xl bg-gradient-to-r from-[#8bf0ba] via-[#94f0f1] to-[#f2b1d8] shadow-lg shadow-blue-500/10">
        <div className="relative flex items-center bg-white/95 rounded-[14px]">
          <div className="absolute left-4 pointer-events-none text-slate-400">
            <Search className="w-5 h-5 text-[#0e0fed]" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => {
              if (query.trim().length >= 2) setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full pl-12 pr-28 py-3.5 sm:py-4 bg-transparent rounded-[14px] text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#0e0fed]/20 transition-all font-medium"
          />

          {query && (
            <button
              onClick={handleClear}
              className="absolute right-24 p-1.5 text-slate-400 hover:text-slate-600 transition-colors magnetic-target"
              data-magnetic="true"
              title="Clear search"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => {
              setIsOpen(false);
              onSearchSubmit(query);
            }}
            type="button"
            className="absolute right-2 sm:right-2.5 px-4 py-2 bg-gradient-to-r from-[#0e0fed] to-[#2563eb] text-white font-extrabold text-xs rounded-xl hover:opacity-95 active:scale-95 transition-all shadow-md magnetic-target"
            data-magnetic="true"
          >
            Search
          </button>
        </div>
      </div>

      {/* Live Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 mt-2 z-50 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-2xl overflow-hidden divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-4 py-2.5 bg-gradient-to-r from-[#8bf0ba]/20 via-[#94f0f1]/20 to-[#f2b1d8]/20 text-[11px] font-bold uppercase tracking-wider text-slate-700 flex justify-between items-center border-b border-slate-100">
            <span className="flex items-center gap-1.5 font-extrabold text-slate-800">
              <span className="w-2 h-2 rounded-full bg-[#0e0fed]" />
              Matching Question Papers
            </span>
            <span className="text-slate-500 font-mono">{suggestions.length} suggestions</span>
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
            {suggestions.map((paper) => (
              <button
                key={paper.id}
                onClick={() => handleSelectSuggestion(paper)}
                className="w-full px-4 py-3 text-left hover:bg-gradient-to-r hover:from-white hover:to-blue-50/70 flex items-center justify-between gap-3 group transition-colors magnetic-target"
                data-magnetic="true"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-extrabold text-[#0e0fed] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-lg shadow-2xs">
                      {paper.subjectCode}
                    </span>
                    <span className="text-sm font-bold text-slate-800 group-hover:text-[#0e0fed] transition-colors truncate">
                      {paper.subjectName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-600 mt-1">
                    <span className="font-medium">{paper.departmentName}</span>
                    <span className="text-slate-300">&bull;</span>
                    <span className="font-semibold text-slate-700">Sem {paper.semesterNumber}</span>
                    <span className="text-slate-300">&bull;</span>
                    <span className="font-mono text-slate-600">{formatSessionOrYear(paper.examinationYear)} ({paper.examinationType})</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0e0fed] bg-blue-50 px-2.5 py-1.5 rounded-xl border border-blue-100 group-hover:bg-[#0e0fed] group-hover:text-white transition-all shrink-0 shadow-2xs">
                  <span>View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            ))}
          </div>

          <div className="p-2.5 bg-slate-50/90 text-center">
            <button
              onClick={() => {
                setIsOpen(false);
                onSearchSubmit(query);
              }}
              className="text-xs text-[#0e0fed] hover:underline font-extrabold magnetic-target inline-flex items-center gap-1"
              data-magnetic="true"
            >
              See all results for &ldquo;{query}&rdquo; &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
