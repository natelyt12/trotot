import { supabase } from '../lib/supabase.js';

/**
 * Fetches all comments for a given room listing and structures them
 * @param {string} roomId 
 * @param {string} [userId] 
 * @returns {Promise<{data: any, error: any}>}
 */
export const getCommentsByRoomId = async (roomId, userId) => {
    try {
        const { data, error } = await supabase
            .from('comments')
            .select(`
                *,
                profiles!user_id(full_name, avatar_url),
                comment_votes(user_id, vote_type)
            `)
            .eq('room_id', roomId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        if (!data) return { data: [], error: null };

        // Process votes and profile structure
        const processed = data.map((comment) => {
            const votes = comment.comment_votes || [];
            const likeCount = votes.filter((v) => v.vote_type === 1).length;
            const dislikeCount = votes.filter((v) => v.vote_type === -1).length;
            const userVote = userId ? votes.find((v) => v.user_id === userId)?.vote_type : null;
            const profileData = comment.profiles || comment["profiles!user_id"];
            return { ...comment, profiles: profileData, likeCount, dislikeCount, userVote };
        });

        // Structure into nested hierarchy (parent -> replies)
        const parents = processed.filter((c) => !c.parent_id);
        const children = processed.filter((c) => c.parent_id);
        const structured = parents
            .map((p) => ({
                ...p,
                replies: children.filter((c) => c.parent_id === p.id),
            }))
            .reverse();

        return { data: structured, error: null };
    } catch (err) {
        console.error('Error fetching structured comments:', err);
        return { data: null, error: err };
    }
};

/**
 * Adds a new comment or reply to a room listing
 * @param {object} payload 
 * @returns {Promise<{data: any, error: any}>}
 */
export const createComment = async ({ roomId, userId, content, parentId = null }) => {
    try {
        const insertPayload = {
            room_id: roomId,
            user_id: userId,
            content: content.trim()
        };
        if (parentId) {
            insertPayload.parent_id = parentId;
        }

        const { data, error } = await supabase
            .from('comments')
            .insert([insertPayload])
            .select('*, profiles!user_id(full_name, avatar_url)')
            .single();

        return { data, error };
    } catch (err) {
        console.error('Error creating comment:', err);
        return { data: null, error: err };
    }
};

/**
 * Updates an existing comment's content
 * @param {string} commentId 
 * @param {string} content 
 * @returns {Promise<{data: any, error: any}>}
 */
export const updateComment = async (commentId, content) => {
    try {
        const { data, error } = await supabase
            .from('comments')
            .update({ content: content.trim() })
            .eq('id', commentId)
            .select();
        return { data, error };
    } catch (err) {
        console.error('Error updating comment:', err);
        return { data: null, error: err };
    }
};

/**
 * Deletes a comment
 * @param {string} commentId 
 * @returns {Promise<{error: any}>}
 */
export const deleteComment = async (commentId) => {
    try {
        const { error } = await supabase
            .from('comments')
            .delete()
            .eq('id', commentId);
        return { error };
    } catch (err) {
        console.error('Error deleting comment:', err);
        return { error: err };
    }
};

/**
 * Submits a vote (like/dislike) on a comment, handling toggle
 * @param {string} commentId 
 * @param {string} userId 
 * @param {number} voteType - 1 for like, -1 for dislike
 * @param {number|null} existingVote 
 * @returns {Promise<{error: any}>}
 */
export const voteComment = async (commentId, userId, voteType, existingVote) => {
    try {
        if (existingVote === voteType) {
            const { error } = await supabase
                .from('comment_votes')
                .delete()
                .eq('user_id', userId)
                .eq('comment_id', commentId);
            return { error };
        } else {
            const { error } = await supabase
                .from('comment_votes')
                .upsert({ 
                    user_id: userId, 
                    comment_id: commentId, 
                    vote_type: voteType 
                });
            return { error };
        }
    } catch (err) {
        console.error('Error voting on comment:', err);
        return { error: err };
    }
};

/**
 * Fetches all comments authored by a user with nested room and profile details
 * @param {string} userId
 * @returns {Promise<{data: any, error: any}>}
 */
export const getUserCommentedRooms = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('comments')
            .select('*, rooms(*, profiles(*))')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        return { data, error };
    } catch (err) {
        console.error('Error fetching user commented rooms:', err);
        return { data: null, error: err };
    }
};

