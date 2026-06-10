import AppIcon from '../common/AppIcon.jsx';
import { formatPrice } from '../../utils/formatters.js';

/**
 * Card nhỏ hiển thị thông tin phòng trọ được gắn vào bài đăng diễn đàn.
 * @param {object} room  - room object từ DB (rooms table)
 * @param {function} onViewDetail - callback khi bấm "Xem chi tiết"
 * @param {boolean} compact - nếu true, hiển thị dạng nhỏ gọn hơn
 */
export default function RoomAttachCard({ room, onViewDetail, compact = false }) {
    if (!room) return null;

    const thumbnail = room.media_contact?.images?.[0]?.url || room.media_contact?.images?.[0] || null;
    const title = room.title || 'Phòng trọ';
    const price = room.price_monthly;
    const location = [room.address, room.district, room.city].filter(Boolean).join(', ');
    const roomType = room.room_type;

    const roomTypeLabel = {
        studio: 'Studio',
        shared: 'Phòng ở ghép',
        private: 'Phòng riêng',
        apartment: 'Căn hộ',
        house: 'Nhà nguyên căn',
    }[roomType] || 'Phòng trọ';

    return (
        <div className="border border-amber-200 bg-amber-50/50 rounded-xl overflow-hidden mt-3">
            <div className="flex items-stretch gap-0">
                {/* Thumbnail */}
                <div className={`${compact ? 'w-20 h-20' : 'w-24 h-24 sm:w-28 sm:h-28'} shrink-0 bg-stone-100 relative overflow-hidden`}>
                    {thumbnail ? (
                        <img
                            src={thumbnail}
                            alt={title}
                            className="w-full h-full object-cover"
                            onError={e => { e.currentTarget.style.display = 'none'; }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300">
                            <AppIcon name="home" size={28} />
                        </div>
                    )}
                    <div className="absolute top-1.5 left-1.5">
                        <span className="bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
                            {roomTypeLabel}
                        </span>
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                    <div>
                        <div className="flex items-start gap-1.5 mb-1">
                            <AppIcon name="home" size={12} className="text-amber-500 shrink-0 mt-0.5" />
                            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wide">Phòng trọ đính kèm</span>
                        </div>
                        <h4 className="font-bold text-stone-900 text-[0.82rem] line-clamp-2 leading-snug">{title}</h4>
                        {location && (
                            <p className="text-stone-500 text-[0.72rem] mt-0.5 line-clamp-1 flex items-center gap-1">
                                <AppIcon name="address" size={10} />
                                {location}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center justify-between mt-2 gap-2">
                        <span className="text-amber-600 font-extrabold text-sm">
                            {price ? formatPrice(price) : 'Liên hệ'}
                        </span>
                        {onViewDetail && (
                            <button
                                onClick={e => { e.stopPropagation(); onViewDetail(room); }}
                                className="shrink-0 flex items-center gap-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white text-[0.72rem] font-bold rounded-lg border-none cursor-pointer transition-colors"
                            >
                                <AppIcon name="chevronRight" size={11} />
                                Xem chi tiết
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
