import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oubsfiyeumuqczbmlnfr.supabase.co';
const supabaseKey = 'sb_publishable_b49o71RPoG2-41fvk0sj9A_LH3Te_xd';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUrls() {
  console.log('--- Fetching Room Images ---');
  const { data: rooms, error: roomError } = await supabase
    .from('rooms')
    .select('id, title, media_contact')
    .order('created_at', { ascending: false })
    .limit(10);

  if (roomError) {
    console.error('Room fetch error:', roomError);
  } else {
    rooms.forEach(room => {
      console.log(`Room: ${room.title}`);
      console.log('Images:', JSON.stringify(room.media_contact?.images || []));
    });
  }

  console.log('\n--- Fetching Forum Post Images ---');
  const { data: postImages, error: postErr } = await supabase
    .from('forum_post_images')
    .select('id, post_id, url')
    .order('created_at', { ascending: false })
    .limit(10);

  if (postErr) {
    console.error('Forum image fetch error:', postErr);
  } else {
    postImages.forEach(img => {
      console.log(`Post ID: ${img.post_id}, URL: ${img.url}`);
    });
  }
}

checkUrls();
