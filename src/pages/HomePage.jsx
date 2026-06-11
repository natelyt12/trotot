import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import RoomFilters from "../components/rooms/RoomFilters.jsx";
import RoomGrid from "../components/rooms/RoomGrid.jsx";
import AppIcon from "../components/common/AppIcon.jsx";
import SearchTrigger from "../components/search/SearchTrigger.jsx";
import { useRoomFilterContext } from "../context/RoomFilterContext.jsx";
import { PROVINCE } from "../constants/province.js";
import HeroSection from "../components/home/HeroSection.jsx";

/* ============================================
   HomePage – Listing + search + filters
   Flat design, amber palette
   ============================================ */
export default function HomePage({ navigate, user, onSearchClick, currentPage }) {
    const filterState = useRoomFilterContext();
    const {
        filters,
        filteredRooms,
        updateFilter,
        resetFilters,
        toggleAmenity,
        activeFilterCount,
        totalCount,
        loading,
        loadingMore,
        hasMore,
        loadMore,
        error,
        highlightedField,
        getLocationDisplayText,
        refetch,
    } = filterState;

    const isFirstMount = useRef(true);
    const prevPageRef = useRef(currentPage);

    // Bug #2: Refetch dữ liệu mỗi khi user navigate trở lại HomePage (sau lần đầu mount)
    useEffect(() => {
        if (isFirstMount.current) {
            isFirstMount.current = false;
            prevPageRef.current = currentPage;
            return;
        }

        // Reload khi quay lại trang chủ từ các trang khác, NGOẠI TRỪ trang chi tiết tin đăng (room-detail)
        if (currentPage === "home" && prevPageRef.current !== "room-detail") {
            refetch();
        }

        prevPageRef.current = currentPage;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage]);

    const handleRoomClick = (room) => navigate("room-detail", room);

    // Scroll to results when filters change (so user sees the top of the new list)
    useEffect(() => {
        // Use a small delay to allow state to settle or ignore the very first mount if needed
        // but generally scrolling to the greeting area is what the user asked for.
        const section = document.getElementById("listing-section");
        if (section && activeFilterCount > 0) {
            section.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [filters, activeFilterCount]);

    // Auto-refetch removed as per user request
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 11) return "Chào buổi sáng";
        if (hour >= 11 && hour < 14) return "Chào buổi trưa";
        if (hour >= 14 && hour < 18) return "Chào buổi chiều";
        return "Chào buổi tối";
    };

    const stats = [
        { value: `300+`, label: "Phòng đăng ký" },
        { value: `${PROVINCE.length}`, label: "Thành phố" },
        { value: "500+", label: "Chủ trọ tin cậy" },
        { value: "4.8★", label: "Đánh giá trung bình" },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <div className="min-h-screen bg-stone-50">
            {/* ---- HERO SECTION ---- */}
            <HeroSection
                user={user}
                onSearchClick={onSearchClick}
                filters={filters}
                getLocationDisplayText={getLocationDisplayText}
                rooms={filteredRooms}
                onRoomClick={handleRoomClick}
            />

            {/* ---- LISTING SECTION ---- */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                id="listing-section"
                className={`max-w-6xl mx-auto px-4 sm:px-6 pb-12 scroll-mt-14 ${user ? "pt-18 md:pt-10" : "pt-10"}`}
            >
                {/* Section header + mobile filter toggle */}
                <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
                    <div>
                        <h2
                            className="text-2xl font-medium text-stone-900 tracking-tight flex items-baseline flex-wrap"
                            style={{ fontFamily: "var(--font-heading)" }}
                        >
                            <span className="text-amber-500 mr-2.5" style={{ fontFamily: "var(--font-script)", fontSize: "1.25em" }}>
                                {getGreeting()}
                            </span>
                            <span>{user?.user_metadata?.full_name || ""}</span>
                        </h2>
                        <p className="text-stone-500 text-sm font-light mt-1">
                            {activeFilterCount > 0 ? getLocationDisplayText() : "Tìm phòng trọ xung quanh bạn"}
                        </p>
                    </div>

                    {/* Desktop only greeting - on mobile we focus on the FAB */}
                </div>

                {/* Layout: Grid (left) + Sidebar (right) */}
                <div className="flex flex-col lg:flex-row-reverse gap-6 items-start">
                    {/* Sidebar (Desktop only) */}
                    <div className="hidden lg:block lg:w-[280px] lg:shrink-0 filter-sidebar-aside">
                        <RoomFilters
                            filters={filters}
                            updateFilter={updateFilter}
                            resetFilters={resetFilters}
                            toggleAmenity={toggleAmenity}
                            activeFilterCount={activeFilterCount}
                            highlightedField={highlightedField}
                            refetch={filterState.refetch}
                            navigate={navigate}
                        />
                    </div>

                    {/* Main content */}
                    <div className="flex-1 min-w-0 min-h-[70vh] w-full">
                        {loading ? (
                            <RoomGrid rooms={[]} isLoading={true} />
                        ) : error ? (
                            <div className="bg-red-50 border border-red-200 text-red-700 p-8 rounded-xl text-center">
                                <p className="font-medium mb-2">Đã có lỗi xảy ra!</p>
                                <p className="text-sm opacity-80 m-0">{error}</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="mt-5 px-5 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors duration-200 border-none cursor-pointer"
                                >
                                    Thử lại
                                </button>
                            </div>
                        ) : (
                            <>
                                <RoomGrid rooms={filteredRooms} onRoomClick={handleRoomClick} />

                                {hasMore && (
                                    <div className="flex justify-center mt-10 mb-6">
                                        <button
                                            type="button"
                                            onClick={loadMore}
                                            disabled={loadingMore}
                                            className="inline-flex items-center gap-2 px-8 py-2.5 bg-white border border-stone-200 text-stone-700 rounded-lg font-normal text-sm cursor-pointer hover:border-amber-500 hover:text-amber-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loadingMore && <div className="w-4 h-4 border-2 border-stone-200 border-t-amber-500 rounded-full animate-spin" />}
                                            {loadingMore ? "Đang tải thêm..." : "Xem thêm kết quả"}
                                        </button>
                                    </div>
                                )}

                                {!hasMore && totalCount > 0 && (
                                    <p className="text-center text-stone-400 text-sm mt-10 mb-6 italic m-0">— Đã hiển thị tất cả kết quả —</p>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </motion.section>
        </div>
    );
}
