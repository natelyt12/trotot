import { createMockRoom } from "./roomGenerator.js";

// Random helper
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomItem = (arr) => arr[randomInt(0, arr.length - 1)];

const locations = [
    { city: "Thành phố Hà Nội", district: "Quận Cầu Giấy", ward: "Phường Dịch Vọng Hậu" },
    { city: "Thành phố Hà Nội", district: "Quận Đống Đa", ward: "Phường Láng Hạ" },
    { city: "Thành phố Hà Nội", district: "Quận Hai Bà Trưng", ward: "Phường Bách Khoa" },
    { city: "Thành phố Hồ Chí Minh", district: "Quận 10", ward: "Phường 14" },
    { city: "Thành phố Hồ Chí Minh", district: "Quận Bình Thạnh", ward: "Phường 25" },
];

/**
 * KỊCH BẢN 1: Kiểm duyệt & Quy mô lớn (Large Scale Moderation & Lifecycle)
 * Sinh 80 phòng trọ ở mọi giai đoạn vòng đời tin đăng
 */
export const makeLargeScaleModerationScenario = (myUserId) => {
    const rooms = [];

    // 20 tin Chờ admin Duyệt (pending)
    for (let i = 0; i < 20; i++) {
        const loc = randomItem(locations);
        const room = createMockRoom(myUserId, loc.city, loc.district, loc.ward);
        room.status = "pending";
        room.is_verified = false;
        room.title = `[DUYỆT ĐĂNG] Phòng trọ dịch vụ khép kín tại ${loc.ward}`;
        rooms.push(room);
    }

    // 20 tin Công khai nhưng chưa xác thực (available, unverified)
    for (let i = 0; i < 20; i++) {
        const loc = randomItem(locations);
        const room = createMockRoom(myUserId, loc.city, loc.district, loc.ward);
        room.status = "available";
        room.is_verified = false;
        room.title = `Phòng tiện nghi giá tốt ở ${loc.district}`;
        rooms.push(room);
    }

    // 20 tin Công khai và đã xác thực (available, verified)
    for (let i = 0; i < 20; i++) {
        const loc = randomItem(locations);
        const room = createMockRoom(myUserId, loc.city, loc.district, loc.ward);
        room.status = "available";
        room.is_verified = true;
        room.title = `Phòng trọ chính chủ tích xanh gần ${loc.ward}`;
        rooms.push(room);
    }

    // 10 tin Bản nháp (draft)
    for (let i = 0; i < 10; i++) {
        const loc = randomItem(locations);
        const room = createMockRoom(myUserId, loc.city, loc.district, loc.ward);
        room.status = "draft";
        room.is_verified = false;
        room.title = `[BẢN NHÁP] Tin trọ nháp đang được biên tập ở ${loc.district}`;
        rooms.push(room);
    }

    // 10 tin Đã hết hạn (expired)
    for (let i = 0; i < 10; i++) {
        const loc = randomItem(locations);
        const room = createMockRoom(myUserId, loc.city, loc.district, loc.ward);
        room.status = "expired";
        room.is_verified = false;
        room.title = `[HẾT HẠN] Phòng trọ cũ đã quá hạn hiển thị ở ${loc.district}`;
        rooms.push(room);
    }

    return { hosts: [], rooms };
};

/**
 * KỊCH BẢN 2: Tâm điểm trường Đại học (University Student Hub)
 * Sinh 40 phòng trọ tập trung 100% tại các khu vực trường Đại học lớn
 */
