import AppIcon from "../common/AppIcon.jsx";
import { formatPrice } from "../../utils/formatters.js";

/**
 * Card nhỏ hiển thị thông tin phòng trọ được gắn vào bài đăng diễn đàn.
 * @param {object} room  - room object từ DB (rooms table)
 * @param {function} onViewDetail - callback khi bấm "Xem chi tiết"
 * @param {boolean} compact - nếu true, hiển thị dạng nhỏ gọn hơn
 */
export default function RoomAttachCard({ room, onViewDetail, compact = false }) {
    if (!room) return null;

    const thumbnail = room.media_contact?.images?.[0]?.url || room.media_contact?.images?.[0] || null;
    const title = room.title || "Phòng trọ";
    const price = room.price_monthly;
    const location = [room.address, room.district, room.city].filter(Boolean).join(", ");
    const roomType = room.room_type;

    const roomTypeLabel =
        {
            studio: "Studio",
            shared: "Phòng ở ghép",
            private: "Phòng riêng",
            apartment: "Căn hộ",
            house: "Nhà nguyên căn",
        }[roomType] || "Phòng trọ";

    return (
        <div className="border border-amber-200 bg-amber-50/30 rounded-xl overflow-hidden mt-3 group hover:border-amber-300 transition-colors">
            <div className="flex flex-row items-stretch gap-0">
                {/* Thumbnail */}
                <div className="w-28 sm:w-36 shrink-0 bg-stone-100 relative overflow-hidden">
                    {thumbnail ? (
                        <img
                            src={thumbnail}
                            alt={title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                                e.currentTarget.style.display = "none";
                            }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300">
                            <AppIcon name="home" size={28} />
                        </div>
                    )}
                    <div className="absolute top-0 left-1.5">
                        <span className="bg-amber-50 border border-amber-200 text-amber-700 text-[9px] font-medium px-1.5 py-0.5 rounded-full tracking-wider">
                            {roomTypeLabel}
                        </span>
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between min-w-0">
                    <div>
                        <div className="flex items-center gap-1.5 mb-1">
                            <AppIcon name="home" size={12} className="text-amber-500" />
                            <span className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider">Phòng trọ đính kèm</span>
                        </div>
                        <h4 className="font-semibold text-stone-900 text-[0.95rem] md:text-base line-clamp-2 leading-tight mb-1 group-hover:text-amber-600 transition-colors">
                            {title}
                        </h4>
                        {location && (
                            <p className="text-stone-500 text-xs mt-0.5 line-clamp-1 flex items-center gap-1.5">
                                <AppIcon name="address" size={12} className="shrink-0" />
                                {location}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between mt-2 gap-2">
                        <div className="flex items-baseline gap-1">
                            <span className="text-amber-600 font-bold text-base md:text-lg">{price ? formatPrice(price) : "Liên hệ"}</span>
                        </div>
                        {onViewDetail && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onViewDetail(room);
                                }}
                                className="shrink-0 flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[0.8rem] font-medium rounded-lg border-none cursor-pointer transition-colors shadow-sm"
                            >
                                Xem chi tiết
                                <AppIcon name="chevronRight" size={12} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
