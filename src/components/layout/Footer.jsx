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
        <footer className="bg-stone-900 text-stone-300 pt-12 pb-6 mt-16">
            <div className="container-app">
                {/* Top section */}
                <div className="grid gap-10 pb-10 border-b border-stone-800 grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
                    {/* Brand column */}
                    <div className="col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-amber-600 to-amber-500 rounded-lg flex items-center justify-center">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                    <polyline points="9 22 9 12 15 12 15 22" />
                                </svg>
                            </div>
                            <span className="font-bold text-[1.15rem] text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                                Trọ<span className="text-amber-500">Tốt</span>
                            </span>
                        </div>
                        <p className="text-sm leading-relaxed text-stone-400 max-w-[220px]">
                            Nền tảng tìm trọ uy tín, giúp bạn tìm được căn phòng ưng ý nhanh nhất tại Việt Nam.
                        </p>
                        {/* Social icons */}
                        <div className="flex gap-3 mt-5">
                            {socials.map((s) => (
                                <a
                                    key={s.label}
                                    href={s.href}
                                    aria-label={s.label}
                                    className="flex items-center justify-center w-[34px] h-[34px] rounded-md bg-stone-800 text-stone-400 transition-all duration-200 cursor-pointer hover:bg-amber-600 hover:text-white"
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
                            <h4 className="text-white font-semibold text-[0.9rem] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                                {title}
                            </h4>
                            <ul className="list-none p-0 m-0 flex flex-col gap-[0.6rem]">
                                {links.map((link) => (
                                    <li key={link.label}>
                                        <button
                                            onClick={() => navigate && navigate(link.page)}
                                            className="bg-transparent border-none text-stone-400 text-sm cursor-pointer p-0 font-sans transition-colors duration-200 text-left hover:text-amber-500"
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
                        <h4 className="text-white font-semibold text-[0.9rem] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                            Liên hệ
                        </h4>
                        <div className="flex flex-col gap-3">
                            {[
                                { icon: 'phone', text: '1800 6789 (Miễn phí)' },
                                { icon: 'mail', text: 'hotro@trotot.vn' },
                                { icon: 'map-pin', text: 'Hà Nội & TP. Hồ Chí Minh' },
                            ].map((item) => (
                                <div key={item.text} className="flex items-center gap-2 text-sm text-stone-400">
                                    <ContactIcon name={item.icon} />
                                    <span>{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div className="flex justify-between items-center pt-6 text-[0.8rem] text-stone-500 flex-wrap gap-2">
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
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            {icons[name]}
        </svg>
    );
}