export const makeUniversityStudentHubScenario = (myUserId) => {
    const rooms = [];
    const universities = [
        { name: "Đại học Bách Khoa HN", city: "Thành phố Hà Nội", district: "Quận Hai Bà Trưng", ward: "Phường Bách Khoa" },
        { name: "Đại học Ngoại Thương", city: "Thành phố Hà Nội", district: "Quận Đống Đa", ward: "Phường Láng Thượng" },
        { name: "Đại học Quốc Gia HN", city: "Thành phố Hà Nội", district: "Quận Cầu Giấy", ward: "Phường Dịch Vọng Hậu" },
        { name: "Đại học HUTECH", city: "Thành phố Hồ Chí Minh", district: "Quận Bình Thạnh", ward: "Phường 25" },
        { name: "Đại học Quốc Gia HCM", city: "Thành phố Hồ Chí Minh", district: "Thành phố Thủ Đức", ward: "Phường Linh Trung" },
    ];

    const studentDescriptors = [
        "Phòng trọ sinh viên giá rẻ sát cổng trường",
        "Chung cư mini khép kín sạch sẽ đi bộ ra",
        "Phòng trọ ở ghép đầy đủ đồ cho sinh viên",
        "Studio hiện đại an ninh tốt phù hợp học nhóm gần",
        "Nhà trọ có gác lửng giá sinh viên gần",
    ];

    for (let i = 0; i < 40; i++) {
        const uni = universities[i % universities.length];
        const desc = studentDescriptors[i % studentDescriptors.length];
        const room = createMockRoom(myUserId, uni.city, uni.district, uni.ward);

        room.title = `${desc} ${uni.name}`;
        room.status = "available";
        room.is_verified = Math.random() > 0.4;
        room.price_monthly = randomInt(15, 30) * 100000; // 1.5M - 3.0M (Giá sinh viên)
        room.room_features.counts.capacity = randomInt(1, 3);
        rooms.push(room);
    }

    return { hosts: [], rooms };
};

/**
 * KỊCH BẢN 3: 100 phòng trọ tiêu chuẩn ngẫu nhiên (100 Standard Mock Rooms)
 * Sinh 100 phòng trọ tiêu chuẩn ngẫu nhiên phân bố đều
 */
export const makeOneHundredStandardRoomsScenario = (myUserId) => {
    const rooms = [];

    for (let i = 0; i < 100; i++) {
        const loc = randomItem(locations);
        const room = createMockRoom(myUserId, loc.city, loc.district, loc.ward);

        room.status = "available";
        // 60% verified
        room.is_verified = i % 10 < 6;
        rooms.push(room);
    }

    return { hosts: [], rooms };
};

/**
 * KỊCH BẢN 4: Thiên đường Tiện ích & Ẩm thực (Premium Lifestyle & Location Hotspots)
 * SÁNG TẠO: Sinh 30 phòng trọ VIP nằm cạnh các tụ điểm ăn uống, vui chơi sầm uất
 */
export const makePremiumFoodAndLifestyleScenario = (myUserId) => {
    const rooms = [];
    const hotspotZones = [
        { name: "Phố cổ & Phố đi bộ", city: "Thành phố Hà Nội", district: "Quận Hoàn Kiếm", ward: "Phường Hàng Đào" },
        { name: "Hồ Tây thơ mộng", city: "Thành phố Hà Nội", district: "Quận Tây Hồ", ward: "Phường Quảng An" },
        { name: "Phố đi bộ Bùi Viện", city: "Thành phố Hồ Chí Minh", district: "Quận 1", ward: "Phường Phạm Ngũ Lão" },
        { name: "Khu biệt thự Thảo Điền", city: "Thành phố Hồ Chí Minh", district: "Thành phố Thủ Đức", ward: "Phường Thảo Điền" },
    ];

    const premiumAmenities = [
        "hồ bơi vô cực & BBQ",
        "ban công view ngắm pháo hoa",
        "sân thượng chill phố đi bộ",
        "bồn tắm nằm cực sang chảnh",
        "phòng gym free & Smart-lock",
    ];

    for (let i = 0; i < 30; i++) {
        const zone = hotspotZones[i % hotspotZones.length];
        const amenity = premiumAmenities[i % premiumAmenities.length];
        const room = createMockRoom(myUserId, zone.city, zone.district, zone.ward);

        room.title = `⭐ Studio VIP sát ${zone.name} có ${amenity}`;
        room.status = "available";
        room.is_verified = true; // Premium 100% verified
        room.price_monthly = randomInt(70, 150) * 100000; // 7M - 15M (VIP)
        room.rules_utilities.curfew = "none"; // Giờ giấc tự do 24/7
        room.rules_utilities.is_pet_allowed = true; // Cho phép nuôi pet
        room.room_features.counts.capacity = randomInt(2, 4);
        room.total_views = randomInt(1500, 4800);
        room.total_favorites = randomInt(120, 450);

        rooms.push(room);
    }

    return { hosts: [], rooms };
};
