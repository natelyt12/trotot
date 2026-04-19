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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={i} />
                ))}
            </div>
        );
    }

    if (rooms.length === 0) {
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4rem 2rem',
                    gap: '1rem',
                    background: '#fff',
                    borderRadius: '1rem',
                    border: '1px solid #e7e5e4',
                }}
            >
                <div
                    style={{
                        width: '72px',
                        height: '72px',
                        background: '#fef3c7',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                        <path d="M8 11h6M11 8v6" />
                    </svg>
                </div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 600, color: '#1c1917', margin: 0 }}>
                    Không tìm thấy phòng nào
                </h3>
                <p style={{ color: '#78716c', fontSize: '0.9rem', textAlign: 'center', margin: 0 }}>
                    Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm khác nhé!
                </p>
            </div>
        );
    }

    return (
        <div>
            {/* Grid */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '1.25rem',
                }}
            >
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
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                    <button
                        onClick={handleLoadMore}
                        className="btn-secondary"
                        style={{ padding: '0.75rem 2rem' }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m6 9 6 6 6-6" />
                        </svg>
                        Xem thêm ({rooms.length - paginatedRooms.length} phòng còn lại)
                    </button>
                </div>
            )}

            {/* Total shown */}
            <p style={{ textAlign: 'center', marginTop: '1rem', color: '#a8a29e', fontSize: '0.825rem' }}>
                Hiển thị {paginatedRooms.length} / {rooms.length} phòng
            </p>
        </div>
    );
}

function SkeletonCard() {
    return (
        <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #e7e5e4', overflow: 'hidden' }}>
            <div className="skeleton" style={{ height: '200px' }} />
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div className="skeleton" style={{ height: '20px', width: '45%' }} />
                    <div className="skeleton" style={{ height: '20px', width: '20%' }} />
                </div>
                <div className="skeleton" style={{ height: '16px', width: '90%' }} />
                <div className="skeleton" style={{ height: '14px', width: '70%' }} />
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <div className="skeleton" style={{ height: '22px', width: '60px', borderRadius: '999px' }} />
                    <div className="skeleton" style={{ height: '22px', width: '70px', borderRadius: '999px' }} />
                    <div className="skeleton" style={{ height: '22px', width: '55px', borderRadius: '999px' }} />
                </div>
            </div>
        </div>
    );
}
