#!/usr/bin/env python3
import json, time, sys
from pathlib import Path
import requests, feedparser

OUT_DIR = Path("feeds")
OUT_DIR.mkdir(exist_ok=True)

FEEDS = {
    "krebs": "https://krebsonsecurity.com/feed/",
    "bleeping": "https://www.bleepingcomputer.com/feed/",
    "hackernews": "https://thehackernews.com/feeds/posts/default?alt=rss",
}

HEADERS = {"User-Agent": "ColemanIntegratedRSS/1.0 (+github actions)"}

def fetch_text(url, timeout=15):
    r = requests.get(url, headers=HEADERS, timeout=timeout)
    r.raise_for_status()
    return r.text

def parse_items(xml, limit=12):
    parsed = feedparser.parse(xml)
    items = []
    for e in parsed.get("entries", [])[:limit]:
        items.append({
            "title": e.get("title","Untitled"),
            "link": e.get("link","#"),
            "pubDate": e.get("published","") or e.get("updated","")
        })
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
