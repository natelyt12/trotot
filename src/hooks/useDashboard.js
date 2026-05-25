import { useState, useEffect, useCallback } from 'react';
import { useModal } from '../context/ModalContext';
import { useNotification } from '../context/NotificationContext.jsx';
import { getUserRooms, publishRoom, verifyRoomMock, deleteRoom, deleteRoomMedia, createRoom, updateRoom } from '../services/roomService.js';
import { moveRoomToDraft } from '../utils/roomUtils.js';
import { deleteFromCloudinary } from '../utils/imageUtils.js';
import { validateRoomData } from '../utils/validation.js';

export const useDashboard = (user, initialData, routerPage) => {
    const { showModal } = useModal();
    const { addNotification } = useNotification();

    const [activeTab, setActiveTab] = useState(initialData?.tab || 'manage_rooms');
    const [editingRoom, setEditingRoom] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [previewRoom, setPreviewRoom] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [subTab, setSubTab] = useState('verified');
    const [renewingRoom, setRenewingRoom] = useState(null);

    const fetchUserRooms = useCallback(async () => {
        if (!user?.id) return;
        setLoadingRooms(true);
        try {
            const { data, error } = await getUserRooms(user.id);
            if (error) throw error;
            setRooms(data || []);
            setCurrentPage(1);
        } catch (err) {
            console.error('Error fetching user rooms:', err);
        } finally {
            setLoadingRooms(false);
        }
    }, [user?.id]);

    useEffect(() => {
        if (routerPage === 'dashboard') {
            const targetTab = initialData?.tab || 'manage_rooms';
            setActiveTab(targetTab);
        }
    }, [routerPage, initialData]);

    useEffect(() => {
        if (activeTab === 'manage_rooms') {
            const timer = setTimeout(() => {
                fetchUserRooms();
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [activeTab, fetchUserRooms]);

    const handlePublishFromDraft = useCallback((room) => {
        const errors = validateRoomData(room);

        if (errors.length > 0) {
            const errorMessage = "Không thể công khai tin đăng vì thiếu thông tin:\n" + errors.map(e => "\n• " + e).join("") + "\n\nVui lòng bấm vào Sửa để bổ sung.";
            showModal({
                title: 'Thiếu thông tin bắt buộc',
                message: errorMessage,
                type: 'error',
                confirmText: 'Đã hiểu'
            });
            return;
        }

        showModal({
            title: "Xác nhận công khai tin đăng",
            message: "Bạn có chắc chắn muốn công khai tin đăng này? Hãy đảm bảo bạn đã kiểm tra kỹ các thông tin. Tin đăng của bạn sẽ được hệ thống kiểm duyệt trong vòng 24h trước khi hiển thị rộng rãi.",
            type: "warning",
            confirmText: "Công khai ngay",
            cancelText: "Hủy",
            onConfirm: async () => {
                try {
                    const { error } = await publishRoom(room.id);
                    if (error) throw error;

                    setRooms(prev => prev.map(r => r.id === room.id ? { ...r, status: 'pending' } : r));
                    addNotification('Tin đăng của bạn đã được gửi và đang chờ duyệt công khai!', 'success');
                } catch (err) {
                    console.error("Lỗi khi công khai:", err);
                    showModal({ title: 'Lỗi', message: 'Có lỗi xảy ra, không thể công khai tin.', type: 'error' });
                }
            }
        });
    }, [showModal, addNotification]);

    const handleUnpublish = useCallback((room) => {
        const isVerified = room.is_verified;
        const message = isVerified
            ? 'Tin đăng này đã được kiểm duyệt. Nếu bạn gỡ công khai và chỉnh sửa, tin đăng có thể cần được kiểm duyệt lại. Bạn có chắc chắn muốn tiếp tục?'
            : 'Bạn có chắc chắn muốn gỡ công khai tin đăng này? Tin đăng sẽ chuyển về trạng thái nháp.';

        showModal({
            title: 'Xác nhận gỡ công khai',
            message: message,
            type: 'warning',
            confirmText: 'Gỡ công khai',
            cancelText: 'Hủy',
            onConfirm: async () => {
                try {
                    const { error } = await moveRoomToDraft(room.id);
                    if (error) throw error;

                    setRooms(prev => prev.map(r => r.id === room.id ? { ...r, status: 'draft', is_verified: false } : r));
                    addNotification('Đã gỡ công khai tin đăng. Bạn có thể sửa nó trong phần Tin nháp.', 'success');
                } catch (err) {
                    console.error('Error unpublishing room:', err);
                    showModal({ title: 'Lỗi', message: 'Không thể gỡ công khai tin đăng.', type: 'error' });
                }
            }
        });
    }, [showModal, addNotification]);

    const handleMockVerify = useCallback(async (room) => {
        try {
            const { error } = await verifyRoomMock(room.id);
            if (error) throw error;

            setRooms(prev => prev.map(r => r.id === room.id ? { ...r, is_verified: true } : r));
            addNotification('Đã xác thực tin đăng thành công! (Mockup)', 'success');
        } catch (err) {
            console.error('Error verifying room:', err);
            showModal({ title: 'Lỗi', message: 'Không thể duyệt tin đăng.', type: 'error' });
        }
    }, [addNotification, showModal]);

    const handleDeleteRoom = useCallback((room) => {
        showModal({
            title: 'Xác nhận xóa',
            message: `Bạn có chắc chắn muốn xóa tin đăng "${room.title}" không? Hành động này không thể hoàn tác.`,
            type: 'warning',
            confirmText: 'Xóa',
            cancelText: 'Hủy',
            onConfirm: async () => {
                try {
                    const { data, error } = await deleteRoom(room.id);
                    if (error) throw error;

                    if (!data || data.length === 0) {
                        showModal({
                            title: 'Cảnh báo',
                            message: 'Không thể xóa tin đăng. Có thể bạn không có quyền hoặc tin đã bị xóa trước đó.',
                            type: 'warning'
                        });
                        return;
                    }

                    const images = room.media_contact?.images;
                    if (images && images.length > 0) {
                        const pathsToDelete = [];
                        for (const img of images) {
                            if (img.url) {
                                if (img.url.includes("res.cloudinary.com")) {
                                    await deleteFromCloudinary(img.url);
                                } else {
                                    const parts = img.url.split('/room_media/');
                                    if (parts.length > 1) {
                                        const path = parts[1].split('?')[0];
                                        if (path.startsWith(`${user.id}/`)) {
                                            pathsToDelete.push(path);
                                        }
                                    }
                                }
                            }
                        }

                        if (pathsToDelete.length > 0) {
                            const { error: storageError } = await deleteRoomMedia(pathsToDelete);
                            if (storageError) {
                                console.error('Lỗi khi xóa ảnh từ storage:', storageError);
                            }
                        }
                    }

                    setRooms(prev => prev.filter(r => r.id !== room.id));
                    addNotification('Xóa tin đăng thành công!', 'success');
                } catch (err) {
                    console.error('Error deleting room:', err);
                    showModal({ title: 'Lỗi', message: `Có lỗi xảy ra khi xóa tin: ${err.message || 'Vui lòng thử lại!'}`, type: 'error' });
                }
            }
        });
    }, [showModal, addNotification, user?.id]);

    const handleDuplicateRoom = useCallback((room) => {
        showModal({
            title: 'Nhân bản tin đăng',
            message: `Bạn có chắc chắn muốn nhân bản tin đăng "${room.title}" không? Bản sao mới sẽ được lưu dưới dạng Bản nháp.`,
            type: 'warning',
            confirmText: 'Nhân bản',
            cancelText: 'Hủy',
            onConfirm: async () => {
                try {
                    const availableUntil = new Date();
                    availableUntil.setDate(availableUntil.getDate() + 7);

                    const payload = {
                        user_id: user.id,
                        title: `${room.title} (Bản sao)`,
                        room_type: room.room_type,
                        price_monthly: room.price_monthly,
                        area_sqm: room.area_sqm,
                        city: room.city,
                        district: room.district,
                        ward: room.ward,
                        address: room.address,
                        monthly_costs: room.monthly_costs,
                        room_features: room.room_features,
                        rules_utilities: room.rules_utilities,
                        media_contact: room.media_contact,
                        available_until: availableUntil.toISOString(),
                        status: "draft",
                        is_verified: false,
                        total_views: 0,
                        total_favorites: 0,
                    };

                    const { error } = await createRoom(payload);
                    if (error) throw error;

                    await fetchUserRooms();
                    addNotification('Nhân bản tin đăng nháp thành công!', 'success');
                } catch (err) {
                    console.error('Error duplicating room:', err);
                    showModal({ title: 'Lỗi', message: `Có lỗi xảy ra khi nhân bản tin: ${err.message || 'Vui lòng thử lại!'}`, type: 'error' });
                }
            }
        });
    }, [showModal, addNotification, user?.id, fetchUserRooms]);

    const handleRenewRoom = useCallback((room) => {
        setRenewingRoom(room);
    }, []);

    const executeRenewal = useCallback(async (room, days) => {
        try {
            const newAvailableUntil = new Date();
            newAvailableUntil.setDate(newAvailableUntil.getDate() + parseInt(days, 10));

            const { error } = await updateRoom(room.id, {
                available_until: newAvailableUntil.toISOString(),
                status: 'available'
            });

            if (error) throw error;

            setRooms(prev => prev.map(r => r.id === room.id ? { 
                ...r, 
                available_until: newAvailableUntil.toISOString(),
                status: 'available'
            } : r));

            addNotification('Gia hạn tin đăng thành công!', 'success');
            setRenewingRoom(null);
            setSubTab('pending_verification');
        } catch (err) {
            console.error('Error renewing room:', err);
            showModal({ title: 'Lỗi', message: 'Không thể gia hạn tin đăng. Vui lòng thử lại!', type: 'error' });
        }
    }, [addNotification, showModal]);

    return {
        activeTab,
        setActiveTab,
        editingRoom,
        setEditingRoom,
        isCreating,
        setIsCreating,
        previewRoom,
        setPreviewRoom,
        rooms,
        loadingRooms,
        currentPage,
        setCurrentPage,
        subTab,
        setSubTab,
        handlePublishFromDraft,
        handleUnpublish,
        handleMockVerify,
        handleDeleteRoom,
        handleDuplicateRoom,
        fetchUserRooms,
        renewingRoom,
        setRenewingRoom,
        handleRenewRoom,
        executeRenewal
    };
};
