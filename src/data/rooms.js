// Data layer - re-exports mock data for easy future DB integration
// To connect to a real API, only change this file.

import { ROOM_MOCK_DATA } from './mock_room_data.js';

export const getRooms = () => ROOM_MOCK_DATA;

export const getRoomById = (id) =>
  ROOM_MOCK_DATA.find((room) => room.listing_id === id) || null;

export const getAvailableCities = () => {
  const cities = ROOM_MOCK_DATA.map((r) => r.basic_info.city).filter(Boolean);
  return [...new Set(cities)].sort();
};

export { ROOM_MOCK_DATA };
