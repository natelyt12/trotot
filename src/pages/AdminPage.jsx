import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    TbLayoutDashboard, 
    TbHomeCheck, 
    TbUserCheck, 
    TbSettings, 
    TbArrowLeft, 
    TbTrendingUp, 
    TbUsers, 
    TbFileDescription,
    TbCheck,
    TbX,
    TbLock,
    TbMail,
    TbPhone,
    TbCalendar,
    TbMapPin,
    TbBuildingWarehouse,
    TbRefresh,
    TbPlus,
    TbListDetails
} from 'react-icons/tb';
import { useModal } from '../context/ModalContext';
import { useNotification } from '../context/NotificationContext';
import { formatPrice } from '../utils/formatters';
import { supabase } from '../lib/supabase';

const formatRules = (rules) => {
    if (!rules) return '';
    if (typeof rules === 'string') return rules;
    if (typeof rules === 'object') {
        const parts = [];
        if (rules.curfew) parts.push(`Giờ giấc: ${rules.curfew}`);
        if (rules.is_pet_allowed) parts.push(rules.is_pet_allowed === 'yes' || rules.is_pet_allowed === true ? 'Cho phép nuôi thú cưng' : 'Không nuôi thú cưng');
        if (rules.gender_preference) {
            const genderLabel = rules.gender_preference === 'all' ? 'Tất cả' : rules.gender_preference === 'male' ? 'Nam' : 'Nữ';
            parts.push(`Yêu cầu giới tính: ${genderLabel}`);
        }
        return parts.join(' | ');
    }
    return '';
};

// Sample Mock Pending Rooms
const INITIAL_PENDING_ROOMS = [
    {
        id: 'room-mock-1',
        title: 'Phòng trọ cao cấp Studio ban công thoáng mát Trần Duy Hưng',
        owner: 'Nguyễn Văn Hùng',
        owner_phone: '0988776655',
        price_monthly: 4500000,
        area_sqm: 28,
        address: 'Số 12, Ngõ 80 Trần Duy Hưng, Cầu Giấy, Hà Nội',
        date: '2026-05-23',
        image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=80',
        description: 'Phòng đẹp đầy đủ đồ: Máy giặt, tủ lạnh, giường tủ, điều hòa nhiệt độ Inverter tiết kiệm điện. An ninh tốt khóa vân tay.'
    },
    {
        id: 'room-mock-2',
        title: 'Chung cư mini Khép kín không chung chủ gần ĐH Bách Khoa',
        owner: 'Trần Thị Mai',
        owner_phone: '0912345678',
        price_monthly: 3200000,
        area_sqm: 22,
        address: 'Ngõ 204 Lê Thanh Nghị, Hai Bà Trưng, Hà Nội',
        date: '2026-05-22',
        image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=400&q=80',
        description: 'Chỗ để xe rộng rãi miễn phí, vệ sinh khép kín sạch sẽ. Gần nhiều trường đại học lớn Bách Khoa, Kinh Tế, Xây Dựng.'
    },
    {
        id: 'room-mock-3',
        title: 'Căn hộ chung cư mini 2 phòng ngủ rộng rãi phố Chùa Láng',
        owner: 'Lê Hoàng Long',
        owner_phone: '0977665544',
        price_monthly: 6000000,
        area_sqm: 45,
        address: 'Ngõ 119 Chùa Láng, Đống Đa, Hà Nội',
        date: '2026-05-23',
        image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=80',
        description: 'Căn hộ 2 phòng ngủ thích hợp nhóm sinh viên hoặc hộ gia đình nhỏ. Đầy đủ tiện nghi nóng lạnh, giường đệm, rèm cửa.'
    }
];

// Sample Mock KYC Requests
const INITIAL_KYC_REQUESTS = [
    {
        id: 'kyc-mock-1',
        full_name: 'Phạm Minh Đức',
        email: 'duc.pm@gmail.com',
        phone: '0966554433',
        submitted_at: '2026-05-23',
        document_id: '001096012345',
        doc_front: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&w=400&q=80',
        doc_house: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=400&q=80'
    },
    {
        id: 'kyc-mock-2',
        full_name: 'Hoàng Thu Trang',
        email: 'trang.ht@yahoo.com',
        phone: '0904123987',
        submitted_at: '2026-05-22',
        document_id: '038192004567',
        doc_front: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=400&q=80',
        doc_house: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=400&q=80'
    }
];

