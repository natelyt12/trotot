import { SURNAMES, MIDDLE_NAMES, MALE_NAMES, FEMALE_NAMES } from '../constants/names.js';

// Random helper
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomItem = (arr) => arr[randomInt(0, arr.length - 1)];

const generateVietnameseName = () => {
    const surname = randomItem(SURNAMES);
    const middle = randomItem(MIDDLE_NAMES);
    const isMale = Math.random() > 0.5;
    const givenName = isMale ? randomItem(MALE_NAMES) : randomItem(FEMALE_NAMES);
    return `${surname} ${middle} ${givenName}`;
};

// Danh sách các avatar nam/nữ chất lượng từ Unsplash để làm profile thật đẹp
const MALE_AVATARS = [
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop",
    "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&h=150&fit=crop",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop"
];

const FEMALE_AVATARS = [
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop"
];

/**
 * Tạo một profile dummy hoàn chỉnh
 * @param {string} role - 'landlord' hoặc 'tenant'
 * @returns {object}
 */
export const createDummyProfile = (role = 'landlord') => {
    const isMale = Math.random() > 0.5;
    const rawName = generateVietnameseName();
    
    // Thêm hậu tố 5 chữ số ngẫu nhiên để chống lặp hoàn toàn
    const randomSuffix = randomInt(10000, 99999);
    const fullName = `${rawName}_${randomSuffix}`;
    
    const id = crypto.randomUUID();
    const phone = `0999${randomInt(100000, 999999)}`; // Bắt đầu bằng 0999 để clear an toàn
    
    // Gán đuôi ?mock=true vào avatar_url
    const pool = isMale ? MALE_AVATARS : FEMALE_AVATARS;
    const avatarUrl = `${randomItem(pool)}?mock=true`;

    return {
        id,
        full_name: fullName,
        phone,
        role,
        avatar_url: avatarUrl,
        created_at: new Date(Date.now() - randomInt(1, 30) * 24 * 60 * 60 * 1000).toISOString(), // Đăng ký trong vòng 30 ngày qua
        updated_at: new Date().toISOString()
    };
};

/**
 * Sinh danh sách dummy profiles
 * @param {number} landlordCount - Số chủ trọ cần sinh
 * @param {number} tenantCount - Số người thuê trọ cần sinh
 * @returns {object[]}
 */
export const generateDummyProfiles = (landlordCount = 5, tenantCount = 5) => {
    const profiles = [];
    for (let i = 0; i < landlordCount; i++) {
        profiles.push(createDummyProfile('landlord'));
    }
    for (let i = 0; i < tenantCount; i++) {
        profiles.push(createDummyProfile('tenant'));
    }
    return profiles;
};
