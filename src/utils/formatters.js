/**
 * Utility formatters for displaying room data
 * All format functions are pure - easy to test and maintain
 */

/**
 * Format price to Vietnamese format
 * @param {number} price
 * @returns {string} e.g. "3.500.000 đ/tháng"
 */
export const formatPrice = (price) => {
  if (!price && price !== 0) return 'Liên hệ';
  return new Intl.NumberFormat('vi-VN').format(price) + ' đ/tháng';
};

/**
 * Format price short form for cards
 * @param {number} price
 * @returns {string} e.g. "3,5 tr/tháng"
 */
export const formatPriceShort = (price) => {
  if (!price && price !== 0) return 'Liên hệ';
  if (price >= 1000000) {
    const millions = price / 1000000;
    return (
      new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(
        millions
      ) + ' tr/tháng'
    );
  }
  return new Intl.NumberFormat('vi-VN').format(price) + ' đ/tháng';
};

/**
 * Format area in sqm
 * @param {number} sqm
 * @returns {string} e.g. "25 m²"
 */
export const formatArea = (sqm) => {
  if (!sqm) return 'N/A';
  return `${sqm} m²`;
};

/**
 * Format date to Vietnamese locale
 * @param {string} dateString - ISO date string
 * @returns {string}
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Shorten address - keep only last 2 parts (district + city)
 * @param {string} address
 * @returns {string}
 */
export const formatAddressShort = (address) => {
  if (!address) return '';
  const parts = address.split(',').map((p) => p.trim());
  if (parts.length <= 2) return address;
  return parts.slice(-2).join(', ');
};

/**
 * Format electricity price
 * @param {object} electricity - { price, unit }
 * @returns {string}
 */
export const formatElectricity = (electricity) => {
  if (!electricity) return 'N/A';
  if (electricity.unit === 'included') return 'Bao gồm';
  return `${new Intl.NumberFormat('vi-VN').format(electricity.price)} đ/${electricity.unit}`;
};

/**
 * Format water price
 */
export const formatWater = (water) => {
  if (!water) return 'N/A';
  if (water.unit === 'included' || water.unit === 'free') return 'Bao gồm';
  if (water.price === 0) return 'Miễn phí';
  return `${new Intl.NumberFormat('vi-VN').format(water.price)} đ/${water.unit}`;
};

/**
 * Format deposit amount
 */
export const formatDeposit = (amount) => {
  if (!amount) return 'Không có';
  return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
};

/**
 * Truncate text
 */
export const truncate = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '...';
};
