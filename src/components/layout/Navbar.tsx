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
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-all shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 lg:px-8 h-18">
        
        {/* Zone 1: University Brand Wordmark with Logo */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3 text-left focus:outline-none group shrink-0 magnetic-target"
          aria-label="MJPRU PYQ Home"
          data-magnetic="true"
        >
          <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-slate-200 bg-white flex items-center justify-center shadow-xs group-hover:border-[#0e0fed]/50 transition-colors">
            <img 
              src="/assets/aistudio/MJPRUWebsiteLogo_a2dc68a8.png" 
              alt="MJPRU Logo"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 group-hover:text-[#0e0fed] transition-colors">
                MJPRU <span className="gradient-text-primary">PYQ</span>
              </span>
            </div>
            <div className="text-[10px] text-slate-500 -mt-0.5 tracking-wider uppercase font-semibold">
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
                className={`relative py-1 text-sm font-semibold whitespace-nowrap transition-colors duration-150 magnetic-target ${
                  isActive 
                    ? 'text-[#0e0fed] font-bold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                data-magnetic="true"
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-gradient-to-r from-[#8bf0ba] via-[#94f0f1] to-[#f2b1d8] rounded-full" />
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
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-lg hover:text-slate-900 transition-colors magnetic-target"
              aria-label="Search Question Papers"
              data-magnetic="true"
            >
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <span>Search PYQs...</span>
              <kbd className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500 shadow-2xs">Ctrl+K</kbd>
            </button>
          )}

          <button
            onClick={() => handleNavClick('admin')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 whitespace-nowrap shadow-sm magnetic-target ${
              activeTab === 'admin'
                ? 'bg-[#0e0fed] text-white shadow-blue-500/25'
                : 'bg-gradient-to-r from-[#0e0fed] to-[#1e40af] text-white hover:from-[#1b1cff] hover:to-[#1e40af]'
            }`}
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
            className="p-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg animate-in slide-in-from-top duration-200">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-50 text-[#0e0fed]'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}

          <div className="pt-3 border-t border-slate-200 space-y-2">
            <button
              onClick={() => handleNavClick('admin')}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-bold bg-[#0e0fed] text-white hover:bg-blue-700 transition-colors"
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
