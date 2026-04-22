import { useState } from 'react';
import RoomCard from './RoomCard.jsx';

const PAGE_SIZE = 15;

/* ============================================
   RoomGrid Component – paginated grid of cards
   ============================================ */
export default function RoomGrid({ rooms, onRoomClick, isLoading }) {
    const [page, setPage] = useState(1);
    const totalPages = Math.ceil(rooms.length / PAGE_SIZE);
    const paginatedRooms = rooms.slice(0, page * PAGE_SIZE);
    const hasMore = page < totalPages;

    // Reset to page 1 when rooms change
    const handleLoadMore = () => setPage((p) => p + 1);

    if (isLoading) {
        return (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={i} />
                ))}
            </div>
        );
    }

    if (rooms.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-8 gap-4 bg-white rounded-2xl border border-stone-200">
                <div className="w-[72px] h-[72px] bg-amber-100 rounded-full flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                        <path d="M8 11h6M11 8v6" />
                    </svg>
                </div>
                <h3 className="text-[1.1rem] font-semibold text-stone-900 m-0" style={{ fontFamily: 'var(--font-heading)' }}>
                    Không tìm thấy phòng nào
                </h3>
                <p className="text-stone-500 text-[0.9rem] text-center m-0">
                    Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm khác nhé!
                </p>
            </div>
        );
    }

    return (
        <div>
            {/* Grid */}
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
                {paginatedRooms.map((room, idx) => (
                    <div
                        key={room.listing_id}
                        style={{
                            animation: 'fadeInUp 0.4s ease forwards',
                            animationDelay: `${Math.min(idx % PAGE_SIZE, 8) * 60}ms`,
                            opacity: 0,
                        }}
                    >
                        <RoomCard
                            room={room}
                            onClick={() => onRoomClick(room)}
                            style={{ height: '100%' }}
                        />
                    </div>
                ))}
            </div>

            {/* Load more */}
            {hasMore && (
                <div className="flex justify-center mt-8">
                    <button
                        onClick={handleLoadMore}
                        className="btn-secondary py-3 px-8"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m6 9 6 6 6-6" />
                        </svg>
                        Xem thêm ({rooms.length - paginatedRooms.length} phòng còn lại)
                    </button>
                </div>
            )}

            {/* Total shown */}
            <p className="text-center mt-4 text-stone-400 text-[0.825rem]">
                Hiển thị {paginatedRooms.length} / {rooms.length} phòng
            </p>
        </div>
    );
}

function SkeletonCard() {
    return (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            <div className="skeleton h-[200px]" />
            <div className="p-4 flex flex-col gap-3">
                <div className="flex justify-between">
                    <div className="skeleton h-5 w-[45%]" />
                    <div className="skeleton h-5 w-[20%]" />
                </div>
                <div className="skeleton h-4 w-[90%]" />
                <div className="skeleton h-3.5 w-[70%]" />
                <div className="flex gap-1.5">
                    <div className="skeleton h-[22px] w-[60px] rounded-full" />
                    <div className="skeleton h-[22px] w-[70px] rounded-full" />
                    <div className="skeleton h-[22px] w-[55px] rounded-full" />
                </div>
            </div>
        </div>
    );
}
