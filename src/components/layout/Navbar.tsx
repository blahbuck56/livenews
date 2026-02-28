import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navLinks = [
  { to: '/', label: 'Command Center' },
  { to: '/feed', label: 'Live Feed' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/social', label: 'Social Pulse' },
  { to: '/video', label: 'Live Video' },
  { to: '/geopolitics', label: 'Global Impact' },
  { to: '/business', label: 'Trade Impact' },
  { to: '/sources', label: 'Sources' },
];

function formatClock(offset: number, label: string) {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const targetMs = utcMs + offset * 60000;
  const d = new Date(targetMs);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  return { time: `${h}:${m}:${s}`, label };
}

export default function Navbar() {
  const location = useLocation();
  const [clocks, setClocks] = useState({ utc: formatClock(0, 'UTC'), irst: formatClock(210, 'IRST') });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setClocks({ utc: formatClock(0, 'UTC'), irst: formatClock(210, 'IRST') });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Progress bar — fixed top, z-9999 */}
      <div className="fixed top-0 left-0 right-0 z-[9999] h-[2px] bg-red-100">
        <div className="h-full bg-[#DC2626] animate-progress" />
      </div>

      <header className="sticky top-0 z-50 bg-white border-b border-[#E5E7EB]" style={{ height: '56px' }}>
        <div className="flex items-center justify-between px-3 sm:px-4 h-full max-w-[1800px] mx-auto">
          {/* Left: Logo */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-pulse-dot" />
            <span
              className="px-1.5 sm:px-2 py-0.5 bg-[#DC2626] text-white font-mono"
              style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', borderRadius: '2px' }}
            >
              LIVE
            </span>
            <Link to="/" className="no-underline hidden sm:block">
              <span style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '-0.5px', color: '#111827' }}>
                <span style={{ color: '#DC2626' }}>CONFLICT</span> MONITOR
              </span>
            </Link>
            <Link to="/" className="no-underline sm:hidden">
              <span style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '-0.3px', color: '#111827' }}>
                <span style={{ color: '#DC2626' }}>C</span>M
              </span>
            </Link>
          </div>

          {/* Center: Nav Links */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-1.5 no-underline transition-colors ${
                    active
                      ? 'text-gray-900 border-b-2 border-[#DC2626]'
                      : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
                  }`}
                  style={{ fontSize: '13px', fontWeight: 500 }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Clocks + hamburger */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden md:flex items-center gap-3">
              <div className="text-right">
                <div className="font-mono text-[12px] text-[#111827]">{clocks.utc.time}</div>
                <div className="text-[9px] text-[#9CA3AF] uppercase tracking-wider">UTC</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[12px] text-[#D97706]">{clocks.irst.time}</div>
                <div className="text-[9px] text-[#9CA3AF] uppercase tracking-wider">IRST</div>
              </div>
            </div>

            {/* Mobile hamburger — 44px touch target */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden flex items-center justify-center w-10 h-10 text-[#6B7280] bg-transparent border-0 cursor-pointer hover:text-[#111827] rounded-[4px] active:bg-gray-100 transition-colors"
              aria-label="Toggle navigation"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                {mobileOpen ? (
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
                ) : (
                  <path fillRule="evenodd" d="M3 5h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2z" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile nav drawer with backdrop */}
        {mobileOpen && (
          <>
            <div className="lg:hidden fixed inset-0 top-[56px] bg-black/20 z-30" onClick={() => setMobileOpen(false)} />
            <nav className="lg:hidden absolute top-[56px] left-0 right-0 bg-white border-b border-[#E5E7EB] shadow-lg z-40 px-4 py-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center px-3 py-3 text-[14px] font-medium no-underline rounded-[6px] transition-colors ${
                    location.pathname === link.to
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-500 active:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-2 pt-3 border-t border-[#E5E7EB] flex gap-4 px-3 pb-2">
                <span className="font-mono text-[12px] text-[#6B7280]">{clocks.utc.time} <span className="text-[9px] text-[#9CA3AF]">UTC</span></span>
                <span className="font-mono text-[12px] text-[#D97706]">{clocks.irst.time} <span className="text-[9px] text-[#9CA3AF]">IRST</span></span>
              </div>
            </nav>
          </>
        )}
      </header>
    </>
  );
}
