import { getAvailableCities } from '../../data/rooms.js';
import { AMENITIES, PRICE_RANGES, AREA_RANGES } from '../../data/constants.js';


/* ============================================
   RoomFilters Component
   Sidebar filter panel for the listing page
   ============================================ */
export default function RoomFilters({ filters, updateFilter, resetFilters, toggleAmenity, activeFilterCount, totalCount, filteredCount }) {
    const cities = getAvailableCities();

    return (
        <aside
            id="room-filters"
            className="filter-sidebar-aside bg-white rounded-lg border border-stone-200 p-5 flex flex-col gap-5"
        >
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                    </svg>
                    <h2 className="text-base font-bold text-stone-900 m-0" style={{ fontFamily: 'var(--font-heading)' }}>
                        Bộ lọc
                    </h2>
                    {activeFilterCount > 0 && (
                        <span className="bg-amber-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[0.7rem] font-bold">
                            {activeFilterCount}
                        </span>
                    )}
                </div>
                {activeFilterCount > 0 && (
                    <button
                        onClick={resetFilters}
                        className="bg-transparent border-none text-amber-600 text-[0.8rem] font-semibold cursor-pointer font-sans transition-colors duration-200 hover:text-amber-700"
                    >
                        Xóa tất cả
                    </button>
                )}
            </div>

            {/* Results count */}
            <div className="bg-amber-50 border border-amber-200 rounded-[0.625rem] py-2 px-3 text-[0.825rem] text-amber-800 font-medium text-center">
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
                <div className="flex flex-col gap-2">
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
                                className={`w-full text-left py-2 px-3 rounded-md border-[1.5px] text-[0.85rem] cursor-pointer transition-all duration-150 font-sans flex justify-between items-center ${isActive ? 'border-amber-600 bg-amber-50 text-amber-800 font-semibold' : 'border-stone-200 bg-white text-stone-600 font-normal hover:bg-stone-50'}`}
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
                <div className="flex flex-col gap-2">
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
                                className={`w-full text-left py-2 px-3 rounded-md border-[1.5px] text-[0.85rem] cursor-pointer transition-all duration-150 font-sans flex justify-between items-center ${isActive ? 'border-amber-600 bg-amber-50 text-amber-800 font-semibold' : 'border-stone-200 bg-white text-stone-600 font-normal hover:bg-stone-50'}`}
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
                <div className="flex flex-col gap-1.5">
                    {[{ value: '', label: 'Tất cả' }, { value: 'private', label: 'Riêng tư' }, { value: 'shared', label: 'Chung' }].map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => updateFilter('bathroomType', opt.value)}
                            className={`w-full text-left py-2 px-3 rounded-md border-[1.5px] text-[0.85rem] cursor-pointer transition-all duration-150 font-sans flex justify-between items-center ${filters.bathroomType === opt.value ? 'border-amber-600 bg-amber-50 text-amber-800 font-semibold' : 'border-stone-200 bg-white text-stone-600 font-normal hover:bg-stone-50'}`}
                        >
                            <span>{opt.label}</span>
                            {filters.bathroomType === opt.value && (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5">
                                    <path d="M20 6 9 17l-5-5" />
                                </svg>
                            )}
                        </button>
                    ))}
                </div>
            </FilterSection>

            {/* Amenities */}
            <FilterSection title="Tiện nghi">
                <div className="flex flex-col gap-1.5">
                    {Object.entries(AMENITIES).map(([key, { label }]) => {
                        const isChecked = filters.amenities.includes(key);
                        return (
                            <label
                                key={key}
                                className={`checkbox-label py-1.5 px-2 rounded-md transition-colors duration-150 hover:bg-amber-50 cursor-pointer ${isChecked ? 'font-medium' : 'font-normal'}`}
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
            <p className="text-[0.85rem] font-bold text-stone-900 m-0 mb-2.5" style={{ fontFamily: 'var(--font-heading)' }}>
                {title}
            </p>
            {children}
        </div>
    );
}
