const https = require('https');
const fetch = (url) => new Promise((res, rej) => {
  https.get(url, (r) => {
    let data = '';
    r.on('data', (c) => data += c);
    r.on('end', () => res(data));
  }).on('error', rej);
});

(async () => {
  try {
    for (const code of [425, 418, 423]) {
      const html = await fetch(`https://react.dev/errors/${code}`);
      const main = html.match(/<main[\s\S]*?<\/main>/i)?.[0] || html;
      const stripped = main.replace(/<[^>]+>/g, '\n').replace(/\n+/g, '\n').trim();
      console.log('---', code, '---');
      console.log(stripped.slice(0, 1200));
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
