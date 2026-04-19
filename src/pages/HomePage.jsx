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
        <div style={{ minHeight: '100vh', background: 'var(--color-brand-50)' }}>
            {/* ---- HERO SECTION ---- */}
            <section
                style={{
                    background: 'linear-gradient(135deg, #1c1917 0%, #292524 40%, #3c2a1e 100%)',
                    paddingTop: '96px',
                    paddingBottom: '0',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Decorative blobs */}
                <div
                    style={{
                        position: 'absolute',
                        top: '-80px',
                        right: '-80px',
                        width: '400px',
                        height: '400px',
                        background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)',
                        pointerEvents: 'none',
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        bottom: '0',
                        left: '-60px',
                        width: '300px',
                        height: '300px',
                        background: 'radial-gradient(circle, rgba(217,119,6,0.1) 0%, transparent 70%)',
                        pointerEvents: 'none',
                    }}
                />

                <div className="container-app" style={{ paddingTop: '5rem', paddingBottom: '3rem', position: 'relative' }}>
                    <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center', paddingBottom: '4rem' }}>
                        {/* Badge */}
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '999px', padding: '0.35rem 0.875rem', marginBottom: '1.5rem' }}>
                            <span style={{ width: '6px', height: '6px', background: '#f59e0b', borderRadius: '50%', display: 'inline-block' }} />
                            <span style={{ color: '#fcd34d', fontSize: '0.8rem', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
                                Nền tảng tìm trọ #1 Việt Nam
                            </span>
                        </div>

                        <h1
                            style={{
                                fontFamily: 'var(--font-heading)',
                                fontSize: 'clamp(2.25rem, 6vw, 3.5rem)',
                                fontWeight: 800,
                                color: '#fff',
                                lineHeight: 1.1,
                                marginBottom: '1.25rem',
                                letterSpacing: '-0.02em',
                            }}
                        >
                            Tìm phòng trọ{' '}
                            <span
                                style={{
                                    background: 'linear-gradient(90deg, #f59e0b, #fcd34d)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                }}
                            >
                                ưng ý
                            </span>{' '}
                            trong vài phút
                        </h1>

                        <p
                            style={{
                                color: '#a8a29e',
                                fontSize: '1.1rem',
                                lineHeight: 1.7,
                                marginBottom: '2.5rem',
                                fontFamily: 'Inter, sans-serif',
                                maxWidth: '600px',
                                margin: '0 auto 2.5rem'
                            }}
                        >
                            Hàng nghìn phòng được xác minh tại Hà Nội, TP. Hồ Chí Minh và khắp cả nước.
                            Miễn phí tìm kiếm, không phí trung gian.
                        </p>

                        {/* Call to Action Button */}
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <button
                                onClick={scrollToListing}
                                className="btn-primary"
                                style={{
                                    padding: '1.125rem 3rem',
                                    fontSize: '1.15rem',
                                    borderRadius: '999px',
                                    boxShadow: '0 10px 40px rgba(217,119,6,0.5)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.875rem',
                                    animation: 'fadeInUp 0.8s ease'
                                }}
                            >
                                <span style={{ fontWeight: 800 }}>Tìm phòng ngay</span>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Stats bar - Floating Card */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                            background: 'rgba(28,25,23,0.7)',
                            backdropFilter: 'blur(16px)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '1.5rem',
                            overflow: 'hidden',
                            maxWidth: '900px',
                            margin: '0 auto',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                        }}
                    >
                        {stats.map((stat, idx) => (
                            <div
                                key={stat.label}
                                style={{
                                    padding: '1.5rem 1rem',
                                    textAlign: 'center',
                                    borderRight: idx < stats.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                                }}
                            >
                                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.75rem', color: '#fcd34d', lineHeight: 1 }}>
                                    {stat.value}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#a8a29e', marginTop: '0.4rem', fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ---- LISTING SECTION ---- */}
            <section id="listing-section" className="container-app" style={{ paddingTop: '2.5rem', paddingBottom: '3rem', scrollMarginTop: '50px' }}>
                {/* Mobile Filter Toggle */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, color: '#1c1917', margin: '0 0 0.2rem' }}>
                            Danh sách phòng trọ
                        </h2>
                        <p style={{ color: '#78716c', fontSize: '0.875rem', margin: 0 }}>
                            {filteredRooms.length} phòng phù hợp
                            {filters.city ? ` tại ${filters.city}` : ''}
                            {filters.search ? ` với "${filters.search}"` : ''}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowMobileFilter(!showMobileFilter)}
                        className="btn-secondary btn-filter-toggle"
                        style={{ fontSize: '0.85rem' }}
                        aria-expanded={showMobileFilter}
                        aria-controls="room-filters"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                        </svg>
                        Bộ lọc
                        {activeFilterCount > 0 && (
                            <span
                                style={{
                                    background: '#d97706',
                                    color: '#fff',
                                    borderRadius: '999px',
                                    width: '18px',
                                    height: '18px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                }}
                            >
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Layout: Sidebar + Grid */}
                <div
                    className="listing-layout"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(0, 1fr) 280px',
                        gridTemplateAreas: '"grid sidebar"',
                        gap: '2rem',
                        alignItems: 'stretch',
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
