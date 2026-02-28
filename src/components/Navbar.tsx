import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { formatUTC, formatTehran } from '../utils/time';

const navLinks = [
  { to: '/', label: 'Live Feed' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/social', label: 'Social Pulse' },
  { to: '/video', label: 'Live Video' },
  { to: '/geopolitics', label: 'Global Impact' },
  { to: '/sources', label: 'Sources' },
];

export default function Navbar() {
  const location = useLocation();
  const [utc, setUtc] = useState(formatUTC());
  const [tehran, setTehran] = useState(formatTehran());
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setUtc(formatUTC());
      setTehran(formatTehran());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E5E7EB]">
      <div className="flex items-center justify-between px-4 h-12">
        {/* Left: Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-pulse-dot" />
          <span className="px-1.5 py-0.5 text-[10px] font-bold text-white bg-[#DC2626] rounded" style={{ borderRadius: '3px' }}>
            LIVE
          </span>
          <Link to="/" className="text-sm font-bold tracking-wide text-[#111827] no-underline hidden sm:inline">
            IRAN CONFLICT MONITOR
          </Link>
          <Link to="/" className="text-sm font-bold tracking-wide text-[#111827] no-underline sm:hidden">
            ICM
          </Link>
        </div>

        {/* Center: Nav Links (desktop) */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-1.5 text-xs font-medium rounded no-underline transition-colors ${
                location.pathname === link.to
                  ? 'bg-[#111827] text-white'
                  : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6]'
              }`}
              style={{ borderRadius: '4px' }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: Clocks */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <span className="text-[11px] font-mono text-[#6B7280]">{utc}</span>
          <span className="text-[11px] font-mono text-[#D97706]">{tehran}</span>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-1 text-[#6B7280] bg-transparent border-0 cursor-pointer"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 5h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2z" />
          </svg>
        </button>
      </div>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <nav className="lg:hidden border-t border-[#E5E7EB] bg-white px-4 py-2">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2 text-sm no-underline rounded ${
                location.pathname === link.to
                  ? 'bg-[#111827] text-white'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
              style={{ borderRadius: '4px' }}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 px-3 py-1 flex gap-3">
            <span className="text-[10px] font-mono text-[#6B7280]">{utc}</span>
            <span className="text-[10px] font-mono text-[#D97706]">{tehran}</span>
          </div>
        </nav>
      )}

      {/* Progress bar */}
      <div className="h-[2px] bg-[#FEE2E2] overflow-hidden">
        <div className="h-full bg-[#DC2626] animate-progress" />
      </div>
    </header>
  );
}
