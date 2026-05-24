import { supabase } from '../lib/supabase.js';
import { mapSupabaseRoom } from '../utils/roomMapper.js';

/**
 * Fetches a single room by its listing_id from Supabase
 * @param {string|number} id 
 * @returns {Promise<object|null>}
 */
export const getRoomById = async (id) => {
    try {
        const { data, error } = await supabase
            .from('rooms')
            .select('*, profiles(*)')
            .eq('listing_id', id)
            .single();

        if (error) throw error;
        if (!data) return null;

        // Reconstruct nested structure using centralized mapper
        return mapSupabaseRoom(data);
    } catch (err) {
        console.error('Error fetching room detail:', err);
        return null;
    }
};

/**
 * Fetches all rooms owned by a specific user
 * @param {string} userId 
 * @returns {Promise<{data: any, error: any}>}
 */
export const getUserRooms = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('rooms')
            .select('*, profiles!user_id(full_name, phone, avatar_url, role)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        return { data, error };
    } catch (err) {
        console.error('Error fetching user rooms:', err);
        return { data: null, error: err };
    }
};

/**
 * Publishes a room from draft (sets status = 'available')
 * @param {string} roomId 
 * @returns {Promise<{error: any}>}
 */
export const publishRoom = async (roomId) => {
    try {
        const { error } = await supabase
            .from('rooms')
            .update({ status: 'available' })
            .eq('id', roomId);
        return { error };
    } catch (err) {
        console.error('Error publishing room:', err);
        return { error: err };
    }
};

/**
 * Verification mock for a room (sets is_verified = true)
 * @param {string} roomId 
 * @returns {Promise<{error: any}>}
 */
export const verifyRoomMock = async (roomId) => {
    try {
        const { error } = await supabase
            .from('rooms')
            .update({ is_verified: true })
            .eq('id', roomId);
        return { error };
    } catch (err) {
        console.error('Error verifying room:', err);
        return { error: err };
    }
};

/**
 * Deletes a room from DB
 * @param {string} roomId 
 * @returns {Promise<{data: any, error: any}>}
 */
export const deleteRoom = async (roomId) => {
    try {
        const { data, error } = await supabase
            .from('rooms')
            .delete()
            .eq('id', roomId)
            .select();
        return { data, error };
    } catch (err) {
        console.error('Error deleting room:', err);
        return { data: null, error: err };
    }
};

/**
 * Creates a new room
 * @param {object} payload 
 * @returns {Promise<{data: any, error: any}>}
 */
export const createRoom = async (payload) => {
    try {
        const { data, error } = await supabase
            .from('rooms')
            .insert([payload])
            .select();
        return { data, error };
    } catch (err) {
        console.error('Error creating room:', err);
        return { data: null, error: err };
    }
};

/**
 * Updates an existing room
 * @param {string} roomId 
 * @param {object} payload 
 * @returns {Promise<{data: any, error: any}>}
 */
export const updateRoom = async (roomId, payload) => {
    try {
        const { data, error } = await supabase
            .from('rooms')
            .update(payload)
            .eq('id', roomId)
            .select();
        return { data, error };
    } catch (err) {
        console.error('Error updating room:', err);
        return { data: null, error: err };
    }
};

/**
 * Uploads a file to room_media Supabase storage bucket
 * @param {string} filePath 
 * @param {File|Blob} file 
 * @returns {Promise<{data: any, error: any}>}
 */
export const uploadRoomMedia = async (filePath, file) => {
    try {
        const { data, error } = await supabase.storage
            .from('room_media')
            .upload(filePath, file, { upsert: true });
        return { data, error };
    } catch (err) {
        console.error('Error uploading room media:', err);
        return { data: null, error: err };
    }
};

/**
 * Retrieves the public URL of a file in room_media storage bucket
 * @param {string} filePath 
 * @returns {string}
 */
export const getRoomMediaPublicUrl = (filePath) => {
    const { data } = supabase.storage
        .from('room_media')
        .getPublicUrl(filePath);
    return data?.publicUrl || '';
};

/**
 * Removes media files from room_media storage bucket
 * @param {string[]} filePaths 
 * @returns {Promise<{data: any, error: any}>}
 */
export const deleteRoomMedia = async (filePaths) => {
    try {
        const { data, error } = await supabase.storage
            .from('room_media')
            .remove(filePaths);
        return { data, error };
    } catch (err) {
        console.error('Error deleting room media:', err);
        return { data: null, error: err };
    }
};

/**
 * Increments the views of a room using RPC or direct fallback
 * @param {string} roomId 
 * @param {number} currentViews 
 * @returns {Promise<{data: any, error: any}>}
 */
export const incrementRoomViews = async (roomId, currentViews) => {
    try {
        const { error: rpcError } = await supabase.rpc('increment_room_views', { 
            room_id: roomId 
        });

        if (rpcError) {
            console.warn('RPC failed, falling back to direct update (may fail for non-owners due to RLS):', rpcError);
            const { data, error: updateError } = await supabase
                .from('rooms')
                .update({ total_views: (currentViews || 0) + 1 })
                .eq('id', roomId)
                .select('total_views')
                .maybeSingle();
            return { data, error: updateError };
        }
        return { data: { total_views: (currentViews || 0) + 1 }, error: null };
    } catch (err) {
        console.error('Error incrementing views:', err);
        return { data: null, error: err };
    }
};

/**
 * Fetches rooms with filters and pagination
 * @param {object} filters 
 * @param {number} targetPage 
 * @param {number} itemsPerPage 
 * @returns {Promise<{data: any, error: any, count: number}>}
 */
