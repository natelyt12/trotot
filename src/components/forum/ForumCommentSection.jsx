import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    getForumComments,
    createForumComment,
    updateForumComment,
    deleteForumComment,
    voteForumComment,
    updateForumPost,
} from '../../services/forumService.js';
import { formatDate } from '../../utils/formatters.js';
import AppIcon from '../common/AppIcon.jsx';
import { useModal } from '../../context/ModalContext.jsx';
import { useNotification } from '../../context/NotificationContext.jsx';

export default function ForumCommentSection({ postId, post, user, navigate }) {
    const { showModal } = useModal();
    const { addNotification } = useNotification();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loadingComments, setLoadingComments] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [replyTo, setReplyTo] = useState(null);
    const [replyContent, setReplyContent] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editingContent, setEditingContent] = useState('');
    const [editingTag, setEditingTag] = useState(null);

    const userId = user?.id;

    const parseContent = (fullContent) => {
        const hasTag = fullContent.startsWith('@');
        if (!hasTag) return { tag: null, content: fullContent };
        const parts = fullContent.split('\u200B');
        if (parts.length > 1) return { tag: parts[0].substring(1), content: parts[1].trim() };
        const firstSpace = fullContent.indexOf(' ');
        if (firstSpace !== -1) return { tag: fullContent.substring(1, firstSpace), content: fullContent.substring(firstSpace + 1) };
        return { tag: null, content: fullContent };
    };

    useEffect(() => {
        const load = async () => {
            if (!postId) { setComments([]); setLoadingComments(false); return; }
            setLoadingComments(true);
            try {
                const { data, error } = await getForumComments(postId, userId);
                if (!error && data) setComments(data);
            } catch (err) {
                console.error('Error loading forum comments:', err);
            } finally {
                setLoadingComments(false);
            }
        };
        load();
    }, [postId, userId]);

    const checkAndSubmit = () => {
        if (!user) {
            showModal({
                title: 'Yêu cầu đăng nhập',
                message: 'Vui lòng đăng nhập để bình luận!',
                type: 'warning',
                confirmText: 'Đăng nhập ngay',
                onConfirm: () => navigate('login'),
            });
            return false;
        }
        return true;
    };

    const handleCommentSubmit = async () => {
        if (!checkAndSubmit() || !newComment.trim()) return;
        setSubmitting(true);
        try {
            const { data, error } = await createForumComment({ postId, userId: user.id, content: newComment });
            if (error) throw error;
            if (data) {
                const profileData = data.profiles || data['profiles!user_id'];
                const newObj = { ...data, profiles: profileData, likeCount: 0, dislikeCount: 0, userVote: null, replies: [] };
                setComments([newObj, ...comments]);
                setNewComment('');
            }
        } catch (err) {
            showModal({ title: 'Lỗi', message: 'Có lỗi xảy ra khi gửi bình luận.', type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleReplySubmit = async () => {
        if (!user || !replyContent.trim() || !replyTo) return;
        setSubmitting(true);
        const { parentId, userName } = replyTo;
        const finalContent = userName ? `@${userName}\u200B ${replyContent.trim()}` : replyContent.trim();
        try {
            const { data, error } = await createForumComment({ postId, userId: user.id, content: finalContent, parentId });
            if (error) throw error;
            const profileData = data.profiles || data['profiles!user_id'];
            const newReply = { ...data, profiles: profileData, likeCount: 0, dislikeCount: 0, userVote: null };
            setComments(prev => prev.map(p => p.id === parentId ? { ...p, replies: [...(p.replies || []), newReply] } : p));
            setReplyContent('');
            setReplyTo(null);
        } catch (err) {
            console.error('Error replying:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCommentUpdate = async (commentId) => {
        if (!editingContent.trim()) return;
        setSubmitting(true);
        const finalContent = editingTag ? `@${editingTag}\u200B ${editingContent.trim()}` : editingContent.trim();
        try {
            const { error } = await updateForumComment(commentId, finalContent);
            if (error) throw error;
            const updateMap = c => c.id === commentId ? { ...c, content: finalContent } : c;
            setComments(prev => prev.map(p => {
                if (p.id === commentId) return updateMap(p);
                return { ...p, replies: p.replies?.map(updateMap) };
            }));
            setEditingId(null);
            setEditingContent('');
            setEditingTag(null);
        } catch (err) {
            showModal({ title: 'Lỗi', message: 'Có lỗi xảy ra khi cập nhật bình luận.', type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleVote = async (commentId, voteType) => {
        if (!user) { showModal({ title: 'Yêu cầu đăng nhập', message: 'Vui lòng đăng nhập để bình chọn!', type: 'info' }); return; }
        try {
            let targetComment = null;
            for (const p of comments) {
                if (p.id === commentId) { targetComment = p; break; }
                const found = p.replies?.find(r => r.id === commentId);
                if (found) { targetComment = found; break; }
            }
            if (!targetComment) return;
            const existingVote = targetComment.userVote;
            const { error } = await voteForumComment(commentId, user.id, voteType, existingVote);
            if (error) throw error;
            const updateMap = c => {
                if (c.id !== commentId) return c;
                let nl = c.likeCount, nd = c.dislikeCount, nv = null;
                if (existingVote === 1) nl = Math.max(0, nl - 1);
                if (existingVote === -1) nd = Math.max(0, nd - 1);
                if (existingVote !== voteType) { if (voteType === 1) nl++; if (voteType === -1) nd++; nv = voteType; }
                return { ...c, likeCount: nl, dislikeCount: nd, userVote: nv };
            };
            setComments(prev => prev.map(p => {
                if (p.id === commentId) return updateMap(p);
                if (p.replies?.some(r => r.id === commentId)) return { ...p, replies: p.replies.map(updateMap) };
                return p;
            }));
        } catch (err) { console.error('Error voting:', err); }
    };

    const handleCommentDelete = async (commentId) => {
        showModal({
            title: 'Xác nhận xóa',
            message: 'Bạn có chắc chắn muốn xóa bình luận này?',
            type: 'warning',
            confirmText: 'Xóa ngay',
            cancelText: 'Hủy',
            onConfirm: async () => {
                try {
                    const { error } = await deleteForumComment(commentId);
                    if (error) throw error;
                    setComments(prev => prev.filter(p => p.id !== commentId).map(p => ({ ...p, replies: p.replies?.filter(r => r.id !== commentId) })));
                } catch (err) { console.error('Error deleting comment:', err); }
            },
        });
        setActiveMenuId(null);
    };

    const handleCommentReport = () => {
        showModal({ title: 'Tính năng đang phát triển', message: 'Tính năng báo cáo bình luận đang được phát triển và sẽ sớm ra mắt.', type: 'info' });
        setActiveMenuId(null);
    };

    useEffect(() => {
        const handleClickOutside = () => setActiveMenuId(null);
        if (activeMenuId) window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, [activeMenuId]);


    return (
        <div className="mt-4 pt-4 border-t border-stone-100">
            <h3 className="font-medium text-[0.95rem] text-stone-900 flex items-center gap-2 mb-4">
                <AppIcon name="messages" color="#d97706" size={16} />
                Bình luận ({comments.length > 0 ? comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0) : 0})
            </h3>

            {/* Comment input */}
            <div className="mb-6 relative">
                {!user && (
                    <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg border border-stone-200">
                        <p className="text-stone-700 font-normal mb-2 text-sm">Đăng nhập để tham gia thảo luận</p>
                        <button onClick={() => navigate('login')} className="px-4 py-1.5 bg-amber-500 text-white rounded-full text-sm font-medium hover:bg-amber-600 transition-colors cursor-pointer border-none">
                            Đăng nhập ngay
                        </button>
                    </div>
                )}
                <textarea
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="Viết bình luận của bạn..."
                    className="w-full min-h-[80px] p-3.5 text-sm resize-none border border-stone-200 focus:border-amber-500 rounded-xl outline-none transition-colors"
                    disabled={!user || submitting}
                    maxLength={500}
                />
                <div className="flex justify-between items-center mt-2">
                    <span className="text-stone-400 text-xs">{newComment.length}/500</span>
                    <button
                        onClick={handleCommentSubmit}
                        disabled={!user || submitting || !newComment.trim()}
                        className="inline-flex items-center gap-1.5 bg-amber-500 text-white rounded-full px-5 py-1.5 hover:bg-amber-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-none font-medium text-sm"
                    >
                        {submitting ? 'Đang gửi...' : 'Gửi'}
                    </button>
                </div>
            </div>

            {/* Comment list */}
            <div className="flex flex-col gap-5">
                {loadingComments ? (
                    <div className="text-center py-4 text-stone-400 text-sm">Đang tải bình luận...</div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-6 bg-stone-50 rounded-xl border border-dashed border-stone-200 text-stone-500 text-sm">
                        Chưa có bình luận nào. Hãy là người đầu tiên!
                    </div>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className="flex flex-col gap-3">
                            <CommentItem
                                comment={comment}
                                user={user}
                                activeMenuId={activeMenuId}
                                setActiveMenuId={setActiveMenuId}
                                onDelete={handleCommentDelete}
                                onReport={handleCommentReport}
                                onVote={handleVote}
                                editingId={editingId}
                                setEditingId={id => {
                                    if (id === null) { setEditingId(null); setEditingTag(null); setEditingContent(''); }
                                    else { const { tag, content } = parseContent(comment.content); setEditingId(id); setEditingTag(tag); setEditingContent(content); }
                                }}
                                editingContent={editingContent}
                                setEditingContent={setEditingContent}
                                editingTag={editingTag}
                                setEditingTag={setEditingTag}
                                onUpdate={handleCommentUpdate}
                                onReplyClick={() => {
                                    const name = comment.profiles?.full_name || 'Người dùng';
                                    if (replyTo?.commentId === comment.id && replyTo.userName === name) setReplyTo(null);
                                    else { setReplyTo({ commentId: comment.id, parentId: comment.id, userName: name }); setReplyContent(''); }
                                }}
                                navigate={navigate}
                                post={post}
                                currentUserId={user?.id}
                                onAssign={() => handleAssign(comment.user_id, comment.profiles?.full_name || 'Người dùng')}
                            />

                            {/* Inline reply input under Parent Comment */}
                            <AnimatePresence>
                                {replyTo?.commentId === comment.id && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="ml-12"
                                    >
                                        <div className="bg-stone-50 rounded-xl border border-stone-200 overflow-hidden focus-within:border-amber-500 transition-colors">
                                            {replyTo.userName && (
                                                <div className="px-3 py-1.5 bg-amber-50 border-b border-stone-200 flex items-center justify-between">
                                                    <span className="text-[0.72rem] text-amber-700 font-medium flex items-center gap-1.5">
                                                        <AppIcon name="messages" size={12} />
                                                        Đang phản hồi @{replyTo.userName}
                                                    </span>
                                                    <button onClick={() => setReplyTo({ ...replyTo, userName: null })} className="text-stone-400 hover:text-stone-600 cursor-pointer border-none bg-transparent">
                                                        <AppIcon name="close" size={14} />
                                                    </button>
                                                </div>
                                            )}
                                            <textarea
                                                autoFocus
                                                value={replyContent}
                                                onChange={e => setReplyContent(e.target.value)}
                                                placeholder="Viết câu trả lời..."
                                                className="w-full min-h-[70px] p-3 text-sm resize-none outline-none bg-transparent border-none"
                                                maxLength={500}
                                            />
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-stone-400 text-xs ml-2">{replyContent.length}/500</span>
                                            <div className="flex gap-2">
                                                <button onClick={() => { setReplyTo(null); setReplyContent(''); }} className="text-stone-500 text-xs font-medium hover:text-stone-700 cursor-pointer border-none bg-transparent px-3 py-1">Hủy</button>
                                                <button onClick={handleReplySubmit} disabled={submitting || !replyContent.trim()} className="bg-amber-500 text-white rounded-full px-4 py-1 text-xs font-medium hover:bg-amber-600 disabled:opacity-50 cursor-pointer border-none">
                                                    {submitting ? 'Đang gửi...' : 'Gửi trả lời'}
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Replies */}
                            {comment.replies?.length > 0 && (
                                <div className="ml-12 flex flex-col gap-3 border-l-2 border-stone-100 pl-4">
                                    {comment.replies.map(reply => (
                                        <div key={reply.id} className="flex flex-col gap-3">
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
                                                setEditingId={id => {
                                                    if (id === null) { setEditingId(null); setEditingTag(null); setEditingContent(''); }
                                                    else { const { tag, content } = parseContent(reply.content); setEditingId(id); setEditingTag(tag); setEditingContent(content); }
                                                }}
                                                editingContent={editingContent}
                                                setEditingContent={setEditingContent}
                                                editingTag={editingTag}
                                                setEditingTag={setEditingTag}
                                                onUpdate={handleCommentUpdate}
                                                onReplyClick={() => {
                                                    setReplyTo({ commentId: reply.id, parentId: comment.id, userName: reply.profiles?.full_name || 'Người dùng' });
                                                    setReplyContent('');
                                                }}
                                                navigate={navigate}
                                                post={post}
                                                currentUserId={user?.id}
                                                onAssign={() => handleAssign(reply.user_id, reply.profiles?.full_name || 'Người dùng')}
                                            />

                                            {/* Inline reply input under Child Reply */}
                                            <AnimatePresence>
                                                {replyTo?.commentId === reply.id && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="ml-10"
                                                    >
                                                        <div className="bg-stone-50 rounded-xl border border-stone-200 overflow-hidden focus-within:border-amber-500 transition-colors">
                                                            {replyTo.userName && (
                                                                <div className="px-3 py-1.5 bg-amber-50 border-b border-stone-200 flex items-center justify-between">
                                                                    <span className="text-[0.72rem] text-amber-700 font-medium flex items-center gap-1.5">
                                                                        <AppIcon name="messages" size={12} />
                                                                        Đang phản hồi @{replyTo.userName}
                                                                    </span>
                                                                    <button onClick={() => setReplyTo({ ...replyTo, userName: null })} className="text-stone-400 hover:text-stone-600 cursor-pointer border-none bg-transparent">
                                                                        <AppIcon name="close" size={14} />
                                                                    </button>
                                                                </div>
                                                            )}
                                                            <textarea
                                                                autoFocus
                                                                value={replyContent}
                                                                onChange={e => setReplyContent(e.target.value)}
                                                                placeholder="Viết câu trả lời..."
                                                                className="w-full min-h-[70px] p-3 text-sm resize-none outline-none bg-transparent border-none"
                                                                maxLength={500}
                                                            />
                                                        </div>
                                                        <div className="flex justify-between items-center mt-2">
                                                            <span className="text-stone-400 text-xs ml-2">{replyContent.length}/500</span>
                                                            <div className="flex gap-2">
                                                                <button onClick={() => { setReplyTo(null); setReplyContent(''); }} className="text-stone-500 text-xs font-medium hover:text-stone-700 cursor-pointer border-none bg-transparent px-3 py-1">Hủy</button>
                                                                <button onClick={handleReplySubmit} disabled={submitting || !replyContent.trim()} className="bg-amber-500 text-white rounded-full px-4 py-1 text-xs font-medium hover:bg-amber-600 disabled:opacity-50 cursor-pointer border-none">
                                                                    {submitting ? 'Đang gửi...' : 'Gửi trả lời'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
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

function CommentItem({ comment, user, isReply = false, activeMenuId, setActiveMenuId, onDelete, onReport, onVote, onReplyClick, editingId, setEditingId, editingContent, setEditingContent, editingTag, setEditingTag, onUpdate, navigate, post, currentUserId, onAssign }) {
    const isDeletedUser = !comment.profiles;
    const displayName = isDeletedUser ? 'Người dùng đã xóa' : (comment.profiles.full_name || 'Người dùng');
    const avatarUrl = comment.profiles?.avatar_url;
    const initial = (displayName || 'U').charAt(0).toUpperCase();
    const isEditing = editingId === comment.id;

    const hasTag = comment.content.startsWith('@');
    let displayContent = comment.content;
    let tag = null;
    if (hasTag) {
        const parts = comment.content.split('\u200B');
        if (parts.length > 1) { tag = parts[0].substring(1); displayContent = parts[1].trim(); }
        else { const fs = comment.content.indexOf(' '); if (fs !== -1) { tag = comment.content.substring(1, fs); displayContent = comment.content.substring(fs + 1); } }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="flex gap-3 group relative"
        >
            <div
                onClick={() => !isDeletedUser && navigate && navigate('public-profile', { userId: comment.user_id })}
                className={`${isReply ? 'w-7 h-7' : 'w-9 h-9'} rounded-full flex items-center justify-center font-medium text-white text-xs shrink-0 overflow-hidden ${isDeletedUser ? 'bg-stone-300' : 'bg-amber-500 hover:opacity-85 cursor-pointer transition-opacity'}`}
                style={avatarUrl ? { backgroundImage: `url(${avatarUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
            >
                {!avatarUrl && initial}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-0.5">
                    <div>
                        <span
                            onClick={() => !isDeletedUser && navigate && navigate('public-profile', { userId: comment.user_id })}
                            className={`text-[0.85rem] font-medium ${isDeletedUser ? 'text-stone-400 italic' : 'text-stone-900 hover:text-amber-600 cursor-pointer transition-colors'}`}
                        >
                            {displayName}
                        </span>
                        <span className="text-[0.68rem] text-stone-400 ml-2">{formatDate(comment.created_at)}</span>
                    </div>
                    {user && !isDeletedUser && (
                        <div className="relative">
                            <button
                                onClick={e => { e.stopPropagation(); setActiveMenuId(activeMenuId === comment.id ? null : comment.id); }}
                                className="p-1 text-stone-300 hover:text-stone-600 rounded cursor-pointer border-none bg-transparent transition-colors"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                            </button>
                            <AnimatePresence>
                                {activeMenuId === comment.id && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 top-full mt-1 w-44 bg-white border border-stone-200 rounded-xl shadow-lg overflow-hidden z-20 py-1"
                                    >
                                        {user?.id === comment.user_id ? (
                                            <>
                                                <button onClick={() => { setEditingId(comment.id); setActiveMenuId(null); }} className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 cursor-pointer border-none bg-transparent flex items-center gap-2">
                                                    <AppIcon name="edit" size={14} />Chỉnh sửa
                                                </button>
                                                <button onClick={() => onDelete(comment.id)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer border-none bg-transparent flex items-center gap-2">
                                                    <AppIcon name="trash" size={14} />Xóa bình luận
                                                </button>
                                            </>
                                        ) : (
                                            <button onClick={onReport} className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 cursor-pointer border-none bg-transparent flex items-center gap-2">
                                                <AppIcon name="alert" size={14} />Báo cáo
                                            </button>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {isEditing ? (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1.5"
                    >
                        <div className="bg-stone-50 rounded-xl border border-stone-200 overflow-hidden focus-within:border-amber-500 transition-colors">
                            {editingTag && (
                                <div className="px-3 py-1.5 bg-amber-50 border-b border-stone-200 flex items-center justify-between">
                                    <span className="text-[0.72rem] text-amber-700 font-medium">Gắn thẻ @{editingTag}</span>
                                    <button onClick={() => setEditingTag(null)} className="text-stone-400 hover:text-stone-600 cursor-pointer border-none bg-transparent"><AppIcon name="close" size={14} /></button>
                                </div>
                            )}
                            <textarea autoFocus value={editingContent} onChange={e => setEditingContent(e.target.value)} className="w-full min-h-[70px] p-3 text-sm resize-none outline-none bg-transparent border-none" maxLength={500} />
                        </div>
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-stone-400 text-xs ml-2">{editingContent.length}/500</span>
                            <div className="flex gap-2">
                                <button onClick={() => setEditingId(null)} className="text-stone-500 text-xs font-medium hover:text-stone-700 cursor-pointer border-none bg-transparent px-3 py-1">Hủy</button>
                                <button onClick={() => onUpdate(comment.id)} disabled={!editingContent.trim()} className="bg-amber-500 text-white rounded-full px-4 py-1 text-xs font-medium hover:bg-amber-600 disabled:opacity-50 cursor-pointer border-none">Cập nhật</button>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <p className="text-[0.88rem] text-stone-700 leading-relaxed whitespace-pre-wrap">
                        {tag && <span className="text-amber-600 font-medium mr-1.5">@{tag}</span>}
                        {displayContent}
                    </p>
                )}

                {!isDeletedUser && !isEditing && (
                    <div className="flex items-center gap-3 mt-1.5">
                        <div className="flex items-center bg-stone-100 rounded-full px-2 py-0.5">
                            <button onClick={() => onVote(comment.id, 1)} className={`p-1 rounded-full border-none bg-transparent cursor-pointer flex items-center gap-1 transition-colors ${comment.userVote === 1 ? 'text-amber-600' : 'text-stone-400 hover:text-stone-600'}`}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill={comment.userVote === 1 ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
                                <span className="text-[0.65rem] font-medium">{comment.likeCount || 0}</span>
                            </button>
                            <div className="w-px h-3 bg-stone-300 mx-1" />
                            <button onClick={() => onVote(comment.id, -1)} className={`p-1 rounded-full border-none bg-transparent cursor-pointer flex items-center gap-1 transition-colors ${comment.userVote === -1 ? 'text-red-500' : 'text-stone-400 hover:text-stone-600'}`}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill={comment.userVote === -1 ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" className="rotate-180"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/></svg>
                                <span className="text-[0.65rem] font-medium">{comment.dislikeCount || 0}</span>
                            </button>
                        </div>
                        {user && (
                            <button onClick={onReplyClick} className="text-stone-500 text-[0.72rem] font-medium hover:text-amber-600 transition-colors border-none bg-transparent cursor-pointer flex items-center gap-1">
                                <AppIcon name="messages" size={12} />Phản hồi
                            </button>
                        )}

                    </div>
                )}
            </div>
        </motion.div>
    );
}
