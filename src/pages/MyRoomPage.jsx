import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    TbBuildingWarehouse,
    TbFileText,
    TbHistory,
    TbArrowLeft,
    TbPhone,
    TbMessageCircle,
    TbDownload,
    TbCheck,
    TbAlertCircle,
    TbHelpCircle,
    TbUser,
    TbPlus,
    TbTrash,
    TbRefresh,
} from "react-icons/tb";
import AppIcon from "../components/common/AppIcon.jsx";
import { formatPrice } from "../utils/formatters.js";
import { mapSupabaseRoom } from "../utils/roomMapper.js";
import { getRentedRooms, removeRentedRoom } from "../services/rentedRoomService.js";
import { getRoomRequestsForTenant, updateRoomRequestStatus } from "../services/forumService.js";
import { useModal } from "../context/ModalContext.jsx";
import { useNotification } from "../context/NotificationContext.jsx";

export default function MyRoomPage({ user, navigate }) {
    const [activeTab, setActiveTab] = useState("current-room"); // 'current-room', 'contract', 'payments'
    const { showModal } = useModal();
    const { addNotification } = useNotification();

    // --- Real DB data for rented rooms ---
    const [rentedRooms, setRentedRooms] = useState([]);
    const [loadingRented, setLoadingRented] = useState(true);

    const fetchRentedRoomsData = () => {
        if (!user?.id) {
            setLoadingRented(false);
            return;
        }
        setLoadingRented(true);
        getRentedRooms(user.id).then(({ data }) => {
            setRentedRooms(data || []);
            setLoadingRented(false);
        });
    };

    const [transferRequests, setTransferRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(true);

    const fetchTransferRequests = async () => {
        if (!user?.id) return;
        setLoadingRequests(true);
        const { data } = await getRoomRequestsForTenant(user.id);
        setTransferRequests(data || []);
        setLoadingRequests(false);
    };

    useEffect(() => {
        if (user?.id) {
            fetchRentedRoomsData();
            fetchTransferRequests();
        }
    }, [user?.id]);

    const handleRemoveRentedRoom = (rentedRoom) => {
        showModal({
            title: "Xóa khỏi danh sách?",
            message: `Xóa "${rentedRoom.rooms?.title || "phòng này"}" khỏi danh sách phòng đang thuê?`,
            type: "warning",
            confirmText: "Xóa",
            cancelText: "Hủy",
            onConfirm: async () => {
                const { error } = await removeRentedRoom(rentedRoom.id);
                if (error) {
                    addNotification("Lỗi khi xóa phòng.", "error");
                    return;
                }
                setRentedRooms((prev) => prev.filter((r) => r.id !== rentedRoom.id));
                addNotification("Đã xóa khỏi danh sách.", "success");
            },
        });
    };

    const handleApproveRequest = (request) => {
        showModal({
            title: "Duyệt yêu cầu sang nhượng",
            message: `Bạn có chắc chắn muốn duyệt yêu cầu sang nhượng từ ${request.requester?.full_name}? Yêu cầu sẽ được chuyển đến chủ trọ để phê duyệt cuối cùng.`,
            type: "info",
            confirmText: "Đồng ý",
            cancelText: "Hủy",
            onConfirm: async () => {
                const { error } = await updateRoomRequestStatus(request.id, "pending_landlord");
                if (error) {
                    addNotification("Lỗi khi duyệt yêu cầu.", "error");
                    return;
                }
                addNotification("Đã duyệt yêu cầu. Chờ chủ trọ xác nhận.", "success");
                fetchTransferRequests();
            },
        });
    };

    const handleRejectRequest = (request) => {
        showModal({
            title: "Từ chối yêu cầu",
            message: `Bạn có chắc chắn muốn từ chối yêu cầu sang nhượng từ ${request.requester?.full_name}?`,
            type: "warning",
            confirmText: "Từ chối",
            cancelText: "Hủy",
            onConfirm: async () => {
                const { error } = await updateRoomRequestStatus(request.id, "rejected");
                if (error) {
                    addNotification("Lỗi khi từ chối yêu cầu.", "error");
                    return;
                }
                addNotification("Đã từ chối yêu cầu.", "info");
                fetchTransferRequests();
            },
        });
    };

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
            status: "Online",
        },
        utilities: {
            electricity: { rate: 3800, unit: "kWh", note: "Tính theo công tơ riêng" },
            water: { rate: 30000, unit: "m³", note: "Tính theo công tơ riêng" },
            internet: { rate: 100000, unit: "tháng", note: "Chia đều hoặc trọn gói" },
            service: { rate: 50000, unit: "người/tháng", note: "Rác, dọn dẹp vệ sinh chung" },
        },
        amenities: ["Điều hòa", "Nóng lạnh", "Tủ lạnh", "Máy giặt chung", "Giường nệm", "Tủ quần áo", "Khu bếp riêng", "Ban công"],
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
            "Mọi hư hỏng do lỗi sử dụng tự phát của người thuê phải tự chịu chi phí sửa chữa.",
        ],
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
                service: 50000,
            },
            total: 4500000 + 114 * 3800 + 4 * 30000 + 100000 + 50000,
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
                service: 50000,
            },
            total: 4500000 + 50 * 3800 + 3 * 30000 + 100000 + 50000,
        },
    ];

    const tabs = [
        { id: "current-room", label: "Phòng trọ đang thuê", icon: TbBuildingWarehouse },
        { id: "contract", label: "Hợp đồng - Thời hạn", icon: TbFileText },
        { id: "payments", label: "Lịch sử thanh toán", icon: TbHistory },
        { id: "requests", label: "Yêu cầu", icon: TbMessageCircle, count: transferRequests.length },
    ];

    return (
        <div className="min-h-screen bg-stone-50 pt-20 pb-20 md:pb-10">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8">
                {/* Back button */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate("home")}
                        className="flex items-center gap-2.5 bg-white border border-stone-200 rounded-full pl-1.5 pr-4 py-1.5 cursor-pointer text-stone-600 text-sm font-medium hover:bg-stone-50 hover:text-stone-900 transition-colors duration-200 group"
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
                        <h1 className="text-2xl font-semibold text-stone-900 tracking-tight flex items-center gap-2 font-heading">
                            Quản lý phòng trọ đang thuê
                        </h1>
                        <p className="text-stone-500 text-sm mt-1">Thông tin chi tiết về không gian sống, hợp đồng và hóa đơn dịch vụ của bạn.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchRentedRoomsData}
                            disabled={loadingRented}
                            className="flex items-center gap-2 pl-1.5 pr-4 py-1.5 border border-stone-200 bg-white shadow-xs rounded-full text-xs font-medium text-stone-600 hover:border-stone-300 hover:bg-stone-50 transition-all disabled:opacity-50 group cursor-pointer"
                        >
                            <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center group-hover:bg-stone-100 transition-colors">
                                <TbRefresh size={12} className={`group-hover:text-stone-600 transition-colors ${loadingRented ? "animate-spin" : ""}`} />
                            </div>
                            <span className="group-hover:text-stone-600 transition-colors">Làm mới</span>
                        </button>
                        {loadingRented ? (
                            <div className="bg-stone-100 text-stone-400 px-4 py-1.5 rounded-full text-xs font-medium border border-stone-200 w-fit flex items-center gap-1.5 animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-stone-300"></span>
                                Trạng thái: Đang tải...
                            </div>
                        ) : rentedRooms.length > 0 ? (
                            <div className="bg-emerald-500/10 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-medium border border-emerald-500/20 w-fit flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Trạng thái: Đang thuê phòng
                            </div>
                        ) : (
                            <div className="bg-stone-500/10 text-stone-600 px-4 py-1.5 rounded-full text-xs font-medium border border-stone-500/20 w-fit flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-stone-400"></span>
                                Trạng thái: Chưa thuê
                            </div>
                        )}
                    </div>
                </div>

                {/* Redesigned Layout */}
                <div className="flex flex-col lg:flex-row gap-5 lg:gap-6 items-start min-h-[500px]">
                    {/* Sidebar */}
                    <aside className="w-full lg:w-[260px] bg-white border border-stone-200 rounded-xl shadow-sm p-6 flex flex-col gap-6 shrink-0">
                        <div className="space-y-2">
                            <div className="px-3 py-1 text-[10px] font-medium text-stone-400 uppercase tracking-widest">Quản lý</div>
                            <div className="space-y-1">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium text-sm cursor-pointer transition-all duration-200 border ${
                                                isActive
                                                    ? "bg-amber-50 border-amber-200 text-amber-700"
                                                    : "border-transparent bg-transparent text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                                            }`}
                                        >
                                            <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                                            <span>{tab.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </aside>

                    {/* Content panel */}
                    <main className="flex-1 w-full bg-white border border-stone-200 rounded-xl shadow-sm p-6 md:p-8 min-w-0">
                            <motion.div key={activeTab} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                                {/* TAB: Current Room */}
                                {activeTab === "current-room" && (
                                    <div>
                                        {loadingRented ? (
                                            <div className="flex items-center justify-center py-20 text-stone-400">
                                                <div className="w-6 h-6 border-2 border-stone-200 border-t-amber-500 rounded-full animate-spin mr-3" />
                                                Đang tải...
                                            </div>
                                        ) : rentedRooms.length === 0 ? (
                                            <div className="text-center py-20 bg-white border border-dashed border-stone-200 rounded-2xl">
                                                <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-400">
                                                    <TbBuildingWarehouse size={32} />
                                                </div>
                                                <p className="font-medium text-stone-700 mb-1 text-base">Bạn chưa có phòng đang thuê nào</p>
                                                <p className="text-stone-400 text-sm mb-6 max-w-xs mx-auto">
                                                    Vào trang chi tiết bất kỳ phòng trọ nào và bấm “Tôi đang thuê phòng này” để thêm vào danh sách.
                                                </p>
                                                <button
                                                    onClick={() => navigate("home")}
                                                    className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-medium text-sm px-6 py-2.5 rounded-full border-none cursor-pointer transition-colors shadow-sm"
                                                >
                                                    <TbPlus size={16} />
                                                    Tìm phòng trọ
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                {rentedRooms.map((rr) => {
                                                    const room = rr.rooms;
                                                    if (!room) return null;
                                                    const thumb = room.media_contact?.images?.[0]?.url || room.media_contact?.images?.[0];
                                                    const landlord = room.profiles;
                                                    return (
                                                        <div
                                                            key={rr.id}
                                                            className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                                                        >
                                                            {/* Thumbnail */}
                                                            <div className="aspect-video bg-stone-100 relative overflow-hidden">
                                                                {thumb ? (
                                                                    <img src={thumb} alt={room.title} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-stone-200">
                                                                        <TbBuildingWarehouse size={48} />
                                                                    </div>
                                                                )}
                                                                <div className="absolute top-3 left-3">
                                                                    <span className="bg-green-50 border border-green-200 text-green-700 text-[0.7rem] font-medium px-2 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                                                                        Đang thuê
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="p-5">
                                                                <h3 className="font-medium text-stone-900 text-base line-clamp-2 mb-1">{room.title}</h3>
                                                                <p className="text-stone-500 text-xs flex items-center gap-1 mb-3">
                                                                    <AppIcon name="address" size={12} />
                                                                    {[room.address, room.district, room.city].filter(Boolean).join(", ")}
                                                                </p>

                                                                <div className="flex items-center justify-between mb-4">
                                                                    <span className="font-semibold text-amber-600 text-lg">
                                                                        {room.price_monthly ? formatPrice(room.price_monthly) : "Liên hệ"}
                                                                    </span>
                                                                </div>

                                                                {/* Landlord contact */}
                                                                {landlord && (
                                                                    <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl mb-4">
                                                                        <div
                                                                            className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center font-medium text-sm shrink-0 overflow-hidden"
                                                                            style={
                                                                                landlord.avatar_url
                                                                                    ? {
                                                                                          backgroundImage: `url(${landlord.avatar_url})`,
                                                                                          backgroundSize: "cover",
                                                                                      }
                                                                                    : {}
                                                                            }
                                                                        >
                                                                            {!landlord.avatar_url && (landlord.full_name || "C").charAt(0)}
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="text-[10px] text-stone-400 font-medium uppercase">Chủ nhà</div>
                                                                            <div className="text-sm font-medium text-stone-800 truncate">
                                                                                {landlord.full_name}
                                                                            </div>
                                                                        </div>
                                                                        {landlord.phone && (
                                                                            <a
                                                                                href={`tel:${landlord.phone}`}
                                                                                className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-300 transition-colors"
                                                                            >
                                                                                <TbPhone size={14} />
                                                                            </a>
                                                                        )}
                                                                    </div>
                                                                )}

                                                                {/* Actions */}
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={() => navigate("room-detail", mapSupabaseRoom(room))}
                                                                        className="flex flex-1 items-center justify-center gap-1.5 py-2 border border-stone-200 text-stone-700 text-xs font-medium rounded-xl hover:bg-stone-50 cursor-pointer transition-colors"
                                                                    >
                                                                        <AppIcon name="eye" size={14} />
                                                                        Xem chi tiết
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleRemoveRentedRoom(rr)}
                                                                        className="w-9 h-9 flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl border border-stone-200 cursor-pointer transition-colors"
                                                                        title="Xóa khỏi danh sách"
                                                                    >
                                                                        <TbTrash size={16} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* TAB: Contract */}
                                {activeTab === "contract" && (
                                    <div className="bg-white border border-stone-200 rounded-2xl p-6 md:p-8 shadow-sm">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-stone-100 pb-5 mb-6 gap-4">
                                            <div>
                                                <h3 className="text-lg font-medium text-stone-900">Chi tiết hợp đồng cho thuê phòng</h3>
                                                <p className="text-stone-500 text-xs mt-0.5">
                                                    Mã hợp đồng điện tử:{" "}
                                                    <span className="font-mono font-medium text-stone-700">{mockContractData.contractId}</span>
                                                </p>
                                            </div>
                                            <button className="flex items-center gap-1.5 px-4 py-2 border border-amber-500/30 bg-amber-50 rounded-xl text-xs font-medium text-amber-700 hover:bg-amber-100 cursor-pointer transition-colors shadow-sm">
                                                <TbDownload size={14} />
                                                Tải PDF bản gốc
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                            <div className="p-4 border border-stone-100 rounded-xl bg-stone-50/50">
                                                <span className="text-[10px] font-medium text-stone-400 uppercase">Thời hạn hợp đồng</span>
                                                <div className="text-sm font-semibold text-stone-800 mt-1">{mockContractData.duration}</div>
                                                <div className="text-[10px] text-stone-500 mt-0.5">
                                                    Từ {mockContractData.startDate} đến {mockContractData.endDate}
                                                </div>
                                            </div>

                                            <div className="p-4 border border-stone-100 rounded-xl bg-stone-50/50">
                                                <span className="text-[10px] font-medium text-stone-400 uppercase">Chu kỳ thanh toán</span>
                                                <div className="text-sm font-semibold text-stone-800 mt-1">{mockContractData.cycle}</div>
                                                <div className="text-[10px] text-stone-500 mt-0.5">Chuyển khoản trực tiếp</div>
                                            </div>

                                            <div className="p-4 border border-stone-100 rounded-xl bg-stone-50/50">
                                                <span className="text-[10px] font-medium text-stone-400 uppercase">Mức độ đặt cọc</span>
                                                <div className="text-sm font-semibold text-stone-800 mt-1">{formatPrice(mockRoomData.deposit)}</div>
                                                <div className="text-[10px] text-emerald-600 font-medium mt-0.5 flex items-center gap-0.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                                                    {mockContractData.depositStatus}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <h4 className="font-semibold text-stone-900 text-sm mb-3">Các điều khoản ràng buộc hợp đồng</h4>
                                                <ul className="space-y-3.5 pl-0">
                                                    {mockContractData.terms.map((term, index) => (
                                                        <li key={index} className="flex gap-3 items-start text-stone-700 text-xs md:text-sm">
                                                            <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-600 text-[10px] font-medium flex items-center justify-center shrink-0 mt-0.5">
                                                                {index + 1}
                                                            </span>
                                                            <span className="leading-relaxed font-normal">{term}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className="border-t border-stone-100 pt-6 flex flex-col sm:flex-row justify-between gap-6">
                                                <div className="border border-dashed border-stone-200 rounded-xl p-4 bg-stone-50/20 text-center flex-1 max-w-sm">
                                                    <span className="text-[10px] uppercase font-medium text-stone-400">Chữ ký Bên cho thuê (Chủ nhà)</span>
                                                    <div className="my-4 text-emerald-600 font-script font-medium text-lg rotate-[-3deg] select-none">
                                                        Nguyễn Văn Anh
                                                    </div>
                                                    <div className="text-[10px] text-emerald-600 font-medium flex items-center justify-center gap-0.5">
                                                        <div className="w-3.5 h-3.5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                                                            <TbCheck size={10} strokeWidth={4} />
                                                        </div>
                                                        Đã ký số điện tử
                                                    </div>
                                                </div>

                                                <div className="border border-dashed border-stone-200 rounded-xl p-4 bg-stone-50/20 text-center flex-1 max-w-sm">
                                                    <span className="text-[10px] uppercase font-medium text-stone-400">Chữ ký Bên thuê (Người dùng)</span>
                                                    <div className="my-4 text-emerald-600 font-script font-medium text-lg rotate-[-2deg] select-none">
                                                        {user?.user_metadata?.full_name || "Khách hàng thuê trọ"}
                                                    </div>
                                                    <div className="text-[10px] text-emerald-600 font-medium flex items-center justify-center gap-0.5">
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
                                                        <h4 className="font-semibold text-stone-900 text-base">{payment.month}</h4>
                                                        <p className="text-[11px] text-stone-500 mt-0.5">
                                                            Mã hóa đơn: <span className="font-mono text-stone-700 font-medium">{payment.invoiceId}</span>
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                                                        <div className="bg-emerald-500/10 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium border border-emerald-500/20 flex items-center gap-1">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                            Đã thanh toán ({payment.paymentDate})
                                                        </div>
                                                        <button className="flex items-center gap-1.5 px-3 py-1.5 border border-stone-200 rounded-lg text-xs font-medium text-stone-600 hover:bg-stone-50 cursor-pointer transition-colors">
                                                            <TbDownload size={13} />
                                                            Hóa đơn
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Breakdown grid */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                                                    <div className="p-3 bg-stone-50 rounded-xl">
                                                        <span className="text-[10px] uppercase font-medium text-stone-400">Tiền phòng hằng tháng</span>
                                                        <div className="text-sm font-semibold text-stone-800 mt-1">{formatPrice(payment.breakdown.rent)}</div>
                                                    </div>
                                                    <div className="p-3 bg-stone-50 rounded-xl">
                                                        <span className="text-[10px] uppercase font-medium text-stone-400">Tiền điện sinh hoạt</span>
                                                        <div className="text-sm font-semibold text-stone-800 mt-1">
                                                            {formatPrice(payment.breakdown.electricity)}
                                                        </div>
                                                        <div className="text-[9px] text-stone-400 mt-0.5">Chỉ số sử dụng</div>
                                                    </div>
                                                    <div className="p-3 bg-stone-50 rounded-xl">
                                                        <span className="text-[10px] uppercase font-medium text-stone-400">Nước sinh hoạt</span>
                                                        <div className="text-sm font-semibold text-stone-800 mt-1">{formatPrice(payment.breakdown.water)}</div>
                                                        <div className="text-[9px] text-stone-400 mt-0.5">Khối sử dụng</div>
                                                    </div>
                                                    <div className="p-3 bg-stone-50 rounded-xl">
                                                        <span className="text-[10px] uppercase font-medium text-stone-400">Wifi & Internet</span>
                                                        <div className="text-sm font-semibold text-stone-800 mt-1">
                                                            {formatPrice(payment.breakdown.internet)}
                                                        </div>
                                                    </div>
                                                    <div className="p-3 bg-stone-50 rounded-xl">
                                                        <span className="text-[10px] uppercase font-medium text-stone-400">Dịch vụ tòa nhà</span>
                                                        <div className="text-sm font-semibold text-stone-800 mt-1">
                                                            {formatPrice(payment.breakdown.service)}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Total paid */}
                                                <div className="flex items-center justify-between bg-amber-500/5 border border-amber-500/10 rounded-xl px-4 py-3">
                                                    <span className="text-xs font-medium text-stone-700">Tổng cộng tiền thanh toán</span>
                                                    <span className="text-base font-bold text-amber-600">{formatPrice(payment.total)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* TAB: Requests */}
                                {activeTab === "requests" && (
                                    <div className="space-y-6">
                                        {loadingRequests ? (
                                            <div className="text-center py-12 text-stone-400">Đang tải yêu cầu...</div>
                                        ) : transferRequests.length === 0 ? (
                                            <div className="text-center py-20 bg-white border border-dashed border-stone-200 rounded-2xl">
                                                <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-300">
                                                    <AppIcon name="messages" size={32} />
                                                </div>
                                                <p className="font-medium text-stone-700 mb-1 text-base">Bạn chưa có yêu cầu chuyển nhượng nào</p>
                                                <p className="text-stone-400 text-sm mb-6 max-w-xs mx-auto">
                                                    Khi ai đó xin sang nhượng phòng bạn đang đăng, yêu cầu sẽ xuất hiện ở đây.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-5">
                                                {transferRequests.map((request) => (
                                                    <div
                                                        key={request.id}
                                                        className="border border-stone-200 rounded-2xl p-5 md:p-6 bg-white shadow-sm flex flex-col md:flex-row gap-6 relative overflow-hidden"
                                                    >
                                                        {/* Decorative band */}
                                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500" />

                                                        <div className="flex-1 min-w-0 pl-2">
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <span className="px-2.5 py-1 bg-purple-100 text-purple-700 text-[0.65rem] font-medium rounded-full uppercase tracking-wider">
                                                                    Yêu cầu xin sang nhượng
                                                                </span>
                                                            </div>

                                                            <h3 className="font-medium text-stone-900 text-base line-clamp-1 mb-1">
                                                                {request.post?.rooms?.title}
                                                            </h3>

                                                            <div className="flex items-center gap-3 mt-4">
                                                                <div className="flex items-center gap-2 bg-stone-50 px-3 py-2 rounded-xl border border-stone-200 flex-1 min-w-0">
                                                                    <div
                                                                        className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center font-medium text-xs shrink-0 overflow-hidden"
                                                                        style={
                                                                            request.requester?.avatar_url
                                                                                ? {
                                                                                      backgroundImage: `url(${request.requester.avatar_url})`,
                                                                                      backgroundSize: "cover",
                                                                                  }
                                                                                : {}
                                                                        }
                                                                    >
                                                                        {!request.requester?.avatar_url &&
                                                                            (request.requester?.full_name || "U").charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <div className="text-[0.65rem] font-medium text-stone-400 uppercase">
                                                                            Người xin nhận
                                                                        </div>
                                                                        <div className="text-sm font-medium text-stone-800 truncate">
                                                                            {request.requester?.full_name}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="flex md:flex-col gap-3 justify-center items-center md:items-end md:w-36 shrink-0 md:border-l md:border-stone-100 md:pl-6">
                                                            <button
                                                                onClick={() => handleApproveRequest(request)}
                                                                className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium text-sm transition-colors border-none cursor-pointer shadow-sm"
                                                            >
                                                                <TbCheck size={16} /> Duyệt
                                                            </button>
                                                            <button
                                                                onClick={() => handleRejectRequest(request)}
                                                                className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl font-medium text-sm transition-colors border-none cursor-pointer"
                                                            >
                                                                <TbTrash size={16} /> Từ chối
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                    </main>
                </div>
            </div>
        </div>
    );
}
