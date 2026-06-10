import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
    TbBuildingWarehouse,
    TbFileText,
    TbPlus,
    TbTrash,
    TbEdit,
    TbNotes,
    TbHome,
    TbSmartHome,
    TbCheck,
    TbEye,
    TbReload,
    TbLock,
    TbEyeOff,
} from "react-icons/tb";
import { getForumPosts, updateForumPost, deleteForumPost, getUserCommentsOnOthersPosts } from "../services/forumService.js";
import { getRentedRooms } from "../services/rentedRoomService.js";
import { useModal } from "../context/ModalContext.jsx";
import { useNotification } from "../context/NotificationContext.jsx";
import ForumPostCard from "../components/forum/ForumPostCard.jsx";
import CreatePostModal from "../components/forum/CreatePostModal.jsx";
import AppIcon from "../components/common/AppIcon.jsx";
import { formatPrice } from "../utils/formatters.js";
import { mapSupabaseRoom } from "../utils/roomMapper.js";

const PAGE_SIZE = 10;

/**
 * Trang diễn đàn chính — feed bài đăng kiểu mạng xã hội.
 * Tích hợp 2 cột trên Desktop để quản lý bài viết diễn đàn cá nhân (Published & Drafts).
 */
export default function ForumPage({ user, navigate, preAttachRoom = null, openCreateModal = false, editPost = null, initialActiveTab = null }) {
    const { showModal } = useModal();
    const { addNotification } = useNotification();

    // Active navigation tab: 'feed' | 'search' | 'my-posts' | 'my-comments'
    const [activeTab, setActiveTab] = useState(initialActiveTab || "feed");

    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [preAttach, setPreAttach] = useState(preAttachRoom);

    // Search tab states
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [searchPage, setSearchPage] = useState(0);
    const [searchHasMore, setSearchHasMore] = useState(false);

    // My Posts tab states
    const [myPosts, setMyPosts] = useState([]);
    const [loadingMyPosts, setLoadingMyPosts] = useState(false);

    // My Comments tab states
    const [myComments, setMyComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);

    // Detail overlay state for viewing comment target posts
    const [selectedPost, setSelectedPost] = useState(null);

    // Fetch public posts feed
    const fetchPosts = useCallback(
        async (pageNum = 0, append = false) => {
            pageNum === 0 ? setLoading(true) : setLoadingMore(true);
            try {
                const { data, count, error } = await getForumPosts({ 
                    page: pageNum, 
                    limit: PAGE_SIZE, 
                    userId: user?.id,
                    category: categoryFilter !== "all" ? categoryFilter : null
                });
                if (error) throw error;
                if (append) {
                    setPosts((prev) => [...prev, ...(data || [])]);
                } else {
                    setPosts(data || []);
                }
                setHasMore((pageNum + 1) * PAGE_SIZE < (count || 0));
            } catch (err) {
                console.error("Error fetching forum posts:", err);
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        },
        [user?.id, categoryFilter],
    );

    // Fetch user's own posts (up to 50 recent posts)
    const fetchMyPosts = useCallback(async () => {
        if (!user?.id) return;
        setLoadingMyPosts(true);
        try {
            const { data } = await getForumPosts({ page: 0, limit: 50, userId: user.id, authorId: user.id });
            setMyPosts(data || []);
        } catch (err) {
            console.error("Error fetching user posts:", err);
        } finally {
            setLoadingMyPosts(false);
        }
    }, [user?.id]);

    // Fetch comments made by user on other authors' posts
    const fetchMyComments = useCallback(async () => {
        if (!user?.id) return;
        setLoadingComments(true);
        try {
            const { data, error } = await getUserCommentsOnOthersPosts(user.id);
            if (error) throw error;
            setMyComments(data || []);
        } catch (err) {
            console.error("Error fetching comments:", err);
        } finally {
            setLoadingComments(false);
        }
    }, [user?.id]);

    // Fetch search results
    const fetchSearchResults = useCallback(
        async (queryText, pageNum = 0, append = false) => {
            if (!queryText.trim()) {
                setSearchResults([]);
                setSearchHasMore(false);
                return;
            }
            pageNum === 0 ? setLoadingSearch(true) : setLoadingMore(true);
            try {
                const { data, count, error } = await getForumPosts({
                    page: pageNum,
                    limit: PAGE_SIZE,
                    userId: user?.id,
                    search: queryText.trim(),
                });
                if (error) throw error;
                if (append) {
                    setSearchResults((prev) => [...prev, ...(data || [])]);
                } else {
                    setSearchResults(data || []);
                }
                setSearchHasMore((pageNum + 1) * PAGE_SIZE < (count || 0));
            } catch (err) {
                console.error("Error fetching search results:", err);
            } finally {
                setLoadingSearch(false);
                setLoadingMore(false);
            }
        },
        [user?.id],
    );

    useEffect(() => {
        setPage(0);
        fetchPosts(0, false);
    }, [fetchPosts, categoryFilter]);

    // Open create modal if preAttach was passed or openCreateModal is true
    useEffect(() => {
        if (preAttachRoom) {
            setPreAttach(preAttachRoom);
            setShowCreateModal(true);
        }
    }, [preAttachRoom]);

    useEffect(() => {
        if (openCreateModal) {
            setEditingPost(editPost || null);
            setShowCreateModal(true);
        }
    }, [openCreateModal, editPost]);

    useEffect(() => {
        if (initialActiveTab) {
            setActiveTab(initialActiveTab);
            if (initialActiveTab === "my-posts") {
                fetchMyPosts();
            } else if (initialActiveTab === "my-comments") {
                fetchMyComments();
            }
        }
    }, [initialActiveTab, fetchMyPosts, fetchMyComments]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchPosts(nextPage, true);
    };

    const handlePostCreated = () => {
        fetchPosts(0, false);
        setPage(0);
        if (user?.id) {
            fetchMyPosts();
        }
        setPreAttach(null);
    };

    const handlePostEdited = (updatedPost) => {
        setPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? { ...p, ...updatedPost } : p)));
        setMyPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? { ...p, ...updatedPost } : p)));
        setSearchResults((prev) => prev.map((p) => (p.id === updatedPost.id ? { ...p, ...updatedPost } : p)));
        setEditingPost(null);
    };

    const handlePostDeleted = (postId) => {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        setMyPosts((prev) => prev.filter((p) => p.id !== postId));
        setSearchResults((prev) => prev.filter((p) => p.id !== postId));
    };

    const handleEditPost = (post) => {
        setEditingPost(post);
        setShowCreateModal(true);
    };

    const handleViewRoom = (room) => {
        const mappedRoom = mapSupabaseRoom(room);
        navigate("room-detail", mappedRoom);
    };

    const handleTabClick = (tab) => {
        if (!user && (tab === "my-posts" || tab === "my-comments")) {
            showModal({
                title: "Yêu cầu đăng nhập",
                message: "Vui lòng đăng nhập để sử dụng tính năng này.",
                type: "warning",
                confirmText: "Đăng nhập",
                onConfirm: () => navigate("login"),
            });
            return;
        }
        setActiveTab(tab);
        if (tab === "my-posts") {
            fetchMyPosts();
        } else if (tab === "my-comments") {
            fetchMyComments();
        }
    };

    const handleCreatePostClick = () => {
        if (!user) {
            showModal({
                title: "Yêu cầu đăng nhập",
                message: "Vui lòng đăng nhập để đăng bài viết mới.",
                type: "warning",
                confirmText: "Đăng nhập",
                onConfirm: () => navigate("login"),
            });
            return;
        }
        setEditingPost(null);
        setPreAttach(null);
        setShowCreateModal(true);
    };

    return (
        <div className="min-h-screen bg-stone-50 pb-24 md:pb-10">
            {/* Ambient Black Hero Banner */}
            <div className="bg-stone-900 relative overflow-hidden text-center">
                {/* Navbar Placeholder */}
                <div className="h-14 md:h-16 shrink-0 w-full" />
                {/* Glow spots */}
                <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-amber-500/10 via-orange-600/5 to-transparent rounded-full pointer-events-none blur-[100px] z-0" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-tl from-amber-500/10 via-transparent to-transparent pointer-events-none blur-[100px] z-0" />
                <div className="absolute top-[20%] left-[30%] w-[400px] h-[400px] bg-gradient-to-tr from-amber-600/8 via-transparent to-transparent rounded-full pointer-events-none blur-[120px] z-0" />

                {/* Banner Content */}
                <div className="relative z-10 max-w-4xl mx-auto px-4 py-12 md:py-16 flex flex-col items-center justify-center">
                    <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <h1
                            className="text-4xl md:text-5xl font-extrabold text-white! tracking-tight leading-none mb-4"
                            style={{ fontFamily: "var(--font-heading)" }}
                        >
                            Diễn đàn
                        </h1>
                        <p className="text-stone-300 text-sm md:text-base font-medium max-w-md mx-auto leading-relaxed">
                            Chia sẻ, tìm bạn ở ghép và kết nối cộng đồng thuê trọ.
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Mobile Tab Swiper/Navbar */}
                <div className="lg:hidden flex gap-2 pb-2.5 mb-6 overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => handleTabClick("feed")}
                        className={`px-4.5 py-2.5 rounded-full font-bold text-xs shrink-0 cursor-pointer border transition-all ${
                            activeTab === "feed"
                                ? "bg-amber-50 text-amber-600 border-amber-200 shadow-sm shadow-amber-500/5"
                                : "bg-white text-stone-500 border-stone-200 hover:bg-stone-55"
                        }`}
                    >
                        Bảng tin
                    </button>
                    <button
                        onClick={() => handleTabClick("search")}
                        className={`px-4.5 py-2.5 rounded-full font-bold text-xs shrink-0 cursor-pointer border transition-all ${
                            activeTab === "search"
                                ? "bg-amber-50 text-amber-600 border-amber-200 shadow-sm shadow-amber-500/5"
                                : "bg-white text-stone-500 border-stone-200 hover:bg-stone-55"
                        }`}
                    >
                        Tìm kiếm
                    </button>
                    <button
                        onClick={() => handleTabClick("my-posts")}
                        className={`px-4.5 py-2.5 rounded-full font-bold text-xs shrink-0 cursor-pointer border transition-all flex items-center gap-1 ${
                            activeTab === "my-posts"
                                ? "bg-amber-50 text-amber-600 border-amber-200 shadow-sm shadow-amber-500/5"
                                : "bg-white text-stone-500 border-stone-200 hover:bg-stone-55"
                        }`}
                    >
                        Bài đăng của bạn {!user && <TbLock size={12} className="opacity-70" />}
                    </button>
                    <button
                        onClick={() => handleTabClick("my-comments")}
                        className={`px-4.5 py-2.5 rounded-full font-bold text-xs shrink-0 cursor-pointer border transition-all flex items-center gap-1 ${
                            activeTab === "my-comments"
                                ? "bg-amber-50 text-amber-600 border-amber-200 shadow-sm shadow-amber-500/5"
                                : "bg-white text-stone-500 border-stone-200 hover:bg-stone-55"
                        }`}
                    >
                        Bình luận của bạn {!user && <TbLock size={12} className="opacity-70" />}
                    </button>
                </div>

                {/* Bố cục Grid 2 cột trên Desktop */}
                <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
                    {/* CỘT 1: Navigation Panel */}
                    <div className="hidden lg:flex flex-col gap-5 lg:sticky lg:top-24">
                        {/* Accent Create Post Button */}
                        <button
                            onClick={handleCreatePostClick}
                            className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-sm rounded-xl cursor-pointer border-none shadow-md shadow-amber-500/20 hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                        >
                            <AppIcon name="plus" size={16} />
                            Đăng bài mới
                        </button>

                        {/* Navigation List */}
                        <div className="bg-white border border-stone-200/80 rounded-2xl p-2 shadow-sm flex flex-col gap-1.5">
                            {/* Bảng tin */}
                            <button
                                onClick={() => handleTabClick("feed")}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm border-none cursor-pointer text-left transition-all duration-200 ${
                                    activeTab === "feed"
                                        ? "bg-amber-50 text-amber-600 border-l-4 border-amber-500 pl-3 shadow-xs"
                                        : "bg-transparent text-stone-500 hover:bg-stone-50 hover:text-stone-800"
                                }`}
                            >
                                <AppIcon name="messages" size={18} className={activeTab === "feed" ? "text-amber-500" : "text-stone-400"} />
                                Bảng tin
                            </button>

                            {/* Tìm kiếm */}
                            <button
                                onClick={() => handleTabClick("search")}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm border-none cursor-pointer text-left transition-all duration-200 ${
                                    activeTab === "search"
                                        ? "bg-amber-50 text-amber-600 border-l-4 border-amber-500 pl-3 shadow-xs"
                                        : "bg-transparent text-stone-500 hover:bg-stone-50 hover:text-stone-800"
                                }`}
                            >
                                <AppIcon name="search" size={18} className={activeTab === "search" ? "text-amber-500" : "text-stone-400"} />
                                Tìm kiếm
                            </button>

                            <div className="h-px bg-stone-100 my-1 mx-2" />

                            {/* Bài đăng của bạn */}
                            <button
                                onClick={() => handleTabClick("my-posts")}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm border-none cursor-pointer text-left transition-all duration-200 ${
                                    activeTab === "my-posts"
                                        ? "bg-amber-50 text-amber-600 border-l-4 border-amber-500 pl-3 shadow-xs"
                                        : "bg-transparent text-stone-500 hover:bg-stone-50 hover:text-stone-800"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <AppIcon name="file-text" size={18} className={activeTab === "my-posts" ? "text-amber-500" : "text-stone-400"} />
                                    Bài đăng của bạn
                                </div>
                                {!user && <TbLock size={14} className="text-stone-400/80" />}
                            </button>

                            {/* Bình luận của bạn */}
                            <button
                                onClick={() => handleTabClick("my-comments")}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm border-none cursor-pointer text-left transition-all duration-200 ${
                                    activeTab === "my-comments"
                                        ? "bg-amber-50 text-amber-600 border-l-4 border-amber-500 pl-3 shadow-xs"
                                        : "bg-transparent text-stone-500 hover:bg-stone-50 hover:text-stone-800"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <AppIcon name="messages" size={18} className={activeTab === "my-comments" ? "text-amber-500" : "text-stone-400"} />
                                    Bình luận của bạn
                                </div>
                                {!user && <TbLock size={14} className="text-stone-400/80" />}
                            </button>
                        </div>
                    </div>

                    {/* CỘT 2: Nội dung chính */}
                    <div className="flex-1 min-w-0 flex flex-col gap-5">
                        {/* Tab Content Rendering */}
                        {activeTab === "feed" && (
                            <>
                                {/* Bộ lọc Thẻ phân loại */}
                                <div className="bg-white rounded-2xl border border-stone-200/80 p-3 shadow-sm flex items-center gap-2 overflow-x-auto no-scrollbar">
                                    <button 
                                        onClick={() => setCategoryFilter("all")}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors border cursor-pointer ${categoryFilter === "all" ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"}`}
                                    >
                                        Tất cả
                                    </button>
                                    <button 
                                        onClick={() => setCategoryFilter("general")}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors border cursor-pointer ${categoryFilter === "general" ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"}`}
                                    >
                                        Thảo luận chung
                                    </button>
                                    <button 
                                        onClick={() => setCategoryFilter("roommate")}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors border cursor-pointer ${categoryFilter === "roommate" ? "bg-sky-50 border-sky-200 text-sky-700" : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"}`}
                                    >
                                        Tìm người ở cùng
                                    </button>
                                    <button 
                                        onClick={() => setCategoryFilter("transfer")}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors border cursor-pointer ${categoryFilter === "transfer" ? "bg-purple-50 border-purple-200 text-purple-700" : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"}`}
                                    >
                                        Sang nhượng
                                    </button>
                                </div>

                                {/* Feed Header */}
                                <div className="mb-6 flex items-center justify-between">
                                    <h2
                                        className="text-lg font-extrabold text-stone-900 tracking-tight flex items-center gap-2"
                                        style={{ fontFamily: "var(--font-heading)" }}
                                    >
                                        <span className="w-2 h-5 bg-amber-500 rounded-sm" />
                                        Bản tin diễn đàn
                                    </h2>
                                </div>

                                {/* Create post quick bar */}
                                {user && (
                                    <div
                                        onClick={handleCreatePostClick}
                                        className="bg-white border border-stone-200 rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:border-amber-300 hover:shadow-sm transition-all mb-6"
                                    >
                                        <div
                                            className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden"
                                            style={
                                                user.user_metadata?.avatar_url
                                                    ? { backgroundImage: `url(${user.user_metadata.avatar_url})`, backgroundSize: "cover" }
                                                    : {}
                                            }
                                        >
                                            {!user.user_metadata?.avatar_url && (user.user_metadata?.full_name || "U").charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 bg-stone-100 rounded-full px-4 py-2.5 text-stone-400 text-sm hover:bg-stone-50 transition-colors select-none">
                                            {user.user_metadata?.full_name} ơi, bạn đang nghĩ gì vậy?
                                        </div>
                                    </div>
                                )}

                                {/* Feed */}
                                {loading ? (
                                    <div className="flex flex-col gap-4">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="bg-white border border-stone-200 rounded-2xl p-5 animate-pulse">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-10 h-10 rounded-full bg-stone-200" />
                                                    <div className="space-y-1.5">
                                                        <div className="w-28 h-3 bg-stone-200 rounded" />
                                                        <div className="w-16 h-2 bg-stone-100 rounded" />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="w-full h-3 bg-stone-100 rounded" />
                                                    <div className="w-3/4 h-3 bg-stone-100 rounded" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : posts.length === 0 ? (
                                    <div className="text-center py-20 bg-white border border-dashed border-stone-200 rounded-2xl">
                                        <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-300">
                                            <AppIcon name="messages" size={32} />
                                        </div>
                                        <p className="text-stone-700 font-bold text-base mb-1">Diễn đàn đang chờ bạn!</p>
                                        <p className="text-stone-400 text-sm mb-5">Hãy là người đầu tiên chia sẻ câu chuyện của bạn.</p>
                                        {user && (
                                            <button
                                                onClick={handleCreatePostClick}
                                                className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm px-6 py-2.5 rounded-xl border-none cursor-pointer transition-colors shadow-sm"
                                            >
                                                Đăng bài đầu tiên
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        {posts.map((post) => (
                                            <ForumPostCard
                                                key={post.id}
                                                post={post}
                                                user={user}
                                                navigate={navigate}
                                                onEdit={handleEditPost}
                                                onDelete={handlePostDeleted}
                                                onViewRoom={handleViewRoom}
                                            />
                                        ))}

                                        {hasMore && (
                                            <div className="flex justify-center mt-2">
                                                <button
                                                    onClick={handleLoadMore}
                                                    disabled={loadingMore}
                                                    className="inline-flex items-center gap-2 px-8 py-2.5 bg-white border border-stone-200 text-stone-700 rounded-full font-bold text-sm cursor-pointer hover:border-amber-500 hover:text-amber-600 hover:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {loadingMore ? (
                                                        <>
                                                            <div className="w-4 h-4 border-2 border-stone-200 border-t-amber-500 rounded-full animate-spin" />
                                                            Đang tải...
                                                        </>
                                                    ) : (
                                                        "Xem thêm bài đăng"
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}

                        {activeTab === "search" && (
                            <div className="flex flex-col gap-6">
                                {/* Search Header */}
                                <div className="flex items-center justify-between">
                                    <h2
                                        className="text-lg font-extrabold text-stone-900 tracking-tight flex items-center gap-2"
                                        style={{ fontFamily: "var(--font-heading)" }}
                                    >
                                        <span className="w-2 h-5 bg-amber-500 rounded-sm" />
                                        Tìm kiếm bài đăng
                                    </h2>
                                </div>

                                <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    setSearchPage(0);
                                                    fetchSearchResults(searchQuery, 0, false);
                                                }
                                            }}
                                            placeholder="Nhập nội dung cần tìm kiếm..."
                                            className="w-full pl-10 pr-24 py-3 bg-stone-50 border border-stone-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl outline-none text-stone-900 text-sm transition-all"
                                        />
                                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
                                            <AppIcon name="search" size={16} />
                                        </div>
                                        <button
                                            onClick={() => {
                                                setSearchPage(0);
                                                fetchSearchResults(searchQuery, 0, false);
                                            }}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg border-none cursor-pointer transition-colors shadow-sm"
                                        >
                                            Tìm kiếm
                                        </button>
                                    </div>
                                </div>

                                {loadingSearch ? (
                                    <div className="flex flex-col gap-4">
                                        {[1, 2].map((i) => (
                                            <div key={i} className="bg-white border border-stone-200 rounded-2xl p-5 animate-pulse">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-10 h-10 rounded-full bg-stone-200" />
                                                    <div className="space-y-1.5">
                                                        <div className="w-28 h-3 bg-stone-200 rounded" />
                                                        <div className="w-16 h-2 bg-stone-100 rounded" />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="w-full h-3 bg-stone-100 rounded" />
                                                    <div className="w-3/4 h-3 bg-stone-100 rounded" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : searchQuery.trim() && searchResults.length === 0 ? (
                                    <div className="text-center py-20 bg-white border border-dashed border-stone-200 rounded-2xl">
                                        <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-300">
                                            <AppIcon name="search" size={32} />
                                        </div>
                                        <p className="text-stone-700 font-bold text-base mb-1">Không tìm thấy kết quả</p>
                                        <p className="text-stone-400 text-sm">Thử tìm kiếm với từ khóa khác xem sao nhé.</p>
                                    </div>
                                ) : !searchQuery.trim() ? (
                                    <div className="text-center py-20 bg-white border border-dashed border-stone-200 rounded-2xl">
                                        <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-300">
                                            <AppIcon name="search" size={32} />
                                        </div>
                                        <p className="text-stone-700 font-bold text-base mb-1">Tìm kiếm trên diễn đàn</p>
                                        <p className="text-stone-400 text-sm">Nhập từ khóa phía trên để bắt đầu tìm các bài đăng liên quan.</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        {searchResults.map((post) => (
                                            <ForumPostCard
                                                key={post.id}
                                                post={post}
                                                user={user}
                                                navigate={navigate}
                                                onEdit={handleEditPost}
                                                onDelete={handlePostDeleted}
                                                onViewRoom={handleViewRoom}
                                            />
                                        ))}

                                        {searchHasMore && (
                                            <div className="flex justify-center mt-2">
                                                <button
                                                    onClick={() => {
                                                        const nextPage = searchPage + 1;
                                                        setSearchPage(nextPage);
                                                        fetchSearchResults(searchQuery, nextPage, true);
                                                    }}
                                                    disabled={loadingMore}
                                                    className="inline-flex items-center gap-2 px-8 py-2.5 bg-white border border-stone-200 text-stone-700 rounded-full font-bold text-sm cursor-pointer hover:border-amber-500 hover:text-amber-600 hover:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {loadingMore ? (
                                                        <>
                                                            <div className="w-4 h-4 border-2 border-stone-200 border-t-amber-500 rounded-full animate-spin" />
                                                            Đang tải...
                                                        </>
                                                    ) : (
                                                        "Xem thêm kết quả"
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "my-posts" && (
                            <div className="flex flex-col gap-6">
                                {/* My Posts Header */}
                                <div className="flex items-center justify-between">
                                    <h2
                                        className="text-lg font-extrabold text-stone-900 tracking-tight flex items-center gap-2"
                                        style={{ fontFamily: "var(--font-heading)" }}
                                    >
                                        <span className="w-2 h-5 bg-amber-500 rounded-sm" />
                                        Bài đăng của bạn
                                    </h2>
                                </div>

                                {loadingMyPosts ? (
                                    <div className="flex flex-col gap-4">
                                        {[1, 2].map((i) => (
                                            <div key={i} className="bg-white border border-stone-200 rounded-2xl p-5 animate-pulse">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-10 h-10 rounded-full bg-stone-200" />
                                                    <div className="space-y-1.5">
                                                        <div className="w-28 h-3 bg-stone-200 rounded" />
                                                        <div className="w-16 h-2 bg-stone-100 rounded" />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="w-full h-3 bg-stone-100 rounded" />
                                                    <div className="w-3/4 h-3 bg-stone-100 rounded" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : myPosts.length === 0 ? (
                                    <div className="text-center py-20 bg-white border border-dashed border-stone-200 rounded-2xl">
                                        <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-300">
                                            <AppIcon name="file-text" size={32} />
                                        </div>
                                        <p className="text-stone-700 font-bold text-base mb-1">Chưa có bài viết nào</p>
                                        <p className="text-stone-400 text-sm mb-5">Bạn chưa chia sẻ bài đăng nào trên diễn đàn.</p>
                                        <button
                                            onClick={handleCreatePostClick}
                                            className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm px-6 py-2.5 rounded-xl border-none cursor-pointer transition-colors shadow-sm"
                                        >
                                            Đăng bài viết mới
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        {myPosts.map((post) => (
                                            <ForumPostCard
                                                key={post.id}
                                                post={post}
                                                user={user}
                                                navigate={navigate}
                                                onEdit={handleEditPost}
                                                onDelete={handlePostDeleted}
                                                onViewRoom={handleViewRoom}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "my-comments" && (
                            <div className="flex flex-col gap-6">
                                {/* My Comments Header */}
                                <div className="flex items-center justify-between">
                                    <h2
                                        className="text-lg font-extrabold text-stone-900 tracking-tight flex items-center gap-2"
                                        style={{ fontFamily: "var(--font-heading)" }}
                                    >
                                        <span className="w-2 h-5 bg-amber-500 rounded-sm" />
                                        Bình luận của bạn
                                    </h2>
                                </div>

                                {loadingComments ? (
                                    <div className="flex flex-col gap-4">
                                        {[1, 2].map((i) => (
                                            <div key={i} className="bg-white border border-stone-200 rounded-2xl p-5 animate-pulse">
                                                <div className="space-y-1.5">
                                                    <div className="w-28 h-3 bg-stone-200 rounded" />
                                                    <div className="w-16 h-2 bg-stone-100 rounded" />
                                                </div>
                                                <div className="space-y-2 mt-4">
                                                    <div className="w-full h-3 bg-stone-100 rounded" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : myComments.length === 0 ? (
                                    <div className="text-center py-20 bg-white border border-dashed border-stone-200 rounded-2xl">
                                        <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-300">
                                            <AppIcon name="messages" size={32} />
                                        </div>
                                        <p className="text-stone-700 font-bold text-base mb-1">Chưa có bình luận nào</p>
                                        <p className="text-stone-400 text-sm">Bạn chưa viết bình luận nào trên các bài đăng của người khác.</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        {myComments.map((comment) => (
                                            <div
                                                key={comment.id}
                                                className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm flex flex-col gap-3 hover:shadow-md transition-shadow animate-fade-in"
                                            >
                                                {/* Author details */}
                                                <div className="flex items-center gap-2.5">
                                                    <div
                                                        className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden"
                                                        style={
                                                            comment.post?.profile?.avatar_url
                                                                ? { backgroundImage: `url(${comment.post.profile.avatar_url})`, backgroundSize: "cover" }
                                                                : {}
                                                        }
                                                    >
                                                        {!comment.post?.profile?.avatar_url &&
                                                            (comment.post?.profile?.full_name || "Người dùng").charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <span className="text-xs text-stone-500 font-medium">Bạn đã bình luận trên bài viết của</span>{" "}
                                                        <span className="text-xs font-bold text-stone-900">
                                                            {comment.post?.profile?.full_name || "Người dùng"}
                                                        </span>
                                                        <span className="text-[10px] text-stone-400 block mt-0.5">
                                                            {new Date(comment.created_at).toLocaleDateString("vi-VN", {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Post Content Snippet (Quoted) */}
                                                <div className="bg-stone-50 border-l-4 border-amber-500/50 rounded-r-xl p-3 text-xs text-stone-650 italic line-clamp-2 leading-relaxed">
                                                    "{comment.post?.content || "Bài viết đính kèm hình ảnh/phòng trọ"}"
                                                </div>

                                                {/* Comment Content */}
                                                <div className="flex gap-2.5 items-start bg-amber-50/30 rounded-xl p-3 border border-amber-100/20">
                                                    <div
                                                        className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0 overflow-hidden"
                                                        style={
                                                            user?.user_metadata?.avatar_url
                                                                ? { backgroundImage: `url(${user.user_metadata.avatar_url})`, backgroundSize: "cover" }
                                                                : {}
                                                        }
                                                    >
                                                        {!user?.user_metadata?.avatar_url && (user?.user_metadata?.full_name || "U").charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="text-xs font-bold text-stone-850 mb-0.5">
                                                            {user?.user_metadata?.full_name || "Bạn"}
                                                        </div>
                                                        <p className="text-stone-800 text-[0.85rem] leading-relaxed m-0 whitespace-pre-wrap">
                                                            {comment.content}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex justify-end pt-1">
                                                    <button
                                                        onClick={() => setSelectedPost(comment.post)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs rounded-xl cursor-pointer border-none transition-colors"
                                                    >
                                                        <AppIcon name="messages" size={12} />
                                                        Xem bài đăng & bình luận
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Floating Action Button for Mobile */}
            {user && (
                <button
                    onClick={handleCreatePostClick}
                    className="lg:hidden fixed bottom-20 right-6 w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30 border-none cursor-pointer z-50 transition-all hover:scale-105 active:scale-95 animate-fade-in"
                >
                    <AppIcon name="plus" size={24} />
                </button>
            )}

            {/* Post Detail Modal (Viewing comment target post) */}
            {selectedPost && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        onClick={() => setSelectedPost(null)}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10 p-5 flex flex-col gap-4 animate-scale-up">
                        <div className="flex justify-between items-center pb-2 border-b border-stone-100">
                            <h3 className="font-extrabold text-stone-900 text-sm">Xem chi tiết bài đăng</h3>
                            <button
                                onClick={() => setSelectedPost(null)}
                                className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 cursor-pointer border-none transition-colors"
                            >
                                <AppIcon name="close" size={16} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <ForumPostCard
                                post={selectedPost}
                                user={user}
                                navigate={navigate}
                                onEdit={(post) => {
                                    setSelectedPost(null);
                                    handleEditPost(post);
                                }}
                                onDelete={(postId) => {
                                    setSelectedPost(null);
                                    handlePostDeleted(postId);
                                }}
                                onViewRoom={handleViewRoom}
                                defaultShowComments={true}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Create/Edit Post Modal */}
            <CreatePostModal
                isOpen={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false);
                    setEditingPost(null);
                    setPreAttach(null);
                }}
                user={user}
                editPost={editingPost}
                preAttachRoom={preAttach}
                onSuccess={editingPost ? handlePostEdited : handlePostCreated}
            />
        </div>
    );
}
