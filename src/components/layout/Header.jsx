import { useState, useEffect } from 'react';

/* ============================================
   Header Component
   - Fixed navbar, flat design, amber palette
   - Mobile: hidden (BottomNav handles mobile)
   - Desktop: logo + nav links + auth
   ============================================ */
export default function Header({ currentPage, navigate, user }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { label: 'Tìm phòng', page: 'home' },
        { label: 'Tin đã lưu', page: 'favorites' },
    ];

    const handleNavLinkClick = (link) => {
        if (link.page === 'favorites') {
            if (!user) {
                navigate('login');
            } else {
                navigate('profile', { tab: 'favorites' });
            }
        } else {
            navigate(link.page);
        }
    };

    const roleLabel = (role) => {
        if (role === 'landlord') return 'Chủ nhà';
        if (role === 'agent') return 'Môi giới';
        return 'Người thuê';
    };

    return (
        <header className="fixed z-100 top-0 left-0 right-0 hidden md:block">
            {/* Main bar */}
            <nav
                className={`flex items-center justify-start h-16 px-6 border-b transition-colors duration-300 ${isScrolled
                    ? 'bg-white border-stone-200'
                    : 'bg-white/95 border-stone-100'
                    }`}
            >
                {/* Logo */}
                <button
                    onClick={() => navigate('home')}
                    className="flex items-center gap-2 bg-transparent border-none cursor-pointer p-0"
                >
                    <img
                        src="/logo.png"
                        alt="Trọ Tốt Logo"
                        className="w-8 h-8 object-contain rounded-md"
                    />
                    <span className="flex items-baseline">
                        <span
                            className="font-semibold text-[1.35rem] text-stone-900 tracking-tight"
                            style={{ fontFamily: 'var(--font-heading)' }}
                        >
                            Trọ
                        </span>
                        <span
                            className="text-amber-500 text-[1.55rem] font-bold ml-0.5"
                            style={{ fontFamily: 'var(--font-script)' }}
                        >
                            Tốt
                        </span>
                    </span>
                </button>

                {/* Desktop Nav Links */}
                <div className="flex items-center gap-0.5 ml-8">
                    {navLinks.map((link) => (
                        <button
                            key={link.page}
                            onClick={() => handleNavLinkClick(link)}
                            className={`border-none px-3.5 py-2 rounded-md cursor-pointer text-sm font-medium transition-colors duration-200 ${currentPage === link.page || (link.page === 'favorites' && currentPage === 'profile')
                                ? 'bg-amber-100 text-amber-600 font-semibold'
                                : 'bg-transparent text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                                }`}
                        >
                            {link.label}
                        </button>
                    ))}
                </div>

                {/* Auth area */}
                <div className="flex items-center gap-2 ml-auto">
                    {user ? (
                        <button
                            onClick={() => navigate('profile')}
                            className="flex items-center gap-3 bg-transparent border-none py-1.5 px-3 rounded-xl cursor-pointer transition-colors duration-200 hover:bg-stone-100"
                        >
                            <div className="text-right hidden md:block">
                                <div className="text-sm font-semibold text-stone-900 leading-tight">
                                    {user.user_metadata?.full_name || 'Người dùng'}
                                </div>
                                <div className="text-xs text-stone-500">
                                    {roleLabel(user.user_metadata?.role)}
                                </div>
                            </div>
                            {/* Avatar */}
                            <div
                                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold overflow-hidden shrink-0 bg-amber-500"
                                style={
                                    user.user_metadata?.avatar_url
                                        ? { backgroundImage: `url(${user.user_metadata.avatar_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                                        : {}
                                }
                            >
                                {!user.user_metadata?.avatar_url &&
                                    (user.user_metadata?.full_name || 'U').charAt(0).toUpperCase()}
                            </div>
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate('login')}
                            className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-6 py-2 rounded-full cursor-pointer border-none transition-colors duration-200"
                        >
                            Đăng nhập
                        </button>
                    )}

                    {/* Mobile hamburger (only visible on narrow viewports ≤ md) */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden bg-transparent border-none cursor-pointer p-1.5 text-stone-600 rounded-md hover:bg-stone-100 transition-colors"
                        aria-label="Toggle menu"
                        aria-expanded={mobileOpen}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            {mobileOpen
                                ? <path d="M18 6 6 18M6 6l12 12" />
                                : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
                            }
                        </svg>
                    </button>
                </div>
            </nav>

            {/* Mobile dropdown menu */}
            {mobileOpen && (
                <div
                    className="bg-white border-b border-stone-200 p-4 animate-slide-down md:hidden"
                >
                    {/* User card / auth */}
                    <div className="mb-3">
                        {user ? (
                            <button
                                onClick={() => { navigate('profile'); setMobileOpen(false); }}
                                className="w-full bg-stone-50 border border-stone-200 p-3.5 rounded-xl flex items-center justify-between cursor-pointer text-left hover:bg-amber-50 hover:border-amber-200 transition-colors duration-200"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-base overflow-hidden shrink-0">
                                        {user.user_metadata?.avatar_url
                                            ? <img src={user.user_metadata.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                                            : (user.user_metadata?.full_name || 'U').charAt(0).toUpperCase()
                                        }
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-stone-900">
                                            {user.user_metadata?.full_name || 'Người dùng'}
                                        </div>
                                        <div className="text-xs text-stone-500">
                                            {roleLabel(user.user_metadata?.role)}
                                        </div>
                                    </div>
                                </div>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-400">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </button>
                        ) : (
                            <button
                                onClick={() => { navigate('login'); setMobileOpen(false); }}
                                className="w-full bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold py-3.5 rounded-full cursor-pointer border-none transition-colors duration-200"
                            >
                                Đăng nhập
                            </button>
                        )}
                    </div>

                    {/* Nav links */}
                    {navLinks.map((link) => (
                        <button
                            key={link.page}
                            onClick={() => { handleNavLinkClick(link); setMobileOpen(false); }}
                            className="block w-full text-left bg-transparent border-none py-3 px-1 text-stone-600 text-sm font-medium cursor-pointer border-b border-stone-100 last:border-b-0 hover:text-amber-600 transition-colors duration-200"
                        >
                            {link.label}
                        </button>
                    ))}
                </div>
            )}
        </header>
    );
}
