import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import RoomFilters from '../components/rooms/RoomFilters.jsx';
import RoomGrid from '../components/rooms/RoomGrid.jsx';
import AppIcon from '../components/common/AppIcon.jsx';
import SearchTrigger from '../components/search/SearchTrigger.jsx';
import { useRoomFilterContext } from '../context/RoomFilterContext.jsx';

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
        getAvailableCities,
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

    // Bug #2: Refetch dữ liệu mỗi khi user navigate trở lại HomePage (sau lần đầu mount)
    useEffect(() => {
        if (isFirstMount.current) {
            isFirstMount.current = false;
            return;
        }
        if (currentPage === 'home') {
            refetch();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage]);

    const cities = getAvailableCities();


    const handleRoomClick = (room) => navigate('room-detail', room);

    // Scroll to results when filters change (so user sees the top of the new list)
    useEffect(() => {
        // Use a small delay to allow state to settle or ignore the very first mount if needed
        // but generally scrolling to the greeting area is what the user asked for.
        const section = document.getElementById('listing-section');
        if (section && activeFilterCount > 0) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [filters, activeFilterCount]);

    // Auto-refetch removed as per user request
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 11) return 'Chào buổi sáng';
        if (hour >= 11 && hour < 14) return 'Chào buổi trưa';
        if (hour >= 14 && hour < 18) return 'Chào buổi chiều';
        return 'Chào buổi tối';
    };

    const stats = [
        { value: `300+`, label: 'Phòng đăng ký' },
        { value: `${cities.length}`, label: 'Thành phố' },
        { value: '500+', label: 'Chủ trọ tin cậy' },
        { value: '4.8★', label: 'Đánh giá trung bình' },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-stone-50">

            {/* ---- HERO SECTION ---- */}
            <section className={`${user ? 'hidden md:block' : ''} pt-30 md:pt-48 pb-28 relative overflow-hidden bg-stone-900`}>
                {/* Subtle amber tint blobs */}
                <div className="absolute -top-20 -right-20 w-96 h-96 bg-amber-500/10 rounded-lg pointer-events-none blur-3xl" />
                <div className="absolute bottom-0 -left-16 w-72 h-72 bg-amber-600/8 rounded-lg pointer-events-none blur-3xl" />

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="max-w-6xl mx-auto px-4 sm:px-6 relative"
                >
                    <div className="max-w-2xl mx-auto text-center pb-8 md:pb-16">

                        {/* Badge */}
                        <motion.div
                            variants={itemVariants}
                            className="inline-flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/25 rounded-full px-3 py-1 mb-6"
                        >
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                            <span className="text-amber-300 text-xs font-semibold">
                                Nền tảng tìm trọ #1 Việt Nam
                            </span>
                        </motion.div>

                        <motion.h1
                            variants={itemVariants}
                            className="text-[clamp(2.35rem,7vw,3.25rem)] font-extrabold text-white! leading-[1.1] mb-5 tracking-tight"
                            style={{ fontFamily: 'var(--font-heading)' }}
                        >
                            Tìm phòng{' '}
                            <span
                                className="text-amber-400 px-3"
                                style={{ fontFamily: 'var(--font-script)', fontSize: '1.65em' }}
                            >
                                ưng ý
                            </span>{' '}
                            trong vài phút
                        </motion.h1>

                        <motion.p
                            variants={itemVariants}
                            className="text-stone-400 text-base leading-relaxed max-w-xl mx-auto mb-6 md:mb-10"
                        >
                            Hàng nghìn phòng được xác minh tại Hà Nội, TP. Hồ Chí Minh và khắp cả nước.
                            Miễn phí tìm kiếm, không phí trung gian.
                        </motion.p>

                        {/* Guided Search - Visible on all devices */}
                        <motion.div variants={itemVariants} className="block max-w-2xl mx-auto mt-6">
                            <SearchTrigger
                                displayText={getLocationDisplayText()}
                                onClick={onSearchClick}
                                isFilled={filters.city || filters.university}
                                isNavbar={false}
                            />
                        </motion.div>

                    </div>
                    {/* Stats bar */}
                    <motion.div
                        variants={itemVariants}
                        className="grid grid-cols-2 md:grid-cols-4 bg-stone-800 border border-stone-700 rounded-xl overflow-hidden max-w-3xl mx-auto"
                    >
                        {stats.map((stat, idx) => (
                            <div
                                key={stat.label}
                                className={`p-5 text-center border-stone-700 
                                    ${idx % 2 === 0 ? 'border-r' : ''} 
                                    ${idx < 2 ? 'border-b' : ''} 
                                    md:border-b-0 md:border-r md:last:border-r-0`}
                            >
                                <div
                                    className="font-extrabold text-[1.6rem] text-amber-400 leading-none"
                                    style={{ fontFamily: 'var(--font-heading)' }}
                                >
                                    {stat.value}
                                </div>
                                <div className="text-xs text-stone-400 mt-1.5 font-medium">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>
            </section>

            {/* ---- LISTING SECTION ---- */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                id="listing-section"
                className={`max-w-6xl mx-auto px-4 sm:px-6 pb-12 scroll-mt-14 ${user ? 'pt-18 md:pt-10' : 'pt-10'
                    }`}
            >

                {/* Section header + mobile filter toggle */}
                <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
                    <div>
                        <h2
                            className="text-2xl font-extrabold text-stone-900 tracking-tight flex items-baseline flex-wrap"
                            style={{ fontFamily: 'var(--font-heading)' }}
                        >
                            <span className="text-amber-500 mr-2.5" style={{ fontFamily: 'var(--font-script)', fontSize: '1.25em' }}>{getGreeting()}</span>
                            <span>{user?.user_metadata?.full_name || ""}</span>
                        </h2>
                        <p className="text-stone-500 text-sm font-medium mt-1">
                            {activeFilterCount > 0 ? getLocationDisplayText() : "Khám phá không gian sống lý tưởng dành riêng cho bạn."}
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
                                <p className="font-bold mb-2">Đã có lỗi xảy ra!</p>
                                <p className="text-sm opacity-80 m-0">{error}</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="mt-5 px-5 py-2 bg-red-600 text-white rounded-md text-sm font-bold hover:bg-red-700 transition-colors duration-200 border-none cursor-pointer"
                                >
                                    Thử lại
                                </button>
                            </div>
                        ) : (
                            <>
                                <RoomGrid
                                    rooms={filteredRooms}
                                    onRoomClick={handleRoomClick}
                                />

                                {hasMore && (
                                    <div className="flex justify-center mt-10 mb-6">
                                        <button
                                            type="button"
                                            onClick={loadMore}
                                            disabled={loadingMore}
                                            className="inline-flex items-center gap-2 px-8 py-2.5 bg-white border border-stone-200 text-stone-700 rounded-full font-semibold text-sm cursor-pointer hover:border-amber-500 hover:text-amber-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loadingMore && (
                                                <div className="w-4 h-4 border-2 border-stone-200 border-t-amber-500 rounded-full animate-spin" />
                                            )}
                                            {loadingMore ? 'Đang tải thêm...' : 'Xem thêm kết quả'}
                                        </button>
                                    </div>
                                )}

                                {!hasMore && totalCount > 0 && (
                                    <p className="text-center text-stone-400 text-sm mt-10 mb-6 italic m-0">
                                        — Đã hiển thị tất cả kết quả —
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </motion.section>

        </div>
    );
}
