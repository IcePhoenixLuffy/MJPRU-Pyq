import React, { useState } from 'react';
import { 
  Menu, 
  X, 
  ShieldCheck, 
  Search, 
  ArrowRight
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSearch,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'departments', label: 'Departments' },
    { id: 'library', label: 'Browse Papers' },
    { id: 'recent', label: 'Recently Uploaded' },
    { id: 'about', label: 'About' },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-200/50 bg-white/75 backdrop-blur-md transition-all shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 lg:px-8 h-18">
        
        {/* Zone 1: University Brand Wordmark with Logo */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3 text-left focus:outline-none group shrink-0 magnetic-target"
          aria-label="MJPRU PYQ Home"
          data-magnetic="true"
        >
          <div className="relative w-10 h-10 rounded-xl overflow-hidden p-0.5 bg-gradient-to-tr from-[#8bf0ba] via-[#94f0f1] to-[#f2b1d8] shadow-sm group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-white rounded-[10px] overflow-hidden flex items-center justify-center">
              <img 
                src="/assets/aistudio/MJPRUWebsiteLogo_a2dc68a8.png" 
                alt="MJPRU Logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 group-hover:text-[#0e0fed] transition-colors">
                MJPRU <span className="gradient-text-vibrant">PYQ</span>
              </span>
            </div>
            <div className="text-[10px] text-slate-500 -mt-0.5 tracking-wider uppercase font-bold">
              Your Academic Paper Library
            </div>
          </div>
        </button>

        {/* Zone 2: Navigation Links (single line, whitespace-nowrap) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`relative py-1 text-sm font-bold whitespace-nowrap transition-colors duration-150 magnetic-target ${
                  isActive 
                    ? 'text-[#0e0fed]' 
                    : 'text-slate-700 hover:text-[#0e0fed]'
                }`}
                data-magnetic="true"
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#8bf0ba] via-[#94f0f1] to-[#f2b1d8] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action & Quick Search */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          {onOpenSearch && (
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white/80 hover:bg-white border border-cyan-200/80 rounded-xl hover:text-slate-900 hover:border-[#0e0fed]/50 transition-colors shadow-2xs magnetic-target"
              aria-label="Search Question Papers"
              data-magnetic="true"
            >
              <Search className="w-3.5 h-3.5 text-[#0e0fed]" />
              <span>Search PYQs...</span>
              <kbd className="text-[10px] bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded text-[#0e0fed] font-mono">Ctrl+K</kbd>
            </button>
          )}

          <button
            onClick={() => handleNavClick('admin')}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 whitespace-nowrap btn-gradient-blue magnetic-target"
            data-magnetic="true"
          >
            <ShieldCheck className="w-4 h-4 text-[#8bf0ba]" />
            <span>Admin Portal</span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Mobile Menu"
            className="p-2 rounded-xl text-slate-800 hover:bg-white/90 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-cyan-200/70 bg-white/95 backdrop-blur-md px-4 pt-3 pb-6 space-y-2 shadow-xl animate-in slide-in-from-top duration-200">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-blue-50 to-cyan-50 text-[#0e0fed] border border-blue-200/60'
                  : 'text-slate-800 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}

          <div className="pt-3 border-t border-slate-200 space-y-2">
            <button
              onClick={() => handleNavClick('admin')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold btn-gradient-blue"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#8bf0ba]" />
                Admin Dashboard
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
