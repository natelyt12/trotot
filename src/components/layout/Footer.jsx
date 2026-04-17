/* Footer Component */
export default function Footer({ navigate }) {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    'Dịch vụ': [
      { label: 'Tìm phòng', page: 'home' },
      { label: 'Đăng tin', page: 'post' },
      { label: 'Cho thuê phòng', page: 'post' },
    ],
    'Hỗ trợ': [
      { label: 'Hướng dẫn sử dụng', page: 'support' },
      { label: 'Câu hỏi thường gặp', page: 'faq' },
      { label: 'Liên hệ', page: 'contact' },
    ],
    'Công ty': [
      { label: 'Về chúng tôi', page: 'about' },
      { label: 'Blog', page: 'blog' },
      { label: 'Điều khoản sử dụng', page: 'terms' },
    ],
  };

  const socials = [
    {
      label: 'Facebook',
      href: '#',
      icon: (
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      ),
    },
    {
      label: 'Zalo',
      href: '#',
      icon: (
        <>
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <text x="12" y="16" textAnchor="middle" fill="currentColor" fontSize="9" fontWeight="bold">Z</text>
        </>
      ),
    },
    {
      label: 'YouTube',
      href: '#',
      icon: (
        <>
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
          <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#fff" />
        </>
      ),
    },
  ];

  return (
    <footer
      style={{
        background: '#1c1917',
        color: '#d6d3d1',
        paddingTop: '3rem',
        paddingBottom: '1.5rem',
        marginTop: '4rem',
      }}
    >
      <div className="container-app">
        {/* Top section */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '2.5rem',
            paddingBottom: '2.5rem',
            borderBottom: '1px solid #292524',
          }}
        >
          {/* Brand column */}
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  background: 'linear-gradient(135deg, #d97706, #f59e0b)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.15rem', color: '#fff' }}>
                Trọ<span style={{ color: '#f59e0b' }}>Tốt</span>
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.7, color: '#a8a29e', maxWidth: '220px' }}>
              Nền tảng tìm trọ uy tín, giúp bạn tìm được căn phòng ưng ý nhanh nhất tại Việt Nam.
            </p>
            {/* Social icons */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    background: '#292524',
                    color: '#a8a29e',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#d97706';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#292524';
                    e.currentTarget.style.color = '#a8a29e';
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {s.icon}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Links columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
                {title}
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => navigate && navigate(link.page)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#a8a29e',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        padding: 0,
                        fontFamily: 'Inter, sans-serif',
                        transition: 'color 0.2s',
                        textAlign: 'left',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#f59e0b'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#a8a29e'; }}
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact info */}
          <div>
            <h4 style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
              Liên hệ
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { icon: 'phone', text: '1800 6789 (Miễn phí)' },
                { icon: 'mail', text: 'hotro@trotot.vn' },
                { icon: 'map-pin', text: 'Hà Nội & TP. Hồ Chí Minh' },
              ].map((item) => (
                <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#a8a29e' }}>
                  <ContactIcon name={item.icon} />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '1.5rem',
            fontSize: '0.8rem',
            color: '#78716c',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <p>&copy; {currentYear} TrọTốt. Tất cả quyền được bảo lưu.</p>
          <p>Được xây dựng với ❤ tại Việt Nam</p>
        </div>
      </div>
    </footer>
  );
}

function ContactIcon({ name }) {
  const icons = {
    phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l1.27-.95a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />,
    mail: <><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></>,
    'map-pin': <><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" /><circle cx="12" cy="10" r="3" /></>,
  };
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      {icons[name]}
    </svg>
  );
}
