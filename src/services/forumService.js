import { supabase } from '../lib/supabase.js';

// ─── POSTS ───────────────────────────────────────────────────────────────────

/**
 * Fetch paginated forum posts (only published, or own drafts)
 * @param {object} opts - { page, limit, userId, authorId, category }
 */
export const getForumPosts = async ({ page = 0, limit = 10, userId = null, authorId = null, status = null, search = null, category = null } = {}) => {
    try {
        let query = supabase
            .from('forum_posts')
            .select(`
                *,
                profiles!user_id(id, full_name, avatar_url, role),
                assignee:profiles!assignee_id(id, full_name, avatar_url, phone),
                forum_post_images(id, url, public_id, order_index),
                forum_post_likes(user_id),
                rooms(id, title, price_monthly, address, district, city, slug, media_contact, room_type),
                forum_comments(id)
            `, { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(page * limit, (page + 1) * limit - 1);

        if (authorId) {
            query = query.eq('user_id', authorId);
        }
        if (status) {
            query = query.eq('status', status);
        } else if (!authorId || authorId !== userId) {
            // Public feed: only published posts
            query = query.eq('status', 'published');
        }
        if (search) {
            query = query.ilike('content', `%${search}%`);
        }
        if (category) {
            query = query.eq('category', category);
        }

        const { data, error, count } = await query;
        if (error) throw error;

        const processed = (data || []).map(post => ({
            ...post,
            images: (post.forum_post_images || []).sort((a, b) => a.order_index - b.order_index),
            likeCount: post.forum_post_likes?.length || 0,
            commentCount: post.forum_comments?.length || 0,
            userLiked: userId ? (post.forum_post_likes || []).some(l => l.user_id === userId) : false,
            profile: post.profiles,
            attachedRoom: post.rooms || null,
        }));

        return { data: processed, count, error: null };
    } catch (err) {
        console.error('Error fetching forum posts:', err);
        return { data: null, count: 0, error: err };
    }
};

/**
 * Create a new forum post
 */
export const createForumPost = async ({ userId, content, status = 'published', roomId = null, images = [], category = 'general', assigneeId = null }) => {
    try {
        const { data: post, error: postError } = await supabase
            .from('forum_posts')
            .insert([{ user_id: userId, content: content.trim(), status, room_id: roomId || null, category, assignee_id: assigneeId || null }])
            .select()
            .single();

        if (postError) throw postError;

        // Insert images
        if (images.length > 0) {
            const imageRows = images.map((img, idx) => ({
                post_id: post.id,
                url: img.url,
                public_id: img.public_id || null,
                order_index: idx,
            }));
            const { error: imgError } = await supabase.from('forum_post_images').insert(imageRows);
            if (imgError) throw imgError;
        }

        return { data: post, error: null };
    } catch (err) {
        console.error('Error creating forum post:', err);
        return { data: null, error: err };
    }
};

/**
 * Update an existing forum post
 */
export const updateForumPost = async ({ postId, content, status, roomId, images = [], deletedImageIds = [], category, assigneeId }) => {
    try {
        const updatePayload = {};
        if (content !== undefined) updatePayload.content = content.trim();
        if (status !== undefined) updatePayload.status = status;
        if (roomId !== undefined) updatePayload.room_id = roomId || null;
        if (category !== undefined) updatePayload.category = category;
        if (assigneeId !== undefined) updatePayload.assignee_id = assigneeId;
        updatePayload.updated_at = new Date().toISOString();

        const { error: postError } = await supabase
            .from('forum_posts')
            .update(updatePayload)
            .eq('id', postId);

        if (postError) throw postError;

        // Delete removed images
        if (deletedImageIds.length > 0) {
            await supabase.from('forum_post_images').delete().in('id', deletedImageIds);
        }

        // Insert new images
        if (images.length > 0) {
            const imageRows = images.map((img, idx) => ({
                post_id: postId,
                url: img.url,
                public_id: img.public_id || null,
                order_index: idx,
            }));
            await supabase.from('forum_post_images').insert(imageRows);
        }

        return { error: null };
    } catch (err) {
        console.error('Error updating forum post:', err);
        return { error: err };
    }
};

/**
 * Delete a forum post
 */
export const deleteForumPost = async (postId) => {
    try {
        const { error } = await supabase.from('forum_posts').delete().eq('id', postId);
        return { error };
    } catch (err) {
        console.error('Error deleting forum post:', err);
        return { error: err };
    }
};

// ─── LIKES ───────────────────────────────────────────────────────────────────

/**
 * Toggle like on a post
 */
export const togglePostLike = async (postId, userId, currentlyLiked) => {
    try {
        if (currentlyLiked) {
            const { error } = await supabase
                .from('forum_post_likes')
                .delete()
                .eq('post_id', postId)
                .eq('user_id', userId);
            return { error };
        } else {
            const { error } = await supabase
                .from('forum_post_likes')
                .insert([{ post_id: postId, user_id: userId }]);
            return { error };
        }
    } catch (err) {
        console.error('Error toggling post like:', err);
        return { error: err };
    }
};

// ─── COMMENTS ────────────────────────────────────────────────────────────────

/**
 * Fetch comments for a forum post (structured as parent/replies)
 */
export const getForumComments = async (postId, userId = null) => {
    try {
        const { data, error } = await supabase
            .from('forum_comments')
            .select(`
                *,
                profiles!user_id(full_name, avatar_url),
                forum_comment_votes(user_id, vote_type)
            `)
            .eq('post_id', postId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        if (!data) return { data: [], error: null };

        const processed = data.map(comment => {
            const votes = comment.forum_comment_votes || [];
            const likeCount = votes.filter(v => v.vote_type === 1).length;
            const dislikeCount = votes.filter(v => v.vote_type === -1).length;
            const userVote = userId ? votes.find(v => v.user_id === userId)?.vote_type ?? null : null;
            const profileData = comment.profiles || comment['profiles!user_id'];
            return { ...comment, profiles: profileData, likeCount, dislikeCount, userVote };
        });

        const parents = processed.filter(c => !c.parent_id);
        const children = processed.filter(c => c.parent_id);
        const structured = parents
            .map(p => ({ ...p, replies: children.filter(c => c.parent_id === p.id) }))
            .reverse();

        return { data: structured, error: null };
    } catch (err) {
        console.error('Error fetching forum comments:', err);
        return { data: null, error: err };
    }
};

/**
 * Create a forum comment or reply
 */
export const createForumComment = async ({ postId, userId, content, parentId = null }) => {
    try {
        const payload = { post_id: postId, user_id: userId, content: content.trim() };
        if (parentId) payload.parent_id = parentId;

        const { data, error } = await supabase
            .from('forum_comments')
            .insert([payload])
            .select('*, profiles!user_id(full_name, avatar_url)')
            .single();

        return { data, error };
    } catch (err) {
        console.error('Error creating forum comment:', err);
        return { data: null, error: err };
    }
};

/**
 * Update a forum comment
 */
export const updateForumComment = async (commentId, content) => {
    try {
        const { data, error } = await supabase
            .from('forum_comments')
            .update({ content: content.trim(), updated_at: new Date().toISOString() })
            .eq('id', commentId)
            .select();
        return { data, error };
    } catch (err) {
        console.error('Error updating forum comment:', err);
        return { data: null, error: err };
    }
};

/**
 * Delete a forum comment
 */
export const deleteForumComment = async (commentId) => {
    try {
        const { error } = await supabase.from('forum_comments').delete().eq('id', commentId);
        return { error };
    } catch (err) {
        console.error('Error deleting forum comment:', err);
        return { error: err };
    }
};

/**
 * Vote on a forum comment (like/dislike, toggle)
 */
export const voteForumComment = async (commentId, userId, voteType, existingVote) => {
    try {
        if (existingVote === voteType) {
            const { error } = await supabase
                .from('forum_comment_votes')
                .delete()
                .eq('user_id', userId)
                .eq('comment_id', commentId);
            return { error };
        } else {
            const { error } = await supabase
                .from('forum_comment_votes')
                .upsert({ user_id: userId, comment_id: commentId, vote_type: voteType });
            return { error };
        }
    } catch (err) {
        console.error('Error voting forum comment:', err);
        return { error: err };
    }
};

// ─── REPORTS ─────────────────────────────────────────────────────────────────

/**
 * Report a forum post (stored in DB, UI shows mock modal)
 */
export const reportForumPost = async (postId, userId, reason = '') => {
    try {
        const { error } = await supabase
            .from('forum_reports')
            .upsert([{ post_id: postId, user_id: userId, reason }]);
        return { error };
    } catch (err) {
        console.error('Error reporting post:', err);
        return { error: err };
    }
};

/**
 * Fetch comments made by user on other users' posts
 */
export const getUserCommentsOnOthersPosts = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('forum_comments')
            .select(`
                *,
                forum_posts!post_id (
                    *,
                    profiles!user_id(id, full_name, avatar_url, role),
                    forum_post_images(id, url, public_id, order_index),
                    forum_post_likes(user_id),
                    rooms(id, title, price_monthly, address, district, city, slug, media_contact, room_type),
                    forum_comments(id)
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const processed = (data || [])
            .filter(comment => comment.forum_posts && comment.forum_posts.user_id !== userId)
            .map(comment => {
                const post = comment.forum_posts;
                const processedPost = {
                    ...post,
                    images: (post.forum_post_images || []).sort((a, b) => a.order_index - b.order_index),
                    likeCount: post.forum_post_likes?.length || 0,
                    commentCount: post.forum_comments?.length || 0,
                    userLiked: userId ? (post.forum_post_likes || []).some(l => l.user_id === userId) : false,
                    profile: post.profiles,
                    attachedRoom: post.rooms || null,
                };
                return {
                    ...comment,
                    post: processedPost
                };
            });

        return { data: processed, error: null };
    } catch (err) {
        console.error('Error fetching user comments on others posts:', err);
        return { data: null, error: err };
    }
};

// ─── LANDLORD REQUESTS ────────────────────────────────────────────────────────

/**
 * Room Requests API
 */

export const createRoomRequest = async ({ postId, requesterId, type }) => {
    try {
        const { data, error } = await supabase
            .from('room_requests')
            .insert({
                post_id: postId,
                requester_id: requesterId,
                type: type,
                status: 'pending_tenant'
            })
            .select()
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (err) {
        console.error('Error creating room request:', err);
        return { data: null, error: err };
    }
};

export const updateRoomRequestStatus = async (requestId, status) => {
    try {
        const { data, error } = await supabase
            .from('room_requests')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', requestId)
            .select()
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (err) {
        console.error('Error updating room request status:', err);
        return { data: null, error: err };
    }
};

export const getRoomRequestsForTenant = async (tenantId) => {
    try {
        const { data, error } = await supabase
            .from('room_requests')
            .select(`
                *,
                requester:profiles!requester_id(id, full_name, avatar_url, phone),
                post:forum_posts!inner(
                    id, category, content, status, room_id,
                    rooms(id, title, slug, user_id, price_monthly, address)
                )
            `)
            .eq('forum_posts.user_id', tenantId)
            .eq('status', 'pending_tenant')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { data: data || [], error: null };
    } catch (err) {
        console.error('Error fetching room requests for tenant:', err);
        return { data: [], error: err };
    }
};

export const getRoomRequestsForLandlord = async (landlordId) => {
    try {
        const { data, error } = await supabase
            .from('room_requests')
            .select(`
                *,
                requester:profiles!requester_id(id, full_name, avatar_url, phone),
                post:forum_posts!inner(
                    id, category, content, status, room_id, user_id,
                    tenant:profiles!user_id(id, full_name, avatar_url, phone),
                    rooms!inner(id, title, slug, user_id, price_monthly, address)
                )
            `)
            .eq('forum_posts.rooms.user_id', landlordId)
            .eq('status', 'pending_landlord')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { data: data || [], error: null };
    } catch (err) {
        console.error('Error fetching room requests for landlord:', err);
        return { data: [], error: err };
    }
};

