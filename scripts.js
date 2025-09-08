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

loadFeed("https://www.kb.cert.org/vuls/rss/rss.xml", "cert-feed", 5);
  loadFeed("https://thehackernews.com/feeds/posts/default?alt=rss", "hackernews-feed", 5);
});

// === Cyber Feeds Loader (multi-proxy with timeout) ===
function logFeed(status, detail){ try{ console.log("[feeds]", status, detail||""); }catch(e){} }

function withTimeout(promise, ms=9000) {
  let t;
  const timeout = new Promise((_, rej) => t = setTimeout(() => rej(new Error("timeout "+ms+"ms")), ms));
  return Promise.race([promise.finally(()=>clearTimeout(t)), timeout]);
}

// Try proxies in order until one works
async function fetchTextThroughProxies(url) {
  const proxies = [
    (u)=>`https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
    (u)=>`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`
  ];
  let lastErr;
  for (const p of proxies) {
    const endpoint = p(url);
    try {
      const res = await withTimeout(fetch(endpoint), 9000);
      if (!res.ok) { lastErr = new Error("HTTP "+res.status); logFeed("proxy-fail", endpoint); continue; }
      const text = await res.text();
      return text;
    } catch(e) { lastErr = e; logFeed("proxy-error", e.message); }
  }
  throw lastErr || new Error("All proxies failed");
}

async function fetchRSSJson(feedUrl) {
  const endpoint = "https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(feedUrl);
  const res = await withTimeout(fetch(endpoint), 9000);
  if (!res.ok) throw new Error("rss2json HTTP " + res.status);
  return res.json();
}

function parseXml(text) { return new DOMParser().parseFromString(text, "text/xml"); }

function extractItemsFromXml(xmlDoc, maxItems) {
  let items = Array.from(xmlDoc.querySelectorAll("item, entry"));
  return items.slice(0, maxItems).map(node => {
    const titleNode = node.querySelector("title");
    let link = "";
    const atomLink = node.querySelector("link[rel='alternate']") || node.querySelector("link");
    if (atomLink) link = atomLink.getAttribute("href") || atomLink.textContent.trim();
    if (!link) {
      const guid = node.querySelector("guid, id");
      link = guid ? (guid.textContent||"").trim() : "";
    }
    return { title: titleNode ? titleNode.textContent.trim() : "Untitled", link };
  });
}

async function loadFeed(feedUrl, elementId, maxItems = 5) {
  const ul = document.querySelector(`#${elementId} .feed-list`);
  if (ul) ul.innerHTML = "<li>Loading…</li>";
  try {
    // Primary: rss2json
    const data = await fetchRSSJson(feedUrl);
    if (!ul) return;
    ul.innerHTML = "";
    (data.items || []).slice(0, maxItems).forEach(item => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = item.link;
      a.target = "_blank"; a.rel = "noopener";
      a.textContent = item.title;
      li.appendChild(a); ul.appendChild(li);
    });
    if (!ul.children.length) ul.innerHTML = "<li>No recent items.</li>";
    logFeed("rss2json-ok", elementId);
  } catch (e1) {
    logFeed("rss2json-fail", e1.message);
    try {
      // Fallback: proxy + XML
      const text = await fetchTextThroughProxies(feedUrl);
      const xml = parseXml(text);
      const items = extractItemsFromXml(xml, maxItems);
      if (!ul) return;
      ul.innerHTML = "";
      if (!items.length) { ul.innerHTML = "<li>No recent items.</li>"; return; }
      items.forEach(it => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = it.link || "#";
        a.target = "_blank"; a.rel = "noopener";
        a.textContent = it.title;
        li.appendChild(a); ul.appendChild(li);
      });
      logFeed("xml-fallback-ok", elementId);
    } catch (e2) {
      if (ul) ul.innerHTML = "<li>Unable to load feed.</li>";
      logFeed("xml-fallback-fail", e2.message);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadFeed("https://www.cisa.gov/cybersecurity-advisories/cisa-rss.xml", "cisa-feed", 5);
  loadFeed("https://www.kb.cert.org/vuls/rss/rss.xml", "cert-feed", 5);
  loadFeed("https://thehackernews.com/feeds/posts/default?alt=rss", "hackernews-feed", 5);
});
