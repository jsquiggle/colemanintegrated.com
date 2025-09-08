#!/usr/bin/env python3
import json, time, sys, traceback
from pathlib import Path

try:
    import feedparser
    import requests
except Exception as e:
    print("Missing deps:", e, file=sys.stderr)
    raise

OUT_DIR = Path("feeds")
OUT_DIR.mkdir(exist_ok=True)

FEEDS = {
    "cisa": "https://www.cisa.gov/cybersecurity-advisories/cisa-rss.xml",
    "cert": "https://www.kb.cert.org/vuls/rss/rss.xml",
    "hackernews": "https://thehackernews.com/feeds/posts/default?alt=rss"
}

HEADERS = {"User-Agent": "ColemanIntegratedRSS/1.0 (+github actions)"}

def fetch_url(url, retries=3, timeout=20):
    last = None
    for i in range(retries):
        try:
            r = requests.get(url, headers=HEADERS, timeout=timeout)
            if r.status_code == 200 and r.text.strip():
                return r.text
            last = f"HTTP {r.status_code}"
        except Exception as e:
            last = str(e)
        time.sleep(2 * (i+1))
    raise RuntimeError(f"Failed to fetch after {retries} tries: {last}")

def parse_items(xml_text, max_items=12):
    feed = feedparser.parse(xml_text)
    items = []
    for e in feed.entries[:max_items]:
        title = (getattr(e, "title", None) or "Untitled").strip()
        link = (getattr(e, "link", None) or getattr(e, "id", None) or "").strip()
        items.append({"title": title, "link": link})
    return items

def main():
    updated = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    for key, url in FEEDS.items():
        try:
            xml_text = fetch_url(url)
            items = parse_items(xml_text, 12)
            out = {"source": url, "updated": updated, "items": items}
            (OUT_DIR / f"{key}.json").write_text(json.dumps(out, indent=2))
            print(f"[ok] {key}: {len(items)} items")
        except Exception as e:
            print(f"[error] {key}: {e}", file=sys.stderr)
            # write a diagnostic file so the front-end shows 'Unable to load feed.' if fetch failed
            (OUT_DIR / f"{key}.json").write_text(json.dumps({
                "source": url,
                "updated": updated,
                "items": []
            }, indent=2))

if __name__ == "__main__":
    main()
