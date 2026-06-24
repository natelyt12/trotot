import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function testInsertProfile() {
    const userId = "ab06c990-3fab-40e2-8c1b-cd0d9fbf6b50";
    
    // We would need to be authenticated as this user to test RLS.
    // But let's see if anon can insert (probably not).
    const { data, error } = await supabase.from('profiles').insert([{ id: userId, full_name: 'Test', role: 'tenant' }]);
    console.log(error);
}

testInsertProfile();
