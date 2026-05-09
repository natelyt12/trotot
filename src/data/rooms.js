import { supabase } from '../lib/supabase.js';

/**
 * Fetches a single room by its listing_id from Supabase
 */
export const getRoomById = async (id) => {
    try {
        const { data, error } = await supabase
            .from('rooms')
            .select('*')
            .eq('listing_id', id)
            .single();

        if (error) throw error;
        if (!data) return null;

        // Reconstruct nested structure
        return {
            ...data,
            basic_info: {
                title: data.title,
                room_type: data.room_type,
                price_monthly: data.price_monthly,
                area_sqm: data.area_sqm,
                city: data.city,
                district: data.district,
                ward: data.ward,
                address: data.address
            },
            metadata: {
                is_verified: data.is_verified,
                status: data.status,
                total_views: data.total_views,
                total_favorites: data.total_favorites,
                created_at: data.created_at,
                updated_at: data.updated_at
            }
        };
    } catch (err) {
        console.error('Error fetching room detail:', err);
        return null;
    }
};

// Fallback mock data for local testing if needed
import { MOCK_ROOM } from './mock_room_data.js';
export { MOCK_ROOM };
