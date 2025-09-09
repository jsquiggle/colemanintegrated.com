document.addEventListener('DOMContentLoaded', () => {
  const yEl = document.getElementById('year');
  if (yEl) yEl.textContent = new Date().getFullYear();
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  if (toggle && nav) toggle.addEventListener('click', () => nav.classList.toggle('open'));
});

// === Cyber Feeds Loader (3 sources) ===
function repoBasePath(){
  const path = window.location.pathname.replace(/index\.html$/,'');
  const parts = path.split('/').filter(Boolean);
  if (location.hostname.endsWith('github.io') && parts.length >= 1) return '/' + parts[0] + '/';
  if (parts.length >= 2) return '/' + parts[0] + '/' + parts[1] + '/';
  return '/';
}
function pathOptions(name){
  const base = repoBasePath();
  return [ base + 'feeds/' + name + '.json', base + 'docs/feeds/' + name + '.json', '/feeds/' + name + '.json' ];
}
async function tryFetchJson(paths){
  const arr = Array.isArray(paths) ? paths : [paths];
  let lastErr;
  for (const p of arr){
    try{
      const res = await fetch(p, {cache:'no-store'});
      if (res.ok) return await res.json();
      lastErr = new Error('HTTP ' + res.status);
    }catch(e){ lastErr = e; }
  }
  throw lastErr || new Error('Fetch failed');
}
function normalizeItems(data, maxItems){
  const items = (data && data.items) ? data.items : [];
  return items.slice(0, maxItems).map(it => ({
    title: it.title || it.name || 'Untitled',
    url: it.link || it.url || '#',
    date: it.pubDate || it.date || it.published || ''
  }));
}
async function populateList(data, mountId, maxItems){
  const el = document.getElementById(mountId);
  if (!el) return;
  const list = normalizeItems(data, maxItems || 6);
  const ul = el.querySelector('.feed-list');
  if (!ul) return;
  ul.innerHTML = '';
  if (!list.length){ ul.innerHTML = '<li>No recent items.</li>'; return; }
  list.forEach(it => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = it.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
    a.textContent = it.title;
    li.appendChild(a);
    ul.appendChild(li);
  });
}
function setUpdated(data){
  const span = document.querySelector('.feeds-updated');
  if (span && data && data.updated){
    span.textContent = 'Updated ' + new Date(data.updated).toLocaleString();
  }
}
(async function initFeeds(){
  const feeds = [
    {name:'krebs', el:'krebs-feed'},
    {name:'bleeping', el:'bleeping-feed'},
    {name:'hackernews', el:'hackernews-feed'}
  ];
  for (const f of feeds){
    const root = document.getElementById(f.el);
    if (!root) continue;
    const ul = root.querySelector('.feed-list');
    if (ul) ul.innerHTML = '<li>Loading…</li>';
    try{
      const data = await tryFetchJson(pathOptions(f.name));
      await populateList(data, f.el, 6);
      if (f.name === 'krebs') setUpdated(data);
    }catch(e){
      if (ul) ul.innerHTML = '<li>Unable to load feed.</li>';
      console.error('[feeds]', f.name, e);
    }
  }
})();
