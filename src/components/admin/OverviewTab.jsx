import React from 'react';
import { 
    TbRefresh, 
    TbUsers, 
    TbFileDescription, 
    TbClock, 
    TbWallet,
    TbUserPlus,
    TbAlertTriangle,
    TbCrown,
    TbCheck,
    TbX,
    TbBuildingWarehouse,
    TbEye,
    TbHeart,
    TbFlag
} from 'react-icons/tb';
import { formatPrice } from '../../utils/formatters';

export default function OverviewTab({ 
    stats, 
    loadingStats, 
    pendingRooms,
    onRejectRoom,
    onApprovePublish,
    onOpenRoomPreview,
    loadingPreviewRoom,
    onViewAllPending,
    onRefresh 
}) {
    // Mock data for the bar chart
    const chartData = [
        { month: '01/06', value: 30 },
        { month: '02/06', value: 45 },
        { month: '03/06', value: 60 },
        { month: '04/06', value: 75 },
        { month: '05/06', value: 90 },
        { month: '06/06', value: 100 },
    ];

    // Mock recent activities
    const recentActivities = [
        { id: 1, text: 'Nguyễn Văn A vừa đăng phòng mới', sub: 'Phòng trọ 20m² - Cầu Giấy, Hà Nội', time: '10:30 AM', icon: TbUserPlus, color: 'text-blue-500 bg-blue-50' },
        { id: 2, text: 'Trần Thị B báo cáo tin đăng', sub: 'Tin không đúng sự thật', time: '10:15 AM', icon: TbAlertTriangle, color: 'text-red-500 bg-red-50' },
        { id: 3, text: 'Phạm Văn C đã thanh toán gói VIP', sub: 'Gói VIP 30 ngày', time: '09:45 AM', icon: TbCrown, color: 'text-amber-500 bg-amber-50' },
        { id: 4, text: 'Admin duyệt tin đăng mới', sub: 'Phòng trọ 25m² - Đống Đa, Hà Nội', time: '09:20 AM', icon: TbCheck, color: 'text-emerald-500 bg-emerald-50' },
    ];

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-extrabold text-stone-900 font-heading">Tổng quan hệ thống</h3>
                    <p className="text-stone-500 text-xs mt-1">Thống kê tổng quan hệ thống quản lý TroTot.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 border border-stone-200 rounded-lg text-xs text-stone-600 bg-stone-50 font-medium">
                        <TbClock size={14} className="text-stone-400" />
                        05/06/2025 - 05/06/2026
                    </div>
                    <button
                        onClick={onRefresh}
                        disabled={loadingStats}
                        className="flex items-center gap-1.5 px-4 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-50 cursor-pointer transition-colors disabled:opacity-50 shadow-sm"
                    >
                        <TbRefresh size={14} className={loadingStats ? 'animate-spin' : ''} />
                        Làm mới
                    </button>
                </div>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Người dùng', value: loadingStats ? '...' : stats.totalUsers, change: '+12,5%', trend: 'up', icon: TbUsers, color: 'from-amber-400 to-amber-500' },
                    { label: 'Tin đăng', value: loadingStats ? '...' : stats.totalRoomsCount, change: '+15,3%', trend: 'up', icon: TbFileDescription, color: 'from-blue-400 to-blue-500' },
                    { label: 'Tin chờ duyệt', value: loadingStats ? '...' : pendingRooms?.length || 0, change: '+4,2%', trend: 'up', icon: TbClock, color: 'from-emerald-400 to-emerald-500' },
                    { label: 'Doanh thu', value: '12.500.000 đ', change: '+18,7%', trend: 'up', icon: TbWallet, color: 'from-purple-400 to-purple-500', isMock: true },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md hover:border-stone-300 transition-all duration-200">
                        <div className="flex items-start justify-between z-10 relative">
                            <div>
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-3 shadow-sm border border-white/20`}>
                                    <stat.icon size={20} />
                                </div>
                                <span className="text-stone-500 text-[11px] font-bold uppercase tracking-wider">{stat.label} {stat.isMock && <span className="text-[9px] lowercase italic text-stone-400 font-normal ml-1">(ưu đãi)</span>}</span>
                                <div className="text-2xl font-black text-stone-900 tracking-tight font-heading mt-1">
                                    {stat.value}
                                </div>
                            </div>
                        </div>
                        <div className="text-[10px] font-bold text-emerald-600 mt-3 flex items-center gap-1 z-10 relative">
                            <span className="bg-emerald-50 px-1.5 py-0.5 rounded text-emerald-600">{stat.change}</span>
                            <span className="text-stone-400 font-medium">so với tháng trước</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Left Column (Charts & Activities) */}
                <div className="lg:col-span-2 space-y-6 flex flex-col">
                    {/* Revenue Chart */}
                    <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm flex-1">
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="font-bold text-stone-900 text-sm">Doanh thu theo tháng</h4>
                            <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-1 rounded-md border border-stone-200">6 tháng gần đây</span>
                        </div>
                        <div className="h-48 flex items-end justify-between gap-2 relative">
                            {/* Grid lines */}
                            <div className="absolute inset-0 flex flex-col justify-between border-b border-stone-100 pb-[18px]">
                                <div className="border-t border-stone-100 w-full h-0"></div>
                                <div className="border-t border-stone-100 w-full h-0"></div>
                                <div className="border-t border-stone-100 w-full h-0"></div>
                                <div className="border-t border-stone-100 w-full h-0"></div>
                            </div>
                            {/* Y axis labels */}
                            <div className="absolute -left-1 inset-y-0 flex flex-col justify-between py-1 pb-[18px] text-[9px] text-stone-400 font-bold">
                                <span>20tr</span>
                                <span>15tr</span>
                                <span>10tr</span>
                                <span>5tr</span>
                                <span>0</span>
                            </div>
                            
                            <div className="flex-1 flex items-end justify-around pl-6 z-10 h-full pb-1">
                                {chartData.map((d, i) => (
                                    <div key={i} className="flex flex-col items-center gap-2 group w-full h-full justify-end">
                                        <div 
                                            className="w-full max-w-[24px] bg-amber-400 rounded-t group-hover:bg-amber-500 transition-colors relative"
                                            style={{ height: `${d.value}%` }}
                                        >
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-around pl-6 text-[10px] text-stone-500 font-bold mt-2">
                            {chartData.map((d, i) => <span key={i}>{d.month}</span>)}
                        </div>
                    </div>

                    {/* Recent Activities */}
                    <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm flex-1">
                        <div className="flex justify-between items-center mb-5">
                            <h4 className="font-bold text-stone-900 text-sm">Hoạt động gần đây</h4>
                            <button className="text-[10px] font-bold text-amber-600 hover:text-amber-700 cursor-pointer">Xem tất cả</button>
                        </div>
                        <div className="space-y-4">
                            {recentActivities.map(activity => (
                                <div key={activity.id} className="flex items-start gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${activity.color}`}>
                                        <activity.icon size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0 pt-0.5">
                                        <div className="font-bold text-stone-800 text-xs truncate leading-none">{activity.text}</div>
                                        <div className="text-[10px] text-stone-500 mt-1 truncate">{activity.sub}</div>
                                    </div>
                                    <div className="text-[9px] text-stone-400 font-medium shrink-0 pt-0.5">{activity.time}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column (Pending Rooms) */}
                <div className="lg:col-span-3">
                    <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm h-full flex flex-col">
                        <div className="flex justify-between items-center mb-5">
                            <h4 className="font-bold text-stone-900 text-sm">Tin chờ duyệt mới nhất</h4>
                            <button 
                                onClick={onViewAllPending}
                                className="text-[10px] font-bold text-amber-600 hover:text-amber-700 cursor-pointer border-none bg-transparent"
                            >
                                Xem tất cả ({pendingRooms?.length || 0})
                            </button>
                        </div>
                        
                        <div className="flex-1 space-y-3">
                            {pendingRooms?.length > 0 ? (
                                pendingRooms.slice(0, 5).map(room => (
                                    <div key={room.id} className="flex items-center justify-between gap-4 p-3 border border-stone-100 rounded-xl hover:bg-stone-50 transition-colors group">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <img 
                                                src={room.image} 
                                                alt={room.title} 
                                                className="w-14 h-14 rounded-lg object-cover border border-stone-200 shrink-0" 
                                                onError={e => { e.currentTarget.src = '/images/placeholder.png'; }}
                                            />
                                            <div className="min-w-0">
                                                <div className="font-bold text-stone-900 text-sm truncate group-hover:text-amber-600 transition-colors">{room.title}</div>
                                                <div className="text-[11px] text-stone-500 mt-0.5 truncate">{room.address}</div>
                                                <div className="text-[10px] font-bold text-stone-400 mt-1">{room.owner}</div>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0 flex flex-col justify-between items-end h-full">
                                            <div className="flex flex-col items-end">
                                                <div className="font-bold text-amber-600 text-sm">{formatPrice(room.price_monthly)}</div>
                                                <div className="text-[9px] text-stone-400 mt-0.5">{room.date}</div>
                                            </div>
                                            <div className="flex gap-1.5 justify-end mt-2 items-center">
                                                <button 
                                                    onClick={() => onOpenRoomPreview && onOpenRoomPreview(room.id)}
                                                    disabled={loadingPreviewRoom}
                                                    className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold border border-stone-200 text-stone-600 hover:bg-stone-50 cursor-pointer transition-colors disabled:opacity-50"
                                                >
                                                    <TbEye size={12} />
                                                    Xem
                                                </button>
                                                <button 
                                                    onClick={() => onRejectRoom && onRejectRoom(room.id, room.title)}
                                                    className="px-2 py-1 rounded text-[10px] font-bold border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                                                >
                                                    Từ chối
                                                </button>
                                                <button 
                                                    onClick={() => onApprovePublish && onApprovePublish(room.id, room.title)}
                                                    className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-500 border border-emerald-500 text-white hover:bg-emerald-600 shadow-sm cursor-pointer transition-colors"
                                                >
                                                    Duyệt
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-stone-400 py-20 bg-stone-50 border border-dashed border-stone-200 rounded-xl">
                                    <TbClock size={32} className="mb-3 opacity-50" />
                                    <p className="text-sm font-bold text-stone-500">Không có tin mới nào đang chờ duyệt</p>
                                    <p className="text-xs text-stone-400 mt-1">Các tin đã xử lý sẽ không xuất hiện ở đây.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Bottom Row */}
            <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-4 px-2">
                    <h4 className="font-bold text-stone-900 text-sm">Thống kê nhanh</h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-stone-100">
                    <div className="px-4 text-center">
                        <div className="w-8 h-8 mx-auto rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                            <TbBuildingWarehouse size={16} />
                        </div>
                        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Chủ trọ</div>
                        <div className="text-xl font-black text-stone-900 font-heading mt-0.5">{stats?.totalLandlords || '...'}</div>
                        <div className="text-[9px] font-bold text-emerald-500 mt-1">▲ 8,2%</div>
                    </div>
                    <div className="px-4 text-center">
                        <div className="w-8 h-8 mx-auto rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mb-2">
                            <TbEye size={16} />
                        </div>
                        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Lượt xem</div>
                        <div className="text-xl font-black text-stone-900 font-heading mt-0.5">125.300</div>
                        <div className="text-[9px] font-bold text-emerald-500 mt-1">▲ 12,7%</div>
                    </div>
                    <div className="px-4 text-center">
                        <div className="w-8 h-8 mx-auto rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-2">
                            <TbHeart size={16} />
                        </div>
                        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Tin yêu thích</div>
                        <div className="text-xl font-black text-stone-900 font-heading mt-0.5">8.450</div>
                        <div className="text-[9px] font-bold text-emerald-500 mt-1">▲ 9,1%</div>
                    </div>
                    <div className="px-4 text-center">
                        <div className="w-8 h-8 mx-auto rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mb-2">
                            <TbFlag size={16} />
                        </div>
                        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Báo cáo</div>
                        <div className="text-xl font-black text-stone-900 font-heading mt-0.5">45</div>
                        <div className="text-[9px] font-bold text-red-500 mt-1">▼ 5,6%</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
