import { supabase } from '../lib/supabase';

/**
 * Move a single room to draft status and reset verification.
 * @param {string} roomId - The ID of the room.
 * @returns {Promise<{data, error}>}
 */
export const moveRoomToDraft = async (roomId) => {
    return await supabase
        .from('rooms')
        .update({ status: 'draft', is_verified: false })
        .eq('id', roomId);
};

/**
 * Move all available rooms of a user to draft status and reset verification.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<{data, error}>}
 */
export const draftAllUserRooms = async (userId) => {
    return await supabase
        .from('rooms')
        .update({ status: 'draft', is_verified: false })
        .eq('user_id', userId)
        .eq('status', 'available');
};
