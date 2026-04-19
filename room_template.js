export const SAMPLE_ROOM = {
    // ID duy nhất của database (Dùng UUID từ Supabase)
    id: "a1b2c3d4-e5f6-G7h8-i9j0-k1l2m3n4o5p6", 
    
    // ID hiển thị cho người dùng (Dễ nhớ, dùng để tra cứu nhanh)
    listing_id: "TT-704908", 

    // Liên kết với chủ sở hữu (auth.users id trong Supabase)
    user_id: "USER_OWNER_UUID", 

    // Đường dẫn chuẩn SEO (Tạo ra từ tiêu đề + listing_id)
    slug: "phong-tro-ban-cong-gan-dh-bach-khoa-tt704908", 

    basic_info: {
        title: "Phòng trọ ban công, gần ĐH Bách Khoa",
        price_monthly: 3500000,
        currency: "VND",
        area_sqm: 25,
        address: "Số 10, ngõ 123, đường Giải Phóng, phường Phương Mai, quận Đống Đa, Hà Nội",
        city: "Hà Nội",
        district: "Đống Đa",
        ward: "Phương Mai",
    },

    monthly_costs: {
        deposit_amount: 3500000,
        electricity: { price: 3800, unit: "kWh" },
        water: { price: 100000, unit: "người" },
        internet: 100000,
        extra_services: [
            { name: "Phí quản lý", price: 50000 },
            { name: "Rác", price: 30000 },
            { name: "Vệ sinh", price: 20000 },
        ],
    },

    room_features: {
        bathroom_type: "private", // private | shared
        amenities: [
            "bed", 
            "air_conditioner", 
            "fridge", 
            "wardrobe", 
            "kitchen", 
            "washing_machine",
            "wifi",
            "elevator"
        ],
        parking: { 
            has_parking: true, 
            type: "indoor", // basement | indoor | outdoor
            fee: 0 
        },
    },

    rules_utilities: {
        is_shared_with_host: false,
        curfew: "none", // hh:mm | none
        max_occupants: 2,
        is_pet_allowed: true,
        laundry_type: "private", // private | shared | none
    },

    media_contact: {
        images: [
            "https://picsum.photos/seed/room1/600/400", 
            "https://picsum.photos/seed/room1b/600/400"
        ],
        videos: [],
        description: "Phòng mới xây, thoáng mát, ban công rộng phơi đồ thoải mái. Khu vực an ninh, gần các trường đại học lớn.",
        contact: { 
            name: "Nguyễn Văn A", 
            phone: "0901234567", 
            role: "landlord" // landlord | manager | roommate
        },
    },

    metadata: { 
        created_at: "2024-05-20T10:00:00Z", // Thời gian đăng tin gốc
        updated_at: "2024-05-22T08:30:00Z", // Thời gian cập nhật gần nhất
        is_verified: true, 
        status: "available", // available | rented | hidden
        total_views: 124 
    },
};
