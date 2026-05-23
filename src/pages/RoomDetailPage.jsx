import { useState, useEffect, useRef } from 'react';
import { useModal } from '../context/ModalContext';
import { incrementRoomViews } from '../services/roomService';
import { AMENITIES, STATUS_LABELS, CURFEW_LABELS, BATHROOM_TYPES, LAUNDRY_TYPES } from '../constants/constants.js';
import { UNIVERSITIES } from '../constants/universities';
import {
    formatPrice,
    formatArea,
    formatDate,
    formatElectricity,
    formatWater,
    formatDeposit,
} from '../utils/formatters.js';
import AppIcon from '../components/common/AppIcon.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';
import CommentSection from '../components/rooms/CommentSection.jsx';
import LandlordCard from '../components/rooms/LandlordCard.jsx';


/* ============================================
   Helper to parse and extract embeddable video URL for YouTube & TikTok
   ============================================ */
const getEmbedUrl = (url) => {
    if (!url) return null;
    const trimmed = url.trim();
    
    // 1. YouTube Standard, Mobile, and Shorts
    if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
        let videoId = '';
        if (trimmed.includes('watch?v=')) {
            const parts = trimmed.split('watch?v=')[1];
            videoId = parts.split('&')[0];
        } else if (trimmed.includes('youtu.be/')) {
            const parts = trimmed.split('youtu.be/')[1];
            videoId = parts.split('?')[0];
        } else if (trimmed.includes('shorts/')) {
            const parts = trimmed.split('shorts/')[1];
            videoId = parts.split('?')[0];
        } else if (trimmed.includes('youtube.com/embed/')) {
            return trimmed;
        }
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
    
    // 2. TikTok Videos
    if (trimmed.includes('tiktok.com')) {
        if (trimmed.includes('/video/')) {
            const parts = trimmed.split('/video/')[1];
            const videoId = parts.split('?')[0].split('/')[0];
            return `https://www.tiktok.com/embed/v2/${videoId}`;
        }
        if (trimmed.includes('tiktok.com/embed/')) {
            return trimmed;
        }
    }
    
    return null;
};

/* ============================================
   RoomDetailPage – Full listing details
   ============================================ */
