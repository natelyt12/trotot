import { supabase } from '../lib/supabase.js';

/**
 * Fetch all rented rooms for a user (with full room info + landlord profile)
 * @param {string} userId
 */
export const getRentedRooms = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('rented_rooms')
            .select(`
                *,
                rooms(
                    id, title, price_monthly, address, district, city, ward,
                    slug, media_contact, room_type, area_sqm,
                    profiles!user_id(id, full_name, avatar_url, phone)
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { data: data || [], error: null };
    } catch (err) {
        console.error('Error fetching rented rooms:', err);
        return { data: [], error: err };
    }
};

/**
 * Check if the current user has already registered as renting a specific room
 * @param {string} userId
 * @param {string} roomId
 */
export const checkRentedRoom = async (userId, roomId) => {
    try {
        const { data, error } = await supabase
            .from('rented_rooms')
            .select('id')
            .eq('user_id', userId)
            .eq('room_id', roomId)
            .maybeSingle();

        if (error) throw error;
        return { data, error: null };
    } catch (err) {
        console.error('Error checking rented room:', err);
        return { data: null, error: err };
    }
};

/**
 * Check if a room is currently rented by ANY user
 * @param {string} roomId
 */
export const isRoomRentedGlobally = async (roomId) => {
    try {
        const { data, error } = await supabase.rpc('check_room_rented_status', {
            p_room_id: roomId
        });

        if (error) {
            // Fallback for when RPC is not yet created
            const { data: fbData, error: fbError } = await supabase
                .from('rented_rooms')
                .select('id')
                .eq('room_id', roomId)
                .limit(1);
            if (fbError) throw fbError;
            return { data: fbData && fbData.length > 0, error: null };
        }
        
        return { data: !!data, error: null };
    } catch (err) {
        console.error('Error checking global rented room:', err);
        return { data: false, error: err };
    }
};

/**
 * Register that the current user is renting a room
 * @param {string} userId
 * @param {string} roomId
 * @param {object} extra - { started_at, note }
 */
export const addRentedRoom = async (userId, roomId, { started_at = null, note = '' } = {}) => {
    try {
        const { data, error } = await supabase
            .from('rented_rooms')
            .insert([{ user_id: userId, room_id: roomId, started_at, note }])
            .select()
            .single();

        return { data, error };
    } catch (err) {
        console.error('Error adding rented room:', err);
        return { data: null, error: err };
    }
};

/**
 * Remove a rented room entry
 * @param {string} rentedRoomId - the PK id of the rented_rooms row
 */
export const removeRentedRoom = async (rentedRoomId) => {
    try {
        const { error } = await supabase
            .from('rented_rooms')
            .delete()
            .eq('id', rentedRoomId);

        return { error };
    } catch (err) {
        console.error('Error removing rented room:', err);
        return { error: err };
    }
};

/**
 * Clear all rented rooms for a user
 * @param {string} userId
 */
export const clearRentedRoomsOfUser = async (userId) => {
    try {
        const { error } = await supabase
            .from('rented_rooms')
            .delete()
            .eq('user_id', userId);

        return { error };
    } catch (err) {
        console.error('Error clearing rented rooms:', err);
        return { error: err };
    }
};

/**
 * Fetch all guests currently renting rooms owned by a landlord
 * @param {string} landlordId
 */
export const getLandlordGuests = async (landlordId) => {
    try {
        const { data, error } = await supabase
            .from('rented_rooms')
            .select(`
                *,
                rooms!inner(id, title, slug, user_id),
                profiles!user_id(id, full_name, avatar_url, phone)
            `)
            .eq('rooms.user_id', landlordId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { data: data || [], error: null };
    } catch (err) {
        console.error('Error fetching landlord guests:', err);
        return { data: [], error: err };
    }
};

/**
 * Transfer a rented room from one tenant to another
 * @param {string} roomId
 * @param {string} fromUserId
 * @param {string} toUserId
 */
export const transferRentedRoom = async (roomId, fromUserId, toUserId) => {
    try {
        const { data, error } = await supabase
            .from('rented_rooms')
            .update({ user_id: toUserId, started_at: new Date().toISOString() })
            .eq('room_id', roomId)
            .eq('user_id', fromUserId)
            .select();

        if (error) throw error;
        return { data, error: null };
    } catch (err) {
        console.error('Error transferring rented room:', err);
        return { data: null, error: err };
    }
};

/**
 * Execute atomic transfer via RPC (bypasses RLS issues for Landlord updating Tenant's data)
 */
export const approveRoomTransferRPC = async (requestId, postId, roomId, oldTenantId, newTenantId) => {
    try {
        const { error } = await supabase.rpc('approve_room_transfer', {
            p_request_id: requestId,
            p_post_id: postId,
            p_room_id: roomId,
            p_old_tenant_id: oldTenantId,
            p_new_tenant_id: newTenantId
        });
        if (error) throw error;
        return { error: null };
    } catch (err) {
        console.error('Error executing approve_room_transfer RPC:', err);
        return { error: err };
    }
};

/**
 * Approve roommate request via RPC (bypasses RLS issues for Landlord updating Tenant's data)
 */
export const approveRoommateRequest = async (requestId, postId, roomId, newTenantId) => {
    try {
        const { error } = await supabase.rpc('approve_roommate_request', {
            p_request_id: requestId,
            p_post_id: postId,
            p_room_id: roomId,
            p_new_tenant_id: newTenantId
        });
        if (error) throw error;
        return { error: null };
    } catch (err) {
        console.error('Error executing approveRoommateRequest RPC:', err);
        return { error: err };
    }
};
