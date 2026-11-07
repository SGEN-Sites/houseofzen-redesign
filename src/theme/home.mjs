// home.mjs - House of Zen home "/" (HOME lane, "Kintsugi Morning"; docs/BUILD-CONTRACT.md section 6).
//   1 + 2  one pinned scene: the morning room (hero), then a frosted shoji pane slides across it carrying Products, and
//          the category frames pass behind the pane's heading panel.  Normal flow + swipe row below 1024 wide, under 560
//          tall and under reduced motion (home.css).
//   3 Find your Balance  4 New to The House of Zen  5 the family (photo, framed to full bleed)  6 reviews (sticky stack)
//   7 Visit  8 The Journal + Instagram
// Every word comes from pages/home.json through ctx.content (dash-normalised at load); facts from ctx.site. New words are
// neutral glue only: kickers, labels, alt text. Copy that cannot be found stops the build (fail closed).
import * as shell from './shell.mjs';
import { esc, escA, linkAttrs, gimg, photo, menu, brush, rewriteLinks, absUrl, hasGenerated, directions } from './util.mjs';

const ico = (n, c = '') => shell.icon(n, c);
// the plate is cover-cropped and scaled 1.08 on desktop; on phones it is the lower 62% of the hero, so its height decides
const HERO_SIZES = '(max-width: 1023.98px) max(120vw, 110vh), max(108vw, 192vh)';

// ---------- captured copy: each section read by id, each block asserted ----------
function reader(home) {
  const byId = Object.fromEntries((home.sections || []).map((s) => [s.id, s]));
  const need = (cond, what) => { if (!cond) throw new Error('home.json: missing ' + what); return cond; };
  return {
    sec: (id) => need(byId[id], 'section ' + id),
    of: (id, type, n = 0) => need((byId[id].blocks || []).filter((b) => b.type === type)[n], `${id} ${type}[${n}]`),
  };
}
const inline = (b) => rewriteLinks(b.html ?? b.text ?? '');

// Reading a heading into a lead + an accent keeps the source's word order; a heading that stops matching fails the build.
function splitTail(text, tail) {
  const t = String(text).trim();
  if (!t.endsWith(tail)) throw new Error(`home.json heading "${t}" no longer ends in "${tail}"`);
  return t.slice(0, t.length - tail.length).trim();
}

