import { 
    makeStudentHubScenario, 
    makeVipHostScenario, 
    makeModerationScenario, 
    makeCitiesExpansionScenario 
} from './generators/scenarioGenerator.js';

// Batch size for uploads
const BATCH_SIZE = 20;

/**
 * Xử lý dọn dẹp Mock Data an toàn
 * Chỉ xóa các phòng trọ bắt đầu bằng 'TT-MOCK-'
 * Chỉ xóa các profile có số điện thoại bắt đầu bằng '0999' hoặc avatar chứa '?mock=true'
 */
export const cleanMockData = async (supabase, onProgress) => {
    try {
        onProgress(0, 10, "🧹 Đang dọn dẹp các phòng trọ giả lập...");
        
        // 1. Xóa các phòng trọ giả
        const { error: roomErr } = await supabase
            .from('rooms')
            .delete()
            .ilike('listing_id', 'TT-MOCK-%');
            
        if (roomErr) throw roomErr;
        
        onProgress(1, 50, "👤 Đang dọn dẹp các tài khoản giả lập...");

        // 2. Xóa các profile giả
        const { error: profileErr } = await supabase
            .from('profiles')
            .delete()
            .or('phone.like.0999%,avatar_url.like.%?mock=true');

        if (profileErr) throw profileErr;

        onProgress(2, 100, "🎉 Dọn dẹp Mock Data thành công!");
        return { success: true };
    } catch (err) {
        console.error("Lỗi khi dọn dẹp Mock Data:", err);
        return { success: false, error: err.message };
    }
};

/**
 * Điều phối sinh và đẩy dữ liệu giả lập cho từng kịch bản
 */
export const runScenario = async (scenarioId, myUserId, supabase, onProgress) => {
    try {
        let scenarioData;
        let scenarioName = "";

        // 1. Khởi tạo kịch bản tương ứng
        onProgress(0, 5, "⚙️ Đang chuẩn bị kịch bản...");
        if (scenarioId === 1) {
            scenarioName = "Tâm điểm sinh viên";
            scenarioData = makeStudentHubScenario();
        } else if (scenarioId === 2) {
            scenarioName = "Chủ trọ VIP";
            scenarioData = makeVipHostScenario(myUserId);
        } else if (scenarioId === 3) {
            scenarioName = "Tin hot & Kiểm duyệt";
            scenarioData = makeModerationScenario();
        } else if (scenarioId === 4) {
            scenarioName = "Đô thị nở rộ";
            scenarioData = makeCitiesExpansionScenario();
        } else {
            throw new Error(`Kịch bản ${scenarioId} không tồn tại.`);
        }

        const { rooms } = scenarioData;

        // 2. Vì ràng buộc khoá ngoại (Foreign Key constraint "profiles_id_fkey" trỏ tới bảng users của hệ thống Supabase Auth),
        // chúng ta không thể tạo profile có ID ngẫu nhiên từ client-side mà không thực hiện đăng ký tài khoản auth.
        // Để tối ưu và tránh hoàn toàn lỗi xung đột mạng (409 Conflict) hoặc lỗi khoá ngoại (23503),
        // chúng ta sẽ bỏ qua bước đẩy profiles và gán trực tiếp toàn bộ phòng trọ giả lập cho tài khoản Admin của bạn (myUserId).
        if (rooms.length > 0 && myUserId) {
            rooms.forEach(room => {
                room.user_id = myUserId;
            });
        }

        // 3. Upload Mock Rooms sau
        if (rooms.length > 0) {
            onProgress(2, 35, `🏠 Đang chuẩn bị dữ liệu ${rooms.length} phòng trọ...`);
            
            // Map cấu trúc DB chuẩn bị upload (giống upload_to_supabase.js)
            const formattedRooms = rooms.map(room => ({
                id: room.id,
                listing_id: room.listing_id,
                user_id: room.user_id,
                slug: room.slug,
                title: room.title,
                room_type: room.room_type,
                price_monthly: room.price_monthly,
                area_sqm: room.area_sqm,
                city: room.city,
                district: room.district,
                ward: room.ward,
                address: room.address,
                available_until: room.available_until,
                is_verified: room.is_verified,
                status: room.status,
                total_views: room.total_views,
                total_favorites: room.total_favorites,
                created_at: room.created_at,
                updated_at: room.updated_at,
                
                // Nest objects as JSONB in rooms table
                monthly_costs: room.monthly_costs,
                room_features: room.room_features,
                rules_utilities: room.rules_utilities,
                media_contact: room.media_contact
            }));

            // Chia lô upload rooms
            for (let i = 0; i < formattedRooms.length; i += BATCH_SIZE) {
                const batch = formattedRooms.slice(i, i + BATCH_SIZE);
                const percent = Math.round(40 + (i / formattedRooms.length) * 55);
                onProgress(2, percent, `🚀 Đang tải lên phòng trọ (${i + batch.length}/${formattedRooms.length})...`);
                
                const { error } = await supabase
                    .from('rooms')
                    .upsert(batch, { onConflict: 'listing_id' });
                if (error) throw error;
            }
        }

        onProgress(3, 100, `🎉 Kịch bản "${scenarioName}" đã thiết lập thành công!`);
        return { success: true };
    } catch (err) {
        console.error("Lỗi khi chạy kịch bản:", err);
        return { success: false, error: err.message };
    }
};
