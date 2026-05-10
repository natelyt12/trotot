import { supabase } from '../lib/supabase.js';
import { mapSupabaseRoom } from '../utils/roomMapper.js';

/**
 * Fetches a single room by its listing_id from Supabase
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
