import { motion } from 'framer-motion';
import AppIcon from '../common/AppIcon.jsx';

/* ============================================
   BottomNav Component
   - Fixed bottom navigation for mobile
   - Design with labels BELOW icons (as requested by user)
   - Center floating action button for filters
   - Micro-animations with Framer Motion
   ============================================ */
export default function BottomNav({ currentPage, navigate, user, onFilterClick }) {
    const isHost = user && ['landlord', 'agent'].includes(user.user_metadata?.role);
    const isDashboard = currentPage === 'dashboard';

    const navItems = [
        { id: 'home', label: 'Trang chủ', icon: 'home' },
        isHost 
            ? { id: 'dashboard', label: 'Quản lý', icon: 'file-text' }
            : { id: 'find-friends', label: 'Tìm bạn', icon: 'occupants' },
        { 
            id: 'search', 
            label: isDashboard ? 'Đăng tin' : 'Bộ lọc', 
            icon: isDashboard ? 'plus' : 'filter', 
            isCenter: true 
        },
        { id: 'favorites', label: 'Tin đã lưu', icon: 'heart' },
        { id: 'profile', label: 'Cá nhân', icon: 'user' },
    ];

    const handleNavigate = (item) => {
        if (item.isCenter) {
            if (isDashboard) {
                navigate('dashboard', { tab: 'post_room' });
            } else {
                onFilterClick();
            }
            return;
        }

        if (item.id === 'find-friends') {
            // Feature in development, do nothing
            return;
        }

        if (item.id === 'dashboard') {
            navigate('dashboard');
            return;
        }

        if (item.id === 'favorites') {
            if (!user) navigate('login');
            else navigate('profile', { tab: 'favorites' });
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
        <nav className="fixed bottom-0 left-0 right-0 z-100 bg-white border-t border-stone-100 lg:hidden">
            <div className="flex items-center h-18 max-w-md mx-auto px-4 justify-around">
                {navItems.map((item) => {
                    const isActive = currentPage === item.id;
                    const isCenter = item.isCenter;

                    return (
                        <div key={item.id} className="relative flex items-center justify-center">
                            <button
                                onClick={() => handleNavigate(item)}
                                className={`relative flex flex-col items-center justify-center border-none cursor-pointer transition-all duration-200 ${isCenter
                                    ? 'w-12 h-12 bg-linear-to-br from-amber-400 to-orange-500 text-white rounded-full hover:from-amber-500 hover:to-orange-600'
                                    : 'gap-0.5'
                                    }`}
                                style={{ background: isCenter ? undefined : 'transparent' }}
                            >
                                {/* Micro-animation for icon on active */}
                                <motion.div
                                    className="flex items-center justify-center"
                                    animate={isActive ? { scale: [1, 1.15, 1] } : {}}
                                    transition={{ duration: 0.3 }}
                                >
                                    <AppIcon
                                        name={item.icon}
                                        size={isCenter ? 24 : 22}
                                        strokeWidth={isActive || isCenter ? 2.5 : 2}
                                        color={isCenter ? '#ffffff' : (isActive ? '#d97706' : '#a8a29e')}
                                    />
                                </motion.div>

                                {/* Label below icon (not for center item) */}
                                {!isCenter && (
                                    <span className={`text-[0.7rem] font-medium mt-0.5 ${isActive ? 'text-amber-600' : 'text-stone-400'}`}>
                                        {item.label}
                                    </span>
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>
        </nav>
    );
}
