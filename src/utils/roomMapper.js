/**
 * Centralized utility to map Supabase room records to the UI-expected object structure.
 * This ensures consistency across the application when fetching room data.
 */
export const mapSupabaseRoom = (room) => {
    if (!room) return null;

    // Handle profile data (Supabase join result)
    const profile = Array.isArray(room.profiles) ? room.profiles[0] : room.profiles;
    
    // Construct owner contact info from profile data (Supabase join result)
    const ownerContact = {
        name: profile?.full_name || 'Chủ nhà',
        phone: profile?.phone || 'Chưa cập nhật',
        role: profile?.role || 'landlord',
        avatar: profile?.avatar_url || ''
    };

    return {
        ...room,
        basic_info: {
            title: room.title,
            room_type: room.room_type,
            price_monthly: room.price_monthly,
            area_sqm: room.area_sqm,
            city: room.city,
            district: room.district,
            ward: room.ward,
            address: room.address
        },
        media_contact: {
            ...room.media_contact,
            video_urls: Array.isArray(room.media_contact?.video_urls) 
                ? room.media_contact.video_urls 
                : (room.media_contact?.video_url ? [room.media_contact.video_url] : []),
            contact: ownerContact
        },
        metadata: {
            is_verified: room.is_verified,
            status: room.status,
            total_views: room.total_views,
            total_favorites: room.total_favorites,
            created_at: room.created_at,
            updated_at: room.updated_at
        }
    };
};
