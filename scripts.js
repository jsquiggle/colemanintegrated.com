document.addEventListener('DOMContentLoaded', () => {
  const yEl = document.getElementById('year');
  if (yEl) yEl.textContent = new Date().getFullYear();
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  if (toggle && nav) toggle.addEventListener('click', () => nav.classList.toggle('open'));
});


// === Cyber Feeds Loader ===
async function loadFeed(feedUrl, elementId, maxItems = 5) {
  try {
    const endpoint = "https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(feedUrl);
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    const ul = document.querySelector(`#${elementId} .feed-list`);
    if (!ul) return;
    ul.innerHTML = "";
    (data.items || []).slice(0, maxItems).forEach(item => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = item.link;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = item.title;
      li.appendChild(a);
      ul.appendChild(li);
    });
    if (!ul.children.length) {
      ul.innerHTML = "<li>No recent items.</li>";
    }
  } catch (e) {
    const ul = document.querySelector(`#${elementId} .feed-list`);
    if (ul) {
      ul.innerHTML = "<li>Unable to load feed.</li>";
    }
    console.error("Feed error:", elementId, e);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadFeed("https://www.cisa.gov/cybersecurity-advisories/cisa-rss.xml", "cisa-feed", 5);
  loadFeed("https://www.kb.cert.org/vuls/rss/rss.xml", "cert-feed", 5);
  loadFeed("https://thehackernews.com/feeds/posts/default?alt=rss", "hackernews-feed", 5);
});
