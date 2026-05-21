import { moveRoomToDraft as serviceMoveRoomToDraft, draftAllUserRooms as serviceDraftAllUserRooms } from '../data/rooms.js';

/**
 * Move a single room to draft status and reset verification.
 * @param {string} roomId - The ID of the room.
 * @returns {Promise<{data, error}>}
 */
export const moveRoomToDraft = async (roomId) => {
    return await serviceMoveRoomToDraft(roomId);
};

/**
 * Move all available rooms of a user to draft status and reset verification.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<{data, error}>}
 */
export const draftAllUserRooms = async (userId) => {
    return await serviceDraftAllUserRooms(userId);
};
