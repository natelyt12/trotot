import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useModal } from '../context/ModalContext';
import { useNotification } from '../context/NotificationContext';
import { signIn, signOut } from '../services/authService.js';
import { getUserProfile, updateUserProfile, updateUserAuth, uploadAvatar, getAvatarPublicUrl, removeAvatar, deleteUserAccount } from '../services/profileService.js';
import { getRoomsByIds, getUserRooms, deleteCloudinaryImage } from '../services/roomService.js';
import { getUserCommentedRooms } from '../services/commentService.js';
import AppIcon from '../components/common/AppIcon.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { mapSupabaseRoom } from '../utils/roomMapper.js';
import { formatPrice } from '../utils/formatters.js';
import RoomGrid from '../components/rooms/RoomGrid.jsx';
import { deleteFromCloudinary, cropImageToSquare } from '../utils/imageUtils';
import { draftAllUserRooms } from '../utils/roomUtils.js';
import VerificationForm from '../components/auth/VerificationForm.jsx';


/* ============================================
   ProfilePage – Account Manager
   Flat design, amber palette
   ============================================ */
export default function ProfilePage({ user, navigate, initialData }) {
    const { showModal } = useModal();
    const { addNotification } = useNotification();
    const { favorites } = useFavorites();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [savedRooms, setSavedRooms] = useState([]);
    const [loadingSaved, setLoadingSaved] = useState(false);

    const [commentedRooms, setCommentedRooms] = useState([]);
    const [loadingCommented, setLoadingCommented] = useState(false);

    const [formData, setFormData] = useState({
        full_name: '',
        role: 'tenant',
        avatar_url: '',
        phone: '',
    });

    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');

    const [activeTab, setActiveTab] = useState(initialData?.tab || 'info');
    const [showVerification, setShowVerification] = useState(false);

    const oldRole = user?.user_metadata?.role || 'tenant';


    // Fetch latest profile from database
    const fetchProfile = useCallback(async () => {
        if (!user) return;
        try {
            const { data, error } = await getUserProfile(user.id);

            if (data && !error) {
                setFormData({
                    full_name: data.full_name || '',
                    role: data.role || 'tenant',
                    avatar_url: data.avatar_url || '',
                    phone: data.phone || '',
                });
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
        }
    }, [user]);

    // Sync formData when user prop is available or changes
    useEffect(() => {
        if (user) {
            // Initial sync from auth metadata
            const metaName = user.user_metadata?.full_name || '';
            const metaRole = user.user_metadata?.role || 'tenant';
            const metaAvatar = user.user_metadata?.avatar_url || '';
            const metaPhone = user.user_metadata?.phone || '';

            const timer = setTimeout(() => {
                setFormData(prev => {
                    if (prev.full_name !== metaName || prev.role !== metaRole || prev.avatar_url !== metaAvatar || prev.phone !== metaPhone) {
                        return {
                            full_name: metaName,
                            role: metaRole,
                            avatar_url: metaAvatar,
                            phone: metaPhone
                        };
                    }
                    return prev;
                });
                // Fetch fresh data from profiles table
                fetchProfile();
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [user, fetchProfile]);

    useEffect(() => {
        // Only sync activeTab if initialData?.tab is explicitly specified
        if (initialData?.tab) {
            const timer = setTimeout(() => {
                setActiveTab(prev => prev !== initialData.tab ? initialData.tab : prev);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [initialData]);

    const TAB_GROUPS = [
        {
            label: 'Cá nhân',
            tabs: [
                { id: 'info', label: 'Thông tin cá nhân', icon: 'user' },
                { id: 'favorites', label: 'Tin đã lưu', icon: 'heart' },
                { id: 'commented_rooms', label: 'Phòng đã bình luận', icon: 'messages' },
            ]
        },

        {
            label: 'Bảo mật',
            tabs: [
                { id: 'password', label: 'Đổi mật khẩu', icon: 'lock' },
                { id: 'danger', label: 'Vùng nguy hiểm', icon: 'trash' },
            ]
        }
    ];

    useEffect(() => {
        if (activeTab === 'favorites' && favorites.length > 0) {
            const fetchSavedRooms = async () => {
                setLoadingSaved(true);
                try {
                    const { data, error } = await getRoomsByIds(favorites);

                    if (error) throw error;
                    setSavedRooms(data.map(mapSupabaseRoom));
                } catch (err) {
                    console.error('Error fetching saved rooms:', err);
                } finally {
                    setLoadingSaved(false);
                }
            };
            fetchSavedRooms();
        } else if (activeTab === 'favorites' && favorites.length === 0) {
            const timer = setTimeout(() => {
                setSavedRooms(prev => prev.length > 0 ? [] : prev);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [activeTab, favorites]);

    useEffect(() => {
        if (activeTab === 'commented_rooms' && user) {
            const fetchCommentedRooms = async () => {
                setLoadingCommented(true);
                try {
                    const { data, error } = await getUserCommentedRooms(user.id);

                    if (error) throw error;

                    if (data) {
                        // Group by room_id
                        const grouped = data.reduce((acc, comment) => {
                            const roomId = comment.room_id;
                            if (!acc[roomId]) {
                                acc[roomId] = {
                                    room: mapSupabaseRoom(comment.rooms),
                                    count: 0,
                                    lastCommentAt: comment.created_at
                                };
                            }
                            acc[roomId].count += 1;
                            return acc;
                        }, {});

                        setCommentedRooms(Object.values(grouped).sort((a, b) => new Date(b.lastCommentAt) - new Date(a.lastCommentAt)));
                    }
                } catch (err) {
                    console.error('Error fetching commented rooms:', err);
                } finally {
                    setLoadingCommented(false);
                }
            };
            fetchCommentedRooms();
        }
    }, [activeTab, user]);

    const handleLogout = () => {
        showModal({
            title: 'Xác nhận đăng xuất',
            message: 'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?',
            type: 'warning',
            confirmText: 'Đăng xuất',
            cancelText: 'Hủy',
            onConfirm: async () => {
                await signOut();
                navigate('home');
            }
        });
    };

    const performUpdate = async (shouldDraftRooms) => {
        setLoading(true);
        try {
            const { error } = await updateUserAuth({
                data: {
                    full_name: formData.full_name,
                    role: formData.role,
                    phone: formData.phone,
                    avatar_url: formData.avatar_url
                }
            });
            if (error) throw error;

            const { error: profileError } = await updateUserProfile(user.id, {
                full_name: formData.full_name,
                phone: formData.phone,
                role: formData.role
            });
            if (profileError) throw profileError;

            if (shouldDraftRooms) {
                const { error: roomsError } = await draftAllUserRooms(user.id);
                if (roomsError) throw roomsError;
                addNotification('Đã chuyển vai trò và chuyển tất cả tin đăng về bản nháp (đã hủy kiểm duyệt)!', 'success');
            } else {
                addNotification('Cập nhật thông tin thành công!', 'success');
            }
            await fetchProfile();
        } catch (err) {
            addNotification(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();

        if (!formData.full_name?.trim()) {
            addNotification('Vui lòng nhập họ tên của bạn.', 'error');
            return;
        }
        if (!formData.phone?.trim()) {
            addNotification('Vui lòng nhập số điện thoại.', 'error');
            return;
        }
        const cleanPhone = formData.phone.replace(/[\s.-]/g, '');
        if (!/^[0-9]{10,11}$/.test(cleanPhone)) {
            addNotification('Số điện thoại không hợp lệ (yêu cầu từ 10 đến 11 chữ số).', 'error');
            return;
        }

        const newRole = formData.role;

        if (oldRole === 'tenant' && newRole === 'landlord') {
            // Chuyển từ người thuê -> bên cho thuê -> yêu cầu KYC
            showModal({
                title: 'Nâng cấp Chủ nhà (KYC)',
                message: 'Để chuyển đổi vai trò sang Bên cho thuê (Chủ nhà), bạn cần hoàn tất biểu mẫu xác minh danh tính (KYC). Bạn có muốn bắt đầu xác minh ngay bây giờ?',
                type: 'warning',
                confirmText: 'Bắt đầu xác minh',
                cancelText: 'Hủy bỏ',
                onConfirm: () => {
                    setShowVerification(true);
                },
                onCancel: () => {
                    setFormData(prev => ({ ...prev, role: oldRole }));
                }
            });
        } else if (oldRole === 'landlord' && newRole === 'tenant') {
            // Chuyển từ bên cho thuê -> người thuê -> ẩn tin đăng (Nháp)
            showModal({
                title: 'Cảnh báo chuyển vai trò',
                message: 'Khi chuyển về vai trò Người thuê, toàn bộ tin đăng của bạn trên hệ thống sẽ tự động chuyển thành bản nháp (tạm ẩn khỏi trang tìm kiếm) và bạn không thể quản lý tin đăng nữa. Bạn có chắc chắn muốn chuyển đổi?',
                type: 'error',
                confirmText: 'Xác nhận chuyển đổi',
                cancelText: 'Hủy bỏ',
                onConfirm: () => performUpdate(true),
                onCancel: () => {
                    setFormData(prev => ({ ...prev, role: oldRole }));
                }
            });
        } else {
            // Cập nhật thông tin thông thường
            showModal({
                title: 'Xác nhận thay đổi',
                message: 'Bạn có chắc chắn muốn lưu các thay đổi đối với thông tin cá nhân của mình không?',
                type: 'warning',
                confirmText: 'Xác nhận',
                cancelText: 'Hủy',
                onConfirm: () => performUpdate(false)
            });
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            addNotification('Vui lòng chỉ chọn tệp tin hình ảnh (PNG, JPG, JPEG, WEBP, GIF, v.v.).', 'error');
            return;
        }
        if (!user) {
            addNotification('Bạn cần đăng nhập để thực hiện thao tác này.', 'error');
            return;
        }
        setUploading(true);
        const oldAvatarUrl = formData.avatar_url;

        try {
            // 1. Cắt vuông chính giữa và nén ảnh avatar trước khi upload (giới hạn 400px cho avatar nét)
            const compressedFile = await cropImageToSquare(file, 400, 0.8);

            let publicUrl = "";
            const cloudinaryCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
            const cloudinaryUploadPreset = import.meta.env.VITE_CLOUDINARY_AVATAR_UPLOAD_PRESET || import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

            if (cloudinaryCloudName && cloudinaryUploadPreset) {
                // Tải lên Cloudinary
                const formDataCloudinary = new FormData();
                formDataCloudinary.append("file", compressedFile);
                formDataCloudinary.append("upload_preset", cloudinaryUploadPreset);

                const response = await fetch(
                    `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`,
                    {
                        method: "POST",
                        body: formDataCloudinary,
                    }
                );

                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}));
                    throw new Error(errData.error?.message || "Tải ảnh đại diện lên Cloudinary thất bại");
                }

                const data = await response.json();
                publicUrl = data.secure_url;
            } else {
                const fileExt = compressedFile.name.split('.').pop();
                const filePath = `${user.id}/${Date.now()}.${fileExt}`;

                // 2. Upload file đã nén lên Supabase
                const { error: uploadError } = await uploadAvatar(filePath, compressedFile);
                if (uploadError) throw uploadError;

                // 3. Lấy Public URL từ Supabase
                publicUrl = getAvatarPublicUrl(filePath);
            }

            // 4. Cập nhật Auth metadata
            const { error: updateError } = await updateUserAuth({
                data: { avatar_url: publicUrl }
            });
            if (updateError) throw updateError;

            // 5. Cập nhật bảng profiles
            const { error: profileError } = await updateUserProfile(user.id, { avatar_url: publicUrl });
            if (profileError) throw profileError;

            // 6. Cập nhật state
            setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
            addNotification('Cập nhật ảnh đại diện thành công!', 'success');

            // 7. Xóa ảnh cũ trên storage nếu có để tránh rác dữ liệu
            if (oldAvatarUrl) {
                if (oldAvatarUrl.includes("res.cloudinary.com")) {
                    await deleteFromCloudinary(oldAvatarUrl);
                } else {
                    const urlParts = oldAvatarUrl.split('/user_avatar/');
                    if (urlParts.length > 1) {
                        const oldPath = urlParts[1].split('?')[0];
                        if (oldPath.startsWith(`${user.id}/`)) {
                            const { error: removeError } = await removeAvatar(oldPath);

                            if (removeError) {
                                console.error('Lỗi khi xóa ảnh cũ từ storage:', removeError);
                            }
                        }
                    }
                }
            }
        } catch (err) {
            addNotification(`Lỗi tải ảnh: ${err.message}`, 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            addNotification('Mật khẩu xác nhận không khớp.', 'error');
            return;
        }
        if (passwordData.newPassword.length < 6) {
            addNotification('Mật khẩu mới phải có ít nhất 6 ký tự.', 'error');
            return;
        }
        setPasswordLoading(true);
        try {
            const { error: signInError } = await signIn(user.email, passwordData.oldPassword);
            if (signInError) throw new Error('Mật khẩu cũ không chính xác.');

            const { error } = await updateUserAuth({ password: passwordData.newPassword });
            if (error) throw error;

            addNotification('Thay đổi mật khẩu thành công!', 'success');
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            addNotification(err.message, 'error');
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!deletePassword) return;

        showModal({
            title: 'Xác nhận xóa tài khoản',
            message: 'CẢNH BÁO: Bạn có chắc chắn muốn xóa tài khoản vĩnh viễn? Mọi dữ liệu sẽ bị mất và không thể khôi phục.',
            type: 'error',
            confirmText: 'Xác nhận xóa',
            cancelText: 'Hủy bỏ',
            onConfirm: async () => {
                setLoading(true);
                try {
                    const { error: authError } = await signIn(user.email, deletePassword);
                    if (authError) throw new Error('Mật khẩu xác nhận không chính xác.');

                    // 1. Xóa ảnh đại diện (avatar) khỏi storage (Cloudinary hoặc Supabase) trước khi xóa tài khoản
                    // Việc này cần thực hiện khi người dùng vẫn còn phiên đăng nhập để có quyền xóa tệp
                    const avatarUrl = formData.avatar_url;
                    if (avatarUrl) {
                        try {
                            if (avatarUrl.includes("res.cloudinary.com")) {
                                await deleteFromCloudinary(avatarUrl);
                            } else {
                                const urlParts = avatarUrl.split('/user_avatar/');
                                if (urlParts.length > 1) {
                                    const path = urlParts[1].split('?')[0];
                                    if (path.startsWith(`${user.id}/`)) {
                                        await removeAvatar(path);
                                    }
                                }
                            }
                        } catch (avatarErr) {
                            console.error('Lỗi khi xóa ảnh đại diện khi xóa tài khoản:', avatarErr);
                        }
                    }

                    // Bug #1: Xóa tất cả ảnh phòng (Cloudinary) trước khi xóa tài khoản
                    try {
                        const { data: userRooms } = await getUserRooms(user.id);
                        if (userRooms && userRooms.length > 0) {
                            for (const room of userRooms) {
                                const images = room.media_contact?.images || [];
                                for (const img of images) {
                                    const imgUrl = typeof img === 'string' ? img : img?.url;
                                    if (imgUrl && imgUrl.includes('res.cloudinary.com')) {
                                        // Extract public_id từ Cloudinary URL
                                        // Format: .../upload/v123456/folder/public_id.ext
                                        const match = imgUrl.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
                                        if (match) {
                                            const publicId = match[1];
                                            try {
                                                await deleteCloudinaryImage(publicId);
                                            } catch (imgErr) {
                                                console.error('Lỗi xóa ảnh Cloudinary:', publicId, imgErr);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    } catch (roomsErr) {
                        console.error('Lỗi khi xóa ảnh phòng trước khi xóa tài khoản:', roomsErr);
                        // Không throw – vẫn tiếp tục xóa tài khoản
                    }

                    // 2. Gọi API xóa tài khoản trong DB (Profiles & Auth Users)
                    const { error } = await deleteUserAccount();
                    if (error) throw error;

                    await signOut();
                    showModal({
                        title: 'Thành công',
                        message: 'Tài khoản của bạn đã được xóa thành công.',
                        type: 'success',
                        onConfirm: () => navigate('home')
                    });
                } catch (err) {
                    addNotification(`Lỗi: ${err.message}`, 'error');
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    // Shared input class
    const inputCls = "w-full px-3 py-2.5 h-11 border border-stone-200 rounded-lg text-sm text-stone-900 outline-none focus:border-amber-500 transition-colors duration-200 bg-white";

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
                        Thiết lập tài khoản
                    </h1>
                    <p className="text-stone-500 text-sm mt-1">Quản lý thông tin cá nhân và cài đặt bảo mật của bạn.</p>
                </div>

                <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] items-stretch">

                        {/* Sidebar */}
                        <aside className="lg:border-r border-stone-100 bg-stone-50/30 p-6 flex flex-col justify-between">
                            <div>
                                <div className="p-4 text-center border-b border-stone-100 mb-6">
                                    {/* Avatar */}
                                    <div
                                        className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-3xl font-extrabold relative overflow-hidden bg-amber-500 shadow-sm border border-white"
                                        style={formData.avatar_url
                                            ? { backgroundImage: `url(${formData.avatar_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                                            : {}
                                        }
                                    >
                                        {!formData.avatar_url && (formData.full_name || 'U').charAt(0).toUpperCase()}

                                        <label
                                            className={`absolute inset-0 bg-black/45 flex items-center justify-center cursor-pointer transition-opacity duration-200 text-white text-xs font-semibold ${uploading ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`}
                                        >
                                            <input
                                                type="file" accept="image/*"
                                                onChange={handleAvatarUpload}
                                                disabled={uploading}
                                                className="hidden"
                                            />
                                            {uploading ? '...' : (
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                                    <circle cx="12" cy="13" r="4" />
                                                </svg>
                                            )}
                                        </label>
                                    </div>

                                    <h3 className="text-base font-bold text-stone-900 mb-0.5 truncate max-w-[180px] mx-auto">
                                        {formData.full_name || 'Người dùng'}
                                    </h3>
                                    <p className="text-[11px] text-stone-400 truncate px-2 font-medium">{user?.email}</p>
                                </div>

                                <div className="space-y-6">
                                    {TAB_GROUPS.map((group) => {
                                        // Use the actual role from user metadata, not the unsaved formData
                                        const currentRole = user?.user_metadata?.role || 'tenant';
                                        if (group.condition && !group.condition(currentRole)) return null;
                                        return (
                                            <div key={group.label} className="space-y-2">
                                                <div className="px-3 py-1 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                                                    {group.label}
                                                </div>
                                                <div className="space-y-1">
                                                    {group.tabs.map((tab) => {
                                                        const isActive = activeTab === tab.id;
                                                        return (
                                                            <button
                                                                key={tab.id}
                                                                onClick={() => setActiveTab(tab.id)}
                                                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-bold text-sm border-none cursor-pointer transition-all duration-200 ${
                                                                    isActive 
                                                                        ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20' 
                                                                        : 'bg-transparent text-stone-500 hover:bg-stone-100 hover:text-stone-800'
                                                                }`}
                                                            >
                                                                <AppIcon name={tab.icon} size={18} strokeWidth={isActive ? 2.5 : 2} />
                                                                <span>{tab.label}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="mt-8 border-t border-stone-100 pt-5">
                                {/* Logout */}
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-red-100 bg-red-50 text-red-600 text-sm font-bold cursor-pointer transition-colors duration-200 hover:bg-red-100"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                        <polyline points="16 17 21 12 16 7" />
                                        <line x1="21" y1="12" x2="9" y2="12" />
                                    </svg>
                                    <span>Đăng xuất</span>
                                </button>
                            </div>
                        </aside>

                        {/* Content panel */}
                        <main className="p-6 md:p-10 min-h-[500px] bg-white">
                            <AnimatePresence mode="wait">


                                {/* ---- TAB: INFO ---- */}
                                {activeTab === 'info' && (
                                    <motion.div
                                        key="info"
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -15 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <TabHeader icon="user" title="Thông tin cá nhân" />

                                        {showVerification ? (
                                            <div className="max-w-md mx-auto bg-white border border-stone-200 rounded-2xl p-6 md:p-8">
                                                <VerificationForm
                                                    role={formData.role}
                                                    loading={loading}
                                                    submitText="Xác nhận & Nâng cấp"
                                                    onBack={() => {
                                                        setShowVerification(false);
                                                        setFormData(prev => ({ ...prev, role: oldRole }));
                                                    }}
                                                    onSubmit={() => {
                                                        performUpdate(false);
                                                        setShowVerification(false);
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <form onSubmit={handleUpdateProfile} className="flex flex-col gap-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <Field label="Tên người dùng" required>
                                                        <input
                                                            type="text"
                                                            className={inputCls}
                                                            value={formData.full_name}
                                                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                                            placeholder="Nhập họ tên của bạn"
                                                            required
                                                        />
                                                    </Field>
                                                    <Field label="Email (Cố định)">
                                                        <input
                                                            type="text"
                                                            className={`${inputCls} bg-stone-50 text-stone-500 cursor-not-allowed`}
                                                            value={user?.email || ''}
                                                            disabled
                                                        />
                                                    </Field>
                                                    <Field label="Số điện thoại" required>
                                                        <input
                                                            type="tel"
                                                            className={inputCls}
                                                            value={formData.phone}
                                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                            placeholder="09xx xxx xxx"
                                                            required
                                                        />
                                                    </Field>
                                                </div>

                                                {oldRole !== 'admin' && formData.role !== 'admin' && (
                                                    <Field label="Vai trò của bạn">
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                            {[
                                                                { id: 'tenant', label: 'Người thuê' },
                                                                { id: 'landlord', label: 'Bên cho thuê' },
                                                            ].map((opt) => (
                                                                <button
                                                                    key={opt.id}
                                                                    type="button"
                                                                    onClick={() => setFormData({ ...formData, role: opt.id })}
                                                                    className={`py-3 rounded-lg border-2 font-bold text-sm cursor-pointer transition-all duration-200 ${formData.role === opt.id
                                                                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                                                                        : 'border-stone-100 bg-white text-stone-500 hover:bg-stone-50 hover:border-stone-200'
                                                                        }`}
                                                                >
                                                                    {opt.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </Field>
                                                )}

                                                <div className="pt-4 flex justify-end">
                                                    <button
                                                        type="submit"
                                                        disabled={loading}
                                                        className="bg-amber-500 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold px-10 py-3 rounded-full! cursor-pointer border-none transition-colors duration-200 shadow-md shadow-amber-200"
                                                    >
                                                        {loading ? 'Đang cập nhật...' : 'Lưu thay đổi'}
                                                    </button>
                                                </div>
                                            </form>
                                        )}
                                    </motion.div>
                                )}

                                {/* ---- TAB: FAVORITES ---- */}
                                {activeTab === 'favorites' && (
                                    <motion.div
                                        key="favorites"
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -15 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <TabHeader icon="heart" title="Tin đăng đã lưu" />
                                        <div className="mt-6">
                                            {loadingSaved || savedRooms.length > 0 ? (
                                                <RoomGrid
                                                    rooms={savedRooms}
                                                    isLoading={loadingSaved}
                                                    onRoomClick={(room) => navigate('room-detail', { ...room, fromProfile: true, originTab: 'favorites' })}
                                                />
                                            ) : (
                                                <div className="text-center py-20 bg-stone-50 border border-dashed border-stone-200 rounded-xl">
                                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-stone-300">
                                                        <AppIcon name="heart" size={32} />
                                                    </div>
                                                    <p className="text-stone-500 font-medium">Bạn chưa lưu tin đăng nào.</p>
                                                    <button
                                                        onClick={() => navigate('home')}
                                                        className="mt-4 bg-amber-500 text-white px-6 py-2 rounded-full! font-bold text-sm hover:bg-amber-600 cursor-pointer border-none"
                                                    >
                                                        Khám phá ngay
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {/* ---- TAB: COMMENTED ROOMS ---- */}
                                {activeTab === 'commented_rooms' && (
                                    <motion.div
                                        key="commented_rooms"
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -15 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <TabHeader icon="messages" title="Phòng đã bình luận" />
                                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {loadingCommented ? (
                                                <div className="col-span-full text-center py-12 text-stone-400">Đang tải dữ liệu...</div>
                                            ) : commentedRooms.length === 0 ? (
                                                <div className="col-span-full text-center py-20 bg-stone-50 border border-dashed border-stone-200 rounded-xl">
                                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-stone-300">
                                                        <AppIcon name="messages" size={32} />
                                                    </div>
                                                    <p className="text-stone-500 font-medium">Bạn chưa bình luận ở phòng nào</p>
                                                </div>
                                            ) : (
                                                commentedRooms.map(({ room, count }) => (
                                                    <div
                                                        key={room.id}
                                                        onClick={() => navigate('room-detail', { ...room, fromProfile: true, originTab: 'commented_rooms' })}
                                                        className="flex gap-4 p-3 border border-stone-100 rounded-xl hover:border-amber-300 hover:shadow-md transition-all cursor-pointer bg-white group"
                                                    >
                                                        {/* Thumbnail */}
                                                        <div className="w-24 h-24 rounded-lg bg-stone-100 overflow-hidden shrink-0 relative">
                                                            {room.media_contact?.images?.[0]?.url ? (
                                                                <img
                                                                    src={room.media_contact.images[0].url}
                                                                    alt={room.basic_info.title}
                                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                                    onError={(e) => { e.currentTarget.src = "/images/placeholder.png"; }}
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-stone-300">
                                                                    <AppIcon name="home" size={24} />
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Info */}
                                                        <div className="flex-1 flex flex-col justify-between min-w-0 py-1">
                                                            <div>
                                                                <h4 className="font-bold text-stone-900 text-[0.9rem] line-clamp-1 mb-1 group-hover:text-amber-600 transition-colors">
                                                                    {room.basic_info.title}
                                                                </h4>
                                                                <div className="flex items-center gap-1.5 text-stone-500 text-[0.75rem]">
                                                                    <AppIcon name="location" size={12} />
                                                                    <span className="truncate">{room.basic_info.district}</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center justify-between mt-auto">
                                                                <span className="font-bold text-amber-600 text-sm">
                                                                    {formatPrice(room.basic_info.price_monthly)}
                                                                </span>
                                                                <span className="inline-flex items-center gap-1 bg-stone-50 px-2 py-0.5 rounded-full text-[0.7rem] font-bold text-stone-400">
                                                                    <AppIcon name="messages" size={12} />
                                                                    {count}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </motion.div>
                                )}


                                {/* ---- TAB: PASSWORD ---- */}
                                {activeTab === 'password' && (
                                    <motion.div
                                        key="password"
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -15 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <TabHeader icon="lock" title="Đổi mật khẩu" />

                                        <form onSubmit={handleChangePassword} className="flex flex-col gap-6">
                                            <Field label="Mật khẩu cũ" required>
                                                <input
                                                    type="password"
                                                    className={inputCls}
                                                    value={passwordData.oldPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                                    placeholder="Nhập mật khẩu hiện tại"
                                                    required
                                                />
                                            </Field>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <Field label="Mật khẩu mới" required>
                                                    <input
                                                        type="password"
                                                        className={inputCls}
                                                        value={passwordData.newPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                        placeholder="••••••••"
                                                        required
                                                    />
                                                </Field>
                                                <Field label="Xác nhận mật khẩu mới" required>
                                                    <input
                                                        type="password"
                                                        className={inputCls}
                                                        value={passwordData.confirmPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                        placeholder="••••••••"
                                                        required
                                                    />
                                                </Field>
                                            </div>
                                            <div className="flex justify-end pt-2">
                                                <button
                                                    type="submit"
                                                    disabled={passwordLoading}
                                                    className="bg-amber-500 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold px-10 py-3 rounded-full! cursor-pointer border-none transition-colors duration-200 shadow-md shadow-amber-200"
                                                >
                                                    {passwordLoading ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
                                                </button>
                                            </div>
                                        </form>
                                    </motion.div>
                                )}

                                {/* ---- TAB: DANGER ---- */}
                                {activeTab === 'danger' && (
                                    <motion.div
                                        key="danger"
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -15 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <TabHeader icon="trash" title="Vùng nguy hiểm" danger />

                                        <div className="p-6 bg-red-50 border border-red-100 rounded-2xl">
                                            <div className="flex items-center gap-3 mb-4 text-red-700">
                                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                                    <AppIcon name="alert" size={20} />
                                                </div>
                                                <h3 className="text-lg font-bold">Xóa tài khoản vĩnh viễn</h3>
                                            </div>
                                            <p className="text-sm text-stone-600 mb-6 leading-relaxed">
                                                Khi bạn xóa tài khoản, mọi dữ liệu liên quan bao gồm các tin đăng phòng, tin nhắn và lịch sử giao dịch sẽ bị xóa vĩnh viễn. Thao tác này <b>không thể hoàn tác</b>.
                                            </p>

                                            <Field label="Nhập mật khẩu của bạn để xác nhận" required>
                                                <input
                                                    type="password"
                                                    className={`${inputCls} border-red-200 focus:border-red-400`}
                                                    value={deletePassword}
                                                    onChange={(e) => setDeletePassword(e.target.value)}
                                                    placeholder="Mật khẩu của bạn"
                                                    required
                                                />
                                            </Field>

                                            <button
                                                onClick={handleDeleteAccount}
                                                disabled={!deletePassword || loading}
                                                className="mt-6 w-full sm:w-auto bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold py-3 px-10 rounded-full! cursor-pointer border-none transition-colors duration-200"
                                            >
                                                {loading ? 'Đang xử lý...' : 'Xác nhận xóa tài khoản'}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </main>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ---- Sub-components ---- */
function TabHeader({ icon, title, danger = false }) {
    return (
        <div className="flex items-center gap-3 mb-6">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${danger ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                <AppIcon name={icon} size={18} />
            </div>
            <h2
                className="text-lg font-bold text-stone-900"
                style={{ fontFamily: 'var(--font-heading)' }}
            >
                {title}
            </h2>
        </div>
    );
}

function Field({ label, children, required = false }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-stone-700">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {children}
        </div>
    );
}
