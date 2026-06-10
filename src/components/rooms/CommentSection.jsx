import { useState, useEffect } from "react";
import { getCommentsByRoomId, createComment, updateComment, deleteComment, voteComment } from "../../services/commentService";
import { formatDate } from "../../utils/formatters.js";
import AppIcon from "../common/AppIcon.jsx";
import { useModal } from "../../context/ModalContext";

export default function CommentSection({ room, user, navigate, isGridMode = false, previewMode = false }) {
    const { showModal } = useModal();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loadingComments, setLoadingComments] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [replyTo, setReplyTo] = useState(null); // { commentId, parentId, userName }
    const [replyContent, setReplyContent] = useState("");

    // Editing state
    const [editingId, setEditingId] = useState(null);
    const [editingContent, setEditingContent] = useState("");
    const [editingTag, setEditingTag] = useState(null);

    // Helper to parse content and extract tag
    const parseContent = (fullContent) => {
        const hasTag = fullContent.startsWith("@");
        if (!hasTag) return { tag: null, content: fullContent };

        const parts = fullContent.split("\u200B");
        if (parts.length > 1) {
            return { tag: parts[0].substring(1), content: parts[1].trim() };
        }

        const firstSpace = fullContent.indexOf(" ");
        if (firstSpace !== -1) {
            return { tag: fullContent.substring(1, firstSpace), content: fullContent.substring(firstSpace + 1) };
        }

        return { tag: null, content: fullContent };
    };

    const userId = user?.id;

    useEffect(() => {
        const loadComments = async () => {
            if (!room?.id) {
                setComments([]);
                setLoadingComments(false);
                return;
            }

            setLoadingComments(true);
            try {
                const { data, error } = await getCommentsByRoomId(room.id, userId);

                if (!error && data) {
                    setComments(data);
                }
            } catch (err) {
                console.error("Error fetching comments:", err);
            } finally {
                setLoadingComments(false);
            }
        };

        loadComments();
    }, [room?.id, userId]);

    const handleCommentSubmit = async () => {
        if (!user) {
            showModal({
                title: "Thông báo",
                message: "Vui lòng đăng nhập để bình luận!",
                type: "warning",
                confirmText: "Đăng nhập ngay",
                onConfirm: () => navigate("login"),
            });
            return;
        }
        if (!newComment.trim()) return;

        // Bug #9: Rate limit 5 comments / 5 phút per user
        const QUOTA_KEY = `comment_quota_${user.id}`;
        const MAX_COMMENTS = 5;
        const WINDOW_MS = 5 * 60 * 1000; // 5 phút
        const now = Date.now();
        let quota = { count: 0, windowStart: now };
        try {
            const stored = localStorage.getItem(QUOTA_KEY);
            if (stored) quota = JSON.parse(stored);
        } catch { /* ignore */ }

        // Reset window nếu đã qua 5 phút
        if (now - quota.windowStart >= WINDOW_MS) {
            quota = { count: 0, windowStart: now };
        }

        if (quota.count >= MAX_COMMENTS) {
            const remainingMs = WINDOW_MS - (now - quota.windowStart);
            const remainingMin = Math.ceil(remainingMs / 60000);
            showModal({
                title: "Chậm lại một chút",
                message: `Bạn đã gửi ${MAX_COMMENTS} bình luận. Vui lòng đợi thêm ${remainingMin} phút trước khi gửi tiếp.`,
                type: "warning",
            });
            return;
        }

        setSubmitting(true);
        try {
            const { data, error } = await createComment({
                roomId: room.id,
                userId: user.id,
                content: newComment
            });

            if (error) throw error;

            if (data) {
                const profileData = data.profiles || data["profiles!user_id"];
                const newObj = { ...data, profiles: profileData, likeCount: 0, dislikeCount: 0, userVote: null, replies: [] };
                setComments([newObj, ...comments]);
                setNewComment("");
                // Cập nhật quota
                quota.count += 1;
                localStorage.setItem(QUOTA_KEY, JSON.stringify(quota));
            }
        } catch (err) {
            console.error("Error submitting comment:", err);
            showModal({
                title: "Lỗi",
                message: "Có lỗi xảy ra khi gửi bình luận. Vui lòng thử lại sau.",
                type: "error",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleReplySubmit = async () => {
        if (!user || !replyContent.trim() || !replyTo) return;

        // Bug #9: Rate limit 5 comments / 5 phút per user (chung quota với comment chính)
        const QUOTA_KEY = `comment_quota_${user.id}`;
        const MAX_COMMENTS = 5;
        const WINDOW_MS = 5 * 60 * 1000;
        const now = Date.now();
        let quota = { count: 0, windowStart: now };
        try {
            const stored = localStorage.getItem(QUOTA_KEY);
            if (stored) quota = JSON.parse(stored);
        } catch { /* ignore */ }

        if (now - quota.windowStart >= WINDOW_MS) {
            quota = { count: 0, windowStart: now };
        }

        if (quota.count >= MAX_COMMENTS) {
            const remainingMs = WINDOW_MS - (now - quota.windowStart);
            const remainingMin = Math.ceil(remainingMs / 60000);
            showModal({
                title: "Chậm lại một chút",
                message: `Bạn đã gửi ${MAX_COMMENTS} bình luận. Vui lòng đợi thêm ${remainingMin} phút trước khi gửi tiếp.`,
                type: "warning",
            });
            return;
        }

        setSubmitting(true);
        const { parentId, userName } = replyTo;
        const finalContent = userName ? `@${userName}\u200B ${replyContent.trim()}` : replyContent.trim();

        try {
            const { data, error } = await createComment({
                roomId: room.id,
                userId: user.id,
                content: finalContent,
                parentId: parentId
            });

            if (error) throw error;

            const profileData = data.profiles || data["profiles!user_id"];
            const newReply = { ...data, profiles: profileData, likeCount: 0, dislikeCount: 0, userVote: null };
            setComments((prev) =>
                prev.map((p) => {
                    if (p.id === parentId) {
                        return { ...p, replies: [...(p.replies || []), newReply] };
                    }
                    return p;
                }),
            );
            setReplyContent("");
            setReplyTo(null);
            // Cập nhật quota
            quota.count += 1;
            localStorage.setItem(QUOTA_KEY, JSON.stringify(quota));
        } catch (err) {
            console.error("Error submitting reply:", err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCommentUpdate = async (commentId) => {
        if (!editingContent.trim()) return;
        setSubmitting(true);
        const finalContent = editingTag ? `@${editingTag}\u200B ${editingContent.trim()}` : editingContent.trim();

        try {
            const { error } = await updateComment(commentId, finalContent);

            if (error) throw error;

            const updateMap = (c) => (c.id === commentId ? { ...c, content: finalContent } : c);
            setComments((prev) =>
                prev.map((p) => {
                    if (p.id === commentId) return updateMap(p);
                    return { ...p, replies: p.replies?.map(updateMap) };
                }),
            );
            setEditingId(null);
            setEditingContent("");
            setEditingTag(null);
        } catch (err) {
            console.error("Error updating comment:", err);
            showModal({
                title: "Lỗi",
                message: "Có lỗi xảy ra khi cập nhật bình luận.",
                type: "error",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleVote = async (commentId, voteType) => {
        if (!user) {
            showModal({
                title: "Yêu cầu đăng nhập",
                message: "Vui lòng đăng nhập để bình chọn!",
                type: "info",
            });
            return;
        }

        try {
            let targetComment = null;
            for (const p of comments) {
                if (p.id === commentId) {
                    targetComment = p;
                    break;
                }
                const found = p.replies?.find((r) => r.id === commentId);
                if (found) {
                    targetComment = found;
                    break;
                }
            }
            if (!targetComment) return;

            const existingVote = targetComment.userVote;
            const { error } = await voteComment(commentId, user.id, voteType, existingVote);
            if (error) throw error;

            const updateMap = (c) => {
                if (c.id !== commentId) return c;
                let nl = c.likeCount,
                    nd = c.dislikeCount,
                    nv = null;

                if (existingVote === 1) nl = Math.max(0, nl - 1);
                if (existingVote === -1) nd = Math.max(0, nd - 1);

                if (existingVote !== voteType) {
                    if (voteType === 1) nl++;
                    if (voteType === -1) nd++;
                    nv = voteType;
                }
                return { ...c, likeCount: nl, dislikeCount: nd, userVote: nv };
            };

            setComments((prev) =>
                prev.map((p) => {
                    if (p.id === commentId) return updateMap(p);
                    if (p.replies?.some((r) => r.id === commentId)) {
                        return { ...p, replies: p.replies.map(updateMap) };
                    }
                    return p;
                }),
            );
        } catch (err) {
            console.error("Error voting:", err);
        }
    };

    const handleCommentDelete = async (commentId) => {
        showModal({
            title: "Xác nhận xóa",
            message: "Bạn có chắc chắn muốn xóa bình luận này?",
            type: "warning",
            confirmText: "Xóa ngay",
            cancelText: "Hủy",
            onConfirm: async () => {
                try {
                    const { error } = await deleteComment(commentId);
                    if (error) throw error;
                    setComments((prev) =>
                        prev
                            .filter((p) => p.id !== commentId)
                            .map((p) => ({
                                ...p,
                                replies: p.replies?.filter((r) => r.id !== commentId),
                            })),
                    );
                } catch (err) {
                    console.error("Error deleting comment:", err);
                }
            },
        });
        setActiveMenuId(null);
    };

    const handleCommentReport = () => {
        showModal({
            title: "Tính năng đang phát triển",
            message: "Tính năng báo cáo bình luận đang được phát triển và sẽ sớm ra mắt.",
            type: "info",
        });
        setActiveMenuId(null);
    };

    useEffect(() => {
        const handleClickOutside = () => setActiveMenuId(null);
        if (activeMenuId) {
            window.addEventListener("click", handleClickOutside);
        }
        return () => window.removeEventListener("click", handleClickOutside);
    }, [activeMenuId]);

    return (
        <div className={isGridMode ? "p-6" : "bg-white border border-stone-200 p-6 rounded-xl"}>
            <h2 className={`font-bold text-[1.05rem] text-stone-900 flex items-center gap-2 font-heading ${previewMode ? "mb-6" : ""}`}>
                <AppIcon name="messages" color="#d97706" />
                Bình luận & Hỏi đáp ({comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})
            </h2>

            {/* Comment Input */}
            {!previewMode && (
                <div className="mt-6 mb-8 relative">
                    {!user && (
                        <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg border border-stone-200">
                            <p className="text-stone-700 font-medium mb-2">Đăng nhập để tham gia thảo luận</p>
                            <button
                                onClick={() => navigate("login")}
                                className="px-4 py-1.5 bg-amber-500 text-white rounded-full text-sm font-bold hover:bg-amber-600 transition-colors cursor-pointer border-none"
                            >
                                Đăng nhập ngay
                            </button>
                        </div>
                    )}
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Viết câu hỏi hoặc bình luận của bạn..."
                        className="input w-full min-h-25 p-4 text-[0.95rem] resize-none border-stone-900/20 focus:border-amber-500 rounded-lg outline-none"
                        disabled={!user || submitting}
                        maxLength={500}
                    />
                    <div className="flex justify-between items-center mt-3">
                        <span className="text-stone-400 text-xs">{newComment.length}/500</span>
                        <button
                            onClick={handleCommentSubmit}
                            disabled={!user || submitting || !newComment.trim()}
                            className="inline-flex items-center justify-center bg-amber-500 text-white rounded-full px-6 py-2 hover:bg-amber-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-none font-bold text-sm"
                        >
                            {submitting ? "Đang gửi..." : "Gửi bình luận"}
                        </button>
                    </div>
                </div>
            )}

            {/* Comment list */}
            <div className="flex flex-col gap-6">
                {loadingComments ? (
                    <div className="text-center py-6 text-stone-400 text-sm">Đang tải bình luận...</div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-8 bg-stone-50 rounded-lg border border-dashed border-stone-200 text-stone-500 text-sm">
                        {previewMode ? "Chưa có bình luận nào." : "Chưa có bình luận nào. Hãy là người đầu tiên đặt câu hỏi!"}
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex flex-col gap-4">
                            <CommentItem
                                comment={comment}
                                user={user}
                                activeMenuId={activeMenuId}
                                setActiveMenuId={setActiveMenuId}
                                onDelete={handleCommentDelete}
                                onReport={handleCommentReport}
                                onVote={handleVote}
                                editingId={editingId}
                                setEditingId={(id) => {
                                    if (id === null) {
                                        setEditingId(null);
                                        setEditingTag(null);
                                        setEditingContent("");
                                    } else {
                                        const { tag, content } = parseContent(comment.content);
                                        setEditingId(id);
                                        setEditingTag(tag);
                                        setEditingContent(content);
                                    }
                                }}
                                editingContent={editingContent}
                                setEditingContent={setEditingContent}
                                editingTag={editingTag}
                                setEditingTag={setEditingTag}
                                onUpdate={handleCommentUpdate}
                                onReplyClick={() => {
                                    const name = comment.profiles?.full_name || "Người dùng";
                                    if (replyTo?.commentId === comment.id && replyTo.userName === name) {
                                        setReplyTo(null);
                                    } else {
                                        setReplyTo({
                                            commentId: comment.id,
                                            parentId: comment.id,
                                            userName: name,
                                        });
                                        setReplyContent("");
                                    }
                                }}
                                previewMode={previewMode}
                                navigate={navigate}
                            />

                            {/* Inline Reply Input under Parent */}
                            {replyTo?.commentId === comment.id && (
                                <div className="ml-14 animate-fade-in">
                                    <div className="bg-stone-50 rounded-lg border border-stone-200 overflow-hidden focus-within:border-amber-500 transition-colors">
                                        {replyTo.userName && (
                                            <div className="px-3 py-1.5 bg-amber-50 border-b border-stone-200 flex items-center justify-between">
                                                <span className="text-[0.75rem] text-amber-700 font-bold flex items-center gap-1.5">
                                                    <AppIcon name="messages" size={12} />
                                                    Đang phản hồi @{replyTo.userName}
                                                </span>
                                                <button
                                                    onClick={() => setReplyTo({ ...replyTo, userName: null })}
                                                    className="text-stone-400 hover:text-stone-600 cursor-pointer border-none bg-transparent"
                                                    title="Bỏ gắn thẻ (trở thành bình luận độc lập)"
                                                >
                                                    <AppIcon name="close" size={14} />
                                                </button>
                                            </div>
                                        )}
                                        <textarea
                                            autoFocus
                                            value={replyContent}
                                            onChange={(e) => setReplyContent(e.target.value)}
                                            placeholder="Viết câu trả lời..."
                                            className="w-full min-h-20 p-3 text-[0.9rem] resize-none outline-none bg-transparent border-none"
                                            maxLength={500}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-stone-400 text-xs ml-2">{replyContent.length}/500</span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setReplyTo(null);
                                                    setReplyContent("");
                                                }}
                                                className="text-stone-500 text-xs font-bold hover:text-stone-700 cursor-pointer border-none bg-transparent px-3 py-1"
                                            >
                                                Hủy
                                            </button>
                                            <button
                                                onClick={handleReplySubmit}
                                                disabled={submitting || !replyContent.trim()}
                                                className="bg-amber-500 text-white rounded-full px-4 py-1 text-xs font-bold hover:bg-amber-600 disabled:opacity-50 cursor-pointer border-none"
                                            >
                                                {submitting ? "Đang gửi..." : "Gửi trả lời"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Nested Replies */}
                            {comment.replies?.length > 0 && (
                                <div className="ml-14 flex flex-col gap-4 border-l-2 border-stone-100 pl-4">
                                    {comment.replies.map((reply) => (
                                        <div key={reply.id} className="flex flex-col gap-4">
                                            <CommentItem
                                                comment={reply}
                                                user={user}
                                                isReply={true}
                                                activeMenuId={activeMenuId}
                                                setActiveMenuId={setActiveMenuId}
                                                onDelete={handleCommentDelete}
                                                onReport={handleCommentReport}
                                                onVote={handleVote}
                                                editingId={editingId}
                                                setEditingId={(id) => {
                                                    if (id === null) {
                                                        setEditingId(null);
                                                        setEditingTag(null);
                                                        setEditingContent("");
                                                    } else {
                                                        const { tag, content } = parseContent(reply.content);
                                                        setEditingId(id);
                                                        setEditingTag(tag);
                                                        setEditingContent(content);
                                                    }
                                                }}
                                                editingContent={editingContent}
                                                setEditingContent={setEditingContent}
                                                editingTag={editingTag}
                                                setEditingTag={setEditingTag}
                                                onUpdate={handleCommentUpdate}
                                                onReplyClick={() => {
                                                    setReplyTo({
                                                        commentId: reply.id,
                                                        parentId: comment.id,
                                                        userName: reply.profiles?.full_name || "Người dùng",
                                                    });
                                                    setReplyContent("");
                                                }}
                                                previewMode={previewMode}
                                                navigate={navigate}
                                            />

                                            {/* Inline Reply Input under Child Reply */}
                                            {replyTo?.commentId === reply.id && (
                                                <div className="ml-12 animate-fade-in">
                                                    <div className="bg-stone-50 rounded-lg border border-stone-200 overflow-hidden focus-within:border-amber-500 transition-colors">
                                                        {replyTo.userName && (
                                                            <div className="px-3 py-1.5 bg-amber-50 border-b border-stone-200 flex items-center justify-between">
                                                                <span className="text-[0.75rem] text-amber-700 font-bold flex items-center gap-1.5">
                                                                    <AppIcon name="messages" size={12} />
                                                                    Đang phản hồi @{replyTo.userName}
                                                                </span>
                                                                <button
                                                                    onClick={() => setReplyTo({ ...replyTo, userName: null })}
                                                                    className="text-stone-400 hover:text-stone-600 cursor-pointer border-none bg-transparent"
                                                                    title="Bỏ gắn thẻ (trở thành bình luận độc lập)"
                                                                >
                                                                    <AppIcon name="close" size={14} />
                                                                </button>
                                                            </div>
                                                        )}
                                                        <textarea
                                                            autoFocus
                                                            value={replyContent}
                                                            onChange={(e) => setReplyContent(e.target.value)}
                                                            placeholder="Viết câu trả lời..."
                                                            className="w-full min-h-20 p-3 text-[0.9rem] resize-none outline-none bg-transparent border-none"
                                                            maxLength={500}
                                                        />
                                                    </div>
                                                    <div className="flex justify-between items-center mt-2">
                                                        <span className="text-stone-400 text-xs ml-2">{replyContent.length}/500</span>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setReplyTo(null);
                                                                    setReplyContent("");
                                                                }}
                                                                className="text-stone-500 text-xs font-bold hover:text-stone-700 cursor-pointer border-none bg-transparent px-3 py-1"
                                                            >
                                                                Hủy
                                                            </button>
                                                            <button
                                                                onClick={handleReplySubmit}
                                                                disabled={submitting || !replyContent.trim()}
                                                                className="bg-amber-500 text-white rounded-full px-4 py-1 text-xs font-bold hover:bg-amber-600 disabled:opacity-50 cursor-pointer border-none"
                                                            >
                                                                {submitting ? "Đang gửi..." : "Gửi trả lời"}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

function CommentItem({
    comment,
    user,
    isReply = false,
    activeMenuId,
    setActiveMenuId,
    onDelete,
    onReport,
    onVote,
    onReplyClick,
    editingId,
    setEditingId,
    editingContent,
    setEditingContent,
    editingTag,
    setEditingTag,
    onUpdate,
    previewMode,
    navigate,
}) {
    const isDeletedUser = !comment.profiles;
    const displayName = isDeletedUser ? "Người dùng đã xóa" : comment.profiles.full_name || "Người dùng";
    const avatarUrl = comment.profiles?.avatar_url;
    const initial = (displayName || "U").charAt(0).toUpperCase();
    const isEditing = editingId === comment.id;

    // Split tag from content for structured display
    const hasTag = comment.content.startsWith("@");
    let displayContent = comment.content;
    let tag = null;

    if (hasTag) {
        const parts = comment.content.split("\u200B");
        if (parts.length > 1) {
            tag = parts[0].substring(1);
            displayContent = parts[1].trim();
        } else {
            const firstSpace = comment.content.indexOf(" ");
            if (firstSpace !== -1) {
                tag = comment.content.substring(1, firstSpace);
                displayContent = comment.content.substring(firstSpace + 1);
            }
        }
    }

    return (
        <div className="flex gap-4 group relative animate-fade-in">
            <div
                onClick={() => !isDeletedUser && navigate && navigate('public-profile', { userId: comment.user_id })}
                className={`${isReply ? "w-8 h-8" : "w-10 h-10"} rounded-full flex items-center justify-center font-bold text-white ${isReply ? "text-xs" : "text-sm"} shrink-0 overflow-hidden ${isDeletedUser ? "bg-stone-300" : "bg-amber-500 hover:opacity-85 cursor-pointer transition-opacity"}`}
                style={avatarUrl ? { backgroundImage: `url(${avatarUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
            >
                {!avatarUrl && initial}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-0.5">
                    <div>
                        <h4
                            onClick={() => !isDeletedUser && navigate && navigate('public-profile', { userId: comment.user_id })}
                            className={`${isReply ? "text-[0.85rem]" : "text-[0.9rem]"} font-bold ${isDeletedUser ? "text-stone-400 italic" : "text-stone-900 hover:text-amber-600 hover:underline cursor-pointer transition-colors"}`}
                        >
                            {displayName}
                        </h4>
                        <span className="text-[0.7rem] text-stone-400">{formatDate(comment.created_at)}</span>
                    </div>

                    {user && !isDeletedUser && (
                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuId(activeMenuId === comment.id ? null : comment.id);
                                }}
                                className="p-1 text-stone-300 hover:text-stone-600 rounded-md hover:bg-stone-100 cursor-pointer border-none bg-transparent transition-colors"
                            >
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <circle cx="12" cy="12" r="1" />
                                    <circle cx="12" cy="5" r="1" />
                                    <circle cx="12" cy="19" r="1" />
                                </svg>
                            </button>

                            {activeMenuId === comment.id && (
                                <div className="absolute right-0 top-full mt-1 w-50 bg-white border border-stone-200 rounded-lg shadow-lg overflow-hidden z-20 animate-fade-in py-1">
                                    {user?.id === comment.user_id ? (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setEditingId(comment.id);
                                                    setActiveMenuId(null);
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 cursor-pointer border-none bg-transparent flex items-center gap-2"
                                            >
                                                <AppIcon name="edit" size={14} />
                                                Chỉnh sửa
                                            </button>
                                            <button
                                                onClick={() => onDelete(comment.id)}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer border-none bg-transparent flex items-center gap-2"
                                            >
                                                <AppIcon name="trash" size={14} />
                                                Xóa bình luận
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={onReport}
                                            className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 cursor-pointer border-none bg-transparent flex items-center gap-2"
                                        >
                                            <AppIcon name="alert" size={14} />
                                            Báo cáo
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {isEditing ? (
                    <div className="mt-2 animate-fade-in">
                        <div className="bg-stone-50 rounded-lg border border-stone-200 overflow-hidden focus-within:border-amber-500 transition-colors">
                            {editingTag && (
                                <div className="px-3 py-1.5 bg-amber-50 border-b border-stone-200 flex items-center justify-between">
                                    <span className="text-[0.75rem] text-amber-700 font-bold flex items-center gap-1.5">
                                        <AppIcon name="messages" size={12} />
                                        Gắn thẻ @{editingTag}
                                    </span>
                                    <button
                                        onClick={() => setEditingTag(null)}
                                        className="text-stone-400 hover:text-stone-600 cursor-pointer border-none bg-transparent"
                                        title="Bỏ gắn thẻ"
                                    >
                                        <AppIcon name="close" size={14} />
                                    </button>
                                </div>
                            )}
                            <textarea
                                autoFocus
                                value={editingContent}
                                onChange={(e) => setEditingContent(e.target.value)}
                                className="w-full min-h-20 p-3 text-[0.9rem] resize-none outline-none bg-transparent border-none"
                                maxLength={500}
                            />
                        </div>
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-stone-400 text-xs ml-2">{editingContent.length}/500</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setEditingId(null)}
                                    className="text-stone-500 text-xs font-bold hover:text-stone-700 cursor-pointer border-none bg-transparent px-3 py-1"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={() => onUpdate(comment.id)}
                                    disabled={!editingContent.trim()}
                                    className="bg-amber-500 text-white rounded-full px-4 py-1 text-xs font-bold hover:bg-amber-600 disabled:opacity-50 cursor-pointer border-none"
                                >
                                    Cập nhật
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className={`${isReply ? "text-[0.85rem]" : "text-[0.9rem]"} text-stone-700 leading-relaxed whitespace-pre-wrap`}>
                        {tag && <span className="tag text-amber-600 font-bold mr-1.5 cursor-default">@{tag}</span>}
                        <span className="comment-content">{displayContent}</span>
                    </p>
                )}

                {/* Comment Action Bar */}
                {!isDeletedUser && !isEditing && (
                    <div className="flex items-center gap-4 mt-2">
                        {!previewMode && (
                            <div className="flex items-center bg-stone-100 rounded-full px-2 py-0.5">
                                <button
                                    onClick={() => onVote(comment.id, 1)}
                                    className={`p-1 rounded-full transition-colors border-none bg-transparent cursor-pointer flex items-center gap-1 ${comment.userVote === 1 ? "text-amber-600" : "text-stone-400 hover:text-stone-600"}`}
                                >
                                    <svg
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill={comment.userVote === 1 ? "currentColor" : "none"}
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                                    </svg>
                                    <span className="text-[0.7rem] font-bold">{comment.likeCount || 0}</span>
                                </button>
                                <div className="w-px h-3 bg-stone-300 mx-1"></div>
                                <button
                                    onClick={() => onVote(comment.id, -1)}
                                    className={`p-1 rounded-full transition-colors border-none bg-transparent cursor-pointer flex items-center gap-1 ${comment.userVote === -1 ? "text-red-500" : "text-stone-400 hover:text-stone-600"}`}
                                >
                                    <svg
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill={comment.userVote === -1 ? "currentColor" : "none"}
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="rotate-180"
                                    >
                                        <path d="M7 10v12" />
                                        <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
                                    </svg>
                                    <span className="text-[0.7rem] font-bold">{comment.dislikeCount || 0}</span>
                                </button>
                            </div>
                        )}

                        {user && !previewMode && (
                            <button
                                onClick={onReplyClick}
                                className="text-stone-500 text-[0.75rem] font-bold hover:text-amber-600 transition-colors border-none bg-transparent cursor-pointer flex items-center gap-1"
                            >
                                <AppIcon name="messages" size={13} />
                                Phản hồi
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
