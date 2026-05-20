import { supabase } from '../lib/supabase';

/**
 * Nén ảnh sử dụng HTML5 Canvas
 * @param {File} file - File ảnh gốc
 * @param {number} maxWidth - Chiều rộng tối đa
 * @param {number} quality - Chất lượng ảnh (0.1 - 1.0)
 * @returns {Promise<File>} - Promise trả về File ảnh đã nén
 */
export const compressImage = (file, maxWidth = 1280, quality = 0.7) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Giới hạn chiều rộng tối đa
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Xuất ra dạng Blob JPEG
                canvas.toBlob((blob) => {
                    resolve(new File([blob], file.name, { type: 'image/jpeg' }));
                }, 'image/jpeg', quality);
            };
        };
    });
};

/**
 * Tạo ảnh avatar đã cắt từ canvas
 * @param {HTMLImageElement} img - Phần tử ảnh gốc
 * @param {object} cropData - { x, y, scale, size }
 * @returns {Promise<Blob>}
 */
export const getCroppedAvatar = (img, cropData) => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const size = cropData.size || 200; // Kích thước avatar đầu ra
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Vẽ ảnh lên canvas với scale và offset
        // Tính toán vị trí vẽ dựa trên scale và pan
        const sourceSize = Math.min(img.width, img.height) / cropData.scale;
        const sourceX = (img.width - sourceSize) / 2 - cropData.x;
        const sourceY = (img.height - sourceSize) / 2 - cropData.y;

        ctx.drawImage(
            img,
            sourceX, sourceY, sourceSize, sourceSize, // Cắt từ ảnh gốc
            0, 0, size, size // Vẽ vào canvas mới
        );

        canvas.toBlob((blob) => {
            resolve(blob);
        }, 'image/jpeg', 0.8);
    });
};

/**
 * Cắt ảnh thành hình vuông ở chính giữa và nén lại
 * @param {File} file - File ảnh gốc
 * @param {number} size - Kích thước cạnh hình vuông (mặc định 400px)
 * @param {number} quality - Chất lượng ảnh (0.1 - 1.0)
 * @returns {Promise<File>} - Promise trả về File ảnh hình vuông đã nén
 */
export const cropImageToSquare = (file, size = 400, quality = 0.8) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext('2d');

                // Tính toán phần cắt ở chính giữa
                const originalSize = Math.min(img.width, img.height);
                const sourceX = (img.width - originalSize) / 2;
                const sourceY = (img.height - originalSize) / 2;

                ctx.drawImage(
                    img,
                    sourceX, sourceY, originalSize, originalSize, // Cắt hình vuông ở trung tâm
                    0, 0, size, size // Vẽ lên canvas hình vuông kích thước mong muốn
                );

                // Xuất ra dạng Blob JPEG
                canvas.toBlob((blob) => {
                    resolve(new File([blob], file.name, { type: 'image/jpeg' }));
                }, 'image/jpeg', quality);
            };
        };
    });
};


/**
 * Trích xuất public_id của Cloudinary từ URL tuyệt đối
 * @param {string} url - Đường dẫn tuyệt đối đến ảnh trên Cloudinary
 * @returns {string|null} - Trích xuất public_id hoặc null
 */
export const getCloudinaryPublicId = (url) => {
    if (!url || !url.includes("res.cloudinary.com")) return null;
    try {
        const parts = url.split("/image/upload/");
        if (parts.length < 2) return null;
        
        let path = parts[1];
        // Loại bỏ version number nếu có (ví dụ: v1680000000)
        const pathSegments = path.split("/");
        if (pathSegments[0].match(/^v\d+$/)) {
            pathSegments.shift();
        }
        
        // Kết hợp lại các phân đoạn còn lại (giữ nguyên folder)
        const publicIdWithExt = pathSegments.join("/");
        // Loại bỏ phần mở rộng (ví dụ: .jpg, .png)
        const lastDotIdx = publicIdWithExt.lastIndexOf(".");
        if (lastDotIdx !== -1) {
            return publicIdWithExt.substring(0, lastDotIdx);
        }
        return publicIdWithExt;
    } catch (e) {
        console.error("Lỗi phân tích URL Cloudinary:", e);
        return null;
    }
};

/**
 * Xóa ảnh trên Cloudinary an toàn thông qua Supabase Edge Function
 * @param {string} url - Đường dẫn tuyệt đối đến ảnh trên Cloudinary
 * @returns {Promise<boolean>} - Trả về true nếu xóa thành công
 */
export const deleteFromCloudinary = async (url) => {
    const publicId = getCloudinaryPublicId(url);
    if (!publicId) return false;

    try {
        const { data, error } = await supabase.functions.invoke('delete-cloudinary-image', {
            body: { publicId }
        });

        if (error) {
            console.error("Lỗi khi gọi Edge Function xóa ảnh:", error);
            try {
                const errBody = await error.context.json();
                console.error("Chi tiết phản hồi lỗi từ Edge Function:", errBody);
            } catch (e) {
                console.error("Không thể đọc chi tiết lỗi:", e);
            }
            return false;
        }

        return data?.success === true;
    } catch (error) {
        console.error("Lỗi khi xóa ảnh từ Cloudinary qua Edge Function:", error);
        return false;
    }
};
