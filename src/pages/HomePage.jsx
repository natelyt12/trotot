import { useState } from 'react';
import RoomFilters from '../components/rooms/RoomFilters.jsx';
import RoomGrid from '../components/rooms/RoomGrid.jsx';
import { useRoomFilter } from '../hooks/useRoomFilter.js';
import { getAvailableCities } from '../data/rooms.js';

/* ============================================
   HomePage – Main listing + search + filters
   ============================================ */
export default function HomePage({ navigate }) {
    const {
        filters,
        filteredRooms,
        updateFilter,
        resetFilters,
        toggleAmenity,
        activeFilterCount,
        totalCount,
    } = useRoomFilter();

    const [showMobileFilter, setShowMobileFilter] = useState(false);
    const cities = getAvailableCities();

    const scrollToListing = () => {
        const el = document.getElementById('listing-section');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleRoomClick = (room) => {
        navigate('room-detail', room);
    };

    // Stats derived from data
    const stats = [
        { value: `${totalCount}+`, label: 'Phòng đăng ký' },
        { value: `${cities.length}`, label: 'Thành phố' },
        { value: '500+', label: 'Chủ trọ tin cậy' },
        { value: '4.8★', label: 'Đánh giá trung bình' },
    ];

    return (
        <div className="min-h-screen bg-stone-50">
            {/* ---- HERO SECTION ---- */}
            <section
                className="pt-50 pb-30 relative overflow-hidden bg-linear-to-br from-stone-900 via-stone-800 to-[#3c2a1e]"
            >
                {/* Decorative blobs */}
                <div
                    className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(245,158,11,0.15)_0%,transparent_70%)] pointer-events-none"
                />
                <div
                    className="absolute bottom-0 -left-15 w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(217,119,6,0.1)_0%,transparent_70%)] pointer-events-none"
                />

                <div className="container-app pt-20 pb-12 relative">
                    <div className="max-w-[720px] mx-auto text-center pb-16">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/30 rounded-full py-1.5 px-3.5 mb-6">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full inline-block" />
                            <span className="text-amber-300 text-[0.8rem] font-semibold font-sans">
                                Nền tảng tìm trọ #1 Việt Nam
                            </span>
                        </div>

                        <h1
                            className="text-[clamp(2.25rem,6vw,3.5rem)] font-extrabold text-white! leading-[1.1] mb-5 tracking-[-0.02em]"
                            style={{ fontFamily: 'var(--font-heading)' }}
                        >
                            Tìm phòng trọ{' '}
                            <span className="bg-linear-to-r from-amber-500 to-amber-300 bg-clip-text text-transparent">
                                ưng ý
                            </span>{' '}
                            trong vài phút
                        </h1>

                        <p className="text-stone-400 text-[1.1rem] leading-[1.7] font-sans max-w-[600px] mx-auto mb-10">
                            Hàng nghìn phòng được xác minh tại Hà Nội, TP. Hồ Chí Minh và khắp cả nước.
                            Miễn phí tìm kiếm, không phí trung gian.
                        </p>

                        {/* Call to Action Button */}
                        <div className="flex justify-center">
                            <button
                                onClick={scrollToListing}
                                className="btn-primary px-12! py-4! rounded-full!"
                                style={{ animation: 'fadeInUp 0.8s ease' }}
                            >
                                <span className="font-extrabold">Tìm phòng ngay</span>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Stats bar - Floating Card */}
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] bg-stone-900/70 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden max-w-[900px] mx-auto shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                        {stats.map((stat, idx) => (
                            <div
                                key={stat.label}
                                className={`p-6 text-center ${idx < stats.length - 1 ? 'border-r border-white/5' : ''}`}
                            >
                                <div className="font-extrabold text-[1.75rem] text-amber-300 leading-none" style={{ fontFamily: 'var(--font-heading)' }}>
                                    {stat.value}
                                </div>
                                <div className="text-[0.85rem] text-stone-400 mt-1.5 font-medium font-sans">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ---- LISTING SECTION ---- */}
            <section id="listing-section" className="container-app pt-10! pb-12! scroll-mt-[50px]">
                {/* Mobile Filter Toggle */}
                <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
                    <div>
                        <h2 className="text-[1.25rem] font-bold text-stone-900 m-0 mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                            Danh sách phòng trọ
                        </h2>
                        <p className="text-stone-500 text-[0.875rem] m-0">
                            {filteredRooms.length} phòng phù hợp
                            {filters.city ? ` tại ${filters.city}` : ''}
                            {filters.search ? ` với "${filters.search}"` : ''}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowMobileFilter(!showMobileFilter)}
                        className="btn-secondary btn-filter-toggle text-[0.85rem]"
                        aria-expanded={showMobileFilter}
                        aria-controls="room-filters"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                        </svg>
                        Bộ lọc
                        {activeFilterCount > 0 && (
                            <span className="bg-amber-600 text-white rounded-full w-[18px] h-[18px] inline-flex items-center justify-center text-[0.7rem] font-bold">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Layout: Sidebar + Grid */}
                <div
                    className="listing-layout grid gap-8 items-stretch"
                    style={{
                        gridTemplateColumns: 'minmax(0, 1fr) 280px',
                        gridTemplateAreas: '"grid sidebar"',
                    }}
                >
                    {/* Filter Sidebar Area */}
                    <div
                        className={`filter-sidebar-container ${showMobileFilter ? 'mobile-visible' : ''}`}
                        style={{ gridArea: 'sidebar' }}
                    >
                        <RoomFilters
                            filters={filters}
                            updateFilter={updateFilter}
                            resetFilters={resetFilters}
                            toggleAmenity={toggleAmenity}
                            activeFilterCount={activeFilterCount}
                            totalCount={totalCount}
                            filteredCount={filteredRooms.length}
                        />
                    </div>

                    {/* Main Content Area */}
                    <div style={{ gridArea: 'grid' }}>
                        <RoomGrid
                            rooms={filteredRooms}
                            onRoomClick={handleRoomClick}
                        />
                    </div>
                </div>
            </section>

            {/* Responsive styles */}
            <style>{`
                .btn-filter-toggle {
                    display: none !important;
                }

                @media (max-width: 1024px) {
                    .btn-filter-toggle {
                        display: inline-flex !important;
                    }
                    .listing-layout {
                        display: block !important;
                    }
                    .filter-sidebar-container {
                        display: none;
                        margin-bottom: 2rem;
                    }
                    .filter-sidebar-container.mobile-visible {
                        display: block;
                    }
                }
            `}</style>
        </div>
    );
}