export default function RoomDetailPage({ room, navigate, user, onClose, previewMode }) {
    const { showModal } = useModal();
    const { isFavorite, toggleFavorite } = useFavorites();
    const [activeImage, setActiveImage] = useState(0);
    const [showPhone, setShowPhone] = useState(false);
    const [views, setViews] = useState(room?.metadata?.total_views || 0);
    const lastIncrementedRoomId = useRef(null);

    const favorited = isFavorite(room?.id);

    const handleToggleFavorite = async () => {
        const result = await toggleFavorite(room?.id);
        if (result?.error === 'login_required') {
            showModal({
                title: 'Thông báo',
                message: 'Vui lòng đăng nhập để lưu tin!',
                type: 'warning',
                confirmText: 'Đăng nhập ngay',
                onConfirm: () => navigate('login')
            });
        }
    };



    // Increment views on mount
    useEffect(() => {
        if (!room?.id || previewMode || lastIncrementedRoomId.current === room.id) return;

        lastIncrementedRoomId.current = room.id;

        const incrementViews = async () => {
            const { data, error } = await incrementRoomViews(room.id, room.metadata?.total_views || 0);
            if (!error && data) {
                setViews(data.total_views);
            }
        };

        incrementViews();
        // Only run once per room.id to prevent infinite loops and double increments
    }, [room?.id, previewMode]);


    if (!room) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-stone-500">Không tìm thấy phòng này.</p>
            </div>
        );
    }

    const { basic_info, monthly_costs, room_features, rules_utilities, media_contact, metadata } = room;
    const videos = Array.isArray(media_contact.video_urls)
        ? media_contact.video_urls
        : (media_contact.video_url ? [media_contact.video_url] : []);

    const mediaItems = [
        ...videos.map(url => ({ type: 'video', url })),
        ...((media_contact.images?.length > 0)
            ? media_contact.images.map(img => ({ type: 'image', url: typeof img === 'string' ? img : img.url }))
            : [{ type: 'placeholder' }])
    ];
    const isExpired = metadata.status === 'expired' || (room.available_until && new Date(room.available_until) < new Date());
    const isAvailable = metadata.status === 'available' && !isExpired;



    return (
        <div className="min-h-screen bg-stone-50 pt-16 md:pt-20 pb-24 md:pb-0">
            {previewMode && (
                <div className="bg-amber-100 text-amber-800 text-center py-2 text-sm font-bold sticky top-0 z-50">
                    Bạn đang ở chế độ xem trước (Có thể chỉnh sửa bình luận)
                </div>
            )}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:pb-12">
                {/* Action Bar / Back Button */}
                <div className="flex items-center mb-6">
                    <button
                        onClick={() => {
                            if (onClose) {
                                onClose();
                            } else if (room?.fromDashboard) {
                                navigate('dashboard');
                            } else {
                                navigate(room?.fromProfile ? 'profile' : 'home', room?.fromProfile ? { tab: room?.originTab || 'info' } : undefined);
                            }
                        }}
                        className="flex items-center gap-2.5 bg-white border border-stone-200 rounded-full! pl-1.5 pr-4 py-1.5 cursor-pointer text-stone-600 text-sm font-bold hover:bg-stone-50 hover:text-stone-900 transition-colors duration-200 group"
                    >
                        <div className="w-7 h-7 rounded-full! bg-stone-100 flex items-center justify-center text-stone-500 transition-colors group-hover:bg-stone-200 group-hover:text-stone-700">
                            <AppIcon name="chevronLeft" size={14} strokeWidth={3.5} />
                        </div>
                        <span>Quay lại</span>
                    </button>
                </div>


                <div>
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] items-start gap-6">
                        {/* ---- LEFT COLUMN ---- */}
                        <div className="flex flex-col bg-white border border-stone-200 rounded-xl overflow-hidden">

                            {/* Image Gallery */}
                            <div className="bg-white">
                                {/* Main image / video */}
                                <div className="relative h-[300px] md:h-[450px] bg-stone-100 flex items-center justify-center">
                                    {mediaItems[activeImage].type === 'video' ? (
                                        (() => {
                                            const embedUrl = getEmbedUrl(mediaItems[activeImage].url);
                                            if (embedUrl) {
                                                return (
                                                    <iframe
                                                        className="w-full h-full"
                                                        src={embedUrl}
                                                        title={`${basic_info.title} - video`}
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                        allowFullScreen
                                                    ></iframe>
                                                );
                                            } else {
                                                return (
                                                    <video
                                                        controls
                                                        className="w-full h-full object-contain bg-black"
                                                        key={mediaItems[activeImage].url}
                                                    >
                                                        <source src={mediaItems[activeImage].url} type="video/mp4" />
                                                        Trình duyệt của bạn không hỗ trợ xem video.
                                                    </video>
                                                );
                                            }
                                        })()
                                    ) : mediaItems[activeImage].type === 'placeholder' ? (
                                        <div className="w-full h-full bg-stone-100 flex flex-col items-center justify-center text-stone-400 gap-2">
                                            <AppIcon name="home" size={48} className="text-stone-300 animate-pulse" />
                                            <span className="text-sm font-semibold text-stone-400">Tin đăng chưa có hình ảnh</span>
                                        </div>
                                    ) : (
                                        <img
                                            key={activeImage}
                                            src={mediaItems[activeImage].url}
                                            alt={`${basic_info.title} - ảnh ${activeImage + 1}`}
                                            className="w-full h-full object-cover animate-fade-in"
                                            onError={(e) => { e.currentTarget.src = `../public/images/placeholder.png`; }}
                                        />
                                    )}
                                    {/* Status badges grouped */}
                                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                                        <span
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full w-fit text-[0.75rem] font-bold ${isAvailable
                                                ? 'bg-green-100 text-green-700'
                                                : isExpired ? 'bg-red-100 text-red-700' : 'bg-stone-100 text-stone-700'
                                                }`}
                                        >
                                            <span className={`w-2 h-2 rounded-full shrink-0 ${isAvailable ? 'bg-green-600' : isExpired ? 'bg-red-600' : 'bg-stone-600'}`} />
                                            {isAvailable ? 'Còn phòng' : isExpired ? 'Đã hết hạn' : metadata.status === 'draft' ? 'Bản nháp' : metadata.status}
                                        </span>

                                        {metadata.is_verified && (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full w-fit text-[0.75rem] font-bold bg-blue-100 text-blue-700">
                                                <AppIcon name="verified" size={13} strokeWidth={2.5} />
                                                Đã xác minh
                                            </span>
                                        )}
                                    </div>
                                    {/* Prev/Next arrows */}
                                    {mediaItems.length > 1 && (
                                        <>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setActiveImage(prev => (prev > 0 ? prev - 1 : mediaItems.length - 1)); }}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full! bg-black/80 hover:bg-black flex items-center justify-center text-white shadow-md transition-colors z-8 border-none cursor-pointer"
                                            >
                                                <AppIcon name="chevronLeft" size={20} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setActiveImage(prev => (prev < mediaItems.length - 1 ? prev + 1 : 0)); }}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full! bg-black/80 hover:bg-black flex items-center justify-center text-white shadow-md transition-colors z-10 border-none cursor-pointer"
                                            >
                                                <AppIcon name="chevronRight" size={20} />
                                            </button>
                                        </>
                                    )}
                                </div>
                                {/* Thumbnails */}
                                {mediaItems.length > 1 && (
                                    <div className="flex gap-2 p-3 overflow-x-auto scrollbar-hide border-b border-stone-100">
                                        {mediaItems.map((item, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setActiveImage(idx)}
                                                className={`relative w-[72px] h-[56px] shrink-0 rounded-md overflow-hidden border-2 transition-colors duration-200 cursor-pointer p-0 bg-stone-200 flex items-center justify-center ${activeImage === idx ? 'border-amber-600' : 'border-transparent'}`}
                                                aria-label={`Xem ${item.type === 'video' ? 'video' : 'ảnh'} ${idx + 1}`}
                                            >
                                                {item.type === 'video' ? (
                                                    <div className="text-stone-500">
                                                        <AppIcon name="play" size={24} />
                                                    </div>
                                                ) : (
                                                    <img src={item.url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Main Info Section */}
                            <div className="p-6 border-b border-stone-100">
                                <h1 className="text-2xl md:text-3xl font-extrabold text-stone-900 mb-3 leading-tight font-heading">
                                    {basic_info.title}
                                </h1>

                                <div className="flex items-center gap-4 mb-5 flex-wrap">
                                    <button
                                        onClick={previewMode ? undefined : handleToggleFavorite}
                                        disabled={previewMode}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full! font-bold text-sm transition-all border ${previewMode ? 'opacity-50 cursor-not-allowed bg-stone-100 border-stone-200 text-stone-400' : 'cursor-pointer'} ${!previewMode && favorited
                                            ? 'bg-red-50 border-red-200 text-red-600'
                                            : !previewMode ? 'bg-stone-100 border-stone-200 text-stone-600 hover:bg-stone-200' : ''
                                            }`}
                                    >
                                        <AppIcon
                                            name="heart"
                                            size={18}
                                            fill={favorited && !previewMode ? 'currentColor' : 'none'}
                                            className={favorited && !previewMode ? 'animate-pulse' : ''}
                                        />
                                        {favorited && !previewMode ? 'Đã lưu tin' : 'Lưu tin'}
                                    </button>

                                    <div className="flex items-center gap-1.5 text-stone-500 text-sm font-medium">
                                        <AppIcon name="eye" size={16} />
                                        <span>{views.toLocaleString()} lượt xem</span>
                                    </div>

                                    <div className="hidden sm:block h-3 w-px bg-stone-200" />

                                    <div className="flex items-center gap-1.5 text-stone-400 text-[0.85rem] font-medium">
                                        <AppIcon name="clock" size={16} />
                                        <span>Cập nhật: {formatDate(metadata.updated_at)}</span>
                                    </div>

                                    <div className="flex items-center gap-1.5 text-stone-400 text-[0.85rem] font-medium">
                                        <AppIcon name="calendar" size={16} />
                                        <span>Hết hạn: {room.available_until ? formatDate(room.available_until) : 'Không xác định'}</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2 text-stone-500 text-[0.925rem] mb-6">
                                    <AppIcon name="location" size={18} className="text-stone-400 mt-1" />
                                    <div className="flex flex-col">
                                        <span className="text-stone-900 font-bold text-[1rem] leading-tight mb-1">
                                            {basic_info.address}
                                        </span>
                                        <span className="text-stone-400 text-[0.85rem]">
                                            {basic_info.ward && `${basic_info.ward}, `}{basic_info.district}, {basic_info.city}
                                        </span>
                                    </div>
                                </div>

                                {/* Nearby Universities Mapping */}
                                {(() => {
                                    // Bổ sung logic lọc theo Phường/Xã (ward)
                                    const nearby = UNIVERSITIES.filter(u => 
                                        u.city === basic_info.city && 
                                        u.district === basic_info.district &&
                                        (!basic_info.ward || u.ward === basic_info.ward)
                                    );

                                    if (nearby.length === 0) return null;
                                    return (
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {nearby.map(u => (
                                                <span key={u.name} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-600 text-[0.75rem] font-bold border border-amber-100">
                                                    <AppIcon name="verified" size={12} />
                                                    Gần {u.name}
                                                </span>
                                            ))}
                                        </div>
                                    );
                                })()}

                                <div className="grid grid-cols-2 gap-4 p-5 bg-stone-50 rounded-lg border border-stone-100">
                                    <StatItem icon="price" label="Giá thuê" value={formatPrice(basic_info.price_monthly)} highlight />
                                    <StatItem icon="area" label="Diện tích" value={formatArea(basic_info.area_sqm)} />
                                    <StatItem icon="occupants" label="Tối đa" value={`${room_features.counts.capacity} người`} />
                                    <StatItem icon="bathroom" label="Vệ sinh" value={BATHROOM_TYPES[room_features.bathroom_type] || 'Khép kín'} />
                                </div>

                                {/* Description */}
                                <div className="mt-8">
                                    <SectionTitle icon="photo">Mô tả chi tiết</SectionTitle>
                                    <div className="mt-4 text-stone-700 leading-relaxed whitespace-pre-line text-[0.95rem]">
                                        {media_contact.description}
                                    </div>
                                </div>

                                <div className="mt-3 text-[0.8rem] text-stone-400">
                                    Đăng ngày: {formatDate(metadata.created_at)} • Hết hạn: {room.available_until ? formatDate(room.available_until) : 'Không xác định'} • ID: {room.listing_id}
                                </div>
                            </div>

                            {/* Combined Costs & Rules Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 border-b border-stone-100">
                                {/* Monthly Costs */}
                                <div className="p-6 md:border-r border-stone-100">
                                    <SectionTitle icon="credit-card">Chi phí hàng tháng</SectionTitle>
                                    <div className="mt-5 space-y-4">
                                        <InfoRow label="Tiền cọc" value={formatDeposit(monthly_costs.deposit_amount)} />
                                        <InfoRow label="Tiền điện" value={formatElectricity(monthly_costs.electricity)} />
                                        <InfoRow label="Tiền nước" value={formatWater(monthly_costs.water)} />
                                        <InfoRow label="Internet" value={
                                            Number(monthly_costs.internet) > 0
                                                ? `${new Intl.NumberFormat('vi-VN').format(monthly_costs.internet)} đ/tháng`
                                                : 'Miễn phí / Đã bao gồm'
                                        } />
                                        <InfoRow label="Gửi xe" value={
                                            Number(monthly_costs.parking_fee) > 0
                                                ? `${new Intl.NumberFormat('vi-VN').format(monthly_costs.parking_fee)} đ/tháng`
                                                : 'Miễn phí / Đã bao gồm'
                                        } />

                                        {monthly_costs.extra_services.length > 0 && (
                                            <div className="pt-2">
                                                <p className="text-[0.8rem] font-bold text-stone-400 uppercase tracking-wider mb-2">Dịch vụ thêm:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {monthly_costs.extra_services.map((s) => (
                                                        <span key={s.name} className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 text-sm font-medium">
                                                            {s.name}: {new Intl.NumberFormat('vi-VN').format(s.price)} đ
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Rules & Utilities */}
                                <div className="p-6">
                                    <SectionTitle icon="shield">Nội quy & Tiện ích</SectionTitle>
                                    <div className="mt-5 space-y-4">
                                        <InfoRow label="Giờ giấc" value={CURFEW_LABELS[rules_utilities.curfew] || rules_utilities.curfew} />
                                        <InfoRow label="Vệ sinh" value={BATHROOM_TYPES[room_features.bathroom_type] || room_features.bathroom_type} />
                                        <InfoRow label="Thú cưng" value={rules_utilities.is_pet_allowed ? 'Được phép nuôi' : 'Không cho phép'} isStatus ok={rules_utilities.is_pet_allowed} />
                                        <InfoRow label="Giặt đồ" value={LAUNDRY_TYPES[rules_utilities.laundry_type] || rules_utilities.laundry_type} />
                                        <InfoRow label="Chung chủ" value={rules_utilities.is_shared_with_host ? 'Ở chung với chủ' : 'Không chung chủ'} />
                                    </div>
                                </div>
                            </div>

                            {/* Amenities */}
                            <div className="p-6 border-b border-stone-100">
                                <SectionTitle icon="check-square">Tiện nghi trong phòng</SectionTitle>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
                                    {Object.entries(AMENITIES).map(([key, { label }]) => {
                                        const has = room_features.amenities.includes(key);
                                        return (
                                            <div
                                                key={key}
                                                className={`flex items-center gap-2 p-2 px-3 rounded-md border transition-all duration-200 ${has ? 'bg-amber-50 border-amber-200 opacity-100' : 'bg-stone-50 border-stone-200 opacity-45'}`}
                                            >
                                                <AppIcon name={key} size={16} color={has ? '#d97706' : '#a8a29e'} />
                                                <span className={`text-[0.85rem] ${has ? 'text-amber-900 font-medium' : 'text-stone-400 font-normal'}`}>
                                                    {label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Map Section */}
                            <div className="p-6 border-b border-stone-100">
                                <SectionTitle icon="map">Vị trí trên bản đồ</SectionTitle>
                                {media_contact.google_map_url ? (
                                    <div className="mt-4 overflow-hidden rounded-xl border border-stone-200 shadow-sm relative h-[350px] w-full">
                                        <iframe
                                            src={media_contact.google_map_url}
                                            width="100%"
                                            height="100%"
                                            style={{ border: 0 }}
                                            allowFullScreen=""
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                            title="Google Maps"
                                        ></iframe>
                                    </div>
                                ) : (
                                    <div className="mt-4 bg-linear-to-br from-amber-50 to-orange-50 border border-dashed border-amber-200 rounded-xl p-10 flex flex-col items-center justify-center text-center">
                                        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-3">
                                            <AppIcon name="location" size={24} />
                                        </div>
                                        <p className="text-amber-900 font-bold mb-1">Bản đồ đang được cập nhật</p>
                                        <p className="text-amber-700/70 text-sm max-w-[280px]">Vị trí chính xác sẽ được hiển thị khi Bên cho thuê hoàn tất xác minh tọa độ.</p>
                                    </div>
                                )}
                            </div>

                            {/* Comments */}
                            <CommentSection room={room} user={user} navigate={navigate} isGridMode={true} previewMode={previewMode} />
                        </div>

                        {/* ---- RIGHT COLUMN: Contact sidebar ---- */}
                        <LandlordCard
                            room={room}
                            user={user}
                            previewMode={previewMode}
                            showPhone={showPhone}
                            setShowPhone={setShowPhone}
                            showModal={showModal}
                            navigate={navigate}
                            isExpired={isExpired}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

/* Sub-components */
function SectionTitle({ icon, children }) {
    return (
        <h2 className="font-bold text-[1.05rem] text-stone-900 flex items-center gap-2 font-heading">
            <AppIcon name={icon} color="#d97706" />
            {children}
        </h2>
    );
}

function StatItem({ icon, label, value, highlight }) {
    return (
        <div className="flex items-center gap-3">
            <div className="text-amber-600 shrink-0">
                <AppIcon name={icon} size={26} />
            </div>
            <div className="flex flex-col">
                <p className="text-[0.72rem] text-stone-400 font-medium uppercase tracking-wider mb-0.5">{label}</p>
                <p className={`text-[0.9rem] font-bold ${highlight ? 'text-amber-600' : 'text-stone-900'} font-heading`}>
                    {value}
                </p>
            </div>
        </div>
    );
}

function InfoRow({ label, value, isStatus, ok }) {
    return (
        <div className="flex justify-between items-baseline gap-4">
            <span className="text-[0.875rem] text-stone-400 font-medium shrink-0">{label}</span>
            <span className={`text-[0.925rem] font-bold text-right ${isStatus ? (ok ? 'text-green-600' : 'text-red-600') : 'text-stone-900'}`}>
                {value}
            </span>
        </div>
    );
}

