import AppIcon from '../common/AppIcon.jsx';

/* ============================================
   BottomNav Component
   - Floating navigation for mobile users
   - High-end glassmorphism design
   ============================================ */
export default function BottomNav({ currentPage, navigate, user }) {
    const navItems = [
        { id: 'home', label: 'Trang chủ', icon: 'home' },
        { id: 'profile', label: 'Cá nhân', icon: 'user' },
    ];

    const handleNavigate = (page) => {
        if (page === 'profile' && !user) {
            navigate('login');
        } else {
            navigate(page);
        }
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white backdrop-blur-xl border-t border-stone-200 pb-safe-area shadow-[0_-5px_25px_rgba(0,0,0,0.05)] md:hidden">
            <div className="flex items-center justify-around h-20 max-w-md mx-auto">
                {navItems.map((item) => {
                    const isActive = currentPage === item.id || (item.id === 'profile' && currentPage === 'profile');

                    return (
                        <button
                            key={item.id}
                            onClick={() => handleNavigate(item.id)}
                            className="flex flex-col items-center justify-center gap-1 w-full bg-transparent border-none cursor-pointer group transition-all duration-300"
                        >
                            <div className={`relative flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-300 ${isActive ? 'bg-amber-100 text-amber-600 scale-110' : 'text-stone-400 group-hover:text-stone-600'}`}>
                                <AppIcon
                                    name={item.icon}
                                    size={24}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                            </div>
                            <span className={`text-[0.65rem] font-bold uppercase tracking-wider transition-colors duration-300 ${isActive ? 'text-amber-600' : 'text-stone-400'}`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
