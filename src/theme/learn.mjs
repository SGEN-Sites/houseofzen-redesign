// learn.mjs, LEARN lane, "Kintsugi Morning" reading room. /blog/ (The Journal: hero, one featured article as a big image
// under a glass card, every article in an offset masonry with filter chips), /blog/<category>/ x 7 (same template, smaller
// hero), /blog/<slug>/ for every ctx.posts (article template). Lane classes are prefixed n-; component classes come from
// FOUNDATION. No dates are printed and no author is named: House of Zen is the organization.
import { esc, escA, href, linkAttrs, gimg, photo, brush, menu, absUrl, stripTags, rewriteLinks, hasGenerated, imgUrl, slugify } from './util.mjs';
import { page, icon, crumbsHtml, pageHero, blocks, seam } from './shell.mjs';

// ---------- data ----------
const JOURNAL = 'The Journal';
const NOTE = 'Educational content, not medical or legal advice.';
const CATS = [
  { slug: 'cannabis-101', label: 'Cannabis 101', line: 'The basics, in plain words.' },
  { slug: 'health-and-lifestyle', label: 'Health & Lifestyle', line: 'Reading on routine, rhythm and moderation, not medical advice.' },
  { slug: 'popular', label: 'Most Popular', line: 'A short list to start with.' },
  { slug: 'news-and-culture', label: 'News & Culture', line: 'Context on cannabis in Michigan, in plain words.' },
  { slug: 'recipes', label: 'Recipes', line: 'Kitchen notes, taken slowly.', image: 'g-recipes' },
  { slug: 'resources', label: 'Resources', line: 'Practical reading to keep close.', brush: 'resources' },
  { slug: 'shopping-and-reviews', label: 'Shopping & Reviews', line: 'How to read a menu, compare products and know what to ask.' },
];
const catBySlug = new Map(CATS.map((c) => [c.slug, c]));
const catPath = (slug) => `/blog/${slug}/`;
const orgLd = (ctx) => ({ '@type': 'Organization', name: ctx.site.name, url: ctx.site.origin + '/' });
const titled = (t) => (/\|\s*House of Zen\s*$/i.test(t) ? t : `${t} | House of Zen`);
const countOf = (n) => `${n} ${n === 1 ? 'article' : 'articles'}`;
const readLabel = (r) => {
  if (typeof r === 'number' && r > 0) return `${r} min read`;
  const s = String(r ?? '').trim();
  return !s ? '' : /min/i.test(s) ? s : `${s} min read`;
};

function itemOf(p) {
  const cats = (p.categories || []).filter((c) => c && c.slug);
  const main = cats.find((c) => c.slug !== 'popular') || cats[0] || null;
  const tags = new Set(cats.map((c) => c.slug));
  if (p.popular === true) tags.add('popular');
  return {
    post: p,
    slug: p.slug,
    path: href(p.path || `/blog/${p.slug}/`),
    title: stripTags(p.h1 || p.title),
    image: p.image || 'g-journal',
    alt: p.imageAlt || undefined, // empty: the image plan's alt applies
    excerpt: stripTags(p.excerpt || p.description || ''),
    read: readLabel(p.readTime),
    main,
    mainLabel: main ? (catBySlug.get(main.slug) || {}).label || main.name : '',
    tags: [...tags],
  };
}

// One italic word per heading: the last word of three letters or more. Styling only, the words do not change.
function accented(text) {
  const words = String(text).split(' ');
  let at = -1;
  for (let i = words.length - 1; i >= 0; i--) if (words[i].replace(/[^\p{L}\p{N}]/gu, '').length >= 3) { at = i; break; }
  return words.map((w, i) => (i === at ? `<em class="accent">${esc(w)}</em>` : esc(w))).join(' ');
}

