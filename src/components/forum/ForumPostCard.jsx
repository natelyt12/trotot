import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { togglePostLike, deleteForumPost, updateForumPost, createRoomRequest } from "../../services/forumService.js";
import { deleteFromCloudinary } from "../../utils/imageUtils.js";
import { formatDate, formatRelativeTime } from "../../utils/formatters.js";
import AppIcon from "../common/AppIcon.jsx";
import RoomAttachCard from "./RoomAttachCard.jsx";
import ForumCommentSection from "./ForumCommentSection.jsx";
import ImagePreviewModal from "../common/ImagePreviewModal.jsx";
import { useModal } from "../../context/ModalContext.jsx";
import { useNotification } from "../../context/NotificationContext.jsx";

/**
 * Một bài đăng diễn đàn (kiểu Facebook post).
 *
 * @param {object} post
 * @param {object|null} user
 * @param {function} navigate
 * @param {function} onEdit - callback khi chủ bấm "Chỉnh sửa"
 * @param {function} onDelete - callback khi xóa thành công
 * @param {function} onViewRoom - callback khi bấm "Xem chi tiết phòng"
 */
export default function ForumPostCard({ post, user, navigate, onEdit, onDelete, onViewRoom, flat = false, defaultShowComments = false }) {
    const { showModal } = useModal();
    const { addNotification } = useNotification();

    const [showMenu, setShowMenu] = useState(false);
    const [liked, setLiked] = useState(post.userLiked || false);
    const [likeCount, setLikeCount] = useState(post.likeCount || 0);
    const [showComments, setShowComments] = useState(defaultShowComments || false);
    const [commentCount, setCommentCount] = useState(post.commentCount || 0);
    const [deleted, setDeleted] = useState(false);
    const [previewImageIndex, setPreviewImageIndex] = useState(null);

    if (deleted) return null;

    const profile = post.profile || post.profiles;
    const isOwner = user?.id === post.user_id;
    const isAdmin = user?.user_metadata?.role === "admin";
    const avatarUrl = profile?.avatar_url;
    const displayName = profile?.full_name || "Người dùng";
    const role = profile?.role;

    const roleLabel = role === "landlord" ? "Chủ trọ" : role === "admin" ? "Quản trị" : "Người thuê";
    const roleBadgeClass =
        role === "landlord"
            ? "bg-amber-50 text-amber-700 border-amber-200"
            : role === "admin"
              ? "bg-purple-50 text-purple-700 border-purple-200"
              : "bg-stone-50 text-stone-600 border-stone-200";

    const category = post.category || "roommate";
    const isTransferCompleted = category === "transfer" && post.status === "completed";
    const categoryLabel = isTransferCompleted ? "Đã chuyển nhượng" : category === "transfer" ? "Sang nhượng" : category === "roommate" ? "Tìm người ở cùng" : null;
    const categoryBadgeClass = isTransferCompleted ? "bg-stone-100 text-stone-600 border-stone-300" : category === "transfer" ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-sky-50 text-sky-700 border-sky-200";

    const handleLike = async () => {
        if (!user) {
            showModal({
                title: "Yêu cầu đăng nhập",
                message: "Vui lòng đăng nhập để thả tim!",
                type: "warning",
                confirmText: "Đăng nhập",
                onConfirm: () => navigate("login"),
            });
            return;
        }
        const wasLiked = liked;
        setLiked(!wasLiked);
        setLikeCount((c) => (wasLiked ? Math.max(0, c - 1) : c + 1));
        const { error } = await togglePostLike(post.id, user.id, wasLiked);
        if (error) {
            setLiked(wasLiked);
            setLikeCount((c) => (wasLiked ? c + 1 : Math.max(0, c - 1)));
        }
    };

    const handleDelete = () => {
        showModal({
            title: "Xóa bài đăng",
            message: "Bạn có chắc muốn xóa bài đăng này? Hành động này không thể hoàn tác.",
            type: "error",
            confirmText: "Xóa",
            cancelText: "Hủy",
            onConfirm: async () => {
                const images = post.images || [];
                if (images.length > 0) {
                    for (const img of images) {
                        const url = img.url || img;
                        if (url && url.includes("res.cloudinary.com")) {
                            await deleteFromCloudinary(url);
                        }
                    }
                }

                const { error } = await deleteForumPost(post.id);
                if (error) {
                    addNotification("Lỗi khi xóa bài đăng.", "error");
                    return;
                }
                addNotification("Đã xóa bài đăng.", "success");
                setDeleted(true);
                onDelete?.(post.id);
            },
        });
        setShowMenu(false);
    };

    const handleReport = () => {
        showModal({ title: "Tính năng đang phát triển", message: "Tính năng báo cáo bài đăng đang được phát triển và sẽ sớm ra mắt.", type: "info" });
        setShowMenu(false);
    };

    const handleRequestAction = () => {
        if (!user) {
            showModal({
                title: "Yêu cầu đăng nhập",
                message: post.category === "roommate" ? "Vui lòng đăng nhập để xin ở ghép!" : "Vui lòng đăng nhập để xin sang nhượng!",
                type: "warning",
                confirmText: "Đăng nhập",
                onConfirm: () => navigate("login"),
            });
            return;
        }
        showModal({
            title: post.category === "roommate" ? "Xin ở ghép" : "Xin sang nhượng phòng",
            message: post.category === "roommate" ? `Bạn muốn gửi yêu cầu xin ở ghép với ${displayName}?` : `Bạn muốn gửi yêu cầu sang nhượng phòng này đến ${displayName}?`,
            type: "info",
            confirmText: "Gửi yêu cầu",
            cancelText: "Hủy",
            onConfirm: async () => {
                const { error } = await createRoomRequest({ postId: post.id, requesterId: user.id, type: post.category === "roommate" ? "roommate" : "transfer" });
                if (error) {
                    if (error.code === "23505") {
                        addNotification("Bạn đã gửi yêu cầu cho bài viết này rồi!", "warning");
                    } else {
                        addNotification("Có lỗi xảy ra khi gửi yêu cầu.", "error");
                    }
                    return;
                }

                addNotification(post.category === "roommate" ? "Đã gửi yêu cầu ở ghép! Vui lòng chờ phản hồi." : "Đã gửi yêu cầu sang nhượng! Vui lòng chờ người cho thuê phản hồi.", "success");
            },
        });
    };

    const handleShare = () => {
        showModal({ title: "Tính năng đang phát triển", message: "Tính năng chia sẻ bài đăng đang được phát triển và sẽ sớm ra mắt.", type: "info" });
    };

    const handleManagePost = () => {
        navigate("public-profile", { userId: user?.id, ownerPanel: "manage-posts" });
        setShowMenu(false);
    };

    // Image grid layout
    const images = post.images || [];
    const imgCount = images.length;

    return (
        <article
            className={
                flat
                    ? "bg-white hover:bg-stone-50/40 transition-colors"
                    : "bg-white border border-stone-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
            }
        >
            {/* Header */}
            <div className="flex items-start justify-between px-5 pt-4 pb-3">
                <div className="flex items-center gap-3">
                    <div
                        onClick={() => navigate("public-profile", { userId: post.user_id })}
                        className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center font-medium text-sm shrink-0 overflow-hidden cursor-pointer hover:opacity-85 transition-opacity"
                        style={avatarUrl ? { backgroundImage: `url(${avatarUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
                    >
                        {!avatarUrl && displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <button
                                onClick={() => navigate("public-profile", { userId: post.user_id })}
                                className="font-medium text-stone-900 text-[0.9rem] hover:text-amber-600 transition-colors cursor-pointer border-none bg-transparent p-0 leading-none"
                            >
                                {displayName}
                            </button>
                            <span className={`px-1.5 py-0.5 rounded-full text-[0.65rem] font-medium tracking-wide border ${roleBadgeClass}`}>{roleLabel}</span>
                            {categoryLabel && (
                                <span className={`px-1.5 py-0.5 rounded-full text-[0.65rem] font-medium tracking-wide border ${categoryBadgeClass}`}>
                                    {categoryLabel}
                                </span>
                            )}
                        </div>
                        <div className="text-[0.7rem] text-stone-400 mt-0.5">{formatRelativeTime(post.created_at)}</div>
                    </div>
                </div>

                {/* 3-dot menu */}
                {user && (
                    <div className="relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowMenu((v) => !v);
                            }}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors cursor-pointer border-none bg-transparent"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="1" />
                                <circle cx="12" cy="5" r="1" />
                                <circle cx="12" cy="19" r="1" />
                            </svg>
                        </button>
                        <AnimatePresence>
                            {showMenu && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 top-full mt-1 w-52 bg-white border border-stone-200 rounded-xl shadow-xl overflow-hidden z-20 py-1"
                                    >
                                        {!isOwner && (
                                            <button
                                                onClick={handleReport}
                                                className="w-full text-left px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 cursor-pointer border-none bg-transparent flex items-center gap-2.5"
                                            >
                                                <AppIcon name="alert" size={15} />
                                                Báo cáo bài đăng
                                            </button>
                                        )}
                                        {isOwner && (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        onEdit?.(post);
                                                        setShowMenu(false);
                                                    }}
                                                    className="w-full text-left px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 cursor-pointer border-none bg-transparent flex items-center gap-2.5"
                                                >
                                                    <AppIcon name="edit" size={15} />
                                                    Chỉnh sửa bài đăng
                                                </button>
                                                <div className="h-px bg-stone-100 my-1" />
                                                <button
                                                    onClick={handleDelete}
                                                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 cursor-pointer border-none bg-transparent flex items-center gap-2.5"
                                                >
                                                    <AppIcon name="trash" size={15} />
                                                    Xóa bài đăng
                                                </button>
                                            </>
                                        )}
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="px-5">
                {post.content && <p className="text-stone-800 text-[0.92rem] leading-relaxed whitespace-pre-wrap mb-3">{post.content}</p>}

                {/* Image grid */}
                {imgCount > 0 && (
                    <div
                        className={`grid gap-1 rounded-xl overflow-hidden mb-3 ${
                            imgCount === 1 ? "grid-cols-1" : imgCount === 2 ? "grid-cols-2" : "grid-cols-3"
                        }`}
                    >
                        {images.map((img, idx) => (
                            <div
                                key={idx}
                                className={`relative overflow-hidden bg-stone-100 ${imgCount === 1 ? "aspect-video" : "aspect-square"}`}
                                onClick={() => setPreviewImageIndex(idx)}
                            >
                                <img
                                    src={img.url || img}
                                    alt={`Ảnh ${idx + 1}`}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Attached room */}
                {post.attachedRoom && <RoomAttachCard room={post.attachedRoom} onViewDetail={onViewRoom} />}
            </div>

            {/* Stats bar */}
            {(likeCount > 0 || commentCount > 0) && (
                <div className="flex items-center justify-between px-5 py-2 text-stone-400 text-[0.75rem]">
                    {likeCount > 0 && (
                        <div className="flex items-center gap-1">
                            <div className="w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                                <svg width="9" height="9" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2">
                                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                                </svg>
                            </div>
                            <span>{likeCount}</span>
                        </div>
                    )}
                    {commentCount > 0 && (
                        <button
                            onClick={() => setShowComments((v) => !v)}
                            className="text-stone-400 hover:text-amber-600 cursor-pointer border-none bg-transparent text-[0.75rem] transition-colors"
                        >
                            {commentCount} bình luận
                        </button>
                    )}
                </div>
            )}

            {/* Action bar */}
            <div className="flex items-center border-t border-stone-100 mx-5 py-2 flex-wrap">
                <button
                    onClick={handleLike}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer border-none bg-transparent ${liked ? "text-amber-500" : "text-stone-500 hover:bg-stone-50 hover:text-amber-500"}`}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                    <span>Thích</span>
                </button>

                <button
                    onClick={() => setShowComments((v) => !v)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-stone-500 hover:bg-stone-50 hover:text-amber-500 transition-colors cursor-pointer border-none bg-transparent"
                >
                    <AppIcon name="messages" size={16} />
                    <span>Bình luận</span>
                </button>

                {isTransferCompleted && !isOwner && !isAdmin ? (
                    <button
                        disabled
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-stone-400 bg-stone-50 cursor-not-allowed border-none"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        <span>Đã chuyển nhượng</span>
                    </button>
                ) : ((post.category === "transfer" && post.status === "published") || (post.category === "roommate" && (post.status === "published" || post.status === "completed"))) && !isOwner && !isAdmin ? (
                    <button
                        onClick={handleRequestAction}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer border-none bg-transparent ${post.category === 'roommate' ? 'text-sky-600 hover:bg-sky-50' : 'text-purple-600 hover:bg-purple-50'}`}
                    >
                        <AppIcon name="home" size={16} />
                        <span>{post.category === "roommate" ? "Xin ở ghép" : "Gửi yêu cầu"}</span>
                    </button>
                ) : (
                    <button
                        onClick={handleShare}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-stone-500 hover:bg-stone-50 hover:text-amber-500 transition-colors cursor-pointer border-none bg-transparent"
                    >
                        <AppIcon name="share" size={16} />
                        <span>Chia sẻ</span>
                    </button>
                )}
            </div>

            {/* Comment section */}
            <AnimatePresence>
                {showComments && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-5 pb-5 overflow-hidden"
                    >
                        <ForumCommentSection
                            postId={post.id}
                            post={post}
                            user={user}
                            navigate={navigate}
                            onCommentCountChange={(delta) => setCommentCount((c) => Math.max(0, c + delta))}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <ImagePreviewModal
                isOpen={previewImageIndex !== null}
                onClose={() => setPreviewImageIndex(null)}
                images={images}
                initialIndex={previewImageIndex || 0}
            />
        </article>
    );
}
