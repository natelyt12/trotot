const urls = [
  'https://res.cloudinary.com/natelytenvi/image/upload/v1781104884/forum_posts/rkcekov9ya41my1ema8a.jpg',
  'https://res.cloudinary.com/natelytenvi/image/upload/v1781024788/myyhyviao3rtgfmv3r4k.jpg'
];

async function check() {
  for (const url of urls) {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      console.log(`URL: ${url}`);
      console.log(`Status: ${res.status} ${res.statusText}\n`);
    } catch (err) {
      console.error(`Error fetching ${url}:`, err.message);
    }
  }
}

check();