// The category series is 4:5 with its subject low in the frame: a landscape crop of one keeps the lower part.
const tallSrc = (id) => (/^g-cat-/.test(id) ? ' n-src-tall' : '');
const metaHtml = (it) => `${it.mainLabel ? `<span>${esc(it.mainLabel)}</span>` : ''}${it.read ? `<span>${esc(it.read)}</span>` : ''}`;

// ---------- cards ----------
function card(it, { n = 0, ar = '3/2', sizes, excerpt = false, more = false, filter = false, cls = '', h = 'h3' } = {}) {
  const tagAttr = filter ? ` data-filter-item data-tags="${escA(it.tags.join(' '))}"` : '';
  return `<li class="n-item${cls ? ' ' + cls : ''}"${tagAttr} data-reveal style="--i:${n % 4}"><article class="acard n-card${tallSrc(it.image)}" style="--n-ar:${ar}">
<span class="acard__media n-card__media">${gimg(it.image, { alt: '', sizes })}<span class="n-card__sheen" aria-hidden="true"></span></span>
<p class="acard__meta n-meta">${metaHtml(it)}</p>
<${h} class="acard__title n-card__title"><a${linkAttrs(it.path)}>${esc(it.title)}</a></${h}>
${excerpt && it.excerpt ? `<p class="acard__excerpt n-card__excerpt">${esc(it.excerpt)}</p>` : ''}
${more ? `<span class="acard__more n-card__more">Read the article${icon('arrow')}</span>` : ''}
</article></li>`;
}

// The offset masonry: real columns of different widths starting at different heights, filled shortest-first so they stay
// level. While a chip filter is on, learn.css flattens the columns into a plain grid (:has(.is-filtered-out)), so a filtered
// set never hangs in one column. `twin` = a card that stays hidden until a filter is on (the featured article's own card).
// Below 700px every card is a compact row with a thumbnail at most 120px wide (learn.css), so phones ask for that width.
const COLS = [
  { w: 1, ratios: ['4/5', '3/2', '1/1', '3/2'], excerpt: true, sizes: '(min-width: 1024px) 36vw, (min-width: 700px) 46vw, 120px' },
  { w: 0.8, ratios: ['3/2', '4/5', '3/2', '1/1'], excerpt: true, sizes: '(min-width: 1024px) 29vw, (min-width: 700px) 46vw, 120px' },
  { w: 0.68, ratios: ['1/1', '3/2', '4/5', '3/2'], excerpt: false, sizes: '(min-width: 1024px) 25vw, (min-width: 700px) 46vw, 120px' },
];
// The hero frame below 1024px: 88% of the wrap (learn.css), capped at 620px; the wrap's gutters are 20px each on a phone.
const HERO_SM = '(min-width: 776px) 620px, calc(88vw - 36px)';
const ratioOf = (r) => { const [a, b] = r.split('/').map(Number); return b / a; };
function mason(items, { filter = false, twin = null } = {}) {
  const cols = COLS.slice(0, items.length <= 2 ? 2 : 3).map((c) => ({ ...c, list: [], est: 0 }));
  for (const it of items) {
    // shortest column first, but never the same photo directly above itself
    const open = cols.filter((c) => !c.list.length || c.list[c.list.length - 1].it.image !== it.image);
    const col = (open.length ? open : cols).reduce((a, b) => (b.est < a.est ? b : a));
    const r = col.ratios[col.list.length % col.ratios.length];
    col.list.push({ it, r });
    col.est += col.w * ratioOf(r) + (col.excerpt ? 0.42 : 0.3) + 0.16;
  }
  let n = 0;
  const lists = cols.map((col) => {
    const lis = col.list.map(({ it, r }, i) => card(it, { n: n++, ar: r, sizes: col.sizes, excerpt: col.excerpt, filter, cls: i % 2 ? 'n-item--b' : 'n-item--a' }));
    if (twin && col === cols[0]) lis.unshift(card(twin, { n: n++, ar: '3/2', sizes: col.sizes, excerpt: true, filter, cls: 'n-item--a n-item--twin' }));
    return `<ul class="n-mason__col" role="list">\n${lis.join('\n')}\n</ul>`;
  });
  return `<div class="n-mason n-mason--${cols.length}">\n${lists.join('\n')}\n</div>`;
}

