document.addEventListener('DOMContentLoaded', () => {
  const yEl = document.getElementById('year');
  if (yEl) yEl.textContent = new Date().getFullYear();
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  if (toggle && nav) toggle.addEventListener('click', () => nav.classList.toggle('open'));
});


// === Cyber Feeds Loader (GitHub Pages: static JSON) ===
async function loadJson(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
}
async function populateList(json, elementId, maxItems=5) {
  const ul = document.querySelector(`#${elementId} .feed-list`);
  if (!ul) return;
  ul.innerHTML = "";
  (json.items || []).slice(0, maxItems).forEach(item => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = item.link || "#";
    a.target = "_blank"; a.rel = "noopener";
    a.textContent = item.title;
    li.appendChild(a); ul.appendChild(li);
  });
  if (!ul.children.length) ul.innerHTML = "<li>No recent items.</li>";
}
document.addEventListener("DOMContentLoaded", async () => {
  const feeds = [
    { path: "feeds/cisa.json", el: "cisa-feed" },
    { path: "feeds/cert.json", el: "cert-feed" },
    { path: "feeds/hackernews.json", el: "hackernews-feed" },
  ];
  for (const f of feeds) {
    const ul = document.querySelector(`#${f.el} .feed-list`);
    if (ul) ul.innerHTML = "<li>Loading…</li>";
    try {
      const data = await loadJson(f.path);
      await populateList(data, f.el, 5);
    } catch (e) {
      if (ul) ul.innerHTML = "<li>Unable to load feed.</li>";
      console.error("[feeds]", f.el, e);
    }
  }
});