export default function AdminPage({ navigate }) {
    const { showModal } = useModal();
    const { addNotification } = useNotification();
    const [activeSubTab, setActiveSubTab] = useState('overview'); // 'overview', 'rooms', 'kyc', 'settings'
    const [roomsSubTab, setRoomsSubTab] = useState('pending_verification'); // 'pending_verification' or 'verified'

    // Real DB States
    const [allRooms, setAllRooms] = useState([]);
    const [pendingRooms, setPendingRooms] = useState([]);
    const [kycRequests, setKycRequests] = useState(INITIAL_KYC_REQUESTS); // Mock KYC as there is no DB table for it
    
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalLandlords: 0,
        totalTenants: 0,
        totalRoomsCount: 0
    });
    const [loadingStats, setLoadingStats] = useState(true);

    // Config States
    const [systemSettings, setSystemSettings] = useState({
        autoApproveKYC: false,
        listingExpiryDays: 30,
        maintenanceMode: false,
        sendVerificationEmails: true
    });

    // Fetch Real Stats & All Active Rooms from Supabase
    const fetchAdminData = useCallback(async () => {
        setLoadingStats(true);
        try {
            // 1. Fetch counts
            const { count: usersCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });

            const { count: landlordsCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('role', 'landlord');

            const { count: tenantsCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('role', 'tenant');

            const { count: roomsCount } = await supabase
                .from('rooms')
                .select('*', { count: 'exact', head: true });

            setStats({
                totalUsers: usersCount || 0,
                totalLandlords: landlordsCount || 0,
                totalTenants: tenantsCount || 0,
                totalRoomsCount: roomsCount || 0
            });

            // 2. Fetch all available rooms (both verified and unverified)
            const { data: roomsData, error: roomsError } = await supabase
                .from('rooms')
                .select('*, profiles(*)')
                .eq('status', 'available')
                .order('created_at', { ascending: false });

            if (roomsError) throw roomsError;

            // Map all rooms for UI
            const mappedRooms = (roomsData || []).map(room => {
                const profile = room.profiles;
                return {
                    id: room.id,
                    title: room.title,
                    owner: profile?.full_name || room.media_contact?.contact?.name || 'Bên cho thuê',
                    owner_phone: profile?.phone || room.media_contact?.contact?.phone || 'Chưa cập nhật',
                    price_monthly: room.price_monthly,
                    area_sqm: room.area_sqm,
                    address: [room.address, room.ward, room.district, room.city].filter(Boolean).join(', '),
                    date: new Date(room.created_at).toLocaleDateString('vi-VN'),
                    image: room.media_contact?.images?.[0]?.url || '/images/placeholder.png',
                    description: room.description || formatRules(room.rules_utilities) || 'Không có mô tả.',
                    is_verified: room.is_verified,
                    room_type: room.room_type
                };
            });

            setAllRooms(mappedRooms);
            setPendingRooms(mappedRooms.filter(r => !r.is_verified));
        } catch (err) {
            console.error('Error fetching admin dashboard data:', err);
            addNotification('Lỗi khi tải dữ liệu từ cơ sở dữ liệu!', 'error');
        } finally {
            setLoadingStats(false);
        }
    }, [addNotification]);

    useEffect(() => {
        fetchAdminData();
    }, [fetchAdminData]);

    // Approve Room Handler
    const handleApproveRoom = (roomId, title) => {
        showModal({
            title: 'Phê duyệt tin đăng',
            message: `Bạn có chắc chắn muốn PHÊ DUYỆT tin đăng "${title}"? Tin trọ này sẽ xuất hiện công khai trên trang chủ lập tức.`,
            type: 'warning',
            confirmText: 'Phê duyệt',
            cancelText: 'Hủy bộ',
            onConfirm: async () => {
                try {
                    const { error } = await supabase
                        .from('rooms')
                        .update({ is_verified: true })
                        .eq('id', roomId);

                    if (error) throw error;

                    addNotification('Đã phê duyệt tin đăng phòng trọ thành công!', 'success');
                    fetchAdminData(); // Refresh counts
                } catch (err) {
                    console.error('Error approving room:', err);
                    addNotification('Có lỗi xảy ra khi phê duyệt phòng.', 'error');
                }
            }
        });
    };

    // Cancel Room Verification Handler (move is_verified = false)
    const handleCancelVerification = (roomId, title) => {
        showModal({
            title: 'Hủy xác thực tin đăng',
            message: `Bạn có chắc chắn muốn HỦY XÁC THỰC tin đăng "${title}" không? Tin này sẽ chuyển về hàng chờ kiểm duyệt.`,
            type: 'warning',
            confirmText: 'Hủy xác thực',
            cancelText: 'Hủy bỏ',
            onConfirm: async () => {
                try {
                    const { error } = await supabase
                        .from('rooms')
                        .update({ is_verified: false })
                        .eq('id', roomId);

                    if (error) throw error;

                    addNotification('Đã hủy xác thực tin đăng thành công!', 'success');
                    fetchAdminData(); // Refresh list and counts
                } catch (err) {
                    console.error('Error cancelling room verification:', err);
                    addNotification('Có lỗi xảy ra khi hủy xác thực phòng.', 'error');
                }
            }
        });
    };

    // Reject Room Handler
    const handleRejectRoom = (roomId, title) => {
        showModal({
            title: 'Từ chối tin đăng',
            message: `Bạn có chắc chắn muốn TỪ CHỐI tin đăng "${title}" không? Tin sẽ bị gỡ về bản nháp và thông báo cho người đăng.`,
            type: 'error',
            confirmText: 'Từ chối',
            cancelText: 'Hủy bộ',
            onConfirm: async () => {
                try {
                    const { error } = await supabase
                        .from('rooms')
                        .update({ status: 'draft', is_verified: false })
                        .eq('id', roomId);

                    if (error) throw error;

                    addNotification('Đã từ chối tin đăng và chuyển về bản nháp.', 'warning');
                    fetchAdminData(); // Refresh counts
                } catch (err) {
                    console.error('Error rejecting room:', err);
                    addNotification('Có lỗi xảy ra khi từ chối tin đăng.', 'error');
                }
            }
        });
    };

    // Approve KYC Handler
    const handleApproveKYC = (kycId, fullName) => {
        showModal({
            title: 'Phê duyệt hồ sơ KYC',
            message: `Bạn có chắc chắn muốn PHÊ DUYỆT hồ sơ nâng cấp Chủ nhà của "${fullName}"? Tài khoản này sẽ được nâng cấp vai trò Bên cho thuê (Chủ nhà).`,
            type: 'warning',
            confirmText: 'Duyệt KYC',
            cancelText: 'Hủy bỏ',
            onConfirm: () => {
                setKycRequests(prev => prev.filter(req => req.id !== kycId));
                addNotification(`Đã nâng cấp tài khoản của ${fullName} thành chủ nhà thành công!`, 'success');
            }
        });
    };

    // Reject KYC Handler
    const handleRejectKYC = (kycId, fullName) => {
        showModal({
            title: 'Từ chối hồ sơ KYC',
            message: `Bạn có chắc chắn muốn TỪ CHỐI hồ sơ xác minh của "${fullName}"? Hồ sơ này sẽ bị từ chối và chủ tài khoản sẽ được thông báo làm lại.`,
            type: 'error',
            confirmText: 'Từ chối',
            cancelText: 'Hủy bỏ',
            onConfirm: () => {
                setKycRequests(prev => prev.filter(req => req.id !== kycId));
                addNotification(`Đã từ chối hồ sơ KYC của ${fullName}.`, 'warning');
            }
        });
    };

    const MotionDiv = motion.div;

    return (
        <div className="min-h-screen bg-stone-50 pt-20 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                
                {/* Upper bar with Back to homepage */}
                <div className="mb-6 flex items-center justify-between">
                    <button
                        onClick={() => navigate('home')}
                        className="flex items-center gap-2 bg-white border border-stone-200 rounded-full pl-2 pr-4 py-1.5 cursor-pointer text-stone-600 text-sm font-bold hover:bg-stone-50 hover:text-stone-900 transition-all duration-200 group"
                    >
                        <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 transition-colors group-hover:bg-stone-200">
                            <TbArrowLeft size={14} strokeWidth={2.5} />
                        </div>
                        <span>Quay lại trang chủ</span>
                    </button>
                    
                    <div className="flex items-center gap-2 bg-amber-500/10 text-amber-700 px-4 py-1.5 rounded-full text-xs font-bold border border-amber-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                        Admin Workspace
                    </div>
                </div>

                {/* Main Admin Section Grid */}
                <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-[260px_1fr] min-h-[650px]">
                    
                    {/* Sidebar */}
                    <aside className="lg:border-r border-stone-200 bg-stone-50/40 p-6 flex flex-col justify-between">
                        <div>
                            {/* Logo Admin header */}
                            <div className="mb-8 border-b border-stone-100 pb-5">
                                <h2 className="text-stone-900 text-lg font-black tracking-tight font-heading flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span>
                                    TroTot Admin
                                </h2>
                                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mt-1">Hệ thống kiểm duyệt</p>
                            </div>

                            {/* Sidebar Tab List */}
                            <div className="space-y-1.5">
                                {[
                                    { id: 'overview', label: 'Thống kê tổng quan', icon: TbLayoutDashboard },
                                    { id: 'rooms', label: 'Duyệt tin trọ', icon: TbBuildingWarehouse, badge: pendingRooms.length },
                                    { id: 'kyc', label: 'Xác minh KYC', icon: TbUserCheck, badge: kycRequests.length },
                                    { id: 'settings', label: 'Cài đặt hệ thống', icon: TbSettings }
                                ].map(tab => {
                                    const Icon = tab.icon;
                                    const isActive = activeSubTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveSubTab(tab.id)}
                                            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-left font-bold text-sm border-none cursor-pointer transition-all duration-200 ${
                                                isActive 
                                                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20' 
                                                    : 'bg-transparent text-stone-500 hover:bg-stone-100 hover:text-stone-800'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                                                <span>{tab.label}</span>
                                            </div>
                                            {tab.badge !== undefined && tab.badge > 0 && (
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                    isActive ? 'bg-white text-amber-600' : 'bg-red-500 text-white'
                                                }`}>
                                                    {tab.badge}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}

                                <div className="h-px bg-stone-200 my-4" />
                                <div className="px-3 py-1 text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">
                                    Tiện ích chủ nhà
                                </div>
                                <button
                                    onClick={() => navigate("dashboard", { tab: "post_room" })}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-bold text-sm border-none cursor-pointer bg-transparent text-stone-500 hover:bg-stone-100 hover:text-stone-800 transition-all duration-200"
                                >
                                    <TbPlus size={18} />
                                    <span>Đăng tin mới</span>
                                </button>
                                <button
                                    onClick={() => navigate("dashboard")}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-bold text-sm border-none cursor-pointer bg-transparent text-stone-500 hover:bg-stone-100 hover:text-stone-800 transition-all duration-200"
                                >
                                    <TbListDetails size={18} />
                                    <span>Quản lý tin đăng</span>
                                </button>
                            </div>
                        </div>

                        {/* Sidebar Footer info */}
                        <div className="border-t border-stone-100 pt-5 mt-8 text-[11px] text-stone-400 font-medium">
                            <p>© 2026 TroTot Administration.</p>
                            <p className="mt-1">Version 1.0.0 Stable</p>
                        </div>
                    </aside>

                    {/* Content Panel Area */}
                    <main className="p-6 md:p-8 flex flex-col bg-white">
                        
                        <AnimatePresence mode="wait">
                            
                            {/* --- TAB: OVERVIEW --- */}
                            {activeSubTab === 'overview' && (
                                <MotionDiv
                                    key="overview"
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-8"
                                >
                                    <div>
                                        <h3 className="text-xl font-extrabold text-stone-900 font-heading">Tổng quan hệ thống</h3>
                                        <p className="text-stone-500 text-xs mt-1">Số liệu thống kê thời gian thực của ứng dụng TroTot.</p>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                        {[
                                            { label: 'Tổng số người dùng', value: loadingStats ? '...' : stats.totalUsers, sub: `${stats.totalTenants} người thuê / ${stats.totalLandlords} chủ nhà`, icon: TbUsers, color: 'from-blue-500/10 to-indigo-500/10 text-blue-600 border-blue-500/20' },
                                            { label: 'Tổng số tin trọ', value: loadingStats ? '...' : stats.totalRoomsCount, sub: 'Đăng tải trên toàn hệ thống', icon: TbBuildingWarehouse, color: 'from-amber-500/10 to-orange-500/10 text-amber-600 border-amber-500/20' },
                                            { label: 'Hồ sơ KYC chưa duyệt', value: kycRequests.length, sub: 'Yêu cầu nâng cấp vai trò', icon: TbUserCheck, color: 'from-emerald-500/10 to-teal-500/10 text-emerald-600 border-emerald-500/20' },
                                            { label: 'Tin đăng chờ kiểm duyệt', value: loadingStats ? '...' : pendingRooms.length, sub: 'Yêu cầu đăng phòng mới', icon: TbHomeCheck, color: 'from-pink-500/10 to-rose-500/10 text-pink-600 border-pink-500/20' },
                                            { label: 'Hiệu suất vận hành', value: '99.98%', sub: 'Hệ thống Supabase Cloud', icon: TbTrendingUp, color: 'from-violet-500/10 to-purple-500/10 text-violet-600 border-violet-500/20' },
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


                                </MotionDiv>
                            )}

                            {/* --- TAB: ROOMS MODERATION --- */}
                            {activeSubTab === 'rooms' && (() => {
                                const unverifiedRooms = allRooms.filter(r => !r.is_verified);
                                const verifiedRooms = allRooms.filter(r => r.is_verified);
                                const currentList = roomsSubTab === 'verified' ? verifiedRooms : unverifiedRooms;

                                return (
                                    <MotionDiv
                                        key="rooms"
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -15 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-6"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div>
                                                <h3 className="text-xl font-extrabold text-stone-900 font-heading">Duyệt tin phòng trọ</h3>
                                                <p className="text-stone-500 text-xs mt-1">Quản lý duyệt và xác thực các tin đăng phòng trọ trên toàn hệ thống.</p>
                                            </div>
                                        </div>

                                        {/* Horizontal Tab Bar inside Admin Rooms tab */}
                                        <div className="flex border-b border-stone-200 mb-6 overflow-x-auto whitespace-nowrap">
                                            <button
                                                onClick={() => setRoomsSubTab('pending_verification')}
                                                className={`flex-shrink-0 px-4 py-2 text-sm font-bold border-b-2 transition-colors cursor-pointer ${roomsSubTab === 'pending_verification' ? 'border-amber-500 text-amber-600' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
                                            >
                                                Tin đăng chờ duyệt ({unverifiedRooms.length})
                                            </button>
                                            <button
                                                onClick={() => setRoomsSubTab('verified')}
                                                className={`flex-shrink-0 px-4 py-2 text-sm font-bold border-b-2 transition-colors cursor-pointer ${roomsSubTab === 'verified' ? 'border-amber-500 text-amber-600' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
                                            >
                                                Xác thực tin đăng ({verifiedRooms.length})
                                            </button>
                                        </div>

                                        {currentList.length === 0 ? (
                                            <div className="text-center py-20 bg-stone-50 border border-dashed border-stone-200 rounded-2xl">
                                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-stone-300 shadow-sm border border-stone-100">
                                                    <TbHomeCheck size={32} />
                                                </div>
                                                <p className="text-stone-500 font-bold text-sm">
                                                    {roomsSubTab === 'verified' ? 'Không có tin trọ nào đã xác thực' : 'Không còn phòng trọ nào chờ duyệt'}
                                                </p>
                                                <p className="text-stone-400 text-xs mt-1">Hệ thống đã đạt trạng thái sạch.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-5">
                                                {currentList.map(room => (
                                                    <div 
                                                        key={room.id}
                                                        className="border border-stone-200 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col md:flex-row bg-white"
                                                    >
                                                        {/* Thumbnail */}
                                                        <div className="w-full md:w-56 h-48 md:h-auto shrink-0 relative bg-stone-100">
                                                            <img src={room.image} alt={room.title} className="w-full h-full object-cover" />
                                                            <div className="absolute top-3 left-3 bg-stone-900/75 text-white px-2.5 py-1 rounded-full text-[10px] font-bold">
                                                                {room.room_type === 'room' ? 'Phòng trọ' : room.room_type === 'apartment' ? 'Chung cư' : room.room_type === 'house' ? 'Nhà nguyên căn' : 'Studio'} • {room.area_sqm} m²
                                                            </div>
                                                        </div>

                                                        {/* Details body */}
                                                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                                            <div className="space-y-2">
                                                                <div className="flex items-center justify-between flex-wrap gap-2">
                                                                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                                                                        <TbCalendar size={13} />
                                                                        Gửi ngày: {room.date}
                                                                    </span>
                                                                    <span className="text-amber-600 text-sm font-black font-heading">
                                                                        {formatPrice(room.price_monthly)}/tháng
                                                                    </span>
                                                                </div>

                                                                <h4 className="text-stone-950 font-extrabold text-sm leading-snug font-heading">
                                                                    {room.title}
                                                                </h4>

                                                                <div className="text-xs text-stone-500 flex items-start gap-1">
                                                                    <TbMapPin size={14} className="shrink-0 text-stone-400 mt-0.5" />
                                                                    <span>{room.address}</span>
                                                                </div>

                                                                <p className="text-[11px] text-stone-400 leading-relaxed font-medium line-clamp-2">
                                                                    {room.description}
                                                                </p>
                                                            </div>

                                                            {/* Owner Card & Moderation actions */}
                                                            <div className="border-t border-stone-100 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                                                {/* Landlord contact */}
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 font-bold text-xs">
                                                                        {room.owner.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <div className="text-[11px]">
                                                                        <div className="font-bold text-stone-800">{room.owner}</div>
                                                                        <div className="text-stone-400 flex items-center gap-1.5 font-bold">
                                                                            <TbPhone size={11} /> {room.owner_phone}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Moderation buttons */}
                                                                <div className="flex items-center gap-2 self-end sm:self-auto">
                                                                    {roomsSubTab === 'verified' ? (
                                                                        <button
                                                                            onClick={() => handleCancelVerification(room.id, room.title)}
                                                                            className="bg-amber-50 hover:bg-amber-100 text-amber-600 px-4 py-2 rounded-xl text-xs font-bold border border-amber-100 cursor-pointer transition-colors flex items-center gap-1.5"
                                                                        >
                                                                            <TbX size={14} />
                                                                            <span>Hủy xác thực</span>
                                                                        </button>
                                                                    ) : (
                                                                        <>
                                                                            <button
                                                                                onClick={() => handleRejectRoom(room.id, room.title)}
                                                                                className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-xl text-xs font-bold border border-red-100 cursor-pointer transition-colors flex items-center gap-1.5"
                                                                            >
                                                                                <TbX size={14} />
                                                                                <span>Từ chối</span>
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleApproveRoom(room.id, room.title)}
                                                                                className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-xl text-xs font-bold border-none cursor-pointer shadow-md shadow-amber-500/10 transition-all flex items-center gap-1.5"
                                                                            >
                                                                                <TbCheck size={14} />
                                                                                <span>Phê duyệt</span>
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </MotionDiv>
                                );
                            })()}

                            {/* --- TAB: KYC REQUESTS --- */}
                            {activeSubTab === 'kyc' && (
                                <MotionDiv
                                    key="kyc"
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-6"
                                >
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
                                                                {req.full_name.charAt(0).toUpperCase()}
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
                                                                <img src={req.doc_front} alt="Mặt trước CCCD" className="w-full h-full object-cover" />
                                                                <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer text-white text-[11px] font-bold">
                                                                    Xem ảnh lớn
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* House ownership Doc */}
                                                        <div className="space-y-1.5">
                                                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Tài liệu sở hữu / Giấy kinh doanh</span>
                                                            <div className="h-44 border border-stone-200 rounded-xl overflow-hidden bg-stone-50 group relative">
                                                                <img src={req.doc_house} alt="Giấy tờ sở hữu" className="w-full h-full object-cover" />
                                                                <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer text-white text-[11px] font-bold">
                                                                    Xem ảnh lớn
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* KYC Moderation actions */}
                                                    <div className="flex items-center justify-end gap-2 pt-2">
                                                        <button
                                                            onClick={() => handleRejectKYC(req.id, req.full_name)}
                                                            className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-xl text-xs font-bold border border-red-100 cursor-pointer transition-colors flex items-center gap-1.5"
                                                        >
                                                            <TbX size={14} />
                                                            <span>Bác bỏ hồ sơ</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleApproveKYC(req.id, req.full_name)}
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
                                </MotionDiv>
                            )}

                            {/* --- TAB: SETTINGS --- */}
                            {activeSubTab === 'settings' && (
                                <MotionDiv
                                    key="settings"
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-6"
                                >
                                    <div>
                                        <h3 className="text-xl font-extrabold text-stone-900 font-heading">Cài đặt hệ thống</h3>
                                        <p className="text-stone-500 text-xs mt-1">Cấu hình các thông số kiểm duyệt và quy tắc vận hành chung toàn quốc.</p>
                                    </div>

                                    <div className="border border-stone-200 rounded-2xl p-6 bg-white space-y-6">
                                        {/* Parameter 1: Expiry */}
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-stone-100">
                                            <div className="space-y-1">
                                                <h4 className="text-sm font-extrabold text-stone-950 font-heading">Thời hạn hết hạn mặc định</h4>
                                                <p className="text-stone-400 text-[11px] leading-relaxed max-w-sm">
                                                    Số ngày mặc định mà bài đăng phòng trọ sẽ duy trì ở trạng thái "Công khai" trước khi tự động chuyển thành "Đã hết hạn".
                                                </p>
                                            </div>
                                            <select 
                                                value={systemSettings.listingExpiryDays}
                                                onChange={(e) => setSystemSettings({ ...systemSettings, listingExpiryDays: parseInt(e.target.value, 10) })}
                                                className="px-3 py-2 border border-stone-200 rounded-lg text-xs font-bold text-stone-800 outline-none focus:border-amber-500 bg-stone-50 shrink-0 w-32 cursor-pointer"
                                            >
                                                <option value={7}>7 Ngày</option>
                                                <option value={15}>15 Ngày</option>
                                                <option value={30}>30 Ngày</option>
                                                <option value={60}>60 Ngày</option>
                                            </select>
                                        </div>

                                        {/* Parameter 2: KYC automatic approval */}
                                        <div className="flex items-start justify-between gap-4 pb-5 border-b border-stone-100">
                                            <div className="space-y-1">
                                                <h4 className="text-sm font-extrabold text-stone-950 font-heading">Tự động duyệt KYC (Demo Mode)</h4>
                                                <p className="text-stone-400 text-[11px] leading-relaxed max-w-sm">
                                                    Khi bật, mọi yêu cầu đổi/nâng cấp vai trò gửi lên từ trang cá nhân sẽ được phê duyệt tức thì mà không cần quản trị viên xem xét thủ công.
                                                </p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                                                <input 
                                                    type="checkbox" 
                                                    checked={systemSettings.autoApproveKYC} 
                                                    onChange={(e) => setSystemSettings({ ...systemSettings, autoApproveKYC: e.target.checked })}
                                                    className="sr-only peer" 
                                                />
                                                <div className="w-9 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                                            </label>
                                        </div>

                                        {/* Parameter 3: Maintenance mode */}
                                        <div className="flex items-start justify-between gap-4 pb-5 border-b border-stone-100">
                                            <div className="space-y-1">
                                                <h4 className="text-sm font-extrabold text-stone-950 font-heading flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                                    Chế độ bảo trì hệ thống (Maintenance)
                                                </h4>
                                                <p className="text-stone-400 text-[11px] leading-relaxed max-w-sm">
                                                    Khóa toàn bộ website và hiển thị trang thông báo bảo trì với khách hàng truy cập. (Chỉ dành cho tình huống khẩn cấp).
                                                </p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                                                <input 
                                                    type="checkbox" 
                                                    checked={systemSettings.maintenanceMode} 
                                                    onChange={(e) => setSystemSettings({ ...systemSettings, maintenanceMode: e.target.checked })}
                                                    className="sr-only peer" 
                                                />
                                                <div className="w-9 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-500"></div>
                                            </label>
                                        </div>

                                        {/* Save action button */}
                                        <div className="pt-2 flex justify-end">
                                            <button 
                                                onClick={() => addNotification('Đã lưu cấu hình tham số hệ thống thành công!', 'success')}
                                                className="bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl cursor-pointer border-none transition-colors"
                                            >
                                                Lưu thiết lập
                                            </button>
                                        </div>
                                    </div>
                                </MotionDiv>
                            )}

                        </AnimatePresence>
                    </main>

                </div>

            </div>
        </div>
    );
}
