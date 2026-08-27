# Yew Chu Kun — Portfolio

Personal portfolio site, designed as a "lab report": the visual language of a
research thesis — figure captions, a spec table, a real footnote. Plain
HTML / CSS / JS, no framework, no build step.

- **Live:** https://chukun-portfolio.vercel.app
- **Repo:** https://github.com/chukun881/portfolio

## Structure

```
├── index.html            All content (single page)
├── style.css             Design tokens, light/dark "night lab" theme
├── script.js             Theme toggle, mobile nav, scroll reveals
└── assets/
    ├── favicon.svg
    ├── portrait.jpg      Author photo (compressed)
    └── certs/            Certificate PDFs linked from § 3
```

## Update flow

1. Edit `index.html` (content) / `style.css` (design)
2. `git add . && git commit -m "..." && git push`   → version history on GitHub
3. `vercel deploy --prod`                            → live in ~30 s, same URL

## Local preview

```bash
python3 -m http.server 4174 --bind 127.0.0.1
# → http://localhost:4174
```

## Facts policy

Every number on this page (6,400 slices, 50:1, 93.75%, ~400×, −7 to −12 pp)
comes straight from the thesis or internship record. If a number can't be
sourced, it doesn't go on the page.
