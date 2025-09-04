# Patch: Headshot Fix
- Ensures your headshot is named `assets/headshot.jpg` (lowercase).
- Updates `about.html` to reference it with cache-busting (?v=2) and a fallback to `Headshot.jpg`.

## How to use
Upload `about.html` and `assets/headshot.jpg` from this patch to your repo root (replace existing).

Then open https://jsquiggle.github.io/colemanintegrated.com/about.html and hard-refresh (Ctrl/Cmd+Shift+R).
