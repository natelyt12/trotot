import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SearchTrigger from '../search/SearchTrigger.jsx';

export default function Header({
    currentPage,
    navigate,
    user,
    onSearchClick,
    searchDisplayText,
    isSearchFilled
}) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [showSearch, setShowSearch] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const isHome = currentPage === 'home';
            const isMobile = window.innerWidth < 768; // md breakpoint
            const isExcludedPage = ['profile', 'dashboard', 'room-detail'].includes(currentPage);

            if (isExcludedPage) {
                setShowSearch(false);
            } else if (isMobile) {
                // Trên mobile: Chỉ hiện ở trang chủ (luôn hiện)
                setShowSearch(isHome);
            } else {
                // Trên PC: Cuộn > 400px ở trang chủ mới hiện, hoặc luôn hiện ở các trang khác (ngoại trừ trang đã loại trừ)
                setShowSearch(!isHome || window.scrollY > 400);
            }
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, [currentPage]);

    const navLinks = [
        { label: 'Tìm phòng', page: 'home' },
        { label: 'Tin đã lưu', page: 'favorites' },
    ];

    const handleNavLinkClick = (link) => {
        if (link.page === 'favorites') {
            if (!user) navigate('login');
            else navigate('profile', { tab: 'favorites' });
        } else navigate(link.page);
    };

    const roleLabel = (role) => {
        if (role === 'landlord') return 'Bên cho thuê';
        if (role === 'agent') return 'Môi giới';
        return 'Người thuê';
    };

    return (
        <header className="fixed z-100 top-0 left-0 right-0 bg-white border-b border-stone-100 shadow-sm">
            {/* Main bar */}
            <nav className="flex flex-col md:flex-row w-full px-4 md:px-6">
                {/* Top Row (Mobile) / Full Row (Desktop) */}
                <div className="flex items-center justify-between w-full h-14 md:h-16">

                    {/* LEFT: Logo & Nav Links */}
                    <div className="flex items-center justify-start gap-8">
                        {/* Logo */}
                        <button
                            onClick={() => navigate('home')}
                            className="flex items-center gap-2 bg-transparent border-none cursor-pointer p-0 shrink-0"
                        >
                            <img
                                src="/logo.png"
                                alt="Trọ Tốt Logo"
                                className="w-8 h-8 object-contain rounded-md"
                            />
                            <span className="flex items-baseline">
                                <span className="font-semibold text-[1.25rem] text-stone-900 tracking-tight font-heading">Trọ</span>
                                <span className="text-amber-500 text-[1.45rem] font-bold ml-0.5 font-script">Tốt</span>
                            </span>
                        </button>

                        {/* Desktop Nav Links */}
                        <div className="hidden lg:flex items-center gap-1">
                            {navLinks.map((link) => (
                                <button
                                    key={link.page}
                                    onClick={() => handleNavLinkClick(link)}
                                    className={`border-none px-4 py-1.5 rounded-md cursor-pointer text-sm font-bold transition-colors ${currentPage === link.page ? 'text-amber-600' : 'text-stone-600 hover:text-stone-900'
                                        }`}
                                >
                                    {link.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT Area: Search (Conditional) + Auth */}
                    <div className="flex items-center justify-end gap-4 shrink-0">
                        {/* Desktop Search - Appears on scroll */}
                        <AnimatePresence>
                            {showSearch && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                    className="hidden md:block w-72 lg:w-80"
                                >
                                    <SearchTrigger
                                        displayText={searchDisplayText}
                                        onClick={onSearchClick}
                                        isFilled={isSearchFilled}
                                        isNavbar={true}
                                        showButton={false}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="h-6 w-px bg-stone-100 hidden md:block" />

                        {user ? (
                            <>
                                {['landlord', 'agent'].includes(user.user_metadata?.role) && (
                                    <div className="hidden lg:flex items-center gap-2 mr-2">
                                        <button
                                            onClick={() => navigate('dashboard', { tab: 'post_room' })}
                                            className="bg-amber-100 hover:bg-amber-200 text-amber-700 text-sm font-bold h-10 px-4 rounded-xl cursor-pointer border-none transition-colors flex items-center gap-2"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                            Đăng tin
                                        </button>
                                        <button
                                            onClick={() => navigate('dashboard')}
                                            className="bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-bold h-10 px-4 rounded-xl cursor-pointer border-none transition-colors"
                                        >
                                            Bảng điều khiển
                                        </button>
                                    </div>
                                )}
                                <button
                                    onClick={() => navigate('profile')}
                                    className="flex items-center gap-2 md:gap-3 bg-transparent border-none py-1 px-1 md:py-1.5 md:px-3 rounded-full md:rounded-xl cursor-pointer hover:bg-stone-50 transition-colors"
                                >
                                <div className="text-right hidden md:block">
                                    <div className="text-sm font-bold text-stone-900 leading-tight truncate max-w-[120px]">{user.user_metadata?.full_name || 'Người dùng'}</div>
                                    <div className="text-[10px] uppercase tracking-tighter text-stone-500 font-bold">{roleLabel(user.user_metadata?.role)}</div>
                                </div>
                                <div
                                    className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center overflow-hidden shrink-0 shadow-sm border border-white"
                                    style={user.user_metadata?.avatar_url ? { backgroundImage: `url(${user.user_metadata.avatar_url})`, backgroundSize: 'cover' } : {}}
                                >
                                    {!user.user_metadata?.avatar_url && (user.user_metadata?.full_name || 'U').charAt(0).toUpperCase()}
                                </div>
                            </button>
                            </>
                        ) : (
                            <button
                                onClick={() => navigate('login')}
                                className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold h-10 px-6 rounded-full cursor-pointer border-none transition-colors"
                            >
                                Đăng nhập
                            </button>
                        )}
                    </div>

                </div>

                {/* Mobile Search Bar (Appears on scroll) */}
                <AnimatePresence>
                    {showSearch && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="md:hidden w-full px-4 overflow-hidden"
                        >
                            <div className="pb-3 pt-1">
                                <SearchTrigger
                                    displayText={searchDisplayText}
                                    onClick={onSearchClick}
                                    isFilled={isSearchFilled}
                                    isNavbar={true}
                                    showButton={false}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
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
                    {user && ['landlord', 'agent'].includes(user.user_metadata?.role) && (
                        <>
                            <button
                                onClick={() => { navigate('dashboard', { tab: 'post_room' }); setMobileOpen(false); }}
                                className="block w-full text-left bg-transparent border-none py-3 px-1 text-amber-600 text-sm font-bold cursor-pointer border-b border-stone-100 hover:text-amber-700 transition-colors duration-200"
                            >
                                Đăng tin mới
                            </button>
                            <button
                                onClick={() => { navigate('dashboard'); setMobileOpen(false); }}
                                className="block w-full text-left bg-transparent border-none py-3 px-1 text-stone-600 text-sm font-medium cursor-pointer border-b border-stone-100 hover:text-amber-600 transition-colors duration-200"
                            >
                                Bảng điều khiển
                            </button>
                        </>
                    )}
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
