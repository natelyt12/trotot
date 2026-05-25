import React from 'react';
import AppIcon from '../common/AppIcon.jsx';
import { formatPrice } from '../../utils/formatters.js';
import { mapSupabaseRoom } from '../../utils/roomMapper.js';

export default function ManageRoomsTab({
    rooms,
    loadingRooms,
    currentPage,
    setCurrentPage,
    subTab,
    setSubTab,
    handlePublishFromDraft,
    handleUnpublish,
    handleDeleteRoom,
    handleDuplicateRoom,
    setPreviewRoom,
    setEditingRoom,
    setIsCreating,
    setActiveTab,
    handleRenewRoom,
    onRefresh
}) {
    const ITEMS_PER_PAGE = 10;

    const filteredRooms = rooms.filter(room => {
        const isExpired = room.status === 'expired';
        
        if (subTab === 'expired') {
            return isExpired;
        }
        
        // Exclude expired rooms from active/draft tabs
        if (isExpired) return false;

        if (subTab === 'draft') {
            return room.status === 'draft' || room.status === 'hidden';
        }
        if (subTab === 'verified') {
            return room.status === 'available' && room.is_verified;
        }
        if (subTab === 'pending_verification') {
            return room.status === 'pending';
        }
        if (subTab === 'published') {
            // Tất cả phòng đã công khai (cả verified và chưa xác thực)
            return room.status === 'available';
        }
        // default to published available
        return room.status === 'available';
    });

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
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
                {onRefresh && (
                    <button
                        onClick={onRefresh}
                        disabled={loadingRooms}
                        title="Làm mới dữ liệu"
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-stone-200 rounded-full text-[0.75rem] font-bold text-stone-500 hover:bg-stone-50 hover:text-stone-800 cursor-pointer transition-colors disabled:opacity-50"
                    >
                        <AppIcon name="refresh" size={13} className={loadingRooms ? 'animate-spin' : ''} />
                        <span>Làm mới</span>
                    </button>
                )}
            </div>
            
            <div className="flex border-b border-stone-200 mb-6 overflow-x-auto whitespace-nowrap">
                <button
                    onClick={() => { setSubTab('verified'); setCurrentPage(1); }}
                    className={`flex-shrink-0 px-4 py-2 text-sm font-bold border-b-2 transition-colors cursor-pointer ${subTab === 'verified' ? 'border-amber-500 text-amber-600' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
                >
                    Tin đã xác thực
                </button>
                <button
                    onClick={() => { setSubTab('published'); setCurrentPage(1); }}
                    className={`flex-shrink-0 px-4 py-2 text-sm font-bold border-b-2 transition-colors cursor-pointer ${subTab === 'published' ? 'border-amber-500 text-amber-600' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
                >
                    Tin đã công khai
                </button>
                <button
                    onClick={() => { setSubTab('pending_verification'); setCurrentPage(1); }}
                    className={`flex-shrink-0 px-4 py-2 text-sm font-bold border-b-2 transition-colors cursor-pointer ${subTab === 'pending_verification' ? 'border-amber-500 text-amber-600' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
                >
                    Tin đang chờ duyệt
                </button>
                <button
                    onClick={() => { setSubTab('expired'); setCurrentPage(1); }}
                    className={`flex-shrink-0 px-4 py-2 text-sm font-bold border-b-2 transition-colors cursor-pointer ${subTab === 'expired' ? 'border-amber-500 text-amber-600' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
                >
                    Tin hết hạn
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
                if (filteredRooms.length === 0) {
                    return (
                        <div className="flex flex-col items-center justify-center py-20 bg-stone-50 border border-dashed border-stone-200 rounded-xl text-center">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 text-stone-300">
                                <AppIcon name="home" size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-stone-900 mb-2">
                                {subTab === 'draft' ? 'Bạn chưa có bản nháp nào' :
                                    subTab === 'verified' ? 'Bạn chưa có tin nào được xác thực' :
                                        subTab === 'pending_verification' ? 'Không có tin đang chờ duyệt' :
                                            subTab === 'published' ? 'Bạn chưa có tin đăng nào được công khai' :
                                                subTab === 'expired' ? 'Bạn không có tin đăng nào đã hết hạn' :
                                                    'Bạn chưa có tin đăng nào được công khai'}
                            </h3>
                            <p className="text-stone-500 text-sm max-w-sm px-6 mb-6">
                                {subTab === 'draft' ? 'Các bản nháp sẽ xuất hiện ở đây khi bạn lưu tin.' :
                                    subTab === 'verified' ? 'Tin đăng của bạn sau khi được xác thực sẽ xuất hiện ở đây.' :
                                        subTab === 'pending_verification' ? 'Tất cả tin đăng của bạn đã được duyệt hoặc không có tin nào đang chờ.' :
                                            subTab === 'published' ? 'Tin đăng công khai sẽ hiển thị tại đây khi bạn gửi bài.' :
                                                subTab === 'expired' ? 'Tuyệt vời! Tất cả các tin đăng của bạn đều hoạt động hoặc được lưu nháp.' :
                                                    'Bắt đầu tiếp cận khách hàng tiềm năng bằng cách đăng tin cho thuê phòng của bạn.'}
                            </p>
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
                        </div>
                    );
                }

                return (
                    <div className="space-y-4">
                        {filteredRooms.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((room) => {
                            const isExpired = room.status === 'expired';
                            return (
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
                                                onError={(e) => { e.currentTarget.src = "/images/placeholder.png"; }}
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
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.65rem] font-bold uppercase ${isExpired ? 'bg-red-50 text-red-600' :
                                            room.status === 'available' ? (
                                                room.is_verified ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600 border border-blue-100'
                                            ) :
                                                room.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                    room.status === 'hidden' ? 'bg-stone-50 text-stone-500' :
                                                        'bg-stone-50 text-stone-500'
                                            }`}>
                                            {isExpired ? 'Hết hạn' :
                                                room.status === 'available' ? (
                                                    room.is_verified ? 'Đã xác thực' : 'Công khai'
                                                ) :
                                                    room.status === 'pending' ? 'Chờ duyệt công khai' :
                                                        room.status === 'hidden' ? 'Đã ẩn' :
                                                            room.status === 'draft' ? 'Bản nháp' :
                                                                room.status}
                                        </span>
                                    </div>

                                    {/* Buttons bên phải */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        {isExpired && (
                                            <button
                                                onClick={() => handleRenewRoom(room)}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 border border-amber-500 rounded-full text-[0.75rem] font-bold text-white hover:bg-amber-600 cursor-pointer transition-colors shadow-sm"
                                            >
                                                <AppIcon name="edit" size={12} />
                                                Gia hạn tin đăng
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setPreviewRoom(mapSupabaseRoom(room))}
                                            className="flex items-center gap-1 px-3 py-1.5 border border-stone-200 rounded-full text-[0.75rem] font-bold text-stone-600 hover:bg-stone-50 hover:text-stone-900 cursor-pointer transition-colors"
                                        >
                                            <AppIcon name="eye" size={12} />
                                            Xem trước
                                        </button>

                                        {subTab === 'pending_verification' ? (
                                            <button
                                                onClick={() => handleUnpublish(room)}
                                                className="flex items-center gap-1 px-3 py-1.5 border border-amber-200 bg-amber-50 rounded-full text-[0.75rem] font-bold text-amber-600 hover:bg-amber-100 cursor-pointer transition-colors"
                                            >
                                                <AppIcon name="eye-off" size={12} />
                                                Hủy duyệt
                                            </button>
                                        ) : subTab === 'verified' || subTab === 'published' ? (
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
                                                    onClick={() => handleDuplicateRoom(room)}
                                                    className="flex items-center gap-1 px-3 py-1.5 border border-amber-200 bg-amber-50 rounded-full text-[0.75rem] font-bold text-amber-600 hover:bg-amber-100 cursor-pointer transition-colors"
                                                >
                                                    <AppIcon name="copy" size={12} />
                                                    Nhân bản
                                                </button>
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

                                        {subTab === 'expired' && (
                                            <button
                                                onClick={() => handleDeleteRoom(room)}
                                                className="flex items-center gap-1 px-3 py-1.5 border border-red-100 bg-red-50 rounded-full text-[0.75rem] font-bold text-red-600 hover:bg-red-100 cursor-pointer transition-colors"
                                            >
                                                <AppIcon name="trash" size={12} />
                                                Xóa
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

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
    );
}
