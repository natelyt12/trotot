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

/* ============================================
   RoomDetailPage – Full listing details
   ============================================ */
export default function RoomDetailPage({ room, navigate }) {
    const [activeImage, setActiveImage] = useState(0);

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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <p>Không tìm thấy phòng này.</p>
            </div>
        );
    }

    const { basic_info, monthly_costs, room_features, rules_utilities, media_contact, metadata } = room;
    const images = media_contact.images.length > 0
        ? media_contact.images
        : [`https://picsum.photos/seed/${room.listing_id}/800/500`];
    const isAvailable = metadata.status === 'available';



    return (
        <div style={{ minHeight: '100vh', background: '#fafaf9', paddingTop: '80px' }}>
            <div className="container-app" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>

                {/* Breadcrumb - Scrollable on mobile with gradients */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <button 
                        onClick={() => navigate('home')} 
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.5rem', 
                            background: '#fff', 
                            border: '1px solid #e7e5e4', 
                            borderRadius: '0.75rem', 
                            padding: '0.5rem 0.75rem', 
                            cursor: 'pointer',
                            color: '#57534e',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                            transition: 'all 0.2s',
                            flexShrink: 0
                        }}
                        onMouseEnter={(e) => { 
                            e.currentTarget.style.borderColor = '#d97706'; 
                            e.currentTarget.style.color = '#d97706';
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(217, 119, 6, 0.1)';
                        }}
                        onMouseLeave={(e) => { 
                            e.currentTarget.style.borderColor = '#e7e5e4'; 
                            e.currentTarget.style.color = '#57534e';
                            e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="m15 18-6-6 6-6" />
                        </svg>
                        <span className="back-btn-text">Quay lại</span>
                    </button>

                    <div style={{ position: 'relative', overflow: 'hidden', flex: 1 }}>
                        {/* Left Gradient */}
                        <div style={{
                            position: 'absolute', left: 0, top: 0, bottom: 0, width: '40px',
                            background: 'linear-gradient(to right, #fafaf9 20%, transparent)',
                            zIndex: 2, pointerEvents: 'none',
                            opacity: scrollState.left ? 1 : 0, transition: 'opacity 0.3s'
                        }} />

                        <nav
                            ref={breadcrumbRef}
                            onScroll={checkScroll}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.85rem',
                                color: '#78716c',
                                overflowX: 'auto',
                                whiteSpace: 'nowrap',
                                msOverflowStyle: 'none',
                                scrollbarWidth: 'none',
                                height: '100%',
                            }}
                        >
                            <style>{`
                              nav::-webkit-scrollbar { display: none; }
                              @media (max-width: 640px) {
                                .back-btn-text { display: none; }
                              }
                            `}</style>
                            <button onClick={() => navigate('home')} style={{ background: 'none', border: 'none', color: '#d97706', cursor: 'pointer', fontWeight: 600, fontFamily: 'Inter, sans-serif', padding: 0, transition: 'color 0.2s', flexShrink: 0 }}
                                onMouseEnter={(e) => { e.currentTarget.style.color = '#b45309'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = '#d97706'; }}
                            >
                                Trang chủ
                            </button>
                            <ChevronRight />
                            <span style={{ color: '#a8a29e', flexShrink: 0 }}>{basic_info.city || 'Danh sách phòng'}</span>
                            <ChevronRight />
                            <span style={{ color: '#1c1917', fontWeight: 500, flexShrink: 0 }}>{basic_info.title}</span>
                        </nav>

                        {/* Right Gradient */}
                        <div style={{
                            position: 'absolute', right: 0, top: 0, bottom: 0, width: '40px',
                            background: 'linear-gradient(to left, #fafaf9 20%, transparent)',
                            zIndex: 2, pointerEvents: 'none',
                            opacity: scrollState.right ? 1 : 0, transition: 'opacity 0.3s'
                        }} />
                    </div>
                </div>

                <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px', gap: '2rem', alignItems: 'start' }}>
                    {/* ---- LEFT COLUMN ---- */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* Image Gallery */}
                        <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #e7e5e4', overflow: 'hidden' }}>
                            {/* Main image */}
                            <div style={{ position: 'relative', height: '400px', background: '#f5f5f4' }}>
                                <img
                                    key={activeImage}
                                    src={images[activeImage]}
                                    alt={`${basic_info.title} - ảnh ${activeImage + 1}`}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', animation: 'fadeIn 0.3s ease' }}
                                    onError={(e) => { e.currentTarget.src = `https://picsum.photos/seed/err${room.listing_id}/800/500`; }}
                                />
                                {/* Status badge */}
                                <div style={{ position: 'absolute', top: '1rem', left: '1rem' }}>
                                    <span className={isAvailable ? 'badge badge-green' : 'badge badge-red'} style={{ fontSize: '0.85rem', padding: '0.3rem 0.75rem' }}>
                                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: isAvailable ? '#16a34a' : '#dc2626', display: 'inline-block' }} />
                                        {STATUS_LABELS[metadata.status]?.label || metadata.status}
                                    </span>
                                </div>
                                {metadata.is_verified && (
                                    <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                                        <span className="badge badge-blue" style={{ fontSize: '0.82rem' }}>
                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5" /></svg>
                                            Đã xác minh
                                        </span>
                                    </div>
                                )}
                                {/* Prev/Next arrows */}
                                {images.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => setActiveImage((i) => (i - 1 + images.length) % images.length)}
                                            style={navBtnStyle('left')}
                                            aria-label="Ảnh trước"
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6" /></svg>
                                        </button>
                                        <button
                                            onClick={() => setActiveImage((i) => (i + 1) % images.length)}
                                            style={navBtnStyle('right')}
                                            aria-label="Ảnh tiếp"
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6" /></svg>
                                        </button>
                                    </>
                                )}
                            </div>
                            {/* Thumbnails */}
                            {images.length > 1 && (
                                <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem', overflowX: 'auto' }}>
                                    {images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveImage(idx)}
                                            style={{
                                                width: '72px',
                                                height: '56px',
                                                flexShrink: 0,
                                                borderRadius: '0.5rem',
                                                overflow: 'hidden',
                                                border: activeImage === idx ? '2.5px solid #d97706' : '2px solid transparent',
                                                cursor: 'pointer',
                                                padding: 0,
                                                transition: 'border-color 0.2s',
                                            }}
                                            aria-label={`Xem ảnh ${idx + 1}`}
                                        >
                                            <img src={img} alt={`Thumbnail ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Main Info Card */}
                        <div className="card" style={{ padding: '1.5rem' }}>
                            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, color: '#1c1917', marginBottom: '0.75rem', lineHeight: 1.3 }}>
                                {basic_info.title}
                            </h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#57534e', marginBottom: '1.25rem' }}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2">
                                    <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" /><circle cx="12" cy="10" r="3" />
                                </svg>
                                <span style={{ fontSize: '0.9rem' }}>{basic_info.address}</span>
                            </div>

                            {/* Key stats */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', background: '#fffbeb', borderRadius: '0.75rem', padding: '1rem' }}>
                                <StatItem icon="dollar" label="Giá thuê" value={formatPrice(basic_info.price_monthly)} highlight />
                                <StatItem icon="maximize" label="Diện tích" value={formatArea(basic_info.area_sqm)} />
                                <StatItem icon="users" label="Tối đa" value={`${rules_utilities.max_occupants} người`} />
                            </div>

                            {/* Description */}
                            <div style={{ marginTop: '1.25rem' }}>
                                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, marginBottom: '0.625rem' }}>Mô tả</h3>
                                <p style={{ color: '#57534e', fontSize: '0.925rem', lineHeight: 1.75, margin: 0 }}>
                                    {media_contact.description}
                                </p>
                            </div>

                            <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#a8a29e' }}>
                                Đăng ngày: {formatDate(metadata.created_at)} • ID: {room.listing_id}
                            </div>
                        </div>

                        {/* Monthly Costs */}
                        <div className="card" style={{ padding: '1.5rem' }}>
                            <SectionTitle icon="credit-card">Chi phí hàng tháng</SectionTitle>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1rem' }}>
                                <CostRow label="Tiền cọc" value={formatDeposit(monthly_costs.deposit_amount)} />
                                <CostRow label="Điện" value={formatElectricity(monthly_costs.electricity)} />
                                <CostRow label="Nước" value={formatWater(monthly_costs.water)} />
                                <CostRow label="Internet" value={
                                    monthly_costs.internet === 0 ? 'Bao gồm / Không có'
                                        : `${new Intl.NumberFormat('vi-VN').format(monthly_costs.internet)} đ/tháng`
                                } />
                            </div>
                            {monthly_costs.extra_services.length > 0 && (
                                <div style={{ marginTop: '1rem' }}>
                                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#57534e', marginBottom: '0.5rem' }}>Dịch vụ thêm:</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
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
                        <div className="card" style={{ padding: '1.5rem' }}>
                            <SectionTitle icon="check-square">Tiện nghi trong phòng</SectionTitle>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.625rem', marginTop: '1rem' }}>
                                {Object.entries(AMENITIES).map(([key, { label }]) => {
                                    const has = room_features.amenities.includes(key);
                                    return (
                                        <div
                                            key={key}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                padding: '0.5rem 0.75rem',
                                                borderRadius: '0.5rem',
                                                background: has ? '#fffbeb' : '#fafaf9',
                                                border: `1px solid ${has ? '#fde68a' : '#e7e5e4'}`,
                                                opacity: has ? 1 : 0.45,
                                            }}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={has ? '#d97706' : '#a8a29e'} strokeWidth="2">
                                                {has ? <path d="M20 6 9 17l-5-5" /> : <path d="M18 6 6 18M6 6l12 12" />}
                                            </svg>
                                            <span style={{ fontSize: '0.85rem', color: has ? '#92400e' : '#a8a29e', fontWeight: has ? 500 : 400 }}>
                                                {label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Rules */}
                        <div className="card" style={{ padding: '1.5rem' }}>
                            <SectionTitle icon="shield">Nội quy & Tiện ích</SectionTitle>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1rem' }}>
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
                        <div className="card" style={{ padding: '1.5rem' }}>
                            <SectionTitle icon="map">Vị trí trên bản đồ</SectionTitle>
                            <div
                                style={{
                                    background: 'linear-gradient(135deg, #fef3c7, #fffbeb)',
                                    border: '1px dashed #fde68a',
                                    borderRadius: '0.75rem',
                                    height: '200px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    color: '#92400e',
                                    marginTop: '1rem',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s',
                                }}
                            >
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.5">
                                    <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" /><circle cx="12" cy="10" r="3" />
                                </svg>
                                <p style={{ fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>{basic_info.address}</p>
                                <p style={{ fontSize: '0.8rem', color: '#b45309', margin: 0 }}>Nhấn để xem bản đồ (tích hợp sau)</p>
                            </div>
                        </div>
                        {/* Comments Section */}
                        <div className="card" style={{ padding: '1.5rem' }}>
                            <SectionTitle icon="message-circle">Bình luận & Đánh giá</SectionTitle>

                            {/* Comment form */}
                            <div style={{ marginTop: '1.25rem', marginBottom: '2rem' }}>
                                <textarea
                                    placeholder="Viết bình luận của bạn..."
                                    style={{
                                        width: '100%',
                                        minHeight: '100px',
                                        padding: '1rem',
                                        borderRadius: '0.75rem',
                                        border: '1px solid #e7e5e4',
                                        fontFamily: 'Inter, sans-serif',
                                        fontSize: '0.9rem',
                                        outline: 'none',
                                        resize: 'vertical',
                                        transition: 'border-color 0.2s',
                                        boxSizing: 'border-box'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#d97706'}
                                    onBlur={(e) => e.target.style.borderColor = '#e7e5e4'}
                                />
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                                    <button className="btn-primary" style={{ padding: '0.6rem 1.5rem' }}>Gửi bình luận</button>
                                </div>
                            </div>

                            {/* Comment list */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {[
                                    { id: 1, user: 'Hoàng Minh', date: '2 ngày trước', text: 'Phòng này còn không chủ nhà ơi? Nhìn sạch sẽ và rộng rãi quá.', avatar: 'HM' },
                                    { id: 2, user: 'Lan Anh', date: '5 ngày trước', text: 'Chủ nhà rất nhiệt tình, mình vừa xem phòng chiều nay. Vị trí rất tiện lợi cho những người làm việc ở khu vực trung tâm.', avatar: 'LA' }
                                ].map(comment => (
                                    <div key={comment.id} style={{ display: 'flex', gap: '1rem' }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 600,
                                            color: '#4b5563',
                                            fontSize: '0.85rem',
                                            flexShrink: 0,
                                            border: '1px solid #e5e7eb'
                                        }}>
                                            {comment.avatar}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1c1917', margin: 0 }}>{comment.user}</h4>
                                                <span style={{ fontSize: '0.8rem', color: '#78716c' }}>{comment.date}</span>
                                            </div>
                                            <p style={{ fontSize: '0.9rem', color: '#444', lineHeight: 1.5, margin: 0 }}>
                                                {comment.text}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ---- RIGHT COLUMN: Contact sidebar ---- */}
                    <div className="detail-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: '88px' }}>
                        {/* Price card */}
                        <div
                            className="card"
                            style={{
                                padding: '1.5rem',
                            }}
                        >
                            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 800, color: '#d97706', letterSpacing: '-0.02em' }}>
                                {formatPrice(basic_info.price_monthly)}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#a8a29e', marginTop: '0.2rem' }}>
                                {formatArea(basic_info.area_sqm)} • Đặt cọc: {formatDeposit(monthly_costs.deposit_amount)}
                            </div>
                            <div style={{ height: '1px', background: '#e7e5e4', margin: '1rem 0' }} />
                            
                            {/* Owner info inside price card */}
                            <p style={{ fontSize: '0.8rem', color: '#a8a29e', margin: '0 0 0.5rem 0', fontWeight: 500 }}>Thông tin người đăng:</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                <div
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        background: 'linear-gradient(135deg, #d97706, #f59e0b)',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                    }}
                                >
                                    <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', fontFamily: 'var(--font-heading)' }}>
                                        {media_contact.contact.name.charAt(0)}
                                    </span>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 600, fontSize: '0.95rem', color: '#1c1917', margin: '0 0 0.15rem' }}>
                                        {media_contact.contact.name}
                                    </p>
                                    <span className={`badge ${media_contact.contact.role === 'landlord' ? 'badge-amber' : 'badge-blue'}`} style={{ fontSize: '0.7rem' }}>
                                        {media_contact.contact.role === 'landlord' ? 'Chủ nhà' : 'Môi giới'}
                                    </span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <button
                                    onClick={() => navigate('login')}
                                    className="btn-primary"
                                    style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l1.27-.95a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                    </svg>
                                    Hiện số điện thoại
                                </button>
                                <button
                                    className="btn-primary"
                                    style={{
                                        width: '100%',
                                        justifyContent: 'center',
                                        padding: '0.75rem',
                                        color: '#fff',
                                        background: '#0068ff',
                                        borderColor: '#0068ff',
                                        boxShadow: '0 4px 12px rgba(0, 104, 255, 0.25)'
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = '#005ae0'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = '#0068ff'; }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                    </svg>
                                    Nhắn tin qua Zalo
                                </button>
                            </div>
                        </div>

                        {/* Safety tips */}
                        <div
                            style={{
                                background: '#fef3c7',
                                border: '1px solid #fde68a',
                                borderRadius: '0.75rem',
                                padding: '1rem',
                            }}
                        >
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}>
                                    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                                </svg>
                                <div>
                                    <p style={{ fontWeight: 600, color: '#92400e', fontSize: '0.82rem', margin: '0 0 0.25rem', fontFamily: 'var(--font-heading)' }}>Lưu ý an toàn</p>
                                    <p style={{ color: '#b45309', fontSize: '0.78rem', margin: 0, lineHeight: 1.6 }}>
                                        Không chuyển tiền trước khi xem phòng trực tiếp. Kiểm tra kỹ hợp đồng thuê trọ.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        @media (max-width: 1024px) {
          .detail-grid { 
            display: block !important; 
          }
          .detail-sidebar {
            position: static !important;
            margin-top: 2rem;
          }
        }
      `}</style>
        </div>
    );
}

