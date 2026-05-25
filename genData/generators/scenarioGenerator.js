import { generateDummyProfiles } from './userGenerator.js';
import { createMockRoom } from './roomGenerator.js';

// Random helper
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomItem = (arr) => arr[randomInt(0, arr.length - 1)];

/**
 * KỊCH BẢN 1: Tâm điểm sinh viên (Student Hub Focus)
 * Sinh 5 chủ nhà mới + 40 phòng trọ xung quanh các trường ĐH lớn
 */
export const makeStudentHubScenario = () => {
    const hosts = generateDummyProfiles(5, 0); // 5 chủ nhà mới
    const rooms = [];

    // Danh sách Phường/Quận có các trường ĐH lớn trong universities.js để hiển thị tag "Gần ĐH X"
    const studentDistricts = [
        { city: "Thành phố Hà Nội", district: "Quận Hai Bà Trưng", ward: "Phường Bách Khoa" },
        { city: "Thành phố Hà Nội", district: "Quận Đống Đa", ward: "Phường Láng Thượng" },
        { city: "Thành phố Hà Nội", district: "Quận Cầu Giấy", ward: "Phường Dịch Vọng Hậu" },
        { city: "Thành phố Hồ Chí Minh", district: "Quận 10", ward: "Phường 14" },
        { city: "Thành phố Hồ Chí Minh", district: "Quận Bình Thạnh", ward: "Phường 25" }
    ];

    for (let i = 0; i < 40; i++) {
        const host = randomItem(hosts);
        const loc = randomItem(studentDistricts);
        const room = createMockRoom(host.id, loc.city, loc.district, loc.ward);
        
        // Luôn để tin ở trạng thái Còn phòng để test tìm kiếm
        room.status = 'available';
        rooms.push(room);
    }

    return { hosts, rooms };
};

/**
 * KỊCH BẢN 2: Chủ trọ VIP (VIP Landlord Dashboard)
 * Sinh 20 phòng trọ gán cho CHÍNH user đang đăng nhập
 * Phân bổ đủ mọi trạng thái: available, expired, draft để test dashboard của landlord
 */
export const makeVipHostScenario = (myUserId) => {
    if (!myUserId) {
        throw new Error("Thiếu myUserId trong kịch bản VIP Host!");
    }
    const rooms = [];

    const locations = [
        { city: "Thành phố Hà Nội", district: "Quận Cầu Giấy", ward: "Phường Dịch Vọng" },
        { city: "Thành phố Hà Nội", district: "Quận Đống Đa", ward: "Phường Láng Hạ" },
        { city: "Thành phố Hà Nội", district: "Quận Hai Bà Trưng", ward: "Phường Đồng Tâm" }
    ];

    // Tạo 10 tin available (5 verified, 5 unverified)
    for (let i = 0; i < 10; i++) {
        const loc = randomItem(locations);
        const room = createMockRoom(myUserId, loc.city, loc.district, loc.ward);
        room.status = 'available';
        room.is_verified = i < 5;
        rooms.push(room);
    }

    // Tạo 5 tin expired (Hết hạn)
    for (let i = 0; i < 5; i++) {
        const loc = randomItem(locations);
        const room = createMockRoom(myUserId, loc.city, loc.district, loc.ward);
        room.status = 'expired';
        rooms.push(room);
    }

    // Tạo 5 tin draft (Bản nháp)
    for (let i = 0; i < 5; i++) {
        const loc = randomItem(locations);
        const room = createMockRoom(myUserId, loc.city, loc.district, loc.ward);
        room.status = 'draft';
        room.is_verified = false;
        rooms.push(room);
    }

    return { hosts: [], rooms }; // Không sinh host mới vì gán cho user hiện tại
};

/**
 * KỊCH BẢN 3: Tin hot & Kiểm duyệt (Hot Listings & Moderation)
 * Sinh 5 chủ nhà mới + 40 phòng trọ VIP và phòng trọ chờ duyệt để test Admin Page
 */
export const makeModerationScenario = () => {
    const hosts = generateDummyProfiles(5, 0);
    const rooms = [];

    const locations = [
        { city: "Thành phố Hà Nội", district: "Quận Cầu Giấy", ward: "Phường Dịch Vọng Hậu" },
        { city: "Thành phố Hà Nội", district: "Quận Đống Đa", ward: "Phường Láng Thượng" },
        { city: "Thành phố Hồ Chí Minh", district: "Quận 10", ward: "Phường 14" }
    ];

    for (let i = 0; i < 40; i++) {
        const host = randomItem(hosts);
        const loc = randomItem(locations);
        const room = createMockRoom(host.id, loc.city, loc.district, loc.ward);

        // 50% tin cực hot (Nhiều view + Đã duyệt), 50% tin chờ duyệt (is_verified = false, status = available)
        if (i < 20) {
            room.is_verified = true;
            room.status = 'available';
            room.total_views = randomInt(800, 2500);
            room.total_favorites = randomInt(40, 150);
        } else {
            room.is_verified = false;
            room.status = 'available';
            room.total_views = randomInt(1, 15);
            room.total_favorites = 0;
        }
        rooms.push(room);
    }

    return { hosts, rooms };
};

/**
 * KỊCH BẢN 4: Đô thị nở rộ (Hanoi & Saigon Cities Expansion)
 * Sinh 10 chủ nhà mới + 100 phòng trọ phân bố rộng rãi khắp HN & SG để test bản đồ/phân trang
 */
export const makeCitiesExpansionScenario = () => {
    const hosts = generateDummyProfiles(10, 0);
    const rooms = [];

    const locPool = [
        { city: "Thành phố Hà Nội", district: "Quận Cầu Giấy", ward: "Phường Dịch Vọng Hậu" },
        { city: "Thành phố Hà Nội", district: "Quận Đống Đa", ward: "Phường Láng Hạ" },
        { city: "Thành phố Hà Nội", district: "Quận Hai Bà Trưng", ward: "Phường Bách Khoa" },
        { city: "Thành phố Hà Nội", district: "Quận Thanh Xuân", ward: "Phường Nhân Chính" },
        { city: "Thành phố Hà Nội", district: "Quận Hà Đông", ward: "Phường Mộ Lao" },
        
        { city: "Thành phố Hồ Chí Minh", district: "Quận 10", ward: "Phường 14" },
        { city: "Thành phố Hồ Chí Minh", district: "Quận 5", ward: "Phường 4" },
        { city: "Thành phố Hồ Chí Minh", district: "Quận Gò Vấp", ward: "Phường 4" },
        { city: "Thành phố Hồ Chí Minh", district: "Thành phố Thủ Đức", ward: "Phường Linh Chiểu" },
        { city: "Thành phố Hồ Chí Minh", district: "Quận Bình Thạnh", ward: "Phường 25" }
    ];

    for (let i = 0; i < 100; i++) {
        const host = randomItem(hosts);
        const loc = randomItem(locPool);
        const room = createMockRoom(host.id, loc.city, loc.district, loc.ward);
        rooms.push(room);
    }

    return { hosts, rooms };
};
