import React from 'react';
import { 
    TbRefresh, 
    TbSearch, 
    TbX, 
    TbHomeCheck, 
    TbCalendar, 
    TbMapPin, 
    TbPhone, 
    TbEye, 
    TbCheck, 
    TbShieldCheck 
} from 'react-icons/tb';
import { formatPrice } from '../../utils/formatters';

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
    loadingPreviewRoom
}) {

    const baseRooms = roomUserFilter
        ? allRooms.filter(r => r.owner === roomUserFilter.name || r.owner_id === roomUserFilter.id)
        : allRooms;
    const unverifiedRooms = baseRooms.filter(r => !r.is_verified);
    const verifiedRooms = baseRooms.filter(r => r.is_verified);
    const currentList = roomsSubTab === 'verified' ? verifiedRooms : unverifiedRooms;

    // Unique owners for user filter
    const uniqueOwners = [];
    const seenOwners = new Set();
    allRooms.forEach(r => {
        const key = r.owner;
        if (!seenOwners.has(key)) {
            seenOwners.add(key);
            uniqueOwners.push({ name: r.owner, phone: r.owner_phone });
        }
    });
    const filteredOwners = uniqueOwners.filter(o =>
        (o.name || '').toLowerCase().includes(roomUserSearch.toLowerCase()) ||
        (o.phone || '').includes(roomUserSearch)
    );

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

            {/* User filter bar */}
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                    <TbSearch size={14} className="text-stone-400 shrink-0" />
                    <span className="text-xs font-bold text-stone-600">Lọc theo chủ nhà</span>
                    {roomUserFilter && (
                        <button
                            onClick={() => { setRoomUserFilter(null); setRoomUserSearch(''); }}
                            className="ml-auto flex items-center gap-1 text-[10px] font-bold text-amber-600 hover:text-amber-700 cursor-pointer bg-amber-55 border border-amber-100 px-2 py-1 rounded-full border-none"
                        >
                            <TbX size={11} />
                            Xóa bộ lọc: {roomUserFilter.name}
                        </button>
                    )}
                </div>
                <div className="relative">
                    <TbSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                        type="text"
                        placeholder="Tìm tên hoặc số điện thoại chủ nhà..."
                        value={roomUserSearch}
                        onChange={e => setRoomUserSearch(e.target.value)}
                        className="w-full pl-8 pr-4 py-2 text-xs border border-stone-200 rounded-xl bg-white outline-none focus:border-amber-400 font-medium text-stone-700"
                    />
                </div>
                {roomUserSearch && filteredOwners.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {filteredOwners.slice(0, 8).map(owner => (
                            <button
                                key={owner.name}
                                onClick={() => { setRoomUserFilter({ name: owner.name }); setRoomUserSearch(''); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-200 rounded-full text-[11px] font-bold text-stone-700 hover:border-amber-400 hover:text-amber-700 cursor-pointer transition-colors"
                            >
                                <span className="w-4 h-4 rounded-full bg-stone-200 flex items-center justify-center text-[8px] font-black text-stone-600">{owner.name.charAt(0)}</span>
                                {owner.name}
                                <span className="text-stone-400">{owner.phone}</span>
                            </button>
                        ))}
                    </div>
                )}
                {roomUserSearch && filteredOwners.length === 0 && (
                    <p className="text-[11px] text-stone-400 font-medium">Không tìm thấy chủ nhà nào.</p>
                )}
            </div>

            {/* Sub tabs */}
            <div className="flex border-b border-stone-200 overflow-x-auto whitespace-nowrap">
                <button
                    onClick={() => setRoomsSubTab('pending_verification')}
                    className={`flex-shrink-0 px-4 py-2 text-sm font-bold border-b-2 transition-colors cursor-pointer ${roomsSubTab === 'pending_verification' ? 'border-amber-500 text-amber-600' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
                >
                    Chờ duyệt ({unverifiedRooms.length})
                </button>
                <button
                    onClick={() => setRoomsSubTab('verified')}
                    className={`flex-shrink-0 px-4 py-2 text-sm font-bold border-b-2 transition-colors cursor-pointer ${roomsSubTab === 'verified' ? 'border-amber-500 text-amber-600' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
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
                        {roomsSubTab === 'verified' ? 'Không có tin trọ nào đã xác thực' : 'Không còn phòng trọ nào chờ duyệt'}
                    </p>
                    <p className="text-stone-400 text-xs mt-1">
                        {roomUserFilter ? `Trong danh sách của chủ nhà "${roomUserFilter.name}".` : 'Hệ thống đã đạt trạng thái sạch.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentList.map(room => (
                        <div
                            key={room.id}
                            className="border border-stone-200 rounded-2xl overflow-hidden hover:shadow-md hover:border-stone-300 transition-all duration-200 bg-white flex flex-col"
                        >
                            {/* Image */}
                            <div className="relative h-44 bg-stone-100 shrink-0">
                                <img src={room.image} alt={room.title} className="w-full h-full object-cover" onError={e => { e.currentTarget.src = '/images/placeholder.png'; }} />
                                <div className="absolute top-2.5 left-2.5 bg-stone-900/75 text-white px-2.5 py-1 rounded-full text-[10px] font-bold">
                                    {room.room_type === 'room' ? 'Phòng trọ' : room.room_type === 'apartment' ? 'Chung cư' : room.room_type === 'house' ? 'Nhà nguyên căn' : 'Studio'} • {room.area_sqm} m²
                                </div>
                                {room.is_verified && (
                                    <div className="absolute top-2.5 right-2.5 bg-emerald-500 text-white px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1">
                                        <TbShieldCheck size={10} />
                                        Đã xác thực
                                    </div>
                                )}
                            </div>

                            {/* Body */}
                            <div className="p-4 flex flex-col flex-1 space-y-3">
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                                            <TbCalendar size={11} />
                                            {room.date}
                                        </span>
                                        <span className="text-amber-600 text-sm font-black font-heading">{formatPrice(room.price_monthly)}/tháng</span>
                                    </div>
                                    <h4 className="text-stone-900 font-extrabold text-sm leading-snug font-heading line-clamp-2">{room.title}</h4>
                                    <div className="text-xs text-stone-500 flex items-start gap-1">
                                        <TbMapPin size={13} className="shrink-0 text-stone-400 mt-0.5" />
                                        <span className="line-clamp-1">{room.address}</span>
                                    </div>
                                </div>

                                {/* Owner & actions */}
                                <div className="border-t border-stone-100 pt-3 mt-auto flex items-center justify-between gap-2 flex-wrap">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 font-bold text-[10px] shrink-0">
                                            {(room.owner || 'U').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="text-[10px]">
                                            <div className="font-bold text-stone-800 leading-tight">{room.owner}</div>
                                            <div className="text-stone-400 font-bold flex items-center gap-1"><TbPhone size={10} />{room.owner_phone}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={() => onOpenRoomPreview(room.id)}
                                            disabled={loadingPreviewRoom}
                                            className="flex items-center gap-1 bg-stone-100 hover:bg-stone-200 text-stone-600 px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-colors border-none"
                                        >
                                            <TbEye size={12} />
                                            Xem
                                        </button>
                                        {roomsSubTab === 'verified' ? (
                                            <button
                                                onClick={() => onCancelVerification(room.id, room.title)}
                                                className="flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-600 px-3 py-1.5 rounded-lg text-[10px] font-bold border border-amber-100 cursor-pointer transition-colors"
                                            >
                                                <TbX size={12} />
                                                Hủy xác thực
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => onRejectRoom(room.id, room.title)}
                                                    className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-[10px] font-bold border border-red-100 cursor-pointer transition-colors"
                                                >
                                                    <TbX size={12} />
                                                    Từ chối
                                                </button>
                                                <button
                                                    onClick={() => onApproveRoom(room.id, room.title)}
                                                    className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold border-none cursor-pointer shadow-sm shadow-amber-500/20 transition-all"
                                                >
                                                    <TbCheck size={12} />
                                                    Phê duyệt
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