// ---------- shared pieces ----------
const CUTS = [
  { id: 'g-cut-sprig', corner: 'tr', ground: 'plaster', r: 'r1', tilt: '-1.1deg' },
  { id: 'g-cut-stones', corner: 'bl', ground: 'washi', r: 'r2', tilt: '0.9deg' },
  { id: 'g-cut-sprig', corner: 'bl', ground: 'plaster', r: 'r3', tilt: '-0.6deg' },
  { id: 'g-cut-stones', corner: 'br', ground: 'washi', r: 'r1', tilt: '1.2deg' },
];
// The hand-thrown floating frame with a cut-out overlapping one corner. The media wrapper moves at one scroll speed
// (data-depth on .page-hero__media); the cut-out moves against it and drifts.
function heroFrame({ image, alt, sizes }, v, mod = '') { // alt undefined: the image plan's alt applies
  const kind = v.id === 'g-cut-sprig' ? 'sprig' : 'stones';
  return `<div class="n-art n-art--${v.corner} n-art--${kind}${mod ? ' ' + mod : ''}">
<figure class="frame frame--float frame--${v.r} n-frame${tallSrc(image)}" style="--frame-tilt:${v.tilt}">${gimg(image, { alt, sizes, cls: 'frame__img', eager: true })}</figure>
<div class="n-art__cut" data-depth="-0.09">${gimg(v.id, { alt: '', cls: 'cut', sizes: '(min-width: 1024px) 240px, 130px', attrs: { 'data-float': true } })}</div>
</div>`;
}

// The closing band: the client's words, the client's bud crossing its top edge, a kintsugi seam mending it to the band above.
function closeBand(ctx) {
  return `<section class="band band--moss edge--torn-top n-close" aria-labelledby="n-close-h">
<div class="band__clip" aria-hidden="true">${gimg('g-moss-garden', { alt: '', cls: 'band__bg n-close__bg', sizes: '100vw', attrs: { 'data-depth': '0.07' } })}<span class="band__shade n-close__veil"></span></div>
${seam(3, { cls: 'n-seam-close' })}
<div class="n-close__bud" aria-hidden="true" data-depth="-0.1">${photo(ctx, 'hoz/bud-cut.png', { alt: '', cls: 'cut', sizes: '(min-width: 1024px) 340px, 170px', attrs: { 'data-float': true } })}</div>
<div class="wrap n-close__wrap">
<div class="n-close__text" data-reveal>
<h2 class="display n-close__title" id="n-close-h">${brush('find-your-balance')}</h2>
<div class="btn-row"><a class="btn btn--gold"${linkAttrs(menu(ctx))}>Shop now${icon('ext')}</a></div>
<p class="n-close__note">${esc(NOTE)}</p>
</div>
</div>
</section>`;
}

function chipRow(current, { filter = false } = {}) {
  const chip = (label, path, slug) => `<li><a class="chip n-chip"${linkAttrs(path)}${filter ? ` data-filter="${escA(slug)}"` : ''}${!filter && slug === current ? ' aria-current="page"' : ''}>${esc(label)}</a></li>`;
  const list = [chip('All', '/blog/', 'all'), ...CATS.map((c) => chip(c.label, catPath(c.slug), c.slug))].join('');
  return filter
    ? `<ul class="n-chips" role="list" data-filter-group aria-label="Filter articles by category">${list}</ul>`
    : `<nav class="n-chipnav" aria-label="Journal categories"><ul class="n-chips" role="list">${list}</ul></nav>`;
}

