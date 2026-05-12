import { useState, useEffect } from 'react';
import { useModal } from '../context/ModalContext';
import { supabase } from '../lib/supabase';
import { AMENITIES, STATUS_LABELS, CURFEW_LABELS, BATHROOM_TYPES, LAUNDRY_TYPES } from '../data/constants.js';
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


/* ============================================
   RoomDetailPage – Full listing details
   ============================================ */
export default function RoomDetailPage({ room, navigate, user }) {
    const { showModal } = useModal();
    const { isFavorite, toggleFavorite } = useFavorites();
    const [activeImage, setActiveImage] = useState(0);
    const [showPhone, setShowPhone] = useState(false);
    const [views, setViews] = useState(room?.metadata?.total_views || 0);

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
        if (!room?.id) return;

        const incrementViews = async () => {
            try {
                // Atomic increment using a direct update (Race conditions possible but simple)
                // Better: use an RPC call if available on Supabase
                const { data, error } = await supabase
                    .from('rooms')
                    .update({ total_views: (room.metadata?.total_views || 0) + 1 })
                    .eq('id', room.id)
                    .select('total_views')
                    .maybeSingle();

                if (!error && data) {
                    setViews(data.total_views);
                }
            } catch (err) {
                console.error('Failed to increment views:', err);
            }
        };

        incrementViews();
    }, [room?.id, room.metadata?.total_views]);


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
            : [{ type: 'image', url: `https://picsum.photos/seed/${room.listing_id}/800/500` }])
    ];
    const isAvailable = metadata.status === 'available';

    return (
        <div className="min-h-screen bg-stone-50 pt-6 md:pt-20 pb-24 md:pb-0">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:pb-12">
                {/* Action Bar / Back Button */}
                <div className="flex items-center mb-6">
                    <button
                        onClick={() => navigate(room?.fromProfile ? 'profile' : 'home')}
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
                                        mediaItems[activeImage].url.includes('watch?v=') || mediaItems[activeImage].url.includes('embed') ? (
                                            <iframe
                                                className="w-full h-full"
                                                src={mediaItems[activeImage].url.replace('watch?v=', 'embed/')}
                                                title={`${basic_info.title} - video`}
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            ></iframe>
                                        ) : (
                                            <video
                                                controls
                                                className="w-full h-full object-contain bg-black"
                                                key={mediaItems[activeImage].url}
                                            >
                                                <source src={mediaItems[activeImage].url} type="video/mp4" />
                                                Trình duyệt của bạn không hỗ trợ xem video.
                                            </video>
                                        )
                                    ) : (
                                        <img
                                            key={activeImage}
                                            src={mediaItems[activeImage].url}
                                            alt={`${basic_info.title} - ảnh ${activeImage + 1}`}
                                            className="w-full h-full object-cover animate-fade-in"
                                            onError={(e) => { e.currentTarget.src = `https://picsum.photos/seed/err${room.listing_id}/800/500`; }}
                                        />
                                    )}
                                    {/* Status badges grouped */}
                                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                                        <span
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full w-fit text-[0.75rem] font-bold ${isAvailable
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                                }`}
                                        >
                                            <span className={`w-2 h-2 rounded-full shrink-0 ${isAvailable ? 'bg-green-600' : 'bg-red-600'}`} />
                                            {isAvailable ? 'Còn phòng' : 'Đã cho thuê'}
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
                                        onClick={handleToggleFavorite}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full! font-bold text-sm transition-all border cursor-pointer ${favorited
                                            ? 'bg-red-50 border-red-200 text-red-600'
                                            : 'bg-stone-100 border-stone-200 text-stone-600 hover:bg-stone-200'
                                            }`}
                                    >
                                        <AppIcon
                                            name="heart"
                                            size={18}
                                            fill={favorited ? 'currentColor' : 'none'}
                                            className={favorited ? 'animate-pulse' : ''}
                                        />
                                        {favorited ? 'Đã lưu tin' : 'Lưu tin'}
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
                                </div>

                                <div className="flex items-center gap-2 text-stone-500 text-[0.925rem] mb-6">
                                    <AppIcon name="location" size={16} className="text-stone-400" />
                                    <span>{basic_info.address}, {basic_info.district}, {basic_info.city}</span>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-stone-50 rounded-lg border border-stone-100">
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
                                    Đăng ngày: {formatDate(metadata.created_at)} • ID: {room.listing_id}
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
                                            monthly_costs.internet > 0
                                                ? `${new Intl.NumberFormat('vi-VN').format(monthly_costs.internet)} đ/tháng`
                                                : (room_features.amenities.includes('wifi') ? 'Miễn phí (Đã bao gồm)' : 'Không có')
                                        } />
                                        <InfoRow label="Gửi xe" value={
                                            (monthly_costs.parking_fee === 0 || !monthly_costs.parking_fee) ? 'Miễn phí / Không có'
                                                : `${new Intl.NumberFormat('vi-VN').format(monthly_costs.parking_fee)} đ/tháng`
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

                            {/* Map placeholder */}
                            <div className="p-6 border-b border-stone-100">
                                <SectionTitle icon="map">Vị trí trên bản đồ</SectionTitle>
                                <div className="mt-4 bg-linear-to-br from-amber-50 to-orange-50 border border-dashed border-amber-200 rounded-xl p-10 flex flex-col items-center justify-center text-center">
                                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-3">
                                        <AppIcon name="location" size={24} />
                                    </div>
                                    <p className="text-amber-900 font-bold mb-1">Bản đồ đang được cập nhật</p>
                                    <p className="text-amber-700/70 text-sm max-w-[280px]">Vị trí chính xác sẽ được hiển thị khi Bên cho thuê hoàn tất xác minh tọa độ.</p>
                                </div>
                            </div>

                            {/* Comments */}
                            <CommentSection room={room} user={user} navigate={navigate} isGridMode={true} />
                        </div>

                        {/* ---- RIGHT COLUMN: Contact sidebar ---- */}
                        <div className="flex flex-col h-full relative">
                            <div className="lg:sticky lg:top-[96px] z-10 bg-white border border-stone-200 rounded-xl overflow-hidden">
                                {/* Price Section */}
                                <div className="p-6 border-b border-stone-100 bg-white">
                                    <div className="text-[1.8rem] text-amber-600! font-bold tracking-tight font-heading">
                                        {formatPrice(basic_info.price_monthly)}
                                    </div>
                                    <div className="text-[0.85rem] text-stone-400 mt-1">
                                        {formatArea(basic_info.area_sqm)} • Đặt cọc: {formatDeposit(monthly_costs.deposit_amount)}
                                    </div>
                                    {/* Listing ID & Copy */}
                                    <div className="flex items-center justify-between bg-stone-50 rounded-md p-2 px-3 my-4 border border-stone-100">
                                        <span className="text-[0.75rem] text-stone-500 font-medium uppercase tracking-wider">Mã tin: {room.listing_id}</span>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(room.listing_id);
                                            }}
                                            className="p-1.5 hover:bg-stone-200 rounded-md transition-colors text-stone-400 hover:text-amber-600 cursor-pointer border-none bg-transparent"
                                            title="Sao chép mã tin"
                                        >
                                            <AppIcon name="copy" size={14} />
                                        </button>
                                    </div>

                                    {/* Owner info inside price section */}
                                    <p className="text-[0.8rem] text-stone-400 mb-2 font-medium">Thông tin người đăng:</p>
                                    <div className="flex items-center gap-3 mb-6">
                                        {media_contact.contact.avatar ? (
                                            <img
                                                src={media_contact.contact.avatar}
                                                alt={media_contact.contact.name}
                                                className="w-10 h-10 rounded-full object-cover border border-stone-200"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center shrink-0">
                                                <span className="text-white font-bold text-sm">
                                                    {media_contact.contact.name?.charAt(0) || 'U'}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <p className="font-bold text-sm text-stone-900 leading-tight mb-1">
                                                {media_contact.contact.name}
                                            </p>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.68rem] font-semibold ${media_contact.contact.role === 'landlord' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                                                {media_contact.contact.role === 'landlord' ? 'Bên cho thuê' : 'Môi giới'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2.5">
                                        <button
                                            onClick={() => {
                                                if (user) {
                                                    setShowPhone(true);
                                                } else {
                                                    showModal({
                                                        title: 'Yêu cầu đăng nhập',
                                                        message: 'Vui lòng đăng nhập để xem thông tin liên hệ',
                                                        type: 'info',
                                                        confirmText: 'Đăng nhập',
                                                        onConfirm: () => navigate('login')
                                                    });
                                                }
                                            }}
                                            className="flex items-center justify-center gap-2.5 w-full py-3 rounded-full! text-white border-none cursor-pointer transition-colors duration-200 bg-amber-500 hover:bg-amber-600 font-bold"
                                        >
                                            <AppIcon name="phone" size={20} strokeWidth={2.5} />
                                            <span>{showPhone ? media_contact.contact.phone : 'Liên hệ ngay'}</span>
                                        </button>

                                        <button
                                            onClick={() => {
                                                if (user) {
                                                    setShowPhone(true);
                                                } else {
                                                    showModal({
                                                        title: 'Yêu cầu đăng nhập',
                                                        message: 'Vui lòng đăng nhập để xem thông tin liên hệ',
                                                        type: 'info',
                                                        confirmText: 'Đăng nhập',
                                                        onConfirm: () => navigate('login')
                                                    });
                                                }
                                            }}
                                            className="flex items-center justify-center gap-2.5 w-full py-3 rounded-full! text-white bg-[#0068ff] hover:bg-[#005ae0] transition-colors duration-200 cursor-pointer border-none font-bold"
                                        >
                                            <AppIcon name="messages" size={20} strokeWidth={2.5} />
                                            <span>Nhắn tin qua Zalo</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Safety tips section */}
                                <div className="p-6 bg-amber-50/30">
                                    <div className="flex gap-2 items-start text-amber-600">
                                        <AppIcon name="alert" size={16} className="mt-0.5" />
                                        <div>
                                            <p className="font-bold text-amber-900 text-[0.82rem] mb-1 font-heading">Lưu ý an toàn</p>
                                            <p className="text-amber-700 text-[0.78rem] leading-relaxed">
                                                Không chuyển tiền trước khi xem phòng trực tiếp. Kiểm tra kỹ hợp đồng thuê trọ.
                                            </p>
                                            <button
                                                onClick={() => showModal({
                                                    title: 'Thông báo',
                                                    message: 'Tính năng Báo cáo tin đăng đang được phát triển.',
                                                    type: 'info'
                                                })}
                                                className="mt-2 text-[0.78rem] text-amber-600 font-bold hover:text-amber-700 underline cursor-pointer border-none bg-transparent p-0 block"
                                            >
                                                Báo cáo tin đăng
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
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
        <div className="text-center flex flex-col items-center">
            <div className="text-amber-600 mb-1">
                <AppIcon name={icon} size={26} />
            </div>
            <p className="text-[0.72rem] text-stone-400 font-medium uppercase tracking-wider mb-0.5">{label}</p>
            <p className={`text-[0.9rem] font-bold ${highlight ? 'text-amber-600' : 'text-stone-900'} font-heading`}>
                {value}
            </p>
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

