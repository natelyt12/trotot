import AppIcon from '../common/AppIcon.jsx';

/* ============================================
   BottomNav Component
   - Fixed bottom navigation for mobile
   - Flat design, amber palette
   ============================================ */
export default function BottomNav({ currentPage, navigate, user }) {
    const navItems = [
        { id: 'home',    label: 'Trang chủ', icon: 'home' },
        { id: 'profile', label: 'Cá nhân',   icon: 'user' },
    ];

    const handleNavigate = (page) => {
        if (page === 'profile' && !user) {
            navigate('login');
        } else {
            navigate(page);
        }
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-100 bg-white border-t border-stone-200 md:hidden">
            <div className="flex items-center justify-around h-16 max-w-md mx-auto">
                {navItems.map((item) => {
                    const isActive =
                        currentPage === item.id ||
                        (item.id === 'profile' && currentPage === 'profile');

                    return (
                        <button
                            key={item.id}
                            onClick={() => handleNavigate(item.id)}
                            className="flex flex-col items-center justify-center gap-1 w-full h-full bg-transparent border-none cursor-pointer transition-colors duration-200"
                        >
                            <div
                                className={`flex items-center justify-center w-9 h-9 rounded-md transition-colors duration-200 ${
                                    isActive
                                        ? 'bg-amber-100 text-amber-600'
                                        : 'text-stone-400 hover:text-stone-600'
                                }`}
                            >
                                <AppIcon
                                    name={item.icon}
                                    size={22}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                            </div>
                            <span
                                className={`text-[0.6rem] font-bold uppercase tracking-wider transition-colors duration-200 ${
                                    isActive ? 'text-amber-600' : 'text-stone-400'
                                }`}
                            >
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
