import React, { useState, useEffect } from "react";
import { TbRefresh, TbSearch, TbX, TbHomeCheck, TbMapPin, TbPhone, TbEye, TbCheck, TbChevronLeft, TbChevronRight } from "react-icons/tb";
import { formatPrice } from "../../utils/formatters";

export default function RoomsTab({
    allRooms,
    roomsSubTab,
    setRoomsSubTab,
    roomUserFilter,
    setRoomUserFilter,
    roomUserSearch,
    setRoomUserSearch,
    onRefresh,
    onOpenRoomPreview,
    onCancelVerification,
    onRejectRoom,
    onApproveRoom,
    onApprovePublish,
    loadingPreviewRoom,
}) {
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 8; // 8 items per page matches the 2-column grid layout

    // Reset pagination to page 1 on tab or filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [roomsSubTab, roomUserFilter]);

    // Apply the landlord filter when clicking Search button or pressing Enter
    const handleSearchSubmit = () => {
        if (roomUserSearch.trim()) {
            setRoomUserFilter({ name: roomUserSearch.trim() });
        }
    };

    // Filter rooms by owner and completely exclude expired posts
    const baseRooms = (
        roomUserFilter
            ? allRooms.filter(
                  (r) => (r.owner || "").toLowerCase().includes(roomUserFilter.name.toLowerCase()) || (r.owner_phone || "").includes(roomUserFilter.name),
              )
            : allRooms
    ).filter((r) => {
        const isExpired = r.status === "expired" || (r.available_until && new Date(r.available_until) < new Date());
        return !isExpired;
    });

    // 3-stage moderation subtabs
    const pendingPublishRooms = baseRooms.filter((r) => r.status === "pending");
    const unverifiedRooms = baseRooms.filter((r) => r.status === "available" && !r.is_verified);
    const verifiedRooms = baseRooms.filter((r) => r.status === "available" && r.is_verified);

    const currentList = roomsSubTab === "verified" ? verifiedRooms : roomsSubTab === "unverified" ? unverifiedRooms : pendingPublishRooms; // Default is pending_publish

    // Build unique owners list for autocompletion
    const uniqueOwners = [];
    const seenOwners = new Set();
    allRooms.forEach((r) => {
        const key = r.owner;
        if (!seenOwners.has(key)) {
            seenOwners.add(key);
            uniqueOwners.push({ name: r.owner, phone: r.owner_phone, avatar: r.owner_avatar });
        }
    });

    const filteredOwners = uniqueOwners.filter(
        (o) => (o.name || "").toLowerCase().includes(roomUserSearch.toLowerCase()) || (o.phone || "").includes(roomUserSearch),
    );

    // Paginated list
    const paginatedRooms = currentList.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                    <h3 className="text-xl font-extrabold text-stone-900 font-heading">Duyệt tin phòng trọ</h3>
                    <p className="text-stone-500 text-xs mt-1">Quản lý duyệt và xác thực các tin đăng phòng trọ trên toàn hệ thống.</p>
                </div>
                <button
                    onClick={onRefresh}
                    className="flex items-center gap-1.5 px-4 py-2 border border-stone-200 rounded-xl text-xs font-bold text-stone-500 hover:bg-stone-50 hover:text-stone-800 cursor-pointer transition-colors shrink-0"
                >
                    <TbRefresh size={14} />
                    Làm mới
                </button>
            </div>

            {/* Landlord query / search bar */}
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                    <TbSearch size={14} className="text-stone-400 shrink-0" />
                    <span className="text-xs font-bold text-stone-600">Lọc theo chủ nhà</span>
                    {roomUserFilter && (
                        <button
                            onClick={() => {
                                setRoomUserFilter(null);
                                setRoomUserSearch("");
                            }}
                            className="ml-auto flex items-center gap-1 text-[10px] font-bold text-amber-600 hover:text-amber-700 cursor-pointer bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full border-none"
                        >
                            <TbX size={11} />
                            Xóa bộ lọc: {roomUserFilter.name}
                        </button>
                    )}
                </div>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <TbSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                            type="text"
                            placeholder="Tìm tên hoặc số điện thoại chủ nhà..."
                            value={roomUserSearch}
                            onChange={(e) => setRoomUserSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleSearchSubmit();
                                }
                            }}
                            className="w-full pl-8 pr-4 py-2 text-xs border border-stone-200 rounded-xl bg-white outline-none focus:border-amber-400 font-medium text-stone-700"
                        />
                    </div>
                    <button
                        onClick={handleSearchSubmit}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer border-none shadow-sm flex items-center gap-1"
                    >
                        <TbSearch size={13} />
                        Tìm
                    </button>
                </div>
                {roomUserSearch && filteredOwners.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {filteredOwners.slice(0, 8).map((owner) => (
                            <button
                                key={owner.name}
                                onClick={() => {
                                    setRoomUserFilter({ name: owner.name });
                                    setRoomUserSearch("");
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-200 rounded-full text-[11px] font-bold text-stone-700 hover:border-amber-400 hover:text-amber-700 cursor-pointer transition-colors"
                            >
                                {owner.avatar ? (
                                    <img src={owner.avatar} alt={owner.name} className="w-4 h-4 rounded-full object-cover" />
                                ) : (
                                    <span className="w-4 h-4 rounded-full bg-stone-200 flex items-center justify-center text-[8px] font-black text-stone-600">
                                        {owner.name.charAt(0).toUpperCase()}
                                    </span>
                                )}
                                {owner.name}
                                <span className="text-stone-400">{owner.phone}</span>
                            </button>
                        ))}
                    </div>
                )}
                {roomUserSearch && filteredOwners.length === 0 && <p className="text-[11px] text-stone-400 font-medium">Không tìm thấy chủ nhà nào.</p>}
            </div>

            {/* Sub tabs */}
            <div className="flex border-b border-stone-200 overflow-x-auto whitespace-nowrap">
                <button
                    onClick={() => setRoomsSubTab("pending_publish")}
                    className={`flex-shrink-0 px-4 py-2 text-sm font-bold border-b-2 transition-colors cursor-pointer ${roomsSubTab === "pending_publish" || !roomsSubTab ? "border-amber-500 text-amber-600" : "border-transparent text-stone-500 hover:text-stone-800"}`}
                >
                    Chờ Duyệt ({pendingPublishRooms.length})
                </button>
                <button
                    onClick={() => setRoomsSubTab("unverified")}
                    className={`flex-shrink-0 px-4 py-2 text-sm font-bold border-b-2 transition-colors cursor-pointer ${roomsSubTab === "unverified" ? "border-amber-500 text-amber-600" : "border-transparent text-stone-500 hover:text-stone-800"}`}
                >
                    Chưa xác thực ({unverifiedRooms.length})
                </button>
                <button
                    onClick={() => setRoomsSubTab("verified")}
                    className={`flex-shrink-0 px-4 py-2 text-sm font-bold border-b-2 transition-colors cursor-pointer ${roomsSubTab === "verified" ? "border-amber-500 text-amber-600" : "border-transparent text-stone-500 hover:text-stone-800"}`}
                >
                    Đã xác thực ({verifiedRooms.length})
                </button>
            </div>

            {currentList.length === 0 ? (
                <div className="text-center py-20 bg-stone-50 border border-dashed border-stone-200 rounded-2xl">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-stone-300 shadow-sm border border-stone-100">
                        <TbHomeCheck size={32} />
                    </div>
                    <p className="text-stone-500 font-bold text-sm">
                        {roomsSubTab === "verified"
                            ? "Không có tin trọ nào đã xác thực"
                            : roomsSubTab === "unverified"
                              ? "Không còn phòng trọ nào chưa xác thực"
                              : "Không còn phòng trọ nào chờ duyệt để công khai"}
                    </p>
                    <p className="text-stone-400 text-xs mt-1">
                        {roomUserFilter ? `Trong danh sách của chủ nhà "${roomUserFilter.name}".` : "Hệ thống đã đạt trạng thái sạch."}
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {paginatedRooms.map((room) => (
                            <div
                                key={room.id}
                                className="flex flex-col p-4 border border-stone-200 rounded-xl hover:border-amber-400 transition-all bg-white group gap-3"
                            >
                                {/* Image & Core specs */}
                                <div className="flex flex-col sm:flex-row gap-4">
                                    {/* Thumbnail with Status Badge at Top-Left */}
                                    <div className="w-full sm:w-32 h-32 md:h-24 rounded-lg bg-stone-100 overflow-hidden shrink-0 relative">
                                        <img
                                            src={room.image}
                                            alt={room.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            onError={(e) => {
                                                e.currentTarget.src = "/images/placeholder.png";
                                            }}
                                        />
                                        {room.status === "pending" && (
                                            <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-[8px] font-black uppercase text-white shadow-sm bg-amber-500">
                                                Chờ duyệt
                                            </div>
                                        )}
                                        {room.status === "available" && !room.is_verified && (
                                            <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-[8px] font-black uppercase text-white shadow-sm bg-blue-500">
                                                Công khai
                                            </div>
                                        )}
                                        {room.status === "available" && room.is_verified && (
                                            <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-[8px] font-black uppercase text-white shadow-sm bg-emerald-500">
                                                Đã xác thực
                                            </div>
                                        )}
                                    </div>

                                    {/* Specifications info panel */}
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                                            {room.room_type === "room"
                                                ? "Phòng trọ"
                                                : room.room_type === "apartment"
                                                  ? "Chung cư"
                                                  : room.room_type === "house"
                                                    ? "Nhà nguyên căn"
                                                    : "Studio"}{" "}
                                            • {room.area_sqm} m²
                                        </span>
                                        <h4 className="font-bold text-stone-900 text-sm line-clamp-1 group-hover:text-amber-600 transition-colors leading-snug">
                                            {room.title}
                                        </h4>
                                        <div className="flex items-center gap-1.5 text-stone-500 text-[0.8rem] mb-1">
                                            <TbMapPin size={12} className="shrink-0 text-stone-400" />
                                            <span className="truncate">{room.address}</span>
                                        </div>
                                        <div className="text-amber-600 font-bold text-[0.9rem]">{formatPrice(room.price_monthly)}</div>
                                    </div>
                                </div>

                                {/* Bottom action bar (User Left, Buttons Right) */}
                                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-3">
                                    {/* Landlord information (Avatar, Name, Phone) on the Left */}
                                    <div className="flex items-center gap-2">
                                        {room.owner_avatar ? (
                                            <img src={room.owner_avatar} alt={room.owner} className="w-6 h-6 rounded-full object-cover shrink-0" />
                                        ) : (
                                            <div className="w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 font-bold text-[10px] shrink-0">
                                                {(room.owner || "U").charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div className="text-[10px]">
                                            <div className="font-bold text-stone-800 leading-tight truncate max-w-[100px]">{room.owner}</div>
                                            <div className="text-stone-400 font-bold flex items-center gap-1">
                                                <TbPhone size={10} />
                                                {room.owner_phone}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons on the Right */}
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={() => onOpenRoomPreview(room.id)}
                                            disabled={loadingPreviewRoom}
                                            className="flex items-center gap-1 px-3 py-1.5 border border-stone-200 rounded-full text-[0.75rem] font-bold text-stone-600 hover:bg-stone-50 hover:text-stone-900 cursor-pointer transition-colors"
                                        >
                                            <TbEye size={12} />
                                            Xem
                                        </button>

                                        {roomsSubTab === "pending_publish" && (
                                            <>
                                                <button
                                                    onClick={() => onRejectRoom(room.id, room.title)}
                                                    className="flex items-center gap-1 px-3 py-1.5 border border-red-100 bg-red-50 rounded-full text-[0.75rem] font-bold text-red-600 hover:bg-red-100 cursor-pointer transition-colors"
                                                >
                                                    <TbX size={12} />
                                                    Từ chối
                                                </button>
                                                <button
                                                    onClick={() => onApprovePublish(room.id, room.title)}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 border border-amber-500 rounded-full text-[0.75rem] font-bold text-white hover:bg-amber-600 cursor-pointer transition-colors shadow-sm"
                                                >
                                                    <TbCheck size={12} />
                                                    Duyệt
                                                </button>
                                            </>
                                        )}

                                        {roomsSubTab === "unverified" && (
                                            <>
                                                <button
                                                    onClick={() => onRejectRoom(room.id, room.title)}
                                                    className="flex items-center gap-1 px-3 py-1.5 border border-red-100 bg-red-50 rounded-full text-[0.75rem] font-bold text-red-600 hover:bg-red-100 cursor-pointer transition-colors"
                                                >
                                                    <TbX size={12} />
                                                    Gỡ tin
                                                </button>
                                                <button
                                                    onClick={() => onApproveRoom(room.id, room.title)}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 border border-amber-500 rounded-full text-[0.75rem] font-bold text-white hover:bg-amber-600 cursor-pointer transition-colors shadow-sm"
                                                >
                                                    <TbCheck size={12} />
                                                    Xác thực
                                                </button>
                                            </>
                                        )}

                                        {roomsSubTab === "verified" && (
                                            <>
                                                <button
                                                    onClick={() => onRejectRoom(room.id, room.title)}
                                                    className="flex items-center gap-1 px-3 py-1.5 border border-red-100 bg-red-50 rounded-full text-[0.75rem] font-bold text-red-600 hover:bg-red-100 cursor-pointer transition-colors"
                                                >
                                                    <TbX size={12} />
                                                    Gỡ tin
                                                </button>
                                                <button
                                                    onClick={() => onCancelVerification(room.id, room.title)}
                                                    className="flex items-center gap-1 px-3 py-1.5 border border-amber-200 bg-amber-50 rounded-full text-[0.75rem] font-bold text-amber-600 hover:bg-amber-100 cursor-pointer transition-colors"
                                                >
                                                    <TbX size={12} />
                                                    Hủy xác thực
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination Bar */}
                    {Math.ceil(currentList.length / ITEMS_PER_PAGE) > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-6">
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="w-8 h-8 flex items-center justify-center rounded-full border border-stone-200 text-stone-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-50 transition-colors cursor-pointer"
                            >
                                <TbChevronLeft size={12} strokeWidth={3.5} />
                            </button>

                            {(() => {
                                const totalPages = Math.ceil(currentList.length / ITEMS_PER_PAGE);
                                let startPage = Math.max(1, currentPage - 2);
                                let endPage = Math.min(totalPages, startPage + 4);
                                if (endPage - startPage < 4) {
                                    startPage = Math.max(1, endPage - 4);
                                }
                                const pages = [];
                                for (let i = startPage; i <= endPage; i++) {
                                    pages.push(i);
                                }
                                return pages.map((pageNum) => (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`w-8 h-8 flex items-center justify-center rounded-full border text-xs font-bold transition-colors cursor-pointer ${
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
                                onClick={() => setCurrentPage((prev) => Math.min(Math.ceil(currentList.length / ITEMS_PER_PAGE), prev + 1))}
                                disabled={currentPage === Math.ceil(currentList.length / ITEMS_PER_PAGE)}
                                className="w-8 h-8 flex items-center justify-center rounded-full border border-stone-200 text-stone-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-50 transition-colors cursor-pointer"
                            >
                                <TbChevronRight size={12} strokeWidth={3.5} />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
