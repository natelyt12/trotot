import { supabase } from '../lib/supabase';

/**
 * Signs in a user with email and password
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{data: any, error: any}>}
 */
export const signIn = async (email, password) => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { data, error };
    } catch (err) {
        console.error('Error in signIn service:', err);
        return { data: null, error: err };
    }
};

/**
 * Signs up a new user
 * @param {string} email 
 * @param {string} password 
 * @param {object} metadata - Metadata such as full_name, phone, role
 * @returns {Promise<{data: any, error: any}>}
 */
export const signUp = async (email, password, metadata = {}) => {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata,
            },
        });
        return { data, error };
    } catch (err) {
        console.error('Error in signUp service:', err);
        return { data: null, error: err };
    }
};

/**
 * Signs out the current user
 * @returns {Promise<{error: any}>}
 */
export const signOut = async () => {
    try {
        const { error } = await supabase.auth.signOut();
        return { error };
    } catch (err) {
        console.error('Error in signOut service:', err);
        return { error: err };
    }
};

/**
 * Checks if a full_name already exists in the profiles table
 * @param {string} fullName 
 * @returns {Promise<boolean>}
 */
export const checkNameExists = async (fullName) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('id')
            .eq('full_name', fullName.trim())
            .maybeSingle();

        if (error) throw error;
        return !!data;
    } catch (err) {
        console.error('Error checking name existence:', err);
        return false;
    }
};

/**
 * Checks if a phone number already exists in the profiles table
 * @param {string} phone 
 * @returns {Promise<boolean>}
 */
export const checkPhoneExists = async (phone) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('id')
            .eq('phone', phone.trim())
            .maybeSingle();

        if (error) throw error;
        return !!data;
    } catch (err) {
        console.error('Error checking phone existence:', err);
        return false;
    }
};
