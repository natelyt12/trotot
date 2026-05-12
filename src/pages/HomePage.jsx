import { useState } from 'react';
import RoomFilters from '../components/rooms/RoomFilters.jsx';
import RoomGrid from '../components/rooms/RoomGrid.jsx';
import { useRoomFilter } from '../hooks/useRoomFilter.js';
import AppIcon from '../components/common/AppIcon.jsx';
import LocationWizardModal from '../components/search/LocationWizardModal.jsx';

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
        error,
        highlightedField,
        highlightField
    } = useRoomFilter();

    const [showMobileFilter, setShowMobileFilter] = useState(false);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const cities = getAvailableCities();

    // Derive display text for the fake input
    const getLocationDisplayText = () => {
        if (filters.university) return `Quanh ${filters.university}`;
        if (filters.ward && filters.district && filters.city) return `${filters.ward}, ${filters.district}, ${filters.city}`;
        if (filters.district && filters.city) return `${filters.district}, ${filters.city}`;
        if (filters.city) return `Toàn ${filters.city}`;
        return 'Tìm khu vực hoặc trường Đại học...';
    };

    const handleLocationComplete = (locationFilters) => {
        updateFilter({
            ...locationFilters,
            search: ''
        });

        // Determine which field to focus/highlight
        let targetField = '';
        if (locationFilters.university) targetField = 'university';
        else if (locationFilters.ward) targetField = 'ward';
        else if (locationFilters.district) targetField = 'district';
        else if (locationFilters.city) targetField = 'city';

        // Auto-scroll and trigger highlight
        setTimeout(() => {
            scrollToListing();
            if (targetField) highlightField(targetField);
        }, 150);
    };

    const scrollToListing = () => {
        const el = document.getElementById('listing-section');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };


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

                        {/* Guided Search (Fake Input trigger) */}
                        <div className="max-w-2xl mx-auto mt-6 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                            <button
                                onClick={() => setIsLocationModalOpen(true)}
                                className="w-full bg-stone-800/50 hover:bg-stone-800/70 border border-stone-700 p-2 pr-2 rounded-full flex items-center justify-between gap-4 transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-500/10 group shadow-lg cursor-pointer"
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-10 h-10 bg-stone-700/50 text-stone-300 rounded-full flex items-center justify-center shrink-0 group-hover:bg-amber-500/20 group-hover:text-amber-500 transition-colors">
                                        <AppIcon name="search" size={18} />
                                    </div>
                                    <div className="flex flex-col items-start truncate">
                                        <span className="text-[0.65rem] font-bold text-amber-500 uppercase tracking-wider mb-0.5">Khu vực tìm kiếm</span>
                                        <span className={`text-sm font-semibold truncate ${(filters.university || filters.city) ? 'text-white' : 'text-stone-400'
                                            }`}>
                                            {getLocationDisplayText()}
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-amber-500 text-white px-8 py-3 rounded-full font-bold text-sm transition-all duration-200 shrink-0 group-hover:bg-amber-400">
                                    Tìm ngay
                                </div>
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
                            highlightedField={highlightedField}
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

            {/* Guided Search Modal */}
            <LocationWizardModal
                isOpen={isLocationModalOpen}
                onClose={() => setIsLocationModalOpen(false)}
                onComplete={handleLocationComplete}
            />
        </div>
    );
}