export const getFilteredRooms = async (filters, targetPage, itemsPerPage = 18) => {
    try {
        const now = new Date().toISOString();

        let query = supabase
            .from('rooms')
            .select('*, profiles(*)', { count: 'exact' })
            .eq('status', 'available')
            // Bug #12: Ẩn tin hết hạn – chỉ lấy tin còn hạn hoặc không có ngày hết hạn
            .or(`available_until.gt.${now},available_until.is.null`);

        // Apply Filters
        if (filters.city) query = query.eq('city', filters.city);
        if (filters.district) query = query.eq('district', filters.district);
        if (filters.ward) query = query.eq('ward', filters.ward);

        if (filters.priceMin > 0) query = query.gte('price_monthly', filters.priceMin);
        if (filters.priceMax < 50000000) query = query.lte('price_monthly', filters.priceMax);

        if (filters.areaMin > 0) query = query.gte('area_sqm', filters.areaMin);
        if (filters.areaMax < 200) query = query.lte('area_sqm', filters.areaMax);

        if (filters.verifiedOnly) query = query.eq('is_verified', true);

        // Bug #4: Thêm filter loại hình bất động sản
        if (filters.roomType) query = query.eq('room_type', filters.roomType);

        if (filters.bathroomType) {
            query = query.contains('room_features', { bathroom_type: filters.bathroomType });
        }

        if (filters.amenities.length > 0) {
            query = query.contains('room_features', { amenities: filters.amenities });
        }

        if (filters.search.trim()) {
            query = query.ilike('title', `%${filters.search}%`);
        }

        // Sorting: ưu tiên verified trước, sau đó sort theo tiêu chí người dùng chọn
        const sortMap = {
            'price_asc': { column: 'price_monthly', ascending: true },
            'price_desc': { column: 'price_monthly', ascending: false },
            'area_asc': { column: 'area_sqm', ascending: true },
            'newest': { column: 'created_at', ascending: false },
        };
        const sort = sortMap[filters.sortBy] || sortMap.newest;
        // Verified rooms first, then by chosen sort
        query = query
            .order('is_verified', { ascending: false })
            .order(sort.column, { ascending: sort.ascending });

        // Pagination
        const from = targetPage * itemsPerPage;
        const to = from + itemsPerPage - 1;
        query = query.range(from, to);

        const { data, error, count } = await query;
        return { data, error, count };
    } catch (err) {
        console.error('Error fetching filtered rooms:', err);
        return { data: null, error: err, count: 0 };
    }
};

/**
 * Fetches distinct cities with rooms listed
 * @returns {Promise<{data: string[]|null, error: any}>}
 */
export const getDistinctCities = async () => {
    try {
        const { data } = await supabase.rpc('get_distinct_cities');
        if (data) {
            return { data, error: null };
        }
        // Fallback to direct query
        const { data: rooms, error } = await supabase.from('rooms').select('city').limit(1000);
        if (error) throw error;
        const cities = [...new Set(rooms.map(r => r.city))].filter(Boolean).sort();
        return { data: cities, error: null };
    } catch (err) {
        console.error('Error fetching distinct cities:', err);
        return { data: null, error: err };
    }
};

/**
 * Move a single room to draft status and reset verification.
 * @param {string} roomId - The ID of the room.
 * @returns {Promise<{data: any, error: any}>}
 */
export const moveRoomToDraft = async (roomId) => {
    try {
        const { data, error } = await supabase
            .from('rooms')
            .update({ status: 'draft', is_verified: false })
            .eq('id', roomId)
            .select();
        return { data, error };
    } catch (err) {
        console.error('Error moving room to draft:', err);
        return { data: null, error: err };
    }
};

/**
 * Move all available rooms of a user to draft status and reset verification.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<{data: any, error: any}>}
 */
export const draftAllUserRooms = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('rooms')
            .update({ status: 'draft', is_verified: false })
            .eq('user_id', userId)
            .eq('status', 'available')
            .select();
        return { data, error };
    } catch (err) {
        console.error('Error drafting all user rooms:', err);
        return { data: null, error: err };
    }
};

/**
 * Invokes the edge function to delete a Cloudinary image
 * @param {string} publicId 
 * @returns {Promise<{data: any, error: any}>}
 */
export const deleteCloudinaryImage = async (publicId) => {
    try {
        const { data, error } = await supabase.functions.invoke('delete-cloudinary-image', {
            body: { publicId }
        });
        return { data, error };
    } catch (err) {
        console.error('Error invoking delete-cloudinary-image:', err);
        return { data: null, error: err };
    }
};

/**
 * Fetches multiple rooms by a list of IDs
 * @param {string[]} ids 
 * @returns {Promise<{data: any, error: any}>}
 */
export const getRoomsByIds = async (ids) => {
    try {
        const { data, error } = await supabase
            .from('rooms')
            .select('*, profiles(*)')
            .in('id', ids);
        return { data, error };
    } catch (err) {
        console.error('Error fetching rooms by IDs:', err);
        return { data: null, error: err };
    }
};

/**
 * Fetches available (active) rooms owned by a specific user for public profile (paginated)
 * @param {string} userId 
 * @param {number} targetPage 
 * @param {number} itemsPerPage 
 * @returns {Promise<{data: any, error: any, count: number}>}
 */
export const getActiveUserRooms = async (userId, targetPage = 0, itemsPerPage = 6) => {
    try {
        const from = targetPage * itemsPerPage;
        const to = from + itemsPerPage - 1;

        const { data, error, count } = await supabase
            .from('rooms')
            .select('*, profiles!user_id(full_name, phone, avatar_url, role)', { count: 'exact' })
            .eq('user_id', userId)
            .eq('status', 'available')
            .order('created_at', { ascending: false })
            .range(from, to);
        return { data, error, count };
    } catch (err) {
        console.error('Error fetching active user rooms:', err);
        return { data: null, error: err, count: 0 };
    }
};