// ---------- /blog/ ----------
function hubPage(ctx, items) {
  const path = '/blog/';
  const crumbs = [{ label: 'Home', href: '/' }, { label: JOURNAL, href: path }];
  const feat = items[0];
  const rest = items.slice(1);
  const hero = pageHero({
    ctx, tone: 'plaster', crumbs, cls: 'n-hero n-hero--hub',
    media: heroFrame({ image: 'g-first-visit', sizes: `(min-width: 1024px) 44vw, ${HERO_SM}` }, CUTS[0], 'n-art--hub'),
    kicker: 'Balance, education, and intention',
    h1Html: `The ${brush('journal')}`,
    lede: esc('Clear, honest reading on cannabis, from the people behind the counter.'),
    cta: `<a class="btn" href="#n-all">Browse the articles${icon('arrow')}</a>`,
  });
  const featBand = feat ? `<section class="band band--washi edge--torn-bottom n-feat-band" aria-labelledby="n-feat-h">
<div class="wrap">
<article class="n-feat">
<a class="n-feat__media"${linkAttrs(feat.path)} tabindex="-1" aria-hidden="true"><figure class="frame frame--r3 n-feat__frame" data-reveal="wipe">${gimg(feat.image, { alt: '', cls: 'frame__img', sizes: '(min-width: 1024px) 66vw, 92vw' })}</figure></a>
<div class="glass glass--strong n-feat__pane" data-reveal data-spot>
<p class="kicker">Start with this one</p>
<p class="acard__meta n-meta">${metaHtml(feat)}</p>
<h2 class="display n-feat__title" id="n-feat-h"><a class="n-feat__link"${linkAttrs(feat.path)}>${accented(feat.title)}</a></h2>
${feat.excerpt ? `<p class="n-feat__excerpt">${esc(feat.excerpt)}</p>` : ''}
<a class="btn"${linkAttrs(feat.path)}>Read the article${icon('arrow')}</a>
</div>
</article>
</div>
${seam(3, { cls: 'n-seam-feat' })}
</section>` : '';
  const list = items.length ? `<section class="band band--rice n-all" id="n-all" aria-labelledby="n-all-h" data-filter-scope>
<div class="wrap wrap--wide n-all__wrap">
<header class="n-all__head" data-reveal>
<h2 class="display n-all__title" id="n-all-h">All <em class="accent">articles</em></h2>
<p class="n-all__count" aria-live="polite"><span data-filter-count data-one="article" data-many="articles">${countOf(items.length)}</span></p>
${chipRow('all', { filter: true })}
</header>
${mason(rest, { filter: true, twin: feat })}
<p class="n-empty" data-filter-empty hidden>No articles under this category yet.</p>
</div>
</section>` : `<section class="band band--rice n-all"><div class="wrap"><p class="n-empty">New articles are on the way.</p></div></section>`;
  const title = titled(JOURNAL);
  const description = 'The Journal from House of Zen in Detroit: clear, honest reading on cannabis, by category.';
  return {
    path,
    html: page({
      ctx, path, title, description, canonical: absUrl(ctx, path), heroCrumbs: true, crumbs,
      og: { title, description, type: 'website', url: absUrl(ctx, path) },
      bodyClass: 'n-page n-page--hub', main: `${hero}\n${featBand}\n${list}\n${closeBand(ctx)}`, scripts: ['toc.js'],
      jsonld: [{ '@context': 'https://schema.org', '@type': 'Blog', name: JOURNAL, url: absUrl(ctx, path), publisher: orgLd(ctx), blogPost: items.map((it) => ({ '@type': 'BlogPosting', headline: it.title, url: absUrl(ctx, it.path) })) }],
    }),
  };
}

