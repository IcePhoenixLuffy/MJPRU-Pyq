import React, { useState } from 'react';
import { 
  X, 
  Download, 
  FileText, 
  Calendar, 
  GraduationCap, 
  BookOpen, 
  Layers,
  ExternalLink,
  Printer,
  ShieldCheck,
  Maximize2
} from 'lucide-react';
import { QuestionPaper } from '../../types';
import { resolvePdfUrl, downloadQuestionPaperPdf } from '../../utils/pdfGenerator';
import { formatBytes } from '../../utils/helpers';

interface PdfViewerModalProps {
  paper: QuestionPaper | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: (paper: QuestionPaper) => void;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  paper,
  isOpen,
  onClose,
  onDownload,
}) => {
  const [loadError, setLoadError] = useState<boolean>(false);

  if (!isOpen || !paper) return null;

  const pdfUrl = resolvePdfUrl(paper.filePath);

  const handleDownload = () => {
    downloadQuestionPaperPdf(paper);
    if (onDownload) onDownload(paper);
  };

  const handleOpenExternal = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handlePrint = () => {
    if (pdfUrl) {
      const printWindow = window.open(pdfUrl, '_blank');
      if (printWindow) {
        printWindow.focus();
      } else {
        window.print();
      }
    } else {
      window.print();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-md transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-modal-title"
    >
      <div className="relative w-full max-w-6xl h-[94vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden">
        {/* Top 5-color accent ribbon */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#8bf0ba] via-[#94f0f1] via-[#0e0fed] via-[#f2b1d8] to-[#ffdc6a]" />
        
        {/* Top Control Bar */}
        <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-white border-b border-slate-200 text-slate-800 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-[#94f0f1]/30 to-[#8bf0ba]/30 text-[#0e0fed] border border-blue-100 shadow-2xs">
              <FileText className="w-5 h-5 text-[#0e0fed]" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <h2 id="pdf-modal-title" className="text-sm font-black text-slate-900 truncate">
                  {paper.subjectCode} &bull; {paper.subjectName}
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Original PDF</span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold mt-0.5">
                <span>{paper.departmentName}</span>
                <span>&bull;</span>
                <span className="font-mono text-[#0e0fed] font-bold">{paper.examinationYear} ({paper.examinationType})</span>
              </div>
            </div>
          </div>

          {/* Viewer Toolbar */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Open in New Window */}
            {pdfUrl && (
              <button
                onClick={handleOpenExternal}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors magnetic-target"
                title="Open PDF in new browser tab"
                data-magnetic="true"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">Open in Tab</span>
              </button>
            )}

            {/* Print */}
            <button
              onClick={handlePrint}
              aria-label="Print Document"
              title="Print question paper"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shadow-2xs magnetic-target hidden sm:block"
              data-magnetic="true"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-[#0e0fed] to-[#2563eb] hover:opacity-95 transition-all shadow-md active:scale-95 magnetic-target"
              data-magnetic="true"
            >
              <Download className="w-3.5 h-3.5 text-[#8bf0ba]" />
              <span>Download PDF</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              aria-label="Close PDF Viewer"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors ml-1 magnetic-target"
              data-magnetic="true"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Paper Metadata Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-2 bg-slate-50 border-b border-slate-200 text-xs text-slate-600 font-semibold">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-700">
              <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
              {paper.departmentName}
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <BookOpen className="w-3.5 h-3.5 text-pink-600" />
              Semester {paper.semesterNumber || 2}
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              Year {paper.examinationYear}
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              {paper.examinationType} Exam
            </span>
          </div>

          <div className="text-slate-500 font-mono text-[11px] font-bold">
            Size: {formatBytes(paper.fileSizeBytes)} &bull; Supabase Storage Verified
          </div>
        </div>

        {/* Document Canvas Body: Real PDF Frame */}
        <div className="flex-1 w-full h-full min-h-0 bg-slate-950/90 p-2 sm:p-4 flex flex-col items-center justify-center relative overflow-hidden">
          {pdfUrl && !loadError ? (
            <div className="w-full h-full flex flex-col rounded-2xl overflow-hidden bg-slate-900 border border-slate-700/80 shadow-2xl relative">
              <iframe
                src={`${pdfUrl}#view=FitH&toolbar=1`}
                title={`${paper.subjectCode} - ${paper.subjectName} Examination Paper`}
                className="w-full h-full min-h-[500px] border-0 rounded-2xl bg-white"
                onError={() => setLoadError(true)}
              />
            </div>
          ) : (
            <div className="text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md mx-auto space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <FileText className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  {loadError ? 'Could not embed PDF inline' : 'No question papers uploaded yet'}
                </h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {loadError 
                    ? 'Your browser may restrict inline frame previews for this document. You can open the file directly in a new tab or download it.'
                    : 'No question paper document is available for this course record yet.'}
                </p>
              </div>
              {pdfUrl && (
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                  <button
                    onClick={handleOpenExternal}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0e0fed] hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Open in Fullscreen Tab</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download File</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Bar Footer */}
        <footer className="flex items-center justify-between px-6 py-2.5 bg-white border-t border-slate-200 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-700">
              Direct Supabase Storage Stream &bull; {paper.fileName}
            </span>
          </div>
          <div className="flex items-center gap-3 font-semibold">
            {pdfUrl && (
              <button
                onClick={handleOpenExternal}
                className="hover:text-[#0e0fed] transition-colors magnetic-target hidden sm:inline"
                data-magnetic="true"
              >
                Fullscreen View
              </button>
            )}
            <span className="hidden sm:inline">&bull;</span>
            <button
              onClick={onClose}
              className="hover:text-[#0e0fed] transition-colors magnetic-target"
              data-magnetic="true"
            >
              Back to Library
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
