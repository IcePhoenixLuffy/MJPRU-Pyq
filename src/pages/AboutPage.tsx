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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">
      
      {/* Hero Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-[#0e0fed]">
          <GraduationCap className="w-4 h-4" />
          <span>About MJPRU PYQ Initiative</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
          Empowering Academic Excellence at{' '}
          <span className="gradient-text-primary">M.J.P. Rohilkhand University</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          MJPRU PYQ is an organized, open-access Previous Year Question Paper repository dedicated to engineering students across all eight semesters of B.Tech.
        </p>
      </div>

      {/* University Background Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 bg-white flex items-center justify-center shrink-0 shadow-2xs">
            <img 
              src="/assets/aistudio/MJPRUWebsiteLogo_a2dc68a8.png" 
              alt="MJPRU Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Mahatma Jyotiba Phule Rohilkhand University, Bareilly
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              <span>Established 1975 &bull; State University accredited with NAAC A++</span>
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-3 border-t border-slate-100">
          The Faculty of Engineering &amp; Technology at MJPRU Bareilly delivers world-class technical education across premier disciplines including Computer Science &amp; Information Technology, Artificial Intelligence, Electronics &amp; Communication, Electrical, Mechanical, Chemical, and Instrumentation Engineering.
        </p>
      </div>

      {/* Why PYQs are Essential */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-[#0e0fed]">
            Proven Examination Methodology
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Why Previous Year Papers Matter
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-3 shadow-xs">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 w-fit">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Pattern Recognition</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Identify core high-weightage topics and repetitive questions in Section A, B, and C across multiple academic cycles.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-3 shadow-xs">
            <div className="p-3 rounded-xl bg-cyan-50 text-cyan-600 w-fit">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Time Management</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Simulate actual 3-hour examination pressure and allocate appropriate time budgets to numerical calculations and theoretical derivations.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-3 shadow-xs">
            <div className="p-3 rounded-xl bg-pink-50 text-pink-600 w-fit">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Score Elevation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Familiarity with university marking schemes reduces exam anxiety and prepares students for Regular, Back, and Carry-over exams.
            </p>
          </div>
        </div>
      </div>

      {/* Examination Structure Breakdown */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#0e0fed]" />
          <span>Standard MJPRU B.Tech End-Semester Examination Structure</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="font-mono font-bold text-emerald-700 text-sm">Section A</div>
            <div className="font-bold text-slate-900">Objective &amp; Short Questions</div>
            <p className="text-slate-600">
              7 compulsory questions &times; 2 marks = 14 Marks total. Tests fundamental definitions and properties.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="font-mono font-bold text-blue-700 text-sm">Section B</div>
            <div className="font-bold text-slate-900">Medium Analytical Questions</div>
            <p className="text-slate-600">
              Attempt any 3 out of 5 questions &times; 7 marks = 21 Marks. Focuses on block diagrams, proofs, and numerical problems.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="font-mono font-bold text-pink-700 text-sm">Section C</div>
            <div className="font-bold text-slate-900">Comprehensive Long Questions</div>
            <p className="text-slate-600">
              Attempt any 3 out of 5 questions &times; 10 marks = 30 Marks. In-depth system design and case studies.
            </p>
          </div>
        </div>
      </div>

      {/* Contribution Callout */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-pink-50 border border-blue-200/80 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="text-lg font-bold text-slate-900">
            Have recent semester papers?
          </h3>
          <p className="text-xs text-slate-600 max-w-md">
            Faculty members and student class representatives can upload digitized PDF question papers directly via the Admin Portal.
          </p>
        </div>

        <button
          onClick={onNavigateToUpload}
          className="flex items-center gap-2 px-5 py-3 bg-[#0e0fed] text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition-all shadow-sm shrink-0 magnetic-target"
          data-magnetic="true"
        >
          <UploadCloud className="w-4 h-4 text-[#8bf0ba]" />
          <span>Upload via Admin Portal</span>
        </button>
      </div>

    </div>
  );
};
