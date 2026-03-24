import fetch from 'node-fetch';

async function run() {
  console.log("Testing POST /api/pc-parts/scrape-link");
  try {
    const res = await fetch('http://localhost:5000/api/pc-parts/scrape-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: 'https://amazon.com' })
    });
    console.log(`Status: ${res.status}`);
    const text = await res.text();
    console.log(`Body: ${text}`);
  } catch (e) {
    console.error(e);
  }
}
run();