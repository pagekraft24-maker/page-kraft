# page-kraft.de

Statische Version der Pagekraft-Website (Original-Build aus Readdy), gehostet auf Vercel.

- `index.html`, `*.html`, `stadt/*.html`, `blog/*.html` – vorgerenderte Seiten (eigener Title/Description/Canonical/JSON-LD)
- `assets/v2/` – JS/CSS (Original-Bundle + Seiten-Chunks). **Bei jeder Änderung an JS/CSS Ordner auf `v3` usw. hochzählen** (Dateien werden 1 Jahr gecacht).
- `assets/fonts/` – selbst gehostete Schriften (Inter, Satoshi) und Remix-Icon-Subset
- `images/`, `ai/` – selbst gehostete Bilder
- `og-image.jpg` – Vorschaubild für WhatsApp/Social
- `vercel.json` – Clean URLs, Security-Header, Cache-Header
- `robots.txt`, `sitemap.xml`, `llms.txt`, `llms-full.txt`
