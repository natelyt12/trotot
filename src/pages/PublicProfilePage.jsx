import { useState, useEffect } from 'react';
import { getUserProfile } from '../services/profileService';
import { getActiveUserRooms } from '../services/roomService';
import { mapSupabaseRoom } from '../utils/roomMapper';
import RoomCard from '../components/rooms/RoomCard.jsx';
import AppIcon from '../components/common/AppIcon.jsx';
import { formatDate } from '../utils/formatters.js';

export default function PublicProfilePage({ userId, navigate }) {
    const [profile, setProfile] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [page, setPage] = useState(0);
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showPhone, setShowPhone] = useState(false);

    useEffect(() => {
        const fetchProfileAndRooms = async () => {
            if (!userId) {
                setError('Mã người dùng không hợp lệ.');
                setLoading(false);
                return;
            }
            setLoading(true);
            setError('');
            try {
                // Fetch profile
                const { data: profileData, error: profileErr } = await getUserProfile(userId);
                if (profileErr || !profileData) {
                    setError('Không tìm thấy thông tin người dùng.');
                    setLoading(false);
                    return;
                }
                setProfile(profileData);

                // Fetch published rooms (page 0, itemsPerPage = 12)
                const { data: roomsData, error: roomsErr, count } = await getActiveUserRooms(userId, 0, 12);
                if (!roomsErr && roomsData) {
                    const mapped = roomsData.map(mapSupabaseRoom);
                    setRooms(mapped);
                    setPage(0);
                    setTotalCount(count || 0);
                    // hasMore is true if we loaded exactly 12 rooms
                    setHasMore(mapped.length === 12);
                }
            } catch (err) {
                console.error('Error loading public profile:', err);
                setError('Có lỗi xảy ra khi tải thông tin.');
            } finally {
                setLoading(false);
            }
        };

        fetchProfileAndRooms();
    }, [userId]);

    const loadMoreRooms = async () => {
        if (loadingRooms || !hasMore) return;
        setLoadingRooms(true);
        try {
            const nextPage = page + 1;
            const { data: roomsData, error: roomsErr } = await getActiveUserRooms(userId, nextPage, 12);
            if (!roomsErr && roomsData) {
                const mapped = roomsData.map(mapSupabaseRoom);
                setRooms(prev => [...prev, ...mapped]);
                setPage(nextPage);
                setHasMore(mapped.length === 12);
            }
        } catch (err) {
            console.error('Error loading more rooms:', err);
        } finally {
            setLoadingRooms(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-stone-50 pt-20 flex flex-col items-center justify-center gap-3">
                <AppIcon name="reload" size={32} className="text-amber-500 animate-spin" />
                <span className="text-stone-500 text-sm font-semibold">Đang tải thông tin người dùng...</span>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen bg-stone-50 pt-20 flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
                    <AppIcon name="alert" size={32} />
                </div>
                <p className="text-stone-700 font-bold text-lg">{error || 'Không tìm thấy người dùng'}</p>
                <button
                    onClick={() => navigate('home')}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold transition-colors cursor-pointer border-none shadow-sm flex items-center gap-2"
                >
                    <AppIcon name="home" size={16} />
                    <span>Trở về Trang chủ</span>
                </button>
            </div>
        );
    }

    const { full_name, avatar_url, phone, role, created_at } = profile;
    const isLandlord = role === 'landlord';

    return (
        <div className="min-h-screen bg-stone-50 pt-20 pb-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                
                {/* Back Button */}
                <button
                    onClick={() => navigate('back')}
                    className="flex items-center gap-2 bg-white border border-stone-200 rounded-full! px-4 py-2 cursor-pointer text-stone-600 text-sm font-bold hover:bg-stone-50 hover:text-stone-900 transition-colors mb-6"
                >
                    <AppIcon name="chevronLeft" size={16} strokeWidth={3} />
                    <span>Quay lại</span>
                </button>

                {/* Profile Card Header */}
                <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden mb-8">
                    {/* Top background accent */}
                    <div className="absolute top-0 inset-x-0 h-2 bg-linear-to-r from-amber-500 to-orange-500" />
                    
                    {/* Avatar */}
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full! border-4 border-stone-100 overflow-hidden bg-stone-100 shrink-0">
                        {avatar_url ? (
                            <img src={avatar_url} alt={full_name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-amber-400 to-orange-500 text-white font-extrabold text-3xl">
                                {full_name?.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>

                    {/* Detailed info */}
                    <div className="flex-1 text-center sm:text-left flex flex-col gap-3">
                        <div className="flex flex-col sm:flex-row items-center gap-2.5">
                            <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 m-0 leading-none" style={{ fontFamily: 'var(--font-heading)' }}>
                                {full_name}
                            </h1>
                            <span className={`px-2.5 py-0.5 rounded-full text-[0.72rem] font-bold tracking-wide uppercase shrink-0 ${isLandlord ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-stone-100 text-stone-700 border border-stone-200'}`}>
                                {isLandlord ? 'Chủ trọ' : 'Người thuê'}
                            </span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-stone-500 text-sm font-medium justify-center sm:justify-start">
                            <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                                <AppIcon name="calendar" size={16} className="text-stone-400" />
                                <span>Thành viên từ: {created_at ? formatDate(created_at) : 'Chưa cập nhật'}</span>
                            </div>
                            <div className="hidden sm:block w-1.5 h-1.5 bg-stone-200 rounded-full" />
                            <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                                <AppIcon name="home" size={16} className="text-stone-400" />
                                <span>Đang đăng: {totalCount} phòng</span>
                            </div>
                        </div>

                        {/* Phone contact */}
                        {phone && (
                            <div className="mt-2 flex flex-col sm:flex-row items-center gap-3">
                                {showPhone ? (
                                    <a
                                        href={`tel:${phone}`}
                                        className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl! px-5 py-2.5 cursor-pointer text-sm font-bold transition-all shadow-xs border-none select-all"
                                    >
                                        <AppIcon name="phone" size={16} />
                                        <span>{phone}</span>
                                    </a>
                                ) : (
                                    <button
                                        onClick={() => setShowPhone(true)}
                                        className="flex items-center gap-2 bg-stone-950 hover:bg-stone-900 text-white rounded-xl! px-5 py-2.5 cursor-pointer text-sm font-bold transition-all border-none"
                                    >
                                        <AppIcon name="phone" size={16} />
                                        <span>Hiện số điện thoại liên hệ</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Rooms List Section */}
                <div>
                    <h2 className="text-lg font-bold text-stone-900 mb-5 flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                        <AppIcon name="home" color="#d97706" />
                        <span>Danh sách phòng đang đăng ({totalCount})</span>
                    </h2>

                    {rooms.length === 0 ? (
                        <div className="bg-white border border-stone-200 border-dashed rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3">
                            <div className="w-12 h-12 bg-stone-50 text-stone-400 rounded-full flex items-center justify-center">
                                <AppIcon name="home" size={24} />
                            </div>
                            <p className="text-stone-750 font-bold m-0">Hiện chưa có tin đăng nào</p>
                            <p className="text-stone-400 text-sm m-0">Tất cả tin đăng hoạt động của chủ trọ sẽ được hiển thị công khai ở đây.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {rooms.map(room => (
                                    <RoomCard
                                        key={room.id}
                                        room={room}
                                        onClick={() => navigate('room-detail', { ...room, fromPublicProfile: true, publicProfileUserId: userId })}
                                    />
                                ))}
                            </div>
                            {hasMore && (
                                <div className="flex justify-center my-4 animate-fade-in">
                                    <button
                                        onClick={loadMoreRooms}
                                        disabled={loadingRooms}
                                        className="inline-flex items-center gap-2 px-8 py-2.5 bg-white border border-stone-200 text-stone-700 rounded-full font-semibold text-sm cursor-pointer hover:border-amber-500 hover:text-amber-600 hover:shadow-xs transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loadingRooms && (
                                            <div className="w-4 h-4 border-2 border-stone-200 border-t-amber-500 rounded-full animate-spin" />
                                        )}
                                        {loadingRooms ? 'Đang tải...' : 'Xem thêm phòng'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
