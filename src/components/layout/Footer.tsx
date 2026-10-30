import React from 'react';
import { 
  MapPin, 
  Database
} from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-slate-50 border-t border-slate-200 text-slate-600 text-sm mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand & University Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl overflow-hidden border border-slate-200 bg-white flex items-center justify-center shadow-xs">
                <img 
                  src="/assets/aistudio/MJPRUWebsiteLogo_a2dc68a8.png" 
                  alt="MJPRU Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">
                MJPRU <span className="gradient-text-primary">PYQ</span>
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Official student-first Previous Year Question Paper repository for Mahatma Jyotiba Phule Rohilkhand University, Bareilly, Uttar Pradesh.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              <span>Pilibhit Bypass Road, Bareilly, UP 243006</span>
            </div>
          </div>

          {/* Quick Academic Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Academic Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button 
                  onClick={() => onNavigate('departments')} 
                  className="hover:text-[#0e0fed] transition-colors text-left font-medium"
                >
                  B.Tech Engineering Departments
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('library')} 
                  className="hover:text-[#0e0fed] transition-colors text-left font-medium"
                >
                  Browse Question Paper Library
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('recent')} 
                  className="hover:text-[#0e0fed] transition-colors text-left font-medium"
                >
                  Recently Uploaded Examination Papers
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('about')} 
                  className="hover:text-[#0e0fed] transition-colors text-left font-medium"
                >
                  Examination Patterns &amp; Syllabus Guide
                </button>
              </li>
            </ul>
          </div>

          {/* B.Tech Departments */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Featured Branches
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>Computer Science &amp; Information Technology</li>
              <li>Computer Science &amp; Artificial Intelligence</li>
              <li>Electronics &amp; Communication Engineering</li>
              <li>Electrical Engineering &amp; Mechanical Engg.</li>
              <li>Chemical &amp; Instrumentation Engineering</li>
            </ul>
          </div>

          {/* Infrastructure & Backend */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Backend &amp; Platform
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Powered by Supabase Cloud Storage, PostgreSQL database schemas, and Row-Level Security.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('admin')}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:border-[#0e0fed] hover:text-[#0e0fed] transition-colors shadow-2xs magnetic-target"
                data-magnetic="true"
              >
                <Database className="w-3.5 h-3.5 text-[#0e0fed]" />
                <span>Supabase Configuration &amp; SQL</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Credits & Copyright */}
        <div className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} MJPRU PYQ &bull; M.J.P. Rohilkhand University, Bareilly. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('about')} className="hover:text-slate-800">
              Academic Disclaimer
            </button>
            <span>&bull;</span>
            <button onClick={() => onNavigate('admin')} className="hover:text-slate-800">
              Admin Portal
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
