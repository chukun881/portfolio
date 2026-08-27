# Yew Chu Kun — Portfolio

Personal portfolio site. Plain HTML / CSS / JS — no framework, no build step,
no dependencies. Hosted on Vercel from this GitHub repository.

## Structure

```
portfolio/
├── index.html      All content lives here (single page)
├── style.css       Design system + themes (dark/light, follows OS)
├── script.js       Theme toggle, mobile nav, scroll reveals
├── assets/
│   ├── favicon.svg
│   ├── portrait.webp      (to add — compressed profile picture)
│   └── certs/             (to add — certificate PDFs to link)
└── README.md
```

## Editing content

Everything is in `index.html`. While the site is being filled in, unfinished
copy is marked two ways:

- HTML comments: `<!-- TODO(zhunbei): ... -->`
- Visible amber highlights: any element with class `todo`

Search for either before going live:

```bash
grep -n "TODO\|class=\"todo\"\|class=.todo" index.html
```

When a piece of content is finalised, replace it and **remove the `todo`
class** so the amber highlight disappears. The site is ready to publish when
that grep returns nothing.

## Local preview

```bash
cd portfolio
python3 -m http.server 4173 --bind 127.0.0.1
# → http://localhost:4173
```

Opening `index.html` directly also works.

## Deploy

The repo is connected to Vercel: every `git push` to `main` auto-deploys.

```bash
git add .
git commit -m "update content"
git push
```

## Credits

Built by hand (Claude Code + Yew Chu Kun). Fonts: Space Grotesk & Inter
(Google Fonts, self-hosted fallback to system fonts).
