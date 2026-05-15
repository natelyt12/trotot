import RoomCard from './RoomCard.jsx';

/* ============================================
   RoomGrid Component – grid of RoomCards
   Flat design, amber palette
   ============================================ */
export default function RoomGrid({ rooms, onRoomClick, isLoading }) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {Array.from({ length: 15 }).map((_, i) => (
                    <div key={i} style={{ animationDelay: `${i * 60}ms` }} className="animate-fade-in">
                        <SkeletonCard />
                    </div>
                ))}
            </div>
        );
    }

    if (rooms.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-8 gap-4 bg-white rounded-xl border border-stone-200">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                        <path d="M8 11h6M11 8v6" />
                    </svg>
                </div>
                <h3
                    className="text-base font-semibold text-stone-900 m-0"
                    style={{ fontFamily: 'var(--font-heading)' }}
                >
                    Không tìm thấy phòng nào
                </h3>
                <p className="text-stone-500 text-sm text-center m-0">
                    Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm khác nhé!
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {rooms.map((room, idx) => (
                <div
                    key={room.listing_id}
                    className="animate-fade-in-up"
                    style={{
                        animationDelay: `${Math.min(idx % 12, 8) * 60}ms`,
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
    );
}

function SkeletonCard() {
    return (
        <div className="bg-white rounded border border-stone-200 overflow-hidden flex flex-row sm:flex-col">
            <div className="skeleton w-[130px] sm:w-full sm:h-[200px] shrink-0" />
            <div className="p-3 sm:p-4 flex flex-col gap-3 flex-1">
                <div className="skeleton h-5 w-[45%]" />
                <div className="skeleton h-4 w-[90%]" />
                <div className="skeleton h-3.5 w-[70%]" />
                <div className="flex gap-1.5">
                    <div className="skeleton h-5 w-14 rounded" />
                    <div className="skeleton h-5 w-16 rounded" />
                </div>
            </div>
        </div>
    );
}
