import { AMENITIES, ROOM_TYPES } from '../../data/constants.js';
import { formatPriceShort, formatArea, formatAddressShort, truncate } from '../../utils/formatters.js';
import AppIcon from '../common/AppIcon.jsx';
import { useFavorites } from '../../context/FavoritesContext.jsx';
import { useModal } from '../../context/ModalContext.jsx';

/* ============================================
   RoomCard Component
   Flat design, amber palette, no box-shadow
   ============================================ */
export default function RoomCard({ room, onClick, style }) {
    const { basic_info, media_contact, metadata, room_features, id: roomId } = room;
    const { isFavorite, toggleFavorite } = useFavorites();
    const { showModal } = useModal();
    
    const mainImage = media_contact.images?.[0]?.url || `https://picsum.photos/seed/${room.listing_id}/600/400`;
    const isAvailable = metadata.status === 'available';
    const mediaCount = (media_contact.images?.length || 0) + (media_contact.video_urls?.length || 0);
    const hasVideo = media_contact.video_urls?.length > 0;

    const favorited = isFavorite(roomId);

    const handleToggleFavorite = async (e) => {
        e.stopPropagation();
        const result = await toggleFavorite(roomId);
        if (result?.error === 'login_required') {
            showModal({
                title: 'Thông báo',
                message: 'Vui lòng đăng nhập để lưu tin!',
                type: 'warning'
            });
        }
    };

    return (
        <article
            onClick={onClick}
            style={style}
            className="bg-white border border-stone-200 overflow-hidden cursor-pointer flex flex-row sm:flex-col transition-colors duration-200 hover:border-amber-400 rounded-xl group/card"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(); }}
            aria-label={`Xem chi tiết ${basic_info.title}`}
        >
            {/* Image */}
            <div className="relative overflow-hidden w-[130px] sm:w-full shrink-0 sm:h-[200px]">
                <img
                    src={mainImage}
                    alt={basic_info.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                    loading="lazy"
                    onError={(e) => { e.currentTarget.src = `../public/images/placeholder.png`; }}
                />

                {/* Favorite Button */}
                <button
                    onClick={handleToggleFavorite}
                    className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 z-5 border-none cursor-pointer shadow-sm ${
                        favorited 
                        ? 'bg-red-500 text-white' 
                        : 'bg-white/80 text-stone-600 hover:bg-white hover:text-red-500'
                    }`}
                    title={favorited ? "Bỏ lưu tin" : "Lưu tin"}
                >
                    <AppIcon 
                        name="heart" 
                        size={16} 
                        fill={favorited ? "currentColor" : "none"} 
                        strokeWidth={2.5}
                    />
                </button>

                {/* Status + Verified badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                    <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full w-fit text-[0.7rem] font-semibold ${isAvailable
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                            }`}
                    >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isAvailable ? 'bg-green-600' : 'bg-red-600'}`} />
                        {isAvailable ? 'Còn phòng' : 'Đã cho thuê'}
                    </span>

                    {metadata.is_verified && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.7rem] font-semibold bg-blue-100 text-blue-700">
                            <AppIcon name="verified" size={12} strokeWidth={2.5} />
                            Đã xác minh
                        </span>
                    )}
                </div>

                {/* Media count badge */}
                {mediaCount > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white rounded-full px-1.5 py-0.5 text-[0.65rem] font-medium flex items-center gap-1">
                        <AppIcon name={hasVideo ? 'play' : 'photo'} size={11} />
                        <span>{mediaCount}</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-3 sm:p-4 flex flex-col gap-1.5 flex-1 min-w-0">
                {/* Price */}
                <span
                    className="text-[1.1rem] sm:text-[1.2rem] font-bold text-amber-600 tracking-tight leading-none"
                    style={{ fontFamily: 'var(--font-heading)' }}
                >
                    {formatPriceShort(basic_info.price_monthly)}
                </span>

                {/* Title */}
                <h3
                    className="text-sm font-semibold text-stone-900 leading-snug m-0 line-clamp-2 sm:truncate"
                    style={{ fontFamily: 'var(--font-heading)' }}
                    title={basic_info.title}
                >
                    {truncate(basic_info.title, 65)}
                </h3>

                {/* Address */}
                <div className="flex items-center gap-1 text-stone-500 text-[0.75rem]">
                    <span className="shrink-0"><AppIcon name="address" size={11} /></span>
                    <span className="truncate">{formatAddressShort(basic_info.address)}</span>
                </div>

                {/* Divider */}
                <div className="h-px bg-stone-100 my-1" />

                {/* Room type + Area + Amenities */}
                <div className="flex flex-col gap-2 mt-auto">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[0.65rem] font-bold uppercase tracking-wider text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full ">
                            {ROOM_TYPES[basic_info.room_type] || 'Phòng'}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[0.75rem] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                            <AppIcon name="area" size={11} />
                            {formatArea(basic_info.area_sqm)}
                        </span>
                    </div>

                    {/* Amenity icons */}
                    <div className="flex items-center gap-1 text-stone-400">
                        {room_features.amenities.slice(0, 5).map(key => (
                            <div
                                key={key}
                                title={AMENITIES[key]?.label}
                                className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center"
                            >
                                <AppIcon name={key} size={12} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Landlord mini-footer */}
                <div className="flex items-center gap-1.5 mt-auto pt-2 border-t border-stone-100">
                    {media_contact.contact.avatar ? (
                        <img
                            src={media_contact.contact.avatar}
                            alt={media_contact.contact.name}
                            className="w-5 h-5 rounded-full object-cover border border-stone-200"
                        />
                    ) : (
                        <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center text-[0.55rem] font-bold text-amber-700 shrink-0">
                            {media_contact.contact.name?.charAt(0)}
                        </div>
                    )}
                    <span className="text-[0.72rem] text-stone-400 font-medium truncate">
                        {media_contact.contact.name}
                    </span>
                    <div className="ml-auto flex items-center gap-0.5 text-[0.65rem] text-stone-300">
                        <AppIcon name="eye" size={10} />
                        {metadata.total_views || 0}
                    </div>
                </div>
            </div>
        </article>
    );
}
