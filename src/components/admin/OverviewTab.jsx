import React from 'react';
import { 
    TbRefresh, 
    TbUsers, 
    TbBuildingWarehouse, 
    TbUserCheck, 
    TbHomeCheck, 
    TbTrendingUp 
} from 'react-icons/tb';

export default function OverviewTab({ 
    stats, 
    loadingStats, 
    kycRequestsCount, 
    pendingRoomsCount, 
    onRefresh 
}) {
    return (
        <div className="space-y-8">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-xl font-extrabold text-stone-900 font-heading">Tổng quan hệ thống</h3>
                    <p className="text-stone-500 text-xs mt-1">Số liệu thống kê thời gian thực của ứng dụng TroTot.</p>
                </div>
                <button
                    onClick={onRefresh}
                    disabled={loadingStats}
                    className="flex items-center gap-1.5 px-4 py-2 border border-stone-200 rounded-xl text-xs font-bold text-stone-500 hover:bg-stone-50 hover:text-stone-800 cursor-pointer transition-colors shrink-0 disabled:opacity-50"
                >
                    <TbRefresh size={14} className={loadingStats ? 'animate-spin' : ''} />
                    Làm mới
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                    { 
                        label: 'Tổng số người dùng', 
                        value: loadingStats ? '...' : stats.totalUsers, 
                        sub: `${stats.totalTenants} người thuê / ${stats.totalLandlords} chủ nhà`, 
                        icon: TbUsers, 
                        color: 'from-blue-500/10 to-indigo-500/10 text-blue-600 border-blue-500/20' 
                    },
                    { 
                        label: 'Tổng số tin trọ', 
                        value: loadingStats ? '...' : stats.totalRoomsCount, 
                        sub: 'Đăng tải trên toàn hệ thống', 
                        icon: TbBuildingWarehouse, 
                        color: 'from-amber-500/10 to-orange-500/10 text-amber-600 border-amber-500/20' 
                    },
                    { 
                        label: 'Hồ sơ KYC chưa duyệt', 
                        value: kycRequestsCount, 
                        sub: 'Yêu cầu nâng cấp vai trò', 
                        icon: TbUserCheck, 
                        color: 'from-emerald-500/10 to-teal-500/10 text-emerald-600 border-emerald-500/20' 
                    },
                    { 
                        label: 'Tin đăng chờ kiểm duyệt', 
                        value: loadingStats ? '...' : pendingRoomsCount, 
                        sub: 'Yêu cầu đăng phòng mới', 
                        icon: TbHomeCheck, 
                        color: 'from-pink-500/10 to-rose-500/10 text-pink-600 border-pink-500/20' 
                    },
                    { 
                        label: 'Hiệu suất vận hành', 
                        value: '99.98%', 
                        sub: 'Hệ thống Supabase Cloud', 
                        icon: TbTrendingUp, 
                        color: 'from-violet-500/10 to-purple-500/10 text-violet-600 border-violet-500/20' 
                    },
                ].map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div key={idx} className="bg-white border border-stone-200 rounded-2xl p-5 hover:shadow-md hover:border-stone-300 transition-all duration-200">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-stone-400 text-xs font-bold uppercase tracking-wider">{stat.label}</span>
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${stat.color} flex items-center justify-center border`}>
                                    <Icon size={20} />
                                </div>
                            </div>
                            <div className="text-3xl font-black text-stone-900 tracking-tight font-heading">
                                {stat.value}
                            </div>
                            <div className="text-[11px] text-stone-500 font-medium mt-1">
                                {stat.sub}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
