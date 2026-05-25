/**
 * VerificationForm - Mock KYC component for Agents and Landlords
 * @param {Object} props
 * @param {string} props.role - User role (agent or landlord)
 * @param {Function} props.onSubmit - Final registration callback
 * @param {Function} props.onBack - Go back to step 1
 * @param {boolean} props.loading - Submission loading state
 */
export default function VerificationForm({ onSubmit, onBack, loading, submitText = "Hoàn tất & Đăng ký" }) {
    const labelCls = "block text-sm font-semibold text-stone-700 mb-1.5";

    return (
        <div className="flex flex-col gap-6 animate-[fadeIn_0.4s_ease-out]">
            <div className="text-center">
                <p className="text-sm text-stone-500 leading-relaxed m-0 px-2">
                    Vui lòng tải lên ảnh giấy tờ để hệ thống xác thực quyền hạn <b>Chủ nhà</b> của bạn.
                </p>
            </div>

            {/* Mock Upload Fields */}
            <div className="space-y-4">
                <div>
                    <label className={labelCls}>Mặt trước CCCD/CMND</label>
                    <div className="border-2 border-dashed border-stone-200 rounded-xl p-6 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-all group">
                        <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-2 text-stone-400 group-hover:bg-amber-100 group-hover:text-amber-500 transition-colors">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                        </div>
                        <p className="text-xs font-bold text-stone-500 m-0 group-hover:text-amber-700">Tải ảnh lên</p>
                        <p className="text-[10px] text-stone-400 mt-1">Hỗ trợ JPG, PNG (Tối đa 5MB)</p>
                    </div>
                </div>

                <div>
                    <label className={labelCls}>Giấy tờ sở hữu/Kinh doanh</label>
                    <div className="border-2 border-dashed border-stone-200 rounded-xl p-6 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-all group">
                        <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-2 text-stone-400 group-hover:bg-amber-100 group-hover:text-amber-500 transition-colors">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                                <circle cx="9" cy="9" r="2" />
                                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                            </svg>
                        </div>
                        <p className="text-xs font-bold text-stone-500 m-0 group-hover:text-amber-700">Tải tài liệu lên</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <button
                    onClick={onSubmit}
                    disabled={loading}
                    className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white text-sm font-bold py-3 rounded-full cursor-pointer border-none transition-colors shadow-lg shadow-amber-200"
                >
                    {loading ? "Đang gửi hồ sơ..." : submitText}
                </button>
                <button
                    onClick={onBack}
                    className="w-full bg-transparent text-stone-400 text-xs font-bold py-2 cursor-pointer border-none hover:text-stone-600 transition-colors"
                >
                    Quay lại bước trước
                </button>
            </div>
        </div>
    );
}
