const https = require('node:https');
const dns = require('node:dns').promises;
const net = require('node:net');
const { normalizeUrl, isExcluded, matchesDomain } = require('./offerDiscoveryPolicy');
const USER_AGENT = 'FutbolProyectDiscovery/1.0';
function isPublicIPv4(address) {
  if (net.isIP(address) !== 4) return false; // Fail closed for IPv6, including mapped IPv4.
  const [a,b,c] = address.split('.').map(Number);
  return !(a === 0 || a === 10 || a === 127 || a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) || (a === 192 && (b === 168 || b === 0 || (b === 2) || (b === 88 && c === 99))) ||
    (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100))) || (a === 203 && b === 0 && c === 113));
}
async function resolvePublic(hostname, resolver = dns.lookup, signal) {
  if (hostname === 'localhost' || /\.(localhost|local|internal|lan|home)$/.test(hostname)) throw new Error('UNSAFE_URL');
  const lookup = resolver(hostname, { all: true, family: 4 });
  let abort;
  try {
    const records = signal ? await Promise.race([lookup, new Promise((_,reject) => {
      abort = () => reject(new Error('TIME_LIMIT'));
      if(signal.aborted) return abort();
      signal.addEventListener('abort',abort,{once:true});
    })]) : await lookup;
    if (!records.length || records.some(record => !isPublicIPv4(record.address))) throw new Error('UNSAFE_URL');
    return records[0];
  } finally { if(abort) signal.removeEventListener('abort',abort); }
}
async function requestPage(value, { signal, maxBytes = 300000, excludedDomains = [] } = {}) {
  const normalized = normalizeUrl(value);
  if (isExcluded(normalized,excludedDomains)) throw new Error('EXCLUDED_DOMAIN');
  const url = new URL(normalized);
  // DNS resolution has the same abort deadline as the actual HTTP request.
  const record = await resolvePublic(url.hostname, dns.lookup, signal);
  return new Promise((resolve,reject) => {
    const req = https.request(url, {
      signal, method: 'GET', headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,text/plain,application/json', 'Accept-Encoding': 'identity' },
      // Pin the validated DNS address while retaining hostname verification and SNI.
      lookup: (_host, options, callback) => options.all
        ? callback(null,[record]) : callback(null,record.address,record.family),
    }, response => {
      const status = response.statusCode;
      if (status >= 300 && status < 400) {
        response.destroy(); return resolve({ status, location: response.headers.location, url:normalized });
      }
      const contentType = response.headers['content-type'] || '';
      if (status !== 200 || !/text\/(html|plain)|application\/(json|ld\+json)/i.test(contentType) ||
        (response.headers['content-encoding'] && response.headers['content-encoding'] !== 'identity')) {
        response.destroy(); return reject(new Error(status === 404 ? 'NOT_FOUND' : 'SOURCE_UNAVAILABLE'));
      }
      let size = 0; const chunks = [];
      response.on('data', chunk => {
        size += chunk.length;
        if (size > maxBytes) { req.destroy(new Error('PAGE_TOO_LARGE')); return; }
        chunks.push(chunk);
      });
      response.on('error',reject);
      response.on('end', () => resolve({ status, body:Buffer.concat(chunks).toString('utf8'), url:normalized }));
    });
    req.setTimeout(12000, () => req.destroy(new Error('SOURCE_TIMEOUT')));
    req.on('error',reject); req.end();
  });
}
function robotsAllowed(content, path) {
  let agents = [], rules = [], groups = [], seenRules = false;
  for (const line of content.split(/\r?\n/)) {
    const match = line.replace(/#.*/, '').trim().match(/^([\w-]+)\s*:\s*(.*)$/);
    if (!match) continue;
    const key = match[1].toLowerCase(), value = match[2].trim();
    if (key === 'user-agent') {
      if (seenRules) { groups.push({agents,rules}); agents=[]; rules=[]; seenRules=false; }
      agents.push(value.toLowerCase());
    } else if (['allow','disallow'].includes(key)) { seenRules=true; if(value) rules.push({key,value}); }
    else if (key === 'crawl-delay' && Number(value) > 1) { seenRules=true; rules.push({key:'disallow',value:'/'}); }
  }
  groups.push({agents,rules});
  const specific = groups.filter(g => g.agents.some(a => a !== '*' && USER_AGENT.toLowerCase().startsWith(a)));
  const relevant = specific.length ? specific : groups.filter(g => g.agents.includes('*'));
  const matches = relevant.flatMap(g => g.rules).filter(r => {
    const regex = r.value.replace(/[.+?^${}()|[\]\\]/g,'\\$&').replace(/\*/g,'.*').replace(/\\\$$/,'$');
    return new RegExp(`^${regex}`).test(path);
  }).sort((a,b) => b.value.length - a.value.length || (a.key === 'allow' ? -1 : 1));
  return !matches.length || matches[0].key === 'allow';
}
async function fetchOriginal(value, config, signal) {
  let url = normalizeUrl(value);
  for (let redirects = 0; redirects <= 3; redirects++) {
    const parsed = new URL(url);
    if (isExcluded(url,config.excludedDomains)) throw new Error('EXCLUDED_DOMAIN');
    if (config.sources.length && !config.sources.some(d => matchesDomain(parsed.hostname,d))) throw new Error('SOURCE_NOT_APPROVED');
    const options = { signal:AbortSignal.any([signal,AbortSignal.timeout(15000)]), excludedDomains:config.excludedDomains };
    try {
      const robots = await requestPage(`${parsed.origin}/robots.txt`, {...options,maxBytes:64000});
      if (robots.status !== 200 || !robotsAllowed(robots.body,parsed.pathname+parsed.search)) throw new Error('ROBOTS_RESTRICTED');
    } catch (error) { if(error.message !== 'NOT_FOUND') throw error; }
    const result = await requestPage(url,options);
    if (result.status === 200) {
      if (/captcha|cloudflare challenge|sign in to continue|log in to continue|access denied|enable javascript and cookies/i.test(result.body)) throw new Error('ACCESS_RESTRICTED');
      return result;
    }
    if (!result.location) throw new Error('SOURCE_UNAVAILABLE');
    url = normalizeUrl(new URL(result.location,url).href);
  }
  throw new Error('REDIRECT_LIMIT');
}
function pageText(html) {
  // Keep JobPosting JSON-LD as data; discard executable scripts and markup.
  const jsonld = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
  const text = html.replace(/<(script|style|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi,' ')
    .replace(/<!--[^]*?-->/g,' ').replace(/<[^>]*>/g,' ')
    .replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'")
    .replace(/\s+/g,' ').trim();
  return [...jsonld,text].join('\n').slice(0,12000);
}
module.exports = { isPublicIPv4, resolvePublic, requestPage, fetchOriginal, robotsAllowed, pageText };
