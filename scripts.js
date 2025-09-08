document.addEventListener('DOMContentLoaded', () => {
  const yEl = document.getElementById('year');
  if (yEl) yEl.textContent = new Date().getFullYear();
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  if (toggle && nav) toggle.addEventListener('click', () => nav.classList.toggle('open'));
});


loadFeed("https://www.kb.cert.org/vuls/rss/rss.xml", "cert-feed", 5);
  loadFeed("https://thehackernews.com/feeds/posts/default?alt=rss", "hackernews-feed", 5);
});

// === Cyber Feeds Loader (with XML fallback) ===
async function fetchRSSJson(feedUrl) {
  const endpoint = "https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(feedUrl);
  const res = await fetch(endpoint);
  if (!res.ok) throw new Error("rss2json HTTP " + res.status);
  return res.json();
}

async function fetchRSSXmlViaProxy(feedUrl) {
  const endpoint = "https://api.allorigins.win/raw?url=" + encodeURIComponent(feedUrl);
  const res = await fetch(endpoint);
  if (!res.ok) throw new Error("allorigins HTTP " + res.status);
  const text = await res.text();
  const xml = new DOMParser().parseFromString(text, "text/xml");
  return xml;
}

function extractItemsFromXml(xmlDoc, maxItems) {
  let items = Array.from(xmlDoc.querySelectorAll("item"));
  if (items.length === 0) {
    // Atom
    items = Array.from(xmlDoc.querySelectorAll("entry"));
  }
  return items.slice(0, maxItems).map(node => {
    const titleNode = node.querySelector("title");
    let linkNode = node.querySelector("link");
    let link = "";
    if (linkNode) {
      // Atom links sometimes use href attribute
      link = linkNode.getAttribute("href") || (linkNode.textContent || "").trim();
    } else {
      const l = node.querySelector("link, guid, id");
      link = l ? (l.getAttribute && l.getAttribute("href")) || l.textContent.trim() : "";
    }
    return {
      title: titleNode ? titleNode.textContent.trim() : "Untitled",
      link: link
    };
  });
}

async function loadFeed(feedUrl, elementId, maxItems = 5) {
  const ul = document.querySelector(`#${elementId} .feed-list`);
  if (ul) { ul.innerHTML = "<li>Loading…</li>"; }
  try {
    // Try rss2json first
    const data = await fetchRSSJson(feedUrl);
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
  } catch (e1) {
    // Fallback to proxy + XML parsing
    try {
      const xml = await fetchRSSXmlViaProxy(feedUrl);
      if (!ul) return;
      ul.innerHTML = "";
      const items = extractItemsFromXml(xml, maxItems);
      if (!items.length) {
        ul.innerHTML = "<li>No recent items.</li>";
        return;
      }
      items.forEach(item => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = item.link || "#";
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = item.title;
        li.appendChild(a);
        ul.appendChild(li);
      });
    } catch (e2) {
      if (ul) ul.innerHTML = "<li>Unable to load feed.</li>";
      console.error("Feed error:", elementId, e1, e2);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadFeed("https://www.cisa.gov/cybersecurity-advisories/cisa-rss.xml", "cisa-feed", 5);
  loadFeed("https://www.kb.cert.org/vuls/rss/rss.xml", "cert-feed", 5);
  loadFeed("https://thehackernews.com/feeds/posts/default?alt=rss", "hackernews-feed", 5);
});