// ---------- the hand-torn paper edge of the sheet lying under the hero (deterministic, so a rebuild is byte-stable) ----------
function tornPath(seed, { w = 1600, h = 70, base = 34, amp = 13, n = 120 } = {}) {
  let s = seed >>> 0;
  const rnd = () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const p1 = rnd() * 6, p2 = rnd() * 6;
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const x = (i / n) * w;
    const y = base + Math.sin(i / 14 + p1) * amp * 0.7 + Math.sin(i / 4.6 + p2) * amp * 0.28 + (rnd() - 0.5) * amp * 0.34;
    pts.push(`${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return `M0 ${h}L${pts.join('L')}L${w} ${h}Z`;
}
const tornEdge = (seed, cls = '') => `<svg class="h-torn ${cls}" viewBox="0 0 1600 70" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path class="h-torn__fibre" d="${tornPath(seed, { base: 28 })}"/><path class="h-torn__face" d="${tornPath(seed + 11, { base: 37, amp: 11 })}"/></svg>`;

// ---------- 1 + 2: the pinned scene ----------
function renderScene(ctx, c) {
  const { site } = ctx;
  const h1 = c.of('welcome', 'h1');
  const lede = c.of('welcome', 'p');
  const shop = c.of('welcome', 'button');
  const loop = ctx.images && ctx.images.media && ctx.images.media['hero-loop'];
  const posterW = (loop && loop.w) || 1920;
  const posterH = (loop && loop.h) || 1080;

  const still = loop && loop.poster
    ? `<picture>${loop.posterSmall ? `<source media="(max-width: 720px)" srcset="${escA(loop.posterSmall)}">` : ''}<img class="h-hero__still" src="${escA(loop.poster)}" alt="" width="${escA(posterW)}" height="${escA(posterH)}" fetchpriority="high" decoding="async"></picture>`
    : gimg('g-hero-vessel', { alt: '', eager: true, cls: 'h-hero__still', sizes: HERO_SIZES });
  const video = loop && loop.mp4
    ? `<video class="h-hero__loop" id="h-hero-loop" data-inview-play data-after-load muted loop playsinline preload="none" width="${escA(posterW)}" height="${escA(posterH)}" aria-hidden="true" tabindex="-1">${loop.mp4Small ? `<source src="${escA(loop.mp4Small)}" type="video/mp4" media="(max-width: 720px)">` : ''}<source src="${escA(loop.mp4)}" type="video/mp4"></video>`
    : '';
  const toggle = video
    ? `<button class="video-toggle h-hero__toggle" type="button" data-video-toggle aria-controls="h-hero-loop" aria-pressed="false"><span class="video-toggle__ico" aria-hidden="true"></span><span class="video-toggle__label">Pause motion</span></button>`
    : '';

  const hero = `<section class="h-hero" id="welcome" aria-labelledby="h-h1"${video ? ' data-video-host' : ''}>
<div class="band__clip h-hero__clip" aria-hidden="true">
<div class="h-hero__plate">${still}${video}</div>
<div class="h-hero__enso">${gimg('g-enso', { alt: '', cls: 'h-hero__enso-img', sizes: '(max-width: 720px) 90vw, 46vw', eager: true })}</div>
<div class="h-hero__scrim"></div>
</div>
<div class="wrap wrap--wide h-hero__inner">
<div class="h-hero__type">
<h1 class="h-hero__h1" id="h-h1"><span class="h-hero__lead" data-reveal>${esc(h1.lead)}</span> <span class="h-hero__accent" data-reveal style="--i:1">${brush('the-house-of-zen', { paint: false })}</span></h1>
<p class="h-hero__lede" data-reveal style="--i:2">${inline(lede)}</p>
<div class="btn-row h-hero__ctas" data-reveal style="--i:3">
<a class="btn h-hero__shop"${linkAttrs(menu(ctx))}>${esc(shop.text)}${ico('arrow')}</a>
<a class="btn btn--ghost"${linkAttrs('/dispensary-guides/')}>Start here</a>
</div>
</div>
</div>
<div class="h-hero__chip-at">
<a class="h-hero__chip glass"${linkAttrs('/detroit-dispensary/')}>
<span class="h-hero__chip-row">${ico('clock')}<span>${esc(site.hours.text)}</span></span>
<span class="h-hero__chip-row">${ico('pin')}<span>${esc(site.address.street)},<br>${esc(site.address.city)}, ${esc(site.address.state)} ${esc(site.address.zip)}</span></span>
</a>
</div>
<div class="h-hero__sheet" aria-hidden="true">${tornEdge(7)}</div>
${toggle ? `<div class="h-hero__ctrl">${toggle}</div>` : ''}
</section>`;

  // ---- Products ----
  const head = c.of('products', 'h2');
  const line = c.of('products', 'p');
  const cards = c.of('products', 'cards').items;
  const SPRIG = ['g-cut-sprig', 'g-cut-stones', 'g-cut-sprig', 'g-cut-bowl', 'g-cut-sprig', 'g-cut-stones', 'g-cut-sprig', 'g-cut-bowl'];
  const cardHtml = cards.map((it, i) => {
    const cut = SPRIG[i % SPRIG.length];
    return `<li class="h-pc h-pc--${i + 1}" style="--i:${i}">
<a class="cat-card h-pc__link"${linkAttrs('/products/' + it.slug + '/')}>
<span class="cat-card__cut" aria-hidden="true">${gimg(cut, { alt: '', cls: 'cut', sizes: '200px' })}</span>
<span class="cat-card__media h-pc__media">${photo(ctx, 'hoz/' + it.photo, { alt: '', cls: 'h-pc__img', sizes: '(max-width: 720px) 72vw, 30vw' })}</span>
<span class="h-pc__label"><span class="cat-card__title h-pc__title">${esc(it.title)}</span><span class="cat-card__cta h-pc__cta">${ico('arrow')}</span></span>
</a>
</li>`;
  }).join('\n');
  const finalCard = `<li class="h-pc h-pc--end" style="--i:8">
<a class="h-pc__endlink glass glass--moss"${linkAttrs(menu(ctx))}>
<span class="h-pc__end-enso" aria-hidden="true">${gimg('g-enso', { alt: '', cls: 'cut', sizes: '30vw' })}</span>
<span class="h-pc__end-word">${esc(shop.text)}</span>
<span class="h-pc__end-arrow">${ico('arrow')}</span>
</a>
</li>`;

  const prod = `<section class="h-prod" id="products" aria-labelledby="h-prod-h">
<div class="h-prod__pane glass glass--shoji" aria-hidden="true"></div>
<header class="h-prod__head">
<div class="h-prod__head-in">
<h2 class="h-prod__h" id="h-prod-h">${esc(head.text)}</h2>
<p class="h-prod__line">${inline(line)}</p>
</div>
</header>
<div class="h-prod__rail">
<ul class="h-prod__track" role="list">
${cardHtml}
${finalCard}
</ul>
</div>
</section>`;

  return `<div class="h-scene" data-pin style="--pin-h:420vh">
<div class="pin-stage h-stage">
${hero}
${prod}
</div>
</div>`;
}

// ---------- 3: Find your Balance ----------
function renderBalance(ctx, c) {
  const head = c.of('balance', 'h2');
  const line = c.of('balance', 'p');
  const btn = c.of('balance', 'button');
  const explore = (ctx.ia.nav || []).find((n) => n.mega && (n.mega.groups || []).some((g) => /balance/i.test(g.title)));
  const group = explore ? explore.mega.groups.find((g) => /balance/i.test(g.title)) : null;
  const chips = group ? group.links.map((l, i) => `<li data-reveal style="--i:${i}"><a class="h-bal__chip glass glass--moss"${linkAttrs(l.href)}><span>${esc(l.label)}</span>${ico('arrow')}</a></li>`).join('\n') : '';
  return `<section class="h-bal" id="balance" aria-labelledby="h-bal-h">
<div class="band__clip h-bal__clip" aria-hidden="true">
<div class="h-bal__bg" data-depth="-0.1">${gimg('g-moss-garden', { alt: '', cls: 'h-bal__img', sizes: '100vw' })}</div>
<div class="h-bal__veil"></div>
</div>
<div class="wrap wrap--wide h-bal__inner">
<h2 class="h-bal__h" id="h-bal-h"><span class="h-bal__lead" data-reveal>${esc(splitTail(head.text, 'Balance'))}</span> <span class="h-bal__word" data-reveal style="--i:1">${brush('balance', { paint: false })}</span></h2>
<div class="h-bal__side" data-reveal style="--i:1">
<p class="h-bal__line">${inline(line)}</p>
<a class="btn btn--light"${linkAttrs(menu(ctx))}>${esc(btn.text)}${ico('arrow')}</a>
</div>
${chips ? `<ul class="h-bal__chips" role="list">
${chips}
</ul>` : ''}
${group && group.note ? `<p class="h-bal__note" data-reveal style="--i:6">${esc(group.note)}</p>` : ''}
</div>
</section>`;
}

// ---------- 4: New to The House of Zen ----------
function offerType(text) {
  const m = String(text).match(/^(.*?:)\s*(\d+%)\s+(OFF)\s+(.*)$/);
  if (!m) return `<span class="h-offer__rest">${esc(text)}</span>`;
  return `<span class="h-offer__tag">${esc(m[1])}</span> <span class="h-offer__num">${esc(m[2])}</span> <span class="h-offer__off">${esc(m[3])}</span> <span class="h-offer__rest">${esc(m[4])}</span>`;
}
function renderNew(ctx, c) {
  const head = c.of('new-here', 'h2');
  const tag = c.of('new-here', 'tag');
  const p1 = c.of('new-here', 'p', 0);
  const p2 = c.of('new-here', 'p', 1);
  const list = c.of('new-here', 'ul');
  const btn = c.of('new-here', 'button');
  const lead = splitTail(head.text, 'We’ve Got You.');
  const items = list.items.map((t, i) => `<li class="h-new__item" data-reveal style="--i:${i}"><span class="h-new__node" aria-hidden="true"></span><span class="h-new__text">${rewriteLinks(t)}</span></li>`).join('\n');
  return `<section class="h-new band band--washi edge--torn-top" id="new-here" aria-labelledby="h-new-h">
<div class="band__clip" aria-hidden="true"><span class="band__leaf h-new__leaf"></span></div>
<div class="h-new__stones protrude" aria-hidden="true"><div data-depth="0.05"><div data-float>${gimg('g-cut-stones', { alt: '', cls: 'cut', sizes: '(max-width: 720px) 42vw, 26vw' })}</div></div></div>
<div class="h-new__bud protrude" aria-hidden="true"><div data-depth="-0.08"><div data-float>${photo(ctx, 'hoz/bud-cut.png', { alt: '', cls: 'cut h-new__bud-img', sizes: '(max-width: 720px) 46vw, 26vw' })}</div></div></div>
<div class="wrap wrap--wide h-new__grid">
<div class="h-new__photos">
<figure class="h-new__door frame frame--r1" data-depth="0.04">
<span class="h-new__door-crop">${photo(ctx, 'hoz/exterior-top.jpg', { alt: 'The House of Zen shopfront on Mack Ave: brick wall, the big House of Zen letters and the window with its Open sign', cls: 'h-new__door-img', sizes: '(max-width: 720px) 140vw, 60vw' })}</span>
</figure>
<figure class="h-new__floor frame frame--r2 frame--bare" data-depth="-0.07">
${photo(ctx, 'hoz/counter-wall.jpg', { alt: 'Inside House of Zen: the counter and a wall of products on lit shelves', cls: 'frame__img h-new__floor-img', sizes: '(max-width: 720px) 80vw, 40vw' })}
</figure>
</div>
<div class="h-new__copy">
<h2 class="h-new__h" id="h-new-h"><span class="h-new__lead" data-reveal>${esc(lead)}</span> <span class="h-new__got" data-reveal style="--i:1">${brush('got-you', { paint: false })}<span class="h-new__dot">.</span></span></h2>
<div class="h-new__offer" data-reveal>
<span class="h-offer__ring" aria-hidden="true" data-spin="0.03">${gimg('g-enso', { alt: '', cls: 'cut', sizes: '(max-width: 720px) 86vw, 34vw' })}</span>
<p class="h-offer">${offerType(tag.text)}</p>
</div>
<div class="h-new__guide">
<p class="h-new__p1" data-reveal>${inline(p1)}</p>
<p class="h-new__p2" data-reveal style="--i:1">${inline(p2)}</p>
<div class="h-new__listwrap">
${shell.seam(1, { cls: 'h-new__seam' })}
<ul class="h-new__list" role="list">
${items}
</ul>
</div>
<p class="btn-row h-new__cta" data-reveal><a class="btn btn--gold"${linkAttrs(btn.href)}>${esc(btn.text)}${ico('arrow')}</a></p>
</div>
</div>
</div>
</section>`;
}

// ---------- 5: the family ----------
function renderFamily(ctx, c) {
  const head = c.of('about-zen', 'h2');
  const tag = c.of('about-zen', 'tag');
  const p1 = c.of('about-zen', 'p', 0);
  const p2 = c.of('about-zen', 'p', 1);
  const btn = c.of('about-zen', 'button');
  return `<section class="h-fam" id="about-zen" aria-labelledby="h-fam-h">
<div class="h-fam__pin" data-pin style="--pin-h:250vh">
<div class="pin-stage h-fam__stage">
<div class="h-fam__photo">${photo(ctx, 'hoz/team.jpg', { alt: 'Five women of the House of Zen family, smiling together in navy House of Zen shirts in front of the store’s shelves', cls: 'h-fam__img', sizes: '100vw' })}</div>
</div>
</div>
<div class="h-fam__ground">
<div class="band__clip h-fam__clip" aria-hidden="true"></div>
<div class="wrap wrap--wide h-fam__wrap">
<div class="h-fam__pane glass glass--moss" data-reveal>
<div class="h-fam__head">
<p class="kicker h-fam__kicker">${esc(tag.text)}</p>
<h2 class="h-fam__h" id="h-fam-h">${esc(splitTail(head.text, 'Trust'))} <span class="h-fam__trust">${brush('trust', { paint: false })}</span></h2>
</div>
<div class="h-fam__body">
<p>${inline(p1)}</p>
<p>${inline(p2)}</p>
<p class="btn-row"><a class="btn btn--light"${linkAttrs(btn.href)}>${esc(btn.text)}${ico('arrow')}</a></p>
</div>
</div>
</div>
</div>
</section>`;
}

// ---------- 6: reviews ----------
function renderReviews(ctx, c) {
  const head = c.of('reviews', 'h2');
  const list = c.of('reviews', 'reviews').items;
  const cards = list.map((r, i) => {
    const len = r.paras.join(' ').length;
    const size = len < 215 ? 'short' : len < 350 ? 'mid' : 'long';
    return `<li class="h-rev__item" style="--i:${i}">
<article class="h-rev__card glass glass--strong h-rev__card--${size}">
<span class="h-rev__mark" aria-hidden="true">“</span>
<blockquote class="h-rev__q">${r.paras.map((p) => `<p>${esc(p)}</p>`).join('')}</blockquote>
<footer class="h-rev__who">${shell.stars(r.stars)}<span class="h-rev__name">${esc(r.name)}</span></footer>
</article>
</li>`;
  }).join('\n');
  return `<section class="h-rev" id="reviews" aria-labelledby="h-rev-h">
<div class="band__clip h-rev__clip" aria-hidden="true"><div class="h-rev__bg">${gimg('g-shoji-light', { alt: '', cls: 'h-rev__img', sizes: '100vw' })}</div></div>
<div class="wrap wrap--wide h-rev__grid">
<div class="h-rev__side">
<h2 class="h-rev__h" id="h-rev-h" data-reveal>${esc(head.text)}</h2>
<div class="h-rev__bowl" aria-hidden="true"><div data-float>${gimg('g-cut-bowl', { alt: '', cls: 'cut', sizes: '(max-width: 720px) 40vw, 22vw' })}</div></div>
</div>
<ol class="h-rev__stack" role="list">
${cards}
</ol>
</div>
</section>`;
}

// ---------- 7: Visit ----------
function renderVisit(ctx) {
  const { site } = ctx;
  return `<section class="h-visit" id="visit" aria-labelledby="h-visit-h">
<div class="band__clip h-visit__clip" aria-hidden="true">
<div class="h-visit__bg" data-scale-scroll>${photo(ctx, 'hoz/lounge.jpg', { alt: '', cls: 'h-visit__img', sizes: '100vw' })}</div>
</div>
<div class="wrap wrap--wide h-visit__wrap">
<div class="h-visit__pane glass glass--strong" data-reveal>
<h2 class="h-visit__h" id="h-visit-h">${brush('visit', { paint: false })}</h2>
<address class="h-visit__addr">${esc(site.address.street)}<br>${esc(site.address.city)}, ${esc(site.address.state)} ${esc(site.address.zip)}</address>
<p class="h-visit__row">${ico('clock')}<span>${esc(site.hours.text)}</span></p>
<p class="h-visit__row">${ico('phone')}<a${linkAttrs(site.phoneHref)}>${esc(site.phone)}</a></p>
<p class="btn-row h-visit__cta"><a class="btn"${linkAttrs(directions(ctx))}>Get Directions${ico('arrow')}</a> <a class="btn btn--ghost"${linkAttrs('/contact/')}>Contact</a></p>
</div>
</div>
<div class="h-visit__vase protrude" aria-hidden="true"><div data-depth="0.05">${gimg('g-cut-vase', { alt: '', cls: 'cut h-visit__vase-img', sizes: '(max-width: 720px) 44vw, 24vw' })}</div></div>
</section>`;
}

// ---------- 8: The Journal + Instagram ----------
function renderJournal(ctx, c) {
  const posts = (ctx.posts || []).slice(0, 3); // ctx.posts is sorted by `order`; articles carry no dates
  const cards = posts.map((p, i) => {
    const id = p.image || p.gimg;
    const media = id && (hasGenerated(id) || process.env.ALLOW_MISSING_GEN === '1') ? gimg(id, { alt: p.imageAlt || '', sizes: '(max-width: 720px) 86vw, 34vw' }) : '';
    const meta = [p.categories && p.categories[0] && p.categories[0].name, p.readTime].filter(Boolean).map(esc).join(' <span aria-hidden="true">/</span> ');
    return `<li class="h-j__item h-j__item--${i + 1}" data-reveal style="--i:${i}"><a class="acard h-j__card"${linkAttrs(p.path || '/blog/' + p.slug + '/')}>
<span class="acard__media">${media}</span>
${meta ? `<span class="acard__meta">${meta}</span>` : ''}
<span class="acard__title">${esc(p.h1 || p.title)}</span>
<span class="acard__more">Read${ico('arrow')}</span>
</a></li>`;
  }).join('\n');
  const insta = c.of('instagram', 'instagram');
  return `<section class="h-j band band--rice" id="journal" aria-labelledby="h-j-h">
<div class="wrap wrap--wide h-j__wrap">
<header class="h-j__head" data-reveal>
<div>
<p class="kicker">Reading</p>
<h2 class="h-j__h" id="h-j-h">The ${brush('journal', { paint: false })}</h2>
</div>
<a class="link-arrow"${linkAttrs('/blog/')}>All articles${ico('arrow')}</a>
</header>
${cards ? `<ul class="h-j__list" role="list">
${cards}
</ul>` : ''}
<div class="h-ig" id="instagram">
<span class="h-ig__mark">${markImg(ctx)}</span>
<p class="h-ig__line"><a class="h-ig__handle"${linkAttrs(insta.href)}>${esc(insta.handle)}</a></p>
<p class="btn-row h-ig__links"><a class="btn btn--ghost btn--sm"${linkAttrs(insta.href)}>${ico('instagram')}${esc((ctx.ia.footer && ctx.ia.footer.follow) || 'Follow')}</a> <a class="link-arrow"${linkAttrs(insta.post)}>See the latest post${ico('arrow')}</a></p>
</div>
</div>
</section>`;
}
function markImg(ctx) {
  return shell.markHtml(ctx, { cls: 'h-ig__img', alt: '' }) || `<img class="h-ig__img" src="/assets/brand/hoz-logo-276.png" width="276" height="320" alt="" loading="lazy" decoding="async">`;
}

// ---------- page ----------
function preloadFor(ctx) {
  const loop = ctx.images && ctx.images.media && ctx.images.media['hero-loop'];
  if (loop && loop.poster) return loop.posterSmall
    ? [{ href: loop.poster, as: 'image', media: '(min-width: 721px)', fetchpriority: 'high' }, { href: loop.posterSmall, as: 'image', media: '(max-width: 720px)', fetchpriority: 'high' }]
    : [{ href: loop.poster, as: 'image', fetchpriority: 'high' }];
  if (!hasGenerated('g-hero-vessel')) return [];
  const tag = gimg('g-hero-vessel', { alt: '', sizes: HERO_SIZES });
  const m = tag.match(/srcset="([^"]+)"/);
  return m ? [{ as: 'image', imagesrcset: m[1], imagesizes: HERO_SIZES, fetchpriority: 'high' }] : [];
}

export async function render(ctx) {
  const home = ctx.content.home;
  if (!home) throw new Error('src/content/pages/home.json not loaded');
  const c = reader(home);
  const main = [
    renderScene(ctx, c),
    renderBalance(ctx, c),
    renderNew(ctx, c),
    renderFamily(ctx, c),
    renderReviews(ctx, c),
    renderVisit(ctx),
    renderJournal(ctx, c),
  ].join('\n');

  // Keyboard: the pinned track has no native scrolling, so focusing a card moves the scene to it (t follows the track phase).
  const focusScene = `<script>(function(){var s=document.querySelector('.h-scene');if(!s)return;var l=s.querySelectorAll('.h-prod__track a');l.forEach(function(a,i){a.addEventListener('focus',function(){if(!document.documentElement.classList.contains('pin-on'))return;var t=0.25+0.75*(i/Math.max(1,l.length-1));window.scrollTo({top:s.getBoundingClientRect().top+window.scrollY+t*(s.offsetHeight-window.innerHeight),behavior:'instant'});});});})();</script>`;
  const html = shell.page({
    ctx,
    path: '/',
    title: home.title,
    description: home.description,
    canonical: absUrl(ctx, '/'),
    og: { title: home.title, description: home.description, type: 'website' },
    bodyClass: 'h-page',
    main: main + focusScene,
    crumbs: [],
    preload: preloadFor(ctx),
  });
  return [{ path: '/', html }];
}
