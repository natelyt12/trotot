import { supabase } from '../lib/supabase';

/**
 * Fetches the user profile by user ID
 * @param {string} userId 
 * @returns {Promise<{data: any, error: any}>}
 */
export const getUserProfile = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        return { data, error };
    } catch (err) {
        console.error('Error fetching user profile:', err);
        return { data: null, error: err };
    }
};

/**
 * Updates the profile record in the database
 * @param {string} userId 
 * @param {object} profileUpdates - Fields to update (e.g. full_name, phone, role, avatar_url)
 * @returns {Promise<{data: any, error: any}>}
 */
export const updateUserProfile = async (userId, profileUpdates) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .update(profileUpdates)
            .eq('id', userId);
        return { data, error };
    } catch (err) {
        console.error('Error updating user profile:', err);
        return { data: null, error: err };
    }
};

/**
 * Updates the supabase auth user metadata/settings
 * @param {object} authUpdates - Fields like data (full_name, role, avatar_url), password, email, etc.
 * @returns {Promise<{data: any, error: any}>}
 */
export const updateUserAuth = async (authUpdates) => {
    try {
        const { data, error } = await supabase.auth.updateUser(authUpdates);
        return { data, error };
    } catch (err) {
        console.error('Error updating user auth:', err);
        return { data: null, error: err };
    }
};

/**
 * Uploads an avatar image file to Supabase storage
 * @param {string} filePath 
 * @param {File|Blob} file 
 * @returns {Promise<{data: any, error: any}>}
 */
export const uploadAvatar = async (filePath, file) => {
    try {
        const { data, error } = await supabase.storage
            .from('user_avatar')
            .upload(filePath, file, { upsert: true });
        return { data, error };
    } catch (err) {
        console.error('Error uploading avatar:', err);
        return { data: null, error: err };
    }
};

/**
 * Gets the public URL of an avatar image stored in Supabase storage
 * @param {string} filePath 
 * @returns {string}
 */
export const getAvatarPublicUrl = (filePath) => {
    const { data } = supabase.storage
        .from('user_avatar')
        .getPublicUrl(filePath);
    return data?.publicUrl || '';
};

/**
 * Removes an avatar image file from Supabase storage
 * @param {string} filePath 
 * @returns {Promise<{data: any, error: any}>}
 */
export const removeAvatar = async (filePath) => {
    try {
        const { data, error } = await supabase.storage
            .from('user_avatar')
            .remove([filePath]);
        return { data, error };
    } catch (err) {
        console.error('Error removing avatar:', err);
        return { data: null, error: err };
    }
};

/**
 * Deletes the user account by calling RPC 'delete_user_account'
 * @returns {Promise<{error: any}>}
 */
export const deleteUserAccount = async () => {
    try {
        const { error } = await supabase.rpc('delete_user_account');
        return { error };
    } catch (err) {
        console.error('Error invoking delete_user_account RPC:', err);
        return { error: err };
    }
};

