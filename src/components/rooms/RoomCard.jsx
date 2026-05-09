import { AMENITIES, ROOM_TYPES } from '../../data/constants.js';
import { formatPriceShort, formatArea, formatAddressShort, truncate } from '../../utils/formatters.js';
import AppIcon from '../common/AppIcon.jsx';

/* ============================================
   RoomCard Component
   Displays summary info for a single listing
   ============================================ */
export default function RoomCard({ room, onClick, style }) {
    const { basic_info, room_features, media_contact, metadata, monthly_costs } = room;
    const mainImage = media_contact.images?.[0]?.url || `https://picsum.photos/seed/${room.listing_id}/600/400`;
    const isAvailable = metadata.status === 'available';

    const amenityBadges = room_features.amenities.slice(0, 4);
    const extraCount = room_features.amenities.length - 4;

    return (
        <article
            onClick={onClick}
            style={style}
            className="bg-white rounded-md border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.05)] overflow-hidden cursor-pointer transition-all duration-250 ease-out flex flex-row sm:flex-col hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)]"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(); }}
            aria-label={`Xem chi tiết ${basic_info.title}`}
        >
            {/* Image */}
            <div className="relative overflow-hidden w-[130px] sm:w-full h-auto sm:h-[200px] shrink-0 group/img">
                <img
                    src={mainImage}
                    alt={basic_info.title}
                    className="w-full h-full object-cover transition-transform duration-400 ease-out group-hover/img:scale-[1.04]"
                    loading="lazy"
                    onError={(e) => { e.currentTarget.src = `https://picsum.photos/seed/fallback${room.listing_id}/600/400`; }}
                />
                {/* Status badge overlay */}
                <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col sm:flex-row gap-2">
                    <span
                        className={`backdrop-blur-sm ${isAvailable ? 'badge badge-green bg-green-100/90' : 'badge badge-red bg-red-100/90'} px-2.5 py-1 text-[0.75rem] gap-2 w-fit`}
                    >
                        <span className={`w-1.5 h-1.5 rounded-full inline-block shrink-0 ${isAvailable ? 'bg-green-600' : 'bg-red-600'}`} />
                        <span className="font-semibold tracking-tight">{isAvailable ? 'Còn phòng' : 'Đã cho thuê'}</span>
                    </span>
                    {metadata.is_verified && (
                        <span className="badge badge-blue backdrop-blur-sm bg-blue-100/90 px-2.5 py-1 text-[0.75rem] gap-1.5">
                            <AppIcon name="verified" size={14} strokeWidth={2.5} />
                            <span className="font-semibold tracking-tight">Đã xác minh</span>
                        </span>
                    )}
                </div>
                {/* Image count badge */}
                {media_contact.images.length > 1 && (
                    <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 bg-black/55 backdrop-blur-xs text-white rounded-lg px-1.5 py-0.5 sm:px-2 sm:py-1 text-[0.65rem] sm:text-xs font-medium flex items-center gap-1">
                        <AppIcon name="photo" size={12} />
                        <span className="sm:hidden">{media_contact.images.length}</span>
                        <span className="hidden sm:inline">{media_contact.images.length}</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-3 sm:p-4 flex flex-col gap-1.5 sm:gap-2 flex-1 min-w-0">
                {/* Price */}
                <div className="flex justify-between items-start">
                    <span
                        className="text-[1.1rem] sm:text-[1.2rem] font-bold text-amber-600 tracking-[-0.01em]"
                        style={{ fontFamily: 'var(--font-heading)' }}
                    >
                        {formatPriceShort(basic_info.price_monthly)}
                    </span>
                </div>

                {/* Title */}
                <h3
                    className="text-[0.85rem] sm:text-[0.95rem] font-semibold text-stone-900 leading-[1.3] sm:leading-[1.4] m-0 line-clamp-2 sm:line-clamp-none sm:truncate"
                    style={{ fontFamily: 'var(--font-heading)' }}
                    title={basic_info.title}
                >
                    {truncate(basic_info.title, 65)}
                </h3>

                {/* Address */}
                <div className="flex items-center gap-1.5 text-stone-500 text-[0.75rem] sm:text-[0.825rem]">
                    <span className="shrink-0"><AppIcon name="address" size={12} /></span>
                    <span className="truncate">{formatAddressShort(basic_info.address)}</span>
                </div>

                {/* Divider */}
                <div className="h-px bg-stone-100 my-1" />

                {/* Info & Amenities */}
                <div className="flex flex-col gap-2 mt-auto mb-1 sm:mb-2">
                    {/* Row 1: Room Type & Area */}
                    <div className="flex items-center gap-2">
                        <span className="text-[0.6rem] sm:text-[0.7rem] font-bold uppercase tracking-wider text-stone-400 bg-stone-50 px-1.5 py-0.5 rounded border border-stone-100">
                            {ROOM_TYPES[basic_info.room_type] || 'Phòng'}
                        </span>
                        <span className="badge badge-amber px-2 py-0.5 text-[0.75rem] sm:text-[0.8rem] gap-1.5 font-semibold">
                            <AppIcon name="area" size={12} />
                            {formatArea(basic_info.area_sqm)}
                        </span>
                    </div>

                    {/* Row 2: Quick Utility Icons */}
                    <div className="flex items-center gap-1.5 text-stone-400">
                        {room_features.amenities.slice(0, 5).map(key => (
                            <div key={key} title={AMENITIES[key]?.label} className="w-6 h-6 rounded-full bg-stone-50 flex items-center justify-center border border-stone-100">
                                <AppIcon name={key} size={12} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Landlord Info - Mini Footer */}
                <div className="flex items-center gap-1.5 sm:gap-2 mt-auto pt-2 border-t border-stone-50">
                    {media_contact.contact.avatar ? (
                        <img
                            src={media_contact.contact.avatar}
                            alt={media_contact.contact.name}
                            className="w-6 h-6 rounded-full object-cover border border-stone-100"
                        />
                    ) : (
                        <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center text-[0.6rem] font-bold text-amber-700">
                            {media_contact.contact.name?.charAt(0)}
                        </div>
                    )}
                    <span className="text-[0.75rem] text-stone-400 font-medium truncate">
                        {media_contact.contact.name}
                    </span>
                    <div className="ml-auto flex items-center gap-1 text-[0.7rem] text-stone-300">
                        <AppIcon name="eye" size={10} />
                        {metadata.total_views || 0}
                    </div>
                </div>
            </div>
        </article>
    );
}
