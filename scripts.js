document.addEventListener('DOMContentLoaded', () => {
  const yEl = document.getElementById('year');
  if (yEl) yEl.textContent = new Date().getFullYear();
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  if (toggle && nav) toggle.addEventListener('click', () => nav.classList.toggle('open'));
});

// === Cyber Feeds Loader (GitHub Pages robust paths) ===
function repoBasePath(){
  const baseEl = document.querySelector('base[href]');
  if (baseEl) {
    const b = baseEl.getAttribute('href'); return b.endsWith('/')? b : (b + '/');
  }
  const path = window.location.pathname;
  const parts = path.split('/').filter(Boolean);
  // Project pages: /<user>/<repo>/...
  if (parts.length >= 2) return '/' + parts[0] + '/' + parts[1] + '/';
  // User/Org pages: root
  return '/';
}
async function tryFetch(paths){
  for (const p of paths){
    try{
      const res = await fetch(p, { cache: "no-store" });
      if (res.ok) return res.json();
    }catch(_){}
  }
  throw new Error("All feed paths failed " + paths.join(", "));
}
async function populateList(json, elementId, maxItems=5){
  const ul = document.querySelector(`#${elementId} .feed-list`);
  if (!ul) return;
  ul.innerHTML = "";
  (json.items || []).slice(0, maxItems).forEach(it => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = it.link || "#"; a.target = "_blank"; a.rel = "noopener";
    a.textContent = it.title;
    li.appendChild(a); ul.appendChild(li);
  });
  if (!ul.children.length) ul.innerHTML = "<li>No recent items.</li>";
}
function setUpdatedStamp(json){
  const el = document.getElementById("feeds-updated");
  if (el && json && json.updated){
    el.textContent = "Updated " + new Date(json.updated).toLocaleString();
  }
}
document.addEventListener("DOMContentLoaded", async () => {
  const base = repoBasePath();
  const candidates = (name)=>[
    `${base}feeds/${name}.json`,
    `feeds/${name}.json`,
    `${base}docs/feeds/${name}.json`,
    `docs/feeds/${name}.json`
  ];
  const feeds = [
    {name:"cisa", el:"cisa-feed"},
    {name:"cert", el:"cert-feed"},
    {name:"hackernews", el:"hackernews-feed"}
  ];
  for (const f of feeds){
    const ul = document.querySelector(`#${f.el} .feed-list`);
    if (ul) ul.innerHTML = "<li>Loading…</li>";
    try{
      const data = await tryFetch(candidates(f.name));
      await populateList(data, f.el, 5);
      if (f.name === "cisa") setUpdatedStamp(data);
    }catch(e){
      if (ul) ul.innerHTML = "<li>Unable to load feed.</li>";
      console.error("[feeds]", f.name, e);
    }
  }
});
