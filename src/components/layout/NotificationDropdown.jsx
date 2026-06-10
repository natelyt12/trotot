import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AppIcon from "../common/AppIcon.jsx";

export default function NotificationDropdown({ navigate, user }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Initial realistic mock notifications based on user role
    const getInitialNotifications = () => {
        const isHost = user?.user_metadata?.role === "landlord" || user?.user_metadata?.role === "admin";
        
        const baseNotifications = [
            {
                id: "notif-1",
                title: "Hệ thống bảo trì định kỳ",
                description: "Hệ thống sẽ tiến hành bảo trì định kỳ từ 02:00 đến 04:00 ngày 10/06/2026. Một số tính năng có thể tạm thời không khả dụng.",
                time: "2 giờ trước",
                type: "warning",
                read: false
            },
            {
                id: "notif-2",
                title: "Chào mừng bạn đến với Trọ Tốt",
                description: "Cảm ơn bạn đã tham gia cộng đồng tìm kiếm và đăng tin phòng trọ hàng đầu Việt Nam. Hãy thiết lập hồ sơ đầy đủ nhé!",
                time: "1 ngày trước",
                type: "info",
                read: true
            }
        ];

        if (isHost) {
            return [
                {
                    id: "notif-host-1",
                    title: "Tin đăng đã được phê duyệt",
                    description: "Tin đăng 'Phòng trọ ban công rộng rãi tại Cầu Giấy' của bạn đã được quản trị viên phê duyệt và hiện đã hiển thị công khai.",
                    time: "15 phút trước",
                    type: "success",
                    read: false
                },
                {
                    id: "notif-host-2",
                    title: "Có bình luận mới",
                    description: "Người dùng Nguyễn Văn A đã bình luận hỏi về chi phí dịch vụ trong tin đăng phòng trọ của bạn.",
                    time: "1 giờ trước",
                    type: "comment",
                    read: false
                },
                ...baseNotifications
            ];
        } else {
            return [
                {
                    id: "notif-tenant-1",
                    title: "Phòng trọ mới phù hợp",
                    description: "Có 3 phòng trọ mới vừa được đăng tải quanh khu vực Đại học Quốc gia Hà Nội đúng với tiêu chí tìm kiếm của bạn.",
                    time: "30 phút trước",
                    type: "success",
                    read: false
                },
                {
                    id: "notif-tenant-2",
                    title: "Phản hồi bình luận",
                    description: "Chủ nhà Trọ Xinh đã trả lời bình luận của bạn về thời gian mở cửa phòng trọ.",
                    time: "3 giờ trước",
                    type: "comment",
                    read: false
                },
                ...baseNotifications
            ];
        }
    };

    const [notifications, setNotifications] = useState(getInitialNotifications);

    const unreadCount = notifications.filter(n => !n.read).length;

    // Toggle dropdown
    const toggleDropdown = () => setIsOpen(!isOpen);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    // Actions
    const handleMarkAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const handleClearAll = () => {
        setNotifications([]);
    };

    const handleNotificationClick = (notif) => {
        // Mark as read
        setNotifications(prev =>
            prev.map(n => (n.id === notif.id ? { ...n, read: true } : n))
        );

        // Optional navigation logic depending on type
        if (notif.type === "comment" || notif.type === "success") {
            if (user?.user_metadata?.role === "landlord" || user?.user_metadata?.role === "admin") {
                navigate("dashboard");
            } else {
                navigate("home");
            }
        }
        setIsOpen(false);
    };

    // Helper to render notification icons beautifully
    const renderNotifIcon = (type) => {
        switch (type) {
            case "success":
                return (
                    <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <AppIcon name="check" size={16} />
                    </div>
                );
            case "warning":
                return (
                    <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <AppIcon name="alert" size={16} />
                    </div>
                );
            case "comment":
                return (
                    <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <AppIcon name="messages" size={16} />
                    </div>
                );
            case "info":
            default:
                return (
                    <div className="w-9 h-9 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <AppIcon name="user" size={16} />
                    </div>
                );
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon Button */}
            <button
                onClick={toggleDropdown}
                className="relative p-2.5 rounded-xl hover:bg-stone-50 transition-all duration-200 cursor-pointer border-none bg-transparent flex items-center justify-center text-stone-600 hover:text-stone-900 group"
                aria-label="Thông báo"
            >
                <AppIcon 
                    name="bell" 
                    size={22} 
                    className="group-hover:scale-105 transition-transform duration-200" 
                />
                
                {/* Red unread count badge */}
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white shadow-sm" />
                )}
            </button>

            {/* Dropdown Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute right-[-60px] md:right-0 mt-2 w-80 md:w-96 bg-white border border-stone-200 rounded-2xl shadow-xl z-100 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                            <h3 className="font-bold text-stone-900 text-sm md:text-base flex items-center gap-1.5">
                                Thông báo
                                {unreadCount > 0 && (
                                    <span className="text-[11px] bg-red-50 text-red-600 font-semibold px-2 py-0.5 rounded-full">
                                        Mới: {unreadCount}
                                    </span>
                                )}
                            </h3>
                            {notifications.length > 0 && (
                                <div className="flex gap-3 text-xs">
                                    <button
                                        onClick={handleMarkAllRead}
                                        className="text-amber-600 hover:text-amber-700 font-bold bg-transparent border-none cursor-pointer p-0"
                                    >
                                        Đọc tất cả
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* List Area */}
                        <div className="max-h-96 overflow-y-auto divide-y divide-stone-100">
                            {notifications.length > 0 ? (
                                notifications.map((notif) => (
                                    <button
                                        key={notif.id}
                                        onClick={() => handleNotificationClick(notif)}
                                        className={`w-full text-left p-4 hover:bg-stone-50/70 transition-colors duration-150 border-none bg-transparent cursor-pointer flex gap-3.5 items-start ${
                                            !notif.read ? "bg-amber-50/20" : ""
                                        }`}
                                    >
                                        {renderNotifIcon(notif.type)}
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className={`text-stone-900 text-xs md:text-sm leading-snug truncate ${
                                                    !notif.read ? "font-bold" : "font-semibold"
                                                }`}>
                                                    {notif.title}
                                                </h4>
                                                
                                                {/* Unread indicator dot */}
                                                {!notif.read && (
                                                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                                                )}
                                            </div>
                                            
                                            <p className={`text-stone-500 text-[11px] md:text-[12px] mt-1 leading-normal break-words ${
                                                !notif.read ? "font-medium text-stone-700" : "font-normal"
                                            }`}>
                                                {notif.description}
                                            </p>
                                            
                                            <span className="text-[10px] text-stone-400 font-medium mt-1.5 block">
                                                {notif.time}
                                            </span>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="py-12 px-4 flex flex-col items-center justify-center text-center">
                                    <div className="w-14 h-14 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 mb-3">
                                        <AppIcon name="bell" size={24} />
                                    </div>
                                    <p className="text-stone-500 text-sm font-semibold">Bạn không có thông báo nào</p>
                                    <p className="text-stone-400 text-xs mt-1 max-w-[200px]">Mọi cập nhật quan trọng sẽ hiển thị ở đây.</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="px-4 py-2.5 bg-stone-50/50 border-t border-stone-100 flex items-center justify-center">
                                <button
                                    onClick={handleClearAll}
                                    className="w-full text-center text-xs font-bold text-stone-500 hover:text-stone-700 bg-transparent border-none cursor-pointer py-1 flex items-center justify-center gap-1"
                                >
                                    <AppIcon name="trash" size={13} />
                                    Xóa tất cả thông báo
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
