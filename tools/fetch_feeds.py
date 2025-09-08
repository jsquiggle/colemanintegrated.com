#!/usr/bin/env python3
import json, time, sys
from pathlib import Path
import requests, feedparser

OUT_DIR = Path("feeds")
OUT_DIR.mkdir(exist_ok=True)

FEEDS = {
    "cisa": "https://www.cisa.gov/news-events/cybersecurity-advisories?feed=rss",
    "cert": "http://www.kb.cert.org/vulfeed",
    "hackernews": "https://thehackernews.com/feeds/posts/default?alt=rss",
}

HEADERS = {"User-Agent": "ColemanIntegratedRSS/1.0 (+github actions)"}

def fetch_text(url, retries=3, timeout=20):
    last = None
    for i in range(retries):
        try:
            r = requests.get(url, headers=HEADERS, timeout=timeout, allow_redirects=True)
            if r.ok and r.text.strip():
                return r.text
            last = f"HTTP {r.status_code}"
        except Exception as e:
            last = str(e)
        time.sleep(2*(i+1))
    raise RuntimeError(f"Fetch failed: {last}")

def parse_items(xml_text, max_items=12):
    feed = feedparser.parse(xml_text)
    items = []
    for e in feed.entries[:max_items]:
        title = (getattr(e,'title',None) or 'Untitled').strip()
        link = (getattr(e,'link',None) or getattr(e,'id',None) or '').strip()
        items.append({"title": title, "link": link})
    return items

def main():
    updated = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    for key, url in FEEDS.items():
        try:
            xml = fetch_text(url)
            items = parse_items(xml, 12)
            (OUT_DIR/f"{key}.json").write_text(json.dumps({"source":url,"updated":updated,"items":items}, indent=2))
            print(f"[ok] {key}: {len(items)} items")
        except Exception as e:
            print(f"[error] {key}: {e}", file=sys.stderr)
            (OUT_DIR/f"{key}.json").write_text(json.dumps({"source":url,"updated":updated,"items":[]}, indent=2))

if __name__ == "__main__":
    main()
