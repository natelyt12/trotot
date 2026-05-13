import AppIcon from '../common/AppIcon.jsx';

/* ============================================
   BottomNav Component
   - Fixed bottom navigation for mobile
   - Flat design, amber palette
   - Items with padded, rounded active backgrounds
   ============================================ */
export default function BottomNav({ currentPage, navigate, user, onFilterClick }) {
    const navItems = [
        { id: 'home',    label: 'Trang chủ', icon: 'home' },
        { id: 'search',  label: 'Tìm kiếm',  icon: 'search', isCenter: true },
        { id: 'profile', label: 'Cá nhân',   icon: 'user' },
    ];

    const handleNavigate = (item) => {
        if (item.isCenter) {
            onFilterClick();
            return;
        }
        
        const page = item.id;
        if (page === 'profile' && !user) {
            navigate('login');
        } else {
            navigate(page);
        }
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-100 bg-white border-t border-stone-100 md:hidden animate-slide-up-expo shadow-[0_-4px_20px_rgb(0,0,0,0.03)]">
            <div className="flex items-center h-20 max-w-md mx-auto px-2">
                {navItems.map((item) => {
                    const isActive =
                        currentPage === item.id ||
                        (item.id === 'profile' && currentPage === 'profile');

                    return (
                        <div key={item.id} className="flex-1 h-full py-2 px-1">
                            <button
                                onClick={() => handleNavigate(item)}
                                className={`flex flex-col items-center justify-center gap-1 w-full h-full border-none cursor-pointer transition-all duration-300 rounded-xl ${
                                    isActive 
                                    ? 'bg-amber-50 text-amber-600' 
                                    : 'bg-transparent text-stone-400 hover:text-stone-600'
                                }`}
                            >
                                <div className="flex items-center justify-center">
                                    <AppIcon
                                        name={item.icon}
                                        size={22}
                                        strokeWidth={isActive ? 2.5 : 2}
                                    />
                                </div>
                                <span className={`text-[0.6rem] font-bold uppercase tracking-wider ${isActive ? 'text-amber-600' : 'text-stone-400'}`}>
                                    {item.label}
                                </span>
                            </button>
                        </div>
                    );
                })}
            </div>
        </nav>
    );
}
