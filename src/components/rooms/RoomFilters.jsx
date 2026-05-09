import { PROVINCE } from '../../data/province.js';
import { AMENITIES, PRICE_RANGES, AREA_RANGES } from '../../data/constants.js';
import AppIcon from '../common/AppIcon.jsx';


/* ============================================
   RoomFilters Component
   Sidebar filter panel for the listing page
   ============================================ */
export default function RoomFilters({ filters, updateFilter, resetFilters, toggleAmenity, activeFilterCount, totalCount, filteredCount }) {
    // Tìm object tỉnh/thành phố hiện tại để lấy danh sách quận/huyện
    const selectedProvince = PROVINCE.find(p => p.name === filters.city);
    const districts = selectedProvince ? selectedProvince.districts : [];

    // Tìm object quận/huyện hiện tại để lấy danh sách phường/xã
    const selectedDistrict = districts.find(d => d.name === filters.district);
    const wards = selectedDistrict ? selectedDistrict.wards : [];

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
            <div className="bg-amber-50 border border-amber-200 rounded-md py-2 px-3 text-[0.825rem] text-amber-800 font-medium text-center">
                Tìm thấy <strong>{filteredCount}</strong> / {totalCount} phòng
            </div>

            {/* Location filters */}
            <div className="flex flex-col gap-4">
                {/* Province filter */}
                <FilterSection title="Tỉnh / Thành phố">
                    <input
                        list="province-list"
                        id="filter-city"
                        value={filters.city}
                        onChange={(e) => updateFilter('city', e.target.value)}
                        placeholder="Chọn tỉnh thành..."
                        className="select"
                        aria-label="Lọc theo thành phố"
                    />
                    <datalist id="province-list">
                        {PROVINCE.map((p) => (
                            <option key={p.code} value={p.name} />
                        ))}
                    </datalist>
                </FilterSection>

                {/* District filter */}
                <FilterSection title="Quận / Huyện">
                    <input
                        list="district-list"
                        id="filter-district"
                        value={filters.district}
                        onChange={(e) => updateFilter('district', e.target.value)}
                        placeholder="Chọn quận huyện..."
                        className="select"
                        disabled={!filters.city}
                        aria-label="Lọc theo quận huyện"
                    />
                    <datalist id="district-list">
                        {districts.map((d) => (
                            <option key={d.code} value={d.name} />
                        ))}
                    </datalist>
                </FilterSection>

                {/* Ward filter */}
                <FilterSection title="Phường / Xã">
                    <input
                        list="ward-list"
                        id="filter-ward"
                        value={filters.ward}
                        onChange={(e) => updateFilter('ward', e.target.value)}
                        placeholder="Chọn phường xã..."
                        className="select"
                        disabled={!filters.district}
                        aria-label="Lọc theo phường xã"
                    />
                    <datalist id="ward-list">
                        {wards.map((w) => (
                            <option key={w.code} value={w.name} />
                        ))}
                    </datalist>
                </FilterSection>
            </div>

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
                <div className="flex flex-col gap-2">
                    {[{ value: 'private', label: 'Riêng tư' }, { value: 'shared', label: 'Chung' }].map((opt) => {
                        const isActive = filters.bathroomType === opt.value;
                        return (
                            <button
                                key={opt.value}
                                onClick={() => updateFilter('bathroomType', isActive ? '' : opt.value)}
                                className={`w-full text-left py-2 px-3 rounded-md border-[1.5px] text-[0.85rem] cursor-pointer transition-all duration-150 font-sans flex justify-between items-center ${isActive ? 'border-amber-600 bg-amber-50 text-amber-800 font-semibold' : 'border-stone-200 bg-white text-stone-600 font-normal hover:bg-stone-50'}`}
                            >
                                <span>{opt.label}</span>
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

            {/* Amenities */}
            <FilterSection title="Tiện nghi">
                <div className="flex flex-col gap-1.5">
                    {/* Presets */}
                    <div className="flex flex-wrap gap-2 pb-3 mb-2 border-b border-stone-100">
                        <button
                            onClick={() => {
                                const full = ['bed', 'air_conditioner', 'fridge', 'wardrobe', 'washing_machine', 'wifi', 'kitchen'];
                                updateFilter('amenities', full);
                            }}
                            className="px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 text-[0.75rem] font-bold hover:bg-amber-200 transition-colors border-none cursor-pointer"
                        >
                            Full nội thất
                        </button>
                        <button
                            onClick={() => {
                                const essential = ['bed', 'wifi', 'wardrobe', 'kitchen'];
                                updateFilter('amenities', essential);
                            }}
                            className="px-3 py-1.5 rounded-full bg-blue-100 text-blue-800 text-[0.75rem] font-bold hover:bg-blue-200 transition-colors border-none cursor-pointer"
                        >
                            Đồ thiết yếu
                        </button>
                        <button
                            onClick={() => updateFilter('amenities', [])}
                            className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 text-[0.75rem] font-bold hover:bg-stone-200 transition-colors border-none cursor-pointer"
                        >
                            Bỏ chọn
                        </button>
                    </div>

                    {/* Individual Amenities */}
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

            {/* Verification */}
            <FilterSection title="Xác thực">
                <label className={`checkbox-label py-2 px-3 rounded-md border-[1.5px] transition-all duration-150 cursor-pointer flex justify-between items-center ${filters.verifiedOnly ? 'border-amber-600 bg-amber-50 text-amber-800 font-semibold' : 'border-stone-200 bg-white text-stone-600 font-normal hover:bg-stone-50'}`}>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={filters.verifiedOnly}
                            onChange={(e) => updateFilter('verifiedOnly', e.target.checked)}
                            className="hidden"
                        />
                        <AppIcon name="verified" size={16} color={filters.verifiedOnly ? '#d97706' : '#a8a29e'} />
                        <span>Chỉ hiện phòng đã xác minh</span>
                    </div>
                    {filters.verifiedOnly && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5">
                            <path d="M20 6 9 17l-5-5" />
                        </svg>
                    )}
                </label>
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
