import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Breadcrumb from '../components/common/Breadcrumb';

/* ============================================
   ProfilePage – Account Manager Overlay
   - Full screen layout consistent with RoomDetailPage
   - Profile editing & logout
   ============================================ */
export default function ProfilePage({ user, navigate, isClosing }) {
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Form state initialized with user metadata
    const [formData, setFormData] = useState({
        full_name: user?.user_metadata?.full_name || '',
        role: user?.user_metadata?.role || 'tenant',
        avatar_url: user?.user_metadata?.avatar_url || '',
    });


    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('home');
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const { error } = await supabase.auth.updateUser({
                data: {
                    full_name: formData.full_name,
                    role: formData.role
                }
            });

            if (error) throw error;

            // Also update public.profiles table
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    full_name: formData.full_name,
                    role: formData.role
                })
                .eq('id', user.id);

            if (profileError) throw profileError;

            setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setMessage({ type: '', text: '' });

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`;

            // 1. Upload to Supabase Storage (Bucket name: 'user_avatar')
            const { error: uploadError } = await supabase.storage
                .from('user_avatar')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('user_avatar')
                .getPublicUrl(filePath);

            // 3. Update Auth Metadata
            const { error: updateError } = await supabase.auth.updateUser({
                data: { avatar_url: publicUrl }
            });

            if (updateError) throw updateError;

            // 4. Update Profile Table
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', user.id);

            if (profileError) throw profileError;

            setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
            setMessage({ type: 'success', text: 'Cập nhật ảnh đại diện thành công!' });
        } catch (err) {
            setMessage({ type: 'error', text: `Lỗi tải ảnh: ${err.message}` });
        } finally {
            setUploading(false);
        }
    };


    // Close animation classes
    // Note: isClosing and animationClass were unused in the previous version

    return (
        <div className="w-full min-h-full bg-stone-50 pb-20">
            <div className="max-w-[1200px] mx-auto p-8 pt-[100px] relative">

                {/* Breadcrumb */}
                <Breadcrumb
                    navigate={navigate}
                    paths={[
                        { label: 'Trang chủ', page: 'home' },
                        { label: 'Thông tin tài khoản' }
                    ]}
                />

                {/* Navigation / Header */}
                <div className="flex items-center my-6">
                    <h2 className="text-2xl font-extrabold text-stone-900" style={{ fontFamily: 'var(--font-heading)' }}>
                        Thiết lập tài khoản
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6 md:gap-12 items-start">
                    {/* Sidebar Area */}
                    <aside className="md:sticky md:top-[100px]">
                        <div className="bg-white p-8 md:px-8 md:py-10 rounded-lg border border-stone-200 shadow-[0_4px_25px_rgba(0,0,0,0.03)] text-center mb-6">
                            <div
                                className="w-[110px] h-[110px] rounded-full mx-auto mb-6 flex items-center justify-center text-white text-[2.75rem] font-extrabold relative overflow-hidden"
                                style={{
                                    background: formData.avatar_url
                                        ? `url(${formData.avatar_url}) center/cover`
                                        : 'linear-gradient(135deg, #f59e0b, #d97706)'
                                }}
                            >
                                {!formData.avatar_url && (formData.full_name || 'U').charAt(0).toUpperCase()}

                                {/* Overlay Upload Button */}
                                <label
                                    className={`absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer transition-opacity duration-200 text-white text-[0.75rem] font-semibold ${uploading ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`}
                                >
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarUpload}
                                        disabled={uploading}
                                        className="hidden"
                                    />
                                    {uploading ? '...' : (
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                                    )}
                                </label>
                            </div>

                            <h3 className="text-[1.35rem] font-bold text-stone-900 mb-1">
                                {formData.full_name || 'Người dùng'}
                            </h3>
                            <p className="text-[0.9rem] text-stone-500 mb-8">{user?.email}</p>

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2.5 p-3.5 rounded-md! border border-red-200 bg-rose-50 text-rose-600 font-bold cursor-pointer transition-all duration-200 hover:bg-rose-100 hover:-translate-y-0.5"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                                Đăng xuất
                            </button>
                        </div>

                    </aside>

                    {/* Content Area */}
                    <main className="bg-white p-6 md:p-12 rounded-lg border border-stone-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">

                        <h1 className="text-[1.75rem] font-extrabold text-stone-900 mb-3 tracking-tight">
                            Hồ sơ của bạn
                        </h1>
                        <p className="text-stone-500 mb-10">Cập nhật thông tin cá nhân để mọi người có thể nhận ra bạn.</p>

                        {message.text && (
                            <div className={`p-4 md:px-5 rounded-2xl mb-8 text-[0.95rem] font-medium flex items-center gap-2 border ${message.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
                                {message.type === 'success' ? (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                                ) : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                )}
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleUpdateProfile} className="flex flex-col gap-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                <div>
                                    <label className="form-label mb-2.5 block">Họ và tên</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        placeholder="Nhập họ tên của bạn"
                                    />
                                </div>
                                <div>
                                    <label className="form-label mb-2.5 block">Email (Không thể thay đổi)</label>
                                    <input
                                        type="text"
                                        className="input bg-stone-100 cursor-not-allowed"
                                        value={user?.email}
                                        disabled
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="form-label mb-2.5 block">Bạn là ai trên TrọTốt?</label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                                    {[
                                        { id: 'tenant', label: 'Người thuê' },
                                        { id: 'agent', label: 'Môi giới' },
                                        { id: 'landlord', label: 'Chủ nhà' }
                                    ].map((option) => (
                                        <button
                                            key={option.id}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, role: option.id })}
                                            className={`p-4 rounded-md! border-2 font-bold text-[0.9rem] cursor-pointer transition-all duration-200 ${formData.role === option.id ? 'border-amber-600 bg-amber-50 text-amber-600' : 'border-stone-200 bg-white text-stone-600'}`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-4 flex justify-end">
                                <button
                                    type="submit"
                                    className={`btn-primary rounded-md! w-full md:w-auto px-10 py-3.5 text-base ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    disabled={loading}
                                >
                                    {loading ? 'Đang cập nhật...' : 'Lưu thay đổi'}
                                </button>
                            </div>

                        </form>

                        <div className="mt-16 pt-10 border-t border-stone-100">
                            <h3 className="text-[1.1rem] font-extrabold text-red-900 mb-2">Vùng nguy hiểm</h3>
                            <p className="text-[0.9rem] text-stone-500 mb-6">Nếu bạn không còn nhu cầu sử dụng, bạn có thể xóa tài khoản. Thao tác này không thể hoàn tác.</p>
                            <button
                                className="w-full md:w-auto bg-transparent border border-red-200 text-red-600 py-3.5 px-6 rounded-md! text-[0.9rem] font-bold cursor-pointer transition-all duration-200 hover:bg-red-50"
                                onClick={() => alert('Tính năng đang phát triển')}
                            >
                                Xóa tài khoản vĩnh viễn
                            </button>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
