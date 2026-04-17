import { getAvailableCities } from '../../data/rooms.js';
import { AMENITIES, PRICE_RANGES, AREA_RANGES } from '../../data/constants.js';
import { formatPrice } from '../../utils/formatters.js';

/* ============================================
   RoomFilters Component
   Sidebar filter panel for the listing page
   ============================================ */
export default function RoomFilters({ filters, updateFilter, resetFilters, toggleAmenity, activeFilterCount, totalCount, filteredCount }) {
  const cities = getAvailableCities();

  return (
    <aside
      id="room-filters"
      style={{
        background: '#fff',
        borderRadius: '1rem',
        border: '1px solid #e7e5e4',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        position: 'sticky',
        top: '88px',
        maxHeight: 'calc(100vh - 104px)',
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, color: '#1c1917', margin: 0 }}>
            Bộ lọc
          </h2>
          {activeFilterCount > 0 && (
            <span
              style={{
                background: '#d97706',
                color: '#fff',
                borderRadius: '999px',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                fontWeight: 700,
              }}
            >
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={resetFilters}
            style={{
              background: 'none',
              border: 'none',
              color: '#d97706',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#b45309'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#d97706'; }}
          >
            Xóa tất cả
          </button>
        )}
      </div>

      {/* Results count */}
      <div
        style={{
          background: '#fffbeb',
          border: '1px solid #fde68a',
          borderRadius: '0.625rem',
          padding: '0.5rem 0.75rem',
          fontSize: '0.825rem',
          color: '#92400e',
          fontWeight: 500,
          textAlign: 'center',
        }}
      >
        Tìm thấy <strong>{filteredCount}</strong> / {totalCount} phòng
      </div>

      {/* City filter */}
      <FilterSection title="Thành phố">
        <select
          id="filter-city"
          value={filters.city}
          onChange={(e) => updateFilter('city', e.target.value)}
          className="select"
          aria-label="Lọc theo thành phố"
        >
          <option value="">Tất cả thành phố</option>
          {cities.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </FilterSection>

      {/* Price range */}
      <FilterSection title="Giá thuê">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {PRICE_RANGES.map((range) => {
            const isActive = filters.priceMin === range.min && filters.priceMax === range.max;
            return (
              <button
                key={range.label}
                onClick={() => {
                  if (isActive) {
                    updateFilter('priceMin', 0);
                    updateFilter('priceMax', 50000000);
                  } else {
                    updateFilter('priceMin', range.min);
                    updateFilter('priceMax', range.max);
                  }
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.5rem',
                  border: isActive ? '1.5px solid #d97706' : '1.5px solid #e7e5e4',
                  background: isActive ? '#fffbeb' : '#fff',
                  color: isActive ? '#92400e' : '#57534e',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  fontFamily: 'Inter, sans-serif',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#fafaf9'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = '#fff'; }}
              >
                <span>{range.label}</span>
                {isActive && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Area filter */}
      <FilterSection title="Diện tích">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {AREA_RANGES.map((range) => {
            const isActive = filters.areaMin === range.min && filters.areaMax === range.max;
            return (
              <button
                key={range.label}
                onClick={() => {
                  if (isActive) {
                    updateFilter('areaMin', 0);
                    updateFilter('areaMax', 200);
                  } else {
                    updateFilter('areaMin', range.min);
                    updateFilter('areaMax', range.max);
                  }
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.5rem',
                  border: isActive ? '1.5px solid #d97706' : '1.5px solid #e7e5e4',
                  background: isActive ? '#fffbeb' : '#fff',
                  color: isActive ? '#92400e' : '#57534e',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  fontFamily: 'Inter, sans-serif',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#fafaf9'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = '#fff'; }}
              >
                <span>{range.label}</span>
                {isActive && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Bathroom type */}
      <FilterSection title="Nhà vệ sinh">
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[{ value: '', label: 'Tất cả' }, { value: 'private', label: 'Riêng tư' }, { value: 'shared', label: 'Chung' }].map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateFilter('bathroomType', opt.value)}
              style={{
                flex: 1,
                padding: '0.45rem 0.35rem',
                borderRadius: '0.5rem',
                border: filters.bathroomType === opt.value ? '1.5px solid #d97706' : '1.5px solid #e7e5e4',
                background: filters.bathroomType === opt.value ? '#fffbeb' : '#fff',
                color: filters.bathroomType === opt.value ? '#92400e' : '#57534e',
                fontSize: '0.8rem',
                fontWeight: filters.bathroomType === opt.value ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Amenities */}
      <FilterSection title="Tiện nghi">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {Object.entries(AMENITIES).map(([key, { label }]) => {
            const isChecked = filters.amenities.includes(key);
            return (
              <label
                key={key}
                className="checkbox-label"
                style={{
                  padding: '0.35rem 0.5rem',
                  borderRadius: '0.5rem',
                  transition: 'background 0.15s',
                  fontWeight: isChecked ? 500 : 400,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#fffbeb'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleAmenity(key)}
                  id={`amenity-${key}`}
                />
                {label}
              </label>
            );
          })}
        </div>
      </FilterSection>

      {/* Sort */}
      <FilterSection title="Sắp xếp">
        <select
          id="filter-sort"
          value={filters.sortBy}
          onChange={(e) => updateFilter('sortBy', e.target.value)}
          className="select"
          aria-label="Sắp xếp kết quả"
        >
          <option value="newest">Mới nhất</option>
          <option value="price_asc">Giá thấp → cao</option>
          <option value="price_desc">Giá cao → thấp</option>
          <option value="area_asc">Diện tích tăng dần</option>
        </select>
      </FilterSection>
    </aside>
  );
}

function FilterSection({ title, children }) {
  return (
    <div>
      <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.85rem', fontWeight: 700, color: '#1c1917', marginBottom: '0.625rem', margin: '0 0 0.625rem 0' }}>
        {title}
      </p>
      {children}
    </div>
  );
}
