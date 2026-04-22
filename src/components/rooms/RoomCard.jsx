import { AMENITIES } from '../../data/constants.js';
import { formatPriceShort, formatArea, formatAddressShort, truncate } from '../../utils/formatters.js';
import AppIcon from '../common/AppIcon.jsx';

/* ============================================
   RoomCard Component
   Displays summary info for a single listing
   ============================================ */
export default function RoomCard({ room, onClick, style }) {
    const { basic_info, room_features, media_contact, metadata } = room;
    const mainImage = media_contact.images?.[0] || `https://picsum.photos/seed/${room.listing_id}/600/400`;
    const isAvailable = metadata.status === 'available';

    const amenityBadges = room_features.amenities.slice(0, 4);
    const extraCount = room_features.amenities.length - 4;

    return (
        <article
            onClick={onClick}
            style={style}
            className="bg-white rounded-md border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.05)] overflow-hidden cursor-pointer transition-all duration-[250ms] ease-out flex flex-col hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)]"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(); }}
            aria-label={`Xem chi tiết ${basic_info.title}`}
        >
            {/* Image */}
            <div className="relative overflow-hidden h-[200px] shrink-0 group/img">
                <img
                    src={mainImage}
                    alt={basic_info.title}
                    className="w-full h-full object-cover transition-transform duration-[400ms] ease-out group-hover/img:scale-[1.04]"
                    loading="lazy"
                    onError={(e) => { e.currentTarget.src = `https://picsum.photos/seed/fallback${room.listing_id}/600/400`; }}
                />
                {/* Status badge overlay */}
                <div className="absolute top-3 left-3 flex gap-1.5">
                    <span
                        className={`backdrop-blur-sm ${isAvailable ? 'badge badge-green bg-green-100/90' : 'badge badge-red bg-red-100/90'}`}
                    >
                        <span className={`w-1.5 h-1.5 rounded-full inline-block ${isAvailable ? 'bg-green-600' : 'bg-red-600'}`} />
                        {isAvailable ? 'Còn phòng' : 'Đã cho thuê'}
                    </span>
                    {metadata.is_verified && (
                        <span className="badge badge-blue backdrop-blur-sm bg-blue-100/90">
                            <AppIcon name="verified" size={12} strokeWidth={2.5} />
                            Đã xác minh
                        </span>
                    )}
                </div>
                {/* Image count badge */}
                {media_contact.images.length > 1 && (
                    <div className="absolute bottom-3 right-3 bg-black/55 backdrop-blur-[4px] text-white rounded-lg px-2 py-1 text-xs font-medium flex items-center gap-1">
                        <AppIcon name="photo" size={14} />
                        {media_contact.images.length}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col gap-2 flex-1">
                {/* Price & Area */}
                <div className="flex justify-between items-start">
                    <span
                        className="text-[1.2rem] font-bold text-amber-600 tracking-[-0.01em]"
                        style={{ fontFamily: 'var(--font-heading)' }}
                    >
                        {formatPriceShort(basic_info.price_monthly)}
                    </span>
                    <span className="text-[0.8rem] text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md font-medium">
                        {formatArea(basic_info.area_sqm)}
                    </span>
                </div>

                {/* Title */}
                <h3
                    className="text-[0.95rem] font-semibold text-stone-900 leading-[1.4] m-0"
                    style={{ fontFamily: 'var(--font-heading)' }}
                >
                    {truncate(basic_info.title, 65)}
                </h3>

                {/* Address */}
                <div className="flex items-center gap-1.5 text-stone-500 text-[0.825rem]">
                    <AppIcon name="address" size={14} />
                    <span>{formatAddressShort(basic_info.address)}</span>
                </div>

                {/* Divider */}
                <div className="h-px bg-stone-100 my-1" />

                {/* Amenities */}
                <div className="flex flex-wrap gap-1.5">
                    {amenityBadges.map((key) => (
                        <span key={key} className="badge badge-amber">
                            <AppIcon name={key} size={12} />
                            {AMENITIES[key]?.label || key}
                        </span>
                    ))}
                    {extraCount > 0 && (
                        <span className="badge badge-gray">+{extraCount} khác</span>
                    )}
                    {room_features.amenities.length === 0 && (
                        <span className="badge badge-gray">Phòng trống</span>
                    )}
                </div>

                {/* Bottom row: parking + bathroom */}
                <div className="flex gap-2 mt-auto pt-1">
                    {room_features.parking.has_parking && (
                        <span className="flex items-center gap-1 text-[0.775rem] text-stone-600">
                            <AppIcon name="parking" size={14} />
                            Chỗ đỗ xe
                        </span>
                    )}
                    <span className="flex items-center gap-1 text-[0.775rem] text-stone-600">
                        <AppIcon name="bathroom" size={14} />
                        WC {room_features.bathroom_type === 'private' ? 'riêng' : 'chung'}
                    </span>
                </div>
            </div>
        </article>
    );
}
