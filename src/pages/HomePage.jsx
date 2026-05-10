import { useState, useEffect } from 'react';
import RoomFilters from '../components/rooms/RoomFilters.jsx';
import RoomGrid from '../components/rooms/RoomGrid.jsx';
import { useRoomFilter } from '../hooks/useRoomFilter.js';

/* ============================================
   HomePage – Listing + search + filters
   Flat design, amber palette
   ============================================ */
export default function HomePage({ navigate, user }) {
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
        error
    } = useRoomFilter();

    const [showMobileFilter, setShowMobileFilter] = useState(false);
    const cities = getAvailableCities();

    const scrollToListing = () => {
        const el = document.getElementById('listing-section');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // Auto-scroll to results when filters change
    useEffect(() => {
        // We use a small delay to ensure the loading state or results have started updating
        // and to avoid scrolling on the very first mount if filters are at default
        if (activeFilterCount > 0) {
            scrollToListing();
        }
    }, [filters, activeFilterCount]);

    const handleRoomClick = (room) => navigate('room-detail', room);

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

    return (
        <div className="min-h-screen bg-stone-50">

            {/* ---- HERO SECTION ---- */}
            <section className="pt-24 md:pt-48 pb-28 relative overflow-hidden bg-stone-900">
                {/* Subtle amber tint blobs */}
                <div className="absolute -top-20 -right-20 w-96 h-96 bg-amber-500/10 rounded-lg pointer-events-none blur-3xl" />
                <div className="absolute bottom-0 -left-16 w-72 h-72 bg-amber-600/8 rounded-lg pointer-events-none blur-3xl" />

                <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
                    <div className="max-w-2xl mx-auto text-center pb-16">

                        {/* Badge */}
                        <div className="inline-flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/25 rounded-full px-3 py-1 mb-6">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                            <span className="text-amber-300 text-xs font-semibold">
                                Nền tảng tìm trọ #1 Việt Nam
                            </span>
                        </div>

                        <h1
                            className="text-[clamp(2rem,6vw,3.25rem)] font-extrabold text-white! leading-[1.1] mb-5 tracking-tight"
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
                        </h1>

                        <p className="text-stone-400 text-lg leading-relaxed max-w-xl mx-auto mb-10">
                            Hàng nghìn phòng được xác minh tại Hà Nội, TP. Hồ Chí Minh và khắp cả nước.
                            Miễn phí tìm kiếm, không phí trung gian.
                        </p>

                        {/* CTA */}
                        <div className="flex justify-center">
                            <button
                                onClick={scrollToListing}
                                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-10 py-3.5 !rounded-full font-bold text-base cursor-pointer border-none transition-colors duration-200"
                                style={{ animation: 'fadeInUp 0.8s ease' }}
                            >
                                Tìm phòng ngay
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Stats bar */}
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] bg-stone-800 border border-stone-700 rounded-xl overflow-hidden max-w-3xl mx-auto">
                        {stats.map((stat, idx) => (
                            <div
                                key={stat.label}
                                className={`p-5 text-center ${idx < stats.length - 1 ? 'border-r border-stone-700' : ''}`}
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
                    </div>
                </div>
            </section>

            {/* ---- LISTING SECTION ---- */}
            <section id="listing-section" className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-12 scroll-mt-14">

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
                        <p className="text-stone-500 text-sm font-medium mt-1">Khám phá không gian sống lý tưởng dành riêng cho bạn.</p>
                    </div>

                    {/* Mobile filter button */}
                    <button
                        onClick={() => setShowMobileFilter(!showMobileFilter)}
                        className="lg:hidden inline-flex items-center gap-2 bg-white border border-stone-200 text-stone-700 px-4 py-2 rounded-full text-sm font-semibold cursor-pointer hover:border-amber-500 hover:text-amber-600 transition-colors duration-200"
                        aria-expanded={showMobileFilter}
                        aria-controls="room-filters"
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                        </svg>
                        Bộ lọc
                        {activeFilterCount > 0 && (
                            <span className="bg-amber-500 text-white rounded-full w-4 h-4 inline-flex items-center justify-center text-[0.65rem] font-bold">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Layout: Grid (left) + Sidebar (right) */}
                <div className="flex flex-col lg:flex-row-reverse gap-6 items-start">

                    {/* Sidebar */}
                    <div className={`w-full lg:w-[280px] lg:shrink-0 filter-sidebar-aside ${showMobileFilter ? 'block' : 'hidden lg:block'}`}>
                        <RoomFilters
                            filters={filters}
                            updateFilter={updateFilter}
                            resetFilters={resetFilters}
                            toggleAmenity={toggleAmenity}
                            activeFilterCount={activeFilterCount}
                        />
                    </div>

                    {/* Main content */}
                    <div className="flex-1 min-w-0 min-h-[70vh]">
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
            </section>
        </div>
    );
}
