import { useState, useMemo, useEffect, useCallback } from 'react';
import { mapSupabaseRoom } from '../utils/roomMapper.js';
import { UNIVERSITIES } from '../constants/universities.js';
import { getFilteredRooms, getDistinctCities } from '../services/roomService.js';



const DEFAULT_FILTERS = {
    search: '',
    city: '',
    district: '',
    ward: '',
    university: '',
    priceMin: 0,
    priceMax: 50000000,
    areaMin: 0,
    areaMax: 200,
    amenities: [],
    bathroomType: '',
    verifiedOnly: false,
    sortBy: 'newest', // newest | price_asc | price_desc | area_asc
};

const ITEMS_PER_PAGE = 18;

/**
 * Custom hook for Server-Side Room Filtering and Pagination
 */
export const useRoomFilter = () => {
    const [filters, setFilters] = useState(DEFAULT_FILTERS);
    const [rooms, setRooms] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    // Function to build and execute the query
    const fetchRooms = useCallback(async (targetPage, isLoadMore = false) => {
        try {
            if (isLoadMore) setLoadingMore(true);
            else {
                setLoading(true);
                setError(null);
            }

            const { data, error, count } = await getFilteredRooms(filters, targetPage, ITEMS_PER_PAGE);

            if (error) throw error;

            const mappedData = data ? data.map(mapSupabaseRoom) : [];

            if (isLoadMore) {
                setRooms(prev => [...prev, ...mappedData]);
            } else {
                setRooms(mappedData);
            }

            setPage(targetPage);
            setTotalCount(count || 0);
            setHasMore(mappedData.length === ITEMS_PER_PAGE);
        } catch (err) {
            console.error('Error fetching rooms:', err);
            setError(err.message);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [filters]); // Does not depend on page anymore

    // Reset page and fetch when filters change
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchRooms(0, false);
        }, 300);

        return () => clearTimeout(timer);
    }, [filters, fetchRooms]);

    const loadMore = () => {
        if (!loadingMore && hasMore) {
            fetchRooms(page + 1, true);
        }
    };

    const [highlightedField, setHighlightedField] = useState(null);

    const highlightField = (fieldId, duration = 2000) => {
        setHighlightedField(fieldId);
        if (duration) {
            setTimeout(() => setHighlightedField(null), duration);
        }
    };

    const updateFilter = (updatesOrKey, value) => {
        setFilters((prev) => {
            let next = { ...prev };

            const updates = typeof updatesOrKey === 'string'
                ? { [updatesOrKey]: value }
                : updatesOrKey;

            Object.keys(updates).forEach(key => {
                const val = updates[key];
                next[key] = val;

                // --- Location Dependency Rules ---
                if (key === 'university' && val) {
                    const uni = UNIVERSITIES.find(u => u.name === val);
                    if (uni) {
                        next.city = uni.city;
                        next.district = uni.district;
                        next.ward = uni.ward || '';
                    }
                } else if (key === 'city') {
                    if (!('district' in updates)) next.district = '';
                    if (!('ward' in updates)) next.ward = '';
                    if (!('university' in updates)) next.university = '';
                } else if (key === 'district') {
                    if (!('ward' in updates)) next.ward = '';
                    if (!('university' in updates)) next.university = '';
                } else if (key === 'ward') {
                    if (!('university' in updates)) next.university = '';
                }
            });

            return next;
        });
    };

    const resetFilters = () => setFilters(DEFAULT_FILTERS);

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
        if (filters.university) count++;
        if (filters.city && !filters.university) count++; // Only count city if not already implied by university
        if (filters.district && !filters.university) count++;
        if (filters.ward && !filters.university) count++;
        if (filters.priceMin > 0 || filters.priceMax < 50000000) count++;
        if (filters.areaMin > 0 || filters.areaMax < 200) count++;
        if (filters.amenities.length > 0) count++;
        if (filters.bathroomType) count++;
        if (filters.verifiedOnly) count++;
        return count;
    }, [filters]);

    // For cities, fetch from distinct cities service
    const [availableCities, setAvailableCities] = useState([]);
    useEffect(() => {
        const fetchCities = async () => {
            const { data } = await getDistinctCities();
            if (data) {
                setAvailableCities(data);
            }
        };
        fetchCities();
    }, []);

    // Helper to get text for search bar
    const getLocationDisplayText = useCallback(() => {
        if (filters.university) return `Quanh ${filters.university}`;
        if (filters.ward && filters.district && filters.city) return `${filters.ward}, ${filters.district}, ${filters.city}`;
        if (filters.district && filters.city) return `${filters.district}, ${filters.city}`;
        if (filters.city) return `Toàn ${filters.city}`;
        return 'Khám phá không gian sống lý tưởng dành riêng cho bạn.';
    }, [filters]);

    return {
        filters,
        filteredRooms: rooms,
        updateFilter,
        resetFilters,
        toggleAmenity,
        activeFilterCount,
        totalCount,
        filteredCount: rooms.length,
        getAvailableCities: () => availableCities,
        loading,
        loadingMore,
        hasMore,
        loadMore,
        error,
        highlightedField,
        highlightField,
        getLocationDisplayText,
        refetch: () => fetchRooms(0, false)
    };
};
