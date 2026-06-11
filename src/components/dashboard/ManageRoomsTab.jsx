import React from "react";
import { motion } from "framer-motion";
import AppIcon from "../common/AppIcon.jsx";
import { formatPrice } from "../../utils/formatters.js";
import { mapSupabaseRoom } from "../../utils/roomMapper.js";

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
    onRefresh,
}) {
    const ITEMS_PER_PAGE = 12;

    const filteredRooms = rooms.filter((room) => {
        const isExpired = room.status === "expired";

        if (subTab === "expired") {
            return isExpired;
        }

        // Exclude expired rooms from active/draft tabs
        if (isExpired) return false;

        if (subTab === "draft") {
            return room.status === "draft" || room.status === "hidden";
        }
        if (subTab === "verified") {
            return room.status === "available" && room.is_verified;
        }
        if (subTab === "pending_verification") {
            return room.status === "pending";
        }
        if (subTab === "published") {
            // Tất cả phòng đã công khai (cả verified và chưa xác thực)
            return room.status === "available";
        }
        // default to published available
        return room.status === "available";
    });

    return (
        <motion.div key={subTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center bg-amber-100 text-amber-600">
                        <AppIcon
                            name={
                                subTab === "verified"
                                    ? "verified"
                                    : subTab === "published"
                                      ? "home"
                                      : subTab === "pending_verification"
                                        ? "clock"
                                        : subTab === "expired"
                                          ? "alert"
                                          : subTab === "draft"
                                            ? "file-text"
                                            : "check-square"
                            }
                            size={18}
                        />
                    </div>
                    <h2 className="text-lg font-medium text-stone-900" style={{ fontFamily: "var(--font-heading)" }}>
                        {subTab === "verified"
                            ? "Tin đã xác thực"
                            : subTab === "published"
                              ? "Tin đã công khai"
                              : subTab === "pending_verification"
                                ? "Tin đang chờ duyệt"
                                : subTab === "expired"
                                  ? "Tin hết hạn"
                                  : subTab === "draft"
                                    ? "Tin nháp"
                                    : "Quản lý tin đăng"}
                    </h2>
                </div>
                {onRefresh && (
                    <button
                        onClick={onRefresh}
                        disabled={loadingRooms}
                        title="Làm mới dữ liệu"
                        className="flex items-center gap-2 pl-1.5 pr-4 py-1.5 border border-stone-200 bg-white shadow-xs rounded-full text-xs font-medium text-stone-600 hover:border-stone-300 hover:bg-stone-50 transition-all disabled:opacity-50 group cursor-pointer"
                    >
                        <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center group-hover:bg-stone-100 transition-colors">
                            <AppIcon
                                name="refresh"
                                size={12}
                                className={`group-hover:text-stone-600 transition-colors ${loadingRooms ? "animate-spin" : ""}`}
                            />
                        </div>
                        <span className="group-hover:text-stone-600 transition-colors">Làm mới</span>
                    </button>
                )}
            </div>

            {loadingRooms ? (
                <div className="text-center py-20 text-stone-500">Đang tải dữ liệu...</div>
            ) : (
                (() => {
                    if (filteredRooms.length === 0) {
                        return (
                            <div className="flex flex-col items-center justify-center py-20 bg-stone-50 border border-dashed border-stone-200 rounded-xl text-center">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 text-stone-300">
                                    <AppIcon name="home" size={32} />
                                </div>
                                <h3 className="text-lg font-medium text-stone-900 mb-2">
                                    {subTab === "draft"
                                        ? "Bạn chưa có bản nháp nào"
                                        : subTab === "verified"
                                          ? "Bạn chưa có tin nào được xác thực"
                                          : subTab === "pending_verification"
                                            ? "Không có tin đang chờ duyệt"
                                            : subTab === "published"
                                              ? "Bạn chưa có tin đăng nào được công khai"
                                              : subTab === "expired"
                                                ? "Bạn không có tin đăng nào đã hết hạn"
                                                : "Bạn chưa có tin đăng nào được công khai"}
                                </h3>
                                <p className="text-stone-500 text-sm max-w-sm px-6 mb-6">
                                    {subTab === "draft"
                                        ? "Các bản nháp sẽ xuất hiện ở đây khi bạn lưu tin."
                                        : subTab === "verified"
                                          ? "Tin đăng của bạn sau khi được xác thực sẽ xuất hiện ở đây."
                                          : subTab === "pending_verification"
                                            ? "Tất cả tin đăng của bạn đã được duyệt hoặc không có tin nào đang chờ."
                                            : subTab === "published"
                                              ? "Tin đăng công khai sẽ hiển thị tại đây khi bạn gửi bài."
                                              : subTab === "expired"
                                                ? "Tuyệt vời! Tất cả các tin đăng của bạn đều hoạt động hoặc được lưu nháp."
                                                : "Bắt đầu tiếp cận khách hàng tiềm năng bằng cách đăng tin cho thuê phòng của bạn."}
                                </p>
                                <button
                                    onClick={() => {
                                        setIsCreating(true);
                                        setEditingRoom(null);
                                        setActiveTab("post_room");
                                    }}
                                    className="bg-amber-500 hover:bg-amber-600 text-white font-medium py-2.5 px-6 rounded-full transition-colors cursor-pointer border-none shadow-lg shadow-amber-500/20"
                                >
                                    Đăng tin ngay
                                </button>
                            </div>
                        );
                    }

                    return (
                        <div className="flex flex-col min-h-[600px] h-full">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5 mb-8">
                                {filteredRooms.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((room) => {
                                    const isExpired = room.status === "expired";
                                    return (
                                        <div
                                            key={room.id}
                                            className="flex flex-col border border-stone-100 rounded-xl hover:border-amber-300 hover:shadow-md transition-all duration-300 bg-white group overflow-hidden h-full"
                                        >
                                            {/* Thumbnail (Top) */}
                                            <div className="w-full h-44 bg-stone-100 overflow-hidden shrink-0 relative">
                                                {room.media_contact?.images?.[0]?.url ? (
                                                    <img
                                                        src={room.media_contact.images[0].url}
                                                        alt={room.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        onError={(e) => {
                                                            e.currentTarget.src = "/images/placeholder.png";
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center text-stone-300 bg-stone-100 gap-2">
                                                        <AppIcon name="home" size={28} />
                                                        <span className="text-[10px] font-medium uppercase tracking-wider">Không có ảnh</span>
                                                    </div>
                                                )}

                                                {/* Status Badge Overlaid on Image (Top Left) */}
                                                <div className="absolute top-2 left-2 flex flex-col items-start gap-1.5 z-10">
                                                    {room.status === "available" && subTab === "verified" && (
                                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[0.7rem] font-medium border shadow-sm bg-green-50 text-green-700 border-green-200">
                                                            <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-green-600" />
                                                            Đã công khai
                                                        </span>
                                                    )}
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[0.7rem] font-medium border shadow-sm ${
                                                            isExpired
                                                                ? "bg-red-50 text-red-700 border-red-200"
                                                                : room.status === "available"
                                                                  ? subTab === "published"
                                                                      ? "bg-green-50 text-green-700 border-green-200"
                                                                      : room.is_verified
                                                                        ? "bg-blue-50 text-blue-700 border-blue-200"
                                                                        : "bg-green-50 text-green-700 border-green-200"
                                                                  : room.status === "pending"
                                                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                                                    : room.status === "hidden"
                                                                      ? "bg-stone-50 text-stone-700 border-stone-200"
                                                                      : "bg-stone-50 text-stone-700 border-stone-200"
                                                        }`}
                                                    >
                                                        <span
                                                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                                                isExpired
                                                                    ? "bg-red-600"
                                                                    : room.status === "available"
                                                                      ? subTab === "published"
                                                                          ? "bg-green-600"
                                                                          : room.is_verified
                                                                            ? "bg-blue-600"
                                                                            : "bg-green-600"
                                                                      : room.status === "pending"
                                                                        ? "bg-amber-600"
                                                                        : "bg-stone-600"
                                                            }`}
                                                        />
                                                        {isExpired
                                                            ? "Đã hết hạn"
                                                            : room.status === "available"
                                                              ? subTab === "published"
                                                                  ? "Đã công khai"
                                                                  : room.is_verified
                                                                    ? "Đã xác thực"
                                                                    : "Công khai"
                                                              : room.status === "pending"
                                                                ? "Chờ duyệt"
                                                                : room.status === "hidden"
                                                                  ? "Đã ẩn"
                                                                  : room.status === "draft"
                                                                    ? "Bản nháp"
                                                                    : room.status}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Info (Middle) */}
                                            <div className="p-4 flex-1 flex flex-col min-w-0">
                                                {/* Price */}
                                                <div
                                                    className="text-[1.1rem] font-medium text-amber-600 tracking-tight leading-none mb-1.5"
                                                    style={{ fontFamily: "var(--font-heading)" }}
                                                >
                                                    {room.price_monthly === 0 ? "Chưa cập nhật giá" : formatPrice(room.price_monthly)}
                                                </div>

                                                {/* Title */}
                                                <h4
                                                    className="text-sm font-medium text-stone-900 leading-snug m-0 line-clamp-2 mb-2 group-hover:text-amber-600 transition-colors"
                                                    style={{ fontFamily: "var(--font-heading)" }}
                                                    title={room.title}
                                                >
                                                    {room.title}
                                                </h4>

                                                {/* Address */}
                                                <div className="flex items-center gap-1.5 text-stone-500 text-[0.75rem] mt-auto">
                                                    <span className="shrink-0">
                                                        <AppIcon name="location" size={11} />
                                                    </span>
                                                    <span className="truncate">
                                                        {[room.address, room.ward, room.district].filter(Boolean).join(", ") || "Chưa cập nhật"}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Divider */}
                                            <div className="mx-4 h-px bg-stone-100" />

                                            {/* Action Bar (Bottom) */}
                                            <div className="p-4 bg-stone-50/30 flex flex-wrap items-center gap-2">
                                                {isExpired && (
                                                    <button
                                                        onClick={() => handleRenewRoom(room)}
                                                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-medium cursor-pointer transition-colors border-none shadow-sm shadow-amber-500/20"
                                                    >
                                                        <AppIcon name="edit" size={12} />
                                                        Gia hạn tin
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => setPreviewRoom({ ...mapSupabaseRoom(room), subTab })}
                                                    className={`flex items-center justify-center gap-1.5 px-3 py-2 border border-stone-200 rounded-lg text-xs font-medium text-stone-600 hover:bg-stone-50 hover:text-stone-900 cursor-pointer transition-colors ${!isExpired && "flex-1"}`}
                                                    title="Xem trước"
                                                >
                                                    <AppIcon name="eye" size={14} />
                                                    {!isExpired && <span>Xem trước</span>}
                                                </button>

                                                {subTab === "pending_verification" ? (
                                                    <button
                                                        onClick={() => handleUnpublish(room)}
                                                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-amber-200 bg-amber-50 rounded-lg text-xs font-medium text-amber-700 hover:bg-amber-100 cursor-pointer transition-colors"
                                                    >
                                                        <AppIcon name="eye-off" size={12} strokeWidth={2.5} />
                                                        Hủy duyệt
                                                    </button>
                                                ) : subTab === "verified" || subTab === "published" ? (
                                                    <button
                                                        onClick={() => handleUnpublish(room)}
                                                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-amber-200 bg-amber-50 rounded-lg text-xs font-medium text-amber-700 hover:bg-amber-100 cursor-pointer transition-colors"
                                                    >
                                                        <AppIcon name="eye-off" size={12} strokeWidth={2.5} />
                                                        Gỡ bài
                                                    </button>
                                                ) : subTab === "draft" ? (
                                                    <button
                                                        onClick={() => handlePublishFromDraft(room)}
                                                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-green-200 bg-green-50 rounded-lg text-xs font-medium text-green-700 hover:bg-green-100 cursor-pointer transition-colors"
                                                    >
                                                        <AppIcon name="check" size={14} strokeWidth={3} />
                                                        Công khai
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            setEditingRoom(room);
                                                            setIsCreating(false);
                                                            setActiveTab("post_room");
                                                        }}
                                                        className="flex items-center justify-center gap-1.5 px-3 py-2 border border-stone-200 bg-white rounded-lg text-xs font-medium text-stone-600 hover:bg-stone-50 hover:text-stone-900 cursor-pointer transition-colors"
                                                        title="Sửa tin"
                                                    >
                                                        <AppIcon name="edit" size={14} />
                                                    </button>
                                                )}

                                                {subTab === "draft" && (
                                                    <div className="w-full flex items-center gap-2 mt-1">
                                                        <button
                                                            onClick={() => handleDuplicateRoom(room)}
                                                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-stone-200 bg-white rounded-lg text-xs font-medium text-stone-600 hover:bg-stone-50 cursor-pointer transition-colors"
                                                            title="Nhân bản"
                                                        >
                                                            <AppIcon name="copy" size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setEditingRoom(room);
                                                                setIsCreating(false);
                                                                setActiveTab("post_room");
                                                            }}
                                                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-stone-200 bg-white rounded-lg text-xs font-medium text-stone-600 hover:bg-stone-50 hover:text-stone-900 cursor-pointer transition-colors"
                                                            title="Sửa tin"
                                                        >
                                                            <AppIcon name="edit" size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteRoom(room)}
                                                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-red-100 bg-red-50 rounded-lg text-xs font-medium text-red-600 hover:bg-red-100 cursor-pointer transition-colors"
                                                            title="Xóa nháp"
                                                        >
                                                            <AppIcon name="trash" size={14} />
                                                        </button>
                                                    </div>
                                                )}

                                                {subTab === "expired" && (
                                                    <button
                                                        onClick={() => handleDeleteRoom(room)}
                                                        className="flex items-center justify-center gap-1.5 px-3 py-2 border border-red-100 bg-red-50 rounded-lg text-xs font-medium text-red-600 hover:bg-red-100 cursor-pointer transition-colors"
                                                        title="Xóa"
                                                    >
                                                        <AppIcon name="trash" size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Pagination */}
                            {Math.ceil(filteredRooms.length / ITEMS_PER_PAGE) > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-auto pt-6 pb-2 border-t border-stone-100">
                                    <button
                                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
                                                className={`w-8 h-8 flex items-center justify-center rounded-full border text-sm font-medium transition-colors cursor-pointer ${
                                                    currentPage === pageNum
                                                        ? "border-amber-500 bg-amber-50 text-amber-600"
                                                        : "border-stone-200 text-stone-600 hover:bg-stone-50"
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        ));
                                    })()}

                                    <button
                                        onClick={() => setCurrentPage((prev) => Math.min(Math.ceil(filteredRooms.length / ITEMS_PER_PAGE), prev + 1))}
                                        disabled={currentPage === Math.ceil(filteredRooms.length / ITEMS_PER_PAGE)}
                                        className="w-8 h-8 flex items-center justify-center rounded-full border border-stone-200 text-stone-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-50 transition-colors cursor-pointer"
                                    >
                                        <AppIcon name="chevronRight" size={12} strokeWidth={3.5} />
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })()
            )}
        </motion.div>
    );
}
