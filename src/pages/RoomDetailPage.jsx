import { useState, useEffect, useRef } from 'react';
import { AMENITIES, STATUS_LABELS, CURFEW_LABELS, BATHROOM_TYPES, LAUNDRY_TYPES, PARKING_TYPES } from '../data/constants.js';
import {
    formatPrice,
    formatArea,
    formatDate,
    formatElectricity,
    formatWater,
    formatDeposit,
} from '../utils/formatters.js';
import AppIcon from '../components/common/AppIcon.jsx';
import Breadcrumb from '../components/common/Breadcrumb.jsx';


/* ============================================
   RoomDetailPage – Full listing details
   ============================================ */
export default function RoomDetailPage({ room, navigate, user }) {
    const [activeImage, setActiveImage] = useState(0);
    const [showPhone, setShowPhone] = useState(false);

    // Breadcrumb scroll & gradient logic
    const breadcrumbRef = useRef(null);
    const [scrollState, setScrollState] = useState({ left: false, right: false });

    const checkScroll = () => {
        const el = breadcrumbRef.current;
        if (!el) return;
        setScrollState({
            left: el.scrollLeft > 10,
            right: el.scrollLeft < el.scrollWidth - el.clientWidth - 10
        });
    };

    useEffect(() => {
        const el = breadcrumbRef.current;
        if (el) {
            // Auto scroll to end
            el.scrollLeft = el.scrollWidth;
            checkScroll();
        }
    }, [room?.listing_id]);

    if (!room) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-stone-500">Không tìm thấy phòng này.</p>
            </div>
        );
    }

    const { basic_info, monthly_costs, room_features, rules_utilities, media_contact, metadata } = room;
    const images = media_contact.images.length > 0
        ? media_contact.images
        : [`https://picsum.photos/seed/${room.listing_id}/800/500`];
    const isAvailable = metadata.status === 'available';

    return (
        <div className="min-h-screen bg-stone-50 pt-20">
            <div className="container-app py-6 md:pb-12">

                {/* Breadcrumb - Using shared component */}
                <Breadcrumb
                    navigate={navigate}
                    paths={[
                        { label: 'Trang chủ', page: 'home' },
                        { label: basic_info.city || 'Phòng trọ' },
                        { label: basic_info.title }
                    ]}
                />


                <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
                    {/* ---- LEFT COLUMN ---- */}
                    <div className="flex flex-col gap-6">

                        {/* Image Gallery */}
                        <div className="bg-white rounded-lg border border-stone-200 overflow-hidden">
                            {/* Main image */}
                            <div className="relative h-[300px] md:h-[450px] bg-stone-100">
                                <img
                                    key={activeImage}
                                    src={images[activeImage]}
                                    alt={`${basic_info.title} - ảnh ${activeImage + 1}`}
                                    className="w-full h-full object-cover animate-in fade-in duration-300"
                                    onError={(e) => { e.currentTarget.src = `https://picsum.photos/seed/err${room.listing_id}/800/500`; }}
                                />
                                {/* Status badge */}
                                <div className="absolute top-4 left-4">
                                    <span className={`${isAvailable ? 'badge badge-green' : 'badge badge-red'} text-[0.85rem] px-3 py-1.5`}>
                                        <span className={`w-1.5 h-1.5 rounded-full inline-block ${isAvailable ? 'bg-green-600' : 'bg-red-600'}`} />
                                        {STATUS_LABELS[metadata.status]?.label || metadata.status}
                                    </span>
                                </div>
                                {metadata.is_verified && (
                                    <div className="absolute top-4 right-4">
                                        <span className="badge badge-blue text-[0.82rem]">
                                            <AppIcon name="verified" size={11} strokeWidth={2.5} />
                                            Đã xác minh
                                        </span>
                                    </div>
                                )}
                                {/* Prev/Next arrows */}
                                {images.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => setActiveImage((i) => (i - 1 + images.length) % images.length)}
                                            className="absolute top-1/2 left-3 -translate-y-1/2 bg-black/45 backdrop-blur-sm rounded-full w-9 h-9 flex items-center justify-center cursor-pointer text-white transition-colors hover:bg-black/60"
                                            aria-label="Ảnh trước"
                                        >
                                            <AppIcon name="chevronLeft" size={18} strokeWidth={2.5} />
                                        </button>
                                        <button
                                            onClick={() => setActiveImage((i) => (i + 1) % images.length)}
                                            className="absolute top-1/2 right-3 -translate-y-1/2 bg-black/45 backdrop-blur-sm rounded-full w-9 h-9 flex items-center justify-center cursor-pointer text-white transition-colors hover:bg-black/60"
                                            aria-label="Ảnh tiếp"
                                        >
                                            <AppIcon name="chevronRight" size={18} strokeWidth={2.5} />
                                        </button>
                                    </>
                                )}
                            </div>
                            {/* Thumbnails */}
                            {images.length > 1 && (
                                <div className="flex gap-2 p-3 overflow-x-auto scrollbar-hide">
                                    {images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveImage(idx)}
                                            className={`w-[72px] h-[56px] flex-shrink-0 rounded-md overflow-hidden border-2 transition-colors duration-200 cursor-pointer p-0 ${activeImage === idx ? 'border-amber-600' : 'border-transparent'}`}
                                            aria-label={`Xem ảnh ${idx + 1}`}
                                        >
                                            <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Main Info Card */}
                        <div className="card p-6 rounded-lg">
                            <h1 className="text-2xl font-bold text-stone-900 mb-3 leading-tight font-heading">
                                {basic_info.title}
                            </h1>
                            <div className="flex items-center gap-2 text-stone-500 text-[0.925rem] mb-6">
                                <AppIcon name="location" size={16} />
                                <span>{basic_info.address}, {basic_info.district}, {basic_info.city}</span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-stone-50 rounded-lg border border-stone-100">
                                <StatItem icon="price" label="Giá thuê" value={formatPrice(basic_info.price_monthly)} highlight />
                                <StatItem icon="area" label="Diện tích" value={formatArea(basic_info.area_sqm)} />
                                <StatItem icon="occupants" label="Tối đa" value={`${rules_utilities.max_occupants} người`} />
                            </div>

                            {/* Description */}
                            <div className="mt-8">
                                <SectionTitle icon="photo">Mô tả chi tiết</SectionTitle>
                                <div className="mt-4 text-stone-700 leading-relaxed whitespace-pre-line text-[0.95rem]">
                                    {basic_info.description}
                                </div>
                            </div>

                            <div className="mt-3 text-[0.8rem] text-stone-400">
                                Đăng ngày: {formatDate(metadata.created_at)} • ID: {room.listing_id}
                            </div>
                        </div>

                        {/* Monthly Costs */}
                        <div className="card p-6 rounded-lg">
                            <SectionTitle icon="credit-card">Chi phí hàng tháng</SectionTitle>
                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <CostRow label="Tiền cọc" value={formatDeposit(monthly_costs.deposit_amount)} />
                                <CostRow label="Điện" value={formatElectricity(monthly_costs.electricity)} />
                                <CostRow label="Nước" value={formatWater(monthly_costs.water)} />
                                <CostRow label="Internet" value={
                                    monthly_costs.internet === 0 ? 'Bao gồm / Không có'
                                        : `${new Intl.NumberFormat('vi-VN').format(monthly_costs.internet)} đ/tháng`
                                } />
                            </div>
                            {monthly_costs.extra_services.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-[0.85rem] font-semibold text-stone-600 mb-2">Dịch vụ thêm:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {monthly_costs.extra_services.map((s) => (
                                            <span key={s.name} className="badge badge-gray">
                                                {s.name}: {new Intl.NumberFormat('vi-VN').format(s.price)} đ
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Amenities */}
                        <div className="card p-6 rounded-lg">
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

                        {/* Rules */}
                        <div className="card p-6 rounded-lg">
                            <SectionTitle icon="shield">Nội quy & Tiện ích</SectionTitle>
                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <RuleRow label="Giờ giấc" value={CURFEW_LABELS[rules_utilities.curfew] || rules_utilities.curfew} />
                                <RuleRow label="WC" value={BATHROOM_TYPES[room_features.bathroom_type] || room_features.bathroom_type} />
                                <RuleRow label="Thú cưng" value={rules_utilities.is_pet_allowed ? '✓ Được phép' : '✗ Không cho phép'} ok={rules_utilities.is_pet_allowed} />
                                <RuleRow label="Giặt đồ" value={LAUNDRY_TYPES[rules_utilities.laundry_type] || rules_utilities.laundry_type} />
                                <RuleRow label="Chung chủ" value={rules_utilities.is_shared_with_host ? 'Có' : 'Không'} />
                                <RuleRow
                                    label="Đỗ xe"
                                    value={room_features.parking.has_parking
                                        ? `${PARKING_TYPES[room_features.parking.type]} ${room_features.parking.fee === 0 ? '(Miễn phí)' : `(${new Intl.NumberFormat('vi-VN').format(room_features.parking.fee)} đ)`}`
                                        : 'Không có'}
                                />
                            </div>
                        </div>

                        {/* Map placeholder */}
                        <div className="card p-6 rounded-lg">
                            <SectionTitle icon="map">Vị trí trên bản đồ</SectionTitle>
                            <div className="mt-4 bg-linear-to-br from-amber-50 to-orange-50 border border-dashed border-amber-200 rounded-lg p-10 flex flex-col items-center justify-center text-center">
                                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-3">
                                    <AppIcon name="location" size={24} />
                                </div>
                                <p className="text-amber-900 font-bold mb-1">Bản đồ đang được cập nhật</p>
                                <p className="text-amber-700/70 text-sm max-w-[280px]">Vị trí chính xác sẽ được hiển thị khi chủ nhà hoàn tất xác minh tọa độ.</p>
                            </div>
                        </div>

                        {/* Comments */}
                        <div className="card p-6 rounded-lg">
                            <SectionTitle icon="messages">Bình luận & Hỏi đáp</SectionTitle>
                            <div className="mt-6 mb-8">
                                <textarea
                                    placeholder="Viết câu hỏi hoặc bình luận của bạn..."
                                    className="input w-full min-h-[100px] p-4 text-[0.95rem] resize-none border-stone-200 focus:border-amber-500 rounded-lg"
                                />
                                <div className="flex justify-end mt-3">
                                    <button className="btn-primary rounded-md px-6 py-2.5">Gửi bình luận</button>
                                </div>
                            </div>

                            {/* Comment list */}
                            <div className="flex flex-col gap-6">
                                {[
                                    { id: 1, user: 'Hoàng Minh', date: '2 ngày trước', text: 'Phòng này còn không chủ nhà ơi? Nhìn sạch sẽ và rộng rãi quá.', avatar: 'HM' },
                                    { id: 2, user: 'Lan Anh', date: '5 ngày trước', text: 'Chủ nhà rất nhiệt tình, mình vừa xem phòng chiều nay. Vị trí rất tiện lợi cho những người làm việc ở khu vực trung tâm.', avatar: 'LA' }
                                ].map(comment => (
                                    <div key={comment.id} className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-stone-100 to-stone-200 flex items-center justify-center font-bold text-stone-600 text-[0.85rem] shrink-0 border border-stone-200">
                                            {comment.avatar}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between mb-1">
                                                <h4 className="text-[0.9rem] font-bold text-stone-900">{comment.user}</h4>
                                                <span className="text-[0.8rem] text-stone-500">{comment.date}</span>
                                            </div>
                                            <p className="text-[0.9rem] text-stone-700 leading-relaxed">
                                                {comment.text}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ---- RIGHT COLUMN: Contact sidebar ---- */}
                    <div className="flex flex-col gap-4 lg:sticky lg:top-[88px]">
                        {/* Price card */}
                        <div className="card p-6 rounded-lg">
                            <div className="text-[1.6rem] font-extrabold text-amber-600 tracking-tight font-heading">
                                {formatPrice(basic_info.price_monthly)}
                            </div>
                            <div className="text-[0.85rem] text-stone-400 mt-1">
                                {formatArea(basic_info.area_sqm)} • Đặt cọc: {formatDeposit(monthly_costs.deposit_amount)}
                            </div>
                            <div className="h-px bg-stone-100 my-4" />

                            {/* Owner info inside price card */}
                            <p className="text-[0.8rem] text-stone-400 mb-2 font-medium">Thông tin người đăng:</p>
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-10 bg-linear-to-br from-amber-600 to-amber-500 rounded-full flex items-center justify-center shrink-0">
                                    <span className="text-white font-bold text-[0.95rem] font-heading">
                                        {media_contact.contact.name.charAt(0)}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-[0.95rem] text-stone-900 leading-none mb-1">
                                        {media_contact.contact.name}
                                    </p>
                                    <span className={`badge ${media_contact.contact.role === 'landlord' ? 'badge-amber' : 'badge-blue'} text-[0.7rem]`}>
                                        {media_contact.contact.role === 'landlord' ? 'Chủ nhà' : 'Môi giới'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => {
                                        if (user) {
                                            setShowPhone(true);
                                        } else {
                                            navigate('login');
                                        }
                                    }}
                                    className="btn-primary w-full justify-center py-3 rounded-md!"
                                >
                                    <AppIcon name="phone" size={24} strokeWidth={1.5} />
                                    {showPhone ? media_contact.contact.phone : 'Hiện số điện thoại'}
                                </button>
                                <button
                                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-md! text-white bg-[#0068ff] hover:bg-[#005ae0] transition-all shadow-lg shadow-blue-500/25 font-bold text-[0.9rem]"
                                >
                                    <AppIcon name="messages" size={24} strokeWidth={1.5} />
                                    Nhắn tin qua Zalo
                                </button>
                            </div>
                        </div>

                        {/* Safety tips */}
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <div className="flex gap-2 items-start text-amber-600">
                                <AppIcon name="alert" size={16} className="mt-0.5" />
                                <div>
                                    <p className="font-bold text-amber-900 text-[0.82rem] mb-1 font-heading">Lưu ý an toàn</p>
                                    <p className="text-amber-700 text-[0.78rem] leading-relaxed">
                                        Không chuyển tiền trước khi xem phòng trực tiếp. Kiểm tra kỹ hợp đồng thuê trọ.
                                    </p>
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

function CostRow({ label, value }) {
    return (
        <div className="p-3 bg-stone-50 rounded-md border border-stone-100">
            <p className="text-[0.75rem] text-stone-400 mb-0.5">{label}</p>
            <p className="text-[0.875rem] font-bold text-stone-900">{value}</p>
        </div>
    );
}

function RuleRow({ label, value, ok }) {
    return (
        <div className="p-3 bg-stone-50 rounded-md border border-stone-100">
            <p className="text-[0.75rem] text-stone-400 mb-0.5">{label}</p>
            <p className={`text-[0.875rem] font-bold ${ok === undefined ? 'text-stone-900' : (ok ? 'text-green-600' : 'text-red-600')}`}>
                {value}
            </p>
        </div>
    );
}
