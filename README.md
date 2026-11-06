# House of Zen: redesign pitch

A redesign proposal for [houseofzendetroit.com](https://houseofzendetroit.com), the family-owned cannabis dispensary at
14501 Mack Ave, Detroit. This is a working static preview made for a pitch. It is not House of Zen's official site, and its
forms send nothing.

**Preview:** https://sgen-sites.github.io/houseofzen-redesign/ (noindex)

## What it is

- **House of Zen's own content.** Home, About, Contact, Privacy Policy and Terms of Use are rebuilt at their own URLs with
  their own words.
- **A new structure for one store.** A promo strip, a five-part main menu with image-rich mega menus, product category pages,
  deals, a rewards concept, a store page, a dispensary guide, Michigan law and medical card guides, an FAQ, a journal with
  categories and original articles, and a sitemap. Every new page is original writing about House of Zen or about Michigan.
- **A new design: "Kintsugi Morning".** Glassmorphism, luxury typography and wabi sabi, kept clean and modern on House of
  Zen's own brand: its serif, sans and brush lettering, moss and sage, the logo's indigo and gold. Frosted shoji glass over
  plaster, washi and moss; hand-thrown indigo stoneware and the client's own bud cut-out breaking out of their frames and
  across section edges; a gold kintsugi seam that draws itself with the scroll. See [docs/DESIGN.md](docs/DESIGN.md).
- **Motion.** Scroll-through stages, reveals, parallax depth and hover effects, all off for visitors who prefer reduced
  motion.
- **Imagery.** House of Zen's own photographs, plus AI-generated illustrative stills and a hero loop, each labelled as
  AI-generated in its metadata and listed in [docs/MEDIA.md](docs/MEDIA.md). None of them shows House of Zen's store, staff,
  customers or products.

## Build it

Node 18 or newer and `cwebp` on PATH. No runtime dependencies.

```
MSYS_NO_PATHCONV=1 node src/build.mjs
node tools/serve.mjs --root dist --port 8080 --not-found 404.html
```

Content lives in `src/content/`, templates in `src/theme/`, styles in `src/styles/`, motion in `src/scripts/site.js`.

## Before this could go live

Client facts to confirm, the rewards programme (a concept here), the licence number, legal review of the law and medical
pages, and real form endpoints. The brush lettering is outline artwork of fixed phrases, not a font file; the font's licence
is the client's to check. Text and photographs belong to House of Zen.
