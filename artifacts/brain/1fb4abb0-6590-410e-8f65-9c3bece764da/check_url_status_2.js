async function check() {
  const url = 'https://res.cloudinary.com/natelytenvi/image/upload/v1781105388/jjbhsc4x9u9uxagzd7co.jpg';
  try {
    const res = await fetch(url, { method: 'HEAD' });
    console.log(`URL: ${url}`);
    console.log(`Status: ${res.status} ${res.statusText}\n`);
  } catch (err) {
    console.error(`Error fetching ${url}:`, err.message);
  }
}
check();
