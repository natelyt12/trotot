import { useState, useMemo, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';

const DEFAULT_FILTERS = {
  search: '',
  city: '',
  district: '',
  ward: '',
  priceMin: 0,
  priceMax: 50000000,
  areaMin: 0,
  areaMax: 200,
  amenities: [],
  bathroomType: '',
  verifiedOnly: false,
  sortBy: 'newest', // newest | price_asc | price_desc | area_asc
};

const ITEMS_PER_PAGE = 12;

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
  const fetchRooms = useCallback(async (isLoadMore = false) => {
    try {
      if (isLoadMore) setLoadingMore(true);
      else setLoading(true);

      let query = supabase
        .from('rooms')
        .select('*', { count: 'exact' });

      // Apply Filters
      if (filters.city) query = query.eq('city', filters.city);
      if (filters.district) query = query.eq('district', filters.district);
      if (filters.ward) query = query.eq('ward', filters.ward);
      
      if (filters.priceMin > 0) query = query.gte('price_monthly', filters.priceMin);
      if (filters.priceMax < 50000000) query = query.lte('price_monthly', filters.priceMax);
      
      if (filters.areaMin > 0) query = query.gte('area_sqm', filters.areaMin);
      if (filters.areaMax < 200) query = query.lte('area_sqm', filters.areaMax);
      
      if (filters.verifiedOnly) query = query.eq('is_verified', true);
      
      if (filters.bathroomType) {
        query = query.contains('room_features', { bathroom_type: filters.bathroomType });
      }
      
      if (filters.amenities.length > 0) {
        // Correct Supabase JSONB contains syntax: column name + object structure
        query = query.contains('room_features', { amenities: filters.amenities });
      }

      if (filters.search.trim()) {
        query = query.ilike('title', `%${filters.search}%`);
      }

      // Sorting
      const sortMap = {
        'price_asc': { column: 'price_monthly', ascending: true },
        'price_desc': { column: 'price_monthly', ascending: false },
        'area_asc': { column: 'area_sqm', ascending: true },
        'newest': { column: 'created_at', ascending: false },
      };
      const sort = sortMap[filters.sortBy] || sortMap.newest;
      query = query.order(sort.column, { ascending: sort.ascending });

      // Pagination
      const from = isLoadMore ? (page + 1) * ITEMS_PER_PAGE : 0;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      // Reconstruct nested structure
      const mappedData = data.map(r => ({
        ...r,
        basic_info: {
          title: r.title,
          room_type: r.room_type,
          price_monthly: r.price_monthly,
          area_sqm: r.area_sqm,
          city: r.city,
          district: r.district,
          ward: r.ward,
          address: r.address
        },
        metadata: {
          is_verified: r.is_verified,
          status: r.status,
          total_views: r.total_views,
          total_favorites: r.total_favorites,
          created_at: r.created_at,
          updated_at: r.updated_at
        }
      }));

      if (isLoadMore) {
        setRooms(prev => [...prev, ...mappedData]);
        setPage(prev => prev + 1);
      } else {
        setRooms(mappedData);
        setPage(0);
      }

      setTotalCount(count || 0);
      setHasMore(mappedData.length === ITEMS_PER_PAGE);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters, page]);

  // Initial fetch and fetch on filter change
  useEffect(() => {
    // Debounce search filter if needed, but for now just fetch
    const timer = setTimeout(() => {
      fetchRooms(false);
    }, 300); // Small debounce for rapid filter changes

    return () => clearTimeout(timer);
  }, [filters]);

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchRooms(true);
    }
  };

  const updateFilter = (key, value) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'city') {
        next.district = '';
        next.ward = '';
      } else if (key === 'district') {
        next.ward = '';
      }
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
    if (filters.city) count++;
    if (filters.district) count++;
    if (filters.ward) count++;
    if (filters.priceMin > 0 || filters.priceMax < 50000000) count++;
    if (filters.areaMin > 0 || filters.areaMax < 200) count++;
    if (filters.amenities.length > 0) count++;
    if (filters.bathroomType) count++;
    if (filters.verifiedOnly) count++;
    return count;
  }, [filters]);

  // For cities, we might still need a separate query or a constant list
  // For now, let's just return a static list or fetch once
  const [availableCities, setAvailableCities] = useState([]);
  useEffect(() => {
    const fetchCities = async () => {
      const { data } = await supabase.rpc('get_distinct_cities'); // Or just use a constant list
      // If RPC doesn't exist, we can just use PROVINCE list or a simple select
      if (!data) {
          // Fallback to fetching first 1000 and extracting (not ideal but works for now)
          const { data: rooms } = await supabase.from('rooms').select('city').limit(1000);
          if (rooms) {
              const cities = [...new Set(rooms.map(r => r.city))].filter(Boolean).sort();
              setAvailableCities(cities);
          }
      } else {
          setAvailableCities(data);
      }
    };
    fetchCities();
  }, []);

  return {
    filters,
    filteredRooms: rooms,
    updateFilter,
    resetFilters,
    toggleAmenity,
    activeFilterCount,
    totalCount,
    filteredCount: rooms.length, // This is count of currently loaded
    getAvailableCities: () => availableCities,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    error
  };
};
