document.addEventListener('DOMContentLoaded', () => {
  const yEl = document.getElementById('year');
  if (yEl) yEl.textContent = new Date().getFullYear();
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  if (toggle && nav) toggle.addEventListener('click', () => nav.classList.toggle('open'));
});

// === Cyber Feeds Loader (GitHub Pages: local JSON) ===
function repoBasePath(){
  const path = window.location.pathname.replace(/index\.html$/,''); 
  const parts = path.split('/').filter(Boolean);
  if (location.hostname.endsWith('github.io') && parts.length >= 1) return '/' + parts[0] + '/';
  if (parts.length >= 2) return '/' + parts[0] + '/' + parts[1] + '/';
  return '/';
}
async function tryFetchJson(paths){
  for (const p of paths){
    try{ const r = await fetch(p, {cache:'no-store'}); if (r.ok) return r.json(); }catch(e){}
  }
  throw new Error('All JSON paths failed: ' + paths.join(', '));
}
async function populateList(json, elementId, maxItems=6){
  const ul = document.querySelector(`#${elementId} .feed-list`);
  if (!ul) return;
  ul.innerHTML = "";
  (json.items || []).slice(0, maxItems).forEach(it => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = it.link || '#'; a.target = '_blank'; a.rel = 'noopener';
    a.textContent = it.title || 'Untitled';
    li.appendChild(a); ul.appendChild(li);
  });
  if (!ul.children.length) ul.innerHTML = "<li>No recent items.</li>";
}
function setUpdated(json){
  const el = document.getElementById('feeds-updated');
  if (el && json && json.updated){ el.textContent = 'Updated ' + new Date(json.updated).toLocaleString(); }
}
document.addEventListener('DOMContentLoaded', async () => {
  const base = repoBasePath();
  const pathOptions = (name)=>[
    `${base}feeds/${name}.json`, `feeds/${name}.json`,
    `${base}docs/feeds/${name}.json`, `docs/feeds/${name}.json`
  ];
  const feeds = [
    {name:'krebs', el:'krebs-feed'},
    {name:'bleeping', el:'bleeping-feed'},
    {name:'hackernews', el:'hackernews-feed'}
  ];
  for (const f of feeds){
    const ul = document.querySelector(`#${f.el} .feed-list`); if (ul) ul.innerHTML = "<li>Loading…</li>";
    try{
      const data = await tryFetchJson(pathOptions(f.name));
      await populateList(data, f.el, 6);
      if (f.name === 'krebs') setUpdated(data);
    }catch(e){
      if (ul) ul.innerHTML = "<li>Unable to load feed.</li>";
      console.error('[feeds]', f.name, e);
    }
  }
});
