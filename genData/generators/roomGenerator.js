import { ROOM_NOUNS, ROOM_ADJECTIVES, ROOM_LOCATIONS, STREET_NAMES, ROOM_DESCRIPTIONS } from '../constants/names.js';
import videoLinks from '../../src/mockData/videoLinks.json' assert { type: "json" };

// Predefined counts of images per template room index (p1 to p30) in mockData/image
const ROOM_IMAGE_COUNTS = {
    1: 3, 2: 3, 3: 3, 4: 3, 5: 3, 6: 3, 7: 2, 8: 5, 9: 5, 10: 4,
    11: 4, 12: 5, 13: 3, 14: 4, 15: 4, 16: 4, 17: 3, 18: 4, 19: 5, 20: 4,
    21: 3, 22: 4, 23: 3, 24: 3, 25: 3, 26: 4, 27: 4, 28: 4, 29: 3, 30: 3
};

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomItem = (arr) => arr[randomInt(0, arr.length - 1)];
const randomItems = (arr, min, max) => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, randomInt(min, max));
};

const convertToSlug = (text) => {
    let slug = text.toLowerCase();
    slug = slug.replace(/[áàảãạăắằẳẵặâấầẩẫậ]/g, 'a');
    slug = slug.replace(/[éèẻẽẹêếềểễệ]/g, 'e');
    slug = slug.replace(/[íìỉĩị]/g, 'i');
    slug = slug.replace(/[óòỏõọôốồổỗộơớờởỡợ]/g, 'o');
    slug = slug.replace(/[úùủũụưứừửữự]/g, 'u');
    slug = slug.replace(/[ýỳỷỹỵ]/g, 'y');
    slug = slug.replace(/đ/g, 'd');
    slug = slug.replace(/[^a-z0-9 -]/g, '');
    slug = slug.replace(/\s+/g, '-');
    slug = slug.replace(/-+/g, '-');
    slug = slug.replace(/^-+|-+$/g, '');
    return slug;
};

const AMENITIES_LIST = ["air_conditioner", "fridge", "wardrobe", "washing_machine", "wifi", "elevator", "balcony", "kitchen", "bed"];
const ROOM_TYPES = ["room", "mini_apartment", "apartment", "whole_house"];
const BATHROOM_TYPES = ["private", "shared"];
const KITCHEN_TYPES = ["private", "shared", "none"];
const GENDER_PREFS = ["all", "male", "female"];

/**
 * Sinh tiêu đề phòng trọ cực chất có độ dài tối đa 40 ký tự
 */
const generateTitle = () => {
    let title = "";
    // Cố gắng thử ghép cho đến khi được tiêu đề hợp lệ dưới 40 ký tự
    for (let attempts = 0; attempts < 15; attempts++) {
        const noun = randomItem(ROOM_NOUNS);
        const adj = randomItem(ROOM_ADJECTIVES);
        const loc = randomItem(ROOM_LOCATIONS);
        const candidate = `${noun} ${adj} ${loc}`;
        if (candidate.length <= 40) {
            title = candidate;
            break;
        }
    }
    if (!title) {
        // Fallback siêu ngắn
        title = `${randomItem(ROOM_NOUNS)} ${randomItem(ROOM_ADJECTIVES)}`;
    }
    return title.slice(0, 40);
};

/**
 * Sinh thông tin chi tiết một phòng trọ mock
 */
export const createMockRoom = (userId, city, district, ward) => {
    const title = generateTitle();
    const listingIdNum = randomInt(100000, 999999);
    const listing_id = `TT-MOCK-${listingIdNum}`; // Phân biệt an toàn
    const slug = `${convertToSlug(title)}-tt-mock-${listingIdNum}`;

    const roomType = randomItem(ROOM_TYPES);
    const price = randomInt(18, 75) * 100000; // 1.8M -> 7.5M
    const area = randomInt(15, 45);
    const bedrooms = roomType === 'apartment' ? randomInt(1, 3) : 1;
    const beds = bedrooms * randomInt(1, 2);
    const capacity = beds * randomInt(1, 2);

    // Gán 109 local images
    const templateIndex = randomInt(1, 30);
    const imageCount = ROOM_IMAGE_COUNTS[templateIndex] || 3;
    const images = [];
    for (let i = 1; i <= imageCount; i++) {
        images.push({
            url: `/mockData/image/p${templateIndex} (${i})_output.webp`,
            is_cover: i === 1
        });
    }

    // Google Maps Embed (pb link nhúng mới của Đông Á từ gmaps.txt)
    const google_map_url = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6971.155765237386!2d105.78309352714645!3d21.035878013589926!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135096b31fa7abb%3A0xff645782804911af!2zVHLGsOG7nW5nIMSR4bqhaSBo4buNYyBDw7RuZyBuZ2jhu4cgxJDDtG5nIMOB!5e1!3m2!1svi!2s!4v1779692279775!5m2!1svi!2s";

    // Video Tour từ TikTok
    const videoUrl = randomItem(videoLinks);

    const streetName = randomItem(STREET_NAMES);
    const address = `Số ${randomInt(1, 150)}, ngõ ${randomInt(1, 99)} đường ${streetName}`;

    // Khởi tạo ngày đăng lùi lại ngẫu nhiên trong vòng 15 ngày qua
    const createdAtDate = new Date(Date.now() - randomInt(1, 15) * 24 * 60 * 60 * 1000);
    const availableUntil = new Date(createdAtDate.getTime());
    availableUntil.setDate(availableUntil.getDate() + 90); // 90 ngày (Luôn ở tương lai)

    return {
        id: crypto.randomUUID(),
        listing_id,
        user_id: userId,
        slug,
        title,
        room_type: roomType,
        price_monthly: price,
        area_sqm: area,
        city,
        district,
        ward,
        address,
        available_until: availableUntil.toISOString(),
        is_verified: Math.random() > 0.4, // 60% tin trọ được duyệt sẵn (random)
        status: "available", // Luôn ở công khai
        total_views: randomInt(45, 1200),
        total_favorites: randomInt(2, 85),
        created_at: createdAtDate.toISOString(),
        updated_at: new Date().toISOString(),
        
        monthly_costs: {
            deposit_amount: price * randomItem([1, 2]),
            electricity: { price: randomItem([3500, 3800, 4000]), unit: "kWh" },
            water: { price: randomItem([30000, 100000]), unit: randomItem(["m3", "người"]) },
            internet: randomItem([0, 100000]),
            parking_fee: randomItem([0, 50000, 100000]),
            extra_services: [
                { name: "Phí quản lý & Vệ sinh", price: randomInt(3, 8) * 10000, unit: "phòng" }
            ]
        },
        room_features: {
            counts: {
                bedrooms,
                bathrooms: randomInt(1, 2),
                beds,
                capacity
            },
            bathroom_type: randomItem(BATHROOM_TYPES),
            kitchen_type: randomItem(KITCHEN_TYPES),
            amenities: randomItems(AMENITIES_LIST, 3, AMENITIES_LIST.length),
        },
        rules_utilities: {
            is_shared_with_host: Math.random() > 0.85,
            curfew: randomItem(["none", "11pm", "11:30pm", "12am"]),
            gender_preference: randomItem(GENDER_PREFS),
            is_pet_allowed: Math.random() > 0.55,
            laundry_type: randomItem(["private", "shared", "none"]),
            is_mock: true // Khóa an toàn nhận diện phòng giả
        },
        media_contact: {
            images,
            video_urls: videoUrl ? [videoUrl] : [],
            description: randomItem(ROOM_DESCRIPTIONS),
            google_map_url
        }
    };
};
