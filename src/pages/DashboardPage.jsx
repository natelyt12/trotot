import { useState, useEffect } from 'react';
import { useModal } from '../context/ModalContext';
import { useNotification } from '../context/NotificationContext.jsx';
import AppIcon from '../components/common/AppIcon.jsx';
import RoomPostForm from '../components/dashboard/RoomPostForm.jsx';
import { supabase } from '../lib/supabase';
import { formatPrice } from '../utils/formatters.js';
import { mapSupabaseRoom } from '../utils/roomMapper.js';
import { moveRoomToDraft } from '../utils/roomUtils.js';
import RoomDetailPage from './RoomDetailPage.jsx';
import { deleteFromCloudinary } from '../utils/imageUtils.js';

/* ============================================
   DashboardPage – Property Manager
   Flat design, amber palette
   ============================================ */
export default function DashboardPage({ user, navigate, initialData }) {
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

    const validateRoomData = (room) => {
        const errors = [];
        if (!room.title || !room.title.trim()) errors.push("Thiếu tiêu đề tin đăng");
        if (!room.price_monthly || room.price_monthly < 100000) errors.push("Giá thuê phải từ 100.000đ trở lên");
        if (!room.area_sqm || room.area_sqm <= 0) errors.push("Thiếu diện tích phòng");
        if (!room.address || !room.address.trim() || !room.city || !room.district || !room.ward) errors.push("Thiếu địa chỉ đầy đủ (Tỉnh, Huyện, Xã, Số nhà)");
        if (!room.monthly_costs?.deposit_amount || room.monthly_costs.deposit_amount < 500000) errors.push("Tiền cọc phải từ 500.000đ trở lên");
        if (!room.media_contact?.images || room.media_contact.images.length === 0) errors.push("Chưa tải lên hình ảnh thực tế nào");
        if (!room.media_contact?.description || room.media_contact.description.length < 20) errors.push("Mô tả chi tiết quá ngắn (tối thiểu 20 ký tự)");
        
        // Cảnh báo link video YouTube/TikTok (chỉ bắt buộc khi đã bấm thêm ô link)
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

    const handlePublishFromDraft = (room) => {
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
                    const { error } = await supabase
                        .from('rooms')
                        .update({ status: 'available' })
                        .eq('id', room.id);

                    if (error) throw error;

                    setRooms(rooms.map(r => r.id === room.id ? { ...r, status: 'available' } : r));
                    addNotification('Tin đăng của bạn đã được gửi và đang chờ duyệt!', 'success');
                    setSubTab('verified'); // Chuyển qua tab kiểm duyệt để thấy tin
                } catch (err) {
                    console.error("Lỗi khi công khai:", err);
                    showModal({ title: 'Lỗi', message: 'Có lỗi xảy ra, không thể công khai tin.', type: 'error' });
                }
            }
        });
    };

    const handleUnpublish = async (room) => {
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

                    setRooms(rooms.map(r => r.id === room.id ? { ...r, status: 'draft', is_verified: false } : r));
                    addNotification('Đã gỡ công khai tin đăng. Bạn có thể sửa nó trong phần Tin nháp.', 'success');
                } catch (err) {
                    console.error('Error unpublishing room:', err);
                    showModal({ title: 'Lỗi', message: 'Không thể gỡ công khai tin đăng.', type: 'error' });
                }
            }
        });
    };

    const handleMockVerify = async (room) => {
        try {
            const { error } = await supabase
                .from('rooms')
                .update({ is_verified: true })
                .eq('id', room.id);

            if (error) throw error;

            setRooms(rooms.map(r => r.id === room.id ? { ...r, is_verified: true } : r));
            addNotification('Đã duyệt tin đăng thành công! (Mockup)', 'success');
        } catch (err) {
            console.error('Error verifying room:', err);
            showModal({ title: 'Lỗi', message: 'Không thể duyệt tin đăng.', type: 'error' });
        }
    };

    const ITEMS_PER_PAGE = 10;

    const fetchUserRooms = async () => {
        if (!user) return;
        setLoadingRooms(true);
        try {
            const { data, error } = await supabase
                .from('rooms')
                .select('*, profiles!user_id(full_name, phone, avatar_url, role)')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRooms(data || []);
            setCurrentPage(1);
        } catch (err) {
            console.error('Error fetching user rooms:', err);
        } finally {
            setLoadingRooms(false);
        }
    };



    const handleDeleteRoom = (room) => {
        showModal({
            title: 'Xác nhận xóa',
            message: `Bạn có chắc chắn muốn xóa tin đăng "${room.title}" không? Hành động này không thể hoàn tác.`,
            type: 'warning',
            confirmText: 'Xóa',
            cancelText: 'Hủy',
            onConfirm: async () => {
                try {
                    // Xóa tin đăng (Database sẽ tự động xóa dữ liệu liên quan nhờ Cascade Delete)
                    const { data, error } = await supabase
                        .from('rooms')
                        .delete()
                        .eq('id', room.id)
                        .select();

                    if (error) throw error;

                    if (!data || data.length === 0) {
                        showModal({
                            title: 'Cảnh báo',
                            message: 'Không thể xóa tin đăng. Có thể bạn không có quyền hoặc tin đã bị xóa trước đó.',
                            type: 'warning'
                        });
                        return;
                    }

                    // Xóa ảnh trên Cloudinary hoặc Supabase storage nếu có
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
                            const { error: storageError } = await supabase.storage
                                .from('room_media')
                                .remove(pathsToDelete);
                            
                            if (storageError) {
                                console.error('Lỗi khi xóa ảnh từ storage:', storageError);
                            }
                        }
                    }

                    setRooms(rooms.filter(r => r.id !== room.id));

                    addNotification('Xóa tin đăng thành công!', 'success');
                } catch (err) {
                    console.error('Error deleting room:', err);
                    showModal({ title: 'Lỗi', message: `Có lỗi xảy ra khi xóa tin: ${err.message || 'Vui lòng thử lại!'}`, type: 'error' });
                }
            }
        });
    };

    useEffect(() => {
        setActiveTab(initialData?.tab || 'manage_rooms');
    }, [initialData]);

    useEffect(() => {
        if (activeTab === 'manage_rooms') {
            fetchUserRooms();
        }
    }, [activeTab, user?.id]);

    const TAB_GROUPS = [
        {
            label: 'Quản lý',
            tabs: [
                { id: 'manage_rooms', label: 'Quản lý tin đăng', icon: 'check-square' },
                { id: 'post_room', label: 'Đăng / Sửa tin', icon: 'edit' },
                // Thêm các tab khác trong tương lai như: Thống kê...
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-stone-50 pt-20 pb-20 md:pb-10">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

                {/* Back button */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('home')}
                        className="flex items-center gap-2.5 bg-white border border-stone-200 rounded-full! pl-1.5 pr-4 py-1.5 cursor-pointer text-stone-600 text-sm font-bold hover:bg-stone-50 hover:text-stone-900 transition-colors duration-200 group"
                    >
                        <div className="w-7 h-7 rounded-full! bg-stone-100 flex items-center justify-center text-stone-500 transition-colors group-hover:bg-stone-200 group-hover:text-stone-700">
                            <AppIcon name="chevronLeft" size={14} strokeWidth={3.5} />
                        </div>
                        <span>Quay lại trang chủ</span>
                    </button>
                </div>

                {/* Page title */}
                <div className="mb-8">
                    <h1
                        className="text-2xl font-extrabold text-stone-900 tracking-tight"
                        style={{ fontFamily: 'var(--font-heading)' }}
                    >
                        Bảng điều khiển
                    </h1>
                    <p className="text-stone-500 text-sm mt-1">Quản lý tin đăng và thông tin thuê phòng của bạn.</p>
                </div>

                <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] items-stretch">

                        {/* Sidebar */}
                        <aside className="lg:border-r border-stone-100 bg-stone-50/30">
                            <div className="flex flex-col py-4">
                                {TAB_GROUPS.map((group) => {
                                    return (
                                        <div key={group.label} className="mb-6 last:mb-0">
                                            <div className="px-6 py-2 text-[0.68rem] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">
                                                {group.label}
                                            </div>
                                            {group.tabs.map((tab) => (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => setActiveTab(tab.id)}
                                                    className={`flex items-center gap-3 w-full px-6 py-3.5 text-[0.9rem] font-bold cursor-pointer transition-all duration-200 text-left border-none ${activeTab === tab.id
                                                        ? 'bg-white text-amber-600 border-r-4 border-r-amber-500 shadow-[inset_-1px_0_0_#fff]'
                                                        : 'bg-transparent text-stone-500 hover:bg-stone-100 hover:text-stone-800'
                                                        }`}
                                                >
                                                    <AppIcon name={tab.icon} size={18} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                                                    {tab.label}
                                                </button>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        </aside>

                        {/* Content panel */}
                        <main className="p-6 md:p-10 min-h-[500px] bg-white min-w-0">

                            {/* ---- TAB: MANAGE ROOMS ---- */}
                            {activeTab === 'manage_rooms' && (
                                <div className="animate-fade-in">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-9 h-9 rounded-full flex items-center justify-center bg-amber-100 text-amber-600">
                                            <AppIcon name="check-square" size={18} />
                                        </div>
                                        <h2
                                            className="text-lg font-bold text-stone-900"
                                            style={{ fontFamily: 'var(--font-heading)' }}
                                        >
                                            Quản lý tin đăng
                                        </h2>
                                    </div>
                                    {/* Horizontal Tab Bar */}
                                    <div className="flex border-b border-stone-200 mb-6 overflow-x-auto whitespace-nowrap">
                                        <button
                                            onClick={() => { setSubTab('verified'); setCurrentPage(1); }}
                                            className={`flex-shrink-0 px-4 py-2 text-sm font-bold border-b-2 transition-colors cursor-pointer ${subTab === 'verified' ? 'border-amber-500 text-amber-600' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
                                        >
                                            Tin đã kiểm duyệt
                                        </button>
                                        <button
                                            onClick={() => { setSubTab('published'); setCurrentPage(1); }}
                                            className={`flex-shrink-0 px-4 py-2 text-sm font-bold border-b-2 transition-colors cursor-pointer ${subTab === 'published' ? 'border-amber-500 text-amber-600' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
                                        >
                                            Tin đã công khai
                                        </button>
                                        <button
                                            onClick={() => { setSubTab('draft'); setCurrentPage(1); }}
                                            className={`flex-shrink-0 px-4 py-2 text-sm font-bold border-b-2 transition-colors cursor-pointer ${subTab === 'draft' ? 'border-amber-500 text-amber-600' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
                                        >
                                            Tin nháp
                                        </button>
                                    </div>

                                    {loadingRooms ? (
                                        <div className="text-center py-20 text-stone-500">Đang tải dữ liệu...</div>
                                    ) : (() => {
                                        const filteredRooms = rooms.filter(room => {
                                            if (subTab === 'draft') {
                                                return room.status === 'draft' || room.status === 'hidden';
                                            }
                                            if (subTab === 'verified') {
                                                return room.status === 'available' && room.is_verified;
                                            }
                                            return room.status === 'available' && !room.is_verified;
                                        });

                                        if (filteredRooms.length === 0) {
                                            return (
                                                <div className="flex flex-col items-center justify-center py-20 bg-stone-50 border border-dashed border-stone-200 rounded-xl text-center">
                                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 text-stone-300">
                                                        <AppIcon name="home" size={32} />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-stone-900 mb-2">
                                                        {subTab === 'draft' ? 'Bạn chưa có bản nháp nào' :
                                                            subTab === 'verified' ? 'Bạn chưa có tin nào được kiểm duyệt' :
                                                                'Bạn chưa có tin đăng nào được công khai'}
                                                    </h3>
                                                    <p className="text-stone-500 text-sm max-w-sm px-6 mb-6">
                                                        {subTab === 'draft' ? 'Các bản nháp sẽ xuất hiện ở đây khi bạn lưu tin.' :
                                                            subTab === 'verified' ? 'Tin đăng của bạn sau khi được kiểm duyệt sẽ xuất hiện ở đây.' :
                                                                'Bắt đầu tiếp cận khách hàng tiềm năng bằng cách đăng tin cho thuê phòng của bạn.'}
                                                    </p>
                                                    {subTab === 'draft' && (
                                                        <button
                                                            onClick={() => {
                                                                setIsCreating(true);
                                                                setEditingRoom(null);
                                                                setActiveTab('post_room');
                                                            }}
                                                            className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-6 rounded-full transition-colors cursor-pointer border-none shadow-lg shadow-amber-500/20"
                                                        >
                                                            Đăng tin ngay
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        }

                                        return (
                                            <div className="space-y-4">
                                                {filteredRooms.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((room) => (
                                                    <div key={room.id} className="flex flex-col p-4 border border-stone-100 rounded-xl hover:border-amber-300 transition-all bg-white group gap-3">
                                                        {/* Nội dung bên trên */}
                                                        <div className="flex flex-col md:flex-row gap-4">
                                                            {/* Thumbnail */}
                                                            <div className="w-full md:w-32 h-32 md:h-24 rounded-lg bg-stone-100 overflow-hidden shrink-0 relative">
                                                                {room.media_contact?.images?.[0]?.url ? (
                                                                    <img
                                                                        src={room.media_contact.images[0].url}
                                                                        alt={room.title}
                                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                                        onError={(e) => { e.currentTarget.src = `../public/images/placeholder.png`; }}
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-stone-300">
                                                                        <AppIcon name="home" size={24} />
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Info */}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="mb-1">
                                                                    <h4 className="font-bold text-stone-900 text-[1rem] line-clamp-1 group-hover:text-amber-600 transition-colors">
                                                                        {room.title}
                                                                    </h4>
                                                                </div>
                                                                <div className="flex items-center gap-1.5 text-stone-500 text-[0.8rem] mb-1">
                                                                    <AppIcon name="location" size={12} />
                                                                    <span className="truncate">
                                                                        {[room.address, room.ward, room.district].filter(Boolean).join(', ') || 'Chưa cập nhật'}
                                                                    </span>
                                                                </div>
                                                                <div className="text-amber-600 font-bold text-[0.9rem]">
                                                                    {room.price_monthly === 0 ? 'Chưa cập nhật giá' : formatPrice(room.price_monthly)}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Action Bar bên dưới */}
                                                        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-3">
                                                            {/* Badges bên trái */}
                                                            <div className="flex items-center gap-1.5">
                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.65rem] font-bold uppercase ${room.status === 'available' ? 'bg-green-50 text-green-600' :
                                                                    room.status === 'hidden' ? 'bg-amber-50 text-amber-600' :
                                                                        room.status === 'expired' ? 'bg-red-50 text-red-600' :
                                                                            'bg-stone-50 text-stone-500'
                                                                    }`}>
                                                                    {room.status === 'available' ? 'Đã công khai' :
                                                                        room.status === 'hidden' ? 'Đã ẩn' :
                                                                            room.status === 'expired' ? 'Hết hạn' :
                                                                                room.status === 'draft' ? 'Bản nháp' :
                                                                                    room.status}
                                                                </span>
                                                                {room.is_verified && room.status === 'available' && (
                                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[0.65rem] font-bold uppercase bg-blue-50 text-blue-600">
                                                                        Đã kiểm duyệt
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Buttons bên phải */}
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <button
                                                                    onClick={() => setPreviewRoom(mapSupabaseRoom(room))}
                                                                    className="flex items-center gap-1 px-3 py-1.5 border border-stone-200 rounded-full text-[0.75rem] font-bold text-stone-600 hover:bg-stone-50 hover:text-stone-900 cursor-pointer transition-colors"
                                                                >
                                                                    <AppIcon name="eye" size={12} />
                                                                    Xem trước
                                                                </button>

                                                                {subTab === 'published' && (
                                                                    <button
                                                                        onClick={() => handleMockVerify(room)}
                                                                        className="flex items-center gap-1 px-3 py-1.5 border border-blue-200 bg-blue-50 rounded-full text-[0.75rem] font-bold text-blue-600 hover:bg-blue-100 cursor-pointer transition-colors"
                                                                    >
                                                                        <AppIcon name="verified" size={12} strokeWidth={2.5} />
                                                                        Duyệt tin (Mock)
                                                                    </button>
                                                                )}

                                                                {subTab === 'published' || subTab === 'verified' ? (
                                                                    <button
                                                                        onClick={() => handleUnpublish(room)}
                                                                        className="flex items-center gap-1 px-3 py-1.5 border border-amber-200 bg-amber-50 rounded-full text-[0.75rem] font-bold text-amber-600 hover:bg-amber-100 cursor-pointer transition-colors"
                                                                    >
                                                                        <AppIcon name="eye-off" size={12} />
                                                                        Gỡ công khai
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => {
                                                                            setEditingRoom(room);
                                                                            setIsCreating(false);
                                                                            setActiveTab('post_room');
                                                                        }}
                                                                        className="flex items-center gap-1 px-3 py-1.5 border border-stone-200 rounded-full text-[0.75rem] font-bold text-stone-600 hover:bg-stone-50 hover:text-stone-900 cursor-pointer transition-colors"
                                                                    >
                                                                        <AppIcon name="edit" size={12} />
                                                                        Sửa
                                                                    </button>
                                                                )}

                                                                {subTab === 'draft' && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => handlePublishFromDraft(room)}
                                                                            className="flex items-center gap-1 px-3 py-1.5 border border-green-200 bg-green-50 rounded-full text-[0.75rem] font-bold text-green-600 hover:bg-green-100 cursor-pointer transition-colors"
                                                                        >
                                                                            <AppIcon name="check" size={12} />
                                                                            Công khai
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteRoom(room)}
                                                                            className="flex items-center gap-1 px-3 py-1.5 border border-red-100 bg-red-50 rounded-full text-[0.75rem] font-bold text-red-600 hover:bg-red-100 cursor-pointer transition-colors"
                                                                        >
                                                                            <AppIcon name="trash" size={12} />
                                                                            Xóa
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* Pagination */}
                                                {Math.ceil(filteredRooms.length / ITEMS_PER_PAGE) > 1 && (
                                                    <div className="flex items-center justify-center gap-2 mt-6">
                                                        <button
                                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                            disabled={currentPage === 1}
                                                            className="w-8 h-8 flex items-center justify-center rounded-full border border-stone-200 text-stone-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-50 transition-colors cursor-pointer"
                                                        >
                                                            <AppIcon name="chevronLeft" size={12} strokeWidth={3.5} />
                                                        </button>

                                                        {(() => {
                                                            const totalPages = Math.ceil(filteredRooms.length / ITEMS_PER_PAGE);
                                                            let startPage = Math.max(1, currentPage - 5);
                                                            let endPage = Math.min(totalPages, startPage + 9);
                                                            if (endPage - startPage < 9) {
                                                                startPage = Math.max(1, endPage - 9);
                                                            }
                                                            const pages = [];
                                                            for (let i = startPage; i <= endPage; i++) {
                                                                pages.push(i);
                                                            }
                                                            return pages.map((pageNum) => (
                                                                <button
                                                                    key={pageNum}
                                                                    onClick={() => setCurrentPage(pageNum)}
                                                                    className={`w-8 h-8 flex items-center justify-center rounded-full border text-sm font-bold transition-colors cursor-pointer ${currentPage === pageNum ? 'border-amber-500 bg-amber-50 text-amber-600' : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                                                                        }`}
                                                                >
                                                                    {pageNum}
                                                                </button>
                                                            ));
                                                        })()}

                                                        <button
                                                            onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredRooms.length / ITEMS_PER_PAGE), prev + 1))}
                                                            disabled={currentPage === Math.ceil(filteredRooms.length / ITEMS_PER_PAGE)}
                                                            className="w-8 h-8 flex items-center justify-center rounded-full border border-stone-200 text-stone-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-50 transition-colors cursor-pointer"
                                                        >
                                                            <AppIcon name="chevronRight" size={12} strokeWidth={3.5} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}

                            {/* ---- TAB: POST ROOM (FLEXIBLE EDIT) ---- */}
                            {activeTab === 'post_room' && (
                                <div className="animate-fade-in">
                                    {!editingRoom && !isCreating ? (
                                        <div className="flex flex-col items-center justify-center py-20 bg-stone-50 border border-dashed border-stone-200 rounded-xl text-center">
                                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 text-stone-300">
                                                <AppIcon name="edit" size={32} />
                                            </div>
                                            <h3 className="text-lg font-bold text-stone-900 mb-2">Không có yêu cầu chỉnh sửa tin đăng nào</h3>
                                            <p className="text-stone-500 text-sm max-w-sm px-6 mb-6">
                                                Bạn có thể chọn một tin đăng để chỉnh sửa từ danh sách, hoặc bạn có thể{' '}
                                                <button
                                                    onClick={() => setIsCreating(true)}
                                                    className="text-amber-600 font-bold hover:text-amber-700 cursor-pointer bg-transparent border-none p-0 inline"
                                                >
                                                    tạo tin đăng mới
                                                </button>
                                            </p>
                                        </div>
                                    ) : (
                                        <RoomPostForm
                                            user={user}
                                            roomToEdit={editingRoom}
                                            onClear={() => {
                                                setEditingRoom(null);
                                                setIsCreating(false);
                                                setActiveTab('manage_rooms');
                                            }}
                                            onSuccess={() => {
                                                setEditingRoom(null);
                                                setIsCreating(false);
                                                setActiveTab('manage_rooms');
                                            }}
                                        />
                                    )}
                                </div>
                            )}

                        </main>
                    </div>
                </div>
            </div>
            {previewRoom && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-white">
                    <RoomDetailPage
                        room={previewRoom}
                        navigate={navigate}
                        user={user}
                        onClose={() => setPreviewRoom(null)}
                        previewMode={true}
                    />
                </div>
            )}
        </div>
    );
}
