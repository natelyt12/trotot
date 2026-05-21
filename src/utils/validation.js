/**
 * validation.js
 * Tiện ích dùng chung để kiểm tra tính hợp lệ của thông tin phòng trọ trước khi Đăng/Sửa hoặc Công khai tin đăng.
 */

export const validateRoomData = (room, options = {}) => {
    const errors = [];

    // 1. Tiêu đề tin đăng
    if (!room.title || !room.title.trim()) {
        errors.push("Thiếu tiêu đề tin đăng");
    }

    // 2. Giá thuê hàng tháng (từ 100.000đ trở lên)
    const price = typeof room.price_monthly === 'string' ? parseFloat(room.price_monthly) : room.price_monthly;
    if (!price || price < 100000) {
        errors.push("Giá thuê phải từ 100.000đ trở lên");
    }

    // 3. Diện tích (phải lớn hơn 0)
    const area = typeof room.area_sqm === 'string' ? parseFloat(room.area_sqm) : room.area_sqm;
    if (!area || area <= 0) {
        errors.push("Thiếu diện tích phòng");
    }

    // 4. Địa chỉ đầy đủ (bắt buộc chọn Tỉnh, Huyện, Xã và nhập số nhà/tên đường)
    if (!room.address || !room.address.trim() || !room.city || !room.district || !room.ward) {
        errors.push("Thiếu địa chỉ đầy đủ (Tỉnh, Huyện, Xã, Số nhà)");
    }

    // 5. Tiền đặt cọc (từ 500.000đ trở lên)
    const deposit = typeof room.monthly_costs?.deposit_amount === 'string'
        ? parseFloat(room.monthly_costs.deposit_amount)
        : room.monthly_costs?.deposit_amount;
    if (!deposit || deposit < 500000) {
        errors.push("Tiền cọc phải từ 500.000đ trở lên");
    }

    // 6. Hình ảnh thực tế (tối thiểu 1 ảnh)
    const imagesCount = options.imagesCount !== undefined
        ? options.imagesCount
        : (room.media_contact?.images?.length || 0);
    if (imagesCount === 0) {
        errors.push("Chưa tải lên hình ảnh thực tế nào");
    }

    // 7. Mô tả chi tiết (tối thiểu 20 ký tự)
    if (!room.media_contact?.description || room.media_contact.description.trim().length < 20) {
        errors.push("Mô tả chi tiết quá ngắn (tối thiểu 20 ký tự)");
    }

    // 8. Liên kết video YouTube/TikTok (chỉ bắt buộc khi đã bấm thêm ô link)
    const videoUrls = room.media_contact?.video_urls || [];
    if (videoUrls.length > 0) {
        const hasEmptyUrl = videoUrls.some(url => !url || !url.trim());
        if (hasEmptyUrl) {
            errors.push("Bạn có ô liên kết video chưa điền");
        } else {
            const hasInvalidUrl = videoUrls.some(url => {
                const lower = url.toLowerCase().trim();
                return !(lower.includes("youtube.com") || lower.includes("youtu.be") || lower.includes("tiktok.com"));
            });
            if (hasInvalidUrl) {
                errors.push("Liên kết video phải là link YouTube hoặc TikTok hợp lệ");
            }
        }
    }

    return errors;
};
