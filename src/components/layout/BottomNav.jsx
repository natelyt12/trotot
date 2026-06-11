import { motion } from "framer-motion";
import AppIcon from "../common/AppIcon.jsx";
import { useRoomFilterContext } from "../../context/RoomFilterContext.jsx";

/* ============================================
   BottomNav Component
   - Fixed bottom navigation for mobile
   - Design with labels BELOW icons (as requested by user)
   - Center floating action button for filters
   - Micro-animations with Framer Motion
   ============================================ */
export default function BottomNav({ currentPage, navigate, user, onFilterClick }) {
    const role = user?.user_metadata?.role;
    const isLandlord = role === "landlord" || role === "admin";
    const { activeFilterCount } = useRoomFilterContext();

    const navItems = [
        { id: "home", label: "Trang chủ", icon: "home" },
        isLandlord ? { id: "dashboard", label: "Quản lý", icon: "file-text" } : { id: "my-room", label: "Quản lý", icon: "file-text" },
        {
            id: "search",
            label: "Bộ lọc",
            icon: "filter",
            isCenter: true,
        },
        { id: "forum", label: "Diễn đàn", icon: "messages" },
        { id: "profile", label: "Cá nhân", icon: "user" },
    ];

    const handleNavigate = (item) => {
        if (item.isCenter) {
            onFilterClick();
            return;
        }

        if (item.id === "forum") {
            navigate("forum");
            return;
        }

        if (item.id === "dashboard") {
            navigate("dashboard");
            return;
        }

        if (item.id === "my-room") {
            if (!user) navigate("login");
            else navigate("my-room");
            return;
        }

        const page = item.id;
        if (page === "profile" && !user) {
            navigate("login");
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
                                className={`relative flex border-none cursor-pointer transition-colors duration-200 group ${
                                    isCenter
                                        ? "w-12 h-12 bg-amber-500 text-white rounded-full hover:bg-amber-600 shadow-sm shrink-0 items-center justify-center"
                                        : "flex-col gap-0.5 items-center justify-center bg-transparent"
                                }`}
                            >
                                {isCenter && currentPage !== "dashboard" && activeFilterCount > 0 && (
                                    <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full z-10 animate-pulse" />
                                )}

                                {isCenter ? (
                                    <AppIcon name={item.icon} size={20} strokeWidth={2.5} color="#ffffff" />
                                ) : (
                                    <>
                                        {/* Micro-animation for icon on active */}
                                        <motion.div
                                            className="flex items-center justify-center"
                                            animate={isActive ? { scale: [1, 1.15, 1] } : {}}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <AppIcon name={item.icon} size={22} strokeWidth={isActive ? 2.5 : 2} color={isActive ? "#d97706" : "#a8a29e"} />
                                        </motion.div>
                                        <span className={`text-[0.7rem] font-light mt-0.5 ${isActive ? "text-amber-600" : "text-stone-400"}`}>
                                            {item.label}
                                        </span>
                                    </>
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>
        </nav>
    );
}
