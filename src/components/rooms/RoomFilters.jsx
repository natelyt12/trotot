import { useState } from "react";
import { PROVINCE } from "../../constants/province.js";
import { AMENITIES, PRICE_RANGES, AREA_RANGES, ROOM_TYPES } from "../../constants/constants.js";
import { UNIVERSITIES } from "../../constants/universities.js";
import AppIcon from "../common/AppIcon.jsx";
import { getRoomById } from "../../services/roomService.js";

/* ============================================
   RoomFilters Component
   Sidebar filter panel — flat design, amber palette
   No box-shadow, minimal borders
   ============================================ */
export default function RoomFilters({
    filters,
    updateFilter,
    resetFilters,
    toggleAmenity,
    activeFilterCount,
    highlightedField,
    isMobileMode = false,
    refetch,
    navigate,
}) {
    const selectedProvince = PROVINCE.find((p) => p.name === filters.city);
    const districts = selectedProvince ? selectedProvince.districts : [];
    const selectedDistrict = districts.find((d) => d.name === filters.district);
    const wards = selectedDistrict ? selectedDistrict.wards : [];

    // Helper for highlighted fields (from Location Wizard)
    const getHighlightStyles = (field) => {
        if (highlightedField !== field) return "";
        return "ring-2 ring-amber-500 border-amber-500 bg-amber-50/30";
    };

    const [listingIdInput, setListingIdInput] = useState("");
    const [listingIdLoading, setListingIdLoading] = useState(false);
    const [listingIdError, setListingIdError] = useState("");

    const handleListingIdSearch = async () => {
        const trimmed = listingIdInput.trim();
        if (!trimmed) return;
        setListingIdLoading(true);
        setListingIdError("");
        try {
            const room = await getRoomById(trimmed);
            if (room && navigate) {
                navigate("room-detail", room);
            } else {
                setListingIdError("Không tìm thấy tin đăng với mã này.");
            }
        } catch {
            setListingIdError("Có lỗi xảy ra, vui lòng thử lại.");
        } finally {
            setListingIdLoading(false);
        }
    };

    return (
        <div
            id="room-filters"
            className={`${isMobileMode ? "flex flex-col gap-6" : "bg-white rounded-xl border border-stone-200 p-5 flex flex-col gap-5 h-fit"}`}
        >
            {/* Header - hide in mobile mode as modal has its own header */}
            {!isMobileMode && (
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#d97706"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                        </svg>
                        <h2 className="text-sm font-medium text-stone-900 m-0" style={{ fontFamily: "var(--font-heading)" }}>
                            Bộ lọc
                        </h2>
                        {activeFilterCount > 0 && (
                            <span className="bg-amber-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[0.65rem] font-medium">
                                {activeFilterCount}
                            </span>
                        )}
                    </div>
                    {activeFilterCount > 0 && (
                        <button
                            onClick={resetFilters}
                            className="bg-transparent border-none text-amber-600 text-[0.8rem] font-medium cursor-pointer hover:text-amber-700 transition-colors duration-200"
                        >
                            Xóa tất cả
                        </button>
                    )}
                </div>
            )}

            {/* Bug #7: Tìm kiếm theo Mã tin */}
            <div>
                <p className="text-[0.82rem] font-normal text-stone-800 m-0 mb-2">Tìm theo mã tin</p>
                <div className="grid grid-cols-[1fr_42px] gap-2 w-full">
                    <input
                        id="filter-listing-id"
                        type="text"
                        value={listingIdInput}
                        onChange={(e) => {
                            setListingIdInput(e.target.value);
                            setListingIdError("");
                        }}
                        onKeyDown={(e) => e.key === "Enter" && handleListingIdSearch()}
                        placeholder="Nhập mã... (VD: TT-12345)"
                        className="min-w-0 w-full bg-stone-50 border border-transparent pl-3 pr-3 py-2 rounded-lg text-sm font-light text-stone-900 outline-none focus:bg-white focus:border-amber-400 transition-all duration-300"
                        aria-label="Tìm kiếm theo mã tin đăng"
                    />
                    <button
                        onClick={handleListingIdSearch}
                        disabled={listingIdLoading || !listingIdInput.trim()}
                        className="w-full h-[38px] bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {listingIdLoading ? <AppIcon name="reload" size={14} className="animate-spin" /> : <AppIcon name="search" size={14} />}
                    </button>
                </div>
                {listingIdError && <p className="text-red-500 text-[0.75rem] mt-1">{listingIdError}</p>}
            </div>

            {/* Reload Data Button */}
            <button
                onClick={() => refetch && refetch()}
                className="flex items-center justify-center gap-2 w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-sm font-medium transition-colors cursor-pointer border border-amber-200/50 mb-2"
            >
                <AppIcon name="reload" size={14} />
                Làm mới dữ liệu
            </button>

            {/* University filter */}
            <FilterSection title="Gần trường đại học">
                <div className="relative">
                    <input
                        list="university-list"
                        id="filter-university"
                        value={filters.university}
                        onChange={(e) => updateFilter("university", e.target.value)}
                        placeholder="Tìm theo tên trường..."
                        className={`w-full bg-stone-50 border border-transparent pl-3 pr-10 py-2 rounded-lg text-sm font-light text-stone-900 outline-none focus:bg-white focus:border-amber-400 transition-all duration-300 ${getHighlightStyles("university")}`}
                        aria-label="Lọc theo trường đại học"
                    />
                    <datalist id="university-list">
                        {UNIVERSITIES.map((u, idx) => (
                            <option key={`${u.name}-${idx}`} value={u.name} />
                        ))}
                    </datalist>
                    {filters.university && (
                        <button
                            onClick={() => updateFilter("university", "")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent border-none text-stone-400 hover:text-stone-600 cursor-pointer p-1 flex items-center justify-center"
                        >
                            <AppIcon name="close" size={14} />
                        </button>
                    )}
                </div>
            </FilterSection>

            {/* Location filters */}
            <div className="flex flex-col gap-4">
                <FilterSection title="Tỉnh / Thành phố">
                    <div className="relative">
                        <input
                            list="province-list"
                            id="filter-city"
                            value={filters.city}
                            onChange={(e) => updateFilter("city", e.target.value)}
                            placeholder="Chọn tỉnh thành..."
                            className={`w-full bg-stone-50 border border-transparent pl-3 pr-10 py-2 rounded-lg text-sm font-light text-stone-900 outline-none focus:bg-white focus:border-amber-400 transition-all duration-300 ${getHighlightStyles("city")}`}
                            aria-label="Lọc theo thành phố"
                        />
                        <datalist id="province-list">
                            {PROVINCE.map((p) => (
                                <option key={p.code} value={p.name} />
                            ))}
                        </datalist>
                        {filters.city && (
                            <button
                                onClick={() => updateFilter("city", "")}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent border-none text-stone-400 hover:text-stone-600 cursor-pointer p-1 flex items-center justify-center"
                            >
                                <AppIcon name="close" size={14} />
                            </button>
                        )}
                    </div>
                </FilterSection>

                <FilterSection title="Quận / Huyện">
                    <div className="relative">
                        <input
                            list="district-list"
                            id="filter-district"
                            value={filters.district}
                            onChange={(e) => updateFilter("district", e.target.value)}
                            placeholder="Chọn quận huyện..."
                            className={`w-full bg-stone-50 border border-transparent pl-3 pr-10 py-2 rounded-lg text-sm font-light text-stone-900 outline-none focus:bg-white focus:border-amber-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${getHighlightStyles("district")}`}
                            disabled={!filters.city}
                            aria-label="Lọc theo quận huyện"
                        />
                        <datalist id="district-list">
                            {districts.map((d) => (
                                <option key={d.code} value={d.name} />
                            ))}
                        </datalist>
                        {filters.district && (
                            <button
                                onClick={() => updateFilter("district", "")}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent border-none text-stone-400 hover:text-stone-600 cursor-pointer p-1 flex items-center justify-center"
                            >
                                <AppIcon name="close" size={14} />
                            </button>
                        )}
                    </div>
                </FilterSection>

                <FilterSection title="Phường / Xã">
                    <div className="relative">
                        <input
                            list="ward-list"
                            id="filter-ward"
                            value={filters.ward}
                            onChange={(e) => updateFilter("ward", e.target.value)}
                            placeholder="Chọn phường xã..."
                            className={`w-full bg-stone-50 border border-transparent pl-3 pr-10 py-2 rounded-lg text-sm font-light text-stone-900 outline-none focus:bg-white focus:border-amber-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${getHighlightStyles("ward")}`}
                            disabled={!filters.district}
                            aria-label="Lọc theo phường xã"
                        />
                        <datalist id="ward-list">
                            {wards.map((w) => (
                                <option key={w.code} value={w.name} />
                            ))}
                        </datalist>
                        {filters.ward && (
                            <button
                                onClick={() => updateFilter("ward", "")}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent border-none text-stone-400 hover:text-stone-600 cursor-pointer p-1 flex items-center justify-center"
                            >
                                <AppIcon name="close" size={14} />
                            </button>
                        )}
                    </div>
                </FilterSection>
            </div>

            {/* Price range */}
            <FilterSection title="Giá thuê">
                <div className="flex flex-col gap-1.5">
                    {PRICE_RANGES.map((range) => {
                        const isActive = filters.priceMin === range.min && filters.priceMax === range.max;
                        return (
                            <FilterButton
                                key={range.label}
                                isActive={isActive}
                                onClick={() => {
                                    if (isActive) {
                                        updateFilter("priceMin", 0);
                                        updateFilter("priceMax", 50000000);
                                    } else {
                                        updateFilter("priceMin", range.min);
                                        updateFilter("priceMax", range.max);
                                    }
                                }}
                            >
                                {range.label}
                            </FilterButton>
                        );
                    })}
                </div>
            </FilterSection>

            {/* Area filter */}
            <FilterSection title="Diện tích">
                <div className="flex flex-col gap-1.5">
                    {AREA_RANGES.map((range) => {
                        const isActive = filters.areaMin === range.min && filters.areaMax === range.max;
                        return (
                            <FilterButton
                                key={range.label}
                                isActive={isActive}
                                onClick={() => {
                                    if (isActive) {
                                        updateFilter("areaMin", 0);
                                        updateFilter("areaMax", 200);
                                    } else {
                                        updateFilter("areaMin", range.min);
                                        updateFilter("areaMax", range.max);
                                    }
                                }}
                            >
                                {range.label}
                            </FilterButton>
                        );
                    })}
                </div>
            </FilterSection>

            {/* Bug #4: Room type filter */}
            <FilterSection title="Loại hình">
                <div className="flex flex-col gap-1.5">
                    {Object.entries(ROOM_TYPES).map(([value, label]) => {
                        const isActive = filters.roomType === value;
                        return (
                            <FilterButton key={value} isActive={isActive} onClick={() => updateFilter("roomType", isActive ? "" : value)}>
                                {label}
                            </FilterButton>
                        );
                    })}
                </div>
            </FilterSection>

            {/* Bathroom type */}
            <FilterSection title="Nhà vệ sinh">
                <div className="flex flex-col gap-1.5">
                    {[
                        { value: "private", label: "Riêng tư" },
                        { value: "shared", label: "Chung" },
                    ].map((opt) => {
                        const isActive = filters.bathroomType === opt.value;
                        return (
                            <FilterButton key={opt.value} isActive={isActive} onClick={() => updateFilter("bathroomType", isActive ? "" : opt.value)}>
                                {opt.label}
                            </FilterButton>
                        );
                    })}
                </div>
            </FilterSection>

            {/* Amenities */}
            <FilterSection title="Tiện nghi">
                <div className="flex flex-col gap-1">
                    {/* Presets */}
                    <div className="flex flex-wrap gap-2 pb-3 mb-2 border-b border-stone-100">
                        <button
                            onClick={() => updateFilter("amenities", ["bed", "air_conditioner", "fridge", "wardrobe", "washing_machine", "wifi", "kitchen"])}
                            className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[0.72rem] font-medium hover:bg-amber-200 transition-colors duration-200 border-none cursor-pointer"
                        >
                            Full nội thất
                        </button>
                        <button
                            onClick={() => updateFilter("amenities", ["bed", "wifi", "wardrobe", "kitchen"])}
                            className="px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-[0.72rem] font-medium hover:bg-stone-200 transition-colors duration-200 border-none cursor-pointer"
                        >
                            Đồ thiết yếu
                        </button>
                        <button
                            onClick={() => updateFilter("amenities", [])}
                            className="px-3 py-1 rounded-full bg-stone-50 text-stone-500 text-[0.72rem] font-medium hover:bg-stone-100 transition-colors duration-200 border border-stone-200 cursor-pointer"
                        >
                            Bỏ chọn
                        </button>
                    </div>

                    {/* Individual amenities */}
                    <div className="flex flex-col gap-1.5">
                        {Object.entries(AMENITIES).map(([key, { label }]) => (
                            <FilterButton key={key} isActive={filters.amenities.includes(key)} onClick={() => toggleAmenity(key)}>
                                {label}
                            </FilterButton>
                        ))}
                    </div>
                </div>
            </FilterSection>

            {/* Sort */}
            <FilterSection title="Sắp xếp">
                <select
                    id="filter-sort"
                    value={filters.sortBy}
                    onChange={(e) => updateFilter("sortBy", e.target.value)}
                    className="w-full bg-stone-50 border border-transparent px-2.5 py-2.5 rounded-lg text-sm font-light text-stone-900 outline-none focus:bg-white focus:border-amber-400 transition-all duration-300 cursor-pointer"
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
                <label
                    className={`flex items-center justify-between py-2 px-3 rounded-lg border cursor-pointer transition-colors duration-150 ${
                        filters.verifiedOnly
                            ? "border-amber-200 bg-amber-50 text-amber-800"
                            : "border-transparent bg-stone-50 text-stone-600 hover:bg-stone-100"
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={filters.verifiedOnly}
                            onChange={(e) => updateFilter("verifiedOnly", e.target.checked)}
                            className="hidden"
                        />
                        <AppIcon name="verified" size={15} color={filters.verifiedOnly ? "#d97706" : "#a8a29e"} />
                        <span className="text-sm font-normal">Lọc phòng đã xác thực</span>
                    </div>
                    {filters.verifiedOnly && (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5">
                            <path d="M20 6 9 17l-5-5" />
                        </svg>
                    )}
                </label>
            </FilterSection>
        </div>
    );
}

/* ---- Sub-components ---- */

function FilterSection({ title, children }) {
    return (
        <div>
            <p className="text-[0.82rem] font-normal text-stone-800 m-0 mb-2">{title}</p>
            {children}
        </div>
    );
}

function FilterButton({ isActive, onClick, children }) {
    return (
        <button
            onClick={onClick}
            className={`w-full text-left py-2 px-3 rounded-lg border text-[0.85rem] cursor-pointer transition-all duration-200 flex justify-between items-center ${
                isActive
                    ? "border-amber-200 bg-amber-50 text-amber-700 font-normal shadow-sm"
                    : "border-transparent bg-stone-50 text-stone-600 font-light hover:bg-stone-100 hover:text-stone-800"
            }`}
        >
            <span>{children}</span>
            {isActive && <AppIcon name="check" size={16} strokeWidth={2.5} className="text-amber-600" />}
        </button>
    );
}
