import { useState, useMemo } from 'react';
import { getRooms } from '../data/rooms.js';

const DEFAULT_FILTERS = {
  search: '',
  city: '',
  priceMin: 0,
  priceMax: 50000000,
  areaMin: 0,
  areaMax: 200,
  amenities: [],
  bathroomType: '',
  status: 'available', // default: only show available
  sortBy: 'newest', // newest | price_asc | price_desc | area_asc
};

/**
 * Custom hook for room filtering and sorting
 * Encapsulates all filter state and derived filtered list
 */
export const useRoomFilter = () => {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const allRooms = useMemo(() => getRooms(), []);

  const filteredRooms = useMemo(() => {
    let result = [...allRooms];

    // Filter by status (default: available only)
    if (filters.status) {
      result = result.filter((r) => r.metadata.status === filters.status);
    }

    // Filter by search text
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (r) =>
          r.basic_info.title.toLowerCase().includes(q) ||
          r.basic_info.address.toLowerCase().includes(q) ||
          (r.basic_info.city && r.basic_info.city.toLowerCase().includes(q))
      );
    }

    // Filter by city
    if (filters.city) {
      result = result.filter((r) => r.basic_info.city === filters.city);
    }

    // Filter by price range
    result = result.filter(
      (r) =>
        r.basic_info.price_monthly >= filters.priceMin &&
        r.basic_info.price_monthly <= filters.priceMax
    );

    // Filter by area range
    result = result.filter(
      (r) =>
        r.basic_info.area_sqm >= filters.areaMin &&
        r.basic_info.area_sqm <= filters.areaMax
    );

    // Filter by amenities (must have ALL selected)
    if (filters.amenities.length > 0) {
      result = result.filter((r) =>
        filters.amenities.every((a) =>
          r.room_features.amenities.includes(a)
        )
      );
    }

    // Filter by bathroom type
    if (filters.bathroomType) {
      result = result.filter(
        (r) => r.room_features.bathroom_type === filters.bathroomType
      );
    }

    // Sort
    switch (filters.sortBy) {
      case 'price_asc':
        result.sort(
          (a, b) => a.basic_info.price_monthly - b.basic_info.price_monthly
        );
        break;
      case 'price_desc':
        result.sort(
          (a, b) => b.basic_info.price_monthly - a.basic_info.price_monthly
        );
        break;
      case 'area_asc':
        result.sort(
          (a, b) => a.basic_info.area_sqm - b.basic_info.area_sqm
        );
        break;
      case 'newest':
      default:
        result.sort(
          (a, b) =>
            new Date(b.metadata.created_at) - new Date(a.metadata.created_at)
        );
        break;
    }

    return result;
  }, [allRooms, filters]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const toggleAmenity = (amenity) => {
    setFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.city) count++;
    if (filters.priceMin > 0 || filters.priceMax < 50000000) count++;
    if (filters.areaMin > 0 || filters.areaMax < 200) count++;
    if (filters.amenities.length > 0) count++;
    if (filters.bathroomType) count++;
    return count;
  }, [filters]);

  return {
    filters,
    filteredRooms,
    updateFilter,
    resetFilters,
    toggleAmenity,
    activeFilterCount,
    totalCount: allRooms.length,
  };
};
