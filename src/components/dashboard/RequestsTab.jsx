import React, { useState, useEffect } from 'react';
import { getBookingsForLandlord, updateBookingStatus, approveRoomBookingRPC } from '../../services/bookingService';
import { getRoomRequestsForLandlord, updateRoomRequestStatus } from '../../services/forumService';
import { approveRoomTransferRPC, approveRoommateRequest } from '../../services/rentedRoomService';
import { useModal } from '../../context/ModalContext';
import { useNotification } from '../../context/NotificationContext';
import AppIcon from '../common/AppIcon';

export default function RequestsTab({ user }) {
    const { showModal } = useModal();
    const { addNotification } = useNotification();
    
    const [activeSubTab, setActiveSubTab] = useState('bookings'); // bookings, transfers
    
    const [bookings, setBookings] = useState([]);
    const [transfers, setTransfers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.id) fetchData();
    }, [user?.id]);

    const fetchData = async () => {
        setLoading(true);
        const [bookingsRes, transfersRes] = await Promise.all([
            getBookingsForLandlord(user.id),
            getRoomRequestsForLandlord(user.id)
        ]);
        
        if (bookingsRes.data) setBookings(bookingsRes.data);
        if (transfersRes.data) setTransfers(transfersRes.data);
        setLoading(false);
    };

    const handleApproveBooking = (booking) => {
        showModal({
            title: 'Duyệt yêu cầu đặt lịch',
            message: `Bạn muốn duyệt lịch hẹn xem phòng "${booking.rooms?.title}" của ${booking.requester?.full_name}?\nPhòng sẽ được chuyển trạng thái sang đã có người thuê bởi người này.`,
            type: 'info',
            confirmText: 'Đồng ý',
            cancelText: 'Hủy',
            onConfirm: async () => {
                try {
                    const { error } = await approveRoomBookingRPC(booking.id, booking.room_id, booking.requester_id);
                    if (error) throw error;
                    addNotification('Đã duyệt yêu cầu đặt lịch thành công!', 'success');
                    fetchData();
                } catch (err) {
                    addNotification('Có lỗi xảy ra khi duyệt yêu cầu.', 'error');
                }
            }
        });
    };

    const handleRejectBooking = (booking) => {
        showModal({
            title: 'Từ chối yêu cầu',
            message: 'Bạn có muốn từ chối yêu cầu đặt lịch này không?',
            type: 'warning',
            confirmText: 'Từ chối',
            cancelText: 'Hủy',
            onConfirm: async () => {
                try {
                    const { error } = await updateBookingStatus(booking.id, 'rejected');
                    if (error) throw error;
                    addNotification('Đã từ chối yêu cầu.', 'info');
                    fetchData();
                } catch (err) {
                    addNotification('Lỗi khi từ chối yêu cầu.', 'error');
                }
            }
        });
    };

    const handleApproveTransfer = (request) => {
        const isRoommate = request.type === 'roommate';
        showModal({
            title: isRoommate ? 'Duyệt yêu cầu ở ghép' : 'Duyệt yêu cầu chuyển nhượng',
            message: isRoommate 
                ? `Bạn muốn duyệt cho ${request.requester?.full_name} vào ở ghép phòng "${request.post?.rooms?.title}" cùng với ${request.post?.tenant?.full_name}?` 
                : `Bạn muốn chuyển phòng "${request.post?.rooms?.title}" từ ${request.post?.tenant?.full_name} sang ${request.requester?.full_name}?`,
            type: 'info',
            confirmText: 'Đồng ý',
            cancelText: 'Hủy',
            onConfirm: async () => {
                try {
                    if (isRoommate) {
                        const { error } = await approveRoommateRequest(
                            request.id,
                            request.post_id,
                            request.post?.room_id,
                            request.requester_id
                        );
                        if (error) throw error;
                        addNotification('Đã duyệt yêu cầu ở ghép thành công!', 'success');
                    } else {
                        const { error } = await approveRoomTransferRPC(
                            request.id,
                            request.post_id,
                            request.post?.room_id,
                            request.post?.user_id,
                            request.requester_id
                        );
                        if (error) throw error;
                        addNotification('Đã duyệt yêu cầu chuyển nhượng thành công!', 'success');
                    }
                    fetchData();
                } catch (err) {
                    addNotification('Có lỗi xảy ra khi duyệt yêu cầu.', 'error');
                }
            }
        });
    };

    const handleRejectTransfer = (request) => {
        const isRoommate = request.type === 'roommate';
        showModal({
            title: 'Từ chối yêu cầu',
            message: `Bạn có muốn từ chối yêu cầu ${isRoommate ? 'ở ghép' : 'chuyển nhượng'} này không?`,
            type: 'warning',
            confirmText: 'Từ chối',
            cancelText: 'Hủy',
            onConfirm: async () => {
                try {
                    const { error } = await updateRoomRequestStatus(request.id, 'rejected');
                    if (error) throw error;
                    addNotification('Đã từ chối yêu cầu.', 'info');
                    fetchData();
                } catch (err) {
                    addNotification('Lỗi khi từ chối yêu cầu.', 'error');
                }
            }
        });
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium text-stone-900" style={{ fontFamily: 'var(--font-heading)' }}>
                    Yêu cầu từ khách thuê
                </h2>
                <button
                    onClick={fetchData}
                    disabled={loading}
                    className="flex items-center gap-2 pl-1.5 pr-4 py-1.5 border border-stone-200 bg-white shadow-xs rounded-full text-xs font-medium text-stone-600 hover:border-stone-300 hover:bg-stone-50 transition-all disabled:opacity-50 group cursor-pointer"
                >
                    <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center group-hover:bg-stone-100 transition-colors">
                        <AppIcon name="refresh" size={12} className={`group-hover:text-stone-600 transition-colors ${loading ? "animate-spin" : ""}`} />
                    </div>
                    <span className="group-hover:text-stone-600 transition-colors">Làm mới</span>
                </button>
            </div>

            <div className="flex border-b border-stone-200 mb-6">
                <button
                    className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors cursor-pointer bg-transparent ${activeSubTab === 'bookings' ? 'border-amber-500 text-amber-600' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
                    onClick={() => setActiveSubTab('bookings')}
                >
                    Yêu cầu đặt lịch ({bookings.filter(b => b.status === 'pending').length})
                </button>
                <button
                    className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors cursor-pointer bg-transparent ${activeSubTab === 'transfers' ? 'border-amber-500 text-amber-600' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
                    onClick={() => setActiveSubTab('transfers')}
                >
                    Yêu cầu sang nhượng / ở ghép ({transfers.filter(t => t.status === 'pending' || t.status === 'pending_landlord').length})
                </button>
            </div>

            {loading ? (
                <div className="text-stone-500 text-sm">Đang tải dữ liệu...</div>
            ) : (
                <div className="flex-1 overflow-y-auto">
                    {activeSubTab === 'bookings' && (
                        bookings.length === 0 ? (
                            <div className="text-stone-500 text-sm italic">Chưa có yêu cầu đặt lịch nào.</div>
                        ) : (
                            <div className="space-y-4">
                                {bookings.map(booking => (
                                    <div key={booking.id} className="p-4 border border-stone-200 rounded-xl bg-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex gap-4 items-start">
                                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                                                <AppIcon name="calendar" size={20} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-stone-800">{booking.rooms?.title}</p>
                                                <p className="text-sm text-stone-500 mt-1">
                                                    Khách: <span className="font-medium text-stone-700">{booking.requester?.full_name}</span> - SĐT: {booking.requester?.phone || 'Chưa cập nhật'}
                                                </p>
                                                <p className="text-sm text-stone-500 mt-1">
                                                    Giờ hẹn: <span className="font-medium text-amber-600">{new Date(booking.booking_time).toLocaleString('vi-VN')}</span>
                                                </p>
                                            </div>
                                        </div>
                                        {booking.status === 'pending' && (
                                            <div className="flex gap-2 self-end md:self-center shrink-0">
                                                <button onClick={() => handleRejectBooking(booking)} className="px-4 py-2 border-none rounded-lg text-sm font-medium bg-stone-100 text-stone-600 hover:bg-stone-200 cursor-pointer transition-colors">
                                                    Từ chối
                                                </button>
                                                <button onClick={() => handleApproveBooking(booking)} className="px-4 py-2 border-none rounded-lg text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 cursor-pointer transition-colors shadow-sm shadow-amber-500/20">
                                                    Duyệt
                                                </button>
                                            </div>
                                        )}
                                        {booking.status === 'approved' && <span className="text-green-600 font-medium text-sm bg-green-50 px-3 py-1.5 rounded-lg">Đã duyệt</span>}
                                        {booking.status === 'rejected' && <span className="text-red-600 font-medium text-sm bg-red-50 px-3 py-1.5 rounded-lg">Đã từ chối</span>}
                                    </div>
                                ))}
                            </div>
                        )
                    )}

                    {activeSubTab === 'transfers' && (
                        transfers.length === 0 ? (
                            <div className="text-stone-500 text-sm italic">Chưa có yêu cầu sang nhượng / ở ghép nào.</div>
                        ) : (
                            <div className="space-y-4">
                                {transfers.map(request => (
                                    <div key={request.id} className="p-4 border border-stone-200 rounded-xl bg-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex gap-4 items-start">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                                <AppIcon name="users" size={20} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-stone-800">{request.post?.rooms?.title}</p>
                                                <p className="text-sm text-stone-500 mt-1">
                                                    Người thuê hiện tại: <span className="font-medium text-stone-700">{request.post?.tenant?.full_name}</span>
                                                </p>
                                                <p className="text-sm text-stone-500 mt-1">
                                                    {request.type === 'roommate' ? 'Khách xin ở ghép:' : 'Khách thuê mới:'} <span className="font-medium text-blue-600">{request.requester?.full_name}</span> - SĐT: {request.requester?.phone || 'Chưa cập nhật'}
                                                </p>
                                                {request.message && (
                                                    <p className="text-sm text-stone-500 mt-2 p-2 bg-stone-50 rounded-lg italic">
                                                        "{request.message}"
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        {(request.status === 'pending' || request.status === 'pending_landlord') && (
                                            <div className="flex gap-2 self-end md:self-center shrink-0">
                                                <button onClick={() => handleRejectTransfer(request)} className="px-4 py-2 border-none rounded-lg text-sm font-medium bg-stone-100 text-stone-600 hover:bg-stone-200 cursor-pointer transition-colors">
                                                    Từ chối
                                                </button>
                                                <button onClick={() => handleApproveTransfer(request)} className="px-4 py-2 border-none rounded-lg text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 cursor-pointer transition-colors shadow-sm shadow-amber-500/20">
                                                    Duyệt
                                                </button>
                                            </div>
                                        )}
                                        {request.status === 'approved' && <span className="text-green-600 font-medium text-sm bg-green-50 px-3 py-1.5 rounded-lg">Đã duyệt</span>}
                                        {request.status === 'rejected' && <span className="text-red-600 font-medium text-sm bg-red-50 px-3 py-1.5 rounded-lg">Đã từ chối</span>}
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
}