// ---------- /blog/<category>/ ----------
function categoryPage(ctx, c, items) {
  const path = catPath(c.slug);
  const crumbs = [{ label: 'Home', href: '/' }, { label: JOURNAL, href: '/blog/' }, { label: c.label, href: path }];
  const mine = items.filter((it) => it.tags.includes(c.slug));
  const v = CUTS[(CATS.indexOf(c) + 1) % CUTS.length];
  const image = c.image || (mine[0] && mine[0].image) || 'g-journal';
  const hero = pageHero({
    ctx, tone: v.ground, crumbs, cls: 'n-hero n-hero--cat',
    media: heroFrame({ image, sizes: `(min-width: 1024px) 36vw, ${HERO_SM}` }, v, 'n-art--cat'),
    kicker: JOURNAL,
    h1Html: c.brush ? brush(c.brush) : accented(c.label),
    lede: esc(c.line),
  });
  const list = `<section class="band band--rice n-all n-all--cat" aria-labelledby="n-all-h">
<div class="wrap wrap--wide n-all__wrap">
<header class="n-all__head" data-reveal>
<h2 class="display n-all__title" id="n-all-h">${mine.length ? esc(countOf(mine.length)) : 'Articles'}</h2>
${chipRow(c.slug)}
</header>
${mine.length ? mason(mine) : `<p class="n-empty">New articles are on the way. <a class="link-arrow"${linkAttrs('/blog/')}>${esc(JOURNAL)}${icon('arrow')}</a></p>`}
</div>
</section>`;
  const title = titled(c.label);
  const description = `${c.label}: articles from The Journal by House of Zen in Detroit.`;
  return {
    path,
    html: page({
      ctx, path, title, description, canonical: absUrl(ctx, path), heroCrumbs: true, crumbs,
      og: { title, description, type: 'website', url: absUrl(ctx, path) },
      bodyClass: 'n-page n-page--cat', main: `${hero}\n${list}\n${closeBand(ctx)}`,
      jsonld: [{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: c.label, url: absUrl(ctx, path), isPartOf: { '@type': 'Blog', name: JOURNAL, url: absUrl(ctx, '/blog/') }, hasPart: mine.map((it) => ({ '@type': 'BlogPosting', headline: it.title, url: absUrl(ctx, it.path) })) }],
    }),
  };
}

// ---------- /blog/<slug>/ ----------
const plain = (s) => stripTags(s).replace(/\s+/g, ' ').trim().toLowerCase();
const blockText = (b) => (b.type === 'ul' || b.type === 'ol' ? (b.items || []).map((x) => (typeof x === 'string' ? x : x.html || '')).join(' ') : b.html || b.text || '');

// Where the pull quote goes: never beside the sentence it repeats, and never between a list's lead-in and the list. The
// section nearest the middle that does not hold that sentence, between two of its paragraphs; if no section has two
// paragraphs in a row, at the end of that section. In a one-section article, as far from the sentence as it can get.
function pullSlot(post) {
  const pull = plain(post.pull || '');
  const secs = post.sections || [];
  if (!pull || !secs.length) return null;
  const listOf = (s) => s.blocks || [];
  const between = (s) => listOf(s).findIndex((b, i, l) => b.type === 'p' && l[i + 1] && l[i + 1].type === 'p');
  const src = secs.findIndex((s) => listOf(s).some((b) => plain(blockText(b)).includes(pull)));
  const mid = (secs.length - 1) / 2;
  const order = secs.map((_, i) => i).filter((i) => i !== src && listOf(secs[i]).length).sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid) || a - b);
  const hit = order.find((i) => between(secs[i]) >= 0);
  if (hit !== undefined) return { sec: hit, after: between(secs[hit]) };
  if (order.length) return { sec: order[0], after: listOf(secs[order[0]]).length - 1 };
  const s = Math.max(src, 0);
  const list = listOf(secs[s]);
  const bi = list.findIndex((b) => plain(blockText(b)).includes(pull));
  return { sec: s, after: bi > list.length / 2 ? 0 : list.length - 1 };
}

