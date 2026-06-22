import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppIcon from '../common/AppIcon';
import { useModal } from '../../context/ModalContext';
import { useNotification } from '../../context/NotificationContext';
import { createBooking, checkUserActiveBooking } from '../../services/bookingService';
import { supabase } from '../../lib/supabase';

export default function BookingModal({ isOpen, onClose, room, user, onSuccess }) {
    const { showModal } = useModal();
    const { addNotification } = useNotification();
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [loading, setLoading] = useState(false);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const handleClose = () => {
        setDate('');
        setTime('');
        onClose();
    };

    const handleSubmit = async () => {
        if (!date || !time) {
            showModal({ title: 'Lỗi', message: 'Vui lòng chọn ngày và giờ.', type: 'warning' });
            return;
        }

        const bookingTime = new Date(`${date}T${time}`).toISOString();
        if (new Date(bookingTime) <= new Date()) {
            showModal({ title: 'Lỗi', message: 'Thời gian đặt lịch phải ở tương lai.', type: 'warning' });
            return;
        }

        setLoading(true);
        try {
            // Check if user already booked this room
            const { data: activeBooking } = await checkUserActiveBooking(room.id, user.id);
            if (activeBooking) {
                showModal({ title: 'Đã đặt lịch', message: 'Bạn đã có một lịch hẹn đang chờ duyệt cho phòng này rồi.', type: 'warning' });
                setLoading(false);
                return;
            }

            // Check if user is currently renting this room
            const { data: rentData } = await supabase
                .from('rented_rooms')
                .select('id')
                .eq('room_id', room.id)
                .eq('user_id', user.id)
                .maybeSingle();
            
            if (rentData) {
                showModal({ title: 'Không thể đặt lịch', message: 'Bạn đang là người thuê của phòng này.', type: 'warning' });
                setLoading(false);
                return;
            }

            const { error } = await createBooking(room.id, user.id, bookingTime);
            if (error) throw error;
            
            addNotification('Đặt lịch thành công! Chủ phòng sẽ liên hệ sớm nhất.', 'success');
            setLoading(false);
            handleClose();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Lỗi khi đặt lịch:', error);
            showModal({ title: 'Lỗi', message: 'Đã xảy ra lỗi khi đặt lịch. Vui lòng thử lại.', type: 'error' });
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-200 flex items-end sm:items-center justify-center">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 bg-stone-900/60"
                        onClick={handleClose}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.6 }}
                        className="relative w-full max-w-[400px] bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col overflow-hidden mt-auto sm:mt-0"
                    >
                        {/* Drag Handle Bar (Visual only) */}
                        <div className="flex justify-center py-3 shrink-0 sm:hidden">
                            <div className="w-12 h-1.5 bg-stone-300 rounded-full" />
                        </div>

                        <div className="flex flex-col">
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-stone-100 shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                                        <AppIcon name="calendar" size={20} />
                                    </div>
                                    <h3 className="font-medium text-lg text-stone-900 font-heading">
                                        Đặt lịch xem phòng
                                    </h3>
                                </div>
                                <button onClick={handleClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors cursor-pointer border-none bg-transparent">
                                    <AppIcon name="close" size={20} className="text-stone-500" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 flex flex-col gap-5">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-medium text-stone-700">Ngày hẹn xem phòng</label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="px-4 py-3 border border-stone-200 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors w-full outline-none"
                                    />
                                </div>
                                
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-medium text-stone-700">Giờ hẹn</label>
                                    <input
                                        type="time"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                        className="px-4 py-3 border border-stone-200 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors w-full outline-none"
                                    />
                                </div>
                            </div>

                            {/* Footer Buttons */}
                            <div className="p-6 pt-2 flex flex-col gap-3">
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="w-full py-3.5 rounded-xl font-medium text-sm bg-amber-500 text-white cursor-pointer hover:bg-amber-600 transition-colors border-none shadow-lg shadow-amber-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <AppIcon name="check" size={18} />
                                            <span>Xác nhận đặt lịch</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
