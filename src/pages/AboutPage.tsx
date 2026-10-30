import React from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Target, 
  Clock, 
  Award, 
  MapPin, 
  UploadCloud 
} from 'lucide-react';

interface AboutPageProps {
  onNavigateToUpload: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigateToUpload }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Hero Header with Gradient Mesh Card */}
      <div className="relative overflow-hidden rounded-3xl p-8 sm:p-12 border border-white/70 bg-gradient-to-br from-white/95 via-[#94f0f1]/25 to-[#f2b1d8]/30 shadow-lg text-center backdrop-blur-md space-y-5">
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-[#8bf0ba]/35 via-[#94f0f1]/30 to-[#ffdc6a]/30 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-[#f2b1d8]/30 to-[#ffdc6a]/30 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />
        
        <div className="relative space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 border border-[#0e0fed]/25 text-xs font-black text-[#0e0fed] shadow-xs">
            <GraduationCap className="w-4 h-4 text-[#0e0fed]" />
            <span>About MJPRU PYQ Initiative</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Empowering Academic Excellence at{' '}
            <span className="gradient-text-primary block mt-1">M.J.P. Rohilkhand University</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-700 max-w-2xl mx-auto leading-relaxed font-medium">
            MJPRU PYQ is an organized, open-access Previous Year Question Paper repository dedicated to engineering students across all eight semesters of B.Tech.
          </p>
        </div>
      </div>

      {/* University Background Card */}
      <div className="relative bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#8bf0ba] via-[#94f0f1] to-[#0e0fed] absolute top-0 left-0" />
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
          <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white bg-white flex items-center justify-center shrink-0 shadow-md ring-2 ring-[#0e0fed]/20">
            <img 
              src="/assets/aistudio/MJPRUWebsiteLogo_a2dc68a8.png" 
              alt="MJPRU Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">
              Mahatma Jyotiba Phule Rohilkhand University, Bareilly
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 font-semibold mt-1">
              <span className="flex items-center gap-1 text-amber-700">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                Bareilly, Uttar Pradesh, India
              </span>
              <span>&bull;</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#0e0fed] font-bold border border-blue-200">
                Established 1975 &bull; NAAC A++ Accredited
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pt-3 border-t border-slate-100 font-medium">
          The Faculty of Engineering &amp; Technology at MJPRU Bareilly delivers world-class technical education across premier disciplines including Computer Science &amp; Information Technology, Artificial Intelligence, Electronics &amp; Communication, Electrical, Mechanical, Chemical, and Instrumentation Engineering.
        </p>
      </div>

      {/* Why PYQs are Essential */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="text-xs font-extrabold uppercase tracking-wider text-[#0e0fed]">
            Proven Examination Methodology
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Why Previous Year Papers Matter
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl p-6 space-y-3 shadow-sm hover:shadow-lg transition-all overflow-hidden group">
            <div className="h-1.5 w-full bg-gradient-to-r from-[#8bf0ba] to-[#94f0f1] absolute top-0 left-0" />
            <div className="p-3 rounded-2xl bg-[#8bf0ba]/20 text-emerald-800 border border-[#8bf0ba]/40 w-fit group-hover:scale-110 transition-transform">
              <Target className="w-5 h-5 text-emerald-700" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Pattern Recognition</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Identify core high-weightage topics and repetitive questions in Section A, B, and C across multiple academic cycles.
            </p>
          </div>

          <div className="relative bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl p-6 space-y-3 shadow-sm hover:shadow-lg transition-all overflow-hidden group">
            <div className="h-1.5 w-full bg-gradient-to-r from-[#94f0f1] to-[#0e0fed] absolute top-0 left-0" />
            <div className="p-3 rounded-2xl bg-cyan-100/60 text-cyan-800 border border-cyan-200 w-fit group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5 text-cyan-700" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Time Management</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Simulate actual 3-hour examination pressure and allocate appropriate time budgets to numerical calculations and theoretical derivations.
            </p>
          </div>

          <div className="relative bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl p-6 space-y-3 shadow-sm hover:shadow-lg transition-all overflow-hidden group">
            <div className="h-1.5 w-full bg-gradient-to-r from-[#f2b1d8] to-[#ffdc6a] absolute top-0 left-0" />
            <div className="p-3 rounded-2xl bg-pink-100/60 text-pink-800 border border-pink-200 w-fit group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5 text-pink-700" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Score Elevation</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Familiarity with university marking schemes reduces exam anxiety and prepares students for Regular, Back, and Carry-over exams.
            </p>
          </div>
        </div>
      </div>

      {/* Examination Structure Breakdown */}
      <div className="relative bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#8bf0ba] via-[#f2b1d8] to-[#ffdc6a] absolute top-0 left-0" />
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 pt-2">
          <BookOpen className="w-5 h-5 text-[#0e0fed]" />
          <span>Standard MJPRU B.Tech End-Semester Examination Structure</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-gradient-to-b from-emerald-50/60 to-white border border-emerald-200/80 rounded-2xl space-y-2">
            <div className="font-mono font-extrabold text-emerald-800 text-sm">Section A</div>
            <div className="font-bold text-slate-900">Objective &amp; Short Questions</div>
            <p className="text-slate-600 font-medium">
              7 compulsory questions &times; 2 marks = 14 Marks total. Tests fundamental definitions and properties.
            </p>
          </div>

          <div className="p-4 bg-gradient-to-b from-blue-50/60 to-white border border-blue-200/80 rounded-2xl space-y-2">
            <div className="font-mono font-extrabold text-[#0e0fed] text-sm">Section B</div>
            <div className="font-bold text-slate-900">Medium Analytical Questions</div>
            <p className="text-slate-600 font-medium">
              Attempt any 3 out of 5 questions &times; 7 marks = 21 Marks. Focuses on block diagrams, proofs, and numerical problems.
            </p>
          </div>

          <div className="p-4 bg-gradient-to-b from-pink-50/60 to-white border border-pink-200/80 rounded-2xl space-y-2">
            <div className="font-mono font-extrabold text-pink-700 text-sm">Section C</div>
            <div className="font-bold text-slate-900">Comprehensive Long Questions</div>
            <p className="text-slate-600 font-medium">
              Attempt any 3 out of 5 questions &times; 10 marks = 30 Marks. In-depth system design and case studies.
            </p>
          </div>
        </div>
      </div>

      {/* Contribution Callout */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#94f0f1]/30 via-white/95 to-[#f2b1d8]/30 border-2 border-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-6 backdrop-blur-md">
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="text-lg font-black text-slate-900">
            Have recent semester papers?
          </h3>
          <p className="text-xs text-slate-700 max-w-md font-medium">
            Faculty members and student class representatives can upload digitized PDF question papers directly via the Admin Portal.
          </p>
        </div>

        <button
          onClick={onNavigateToUpload}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0e0fed] to-[#2563eb] text-white font-extrabold text-xs rounded-xl hover:opacity-95 transition-all shadow-md shrink-0 magnetic-target active:scale-95"
          data-magnetic="true"
        >
          <UploadCloud className="w-4 h-4 text-[#8bf0ba]" />
          <span>Upload via Admin Portal</span>
        </button>
      </div>

    </div>
  );
};
