import React, { useState } from 'react';
import { 
  X, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Calendar, 
  GraduationCap, 
  BookOpen, 
  Layers,
  ExternalLink,
  Printer
} from 'lucide-react';
import { QuestionPaper } from '../../types';
import { generateQuestionPaperHtml, downloadQuestionPaperPdf } from '../../utils/pdfGenerator';
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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);

  if (!isOpen || !paper) return null;

  const totalPages = paper.pageCount || 2;

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 15, 175));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 15, 60));
  const handleResetZoom = () => setZoomLevel(100);
  const handleRotate = () => setRotation((r) => (r + 90) % 360);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const handleDownload = () => {
    downloadQuestionPaperPdf(paper);
    if (onDownload) onDownload(paper);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-modal-title"
    >
      <div className="relative w-full max-w-5xl h-[92vh] flex flex-col bg-slate-100 border border-slate-200 rounded-3xl shadow-2xl overflow-hidden">
        {/* Top 5-color accent ribbon */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#8bf0ba] via-[#94f0f1] via-[#0e0fed] via-[#f2b1d8] to-[#ffdc6a]" />
        
        {/* Top Control Bar */}
        <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-white border-b border-slate-200 text-slate-800 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-[#94f0f1]/30 to-[#8bf0ba]/30 text-[#0e0fed] border border-blue-100 shadow-2xs">
              <FileText className="w-5 h-5 text-[#0e0fed]" />
            </div>
            <div className="truncate">
              <h2 id="pdf-modal-title" className="text-sm font-black text-slate-900 truncate">
                {paper.subjectCode} &bull; {paper.subjectName}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
                <span>{paper.departmentName}</span>
                <span>&bull;</span>
                <span className="font-mono text-[#0e0fed]">{paper.examinationYear} ({paper.examinationType})</span>
              </div>
            </div>
          </div>

          {/* Viewer Toolbar */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Page Navigation */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-0.5 text-xs text-slate-700 shadow-2xs">
              <button
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
                aria-label="Previous Page"
                className="p-1.5 rounded-lg hover:bg-white disabled:opacity-40 transition-colors magnetic-target"
                data-magnetic="true"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-mono text-xs font-black text-slate-800">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
                aria-label="Next Page"
                className="p-1.5 rounded-lg hover:bg-white disabled:opacity-40 transition-colors magnetic-target"
                data-magnetic="true"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center bg-slate-50 border border-slate-200 rounded-xl p-0.5 text-xs text-slate-700 shadow-2xs">
              <button
                onClick={handleZoomOut}
                aria-label="Zoom Out"
                className="p-1.5 rounded-lg hover:bg-white transition-colors magnetic-target"
                data-magnetic="true"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetZoom}
                className="px-2 font-mono text-xs font-black hover:text-[#0e0fed] transition-colors magnetic-target"
                title="Reset zoom"
                data-magnetic="true"
              >
                {zoomLevel}%
              </button>
              <button
                onClick={handleZoomIn}
                aria-label="Zoom In"
                className="p-1.5 rounded-lg hover:bg-white transition-colors magnetic-target"
                data-magnetic="true"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Rotate */}
            <button
              onClick={handleRotate}
              aria-label="Rotate Page"
              title="Rotate 90 degrees"
              className="p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-white text-slate-700 transition-colors shadow-2xs magnetic-target"
              data-magnetic="true"
            >
              <RotateCw className="w-4 h-4" />
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
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-2.5 bg-slate-50 border-b border-slate-200 text-xs text-slate-600 font-semibold">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-700">
              <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
              {paper.departmentName}
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <BookOpen className="w-3.5 h-3.5 text-pink-600" />
              Semester {paper.semesterNumber || 1}
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
            Size: {formatBytes(paper.fileSizeBytes)} &bull; Downloads: {paper.downloadCount}
          </div>
        </div>

        {/* Document Canvas Body */}
        <div className="flex-1 overflow-auto p-4 sm:p-8 bg-slate-200/60 flex justify-center items-start">
          <div 
            className="transition-transform duration-150 origin-top bg-white rounded-lg shadow-xl border border-slate-200 max-w-full"
            style={{
              transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
              width: '820px',
            }}
          >
            {/* Render authentic Question Paper HTML */}
            <div
              dangerouslySetInnerHTML={{
                __html: generateQuestionPaperHtml(paper, currentPage),
              }}
            />
          </div>
        </div>

        {/* Bottom Bar Footer */}
        <footer className="flex items-center justify-between px-6 py-3 bg-white border-t border-slate-200 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-700">M.J.P. Rohilkhand University Examination Question Paper &bull; Independent Archive</span>
          </div>
          <div className="flex items-center gap-3 font-semibold">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 hover:text-[#0e0fed] transition-colors magnetic-target"
              data-magnetic="true"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <span>&bull;</span>
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
