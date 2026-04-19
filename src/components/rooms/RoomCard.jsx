import { AMENITIES } from '../../data/constants.js';
import { formatPriceShort, formatArea, formatAddressShort, truncate } from '../../utils/formatters.js';

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
      style={{
        background: '#fff',
        borderRadius: '1rem',
        border: '1px solid #e7e5e4',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.05)';
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(); }}
      aria-label={`Xem chi tiết ${basic_info.title}`}
    >
      {/* Image */}
      <div style={{ position: 'relative', overflow: 'hidden', height: '200px', flexShrink: 0 }}>
        <img
          src={mainImage}
          alt={basic_info.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease',
          }}
          loading="lazy"
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.04)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          onError={(e) => { e.currentTarget.src = `https://picsum.photos/seed/fallback${room.listing_id}/600/400`; }}
        />
        {/* Status badge overlay */}
        <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', display: 'flex', gap: '0.4rem' }}>
          <span
            className={isAvailable ? 'badge badge-green' : 'badge badge-red'}
            style={{ backdropFilter: 'blur(6px)', background: isAvailable ? 'rgba(220,252,231,0.92)' : 'rgba(254,226,226,0.92)' }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isAvailable ? '#16a34a' : '#dc2626', display: 'inline-block' }} />
            {isAvailable ? 'Còn phòng' : 'Đã cho thuê'}
          </span>
          {metadata.is_verified && (
            <span className="badge badge-blue" style={{ backdropFilter: 'blur(6px)', background: 'rgba(219,234,254,0.92)' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              Đã xác minh
            </span>
          )}
        </div>
        {/* Image count badge */}
        {media_contact.images.length > 1 && (
          <div
            style={{
              position: 'absolute',
              bottom: '0.75rem',
              right: '0.75rem',
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(4px)',
              color: '#fff',
              borderRadius: '0.5rem',
              padding: '0.2rem 0.5rem',
              fontSize: '0.75rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
            {media_contact.images.length}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        {/* Price & Area */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span
            style={{
              fontSize: '1.2rem',
              fontWeight: 700,
              color: '#d97706',
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-0.01em',
            }}
          >
            {formatPriceShort(basic_info.price_monthly)}
          </span>
          <span
            style={{
              fontSize: '0.8rem',
              color: '#78716c',
              background: '#f5f5f4',
              padding: '0.15rem 0.5rem',
              borderRadius: '0.4rem',
              fontWeight: 500,
            }}
          >
            {formatArea(basic_info.area_sqm)}
          </span>
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: '0.95rem',
            fontWeight: 600,
            color: '#1c1917',
            lineHeight: 1.4,
            margin: 0,
            fontFamily: 'var(--font-heading)',
          }}
        >
          {truncate(basic_info.title, 65)}
        </h3>

        {/* Address */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#78716c', fontSize: '0.825rem' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>{formatAddressShort(basic_info.address)}</span>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: '#f5f5f4', margin: '0.25rem 0' }} />

        {/* Amenities */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
          {amenityBadges.map((key) => (
            <span key={key} className="badge badge-amber">
              <AmenityIcon name={key} />
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
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.25rem' }}>
          {room_features.parking.has_parking && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.775rem', color: '#57534e' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
              </svg>
              Chỗ đỗ xe
            </span>
          )}
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.775rem', color: '#57534e' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
              <path d="M14.5 3.5a1.5 1.5 0 0 1 0 2.121L8.5 11.5 6 13l1.5-2.5 6.086-6.086A1.5 1.5 0 0 1 14.5 3.5z" />
            </svg>
            WC {room_features.bathroom_type === 'private' ? 'riêng' : 'chung'}
          </span>
        </div>
      </div>
    </article>
  );
}

function AmenityIcon({ name }) {
  const paths = {
    bed: <path d="M2 4v16M22 4v16M2 8h20M2 12h20M2 20h20" />,
    air_conditioner: <><rect width="20" height="14" x="2" y="3" rx="2" /><path d="M12 17v4M8 21h8" /></>,
    fridge: <><rect width="18" height="20" x="3" y="2" rx="2" /><path d="M3 10h18M12 2v8" /></>,
    wardrobe: <><rect width="20" height="20" x="2" y="2" rx="2" /><path d="M12 2v20M8 10h2M14 10h2" /></>,
    kitchen: <><path d="M8.5 2a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM19 2v13" /><path d="M22 2v13M16 8h6" /></>,
    washing_machine: <><rect width="20" height="20" x="2" y="2" rx="2" /><circle cx="12" cy="12" r="4" /><path d="M6 6h.01M9 6h.01" /></>,
  };
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {paths[name] || <circle cx="12" cy="12" r="5" />}
    </svg>
  );
}