/* Sub-components */
const navBtnStyle = (side) => ({
    position: 'absolute',
    top: '50%',
    [side]: '0.75rem',
    transform: 'translateY(-50%)',
    background: 'rgba(0,0,0,0.45)',
    backdropFilter: 'blur(4px)',
    border: 'none',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#fff',
    transition: 'background 0.2s',
});

function SectionTitle({ icon, children }) {
    return (
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 700, color: '#1c1917', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <IconByName name={icon} />
            {children}
        </h2>
    );
}

function StatItem({ label, value, highlight }) {
    return (
        <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.75rem', color: '#78716c', margin: '0 0 0.2rem', fontWeight: 500 }}>{label}</p>
            <p style={{ fontSize: highlight ? '1.05rem' : '0.95rem', fontWeight: 700, color: highlight ? '#d97706' : '#1c1917', margin: 0, fontFamily: 'var(--font-heading)' }}>
                {value}
            </p>
        </div>
    );
}

function CostRow({ label, value }) {
    return (
        <div style={{ padding: '0.625rem 0.75rem', background: '#fafaf9', borderRadius: '0.5rem', border: '1px solid #f5f5f4' }}>
            <p style={{ fontSize: '0.75rem', color: '#78716c', margin: '0 0 0.15rem' }}>{label}</p>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1c1917', margin: 0 }}>{value}</p>
        </div>
    );
}

function RuleRow({ label, value, ok }) {
    return (
        <div style={{ padding: '0.625rem 0.75rem', background: '#fafaf9', borderRadius: '0.5rem', border: '1px solid #f5f5f4' }}>
            <p style={{ fontSize: '0.75rem', color: '#78716c', margin: '0 0 0.15rem' }}>{label}</p>
            <p style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: ok === undefined ? '#1c1917' : (ok ? '#16a34a' : '#dc2626'),
                margin: 0,
            }}>
                {value}
            </p>
        </div>
    );
}

function ChevronRight() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" strokeWidth="2" style={{ flexShrink: 0 }}>
            <path d="m9 18 6-6-6-6" />
        </svg>
    );
}

function IconByName({ name }) {
    const icons = {
        'credit-card': <><rect width="22" height="16" x="1" y="4" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></>,
        'check-square': <><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></>,
        shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
        map: <><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" /><line x1="9" y1="3" x2="9" y2="18" /><line x1="15" y1="6" x2="15" y2="21" /></>,
        'message-circle': <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
    };
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {icons[name]}
        </svg>
    );
}
