# page-kraft.de

Website der Webdesign-Agentur Pagekraft – statische Seiten, gehostet auf Vercel.

- `index.html`, `*.html`, `stadt/*.html`, `blog/*.html` – vorgerenderte Seiten (eigener Title/Description/Canonical/JSON-LD)
- `assets/vN/` – JS/CSS (Original-Bundle + Seiten-Chunks). **Bei jeder Änderung an JS/CSS Ordner auf `v3` usw. hochzählen** (Dateien werden 1 Jahr gecacht).
- `assets/fonts/` – selbst gehostete Schriften (Inter, Satoshi) und Remix-Icon-Subset
- `images/`, `ai/` – selbst gehostete Bilder
- `og-image.jpg` – Vorschaubild für WhatsApp/Social
- `vercel.json` – Clean URLs, Security-Header, Cache-Header
- `robots.txt`, `sitemap.xml`, `llms.txt`, `llms-full.txt`