const pullHtml = (post) => `<figure class="n-pull" data-reveal><span class="n-pull__enso" aria-hidden="true" data-spin="0.02">${gimg('g-enso', { alt: '', sizes: '(min-width: 1024px) 320px, 120px' })}</span><blockquote class="n-pull__q"><p>${esc(stripTags(post.pull))}</p></blockquote></figure>`;
const calloutHtml = (b, i) => {
  const html = rewriteLinks(b.html || esc(b.text || ''));
  return `<aside class="n-callout n-callout--${i % 2 ? 'b' : 'a'}${/^\s*<strong>/i.test(html) ? ' n-callout--lead' : ''}" data-reveal><span class="n-callout__mist" aria-hidden="true">${gimg('g-ink-mist', { alt: '', sizes: '(min-width: 1024px) 460px, 76vw' })}</span><div class="glass glass--strong n-callout__pane"><p>${html}</p></div></aside>`;
};

function bodyHtml(ctx, post) {
  const slot = pullSlot(post);
  let calloutN = 0;
  const used = new Set();
  const uid = (s, i) => { const base = slugify(s.id || s.heading || `section-${i + 1}`) || `section-${i + 1}`; let id = base; let n = 2; while (used.has(id)) id = `${base}-${n++}`; used.add(id); return id; };
  const secs = (post.sections || []).map((s, i) => ({ ...s, _id: uid(s, i) }));
  const html = secs.map((s, si) => {
    const parts = [];
    let run = [];
    const flush = () => { if (run.length) { parts.push(blocks(run, ctx)); run = []; } };
    (s.blocks || []).forEach((b, bi) => {
      if (b.type === 'callout') { flush(); parts.push(calloutHtml(b, calloutN++)); } else run.push(b);
      if (slot && slot.sec === si && slot.after === bi) { flush(); parts.push(pullHtml(post)); }
    });
    flush();
    return `<section class="n-sec" id="${escA(s._id)}"${s.heading ? ` aria-labelledby="${escA(s._id)}-h"` : ''}>
${s.heading ? `<h2 class="n-sec__h" id="${escA(s._id)}-h">${esc(s.heading)}</h2>` : ''}
${parts.join('\n')}
</section>`;
  }).join('\n');
  return { html, toc: secs.filter((s) => s.heading) };
}

function keepReading(it, items, bySlug) {
  const out = [];
  const push = (x) => { if (x && x.slug !== it.slug && !out.includes(x) && out.length < 3) out.push(x); };
  for (const slug of it.post.related || []) push(bySlug.get(slug)); // a slug that does not exist yet is skipped
  for (const x of items) if (x.tags.some((t) => it.tags.includes(t))) push(x);
  for (const x of items) push(x);
  return out;
}

