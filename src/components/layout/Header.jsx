import { useState, useEffect } from 'react';

/* ============================================
   Header Component
   - Floating navbar with glass effect
   - Logo + Navigation + Auth buttons
   - Mobile responsive with hamburger
   ============================================ */
export default function Header({ currentPage, navigate }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Tìm phòng', page: 'home' },
    { label: 'Đăng tin', page: 'post' },
    { label: 'Hỗ trợ', page: 'support' },
  ];

  return (
    <header
      style={{
        position: 'fixed',
        top: isScrolled ? '0' : '0.75rem',
        left: isScrolled ? '0' : '1rem',
        right: isScrolled ? '0' : '1rem',
        zIndex: 100,
        transition: 'all 0.3s ease',
      }}
    >
      <nav
        style={{
          background: isScrolled ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: isScrolled ? '0' : '1rem',
          border: '1px solid rgba(255,255,255,0.8)',
          boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
          padding: '0 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Logo */}
        <button
          onClick={() => navigate('home')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
          aria-label="Về trang chủ Trọ Tốt"
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              background: 'linear-gradient(135deg, #d97706, #f59e0b)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(217,119,6,0.35)',
            }}
          >
            {/* House icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.2rem', color: '#1c1917', letterSpacing: '-0.01em' }}>
            Trọ<span style={{ color: '#d97706' }}>Tốt</span>
          </span>
        </button>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="hidden-mobile">
          {navLinks.map((link) => (
            <button
              key={link.page}
              onClick={() => navigate(link.page)}
              style={{
                background: currentPage === link.page ? '#fef3c7' : 'transparent',
                color: currentPage === link.page ? '#b45309' : '#57534e',
                fontWeight: currentPage === link.page ? 600 : 500,
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.5rem 0.875rem',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.2s',
                fontFamily: 'Inter, sans-serif',
              }}
              onMouseEnter={(e) => {
                if (currentPage !== link.page) {
                  e.currentTarget.style.background = '#fafaf9';
                  e.currentTarget.style.color = '#1c1917';
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== link.page) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#57534e';
                }
              }}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Auth buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => navigate('login')}
            className="btn-ghost"
            style={{ fontSize: '0.875rem' }}
          >
            Đăng nhập
          </button>
          <button
            onClick={() => navigate('register')}
            className="btn-primary"
            style={{ fontSize: '0.875rem' }}
          >
            Đăng ký
          </button>
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.25rem',
              color: '#57534e',
            }}
            aria-label="Toggle menu"
            className="show-mobile"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {mobileOpen ? (
                <path d="M18 6 6 18M6 6l12 12" />
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div
          style={{
            background: 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(16px)',
            borderRadius: '0 0 1rem 1rem',
            border: '1px solid rgba(255,255,255,0.8)',
            borderTop: 'none',
            padding: '0.5rem 1rem 1rem',
            animation: 'slideDown 0.2s ease',
          }}
        >
          {navLinks.map((link) => (
            <button
              key={link.page}
              onClick={() => { navigate(link.page); setMobileOpen(false); }}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                background: 'none',
                border: 'none',
                padding: '0.75rem 0.5rem',
                color: '#57534e',
                fontSize: '0.95rem',
                fontWeight: 500,
                cursor: 'pointer',
                borderBottom: '1px solid #f5f5f4',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {link.label}
            </button>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
