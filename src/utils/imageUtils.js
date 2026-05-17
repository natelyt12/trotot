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