function articlePage(ctx, it, idx, items, bySlug) {
  const p = it.post;
  const path = it.path;
  const can = absUrl(ctx, path);
  const crumbs = [{ label: 'Home', href: '/' }, { label: JOURNAL, href: '/blog/' }, { label: it.title, href: path }];
  const v = CUTS[idx % CUTS.length];
  const { html: body, toc } = bodyHtml(ctx, p);
  const hasToc = toc.length >= 2;
  const catLink = it.main && catBySlug.has(it.main.slug) ? `<a${linkAttrs(catPath(it.main.slug))}>${esc(it.mainLabel)}</a>` : `<span>${esc(it.mainLabel)}</span>`;
  const kicker = [it.main ? catLink : '', it.read ? `<span>${esc(it.read)}</span>` : ''].filter(Boolean).join('<span class="n-sep" aria-hidden="true"></span>');
  const hero = `<section class="page-hero band band--${v.ground} edge--torn-bottom page-hero--media n-hero n-hero--post" aria-labelledby="n-title">
<div class="wrap page-hero__inner">
<div class="page-hero__text">
${crumbsHtml(crumbs)}
<p class="kicker n-hero__kicker" data-reveal>${kicker}</p>
<h1 class="display page-hero__h1" id="n-title" data-reveal style="--i:1">${accented(it.title)}</h1>
${it.excerpt ? `<p class="lede page-hero__lede" data-reveal style="--i:2">${esc(it.excerpt)}</p>` : ''}
</div>
<div class="page-hero__media" data-depth="0.05">${heroFrame({ image: it.image, alt: it.alt, sizes: `(min-width: 1024px) 44vw, ${HERO_SM}` }, v, 'n-art--post')}</div>
</div>
${seam(4, { cls: 'n-seam-hero' })}
</section>`;
  const tocHtml = hasToc ? `<aside class="n-toc-col"><nav class="n-toc" data-toc aria-labelledby="n-toc-h">
<p class="n-toc__title" id="n-toc-h">In this article</p>
<ol class="n-toc__list" role="list">${toc.map((s) => `<li><a class="n-toc__link" href="#${escA(s._id)}">${esc(s.heading)}</a></li>`).join('')}</ol>
</nav></aside>` : '';
  const bodyBand = `<section class="band band--rice n-body" aria-label="Article">
<div class="wrap n-body__grid${hasToc ? '' : ' n-body__grid--solo'}">
<article class="n-prose">
${body}
</article>
${tocHtml}
</div>
</section>`;
  const faq = (p.faq || []).filter((q) => q && q.q && q.a_html);
  const faqBand = faq.length ? `<section class="band band--washi edge--torn-top n-faq" aria-labelledby="n-faq-h">
<div class="wrap n-faq__grid">
<h2 class="display n-faq__title" id="n-faq-h" data-reveal>${brush('questions')}</h2>
<div class="faq n-faq__list" data-faq data-reveal>${faq.map((q) => `<details><summary>${esc(q.q)}</summary><div class="faq__a">${rewriteLinks(q.a_html)}</div></details>`).join('')}</div>
</div>
</section>` : '';
  const keep = keepReading(it, items, bySlug);
  const keepBand = keep.length ? `<section class="band band--mint edge--torn-top n-keep-band" aria-labelledby="n-keep-h">
<div class="wrap">
<h2 class="display n-keep__title" id="n-keep-h" data-reveal>Keep <em class="accent">reading</em></h2>
<ul class="n-keep" role="list">
${keep.map((x, i) => card(x, { n: i, ar: i === 1 ? '4/5' : '3/2', sizes: '(min-width: 1024px) 30vw, (min-width: 448px) 340px, 76vw', more: true, cls: `n-item--k${i}` })).join('\n')}
</ul>
</div>
</section>` : '';
  const title = titled(p.title || it.title);
  const description = p.description || it.excerpt;
  const image = hasGenerated(it.image) ? ctx.site.origin + imgUrl(it.image, 1440) : null;
  return {
    path,
    html: page({
      ctx, path, title, description, canonical: can, heroCrumbs: true, crumbs,
      og: { title, description, type: 'article', url: can, ...(image ? { image } : {}) },
      bodyClass: 'n-page n-page--article', main: `${hero}\n${bodyBand}\n${faqBand}\n${keepBand}\n${closeBand(ctx)}`, scripts: ['toc.js'],
      jsonld: [
        { '@context': 'https://schema.org', '@type': 'Article', headline: it.title, description, ...(image ? { image } : {}), mainEntityOfPage: can, author: orgLd(ctx), publisher: orgLd(ctx), ...(it.mainLabel ? { articleSection: it.mainLabel } : {}) },
        ...(faq.length ? [{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map((q) => ({ '@type': 'Question', name: stripTags(q.q), acceptedAnswer: { '@type': 'Answer', text: stripTags(q.a_html) } })) }] : []),
      ],
    }),
  };
}

// ---------- module ----------
export async function render(ctx) {
  const items = (ctx.posts || []).filter((p) => p && p.slug && (p.h1 || p.title)).map(itemOf);
  const bySlug = new Map(items.map((it) => [it.slug, it]));
  const out = [hubPage(ctx, items)];
  for (const c of CATS) out.push(categoryPage(ctx, c, items));
  items.forEach((it, i) => out.push(articlePage(ctx, it, i, items, bySlug)));
  return out;
}
