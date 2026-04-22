import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';


/* ============================================
   Header Component
   - Floating navbar with glass effect
   - Logo + Navigation + Auth buttons
   - Mobile responsive with hamburger
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
        { label: 'Hỗ trợ', page: 'support' },
    ];

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('home');
    };


    return (
        <header
            className={`fixed z-10 transition-all duration-300 ease-in-out ${isScrolled ? 'top-0 left-0 right-0' : 'top-3 left-4 right-4'}`}
        >
            <nav
                className={`backdrop-blur-md border border-white/80 shadow-[0_2px_20px_rgba(0,0,0,0.08)] px-6 flex items-center justify-between h-16 transition-all duration-300 ease-out ${isScrolled ? 'bg-white/95 rounded-none' : 'bg-white/90 rounded-lg'}`}
            >
                {/* Logo */}
                <button
                    onClick={() => navigate('home')}
                    className="flex items-center gap-2 bg-transparent border-none cursor-pointer p-0"
                >
                    <div className="w-9 h-9 bg-gradient-to-br from-amber-600 to-amber-500 rounded-[10px] flex items-center justify-center shadow-[0_2px_8px_rgba(217,119,6,0.35)]">
                        {/* House icon */}
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                    </div>
                    <span className="font-bold text-[1.2rem] text-stone-900 tracking-[-0.01em]" style={{ fontFamily: 'var(--font-heading)' }}>
                        Trọ <span className="text-amber-600">Tốt</span>
                    </span>
                </button>

                {/* Desktop Nav */}
                <div className="hidden-mobile flex items-center gap-1 ml-auto mr-4">
                    {navLinks.map((link) => (
                        <button
                            key={link.page}
                            onClick={() => navigate(link.page)}
                            className={`border-none rounded-md px-3.5 py-2 cursor-pointer text-[0.9rem] transition-all duration-200 font-sans ${currentPage === link.page ? 'bg-amber-100 text-amber-700 font-semibold' : 'bg-transparent text-stone-600 font-medium hover:bg-stone-50 hover:text-stone-900'}`}
                        >
                            {link.label}
                        </button>
                    ))}
                </div>

                {/* Auth buttons */}
                <div className="flex items-center gap-2">
                    <div className="hidden-mobile flex items-center gap-2">
                        {user ? (
                            <button
                                onClick={() => navigate('profile')}
                                className="flex items-center gap-3.5 bg-transparent border-none py-1.5 px-4 rounded-[14px] cursor-pointer transition-all duration-200 ease-out hover:bg-stone-100"
                            >
                                <div className="hidden-mobile text-right">
                                    <div className="text-sm font-semibold text-stone-900">
                                        {user.user_metadata?.full_name || 'Người dùng'}
                                    </div>
                                    <div className="text-xs text-stone-500">
                                        {user.user_metadata?.role === 'landlord' ? 'Chủ trọ' :
                                            user.user_metadata?.role === 'agent' ? 'Môi giới' : 'Người thuê'}
                                    </div>
                                </div>

                                {/* Avatar Display */}
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-base font-bold overflow-hidden"
                                    style={{
                                        background: user.user_metadata?.avatar_url
                                            ? `url(${user.user_metadata.avatar_url}) center/cover`
                                            : 'linear-gradient(135deg, #f59e0b, #d97706)',
                                    }}
                                >
                                    {!user.user_metadata?.avatar_url && (user.user_metadata?.full_name || 'U').charAt(0).toUpperCase()}
                                </div>
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => navigate('login')}
                                    className="btn-ghost"
                                    style={{ fontSize: '0.875rem' }}
                                >
                                    Đăng nhập
                                </button>
                                <button
                                    onClick={() => navigate('register')}
                                    className="btn-primary rounded-md!"
                                    style={{ fontSize: '0.875rem' }}
                                >
                                    Tạo tài khoản
                                </button>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="show-mobile hidden bg-transparent border-none cursor-pointer p-1 text-stone-600"
                        aria-label="Toggle menu"
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
                    className={`bg-white/98 backdrop-blur-xl p-4 ${isScrolled ? 'rounded-none border-none border-t border-t-stone-100 mt-0 shadow-[0_4px_12px_rgba(0,0,0,0.05)]' : 'rounded-xl border border-white/80 border-t-white/80 mt-2.5 shadow-[0_10px_40px_rgba(0,0,0,0.12)]'}`}
                    style={{
                        animation: 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                    }}
                >
                    {/* Auth buttons in mobile menu - TOP, half width each */}
                    <div className="mb-4 px-2">
                        {user ? (
                            <button
                                onClick={() => { navigate('profile'); setMobileOpen(false); }}
                                className="w-full bg-stone-50 p-4 rounded-xl flex items-center justify-between border-none cursor-pointer text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-[44px] h-[44px] rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold text-[1.1rem]">
                                        {user.user_metadata?.avatar_url ? (
                                            <img src={user.user_metadata.avatar_url} alt="avatar" className="w-full h-full object-cover rounded-xl" />
                                        ) : (
                                            (user.user_metadata?.full_name || 'U').charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-[0.95rem] font-semibold text-stone-900">
                                            {user.user_metadata?.full_name || 'Người dùng'}
                                        </div>
                                        <div className="text-[0.8rem] text-stone-500">
                                            {user.user_metadata?.role === 'landlord' ? 'Chủ trọ' :
                                                user.user_metadata?.role === 'agent' ? 'Môi giới' : 'Người thuê'}
                                        </div>
                                    </div>
                                </div>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </button>
                        ) : (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => { navigate('login'); setMobileOpen(false); }}
                                    className="btn-ghost flex-1 justify-center border border-stone-200 text-sm"
                                >
                                    Đăng nhập
                                </button>
                                <button
                                    onClick={() => { navigate('register'); setMobileOpen(false); }}
                                    className="btn-primary flex-1 justify-center text-sm"
                                >
                                    Tạo tài khoản
                                </button>
                            </div>
                        )}
                    </div>


                    {navLinks.map((link) => (
                        <button
                            key={link.page}
                            onClick={() => { navigate(link.page); setMobileOpen(false); }}
                            className="block w-full text-left bg-transparent border-none py-3 px-2 text-stone-600 text-[0.95rem] font-medium cursor-pointer border-b border-stone-100 font-sans"
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
