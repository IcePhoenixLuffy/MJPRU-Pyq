import React from 'react';
import { 
  Mail, 
  MapPin, 
  GraduationCap, 
  UploadCloud, 
  FileQuestion, 
  MessageSquare, 
  Clock, 
  ShieldAlert, 
  BookOpen,
  ArrowRight
} from 'lucide-react';

interface ContactPageProps {
  onNavigateTab: (tab: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigateTab }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl p-8 sm:p-12 border border-white/70 bg-gradient-to-br from-white/95 via-[#94f0f1]/25 to-[#f2b1d8]/30 shadow-lg text-center backdrop-blur-md space-y-5">
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-[#8bf0ba]/35 via-[#94f0f1]/30 to-[#ffdc6a]/30 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-[#f2b1d8]/30 to-[#ffdc6a]/30 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 border border-[#0e0fed]/25 text-xs font-black text-[#0e0fed] shadow-xs">
            <MessageSquare className="w-4 h-4 text-[#0e0fed]" />
            <span>Student Academic Helpdesk</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Connect with the{' '}
            <span className="gradient-text-primary block mt-1">MJPRU PYQ Project</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-700 max-w-2xl mx-auto leading-relaxed font-medium">
            Have questions about previous year question papers, want to contribute question paper PDFs for your branch, or noticed a missing syllabus course? We are here to help.
          </p>
        </div>
      </div>

      {/* 3-Column Contact / Channels Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: University Campus Location */}
        <div className="relative bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-sm hover:shadow-md transition-all overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-[#8bf0ba] to-[#94f0f1] absolute top-0 left-0" />
          <div className="p-3 rounded-2xl bg-emerald-100/70 text-emerald-800 border border-emerald-200 w-fit">
            <MapPin className="w-5 h-5 text-emerald-700" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-extrabold text-slate-900">University Campus</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Mahatma Jyotiba Phule Rohilkhand University
            </p>
            <p className="text-xs text-slate-500 font-semibold">
              Pilibhit Bypass Road, Bareilly, Uttar Pradesh 243006
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] font-bold text-emerald-700 flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Faculty of Engineering &amp; Technology</span>
          </div>
        </div>

        {/* Card 2: Question Paper Contributions */}
        <div className="relative bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-sm hover:shadow-md transition-all overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-[#94f0f1] to-[#0e0fed] absolute top-0 left-0" />
          <div className="p-3 rounded-2xl bg-blue-100/70 text-blue-800 border border-blue-200 w-fit">
            <UploadCloud className="w-5 h-5 text-[#0e0fed]" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-extrabold text-slate-900">Paper Submissions</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Have hard-copy or digitized question papers for recent semesters?
            </p>
            <p className="text-xs text-slate-500 font-semibold">
              Upload digitized PDF copies directly through the Administrator Portal.
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => onNavigateTab('admin')}
              className="text-[11px] font-black text-[#0e0fed] hover:underline flex items-center gap-1"
            >
              <span>Open Admin Portal</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 3: Academic Inquiries */}
        <div className="relative bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-sm hover:shadow-md transition-all overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-[#f2b1d8] to-[#ffdc6a] absolute top-0 left-0" />
          <div className="p-3 rounded-2xl bg-pink-100/70 text-pink-800 border border-pink-200 w-fit">
            <Mail className="w-5 h-5 text-pink-700" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-extrabold text-slate-900">Academic Inquiries</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              For syllabus mapping questions or indexing suggestions:
            </p>
            <p className="font-mono text-xs text-slate-800 font-bold">
              mjpru.pyq.library@gmail.com
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] font-bold text-pink-700 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Response within 24–48 hours</span>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions / Guidance */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm overflow-hidden relative">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#8bf0ba] via-[#94f0f1] to-[#0e0fed] absolute top-0 left-0" />
        
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#0e0fed]">
            <FileQuestion className="w-4 h-4 text-[#0e0fed]" />
            <span>Common Queries</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2">
            <h4 className="text-sm font-black text-slate-900">
              Are these official university papers?
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Yes, these are authentic past examination papers conducted by M.J.P. Rohilkhand University for B.Tech semester examinations, digitized and preserved by students.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2">
            <h4 className="text-sm font-black text-slate-900">
              How do I request a missing paper?
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              If your department or semester has an unlisted paper, check the Departments page or email our student library archive with the subject code and semester details.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2">
            <h4 className="text-sm font-black text-slate-900">
              Can I access papers on mobile phones?
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Yes! The website is fully mobile-responsive and supports instant in-browser PDF previewing and direct one-click PDF downloads.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2">
            <h4 className="text-sm font-black text-slate-900">
              Is registration required to download papers?
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              No registration or account is required for students. Question papers are freely accessible for academic preparation without paywalls.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Navigation Action Grid */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-50/80 via-cyan-50/60 to-emerald-50/80 border border-blue-200/80 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1.5 text-center sm:text-left">
          <h3 className="text-lg font-black text-slate-900">
            Ready to explore past papers?
          </h3>
          <p className="text-xs text-slate-600 font-medium">
            Browse our full library or check your department's semester syllabus.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigateTab('departments')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:border-[#0e0fed] text-xs font-black text-slate-800 transition-all shadow-xs magnetic-target"
            data-magnetic="true"
          >
            <BookOpen className="w-4 h-4 text-[#0e0fed]" />
            <span>View Departments</span>
          </button>

          <button
            onClick={() => onNavigateTab('library')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl btn-gradient-blue text-xs font-black transition-all shadow-md magnetic-target"
            data-magnetic="true"
          >
            <span>Browse Library</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Independent Disclaimer */}
      <div className="relative bg-white/90 border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-3 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          <span>Independent Educational Resource</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
          <strong className="text-slate-800">Disclaimer:</strong> MJPRU PYQ is an independent, student-focused educational resource. It is not an official website of M.J.P. Rohilkhand University and is not affiliated with, endorsed by, or operated by the university. University names and academic references are used only for identification and educational purposes.
        </p>
      </div>
    </div>
  );
};
