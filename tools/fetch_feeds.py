#!/usr/bin/env python3
import json, sys, time, hashlib
from urllib.request import Request, urlopen
from xml.etree import ElementTree as ET
from pathlib import Path

OUT_DIR = Path("feeds")
OUT_DIR.mkdir(exist_ok=True)

FEEDS = {
    "cisa": "https://www.cisa.gov/cybersecurity-advisories/cisa-rss.xml",
    "cert": "https://www.kb.cert.org/vuls/rss/rss.xml",
    "hackernews": "https://thehackernews.com/feeds/posts/default?alt=rss"
}

HEADERS = {"User-Agent": "ColemanIntegratedRSS/1.0"}

def fetch(url):
    req = Request(url, headers=HEADERS)
    with urlopen(req, timeout=20) as resp:
        return resp.read()

def parse_items(xml_bytes, max_items=10):
    root = ET.fromstring(xml_bytes)
    # Support both RSS and Atom
    items = []
    # Try RSS
    for item in root.findall(".//item"):
        title = (item.findtext("title") or "Untitled").strip()
        link = (item.findtext("link") or item.findtext("guid") or "").strip()
        items.append({"title": title, "link": link})
    if not items:
        # Atom
        ns = {"atom": "http://www.w3.org/2005/Atom"}
        entries = root.findall(".//atom:entry", ns) or root.findall(".//entry")
        for e in entries:
            title = (e.findtext("{http://www.w3.org/2005/Atom}title") or e.findtext("title") or "Untitled").strip()
            link_el = e.find("{http://www.w3.org/2005/Atom}link") or e.find("link")
            link = (link_el.get("href") if link_el is not None else (e.findtext("{http://www.w3.org/2005/Atom}id") or e.findtext("id") or "")).strip()
            items.append({"title": title, "link": link})
    return items[:max_items]

def main():
    updated = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    for key, url in FEEDS.items():
        try:
            xml = fetch(url)
            items = parse_items(xml, 12)
            out = {"source": url, "updated": updated, "items": items}
            (OUT_DIR / f"{key}.json").write_text(json.dumps(out, indent=2))
            print(f"Wrote feeds/{key}.json with {len(items)} items")
        except Exception as e:
            print(f"Error fetching {key}: {e}", file=sys.stderr)

if __name__ == "__main__":
    main()
