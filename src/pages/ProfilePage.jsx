import { useState, useEffect } from 'react';
import { useModal } from '../context/ModalContext';
import { useNotification } from '../context/NotificationContext';
import { supabase } from '../lib/supabase';
import AppIcon from '../components/common/AppIcon.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { mapSupabaseRoom } from '../utils/roomMapper.js';
import { formatPrice } from '../utils/formatters.js';
import RoomGrid from '../components/rooms/RoomGrid.jsx';
import { compressImage } from '../utils/imageUtils';


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


    // Fetch latest profile from database
    const fetchProfile = async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

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
    };

    // Sync formData when user prop is available or changes
    useEffect(() => {
        if (user) {
            // Initial sync from auth metadata
            setFormData({
                full_name: user.user_metadata?.full_name || '',
                role: user.user_metadata?.role || 'tenant',
                avatar_url: user.user_metadata?.avatar_url || '',
                phone: user.user_metadata?.phone || '',
            });
            // Fetch fresh data from profiles table
            fetchProfile();
        }
    }, [user]);

    useEffect(() => {
        // Always sync activeTab with initialData, defaulting to 'info' if not specified
        setActiveTab(initialData?.tab || 'info');
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
                    const { data, error } = await supabase
                        .from('rooms')
                        .select('*, profiles(*)')
                        .in('id', favorites);

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
            setSavedRooms([]);
        }
    }, [activeTab, favorites]);

    useEffect(() => {
        if (activeTab === 'commented_rooms' && user) {
            const fetchCommentedRooms = async () => {
                setLoadingCommented(true);
                try {
                    const { data, error } = await supabase
                        .from('comments')
                        .select('*, rooms(*, profiles(*))')
                        .eq('user_id', user.id)
                        .order('created_at', { ascending: false });

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
                await supabase.auth.signOut();
                navigate('home');
            }
        });
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: { full_name: formData.full_name, role: formData.role }
            });
            if (error) throw error;

            const { error: profileError } = await supabase
                .from('profiles')
                .update({ full_name: formData.full_name, phone: formData.phone, role: formData.role })
                .eq('id', user.id);
            if (profileError) throw profileError;

            addNotification('Cập nhật thông tin thành công!', 'success');
        } catch (err) {
            addNotification(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!user) {
            addNotification('Bạn cần đăng nhập để thực hiện thao tác này.', 'error');
            return;
        }
        setUploading(true);
        const oldAvatarUrl = formData.avatar_url;

        try {
            // 1. Nén ảnh avatar trước khi upload (giới hạn 400px cho avatar nét)
            const compressedFile = await compressImage(file, 400, 0.8);

            const fileExt = compressedFile.name.split('.').pop();
            const filePath = `${user.id}/${Date.now()}.${fileExt}`;

            // 2. Upload file đã nén
            const { error: uploadError } = await supabase.storage
                .from('user_avatar')
                .upload(filePath, compressedFile, { upsert: true });
            if (uploadError) throw uploadError;

            // 3. Lấy Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('user_avatar')
                .getPublicUrl(filePath);

            // 4. Cập nhật Auth metadata
            const { error: updateError } = await supabase.auth.updateUser({
                data: { avatar_url: publicUrl }
            });
            if (updateError) throw updateError;

            // 5. Cập nhật bảng profiles
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', user.id);
            if (profileError) throw profileError;

            // 6. Cập nhật state
            setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
            addNotification('Cập nhật ảnh đại diện thành công!', 'success');

            // 7. Xóa ảnh cũ trên storage nếu có để tránh rác dữ liệu
            // Chỉ xóa nếu ảnh cũ thuộc về bucket user_avatar và thuộc về user này
            if (oldAvatarUrl) {
                const urlParts = oldAvatarUrl.split('/user_avatar/');
                if (urlParts.length > 1) {
                    const oldPath = urlParts[1].split('?')[0];
                    if (oldPath.startsWith(`${user.id}/`)) {
                        const { error: removeError } = await supabase.storage
                            .from('user_avatar')
                            .remove([oldPath]);
                        
                        if (removeError) {
                            console.error('Lỗi khi xóa ảnh cũ từ storage:', removeError);
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
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: passwordData.oldPassword,
            });
            if (signInError) throw new Error('Mật khẩu cũ không chính xác.');

            const { error } = await supabase.auth.updateUser({ password: passwordData.newPassword });
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
                    const { error: authError } = await supabase.auth.signInWithPassword({
                        email: user.email,
                        password: deletePassword,
                    });
                    if (authError) throw new Error('Mật khẩu xác nhận không chính xác.');

                    const { error } = await supabase.rpc('delete_user_account');
                    if (error) throw error;

                    await supabase.auth.signOut();
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

                <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] items-stretch">

                        {/* Sidebar */}
                        <aside className="lg:border-r border-stone-100 bg-stone-50/30">
                            <div className="p-8 text-center border-b border-stone-100">
                                {/* Avatar */}
                                <div
                                    className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-4xl font-extrabold relative overflow-hidden bg-amber-500 shadow-sm"
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
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                                <circle cx="12" cy="13" r="4" />
                                            </svg>
                                        )}
                                    </label>
                                </div>

                                <h3 className="text-lg font-bold text-stone-900 mb-0.5">
                                    {formData.full_name || 'Người dùng'}
                                </h3>
                                <p className="text-sm text-stone-400 truncate px-2">{user?.email}</p>
                            </div>

                            <div className="flex flex-col py-4">
                                {TAB_GROUPS.map((group) => {
                                    // Use the actual role from user metadata, not the unsaved formData
                                    const currentRole = user?.user_metadata?.role || 'tenant';
                                    if (group.condition && !group.condition(currentRole)) return null;
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

                            <div className="mt-auto p-6 border-t border-stone-100">
                                {/* Logout */}
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full! border border-red-100 bg-red-50 text-red-600 text-sm font-bold cursor-pointer transition-colors duration-200 hover:bg-red-100"
                                >
                                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                        <polyline points="16 17 21 12 16 7" />
                                        <line x1="21" y1="12" x2="9" y2="12" />
                                    </svg>
                                    Đăng xuất
                                </button>
                            </div>
                        </aside>

                        {/* Content panel */}
                        <main className="p-6 md:p-10 min-h-[500px] bg-white">


                            {/* ---- TAB: INFO ---- */}
                            {activeTab === 'info' && (
                                <div className="animate-fade-in">
                                    <TabHeader icon="user" title="Thông tin cá nhân" />

                                    <form onSubmit={handleUpdateProfile} className="flex flex-col gap-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Field label="Tên người dùng">
                                                <input
                                                    type="text"
                                                    className={inputCls}
                                                    value={formData.full_name}
                                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                                    placeholder="Nhập họ tên của bạn"
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
                                            <Field label="Số điện thoại">
                                                <input
                                                    type="tel"
                                                    className={inputCls}
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    placeholder="09xx xxx xxx"
                                                />
                                            </Field>
                                        </div>

                                        <Field label="Vai trò của bạn">
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                {[
                                                    { id: 'tenant', label: 'Người thuê' },
                                                    { id: 'agent', label: 'Môi giới' },
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
                                </div>
                            )}

                            {/* ---- TAB: FAVORITES ---- */}
                            {activeTab === 'favorites' && (
                                <div className="animate-fade-in">
                                    <TabHeader icon="heart" title="Tin đăng đã lưu" />
                                    <div className="mt-6">
                                        {loadingSaved || savedRooms.length > 0 ? (
                                            <RoomGrid
                                                rooms={savedRooms}
                                                isLoading={loadingSaved}
                                                onRoomClick={(room) => navigate('room-detail', { ...room, fromProfile: true })}
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
                                </div>
                            )}

                            {/* ---- TAB: COMMENTED ROOMS ---- */}
                            {activeTab === 'commented_rooms' && (
                                <div className="animate-fade-in">
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
                                                    onClick={() => navigate('room-detail', { ...room, fromProfile: true })}
                                                    className="flex gap-4 p-3 border border-stone-100 rounded-xl hover:border-amber-300 hover:shadow-md transition-all cursor-pointer bg-white group"
                                                >
                                                    {/* Thumbnail */}
                                                    <div className="w-24 h-24 rounded-lg bg-stone-100 overflow-hidden shrink-0 relative">
                                                        {room.media_contact?.images?.[0]?.url ? (
                                                            <img
                                                                src={room.media_contact.images[0].url}
                                                                alt={room.basic_info.title}
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
                                </div>
                            )}


                            {/* ---- TAB: PASSWORD ---- */}
                            {activeTab === 'password' && (
                                <div className="animate-fade-in">
                                    <TabHeader icon="lock" title="Đổi mật khẩu" />

                                    <form onSubmit={handleChangePassword} className="flex flex-col gap-6">
                                        <Field label="Mật khẩu cũ">
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
                                            <Field label="Mật khẩu mới">
                                                <input
                                                    type="password"
                                                    className={inputCls}
                                                    value={passwordData.newPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                    placeholder="••••••••"
                                                    required
                                                />
                                            </Field>
                                            <Field label="Xác nhận mật khẩu mới">
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
                                </div>
                            )}

                            {/* ---- TAB: DANGER ---- */}
                            {activeTab === 'danger' && (
                                <div className="animate-fade-in">
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

                                        <Field label="Nhập mật khẩu của bạn để xác nhận">
                                            <input
                                                type="password"
                                                className={`${inputCls} border-red-200 focus:border-red-400`}
                                                value={deletePassword}
                                                onChange={(e) => setDeletePassword(e.target.value)}
                                                placeholder="Mật khẩu của bạn"
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
                                </div>
                            )}
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

function Field({ label, children }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-stone-700">{label}</label>
            {children}
        </div>
    );
}
