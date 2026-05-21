import { supabase } from '../lib/supabase.js';

/**
 * Fetches all room IDs favorited by a user
 * @param {string} userId 
 * @returns {Promise<{data: any, error: any}>}
 */
export const getUserFavorites = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('user_favorites')
            .select('room_id')
            .eq('user_id', userId);
        return { data, error };
    } catch (err) {
        console.error('Error fetching user favorites:', err);
        return { data: null, error: err };
    }
};

/**
 * Adds a room to user's favorites
 * @param {string} userId 
 * @param {string} roomId 
 * @returns {Promise<{error: any}>}
 */
export const addUserFavorite = async (userId, roomId) => {
    try {
        const { error } = await supabase
            .from('user_favorites')
            .insert([{ user_id: userId, room_id: roomId }]);
        return { error };
    } catch (err) {
        console.error('Error adding user favorite:', err);
        return { error: err };
    }
};

/**
 * Removes a room from user's favorites
 * @param {string} userId 
 * @param {string} roomId 
 * @returns {Promise<{error: any}>}
 */
export const removeUserFavorite = async (userId, roomId) => {
    try {
        const { error } = await supabase
            .from('user_favorites')
            .delete()
            .eq('user_id', userId)
            .eq('room_id', roomId);
        return { error };
    } catch (err) {
        console.error('Error removing user favorite:', err);
        return { error: err };
    }
};
