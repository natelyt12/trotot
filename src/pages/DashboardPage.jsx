import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppIcon from '../components/common/AppIcon.jsx';
import RoomPostForm from '../components/dashboard/RoomPostForm.jsx';
import ManageRoomsTab from '../components/dashboard/ManageRoomsTab.jsx';
import RoomDetailPage from './RoomDetailPage.jsx';
import { useDashboard } from '../hooks/useDashboard.js';

export default function DashboardPage({ user, navigate, initialData }) {
    const {
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
        renewingRoom,
        setRenewingRoom,
        handleRenewRoom,
        executeRenewal
    } = useDashboard(user, initialData);

    const TAB_GROUPS = [
        {
            label: 'Quản lý',
            tabs: [
                { id: 'manage_rooms', label: 'Quản lý tin đăng', icon: 'check-square' },
                { id: 'post_room', label: 'Đăng / Sửa tin', icon: 'edit' },
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

                <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] items-stretch min-h-[500px]">

                        {/* Sidebar */}
                        <aside className="lg:border-r border-stone-100 bg-stone-50/30 p-6 flex flex-col justify-between">
                            <div className="space-y-6">
                                {TAB_GROUPS.map((group) => (
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
                                                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left font-bold text-sm border-none cursor-pointer transition-all duration-200 ${
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
                                ))}
                            </div>
                        </aside>

                        {/* Content panel */}
                        <main className="p-6 md:p-10 bg-white min-w-0">
                            <AnimatePresence mode="wait">
                                
                                {/* ---- TAB: MANAGE ROOMS ---- */}
                                {activeTab === 'manage_rooms' && (
                                    <motion.div
                                        key="manage_rooms"
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -15 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <ManageRoomsTab
                                            rooms={rooms}
                                            loadingRooms={loadingRooms}
                                            currentPage={currentPage}
                                            setCurrentPage={setCurrentPage}
                                            subTab={subTab}
                                            setSubTab={setSubTab}
                                            handlePublishFromDraft={handlePublishFromDraft}
                                            handleUnpublish={handleUnpublish}
                                            handleMockVerify={handleMockVerify}
                                            handleDeleteRoom={handleDeleteRoom}
                                            handleDuplicateRoom={handleDuplicateRoom}
                                            setPreviewRoom={setPreviewRoom}
                                            setEditingRoom={setEditingRoom}
                                            setIsCreating={setIsCreating}
                                            setActiveTab={setActiveTab}
                                            handleRenewRoom={handleRenewRoom}
                                        />
                                    </motion.div>
                                )}

                                {/* ---- TAB: POST ROOM (FLEXIBLE EDIT) ---- */}
                                {activeTab === 'post_room' && (
                                    <motion.div
                                        key="post_room"
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -15 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {!editingRoom && !isCreating ? (
                                            <div className="flex flex-col items-center justify-center py-20 bg-stone-50 border border-dashed border-stone-200 rounded-xl text-center">
                                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-stone-300">
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
                                    </motion.div>
                                )}

                            </AnimatePresence>
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
            <AnimatePresence>
                {renewingRoom && (
                    <RenewPostModal
                        room={renewingRoom}
                        onClose={() => setRenewingRoom(null)}
                        onConfirm={(days) => executeRenewal(renewingRoom, days)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

/* ============================================
   RenewPostModal Component - Premium design
   ============================================ */
function RenewPostModal({ room, onClose, onConfirm }) {
    const [selectedDays, setSelectedDays] = useState(15);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const RENEW_OPTIONS = [
        { days: 7, label: '7 Ngày', price: 'Miễn phí' },
        { days: 15, label: '15 Ngày', price: 'Miễn phí', popular: true },
        { days: 30, label: '30 Ngày', price: 'Miễn phí' }
    ];

    const getNewExpiryDate = () => {
        const date = new Date();
        date.setDate(date.getDate() + selectedDays);
        return date.toLocaleDateString('vi-VN');
    };

    const handleConfirm = async () => {
        setIsSubmitting(true);
        await onConfirm(selectedDays);
        setIsSubmitting(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs"
            />

            {/* Modal Body */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md border border-stone-100 p-6 md:p-8 overflow-hidden z-10"
            >
                <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-6">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                            <AppIcon name="calendar" size={18} />
                        </div>
                        <h3 className="text-lg font-bold text-stone-900 font-heading">Gia hạn tin đăng</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-stone-400 hover:text-stone-600 transition-colors border-none bg-transparent cursor-pointer p-1"
                    >
                        <AppIcon name="plus" size={18} className="rotate-45" />
                    </button>
                </div>

                <div className="space-y-4 mb-6">
                    <p className="text-sm text-stone-600 leading-relaxed">
                        Bạn đang gia hạn hiển thị cho tin trọ: <br />
                        <span className="font-bold text-stone-900">"{room.title}"</span>
                    </p>

                    <div>
                        <label className="block text-[0.7rem] font-bold text-stone-400 uppercase tracking-wider mb-2.5">Chọn gói gia hạn hiển thị</label>
                        <div className="grid grid-cols-3 gap-3">
                            {RENEW_OPTIONS.map((opt) => (
                                <button
                                    key={opt.days}
                                    type="button"
                                    onClick={() => setSelectedDays(opt.days)}
                                    className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer ${
                                        selectedDays === opt.days
                                            ? 'border-amber-500 bg-amber-50/50 text-amber-900'
                                            : 'border-stone-200 hover:border-stone-300 bg-white text-stone-600'
                                    }`}
                                >
                                    {opt.popular && (
                                        <span className="absolute -top-2.5 bg-amber-500 text-white text-[0.55rem] font-bold px-1.5 py-0.5 rounded-full border border-white shadow-xs">
                                            Phổ biến
                                        </span>
                                    )}
                                    <span className="text-sm font-black tracking-tight">{opt.label}</span>
                                    <span className="text-[0.65rem] text-stone-400 font-medium mt-1 uppercase">{opt.price}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-stone-50 border border-stone-100 rounded-xl p-4 space-y-2">
                        <div className="flex justify-between text-xs text-stone-500">
                            <span>Thời hạn mới:</span>
                            <span className="font-bold text-stone-800">{getNewExpiryDate()}</span>
                        </div>
                        <div className="flex justify-between text-xs text-stone-500">
                            <span>Trạng thái sau gia hạn:</span>
                            <span className="font-bold text-green-600 uppercase">Hoạt động (Còn phòng)</span>
                        </div>
                    </div>

                    <div className="flex items-start gap-2 text-stone-500 text-[0.7rem] leading-relaxed bg-amber-50/40 p-3 rounded-lg border border-amber-100/50">
                        <AppIcon name="verified" size={14} className="text-amber-600 shrink-0 mt-0.5" />
                        <span>💡 Lưu ý: Hệ thống hỗ trợ gia hạn hoàn toàn miễn phí. Tin đăng của bạn sẽ lập tức hiển thị công khai trở lại trên trang chủ.</span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-3 border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors font-bold text-sm rounded-xl cursor-pointer bg-white"
                    >
                        Hủy
                    </button>
                    <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={handleConfirm}
                        className="flex-1 py-3 bg-amber-500 text-white hover:bg-amber-600 transition-colors font-bold text-sm rounded-xl cursor-pointer border-none shadow-lg shadow-amber-500/25 flex items-center justify-center gap-1.5"
                    >
                        {isSubmitting ? 'Đang xử lý...' : 'Xác nhận gia hạn'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
