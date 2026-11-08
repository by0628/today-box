import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(here, '..', 'data', 'daily.json');

const CODES = [
  ['USD', '美元'],
  ['EUR', '欧元'],
  ['JPY', '日元'],
  ['GBP', '英镑'],
  ['HKD', '港币']
];

async function fetchRepos() {
  const since = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const url =
    'https://api.github.com/search/repositories?q=created:%3E' + since +
    '&sort=stars&order=desc&per_page=10';
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'today-box' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = 'Bearer ' + process.env.GITHUB_TOKEN;

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error('GitHub 返回 ' + res.status);
  const json = await res.json();
  return json.items.map((it) => ({
    name: it.full_name,
    url: it.html_url,
    stars: it.stargazers_count,
    desc: it.description || ''
  }));
}

async function fetchRates() {
  const res = await fetch('https://open.er-api.com/v6/latest/CNY');
  if (!res.ok) throw new Error('汇率返回 ' + res.status);
  const json = await res.json();
  if (json.result !== 'success') throw new Error('汇率数据不对：' + json.result);

  const items = CODES
    .filter(([code]) => json.rates[code] != null)
    .map(([code, name]) => ({ code, name, value: json.rates[code] }));

  return {
    date: (json.time_last_update_utc || '').slice(0, 16) || new Date().toISOString().slice(0, 10),
    base: 'CNY',
    items
  };
}

let old = {};
try {
  old = JSON.parse(await readFile(OUT, 'utf8'));
} catch {}

let repos = null;
let rates = null;

try {
  repos = await fetchRepos();
  console.log('GitHub：拿到 ' + repos.length + ' 个项目');
} catch (e) {
  console.warn('GitHub 没拿到：' + e.message);
}

try {
  rates = await fetchRates();
  console.log('汇率：拿到 ' + rates.items.length + ' 个货币');
} catch (e) {
  console.warn('汇率没拿到：' + e.message);
}

if (!repos && !rates) {
  console.error('两样都没拿到，保留旧数据不动。');
  process.exit(1);
}

const data = {
  sample: false,
  updatedAt: new Date().toISOString(),
  repos: repos || old.repos || [],
  rates: rates || old.rates || null
};

await mkdir(dirname(OUT), { recursive: true });
await writeFile(OUT, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log('写好了：' + OUT);
