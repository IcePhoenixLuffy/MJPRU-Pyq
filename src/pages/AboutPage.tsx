import React, { useState } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Target, 
  Clock, 
  Award, 
  MapPin, 
  UploadCloud,
  Heart,
  ShieldAlert,
  RotateCw,
  Sparkles,
  Flame
} from 'lucide-react';

interface AboutPageProps {
  onNavigateToUpload: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigateToUpload }) => {
  const [flippedA, setFlippedA] = useState(false);
  const [flippedB, setFlippedB] = useState(false);
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Hero Header with Gradient Mesh Card */}
      <div className="relative overflow-hidden rounded-3xl p-8 sm:p-12 border border-white/70 bg-gradient-to-br from-white/95 via-[#94f0f1]/25 to-[#f2b1d8]/30 shadow-lg text-center backdrop-blur-md space-y-5">
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-[#8bf0ba]/35 via-[#94f0f1]/30 to-[#ffdc6a]/30 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-[#f2b1d8]/30 to-[#ffdc6a]/30 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />
        
        <div className="relative space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 border border-[#0e0fed]/25 text-xs font-black text-[#0e0fed] shadow-xs">
            <GraduationCap className="w-4 h-4 text-[#0e0fed]" />
            <span>Independent MJPRU PYQ Initiative</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Empowering Academic Preparation for{' '}
            <span className="gradient-text-primary block mt-1">M.J.P. Rohilkhand University Students</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-700 max-w-2xl mx-auto leading-relaxed font-medium">
            MJPRU PYQ is an independent, student-focused Previous Year Question Paper library dedicated to engineering students across all eight semesters of B.Tech.
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
              Identify core high-weightage topics and recurring questions across Section A and Section B over multiple academic cycles.
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

      {/* B.Tech End-Semester Examination Pattern (Official 60-Mark Two-Section Format) */}
      <div className="relative bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#8bf0ba] via-[#94f0f1] via-[#0e0fed] to-[#f2b1d8] absolute top-0 left-0" />
        
        {/* Header & Total Marks Display */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#0e0fed]">
              <BookOpen className="w-4 h-4 text-[#0e0fed]" />
              <span>Examination Pattern</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              B.Tech End-Semester Examination Pattern
            </h2>
          </div>

          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-50 via-cyan-50 to-emerald-50 border border-blue-200 shadow-2xs self-start sm:self-auto">
            <span className="text-xs font-bold text-slate-600">Total Marks:</span>
            <span className="font-mono text-base font-black text-[#0e0fed]">60</span>
          </div>
        </div>

        {/* Two-Section Layout: Equal Sized 3D Flip Cards Side-by-Side on Desktop, Stacked on Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Section A 3D Flip Card */}
          <div 
            className="flip-card-container group select-none min-h-[360px] sm:min-h-[340px] cursor-pointer"
            onClick={() => setFlippedA((prev) => !prev)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setFlippedA((prev) => !prev);
              }
            }}
            tabIndex={0}
            role="button"
            aria-label="Section A Examination Structure. Hover or tap to flip for playful student reaction."
          >
            <div className={`flip-card-inner min-h-[360px] sm:min-h-[340px] ${flippedA ? 'is-flipped' : ''}`}>
              
              {/* Front Face: Exactly preserved examination information */}
              <div className="flip-card-face flip-card-front w-full h-full relative overflow-hidden rounded-2xl bg-gradient-to-b from-emerald-50/70 via-white to-white border border-emerald-200/90 p-6 flex flex-col justify-between shadow-xs">
                <div className="h-1.5 w-full bg-gradient-to-r from-[#8bf0ba] to-[#94f0f1] absolute top-0 left-0" />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-xs font-black uppercase px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Section A
                      </span>
                      <h3 className="text-lg font-black text-slate-900 mt-2">
                        Section A – 30 Marks
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black font-mono text-emerald-700">30</span>
                      <span className="text-[11px] font-bold text-slate-500 block -mt-1">Marks</span>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-700">
                    <div className="flex items-center justify-between py-2 border-b border-emerald-100/80">
                      <span className="font-bold text-slate-600">Total Questions:</span>
                      <span className="font-extrabold text-slate-900">Contains 6 questions</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-emerald-100/80">
                      <span className="font-bold text-slate-600">Marks per Question:</span>
                      <span className="font-extrabold text-emerald-800">10 marks each</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-emerald-100/80">
                      <span className="font-bold text-slate-600">Attempt Required:</span>
                      <span className="font-extrabold text-[#0e0fed]">Attempt any 3 out of 6 questions</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 space-y-2.5">
                  <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200/60 text-xs text-emerald-900 font-semibold flex items-center justify-between">
                    <span>Attempt 3 &times; 10 Marks</span>
                    <span className="font-mono font-black text-sm">= 30 Marks</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold px-1">
                    <span className="flex items-center gap-1 text-emerald-700/80">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                      <span>50% question choice</span>
                    </span>
                    <span className="flex items-center gap-1 text-slate-400 group-hover:text-emerald-700 transition-colors">
                      <RotateCw className="w-3 h-3" />
                      <span>Hover or tap to flip</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Back Face: Playful student reaction & illustration */}
              <div className="flip-card-face flip-card-back absolute top-0 left-0 w-full h-full rounded-2xl bg-gradient-to-br from-emerald-50/90 via-white to-cyan-50/90 border-2 border-emerald-300 p-6 flex flex-col justify-between shadow-md">
                <div className="h-1.5 w-full bg-gradient-to-r from-[#8bf0ba] to-[#94f0f1] absolute top-0 left-0" />

                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-black uppercase px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    <span>Battle Royale Mode</span>
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Survival Rate: 50%
                  </span>
                </div>

                {/* Cute goofy student illustration */}
                <div className="my-auto py-2 text-center space-y-3">
                  <div className="relative w-20 h-20 mx-auto">
                    <svg className="w-full h-full drop-shadow-xs" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="50" cy="50" r="44" fill="url(#gradSectionA)" fillOpacity="0.35" />
                      <rect x="28" y="20" width="44" height="60" rx="8" fill="#ffffff" stroke="#059669" strokeWidth="2.5" />
                      <path d="M 36 32 L 56 32" stroke="#8bf0ba" strokeWidth="3" strokeLinecap="round" />
                      <path d="M 36 42 L 64 42" stroke="#94f0f1" strokeWidth="3" strokeLinecap="round" />
                      <path d="M 36 52 L 52 52" stroke="#94f0f1" strokeWidth="3" strokeLinecap="round" />
                      {/* Goofy cartoon eyes crying tears of relief/panic */}
                      <ellipse cx="44" cy="62" rx="3" ry="4" fill="#0f172a" />
                      <ellipse cx="56" cy="62" rx="3" ry="4" fill="#0f172a" />
                      <circle cx="45" cy="61" r="1" fill="#ffffff" />
                      <circle cx="57" cy="61" r="1" fill="#ffffff" />
                      <path d="M 39 63 C 39 68 41 69 41 66 C 41 64 39 61 39 63 Z" fill="#38bdf8" />
                      <path d="M 61 63 C 61 68 59 69 59 66 C 59 61 61 63 61 63 Z" fill="#38bdf8" />
                      <path d="M 46 71 Q 50 75 54 71" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" fill="none" />
                      <circle cx="20" cy="28" r="10" fill="#8bf0ba" stroke="#059669" strokeWidth="1.5" />
                      <text x="20" y="32" textAnchor="middle" fontSize="10" fontWeight="900" fill="#065f46">3</text>
                      <circle cx="80" cy="28" r="10" fill="#ffdc6a" stroke="#d97706" strokeWidth="1.5" />
                      <text x="80" y="32" textAnchor="middle" fontSize="10" fontWeight="900" fill="#92400e">/6</text>
                      <defs>
                        <linearGradient id="gradSectionA" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#8bf0ba" />
                          <stop offset="1" stopColor="#94f0f1" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>

                  <div className="space-y-1">
                    <p className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug px-2">
                      &ldquo;6 questions entered the exam. Only 3 need to survive. 😭&rdquo;
                    </p>
                    <p className="text-xs text-slate-600 font-medium max-w-xs mx-auto">
                      Pick your 3 strongest questions and make every working step count!
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-200/70 flex items-center justify-between text-[11px] text-emerald-800 font-bold">
                  <span>Section A &bull; 30 Marks total</span>
                  <span className="inline-flex items-center gap-1 text-slate-500 hover:text-emerald-700">
                    <RotateCw className="w-3 h-3" />
                    <span>Tap to flip back</span>
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Section B 3D Flip Card */}
          <div 
            className="flip-card-container group select-none min-h-[360px] sm:min-h-[340px] cursor-pointer"
            onClick={() => setFlippedB((prev) => !prev)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setFlippedB((prev) => !prev);
              }
            }}
            tabIndex={0}
            role="button"
            aria-label="Section B Examination Structure. Hover or tap to flip for playful student reaction."
          >
            <div className={`flip-card-inner min-h-[360px] sm:min-h-[340px] ${flippedB ? 'is-flipped' : ''}`}>
              
              {/* Front Face: Exactly preserved examination information */}
              <div className="flip-card-face flip-card-front w-full h-full relative overflow-hidden rounded-2xl bg-gradient-to-b from-blue-50/70 via-white to-white border border-blue-200/90 p-6 flex flex-col justify-between shadow-xs">
                <div className="h-1.5 w-full bg-gradient-to-r from-[#94f0f1] to-[#0e0fed] absolute top-0 left-0" />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-xs font-black uppercase px-2.5 py-1 rounded-lg bg-blue-100 text-[#0e0fed] border border-blue-200">
                        Section B
                      </span>
                      <h3 className="text-lg font-black text-slate-900 mt-2">
                        Section B – 30 Marks
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black font-mono text-[#0e0fed]">30</span>
                      <span className="text-[11px] font-bold text-slate-500 block -mt-1">Marks</span>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-700">
                    <div className="flex items-center justify-between py-2 border-b border-blue-100/80">
                      <span className="font-bold text-slate-600">Total Questions:</span>
                      <span className="font-extrabold text-slate-900">Contains 4 questions</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-blue-100/80">
                      <span className="font-bold text-slate-600">Marks per Question:</span>
                      <span className="font-extrabold text-blue-800">15 marks each</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-blue-100/80">
                      <span className="font-bold text-slate-600">Attempt Required:</span>
                      <span className="font-extrabold text-[#0e0fed]">Attempt any 2 out of 4 questions</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 space-y-2.5">
                  <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200/60 text-xs text-blue-900 font-semibold flex items-center justify-between">
                    <span>Attempt 2 &times; 15 Marks</span>
                    <span className="font-mono font-black text-sm">= 30 Marks</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold px-1">
                    <span className="flex items-center gap-1 text-blue-700/80">
                      <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                      <span>Heavyweight 15-mark questions</span>
                    </span>
                    <span className="flex items-center gap-1 text-slate-400 group-hover:text-blue-700 transition-colors">
                      <RotateCw className="w-3 h-3" />
                      <span>Hover or tap to flip</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Back Face: Playful student reaction & illustration */}
              <div className="flip-card-face flip-card-back absolute top-0 left-0 w-full h-full rounded-2xl bg-gradient-to-br from-blue-50/90 via-white to-pink-50/90 border-2 border-blue-300 p-6 flex flex-col justify-between shadow-md">
                <div className="h-1.5 w-full bg-gradient-to-r from-[#94f0f1] to-[#0e0fed] absolute top-0 left-0" />

                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-black uppercase px-2.5 py-1 rounded-lg bg-blue-100 text-[#0e0fed] border border-blue-300">
                    <Sparkles className="w-3.5 h-3.5 text-[#0e0fed]" />
                    <span>Heavyweight Mode</span>
                  </span>
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    15M Each
                  </span>
                </div>

                {/* Cute goofy student illustration */}
                <div className="my-auto py-2 text-center space-y-3">
                  <div className="relative w-20 h-20 mx-auto">
                    <svg className="w-full h-full drop-shadow-xs" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="50" cy="50" r="44" fill="url(#gradSectionB)" fillOpacity="0.35" />
                      <rect x="24" y="18" width="52" height="64" rx="8" fill="#ffffff" stroke="#2563eb" strokeWidth="2.5" />
                      <line x1="32" y1="28" x2="68" y2="28" stroke="#94f0f1" strokeWidth="2.5" strokeLinecap="round" />
                      <line x1="32" y1="36" x2="68" y2="36" stroke="#f2b1d8" strokeWidth="2.5" strokeLinecap="round" />
                      {/* Goofy student skull with exam glasses */}
                      <rect x="36" y="44" width="28" height="24" rx="7" fill="#f8fafc" stroke="#0e0fed" strokeWidth="2" />
                      <circle cx="43" cy="52" r="4.5" stroke="#0e0fed" strokeWidth="1.5" fill="#94f0f1" fillOpacity="0.6" />
                      <circle cx="57" cy="52" r="4.5" stroke="#0e0fed" strokeWidth="1.5" fill="#94f0f1" fillOpacity="0.6" />
                      <line x1="47.5" y1="52" x2="52.5" y2="52" stroke="#0e0fed" strokeWidth="1.5" />
                      {/* Hilarious teeth/working */}
                      <line x1="43" y1="61" x2="57" y2="61" stroke="#0e0fed" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="46" y1="59" x2="46" y2="63" stroke="#0e0fed" strokeWidth="1" />
                      <line x1="50" y1="59" x2="50" y2="63" stroke="#0e0fed" strokeWidth="1" />
                      <line x1="54" y1="59" x2="54" y2="63" stroke="#0e0fed" strokeWidth="1" />
                      {/* 15 Marks Star Stamp */}
                      <circle cx="80" cy="24" r="11" fill="#f2b1d8" stroke="#db2777" strokeWidth="1.5" />
                      <text x="80" y="28" textAnchor="middle" fontSize="9" fontWeight="900" fill="#9d174d">15M</text>
                      <defs>
                        <linearGradient id="gradSectionB" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#94f0f1" />
                          <stop offset="1" stopColor="#f2b1d8" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>

                  <div className="space-y-1">
                    <p className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug px-2">
                      &ldquo;15 marks per question?! Bro, show your working. 💀&rdquo;
                    </p>
                    <p className="text-xs text-slate-600 font-medium max-w-xs mx-auto">
                      Step 1: Write &lsquo;Given&rsquo;. Step 2: Draw a neat labeled diagram. Step 3: Secure step marks!
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-blue-200/70 flex items-center justify-between text-[11px] text-blue-800 font-bold">
                  <span>Section B &bull; 30 Marks total</span>
                  <span className="inline-flex items-center gap-1 text-slate-500 hover:text-blue-700">
                    <RotateCw className="w-3 h-3" />
                    <span>Tap to flip back</span>
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Important Summary Bar */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 via-cyan-50/40 to-blue-50/40 border border-slate-200 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-700 font-medium">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-900">Important Summary:</span>
            <span>Section A: Attempt 3 out of 6 questions = 30 marks</span>
            <span className="text-slate-400">&bull;</span>
            <span>Section B: Attempt 2 out of 4 questions = 30 marks</span>
          </div>
          <div className="font-bold text-[#0e0fed] shrink-0 text-sm">
            Overall Examination: 60 Marks
          </div>
        </div>

      </div>

      {/* Student-Created Project Acknowledgement */}
      <div className="relative bg-gradient-to-br from-emerald-50/70 via-white/95 to-cyan-50/70 border border-emerald-200/80 rounded-3xl p-6 sm:p-8 space-y-3 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-800">
          <Heart className="w-4 h-4 text-emerald-600 fill-emerald-600/30" />
          <span>Student Initiative</span>
        </div>
        <h3 className="text-xl font-black text-slate-900">
          Made by an M.J.P. Rohilkhand University student, for students
        </h3>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
          MJPRU PYQ is an independent student-created initiative designed to make accessing previous-year question papers easier. Built to help students find and organize academic resources, it provides quick in-browser PDF previews, semester-wise browsing, and an organized archive across engineering branches.
        </p>
      </div>

      {/* Independent Resource Disclaimer */}
      <div className="relative bg-white/90 border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-3 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          <span>Independent Resource Disclaimer</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
          <strong className="text-slate-800">Disclaimer:</strong> MJPRU PYQ is an independent, student-focused educational resource. It is not an official website of M.J.P. Rohilkhand University and is not affiliated with, endorsed by, or operated by the university. University names and academic references are used only for identification and educational purposes.
        </p>
      </div>

      {/* Contribution Callout */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#94f0f1]/30 via-white/95 to-[#f2b1d8]/30 border-2 border-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-6 backdrop-blur-md">
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="text-lg font-black text-slate-900">
            Have recent semester papers?
          </h3>
          <p className="text-xs text-slate-700 max-w-md font-medium">
            Student contributors and administrators can upload digitized PDF question papers directly via the Admin Portal.
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
