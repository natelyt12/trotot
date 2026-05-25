import React from 'react';
import { 
    TbUserCheck, 
    TbMail, 
    TbPhone, 
    TbCalendar, 
    TbX, 
    TbCheck 
} from 'react-icons/tb';

export default function KycTab({
    kycRequests,
    onApproveKYC,
    onRejectKYC
}) {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-extrabold text-stone-900 font-heading">Xác minh hồ sơ KYC</h3>
                <p className="text-stone-500 text-xs mt-1">Duyệt yêu cầu nâng cấp vai trò từ Người thuê lên Bên cho thuê (Chủ nhà).</p>
            </div>

            {kycRequests.length === 0 ? (
                <div className="text-center py-20 bg-stone-50 border border-dashed border-stone-200 rounded-2xl">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-stone-300 shadow-sm border border-stone-100">
                        <TbUserCheck size={32} />
                    </div>
                    <p className="text-stone-500 font-bold text-sm">Không còn hồ sơ KYC chờ duyệt</p>
                    <p className="text-stone-400 text-xs mt-1">Hệ thống đã đạt trạng thái sạch.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {kycRequests.map(req => (
                        <div 
                            key={req.id}
                            className="border border-stone-200 rounded-2xl p-6 bg-white space-y-5 hover:shadow-md transition-all duration-200"
                        >
                            {/* User Info card */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-sm font-black">
                                        {(req.full_name || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="font-extrabold text-stone-900 text-sm font-heading">{req.full_name}</h4>
                                        <div className="flex items-center gap-3 flex-wrap text-stone-500 text-[10px] font-bold mt-0.5">
                                            <span className="flex items-center gap-1"><TbMail size={12} /> {req.email}</span>
                                            <span className="flex items-center gap-1"><TbPhone size={12} /> {req.phone}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-[10px] text-stone-400 font-bold flex items-center gap-1">
                                    <TbCalendar size={13} />
                                    Gửi yêu cầu: {req.submitted_at}
                                </div>
                            </div>

                            {/* Document Files preview */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Front CCCD */}
                                <div className="space-y-1.5">
                                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Mặt trước CCCD (Số: {req.document_id})</span>
                                    <div className="h-44 border border-stone-200 rounded-xl overflow-hidden bg-stone-50 group relative">
                                        <img src={req.doc_front} alt="Mặt trước CCCD" className="w-full h-full object-cover" onError={e => { e.currentTarget.src = '/images/placeholder.png'; }} />
                                        <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer text-white text-[11px] font-bold">
                                            Xem ảnh lớn
                                        </div>
                                    </div>
                                </div>

                                {/* House ownership Doc */}
                                <div className="space-y-1.5">
                                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Tài liệu sở hữu / Giấy kinh doanh</span>
                                    <div className="h-44 border border-stone-200 rounded-xl overflow-hidden bg-stone-50 group relative">
                                        <img src={req.doc_house} alt="Giấy tờ sở hữu" className="w-full h-full object-cover" onError={e => { e.currentTarget.src = '/images/placeholder.png'; }} />
                                        <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer text-white text-[11px] font-bold">
                                            Xem ảnh lớn
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* KYC Moderation actions */}
                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    onClick={() => onRejectKYC(req.id, req.full_name)}
                                    className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-xl text-xs font-bold border border-red-100 cursor-pointer transition-colors flex items-center gap-1.5"
                                >
                                    <TbX size={14} />
                                    <span>Bác bỏ hồ sơ</span>
                                </button>
                                <button
                                    onClick={() => onApproveKYC(req.id, req.full_name)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-bold border-none cursor-pointer shadow-md shadow-emerald-600/10 transition-all flex items-center gap-1.5"
                                >
                                    <TbCheck size={14} />
                                    <span>Phê duyệt KYC</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
