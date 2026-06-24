import React, { useState, useEffect } from "react";
import AppIcon from "../common/AppIcon.jsx";
import { formatPrice, formatArea, formatDeposit } from "../../utils/formatters.js";
import BookingModal from "./BookingModal.jsx";
import { checkRentedRoom, isRoomRentedGlobally } from "../../services/rentedRoomService.js";

export default function LandlordCard({ room, user, previewMode, showPhone, setShowPhone, showModal, navigate, isExpired }) {
    const computedExpired = isExpired !== undefined ? isExpired : room.metadata?.status === "expired" || room.status === "expired";

    const { basic_info = {}, monthly_costs = {}, media_contact = {} } = room;

    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isRenting, setIsRenting] = useState(false);
    const [isRentedBySomeone, setIsRentedBySomeone] = useState(false);
    const [loadingRentedStatus, setLoadingRentedStatus] = useState(true);

    useEffect(() => {
        if (room?.id && !previewMode) {
            setLoadingRentedStatus(true);
            
            const promises = [];
            
            // Check if ANYONE rents this room
            promises.push(isRoomRentedGlobally(room.id).then(({ data }) => {
                if (data) setIsRentedBySomeone(true);
            }));

            // Check if CURRENT USER rents this room
            if (user?.id) {
                promises.push(checkRentedRoom(user.id, room.id).then(({ data }) => {
                    if (data) setIsRenting(true);
                }));
            }
            
            Promise.all(promises).finally(() => {
                setLoadingRentedStatus(false);
            });
        } else {
            setLoadingRentedStatus(false);
        }
    }, [user?.id, room?.id, previewMode]);

    const [copied, setCopied] = useState(false);

    const formatPhone = (phone) => {
        if (!phone || phone === "Chưa cập nhật" || phone === "Đang cập nhật") return phone;
        const cleaned = phone.replace(/\D/g, "");
        if (cleaned.length === 10) return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
        return phone;
    };

    return (
        <div className="flex flex-col h-full relative">
            <div className="lg:sticky lg:top-[96px] z-10 bg-white border border-stone-200 rounded-xl overflow-hidden">
                {/* Price Section */}
                <div className="p-6 border-b border-stone-100 bg-white">
                    <div className="text-[1.8rem] text-amber-600! font-medium tracking-tight font-heading">{formatPrice(basic_info.price_monthly)}</div>
                    <div className="text-[0.85rem] text-stone-400 mt-1">
                        {formatArea(basic_info.area_sqm)} • Đặt cọc: {formatDeposit(monthly_costs.deposit_amount)}
                    </div>
                    {/* Listing ID & Copy */}
                    <div className="flex items-center justify-between bg-stone-50 rounded-md p-2 px-3 my-4 border border-stone-100">
                        <span className="text-[0.75rem] text-stone-500 font-normal uppercase tracking-wider">Mã tin: {room.listing_id}</span>
                        <button
                            onClick={() => {
                                const code = room.listing_id || "";
                                const handleCopySuccess = () => {
                                    setCopied(true);
                                    setTimeout(() => setCopied(false), 2000);
                                };
                                if (navigator.clipboard && navigator.clipboard.writeText) {
                                    navigator.clipboard.writeText(code)
                                        .then(handleCopySuccess)
                                        .catch((err) => {
                                            console.error("Lỗi sao chép: ", err);
                                        });
                                } else {
                                    const textarea = document.createElement("textarea");
                                    textarea.value = code;
                                    document.body.appendChild(textarea);
                                    textarea.select();
                                    try {
                                        document.execCommand("copy");
                                        handleCopySuccess();
                                    } catch (err) {
                                        console.error("Lỗi sao chép dự phòng: ", err);
                                    }
                                    document.body.removeChild(textarea);
                                }
                            }}
                            className="p-1.5 hover:bg-stone-200 rounded-md transition-colors text-stone-400 hover:text-amber-600 cursor-pointer border-none bg-transparent"
                            title="Sao chép mã tin"
                        >
                            {copied ? (
                                <AppIcon name="check" size={14} className="text-green-600" />
                            ) : (
                                <AppIcon name="copy" size={14} />
                            )}
                        </button>
                    </div>

                    {/* Owner info inside price section */}
                    <p className="text-[0.8rem] text-stone-400 mb-2 font-normal">Thông tin người đăng:</p>
                    <div
                        onClick={previewMode ? undefined : () => navigate && navigate("public-profile", { userId: room.user_id })}
                        className={`flex items-center gap-3 mb-6 ${previewMode ? "" : "cursor-pointer hover:opacity-85 transition-opacity group/landlord"}`}
                    >
                        {(previewMode && user ? user.user_metadata?.avatar_url : media_contact.contact?.avatar) ? (
                            <img
                                src={previewMode && user ? user.user_metadata?.avatar_url : media_contact.contact?.avatar}
                                alt={previewMode && user ? user.user_metadata?.full_name : media_contact.contact?.name}
                                className="w-10 h-10 rounded-full object-cover border border-stone-200"
                            />
                        ) : (
                            <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center shrink-0">
                                <span className="text-white font-medium text-sm">
                                    {(previewMode && user ? user.user_metadata?.full_name : media_contact.contact?.name)?.charAt(0) || "U"}
                                </span>
                            </div>
                        )}
                        <div className="flex-1">
                            <p
                                className={`font-medium text-sm text-stone-900 leading-tight mb-1 ${previewMode ? "" : "group-hover/landlord:text-amber-600 group-hover/landlord:underline transition-colors"}`}
                            >
                                {previewMode && user ? user.user_metadata?.full_name : media_contact.contact?.name}
                            </p>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[0.68rem] font-medium bg-amber-100 text-amber-800">
                                Bên cho thuê
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2.5">
                        {isRenting ? (
                            <div className="flex flex-col gap-2.5">
                                <button
                                    disabled={true}
                                    className="flex items-center justify-center gap-2.5 w-full py-3 rounded-full! text-stone-400 bg-stone-100 border border-stone-200/60 cursor-not-allowed font-medium"
                                >
                                    <AppIcon name="calendar" size={20} strokeWidth={2.5} className="text-stone-400" />
                                    <span>Đặt lịch</span>
                                </button>
                                <div className="flex gap-2 items-start text-amber-700 bg-amber-50 border border-amber-200/50 rounded-xl p-3 text-xs leading-relaxed">
                                    <AppIcon name="alert" size={14} className="shrink-0 mt-0.5 text-amber-600" />
                                    <span>Bạn đang là người thuê của phòng này.</span>
                                </div>
                                {media_contact.contact?.phone && (
                                    <>
                                        <button
                                            disabled={previewMode}
                                            onClick={() => {
                                                window.location.href = `tel:${media_contact.contact?.phone}`;
                                            }}
                                            className={`flex items-center justify-center gap-2.5 w-full py-3 rounded-full! text-white border-none transition-colors duration-200 font-medium ${previewMode ? "bg-stone-300 cursor-not-allowed" : "cursor-pointer bg-amber-500 hover:bg-amber-600"}`}
                                        >
                                            <AppIcon name="phone" size={20} strokeWidth={2.5} />
                                            <span>{formatPhone(media_contact.contact?.phone)}</span>
                                        </button>

                                        <button
                                            disabled={previewMode}
                                            onClick={
                                                previewMode
                                                    ? undefined
                                                    : () => {
                                                          window.open(`https://zalo.me/${media_contact.contact?.phone}`, "_blank");
                                                      }
                                            }
                                            className={`flex items-center justify-center gap-2.5 w-full py-3 rounded-full! text-white transition-colors duration-200 border-none font-medium ${previewMode ? "bg-stone-300 cursor-not-allowed" : "bg-[#0068ff] hover:bg-[#005ae0] cursor-pointer"}`}
                                        >
                                            <AppIcon name="messages" size={20} strokeWidth={2.5} />
                                            <span>Nhắn tin qua Zalo</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        ) : isRentedBySomeone ? (
                            <div className="flex flex-col gap-2.5">
                                <button
                                    disabled={true}
                                    className="flex items-center justify-center gap-2.5 w-full py-3 rounded-full! text-stone-400 bg-stone-100 border border-stone-200/60 cursor-not-allowed font-medium"
                                >
                                    <AppIcon name="calendar" size={20} strokeWidth={2.5} className="text-stone-400" />
                                    <span>Đặt lịch</span>
                                </button>
                                <div className="flex gap-2 items-start text-stone-600 bg-stone-50 border border-stone-200/50 rounded-xl p-3 text-xs leading-relaxed">
                                    <AppIcon name="alert" size={14} className="shrink-0 mt-0.5 text-stone-500" />
                                    <span>Phòng này hiện đã có người thuê.</span>
                                </div>
                                {!showPhone ? (
                                    <button
                                        disabled={previewMode || user?.id === room?.user_id || user?.user_metadata?.role === "admin" || user?.user_metadata?.role === "landlord"}
                                        onClick={previewMode ? undefined : () => setShowPhone(true)}
                                        className={`flex items-center justify-center gap-2.5 w-full py-3 rounded-full! text-stone-600 border border-stone-200 bg-white transition-colors duration-200 font-medium ${previewMode || user?.id === room?.user_id || user?.user_metadata?.role === "admin" || user?.user_metadata?.role === "landlord" ? "cursor-not-allowed opacity-70" : "hover:bg-stone-50 cursor-pointer"}`}
                                    >
                                        <AppIcon name="phone" size={20} strokeWidth={2.5} />
                                        <span>Liên hệ chủ nhà</span>
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            disabled={previewMode}
                                            onClick={() => window.location.href = `tel:${media_contact.contact?.phone}`}
                                            className={`flex items-center justify-center gap-2.5 w-full py-3 rounded-full! text-white border-none transition-colors duration-200 font-medium ${previewMode ? "bg-stone-300 cursor-not-allowed" : "cursor-pointer bg-amber-500 hover:bg-amber-600"}`}
                                        >
                                            <AppIcon name="phone" size={20} strokeWidth={2.5} />
                                            <span>{formatPhone(media_contact.contact?.phone)}</span>
                                        </button>
                                        <button
                                            disabled={previewMode}
                                            onClick={previewMode ? undefined : () => window.open(`https://zalo.me/${media_contact.contact?.phone}`, "_blank")}
                                            className={`flex items-center justify-center gap-2.5 w-full py-3 rounded-full! text-white transition-colors duration-200 border-none font-medium ${previewMode ? "bg-stone-300 cursor-not-allowed" : "bg-[#0068ff] hover:bg-[#005ae0] cursor-pointer"}`}
                                        >
                                            <AppIcon name="messages" size={20} strokeWidth={2.5} />
                                            <span>Nhắn tin qua Zalo</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        ) : !showPhone ? (
                            <button
                                disabled={previewMode || loadingRentedStatus || user?.id === room?.user_id || user?.user_metadata?.role === "admin" || user?.user_metadata?.role === "landlord"}
                                onClick={
                                    previewMode || loadingRentedStatus
                                        ? undefined
                                        : () => {
                                              if (!user) {
                                                  showModal({
                                                      title: "Yêu cầu đăng nhập",
                                                      message: "Vui lòng đăng nhập để đặt lịch hẹn",
                                                      type: "info",
                                                      confirmText: "Đăng nhập",
                                                      onConfirm: () => navigate("login"),
                                                  });
                                                  return;
                                              }

                                              setIsBookingModalOpen(true);
                                          }
                                }
                                className={`flex items-center justify-center gap-2.5 w-full py-3 rounded-full! text-white border-none transition-colors duration-200 font-medium ${previewMode || loadingRentedStatus || user?.id === room?.user_id || user?.user_metadata?.role === "admin" || user?.user_metadata?.role === "landlord" ? "bg-stone-300 cursor-not-allowed" : "cursor-pointer bg-amber-500 hover:bg-amber-600"}`}
                            >
                                <AppIcon name="calendar" size={20} strokeWidth={2.5} />
                                <span>{loadingRentedStatus ? "Đang kiểm tra..." : "Đặt lịch"}</span>
                            </button>
                        ) : (
                            <>
                                <button
                                    disabled={previewMode}
                                    onClick={() => {
                                        window.location.href = `tel:${media_contact.contact?.phone}`;
                                    }}
                                    className={`flex items-center justify-center gap-2.5 w-full py-3 rounded-full! text-white border-none transition-colors duration-200 font-medium ${previewMode ? "bg-stone-300 cursor-not-allowed" : "cursor-pointer bg-amber-500 hover:bg-amber-600"}`}
                                >
                                    <AppIcon name="phone" size={20} strokeWidth={2.5} />
                                    <span>{formatPhone(media_contact.contact?.phone)}</span>
                                </button>

                                <button
                                    disabled={previewMode}
                                    onClick={
                                        previewMode
                                            ? undefined
                                            : () => {
                                                  window.open(`https://zalo.me/${media_contact.contact?.phone}`, "_blank");
                                              }
                                    }
                                    className={`flex items-center justify-center gap-2.5 w-full py-3 rounded-full! text-white transition-colors duration-200 border-none font-medium ${previewMode ? "bg-stone-300 cursor-not-allowed" : "bg-[#0068ff] hover:bg-[#005ae0] cursor-pointer"}`}
                                >
                                    <AppIcon name="messages" size={20} strokeWidth={2.5} />
                                    <span>Nhắn tin qua Zalo</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <BookingModal
                    isOpen={isBookingModalOpen}
                    onClose={() => setIsBookingModalOpen(false)}
                    room={room}
                    user={user}
                    onSuccess={() => setShowPhone(true)}
                />

                {/* Safety tips section */}
                <div className="p-6 bg-amber-50/30">
                    <div className="flex gap-2 items-start text-amber-600">
                        <AppIcon name="alert" size={16} className="mt-0.5" />
                        <div>
                            <p className="font-medium text-amber-900 text-[0.82rem] mb-1 font-heading">Lưu ý quan trọng</p>
                            <p className="text-amber-700 text-[0.78rem] leading-relaxed">
                                Mọi thông tin liên quan đến tin đăng này chỉ mang tính chất tham khảo. Nếu bạn thấy rằng tin đăng này không đúng hoặc có dấu
                                hiệu lừa đảo, hãy phản ánh với chúng tôi.
                            </p>
                            {!previewMode && (
                                <button
                                    onClick={() =>
                                        showModal({
                                            title: "Báo cáo tin đăng",
                                            message: "Tính năng Báo cáo tin đăng đang được phát triển.",
                                            type: "info",
                                        })
                                    }
                                    className="mt-2 text-[0.78rem] text-amber-600 font-medium hover:text-amber-700 underline cursor-pointer border-none bg-transparent p-0 block"
                                >
                                    Báo cáo tin đăng này
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Expired alert section */}
                {computedExpired && (
                    <div className="p-6 bg-red-50 border-t border-red-100">
                        <div className="flex gap-2 items-start text-red-600">
                            <AppIcon name="alert" size={16} className="mt-0.5" />
                            <div>
                                <p className="font-medium text-red-950 text-[0.82rem] mb-1 font-heading">Tin đăng đã hết hạn</p>
                                <p className="text-red-700 text-[0.78rem] leading-relaxed">
                                    Tin đăng này đã quá hạn hiển thị. Vui lòng liên hệ bên cho thuê để xác nhận lại thông tin phòng trống.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
