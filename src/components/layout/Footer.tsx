import React from 'react';
import { 
  MapPin, 
  Database,
  Sparkles
} from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full relative border-t border-cyan-200/60 bg-gradient-to-b from-white/70 via-cyan-50/40 to-emerald-50/60 text-slate-700 text-sm mt-24">
      
      {/* Decorative top gradient ribbon */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8bf0ba] via-[#94f0f1] via-[#0e0fed] via-[#f2b1d8] to-[#ffdc6a]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand & University Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden p-0.5 bg-gradient-to-tr from-[#8bf0ba] to-[#f2b1d8] shadow-xs">
                <div className="w-full h-full bg-white rounded-[10px] overflow-hidden flex items-center justify-center">
                  <img 
                    src="/assets/aistudio/MJPRUWebsiteLogo_a2dc68a8.png" 
                    alt="MJPRU Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <span className="text-lg font-extrabold text-slate-900 tracking-tight">
                MJPRU <span className="gradient-text-vibrant">PYQ</span>
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Independent student-first Previous Year Question Paper library for M.J.P. Rohilkhand University students, Bareilly, Uttar Pradesh.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-700 font-semibold">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              <span>Pilibhit Bypass Road, Bareilly, UP 243006</span>
            </div>
          </div>

          {/* Quick Academic Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
              Academic Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button 
                  onClick={() => onNavigate('departments')} 
                  className="hover:text-[#0e0fed] transition-colors text-left font-bold"
                >
                  B.Tech Engineering Departments
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('library')} 
                  className="hover:text-[#0e0fed] transition-colors text-left font-bold"
                >
                  Browse Question Paper Library
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('recent')} 
                  className="hover:text-[#0e0fed] transition-colors text-left font-bold"
                >
                  Recently Uploaded Examination Papers
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('about')} 
                  className="hover:text-[#0e0fed] transition-colors text-left font-bold"
                >
                  Examination Patterns &amp; Syllabus Guide
                </button>
              </li>
            </ul>
          </div>

          {/* B.Tech Departments */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
              Featured Branches
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li>Computer Science &amp; Information Technology</li>
              <li>Computer Science &amp; Artificial Intelligence</li>
              <li>Electronics &amp; Communication Engineering</li>
              <li>Electrical Engineering &amp; Mechanical Engg.</li>
              <li>Chemical &amp; Instrumentation Engineering</li>
            </ul>
          </div>

          {/* Infrastructure & Backend */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
              Backend &amp; Platform
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Powered by Supabase Cloud Storage, PostgreSQL database schemas, and Row-Level Security.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('admin')}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-800 bg-white/90 border border-cyan-300 rounded-xl hover:border-[#0e0fed] hover:text-[#0e0fed] transition-all shadow-xs magnetic-target"
                data-magnetic="true"
              >
                <Database className="w-3.5 h-3.5 text-[#0e0fed]" />
                <span>Supabase Configuration &amp; SQL</span>
              </button>
            </div>
          </div>

        </div>

        {/* Clear Disclaimer & Acknowledgement */}
        <div className="mt-10 pt-6 border-t border-cyan-200/60 space-y-3">
          <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
            <span className="font-bold text-slate-700">Disclaimer:</span> MJPRU PYQ is an independent, student-focused educational resource. It is not an official website of M.J.P. Rohilkhand University and is not affiliated with, endorsed by, or operated by the university. University names and academic references are used only for identification and educational purposes.
          </p>
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 font-medium">
            <span className="inline-flex items-center gap-1.5 font-semibold text-slate-600">
              <span>Independently created by an MJPRU student 💚</span>
            </span>
          </div>
        </div>

        {/* Bottom Credits & Copyright */}
        <div className="mt-6 pt-4 border-t border-cyan-200/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <div>
            &copy; {new Date().getFullYear()} MJPRU PYQ &bull; Independent Academic Resource for MJPRU Students.
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('about')} className="hover:text-slate-800 font-bold">
              Academic Disclaimer
            </button>
            <span>&bull;</span>
            <button onClick={() => onNavigate('admin')} className="hover:text-slate-800 font-bold">
              Admin Portal
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
