// Constants derived from db.js schema
// Mirrors the AMENITIES and USER objects from db.js

export const AMENITIES = {
  bed: { label: 'Giường', icon: 'bed' },
  air_conditioner: { label: 'Điều hòa', icon: 'thermometer' },
  fridge: { label: 'Tủ lạnh', icon: 'package' },
  wardrobe: { label: 'Tủ quần áo', icon: 'archive' },
  kitchen: { label: 'Thiết bị bếp', icon: 'flame' },
  washing_machine: { label: 'Máy giặt', icon: 'rotate-ccw' },
};

export const BATHROOM_TYPES = {
  private: 'Riêng tư',
  shared: 'Chung',
};

export const LAUNDRY_TYPES = {
  private: 'Máy giặt riêng',
  shared: 'Máy giặt chung',
  none: 'Không có',
};

export const CURFEW_LABELS = {
  none: 'Tự do ra vào',
  '11pm': 'Đóng cửa 23h',
  '11:30pm': 'Đóng cửa 23h30',
  '12am': 'Đóng cửa 0h',
  '1am': 'Đóng cửa 1h',
  '2am': 'Đóng cửa 2h',
};

export const STATUS_LABELS = {
  available: { label: 'Còn phòng', color: 'green' },
  rented: { label: 'Đã cho thuê', color: 'red' },
  pending: { label: 'Đang xem xét', color: 'yellow' },
};

export const PARKING_TYPES = {
  indoor: 'Trong nhà',
  outdoor: 'Ngoài trời',
  basement: 'Hầm xe',
  none: 'Không có',
};

// Mock current user (from db.js USER)
export const MOCK_USER = {
  user_id: 'USER_12345',
  name: 'Nguyễn Văn A',
  phone: '0901234567',
  role: 'landlord',
};

export const PRICE_RANGES = [
  { label: 'Dưới 2 triệu', min: 0, max: 2000000 },
  { label: '2 - 4 triệu', min: 2000000, max: 4000000 },
  { label: '4 - 7 triệu', min: 4000000, max: 7000000 },
  { label: '7 - 12 triệu', min: 7000000, max: 12000000 },
  { label: 'Trên 12 triệu', min: 12000000, max: Infinity },
];

export const AREA_RANGES = [
  { label: 'Dưới 15m²', min: 0, max: 15 },
  { label: '15 - 25m²', min: 15, max: 25 },
  { label: '25 - 35m²', min: 25, max: 35 },
  { label: 'Trên 35m²', min: 35, max: Infinity },
];
