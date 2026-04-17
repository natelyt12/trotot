import { useState, useEffect } from 'react';
import SearchBar from '../components/search/SearchBar.jsx';
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

  const handleSearch = (query) => {
    updateFilter('search', query);
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

        <div className="container-app" style={{ paddingTop: '3rem', paddingBottom: '0', position: 'relative' }}>
          <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center', paddingBottom: '2.5rem' }}>
            {/* Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '999px', padding: '0.35rem 0.875rem', marginBottom: '1.25rem' }}>
              <span style={{ width: '6px', height: '6px', background: '#f59e0b', borderRadius: '50%', display: 'inline-block' }} />
              <span style={{ color: '#fcd34d', fontSize: '0.8rem', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
                Nền tảng tìm trọ #1 Việt Nam
              </span>
            </div>

            <h1
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(2rem, 5vw, 3.25rem)',
                fontWeight: 800,
                color: '#fff',
                lineHeight: 1.15,
                marginBottom: '1rem',
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
                fontSize: '1.05rem',
                lineHeight: 1.7,
                marginBottom: '2rem',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Hàng nghìn phòng được xác minh tại Hà Nội, TP. Hồ Chí Minh và khắp cả nước.
              Miễn phí tìm kiếm, không phí trung gian.
            </p>

            {/* Search bar */}
            <SearchBar onSearch={handleSearch} initialValue={filters.search} />

            {/* Quick filters */}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1rem' }}>
              {cities.map((city) => (
                <button
                  key={city}
                  onClick={() => updateFilter('city', filters.city === city ? '' : city)}
                  style={{
                    padding: '0.35rem 0.875rem',
                    borderRadius: '999px',
                    border: '1px solid',
                    borderColor: filters.city === city ? '#f59e0b' : 'rgba(255,255,255,0.2)',
                    background: filters.city === city ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.08)',
                    color: filters.city === city ? '#fcd34d' : '#d6d3d1',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontFamily: 'Inter, sans-serif',
                  }}
                  onMouseEnter={(e) => {
                    if (filters.city !== city) {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
                      e.currentTarget.style.color = '#fff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (filters.city !== city) {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                      e.currentTarget.style.color = '#d6d3d1';
                    }
                  }}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Stats bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1px',
              background: 'rgba(255,255,255,0.08)',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              overflow: 'hidden',
            }}
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                style={{
                  padding: '1.25rem',
                  textAlign: 'center',
                  background: 'rgba(28,25,23,0.6)',
                }}
              >
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.5rem', color: '#fcd34d' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#78716c', marginTop: '0.15rem', fontFamily: 'Inter, sans-serif' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- LISTING SECTION ---- */}
      <section className="container-app" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
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
            className="btn-secondary"
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
          style={{
            display: 'grid',
            gridTemplateColumns: showMobileFilter ? '1fr' : 'minmax(240px, 260px) 1fr',
            gap: '1.5rem',
            alignItems: 'start',
          }}
        >
          {/* Sidebar filters */}
          <div style={{ display: showMobileFilter ? 'block' : 'block' }}>
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

          {/* Room grid */}
          <RoomGrid
            rooms={filteredRooms}
            onRoomClick={handleRoomClick}
          />
        </div>
      </section>

      {/* Responsive override for small screens */}
      <style>{`
        @media (max-width: 768px) {
          .listing-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
