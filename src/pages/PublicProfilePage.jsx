import { useState, useEffect } from 'react';
import { getUserProfile } from '../services/profileService';
import { getActiveUserRooms } from '../services/roomService';
import { getForumPosts } from '../services/forumService.js';
import { mapSupabaseRoom } from '../utils/roomMapper';
import RoomCard from '../components/rooms/RoomCard.jsx';
import AppIcon from '../components/common/AppIcon.jsx';
import ForumPostCard from '../components/forum/ForumPostCard.jsx';
import CreatePostModal from '../components/forum/CreatePostModal.jsx';
import { formatDate } from '../utils/formatters.js';
import { TbLayoutSidebarLeftCollapse, TbNotes, TbFileText, TbPlus } from 'react-icons/tb';

export default function PublicProfilePage({ userId, user, navigate }) {
    const [profile, setProfile] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [page, setPage] = useState(0);
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showPhone, setShowPhone] = useState(false);

    // Tab: 'rooms' | 'forum'
    const [activeContentTab, setActiveContentTab] = useState('forum');

    // Forum posts
    const [forumPosts, setForumPosts] = useState([]);
    const [forumPage, setForumPage] = useState(0);
    const [hasMoreForum, setHasMoreForum] = useState(false);
    const [loadingForum, setLoadingForum] = useState(false);

    useEffect(() => {
        const fetchProfileAndRooms = async () => {
            if (!userId) { setError('Mã người dùng không hợp lệ.'); setLoading(false); return; }
            setLoading(true);
            setError('');
            try {
                const { data: profileData, error: profileErr } = await getUserProfile(userId);
                if (profileErr || !profileData) { setError('Không tìm thấy thông tin người dùng.'); setLoading(false); return; }
                setProfile(profileData);

                const { data: roomsData, error: roomsErr, count } = await getActiveUserRooms(userId, 0, 12);
                if (!roomsErr && roomsData) {
                    const mapped = roomsData.map(mapSupabaseRoom);
                    setRooms(mapped);
                    setPage(0);
                    setTotalCount(count || 0);
                    setHasMore(mapped.length === 12);
                }
            } catch {
                setError('Có lỗi xảy ra khi tải thông tin.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfileAndRooms();
    }, [userId]);

    // Load forum posts for this user
    useEffect(() => {
        const loadForum = async () => {
            if (!userId) return;
            setLoadingForum(true);
            const { data, count } = await getForumPosts({ page: 0, limit: 10, userId: user?.id, authorId: userId });
            setForumPosts(data || []);
            setForumPage(0);
            setHasMoreForum((data?.length || 0) < (count || 0));
            setLoadingForum(false);
        };
        loadForum();
    }, [userId, user?.id]);

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
        } finally {
            setLoadingRooms(false);
        }
    };

    const loadMoreForum = async () => {
        if (loadingForum) return;
        setLoadingForum(true);
        const next = forumPage + 1;
        const { data } = await getForumPosts({ page: next, limit: 10, userId: user?.id, authorId: userId });
        setForumPosts(prev => [...prev, ...(data || [])]);
        setForumPage(next);
        setHasMoreForum((data?.length || 0) === 10);
        setLoadingForum(false);
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
                <button onClick={() => navigate('home')} className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold transition-colors cursor-pointer border-none shadow-sm flex items-center gap-2">
                    <AppIcon name="home" size={16} />
                    <span>Trở về Trang chủ</span>
                </button>
            </div>
        );
    }

    const { full_name, avatar_url, phone, role, created_at } = profile;
    const isLandlord = role === 'landlord' || role === 'admin';

    return (
        <div className="min-h-screen bg-stone-50 pt-20 pb-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">

                {/* Back Button */}
                <button
                    onClick={() => window.history.length > 1 ? window.history.back() : navigate('home')}
                    className="flex items-center gap-2 bg-white border border-stone-200 rounded-full! px-4 py-2 cursor-pointer text-stone-600 text-sm font-bold hover:bg-stone-50 hover:text-stone-900 transition-colors mb-6"
                >
                    <AppIcon name="chevronLeft" size={16} strokeWidth={3} />
                    <span>Quay lại</span>
                </button>

                {/* Layout wrapper */}
                <div className="w-full">
                    {/* ─── MAIN CONTENT ─── */}
                    <div className="w-full">
                        {/* Profile Card Header */}
                        <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden mb-8">
                            <div className="absolute top-0 inset-x-0 h-2 bg-linear-to-r from-amber-500 to-orange-500" />

                            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full! border-4 border-stone-100 overflow-hidden bg-stone-100 shrink-0">
                                {avatar_url ? (
                                    <img src={avatar_url} alt={full_name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-amber-400 to-orange-500 text-white font-extrabold text-3xl">
                                        {full_name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 text-center sm:text-left flex flex-col gap-3">
                                <div className="flex flex-col sm:flex-row items-center gap-2.5">
                                    <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 m-0 leading-none" style={{ fontFamily: 'var(--font-heading)' }}>
                                        {full_name}
                                    </h1>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[0.72rem] font-bold tracking-wide uppercase shrink-0 ${isLandlord ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-stone-100 text-stone-700 border border-stone-200'}`}>
                                        {role === 'admin' ? 'Quản trị viên' : isLandlord ? 'Chủ trọ' : 'Người thuê'}
                                    </span>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-stone-500 text-sm font-medium justify-center sm:justify-start">
                                    <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                                        <AppIcon name="calendar" size={16} className="text-stone-400" />
                                        <span>Thành viên từ: {created_at ? formatDate(created_at) : 'Chưa cập nhật'}</span>
                                    </div>
                                    {isLandlord && (
                                        <>
                                            <div className="hidden sm:block w-1.5 h-1.5 bg-stone-200 rounded-full" />
                                            <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                                                <AppIcon name="home" size={16} className="text-stone-400" />
                                                <span>Đang đăng: {totalCount} phòng</span>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {phone && (
                                    <div className="mt-2 flex flex-wrap items-center gap-3 justify-center sm:justify-start">
                                        {showPhone ? (
                                            <a href={`tel:${phone}`} className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white rounded-full! px-6 py-2.5 cursor-pointer text-sm font-bold transition-all shadow-xs border-none select-all">
                                                <AppIcon name="phone" size={16} />
                                                <span>{phone}</span>
                                            </a>
                                        ) : (
                                            <button onClick={() => setShowPhone(true)} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white rounded-full! px-6 py-2.5 cursor-pointer text-sm font-bold transition-all border-none shadow-xs">
                                                <AppIcon name="phone" size={16} />
                                                <span>Hiện số điện thoại liên hệ</span>
                                            </button>
                                        )}
                                        <a target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#0068ff] hover:bg-[#005ad9] text-white rounded-full! px-6 py-2.5 cursor-pointer text-sm font-bold transition-all border-none shadow-xs">
                                            <AppIcon name="message-circle" size={16} />
                                            <span>Liên hệ Zalo</span>
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Content Tabs / Section Header */}
                        {!isLandlord ? (
                            <div className="border-b border-stone-200 mb-6 pb-3">
                                <h2 className="text-lg font-extrabold text-stone-900 m-0 tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                                    Bài đăng diễn đàn
                                </h2>
                            </div>
                        ) : (
                            <div className="flex border-b border-stone-200 mb-6 gap-1">
                                <button
                                    onClick={() => setActiveContentTab('forum')}
                                    className={`px-5 py-3 border-b-2 font-bold text-sm cursor-pointer whitespace-nowrap transition-all outline-none ${activeContentTab === 'forum' ? 'border-amber-500 text-amber-600' : 'border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300 bg-transparent'}`}
                                >
                                    Bài đăng diễn đàn
                                </button>
                                <button
                                    onClick={() => setActiveContentTab('rooms')}
                                    className={`px-5 py-3 border-b-2 font-bold text-sm cursor-pointer whitespace-nowrap transition-all outline-none ${activeContentTab === 'rooms' ? 'border-amber-500 text-amber-600' : 'border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300 bg-transparent'}`}
                                >
                                    Tin phòng trọ ({totalCount})
                                </button>
                            </div>
                        )}

                        {/* Forum Tab */}
                        {activeContentTab === 'forum' && (
                            <div className="flex flex-col gap-4">
                                {loadingForum && forumPosts.length === 0 ? (
                                    <div className="flex items-center justify-center py-12 text-stone-400 gap-2">
                                        <div className="w-5 h-5 border-2 border-stone-200 border-t-amber-500 rounded-full animate-spin" />
                                        Đang tải...
                                    </div>
                                ) : forumPosts.length === 0 ? (
                                    <div className="text-center py-16 bg-white border border-dashed border-stone-200 rounded-2xl">
                                        <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-3 text-stone-300">
                                            <AppIcon name="messages" size={24} />
                                        </div>
                                        <p className="text-stone-500 text-sm">Chưa có bài đăng diễn đàn nào.</p>
                                    </div>
                                ) : (
                                    <>
                                        {forumPosts.map(post => (
                                            <ForumPostCard
                                                key={post.id}
                                                post={post}
                                                user={user}
                                                navigate={navigate}
                                                onEdit={post => navigate('forum', { openCreateModal: true, editPost: post })}
                                                onDelete={id => setForumPosts(prev => prev.filter(p => p.id !== id))}
                                                 onViewRoom={room => navigate('room-detail', mapSupabaseRoom(room))}
                                            />
                                        ))}
                                        {hasMoreForum && (
                                            <div className="flex justify-center mt-2">
                                                <button onClick={loadMoreForum} disabled={loadingForum} className="px-8 py-2.5 bg-white border border-stone-200 text-stone-700 rounded-full font-bold text-sm cursor-pointer hover:border-amber-500 hover:text-amber-600 transition-all disabled:opacity-50">
                                                    {loadingForum ? 'Đang tải...' : 'Xem thêm'}
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {/* Rooms Tab (landlord only) */}
                        {activeContentTab === 'rooms' && isLandlord && (
                            <div>
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
                                                    onClick={() => navigate('room-detail', room)}
                                                />
                                            ))}
                                        </div>
                                        {hasMore && (
                                            <div className="flex justify-center my-4 animate-fade-in">
                                                <button onClick={loadMoreRooms} disabled={loadingRooms} className="inline-flex items-center gap-2 px-8 py-2.5 bg-white border border-stone-200 text-stone-700 rounded-full font-semibold text-sm cursor-pointer hover:border-amber-500 hover:text-amber-600 hover:shadow-xs transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                                                    {loadingRooms && <div className="w-4 h-4 border-2 border-stone-200 border-t-amber-500 rounded-full animate-spin" />}
                                                    {loadingRooms ? 'Đang tải...' : 'Xem thêm phòng'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}
