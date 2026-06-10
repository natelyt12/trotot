import { supabase } from '../lib/supabase';

export const createBooking = async (roomId, requesterId, bookingTime) => {
    try {
        const { data, error } = await supabase
            .from('room_bookings')
            .insert([{
                room_id: roomId,
                requester_id: requesterId,
                booking_time: bookingTime,
                status: 'pending'
            }])
            .select()
            .single();

        return { data, error };
    } catch (err) {
        return { data: null, error: err };
    }
};

export const getBookingsForLandlord = async (landlordId) => {
    try {
        // Find all bookings where the room belongs to the landlord
        const { data: bookings, error } = await supabase
            .from('room_bookings')
            .select(`
                *,
                rooms!inner(id, title, user_id)
            `)
            .eq('rooms.user_id', landlordId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        if (!bookings || bookings.length === 0) {
            return { data: [], error: null };
        }

        const requesterIds = [...new Set(bookings.map(b => b.requester_id).filter(Boolean))];
        if (requesterIds.length > 0) {
            const { data: profiles, error: profileError } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url, phone')
                .in('id', requesterIds);

            if (profileError) {
                console.error("Error fetching profiles for bookings:", profileError);
            } else {
                const mappedBookings = bookings.map(b => ({
                    ...b,
                    requester: profiles?.find(p => p.id === b.requester_id) || null
                }));
                return { data: mappedBookings, error: null };
            }
        }

        const bookingsWithNullRequester = bookings.map(b => ({ ...b, requester: null }));
        return { data: bookingsWithNullRequester, error: null };
    } catch (err) {
        console.error("Error in getBookingsForLandlord:", err);
        return { data: [], error: err };
    }
};

export const getBookingsForUser = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('room_bookings')
            .select(`
                *,
                rooms(id, title)
            `)
            .eq('requester_id', userId)
            .order('created_at', { ascending: false });

        return { data: data || [], error };
    } catch (err) {
        return { data: [], error: err };
    }
};

export const updateBookingStatus = async (bookingId, status) => {
    try {
        const { error } = await supabase
            .from('room_bookings')
            .update({ status })
            .eq('id', bookingId);

        return { error };
    } catch (err) {
        return { error: err };
    }
};

export const approveRoomBookingRPC = async (bookingId, roomId, newTenantId) => {
    try {
        const { data, error } = await supabase.rpc('approve_room_booking', {
            p_booking_id: bookingId,
            p_room_id: roomId,
            p_new_tenant_id: newTenantId
        });
        
        return { data, error };
    } catch (err) {
        return { data: null, error: err };
    }
};

export const checkUserActiveBooking = async (roomId, userId) => {
    try {
        const { data, error } = await supabase
            .from('room_bookings')
            .select('id, status')
            .eq('room_id', roomId)
            .eq('requester_id', userId)
            .in('status', ['pending', 'approved'])
            .maybeSingle();

        return { data, error };
    } catch (err) {
        return { data: null, error: err };
    }
};
