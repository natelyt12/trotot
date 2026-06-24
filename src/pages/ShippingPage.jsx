import React, { useState, useEffect } from "react";
import {
    TbArrowLeft,
    TbCheck,
    TbTruckDelivery,
    TbMapPin,
    TbCalendar,
    TbClock,
    TbX,
    TbStar,
    TbStarFilled,
    TbPackage,
    TbCar,
    TbListDetails,
    TbTrash,
    TbChevronLeft,
    TbChevronRight
} from "react-icons/tb";

export default function ShippingPage({ navigate }) {
    const [activeTab, setActiveTab] = useState("providers"); // 'providers' | 'orders'
    const [orders, setOrders] = useState([]);
    const [currentBanner, setCurrentBanner] = useState(0);
    const banners = ["/transfer/banner.png", "/transfer/banner2.png", "/transfer/banner3.png", "/transfer/banner4.png"];

    useEffect(() => {
        if (activeTab !== "providers") return;
        const timer = setInterval(() => {
            setCurrentBanner((prev) => (prev + 1) % banners.length);
        }, 3000);
        return () => clearInterval(timer);
    }, [activeTab]);

    // Modals state
    const [ratingModalOpen, setRatingModalOpen] = useState(false);
    const [ratingOrder, setRatingOrder] = useState(null);

    // Form states
    const [bookingForm, setBookingForm] = useState({
        pickup: "",
        dropoff: "",
        vehicleType: "xe-tai-500kg",
        time: "",
        items: "",
    });
    const [estimatedCost, setEstimatedCost] = useState(0);
    const [ratingForm, setRatingForm] = useState({ stars: 5, review: "" });

    const shippingProviders = [
        {
            id: "xanhsm",
            name: "Xanh SM",
            logo: "/transfer/xanhsm.png",
            tag: "Xe điện bảo vệ môi trường",
            desc: "Dịch vụ vận chuyển bằng xe điện 100%, êm ái, sạch sẽ, không mùi xăng dầu. Đặc biệt thân thiện môi trường.",
            multiplier: 1.2
        },
        {
            id: "ghn",
            name: "Giao Hàng Nhanh",
            logo: "/transfer/ghn.webp",
            tag: "Phủ sóng toàn quốc",
            desc: "Đơn vị vận chuyển lâu năm với mạng lưới rộng khắp, hệ thống tracking hiện đại giúp theo dõi đơn hàng chính xác.",
            multiplier: 1.0
        },
        {
            id: "spx",
            name: "SPX Express",
            logo: "/transfer/spx.png",
            tag: "Giá cước cạnh tranh",
            desc: "Dịch vụ vận chuyển của Shopee với chi phí cực rẻ, nhiều ưu đãi và hỗ trợ lấy hàng tận nơi nhanh chóng.",
            multiplier: 0.9
        }
    ];

    const vehicleTypes = [
        { id: "xe-may", name: "Xe máy (Đồ ít)", priceBase: 50000 },
        { id: "xe-ba-gac", name: "Xe ba gác", priceBase: 150000 },
        { id: "xe-tai-500kg", name: "Xe tải 500kg", priceBase: 250000 },
        { id: "xe-tai-1tan", name: "Xe tải 1 tấn", priceBase: 400000 },
    ];

    // MOCK FUNCTIONS
    const handleBookingChange = (e) => {
        const { name, value } = e.target;
        const newForm = { ...bookingForm, [name]: value };
        setBookingForm(newForm);

        // Mock estimate cost based on vehicle
        if (newForm.pickup && newForm.dropoff) {
            const base = vehicleTypes.find(v => v.id === newForm.vehicleType)?.priceBase || 150000;
            // Constant distance multiplier for mockup so it doesn't change wildly on every keystroke
            const distanceMultiplier = 2; 
            setEstimatedCost(base + (distanceMultiplier * 15000));
        } else {
            setEstimatedCost(0);
        }
    };

    const submitBooking = (provider, cost) => {
        if (!bookingForm.pickup || !bookingForm.dropoff || !bookingForm.time) {
            alert("Vui lòng nhập đầy đủ điểm đi, điểm đến và thời gian trước khi đặt xe");
            return;
        }

        const newOrder = {
            id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
            provider: provider,
            details: bookingForm,
            cost: cost,
            status: "pending", // pending, confirmed, completed, cancelled
            createdAt: new Date().toISOString(),
        };

        setOrders([newOrder, ...orders]);
        setActiveTab("orders");
    };

    const updateOrderStatus = (orderId, newStatus) => {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    };

    const openRatingModal = (order) => {
        setRatingOrder(order);
        setRatingForm({ stars: 5, review: "" });
        setRatingModalOpen(true);
    };

    const submitRating = () => {
        setOrders(orders.map(o => o.id === ratingOrder.id ? { ...o, isRated: true, rating: ratingForm } : o));
        setRatingModalOpen(false);
    };

    // UI HELPERS
    const getStatusBadge = (status) => {
        switch (status) {
            case "pending": return <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">Chờ xác nhận</span>;
            case "confirmed": return <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Đã xác nhận (Đang đến)</span>;
            case "completed": return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">Đã hoàn thành</span>;
            case "cancelled": return <span className="px-2.5 py-1 bg-stone-200 text-stone-600 text-xs font-medium rounded-full">Đã hủy</span>;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 pt-20 pb-20 md:pb-10">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
                {/* Header & Back button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <button
                        onClick={() => navigate("home")}
                        className="flex items-center gap-2.5 bg-white border border-stone-200 rounded-full pl-1.5 pr-4 py-1.5 cursor-pointer text-stone-600 text-sm font-medium hover:bg-stone-50 hover:text-stone-900 transition-colors duration-200 group w-fit"
                    >
                        <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 transition-colors group-hover:bg-stone-200 group-hover:text-stone-700">
                            <TbArrowLeft size={14} strokeWidth={3} />
                        </div>
                        <span>Quay lại</span>
                    </button>

                    {/* Tabs */}
                    <div className="flex p-1 bg-white border border-stone-200 rounded-xl shadow-sm w-fit">
                        <button
                            onClick={() => setActiveTab("providers")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border-none ${activeTab === "providers" ? "bg-amber-50 text-amber-700" : "bg-transparent text-stone-500 hover:text-stone-700"}`}
                        >
                            <TbTruckDelivery size={18} />
                            <span>Đặt dịch vụ</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("orders")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border-none ${activeTab === "orders" ? "bg-amber-50 text-amber-700" : "bg-transparent text-stone-500 hover:text-stone-700"}`}
                        >
                            <TbListDetails size={18} />
                            <span>Đơn của tôi</span>
                            {orders.length > 0 && (
                                <span className="bg-amber-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full ml-1">
                                    {orders.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* TAB CONTENT: PROVIDERS */}
                {activeTab === "providers" && (
                    <div className="bg-white border border-stone-200 rounded-2xl p-6 md:p-8 shadow-sm text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-6 md:mb-8 rounded-xl overflow-hidden border border-stone-100 w-full relative group">
                            <div className="relative w-full aspect-[16/9] md:aspect-[16/8]">
                                {banners.map((src, idx) => (
                                    <img
                                        key={idx}
                                        src={src}
                                        alt={`Banner ${idx + 1}`}
                                        className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-700 ${currentBanner === idx ? "opacity-100" : "opacity-0"}`}
                                    />
                                ))}
                            </div>

                            <button 
                                onClick={() => setCurrentBanner(prev => (prev - 1 + banners.length) % banners.length)}
                                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-all border-none cursor-pointer z-10"
                            >
                                <TbChevronLeft size={24} />
                            </button>

                            <button 
                                onClick={() => setCurrentBanner(prev => (prev + 1) % banners.length)}
                                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-all border-none cursor-pointer z-10"
                            >
                                <TbChevronRight size={24} />
                            </button>

                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                                {banners.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentBanner(idx)}
                                        className={`h-2 rounded-full transition-all border-none p-0 cursor-pointer shadow-sm ${currentBanner === idx ? "bg-white w-5" : "bg-white/60 hover:bg-white/90 w-2"}`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* FORM SECTION */}
                        <div className="mb-8 text-left bg-stone-50 p-5 md:p-6 rounded-2xl border border-stone-100">
                            <h3 className="font-medium text-stone-900 text-base md:text-lg mb-5 flex items-center gap-2">
                                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                                    <TbMapPin size={18} />
                                </div>
                                Thông tin vận chuyển
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Điểm đi (Nơi ở cũ) <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <TbMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                                        <input
                                            type="text"
                                            name="pickup"
                                            value={bookingForm.pickup}
                                            onChange={handleBookingChange}
                                            placeholder="Nhập địa chỉ đầy đủ..."
                                            className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Điểm đến (Nơi ở mới) <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <TbMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                                        <input
                                            type="text"
                                            name="dropoff"
                                            value={bookingForm.dropoff}
                                            onChange={handleBookingChange}
                                            placeholder="Nhập địa chỉ đầy đủ..."
                                            className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Loại xe <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <TbCar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                                        <select
                                            name="vehicleType"
                                            value={bookingForm.vehicleType}
                                            onChange={handleBookingChange}
                                            className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all appearance-none shadow-sm cursor-pointer"
                                        >
                                            {vehicleTypes.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Thời gian chuyển <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <TbClock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                                        <input
                                            type="datetime-local"
                                            name="time"
                                            value={bookingForm.time}
                                            onChange={handleBookingChange}
                                            className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Ghi chú đồ đạc cần chuyển</label>
                                    <textarea
                                        name="items"
                                        value={bookingForm.items}
                                        onChange={handleBookingChange}
                                        placeholder="Ví dụ: 1 tủ lạnh, 2 vali quần áo, 1 bàn làm việc..."
                                        className="w-full p-3.5 bg-white border border-stone-200 rounded-xl text-sm focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all min-h-[100px] resize-none shadow-sm"
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        {/* PROVIDERS LIST */}
                        <div className="text-left">
                            <h3 className="font-medium text-stone-900 text-base md:text-lg mb-5 flex items-center gap-2">
                                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                                    <TbTruckDelivery size={18} />
                                </div>
                                Chọn đơn vị vận chuyển
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-center">
                                {shippingProviders.map(provider => (
                                    <div key={provider.id} className="border border-stone-200 rounded-2xl p-6 hover:border-amber-300 hover:shadow-lg transition-all duration-300 group flex flex-col items-center bg-white relative overflow-hidden">
                                        {provider.id === "xanhsm" && (
                                            <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                                                Khuyên dùng
                                            </div>
                                        )}
                                        <div className="w-16 h-16 rounded-2xl bg-stone-50 border border-stone-100 overflow-hidden flex items-center justify-center p-2 mb-4">
                                            <img src={provider.logo} alt={provider.name} className="w-full h-full object-contain" />
                                        </div>
                                        <h4 className="font-semibold text-stone-900 group-hover:text-amber-600 transition-colors mb-1.5">{provider.name}</h4>
                                        <div className="text-[10px] text-stone-500 font-medium flex items-center justify-center gap-1 mb-4 bg-stone-50 px-2.5 py-1 rounded-full uppercase tracking-wide">
                                            <TbCheck className="text-emerald-500" size={14} />
                                            {provider.tag}
                                        </div>
                                        <p className="text-xs text-stone-500 mb-6 line-clamp-3">
                                            {provider.desc}
                                        </p>
                                        
                                        {estimatedCost > 0 ? (
                                            <div className="mt-auto w-full pt-4 border-t border-stone-100">
                                                <div className="text-xs text-stone-500 mb-1">Cước phí dự kiến</div>
                                                <div className="font-bold text-amber-600 text-xl mb-4">
                                                    {(estimatedCost * provider.multiplier).toLocaleString('vi-VN')} đ
                                                </div>
                                                <button
                                                    onClick={() => submitBooking(provider, estimatedCost * provider.multiplier)}
                                                    className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white cursor-pointer border-none text-sm font-medium rounded-xl transition-all shadow-md shadow-amber-500/20 active:scale-[0.98]"
                                                >
                                                    Đặt xe {provider.name}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="mt-auto w-full pt-4 border-t border-stone-100">
                                                <div className="text-[11px] text-stone-400 mb-4 bg-stone-50 py-2 px-3 rounded-lg border border-stone-100 inline-block">Vui lòng nhập điểm đi và đến để xem giá</div>
                                                <button
                                                    disabled
                                                    className="w-full py-3 bg-stone-100 text-stone-400 cursor-not-allowed border-none text-sm font-medium rounded-xl transition-all"
                                                >
                                                    Chưa thể đặt xe
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB CONTENT: ORDERS */}
                {activeTab === "orders" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {orders.length === 0 ? (
                            <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center shadow-sm">
                                <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400">
                                    <TbPackage size={32} />
                                </div>
                                <h3 className="font-medium text-stone-900 mb-1">Chưa có đơn vận chuyển nào</h3>
                                <p className="text-stone-500 text-sm mb-6">Bạn chưa đặt dịch vụ vận chuyển nào. Hãy đặt xe để chuyển phòng dễ dàng hơn nhé!</p>
                                <button
                                    onClick={() => setActiveTab("providers")}
                                    className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer border-none"
                                >
                                    Xem các đơn vị vận chuyển
                                </button>
                            </div>
                        ) : (
                            orders.map(order => (
                                <div key={order.id} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm hover:border-amber-200 transition-colors">
                                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-stone-100">
                                        <div className="flex items-center gap-3">
                                            <img src={order.provider.logo} alt={order.provider.name} className="w-10 h-10 object-contain p-1 border border-stone-100 rounded-lg bg-stone-50" />
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-stone-900">{order.provider.name}</span>
                                                    <span className="text-xs text-stone-400 font-medium">#{order.id}</span>
                                                </div>
                                                <div className="text-xs text-stone-500 mt-0.5">{new Date(order.createdAt).toLocaleString('vi-VN')}</div>
                                            </div>
                                        </div>
                                        <div>{getStatusBadge(order.status)}</div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div className="space-y-3 relative">
                                            <div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-stone-200"></div>
                                            <div className="flex gap-3 relative z-10">
                                                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                                    <TbMapPin size={14} />
                                                </div>
                                                <div>
                                                    <div className="text-xs text-stone-500 mb-0.5">Điểm nhận hàng</div>
                                                    <div className="text-sm font-medium text-stone-900">{order.details.pickup}</div>
                                                </div>
                                            </div>
                                            <div className="flex gap-3 relative z-10">
                                                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                                    <TbMapPin size={14} />
                                                </div>
                                                <div>
                                                    <div className="text-xs text-stone-500 mb-0.5">Điểm giao hàng</div>
                                                    <div className="text-sm font-medium text-stone-900">{order.details.dropoff}</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-stone-50 rounded-xl p-4 flex flex-col justify-center">
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-stone-500">Loại xe:</span>
                                                <span className="font-medium text-stone-900">{vehicleTypes.find(v => v.id === order.details.vehicleType)?.name}</span>
                                            </div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-stone-500">Thời gian:</span>
                                                <span className="font-medium text-stone-900">{new Date(order.details.time).toLocaleString('vi-VN')}</span>
                                            </div>
                                            {order.details.items && (
                                                <div className="flex justify-between text-sm mb-2 flex-col gap-1">
                                                    <span className="text-stone-500">Đồ đạc cần chuyển:</span>
                                                    <span className="font-medium text-stone-900 text-xs bg-white p-2 rounded-lg border border-stone-100">{order.details.items}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between text-sm font-semibold pt-2 border-t border-stone-200 mt-1">
                                                <span className="text-stone-900">Chi phí dự kiến:</span>
                                                <span className="text-amber-600">{order.cost.toLocaleString('vi-VN')} đ</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* MOCK ACTIONS FOR TESTING */}
                                    <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 flex flex-wrap gap-2 items-center justify-between">
                                        <div className="text-xs font-medium text-amber-800 flex items-center gap-1.5">
                                            <TbStar size={14} />
                                            Khu vực giả lập trạng thái đơn (Dành cho demo)
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {order.status === "pending" && (
                                                <>
                                                    <button onClick={() => updateOrderStatus(order.id, "cancelled")} className="px-3 py-1.5 bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 rounded-lg text-xs font-medium cursor-pointer transition-colors">
                                                        Hủy đơn
                                                    </button>
                                                    <button onClick={() => updateOrderStatus(order.id, "confirmed")} className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-medium cursor-pointer transition-colors">
                                                        Tài xế nhận đơn
                                                    </button>
                                                </>
                                            )}
                                            {order.status === "confirmed" && (
                                                <button onClick={() => updateOrderStatus(order.id, "completed")} className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-medium cursor-pointer transition-colors">
                                                    Đã giao hàng xong
                                                </button>
                                            )}
                                            {order.status === "completed" && !order.isRated && (
                                                <button onClick={() => openRatingModal(order)} className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-medium cursor-pointer hover:bg-amber-600 border-none transition-colors shadow-sm">
                                                    Đánh giá dịch vụ
                                                </button>
                                            )}
                                            {order.isRated && (
                                                <div className="flex items-center gap-1 text-xs font-medium text-stone-500 bg-stone-100 px-3 py-1.5 rounded-lg">
                                                    <TbStarFilled className="text-amber-500" />
                                                    Đã đánh giá ({order.rating?.stars} sao)
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>



            {/* MODAL ĐÁNH GIÁ */}
            {ratingModalOpen && ratingOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setRatingModalOpen(false)}></div>
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 text-center p-6">
                        <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <TbStarFilled size={32} />
                        </div>
                        <h3 className="font-semibold text-stone-900 text-lg mb-1">Đánh giá dịch vụ</h3>
                        <p className="text-sm text-stone-500 mb-6">Bạn cảm thấy dịch vụ của {ratingOrder.provider.name} thế nào?</p>

                        <div className="flex justify-center gap-2 mb-6">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    onClick={() => setRatingForm({ ...ratingForm, stars: star })}
                                    className="bg-transparent border-none p-0 cursor-pointer text-amber-400 hover:scale-110 transition-transform"
                                >
                                    {star <= ratingForm.stars ? <TbStarFilled size={36} /> : <TbStar size={36} className="text-stone-300" />}
                                </button>
                            ))}
                        </div>

                        <textarea
                            placeholder="Chia sẻ trải nghiệm của bạn (không bắt buộc)..."
                            value={ratingForm.review}
                            onChange={(e) => setRatingForm({ ...ratingForm, review: e.target.value })}
                            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:border-amber-400 outline-none transition-all resize-none h-24 mb-6"
                        ></textarea>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setRatingModalOpen(false)}
                                className="flex-1 py-2.5 rounded-xl font-medium text-sm bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors border-none cursor-pointer"
                            >
                                Bỏ qua
                            </button>
                            <button
                                onClick={submitRating}
                                className="flex-[2] py-2.5 rounded-xl font-medium text-sm bg-amber-500 text-white hover:bg-amber-600 transition-colors border-none cursor-pointer shadow-md shadow-amber-500/20"
                            >
                                Gửi đánh giá
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
