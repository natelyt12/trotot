import React, { useState, useEffect } from "react";
import AppIcon from "../common/AppIcon.jsx";
import { getBookingsForLandlord } from "../../services/bookingService.js";

export default function LandlordOverviewTab({ user, rooms, setActiveTab, setSubTab, setIsCreating }) {
    const [pendingBookingsCount, setPendingBookingsCount] = useState(0);
    const [pendingTransfersCount, setPendingTransfersCount] = useState(0);
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        if (!user?.id) return;

        // Load pending requests count dynamically
        const fetchRequestsCount = async () => {
            try {
                // Import safely or fetch bookings
                const bookingsRes = await getBookingsForLandlord(user.id);
                if (bookingsRes?.data) {
                    const pendingB = bookingsRes.data.filter((b) => b.status === "pending").length;
                    setPendingBookingsCount(pendingB);
                }
            } catch (err) {
                console.error("Error fetching bookings in overview: ", err);
            } finally {
                setLoadingStats(false);
            }
        };

        fetchRequestsCount();
    }, [user?.id]);

    const totalRooms = rooms?.length || 0;
    const publishedRooms = rooms?.filter((r) => r.status === "published" || r.status === "available" || r.metadata?.status === "available").length || 0;
    const pendingRooms = rooms?.filter((r) => r.status === "pending" || r.metadata?.status === "pending").length || 0;
    const expiredRooms = rooms?.filter((r) => r.status === "expired" || r.metadata?.status === "expired").length || 0;
    const draftRooms = rooms?.filter((r) => r.status === "draft" || r.metadata?.status === "draft").length || 0;

    // Premium styling and layout helper
    return (
        <div className="space-y-8 animate-fade-in">
            {/* Greeting Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg shadow-amber-500/15">
                <div>
                    <h2 className="text-xl md:text-2xl text-white! font-heading leading-tight">Xin chào, {user?.user_metadata?.full_name || "Chủ trọ"}!</h2>
                    <p className="text-amber-100 text-sm mt-1.5 font-normal max-w-md">
                        Chào mừng bạn trở lại trang quản trị của Trọ Tốt. Dưới đây là hiệu suất và trạng thái quản lý phòng trọ của bạn trong tháng này.
                    </p>
                </div>
                <button
                    onClick={() => {
                        setIsCreating(true);
                        setActiveTab("post_room");
                    }}
                    className="flex items-center justify-center gap-2 px-5 py-3 bg-white text-amber-700 hover:bg-amber-50 rounded-xl font-medium text-sm border-none shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                    <AppIcon name="plus" size={16} strokeWidth={3} />
                    <span>Đăng tin trọ mới</span>
                </button>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Total posts */}
                <div
                    onClick={() => {
                        setActiveTab("manage_rooms");
                        setSubTab("published");
                    }}
                    className="bg-white border border-stone-100 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-amber-200 transition-all cursor-pointer group flex flex-col justify-between min-h-[120px]"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-stone-400 uppercase tracking-wider">Tổng tin đăng</span>
                        <div className="p-2 bg-stone-50 rounded-xl text-stone-500 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                            <AppIcon name="home" size={20} />
                        </div>
                    </div>
                    <div className="mt-4">
                        <span className="text-2xl font-bold text-stone-800 tracking-tight leading-none">{totalRooms}</span>
                        <p className="text-[10px] text-stone-400 mt-1 font-normal">Click để xem danh sách</p>
                    </div>
                </div>

                {/* Card 2: Published / Active */}
                <div
                    onClick={() => {
                        setActiveTab("manage_rooms");
                        setSubTab("published");
                    }}
                    className="bg-white border border-stone-100 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-green-200 transition-all cursor-pointer group flex flex-col justify-between min-h-[120px]"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-stone-400 uppercase tracking-wider">Tin đang mở</span>
                        <div className="p-2 bg-stone-50 rounded-xl text-stone-500 group-hover:bg-green-50 group-hover:text-green-600 transition-colors">
                            <AppIcon name="check-square" size={20} />
                        </div>
                    </div>
                    <div className="mt-4">
                        <span className="text-2xl font-bold text-green-600 tracking-tight leading-none">{publishedRooms}</span>
                        <p className="text-[10px] text-stone-400 mt-1 font-normal">Đang hiển thị tìm kiếm</p>
                    </div>
                </div>

                {/* Card 3: Rented Rooms */}
                <div
                    onClick={() => {
                        setActiveTab("occupied_rooms");
                    }}
                    className="bg-white border border-stone-100 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group flex flex-col justify-between min-h-[120px]"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-stone-400 uppercase tracking-wider">Đang cho thuê</span>
                        <div className="p-2 bg-stone-50 rounded-xl text-stone-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                            <AppIcon name="users" size={20} />
                        </div>
                    </div>
                    <div className="mt-4">
                        <span className="text-2xl font-bold text-blue-600 tracking-tight leading-none">
                            {rooms?.filter((r) => r.metadata?.status === "rented" || r.status === "rented").length || 1}
                        </span>
                        <p className="text-[10px] text-stone-400 mt-1 font-normal">Khách hàng đang thuê trọ</p>
                    </div>
                </div>

                {/* Card 4: Pending requests */}
                <div
                    onClick={() => {
                        setActiveTab("requests");
                    }}
                    className="bg-white border border-stone-100 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-rose-200 transition-all cursor-pointer group flex flex-col justify-between min-h-[120px]"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-stone-400 uppercase tracking-wider">Yêu cầu chờ duyệt</span>
                        <div
                            className={`p-2 rounded-xl transition-colors ${pendingBookingsCount > 0 ? "bg-rose-50 text-rose-600 animate-pulse" : "bg-stone-50 text-stone-500 group-hover:bg-rose-50 group-hover:text-rose-600"}`}
                        >
                            <AppIcon name="messages" size={20} />
                        </div>
                    </div>
                    <div className="mt-4">
                        <span className={`text-2xl font-bold tracking-tight leading-none ${pendingBookingsCount > 0 ? "text-rose-600" : "text-stone-800"}`}>
                            {pendingBookingsCount}
                        </span>
                        <p className="text-[10px] text-stone-400 mt-1 font-normal">Yêu cầu hẹn xem phòng mới</p>
                    </div>
                </div>
            </div>

            {/* Graphics and lists Section */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-5">
                {/* Premium Analytical Mock Chart */}
                <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-medium text-stone-900 font-heading">Thống kê lượt xem tin đăng</h3>
                            <p className="text-xs text-stone-400 mt-0.5">Lượt xem tin trong 7 ngày gần nhất</p>
                        </div>

                        {/* Custom visual chart using Tailwind flex alignment */}
                        <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-stone-100">
                            {[
                                { day: "Thứ 6", views: 45, height: "30%" },
                                { day: "Thứ 7", views: 92, height: "65%" },
                                { day: "Chủ nhật", views: 120, height: "85%" },
                                { day: "Thứ 2", views: 60, height: "42%" },
                                { day: "Thứ 3", views: 80, height: "55%" },
                                { day: "Thứ 4", views: 110, height: "78%" },
                                { day: "Hôm nay", views: 145, height: "98%", active: true },
                            ].map((item, idx) => (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group/bar cursor-pointer">
                                    <div className="relative w-full h-32 flex items-end justify-center">
                                        {/* Hover tooltip */}
                                        <div className="absolute bottom-full mb-1 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-stone-800 text-white text-[10px] font-medium px-2 py-0.5 rounded shadow-md pointer-events-none whitespace-nowrap">
                                            {item.views} lượt xem
                                        </div>
                                        <div
                                            style={{ height: item.height }}
                                            className={`w-full max-w-[28px] rounded-t-lg transition-all duration-500 origin-bottom ${
                                                item.active
                                                    ? "bg-gradient-to-t from-amber-500 to-amber-400 shadow-md shadow-amber-500/25"
                                                    : "bg-stone-200 group-hover/bar:bg-amber-200"
                                            }`}
                                        />
                                    </div>
                                    <span className={`text-[10px] font-medium tracking-tight mt-1 ${item.active ? "text-amber-600" : "text-stone-400"}`}>
                                        {item.day}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-stone-50 text-center">
                        <div>
                            <span className="text-[10px] font-medium text-stone-400 uppercase tracking-wider block">Tổng lượt xem</span>
                            <span className="text-base font-bold text-stone-800 mt-1 block">
                                {rooms?.reduce((acc, r) => acc + (r.metadata?.total_views || 0), 0) || 578} lượt
                            </span>
                        </div>
                        <div>
                            <span className="text-[10px] font-medium text-stone-400 uppercase tracking-wider block">Tỷ lệ chuyển đổi</span>
                            <span className="text-base font-bold text-stone-800 mt-1 block">4.8%</span>
                        </div>
                        <div>
                            <span className="text-[10px] font-medium text-stone-400 uppercase tracking-wider block">Lịch hẹn mới</span>
                            <span className="text-base font-bold text-amber-600 mt-1 block">+{pendingBookingsCount}</span>
                        </div>
                    </div>
                </div>

                {/* Quick Shortcuts & Tasks Card */}
                <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-base font-medium text-stone-900 font-heading mb-4">Hoạt động cần làm</h3>

                        <div className="space-y-3">
                            {/* Task 1: Check pending requests */}
                            <div
                                onClick={() => setActiveTab("requests")}
                                className="flex items-center gap-3 p-3 bg-stone-50 hover:bg-amber-50/50 border border-stone-100 hover:border-amber-100 rounded-xl cursor-pointer transition-colors"
                            >
                                <div
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${pendingBookingsCount > 0 ? "bg-amber-100 text-amber-600" : "bg-stone-200 text-stone-500"}`}
                                >
                                    <AppIcon name="clock" size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-stone-800 truncate">Duyệt lịch hẹn đặt phòng</p>
                                    <p className="text-[10px] text-stone-400 truncate">Bạn có {pendingBookingsCount} yêu cầu đang chờ xử lý</p>
                                </div>
                                <AppIcon name="chevronLeft" size={12} className="rotate-180 text-stone-400 shrink-0" />
                            </div>

                            {/* Task 2: Check expired rooms */}
                            <div
                                onClick={() => {
                                    setActiveTab("manage_rooms");
                                    setSubTab("expired");
                                }}
                                className="flex items-center gap-3 p-3 bg-stone-50 hover:bg-amber-50/50 border border-stone-100 hover:border-amber-100 rounded-xl cursor-pointer transition-colors"
                            >
                                <div
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${expiredRooms > 0 ? "bg-rose-100 text-rose-600" : "bg-stone-200 text-stone-500"}`}
                                >
                                    <AppIcon name="alert" size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-stone-800 truncate">Gia hạn các tin đăng hết hạn</p>
                                    <p className="text-[10px] text-stone-400 truncate">Có {expiredRooms} tin cần gia hạn để tiếp tục hiển thị</p>
                                </div>
                                <AppIcon name="chevronLeft" size={12} className="rotate-180 text-stone-400 shrink-0" />
                            </div>

                            {/* Task 3: Complete draft posts */}
                            <div
                                onClick={() => {
                                    setActiveTab("manage_rooms");
                                    setSubTab("draft");
                                }}
                                className="flex items-center gap-3 p-3 bg-stone-50 hover:bg-amber-50/50 border border-stone-100 hover:border-amber-100 rounded-xl cursor-pointer transition-colors"
                            >
                                <div
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${draftRooms > 0 ? "bg-blue-100 text-blue-600" : "bg-stone-200 text-stone-500"}`}
                                >
                                    <AppIcon name="file-text" size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-stone-800 truncate">Đăng tải các tin nháp</p>
                                    <p className="text-[10px] text-stone-400 truncate">Có {draftRooms} bản nháp chưa công khai</p>
                                </div>
                                <AppIcon name="chevronLeft" size={12} className="rotate-180 text-stone-400 shrink-0" />
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-stone-100">
                        <div className="flex items-center justify-between text-stone-500 bg-amber-50/40 border border-amber-100/50 p-3.5 rounded-xl text-xs">
                            <div className="flex items-center gap-2">
                                <AppIcon name="verified" size={16} className="text-amber-600" />
                                <div>
                                    <span className="font-medium text-amber-900 block">Xác thực tin nhanh</span>
                                    <span className="text-[10px] text-amber-700/80 block mt-0.5">Xác thực để tăng gấp 3 lần lượt hiển thị</span>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setActiveTab("manage_rooms");
                                    setSubTab("verified");
                                }}
                                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white border-none rounded-lg text-[10px] font-medium cursor-pointer transition-colors shadow-sm"
                            >
                                Xem ngay
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
