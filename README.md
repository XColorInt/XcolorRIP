# XcolorRIP (download site)

Static website of XColorRIP, https://www.xcolorrip.com (published with Cloudflare).
This repository holds ONLY the website. The installer and the CMS packs are on GitHub Releases
(https://github.com/XColorInt/XcolorRIP/releases). The program source code is NOT here.

```
public/            <- Cloudflare publishes ONLY this folder
  index.html       XColorRIP main page (features, printers, downloads)
  download.html  support.html  news.html  blog.html  dealers.html  about.html  404.html
  ko/              Korean pages
  css/ js/ img/    style, language switch, pictures
  downloads/       brochure and update manual PDFs
  _headers  robots.txt  sitemap.xml  favicon.png
wrangler.jsonc     Cloudflare static assets config (project xcolorrip)
update_from_main.bat   copies the site from the main project into public\
```

## Update the site
1. Edit the site in the main project (docs/marketing/site).
2. Run `update_from_main.bat`.
3. `git add -A && git commit -m "update site" && git push`.
