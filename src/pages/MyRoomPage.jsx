import React, { useState } from "react";
import { motion } from "framer-motion";
import { TbBuildingWarehouse, TbFileText, TbHistory, TbArrowLeft, TbPhone, TbMessageCircle, TbDownload, TbCheck, TbAlertCircle, TbHelpCircle, TbUser } from "react-icons/tb";
import AppIcon from "../components/common/AppIcon.jsx";
import { formatPrice } from "../utils/formatters.js";

export default function MyRoomPage({ user, navigate }) {
    const [activeTab, setActiveTab] = useState("current-room"); // 'current-room', 'contract', 'payments'

    // Mock data for the current rented room
    const mockRoomData = {
        id: "room-rented-1",
        title: "Phòng trọ khép kín Studio ban công cực rộng, full nội thất",
        price_monthly: 4500000,
        deposit: 4500000,
        address: "Số 12 Ngõ 102 Trần Thái Tông, Dịch Vọng Hậu, Cầu Giấy, Hà Nội",
        checkInDate: "01/05/2026",
        image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
        landlord: {
            name: "Nguyễn Văn Anh",
            phone: "0912 345 678",
            avatar_url: null, // triggers initials
            status: "Online"
        },
        utilities: {
            electricity: { rate: 3800, unit: "kWh", note: "Tính theo công tơ riêng" },
            water: { rate: 30000, unit: "m³", note: "Tính theo công tơ riêng" },
            internet: { rate: 100000, unit: "tháng", note: "Chia đều hoặc trọn gói" },
            service: { rate: 50000, unit: "người/tháng", note: "Rác, dọn dẹp vệ sinh chung" }
        },
        amenities: ["Điều hòa", "Nóng lạnh", "Tủ lạnh", "Máy giặt chung", "Giường nệm", "Tủ quần áo", "Khu bếp riêng", "Ban công"]
    };

    // Mock contract details
    const mockContractData = {
        contractId: "HD-2026-0089",
        startDate: "01/05/2026",
        endDate: "30/04/2027",
        duration: "12 tháng (1 năm)",
        cycle: "Hàng tháng (Đóng từ ngày 1 đến ngày 5)",
        status: "Hiệu lực",
        depositStatus: "Đã đóng cọc",
        terms: [
            "Đóng tiền phòng đúng thời hạn thỏa thuận hàng tháng.",
            "Giữ gìn vệ sinh chung, không làm ồn sau 23:00 đêm.",
            "Không được tự ý thay đổi kết cấu phòng trọ khi chưa có sự đồng ý của chủ nhà.",
            "Thông báo trả phòng trước tối thiểu 30 ngày để nhận lại tiền đặt cọc khi hết hạn hợp đồng.",
            "Mọi hư hỏng do lỗi sử dụng tự phát của người thuê phải tự chịu chi phí sửa chữa."
        ]
    };

    // Mock payment history
    const mockPaymentData = [
        {
            invoiceId: "HD-0626",
            month: "Tháng 06/2026",
            paymentDate: "03/06/2026",
            status: "paid",
            breakdown: {
                rent: 4500000,
                electricity: 114 * 3800, // 114 kWh
                water: 4 * 30000, // 4 m3
                internet: 100000,
                service: 50000
            },
            total: 4500000 + (114 * 3800) + (4 * 30000) + 100000 + 50000
        },
        {
            invoiceId: "HD-0526",
            month: "Tháng 05/2026",
            paymentDate: "02/05/2026",
            status: "paid",
            breakdown: {
                rent: 4500000,
                electricity: 50 * 3800, // 50 kWh (tháng đầu ít)
                water: 3 * 30000, // 3 m3
                internet: 100000,
                service: 50000
            },
            total: 4500000 + (50 * 3800) + (3 * 30000) + 100000 + 50000
        }
    ];

    const tabs = [
        { id: "current-room", label: "Phòng trọ đang thuê", icon: TbBuildingWarehouse },
        { id: "contract", label: "Hợp đồng - Thời hạn", icon: TbFileText },
        { id: "payments", label: "Lịch sử thanh toán", icon: TbHistory }
    ];

    return (
        <div className="min-h-screen bg-stone-50 pt-20 pb-20 md:pb-10">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                {/* Back button */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate("home")}
                        className="flex items-center gap-2.5 bg-white border border-stone-200 rounded-full pl-1.5 pr-4 py-1.5 cursor-pointer text-stone-600 text-sm font-bold hover:bg-stone-50 hover:text-stone-900 transition-colors duration-200 group"
                    >
                        <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 transition-colors group-hover:bg-stone-200 group-hover:text-stone-700">
                            <TbArrowLeft size={14} strokeWidth={3} />
                        </div>
                        <span>Quay lại trang chủ</span>
                    </button>
                </div>

                {/* Header title */}
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2 font-heading">
                            <span className="w-2.5 h-6 bg-amber-500 rounded-sm"></span>
                            Quản lý phòng trọ đang thuê
                        </h1>
                        <p className="text-stone-500 text-sm mt-1">Thông tin chi tiết về không gian sống, hợp đồng và hóa đơn dịch vụ của bạn.</p>
                    </div>

                    <div className="bg-emerald-500/10 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-bold border border-emerald-500/20 w-fit flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Trạng thái: Đang thuê phòng
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex border-b border-stone-200 mb-8 overflow-x-auto gap-2 scrollbar-none">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-5 py-3.5 border-b-2 font-bold text-sm cursor-pointer whitespace-nowrap transition-all duration-200 outline-none ${
                                    isActive
                                        ? "border-amber-500 text-amber-600"
                                        : "border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300 bg-transparent"
                                }`}
                            >
                                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Tab content renders */}
                <div className="animate-fade-in-up">
                    {/* TAB: Current Room */}
                    {activeTab === "current-room" && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Room Info Left (2 columns) */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
                                    <div className="aspect-video w-full relative overflow-hidden bg-stone-100">
                                        <img
                                            src={mockRoomData.image}
                                            alt={mockRoomData.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute top-4 left-4 bg-amber-500 text-white text-xs font-extrabold px-3 py-1.5 rounded-full shadow-md uppercase">
                                            Phòng trọ đang ở
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <h2 className="text-xl font-bold text-stone-900 leading-snug">{mockRoomData.title}</h2>
                                        <div className="flex items-start gap-2 text-stone-500 text-xs md:text-sm mt-3">
                                            <div className="w-5 h-5 mt-0.5 shrink-0 flex items-center justify-center text-stone-400">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                    <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                                                    <circle cx="12" cy="10" r="3" />
                                                </svg>
                                            </div>
                                            <span>{mockRoomData.address}</span>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-stone-100 pt-5 mt-5">
                                            <div>
                                                <span className="text-[10px] uppercase font-bold text-stone-400">Tiền phòng hằng tháng</span>
                                                <div className="text-lg font-black text-amber-600 tracking-tight mt-0.5">{formatPrice(mockRoomData.price_monthly)}</div>
                                            </div>
                                            <div>
                                                <span className="text-[10px] uppercase font-bold text-stone-400">Tiền đặt cọc</span>
                                                <div className="text-lg font-black text-stone-800 tracking-tight mt-0.5">{formatPrice(mockRoomData.deposit)}</div>
                                            </div>
                                            <div>
                                                <span className="text-[10px] uppercase font-bold text-stone-400">Ngày dọn vào ở</span>
                                                <div className="text-sm font-bold text-stone-800 tracking-tight mt-1">{mockRoomData.checkInDate}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Utilities Card */}
                                <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
                                    <h3 className="text-base font-bold text-stone-900 border-b border-stone-100 pb-3.5 mb-4 flex items-center gap-2">
                                        <span className="w-1 h-4 bg-amber-500 rounded-sm"></span>
                                        Đơn giá dịch vụ
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {[
                                            { label: "Điện sinh hoạt", val: `${formatPrice(mockRoomData.utilities.electricity.rate)} / ${mockRoomData.utilities.electricity.unit}`, desc: mockRoomData.utilities.electricity.note, icon: "air_conditioner" },
                                            { label: "Nước sinh hoạt", val: `${formatPrice(mockRoomData.utilities.water.rate)} / ${mockRoomData.utilities.water.unit}`, desc: mockRoomData.utilities.water.note, icon: "toilet_paper" },
                                            { label: "Mạng Internet Wifi", val: `${formatPrice(mockRoomData.utilities.internet.rate)} / ${mockRoomData.utilities.internet.unit}`, desc: mockRoomData.utilities.internet.note, icon: "wifi" },
                                            { label: "Chi phí dịch vụ khác", val: `${formatPrice(mockRoomData.utilities.service.rate)} / ${mockRoomData.utilities.service.unit}`, desc: mockRoomData.utilities.service.note, icon: "parking" }
                                        ].map((u, i) => (
                                            <div key={i} className="flex gap-3 p-3.5 border border-stone-100 rounded-xl bg-stone-50/50">
                                                <div className="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center text-amber-500 border border-stone-100">
                                                    <AppIcon name={u.icon} size={18} />
                                                </div>
                                                <div>
                                                    <span className="text-stone-400 text-[10px] font-bold uppercase">{u.label}</span>
                                                    <div className="text-sm font-extrabold text-stone-800 mt-0.5">{u.val}</div>
                                                    <div className="text-[10px] text-stone-500 mt-0.5 font-medium">{u.desc}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Amenities list */}
                                <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
                                    <h3 className="text-base font-bold text-stone-900 border-b border-stone-100 pb-3.5 mb-4 flex items-center gap-2">
                                        <span className="w-1 h-4 bg-amber-500 rounded-sm"></span>
                                        Tiện ích phòng trọ sẵn có
                                    </h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {mockRoomData.amenities.map((amenity, idx) => (
                                            <div key={idx} className="flex items-center gap-2 p-2.5 border border-stone-100 rounded-lg text-stone-700 text-xs font-bold bg-white hover:border-amber-200 transition-colors">
                                                <span className="w-4 h-4 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                                                    <TbCheck size={10} strokeWidth={4} />
                                                </span>
                                                <span className="truncate">{amenity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Landlord Contact Info (1 column) */}
                            <div className="space-y-6">
                                <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
                                    <div className="text-stone-400 uppercase text-[10px] font-bold tracking-wider mb-4">Chủ nhà của bạn</div>
                                    
                                    <div className="w-20 h-20 rounded-full bg-amber-500 text-white font-extrabold text-3xl flex items-center justify-center shadow-md mb-3 border border-white">
                                        {mockRoomData.landlord.avatar_url ? (
                                            <img src={mockRoomData.landlord.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            mockRoomData.landlord.name.charAt(0)
                                        )}
                                    </div>

                                    <h4 className="font-extrabold text-stone-900 text-base">{mockRoomData.landlord.name}</h4>
                                    
                                    <div className="flex items-center gap-1 mt-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                        {mockRoomData.landlord.status}
                                    </div>

                                    <div className="w-full space-y-2 mt-6">
                                        <a
                                            href={`tel:${mockRoomData.landlord.phone}`}
                                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-stone-200 text-stone-700 text-sm font-bold cursor-pointer transition-colors hover:bg-stone-50 text-decoration-none"
                                        >
                                            <TbPhone size={16} />
                                            <span>{mockRoomData.landlord.phone}</span>
                                        </a>
                                        <button
                                            onClick={() => navigate("home")} // placeholder chat
                                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold cursor-pointer border-none transition-colors shadow-sm"
                                        >
                                            <TbMessageCircle size={16} />
                                            <span>Nhắn tin trò chuyện</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
                                    <h4 className="font-bold text-amber-800 text-sm flex items-center gap-1.5">
                                        <TbAlertCircle size={18} className="text-amber-600 shrink-0" />
                                        Hỗ trợ khẩn cấp
                                    </h4>
                                    <p className="text-amber-700 text-[11px] md:text-xs leading-relaxed font-medium">
                                        Nếu gặp sự cố lớn về rò rỉ nước, hỏa hoạn, mất điện cục bộ hoặc mất chìa khóa ra vào chung cư, xin vui lòng gọi trực tiếp cho chủ nhà hoặc liên hệ ban quản lý tòa nhà ngay lập tức.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: Contract */}
                    {activeTab === "contract" && (
                        <div className="bg-white border border-stone-200 rounded-2xl p-6 md:p-8 shadow-sm">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-stone-100 pb-5 mb-6 gap-4">
                                <div>
                                    <h3 className="text-lg font-bold text-stone-900">Chi tiết hợp đồng cho thuê phòng</h3>
                                    <p className="text-stone-500 text-xs mt-0.5">Mã hợp đồng điện tử: <span className="font-mono font-bold text-stone-700">{mockContractData.contractId}</span></p>
                                </div>
                                <button className="flex items-center gap-1.5 px-4 py-2 border border-amber-500/30 bg-amber-50 rounded-xl text-xs font-bold text-amber-700 hover:bg-amber-100 cursor-pointer transition-colors shadow-sm">
                                    <TbDownload size={14} />
                                    Tải PDF bản gốc
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="p-4 border border-stone-100 rounded-xl bg-stone-50/50">
                                    <span className="text-[10px] font-bold text-stone-400 uppercase">Thời hạn hợp đồng</span>
                                    <div className="text-sm font-extrabold text-stone-800 mt-1">{mockContractData.duration}</div>
                                    <div className="text-[10px] text-stone-500 mt-0.5">Từ {mockContractData.startDate} đến {mockContractData.endDate}</div>
                                </div>

                                <div className="p-4 border border-stone-100 rounded-xl bg-stone-50/50">
                                    <span className="text-[10px] font-bold text-stone-400 uppercase">Chu kỳ thanh toán</span>
                                    <div className="text-sm font-extrabold text-stone-800 mt-1">{mockContractData.cycle}</div>
                                    <div className="text-[10px] text-stone-500 mt-0.5">Chuyển khoản trực tiếp</div>
                                </div>

                                <div className="p-4 border border-stone-100 rounded-xl bg-stone-50/50">
                                    <span className="text-[10px] font-bold text-stone-400 uppercase">Mức độ đặt cọc</span>
                                    <div className="text-sm font-extrabold text-stone-800 mt-1">{formatPrice(mockRoomData.deposit)}</div>
                                    <div className="text-[10px] text-emerald-600 font-bold mt-0.5 flex items-center gap-0.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                                        {mockContractData.depositStatus}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-extrabold text-stone-900 text-sm mb-3">Các điều khoản ràng buộc hợp đồng</h4>
                                    <ul className="space-y-3.5 pl-0">
                                        {mockContractData.terms.map((term, index) => (
                                            <li key={index} className="flex gap-3 items-start text-stone-700 text-xs md:text-sm">
                                                <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-600 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                                    {index + 1}
                                                </span>
                                                <span className="leading-relaxed font-medium">{term}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="border-t border-stone-100 pt-6 flex flex-col sm:flex-row justify-between gap-6">
                                    <div className="border border-dashed border-stone-200 rounded-xl p-4 bg-stone-50/20 text-center flex-1 max-w-sm">
                                        <span className="text-[10px] uppercase font-bold text-stone-400">Chữ ký Bên cho thuê (Chủ nhà)</span>
                                        <div className="my-4 text-emerald-600 font-script font-bold text-lg rotate-[-3deg] select-none">
                                            Nguyễn Văn Anh
                                        </div>
                                        <div className="text-[10px] text-emerald-600 font-bold flex items-center justify-center gap-0.5">
                                            <div className="w-3.5 h-3.5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                                                <TbCheck size={10} strokeWidth={4} />
                                            </div>
                                            Đã ký số điện tử
                                        </div>
                                    </div>

                                    <div className="border border-dashed border-stone-200 rounded-xl p-4 bg-stone-50/20 text-center flex-1 max-w-sm">
                                        <span className="text-[10px] uppercase font-bold text-stone-400">Chữ ký Bên thuê (Người dùng)</span>
                                        <div className="my-4 text-emerald-600 font-script font-bold text-lg rotate-[-2deg] select-none">
                                            {user?.user_metadata?.full_name || "Khách hàng thuê trọ"}
                                        </div>
                                        <div className="text-[10px] text-emerald-600 font-bold flex items-center justify-center gap-0.5">
                                            <div className="w-3.5 h-3.5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                                                <TbCheck size={10} strokeWidth={4} />
                                            </div>
                                            Đã ký số điện tử
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: Payments */}
                    {activeTab === "payments" && (
                        <div className="space-y-6">
                            {mockPaymentData.map((payment, index) => (
                                <div key={payment.invoiceId} className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-stone-100 pb-4 gap-3">
                                        <div>
                                            <h4 className="font-extrabold text-stone-900 text-base">{payment.month}</h4>
                                            <p className="text-[11px] text-stone-500 mt-0.5">Mã hóa đơn: <span className="font-mono text-stone-700 font-bold">{payment.invoiceId}</span></p>
                                        </div>
                                        
                                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                                            <div className="bg-emerald-500/10 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20 flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                Đã thanh toán ({payment.paymentDate})
                                            </div>
                                            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-stone-200 rounded-lg text-xs font-bold text-stone-600 hover:bg-stone-50 cursor-pointer transition-colors">
                                                <TbDownload size={13} />
                                                Hóa đơn
                                            </button>
                                        </div>
                                    </div>

                                    {/* Breakdown grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                                        <div className="p-3 bg-stone-50 rounded-xl">
                                            <span className="text-[10px] uppercase font-bold text-stone-400">Tiền phòng hằng tháng</span>
                                            <div className="text-sm font-extrabold text-stone-800 mt-1">{formatPrice(payment.breakdown.rent)}</div>
                                        </div>
                                        <div className="p-3 bg-stone-50 rounded-xl">
                                            <span className="text-[10px] uppercase font-bold text-stone-400">Tiền điện sinh hoạt</span>
                                            <div className="text-sm font-extrabold text-stone-800 mt-1">{formatPrice(payment.breakdown.electricity)}</div>
                                            <div className="text-[9px] text-stone-400 mt-0.5">Chỉ số sử dụng</div>
                                        </div>
                                        <div className="p-3 bg-stone-50 rounded-xl">
                                            <span className="text-[10px] uppercase font-bold text-stone-400">Nước sinh hoạt</span>
                                            <div className="text-sm font-extrabold text-stone-800 mt-1">{formatPrice(payment.breakdown.water)}</div>
                                            <div className="text-[9px] text-stone-400 mt-0.5">Khối sử dụng</div>
                                        </div>
                                        <div className="p-3 bg-stone-50 rounded-xl">
                                            <span className="text-[10px] uppercase font-bold text-stone-400">Wifi & Internet</span>
                                            <div className="text-sm font-extrabold text-stone-800 mt-1">{formatPrice(payment.breakdown.internet)}</div>
                                        </div>
                                        <div className="p-3 bg-stone-50 rounded-xl">
                                            <span className="text-[10px] uppercase font-bold text-stone-400">Dịch vụ tòa nhà</span>
                                            <div className="text-sm font-extrabold text-stone-800 mt-1">{formatPrice(payment.breakdown.service)}</div>
                                        </div>
                                    </div>

                                    {/* Total paid */}
                                    <div className="flex items-center justify-between bg-amber-500/5 border border-amber-500/10 rounded-xl px-4 py-3">
                                        <span className="text-xs font-bold text-stone-700">Tổng cộng tiền thanh toán</span>
                                        <span className="text-base font-black text-amber-600">{formatPrice(payment.total)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
