// shell.mjs - the page chrome (FOUNDATION, "KINTSUGI MORNING"): <head>, the moss promo strip, the floating glass main bar
// (Buddha logo larger than the bar, mega panels with image cards, Shop now), the drawer below 1024px, the indigo footer
// with the giant brushed wordmark and its light sweep, the 21+ gate, pageHero(), blocks(), seam(), tornEdge().
//
// API (every lane):
//   page({ ctx, path, title, description, canonical, og, jsonld, bodyClass, main, crumbs, heroCrumbs, scripts, preload })
//     main     the INNER html of <main id="main">. The first band of main runs UNDER the floating bar: the promo strip is
//              in flow, the bar floats over the top of main. So a page's first band must keep its text clear of the bar
//              and the logo: padding-top: var(--hero-top) (components.css). pageHero() does this for you.
//     crumbs   [{ label, href }, ...] or [[href, label], ...]; last = current page. Printed under the bar unless heroCrumbs is
//              true or main already holds a .crumbs. BreadcrumbList JSON-LD is added from crumbs.
//     og       { title, description, type, image, url }; image defaults to g-hero-vessel.
//     jsonld   object or array. A Store block is added on "/" only.
//     scripts  extra file names under /assets/js/. preload [{ href, as, type, media, imagesrcset, imagesizes, fetchpriority }].
//   pageHero({ ctx, kicker, h1Html, lede, crumbs, cta, media, tone, cls, id, attrs })
//     tone     plaster (default) | washi | rice | mint | sage
//     cta      html string, or { label, href } / [{ label, href, ghost }, ...]: href "menu" and "directions" are understood
//     media    html for the right-hand object, e.g.
//              `<figure class="frame frame--float">${photo(ctx,'hoz/lounge.jpg',{cls:'frame__img',alt:'...',sizes:'(min-width: 1024px) 34vw, 80vw'})}</figure>
//               ${gimg('g-cut-sprig',{cls:'cut page-hero__cut',alt:''})}`
//     The next band gets --overhang of extra top padding by itself (.page-hero + .band, .page-hero + section).
//   blocks(list, ctx)      block list -> designed components in a <div class="prose">
//   seam(n, { cls, attrs }) inline SVG kintsugi crack, n = 1 long vertical, 2 long diagonal, 3 long horizontal, 4 short vertical.
//                           Position it with your own class: it is absolute, width from --seam-w. Draws itself with scroll.
//   tornEdge(pos, tone)    'top' | 'bottom', tone rice|washi|mint|plaster|sage|moss|indigo: absolutely placed torn strip.
//   bandBg(id, { pos, cls, alt, opacity }) -> <div class="band__clip"> with a generated ground as a real <img>.
//   icon(name, cls), crumbsHtml(crumbs), logoHtml(ctx, opts), markHtml(ctx, opts), hoursHtml(ctx, cls), specTable(rows, cls),
//   stars(n), CSS_ORDER.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT } from '../lib/paths.mjs';
import { imageSize } from '../lib/images.mjs';
import { esc, escA, attrs, href, linkAttrs, absUrl, gimg, img, imgUrl, photo, hasGenerated, menu, brush, rewriteLinks, liveHref } from './util.mjs';

export const CSS_ORDER = ['fonts', 'tokens', 'base', 'components', 'motion', 'shell', 'home', 'shop', 'learn', 'pages', 'mobile', 'fix'];

const ICONS = {
  ext: '<path d="M7 17 17 7"/><path d="M8.5 7H17v8.5"/>',
  chev: '<path d="m6.5 9.5 5.5 5.5 5.5-5.5"/>',
  menu: '<path d="M4 7.5h16"/><path d="M8 12h12"/><path d="M4 16.5h16"/>',
  close: '<path d="M6 6l12 12"/><path d="M18 6 6 18"/>',
  pin: '<path d="M19 10c0 5.6-7 11-7 11s-7-5.4-7-11a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2.6"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  arrow: '<path d="M4.5 12h15"/><path d="m13.5 6 6 6-6 6"/>',
  tag: '<path d="M12.6 2.8H4.8a2 2 0 0 0-2 2v7.8l8.6 8.6a2.2 2.2 0 0 0 3.1 0l6.7-6.7a2.2 2.2 0 0 0 0-3.1Z"/><circle cx="8" cy="8" r="1.3"/>',
  id: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><circle cx="9" cy="12" r="2.2"/><path d="M14 10h4M14 14h4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  phone: '<path d="M5 3.5h3.6l1.8 4.6-2.4 1.6a11 11 0 0 0 6.3 6.3l1.6-2.4 4.6 1.8V19a1.8 1.8 0 0 1-1.9 1.8A16.5 16.5 0 0 1 3.2 5.4 1.8 1.8 0 0 1 5 3.5Z"/>',
  mail: '<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="m3.5 7.5 8.5 6 8.5-6"/>',
  up: '<path d="M12 19.5v-15"/><path d="m6 10.5 6-6 6 6"/>',
  star: '<path d="m12 3.2 2.7 5.5 6 .9-4.35 4.25 1.03 6L12 17l-5.38 2.85 1.03-6L3.3 9.6l6-.9Z"/>',
  leaf: '<path d="M5 20c0-8.5 5.5-14 15-15-.6 9.5-6.4 15-15 15Z"/><path d="m5 20 8.5-8.5"/>',
  instagram: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="0.8"/>',
  sparkle: '<path d="M12 3.5c.6 4.2 2.3 6 6.5 6.5-4.2.6-5.9 2.3-6.5 6.5-.6-4.2-2.3-5.9-6.5-6.5 4.2-.5 5.9-2.3 6.5-6.5Z"/>',
  gift: '<rect x="3.5" y="8.5" width="17" height="12" rx="1.5"/><path d="M12 8.5v12M3.5 12.5h17"/><path d="M12 8.5c-2-4-6.5-4-6-1.5.3 1.5 3.5 1.5 6 1.5Zm0 0c2-4 6.5-4 6-1.5-.3 1.5-3.5 1.5-6 1.5Z"/>',
  user: '<circle cx="12" cy="8" r="3.8"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>',
  cart: '<path d="M3 4h2.2l2.3 11h10.3L20 7.5H6.4"/><circle cx="9.2" cy="19" r="1.4"/><circle cx="16.6" cy="19" r="1.4"/>',
  quote: '<path d="M9.5 7.5C6.6 8.4 5 10.6 5 13.6V17h4.6v-4.4H7.2c.1-1.8 1-3 2.8-3.6Z"/><path d="M18.5 7.5c-2.9.9-4.5 3.1-4.5 6.1V17h4.6v-4.4h-2.4c.1-1.8 1-3 2.8-3.6Z"/>',
  play: '<path d="M8 5.5v13l10-6.5Z"/>',
  pause: '<path d="M8.5 5.5v13M15.5 5.5v13"/>',
};
export function icon(name, cls = '') {
  return `<svg class="icon${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name] || ICONS.sparkle}</svg>`;
}

// ---------- small helpers ----------
const res = (ctx, h) => (h === 'menu' ? menu(ctx) : h === 'directions' ? ctx.site.directions : h);
const isExt = (u) => /^https?:/i.test(String(u));
const pathOf = (h) => href(String(h || '')).split('#')[0].split('?')[0];
const isCur = (h, p) => !!h && !isExt(h) && !/^(mailto|tel):/i.test(h) && !String(h).includes('#') && pathOf(h) === p;
const cur = (h, p) => (isCur(h, p) ? ' aria-current="page"' : '');
const extIco = (u) => (isExt(u) ? icon('ext', 'icon--ext') : '');
const idOf = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// crumbs: [{ label, href }] or [[href, label]]; the last one is the current page. The "/" separators are drawn by CSS.
const crumbParts = (c) => (Array.isArray(c) ? { href: c[0], label: c[1] } : c || {});
export function crumbsHtml(crumbs = []) {
  if (!crumbs || !crumbs.length) return '';
  return `<nav class="crumbs" aria-label="Breadcrumb"><ol>${crumbs.map((raw, i) => {
    const c = crumbParts(raw);
    return `<li>${i < crumbs.length - 1 && c.href ? `<a${linkAttrs(c.href)}>${esc(c.label)}</a>` : `<span aria-current="page">${esc(c.label)}</span>`}</li>`;
  }).join('')}</ol></nav>`;
}

// ---------- logo + Buddha mark: the sharper files from IMAGERY when they exist ----------
const BRAND_DIR = path.join(ROOT, 'assets/brand');
function brandImg(names) {
  for (const f of names) {
    const file = path.join(BRAND_DIR, f);
    if (!fs.existsSync(file)) continue;
    const s = imageSize(fs.readFileSync(file));
    if (s) return { src: '/assets/brand/' + f, w: s.w, h: s.h, file };
  }
  return null;
}
const logoFile = () => brandImg(['hoz-logo.png', 'hoz-logo-276.png']);
const markFile = () => brandImg(['hoz-mark.png', 'hoz-logo.png', 'hoz-logo-276.png']);

// The sharp brand files are over a megabyte each (measured: hoz-logo.png 1.28 MB, on every page's first load), so pages get small WebP variants at the sizes
// they show: written into the build output, cached in tmp/img-cache like every other variant. If cwebp fails, the page falls back to the original file.
const BRAND_WIDTHS = [176, 264, 352, 528];
const brandMemo = new Map();
function brandVariants(ctx, f) {
  const out = ctx && ctx.out;
  if (!out || !f) return [];
  const memoKey = out + '|' + f.file;
  if (brandMemo.has(memoKey)) return brandMemo.get(memoKey);
  const base = path.basename(f.file).replace(/\.\w+$/, '');
  const st = fs.statSync(f.file);
  const key = st.size.toString(36) + Math.floor(st.mtimeMs).toString(36);
  const cacheDir = path.join(ROOT, 'tmp/img-cache');
  const list = [];
  fs.mkdirSync(cacheDir, { recursive: true });
  fs.mkdirSync(path.join(out, 'assets/brand'), { recursive: true });
  for (const w of BRAND_WIDTHS.filter((x) => x <= f.w)) {
    const cache = path.join(cacheDir, `brand-${base}-${w}-${key}.webp`);
    if (!fs.existsSync(cache)) {
      const part = `${cache}.${process.pid}.tmp.webp`;
      const r = spawnSync('cwebp', ['-quiet', '-m', '6', '-q', '90', '-alpha_q', '100', '-metadata', 'none', '-resize', String(w), '0', f.file, '-o', part]);
      if (r.status !== 0 || !fs.existsSync(part)) { brandMemo.set(memoKey, []); return []; }
      // parallel lane builds share this cache: keep whichever finished first
      try { fs.renameSync(part, cache); } catch (e) { if (!fs.existsSync(cache)) throw e; fs.rmSync(part, { force: true }); }
    }
    fs.copyFileSync(cache, path.join(out, 'assets/brand', `${base}-${w}.webp`));
    list.push({ w, url: `/assets/brand/${base}-${w}.webp` });
  }
  brandMemo.set(memoKey, list);
  return list;
}
// src + srcset + sizes for a brand image; `want` = the width the small fallback src should cover
function brandSrcAttrs(ctx, f, sizes, want = 264) {
  const v = brandVariants(ctx, f);
  if (!v.length) return { src: f.src };
  const pick = v.find((x) => x.w >= want) || v[v.length - 1];
  return { src: pick.url, srcset: v.map((x) => `${x.url} ${x.w}w`).join(', '), sizes };
}

// logoHtml(ctx, { link = true, eager = false, cls = '', current = false, sizes = '' }) -> the House of Zen logo, on its transparent
// ground. With link it is <a class="logo"> to the home page; link: false gives a <span class="logo"> for your own link.
export function logoHtml(ctx, { link = true, eager = false, cls = '', current = false, sizes = '180px' } = {}) {
  const name = (ctx.site && ctx.site.name) || 'House of Zen';
  const L = logoFile();
  const inner = L ? `<img${attrs({ class: 'logo__img', ...brandSrcAttrs(ctx, L, sizes), width: L.w, height: L.h, alt: link ? '' : name, decoding: 'async', loading: eager ? 'eager' : 'lazy' })}>` : `<span class="logo__txt">${esc(name)}</span>`;
  const c = `logo${cls ? ' ' + cls : ''}`;
  if (!link) return `<span class="${c}">${inner}</span>`;
  return `<a class="${c}"${linkAttrs('/')} aria-label="${escA(name)} home"${current ? ' aria-current="page"' : ''}>${inner}</a>`;
}
// markHtml(ctx, { cls, alt }) -> the Buddha mark alone (the full logo until hoz-mark.png lands)
export function markHtml(ctx, { cls = '', alt = '', eager = false, sizes = '180px' } = {}) {
  const M = markFile();
  return M ? `<img${attrs({ class: `mark${cls ? ' ' + cls : ''}`, ...brandSrcAttrs(ctx, M, sizes), width: M.w, height: M.h, alt, decoding: 'async', loading: eager ? 'eager' : 'lazy' })}>` : '';
}

// ---------- hours + spec tables ----------
export function hoursHtml(ctx, cls = '') {
  return `<dl class="hours spec${cls ? ' ' + cls : ''}"><div class="spec__row"><dt>${esc(ctx.site.hours.label)}</dt><dd>${esc(ctx.site.hours.text)}</dd></div></dl>`;
}
// rows = [[key, valueHtml], ...]: the value is trusted html
export function specTable(rows = [], cls = '') {
  return `<dl class="spec${cls ? ' ' + cls : ''}">${(rows || []).map(([k, v]) => `<div class="spec__row"><dt>${esc(k)}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
}
export function stars(n = 5) { return `<span class="stars" role="img" aria-label="${escA(`${n} out of 5 stars`)}" style="--n:${Number(n) || 5}"></span>`; }

// ---------- kintsugi seams + torn edges ----------
let seamCount = 0;
const seamSrc = new Map();
export function seam(n = 1, { cls = '', attrs: at = {} } = {}) {
  const num = [1, 2, 3, 4].includes(Number(n)) ? Number(n) : 1;
  if (!seamSrc.has(num)) seamSrc.set(num, fs.readFileSync(path.join(BRAND_DIR, `seam-${num}.svg`), 'utf8').trim());
  const id = `seam-g${++seamCount}`;
  return seamSrc.get(num).replace(/seam-g/g, id).replace('<svg xmlns="http://www.w3.org/2000/svg"', `<svg class="seam seam--${num}${cls ? ' ' + cls : ''}" data-seam aria-hidden="true" focusable="false"${attrs(at)}`);
}
const TONES = ['rice', 'washi', 'mint', 'plaster', 'sage', 'moss', 'indigo'];
export function tornEdge(pos = 'top', tone = 'washi') {
  const name = String(tone).replace(/^--/, '').replace(/-deep$/, '');
  const t = TONES.includes(name) ? name : 'washi';
  return `<span class="torn torn--${pos === 'bottom' ? 'bottom' : 'top'} torn--${t}" aria-hidden="true"></span>`;
}
// A generated ground as a real <img> inside .band__clip. Missing ids stay on the band's token colour (no placeholder slot).
// The default sizes lets a phone (up to 720px, DPR 3) take the 960px variant, not the 1440: every ground drawn here sits under a veil or opaque glass.
export function bandBg(id, { pos = '', cls = '', alt = '', opacity = '', eager = false, sizes = '(max-width: 720px) 320px, 100vw' } = {}) {
  const style = [pos ? `object-position:${pos}` : '', opacity !== '' ? `opacity:${opacity}` : ''].filter(Boolean).join(';');
  const pic = hasGenerated(id) ? gimg(id, { alt, cls: `band__bg${cls ? ' ' + cls : ''}`, sizes, eager, attrs: style ? { style } : {} }) : '';
  return `<div class="band__clip" aria-hidden="true">${pic}</div>`;
}

// ---------- mega panel images load on first intent: a single data-src per image (no src, no srcset), see site.js primeArt ----------
const BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
function deferImg(html, sizeUrl) {
  if (!/^<img/.test(html)) return html; // a missing generated id: the plaster .img-slot
  return html
    .replace(/\s(srcset|sizes|loading|fetchpriority)="[^"]*"/g, '')
    .replace(/\ssrc="([^"]*)"/, (m, u) => ` src="${BLANK}" data-src="${escA(sizeUrl || u)}"`);
}
const genCard = (id) => deferImg(gimg(id, { alt: '', cls: 'mega__img' }), hasGenerated(id) ? imgUrl(id, 640) : '');
const photoCard = (ctx, file) => deferImg(photo(ctx, file, { alt: '', cls: 'mega__img' }));

function megaFeature(ctx, f, p) {
  const h = res(ctx, f.href);
  return `<a class="mega__feature"${linkAttrs(h)}${cur(h, p)}>
<span class="mega__feature-media">${genCard(f.gimg)}</span>
<span class="mega__feature-body"><span class="mega__feature-t">${esc(f.title)}</span>${f.line ? `<span class="mega__feature-l">${esc(f.line)}</span>` : ''}<span class="mega__go" aria-hidden="true">${icon('arrow')}</span></span>
</a>`;
}
function megaStore(ctx, st) {
  const s = ctx.site;
  return `<div class="mega__store">
<a class="mega__store-media"${linkAttrs(st.href)} aria-label="${escA(st.title)}">${photoCard(ctx, st.photo)}</a>
<div class="mega__store-body">
<a class="mega__store-t"${linkAttrs(st.href)}>${esc(st.title)}</a>
<ul class="mega__store-facts">
<li>${icon('pin')}<a${linkAttrs(s.directions)}>${esc(s.address.full)}</a></li>
<li>${icon('clock')}<span>${esc(s.hours.text)}</span></li>
<li>${icon('phone')}<a${linkAttrs(s.phoneHref)}>${esc(s.phone)}</a></li>
</ul>
</div>
</div>`;
}
function megaGroup(ctx, g, p, i) {
  const head = g.href ? `<a class="mega__h mega__h--link"${linkAttrs(res(ctx, g.href))}${cur(res(ctx, g.href), p)}>${esc(g.title)}${icon('arrow')}</a>` : `<p class="mega__h">${esc(g.title)}</p>`;
  if (g.kind === 'cards') {
    return `<div class="mega__group mega__group--cards mega__group--n${(g.links || []).length}">${head}
<ul class="mega__cards">${(g.links || []).map((l, k) => {
      const h = res(ctx, l.href);
      return `<li><a class="mega__card"${linkAttrs(h)}${cur(h, p)} style="--i:${k}"><span class="mega__card-media">${genCard(l.gimg)}</span><span class="mega__card-t">${esc(l.label)}</span></a></li>`;
    }).join('')}</ul></div>`;
  }
  return `<div class="mega__group mega__group--links">${head}
${g.note ? `<p class="mega__note">${esc(g.note)}</p>` : ''}
<ul class="mega__links">${(g.links || []).map((l) => {
    const h = res(ctx, l.href);
    return `<li><a class="mega__link"${linkAttrs(h)}${cur(h, p)}><span>${esc(l.label)}</span>${l.external || isExt(h) ? icon('ext', 'icon--ext') : icon('arrow', 'icon--go')}</a></li>`;
  }).join('')}</ul></div>`;
}
function navHtml(ctx, p) {
  const s = ctx.site;
  const ia = ctx.ia;
  const items = (ia.nav || []).map((it) => {
    const h = res(ctx, it.href);
    const m = it.mega;
    if (!m) return `<li class="nav__item"><div class="nav__row"><a class="nav__link"${linkAttrs(h)}${cur(h, p)}>${esc(it.label)}</a></div></li>`;
    const id = 'mega-' + idOf(it.label);
    const owns = isCur(h, p);
    const kind = m.store ? 'store' : (m.groups || []).some((g) => (g.links || []).length > 4) ? 'wide' : 'guides';
    return `<li class="nav__item has-mega${owns ? ' is-current' : ''}" data-mega>
<div class="nav__row"><a class="nav__link"${linkAttrs(h)}${cur(h, p)}>${esc(it.label)}</a><button class="nav__more" type="button" aria-expanded="false" aria-controls="${id}" data-mega-trigger>${icon('chev')}<span class="vh">${esc(it.label)} menu</span></button></div>
<div class="mega mega--${kind}" id="${id}" data-mega-panel>
<div class="mega__panel">
${m.feature ? megaFeature(ctx, m.feature, p) : ''}${m.store ? megaStore(ctx, m.store) : ''}
${(m.groups || []).map((g, i) => megaGroup(ctx, g, p, i)).join('\n')}
</div>
</div>
</li>`;
  }).join('\n');
  const pr = ia.promo || {};
  return `<nav class="nav" id="site-nav" aria-label="Main" data-nav>
<div class="nav__drawer-head">${logoHtml(ctx, { cls: 'nav__logo', sizes: '76px' })}<button class="nav__close" type="button" data-nav-close>${icon('close')}<span class="vh">Close menu</span></button></div>
<ul class="nav__list">
${items}
</ul>
<div class="nav__drawer-foot">
<a class="btn btn--gold nav__cta"${linkAttrs(res(ctx, ia.cta.href))}>${esc(ia.cta.label)}${icon('arrow')}</a>
<ul class="nav__quick">
<li>${icon('pin')}<a${linkAttrs(pr.pickup.href)}>${esc(pr.pickup.label)} ${esc(pr.pickup.store)}</a></li>
<li>${icon('clock')}<span>${esc(s.hours.text)}</span></li>
<li>${icon('phone')}<a${linkAttrs(s.phoneHref)}>${esc(s.phone)}</a></li>
${(pr.links || []).map((l) => `<li>${icon('arrow')}<a${linkAttrs(l.href)}${cur(l.href, p)}>${esc(l.label)}</a></li>`).join('')}
</ul>
</div>
</nav>`;
}

function promoHtml(ctx, p) {
  const pr = ctx.ia.promo || {};
  return `<div class="promo" data-promo>
<div class="promo__inner">
<p class="promo__offer"><span class="promo__text">${esc(pr.text)}</span>${pr.link ? `<a class="promo__link"${linkAttrs(pr.link.href)}${cur(pr.link.href, p)}>${esc(pr.link.label)}</a>` : ''}</p>
<ul class="promo__facts">
${pr.pickup ? `<li><a class="promo__link promo__link--plain"${linkAttrs(pr.pickup.href)}${cur(pr.pickup.href, p)}>${icon('pin')}<span>${esc(pr.pickup.label)} <strong>${esc(pr.pickup.store)}</strong></span></a></li>` : ''}
${pr.hours ? `<li class="promo__hours">${esc(pr.hours)}</li>` : ''}
${(pr.links || []).map((l) => `<li><a class="promo__link promo__link--plain"${linkAttrs(l.href)}${cur(l.href, p)}>${esc(l.label)}</a></li>`).join('')}
</ul>
</div>
</div>`;
}

function headerHtml(ctx, p) {
  const ia = ctx.ia;
  const c = res(ctx, ia.cta.href);
  return `${promoHtml(ctx, p)}
<header class="site-header" data-header>
<div class="mainbar">
${logoHtml(ctx, { eager: true, current: p === '/', cls: 'mainbar__logo', sizes: '(max-width: 720px) 64px, (max-width: 1023.98px) 72px, 88px' })}
${navHtml(ctx, p)}
<div class="header-tools">
<a class="btn btn--sm header-cta"${linkAttrs(c)}>${esc(ia.cta.label)}${icon('arrow')}</a>
<button class="nav-toggle" type="button" aria-controls="site-nav" aria-expanded="false" data-nav-toggle>${icon('menu')}<span class="vh">Open menu</span></button>
</div>
</div>
</header>
<div class="nav-scrim" data-nav-scrim hidden></div>`;
}

// ---------- footer ----------
function footerHtml(ctx, p) {
  const s = ctx.site;
  const f = ctx.ia.footer || {};
  const col = (c) => `<div class="footer__col"><h2 class="footer__h">${esc(c.title)}</h2><ul class="footer__links">${(c.links || []).map((l) => { const h = res(ctx, l.href); return `<li><a${linkAttrs(h)}${cur(h, p)}>${esc(l.label)}${extIco(h)}</a></li>`; }).join('')}</ul></div>`;
  return `<footer class="site-footer band band--indigo">
${bandBg('g-indigo-boro', { cls: 'site-footer__bg' })}
${tornEdge('top', 'indigo')}
<div class="wrap wrap--wide footer__inner">
<div class="footer__top">
<div class="footer__brand">
<div class="footer__chip" data-depth="-0.04">${logoHtml(ctx, { cls: 'footer__logo' })}</div>
</div>
<nav class="footer__cols" aria-label="Footer">
${(f.columns || []).map(col).join('\n')}
</nav>
<div class="footer__col footer__visit">
<h2 class="footer__h">Visit</h2>
<address class="footer__addr">
<a${linkAttrs(s.directions)}>${icon('pin')}<span>${esc(s.address.street)}<br>${esc(`${s.address.city}, ${s.address.state} ${s.address.zip}`)}</span></a>
<a${linkAttrs(s.phoneHref)}>${icon('phone')}<span>${esc(s.phone)}</span></a>
<a${linkAttrs('mailto:' + s.email)}>${icon('mail')}<span>${esc(s.email)}</span></a>
<p>${icon('clock')}<span>${esc(s.hours.text)}</span></p>
</address>
<h2 class="footer__h footer__h--follow">${esc(f.follow || 'Follow')}</h2>
<a class="footer__social"${linkAttrs(s.social.instagram)}>${icon('instagram')}<span>${esc(s.social.instagramHandle)}</span><span class="vh"> on Instagram</span></a>
</div>
</div>
</div>
<div class="footer__mark" data-footer-light>
<div class="footer__word">${brush('house-of-zen', { cls: 'footer__brush', paint: false })}</div>
</div>
<div class="wrap wrap--wide footer__bottom">
<p class="footer__legalline">${esc(s.legalLine)}</p>
<p class="footer__copy">${esc(s.copyright)}</p>
<ul class="footer__legal">${(f.legal || []).map((l) => `<li><a${linkAttrs(l.href)}${cur(l.href, p)}>${esc(l.label)}</a></li>`).join('')}</ul>
<a class="footer__totop" href="#top" data-to-top>Back to top${icon('up')}</a>
</div>
</footer>`;
}

// ---------- 21+ gate (D7): words from site.json; hidden in the HTML, so it never blocks without JS ----------
function gateHtml(ctx) {
  const g = ctx.site.ageGate || {};
  return `<div class="age-gate" data-age-gate data-age-key="hoz-age-ok" hidden>
<div class="age-gate__dialog glass glass--strong" role="dialog" aria-modal="true" aria-labelledby="age-gate-q">
<div class="age-gate__mark">${hasGenerated('g-enso') ? gimg('g-enso', { alt: '', cls: 'age-gate__enso', sizes: '220px' }) : ''}${markHtml(ctx, { cls: 'age-gate__buddha', sizes: '150px' })}</div>
<h2 class="age-gate__q" id="age-gate-q">${esc(g.question || '')}</h2>
<div class="btn-row age-gate__actions"><button class="btn btn--gold" type="button" data-age-yes>${esc(g.yes || 'Yes')}</button><button class="btn btn--ghost" type="button" data-age-no>${esc(g.no || 'No')}</button></div>
<label class="age-gate__remember"><input type="checkbox" data-age-remember checked><span>${esc(g.remember || '')}</span></label>
<p class="age-gate__no" data-age-refusal role="alert" hidden>${esc(g.denied || '')}</p>
</div>
</div>`;
}

// ---------- inner page hero (contract section 6): band on plaster or washi, H1 straight on the ground, a framed object at
// the right breaking out of the hero's bottom edge into the next band ----------
function ctaHtml(ctx, cta) {
  if (!cta) return '';
  if (typeof cta === 'string') return cta;
  return [].concat(cta).filter(Boolean).map((c, i) => {
    if (typeof c === 'string') return c;
    const h = res(ctx, c.href);
    const cls = c.cls || (c.ghost || i > 0 ? 'btn btn--ghost' : 'btn');
    return `<a class="${escA(cls)}"${linkAttrs(h)}>${esc(c.label)}${isExt(h) ? icon('ext') : icon('arrow')}</a>`;
  }).join('');
}
const HERO_GROUND = { plaster: 'g-shoji-light', washi: 'g-washi', rice: 'g-washi', mint: '', sage: 'g-washi-sage' };
export function pageHero({ ctx, kicker = '', h1Html = '', lede = '', crumbs = [], cta = null, media = '', tone = 'plaster', cls = '', id = '', attrs: at = {} }) {
  const t = ['plaster', 'washi', 'rice', 'mint', 'sage'].includes(tone) ? tone : 'plaster';
  const c = ctaHtml(ctx, cta);
  return `<section class="page-hero band band--${t} edge--torn-bottom${media ? ' page-hero--media' : ''}${cls ? ' ' + cls : ''}"${id ? ` id="${escA(id)}"` : ''}${attrs(at)}>
<div class="wrap page-hero__inner">
<div class="page-hero__text">
${crumbsHtml(crumbs)}
${kicker ? `<p class="kicker" data-reveal>${esc(kicker)}</p>` : ''}
<h1 class="display page-hero__h1" data-reveal style="--i:1">${h1Html}</h1>
${lede ? `<p class="lede page-hero__lede" data-reveal style="--i:2">${lede}</p>` : ''}
${c ? `<div class="btn-row page-hero__cta" data-reveal style="--i:3">${c}</div>` : ''}
</div>
${media ? `<div class="page-hero__media" data-depth="0.05">${media}</div>` : ''}
</div>
</section>`;
}

// ---------- content blocks -> designed components ----------
function blockImg(b, ctx) {
  const o = { alt: b.alt ?? '', cls: 'frame__img', sizes: '(min-width: 1024px) 640px, 92vw' };
  const pic = b.gimg ? gimg(b.gimg, o) : b.photo ? photo(ctx, b.photo, o) : '';
  return pic ? `<figure class="frame prose__figure">${pic}</figure>` : '';
}
const stepItem = (it, i) => {
  const title = typeof it === 'string' ? '' : it.title || it.heading || '';
  const raw = typeof it === 'string' ? it : it.html || it.text || '';
  const text = it.html || /<[a-z]/i.test(raw) ? rewriteLinks(raw) : esc(raw); // "text" is plain unless it carries markup
  return `<li class="step" data-reveal style="--i:${i}"><span class="step__num" aria-hidden="true">${i + 1}</span>${title ? `<h3 class="step__title">${esc(title)}</h3>` : ''}${text ? `<div class="step__text">${text}</div>` : ''}</li>`;
};
export function blocks(list = [], ctx) {
  const out = [];
  let group = null; // consecutive detail or button blocks share one wrapper
  const flush = () => {
    if (!group) return;
    if (group.kind === 'detail') out.push(`<dl class="spec prose__spec">${group.items.join('')}</dl>`);
    if (group.kind === 'button') out.push(`<div class="btn-row prose__btns">${group.items.join('')}</div>`);
    group = null;
  };
  const add = (kind, html) => { if (!group || group.kind !== kind) { flush(); group = { kind, items: [] }; } group.items.push(html); };
  (list || []).forEach((b, i) => {
    if (!b) return;
    switch (b.type) {
      case 'detail': add('detail', `<div class="spec__row"><dt>${esc(b.label)}</dt><dd>${rewriteLinks(b.value ?? b.html ?? '')}</dd></div>`); return;
      case 'button': {
        const h = ctx ? res(ctx, liveHref(b.href)) : b.href;
        add('button', `<a class="btn${group && group.kind === 'button' && group.items.length ? ' btn--ghost' : ''}"${linkAttrs(h)}>${esc(b.text)}${isExt(h) ? icon('ext') : icon('arrow')}</a>`);
        return;
      }
      default: flush();
    }
    switch (b.type) {
      case 'p': out.push(`<p>${rewriteLinks(b.html ?? esc(b.text))}</p>`); break;
      case 'h1': case 'h2': case 'h3': case 'h4': {
        const lvl = b.type === 'h1' ? 'h2' : b.type; // a page has one h1: the hero's
        out.push(`<${lvl} class="prose__${lvl}"${b.id ? ` id="${escA(b.id)}"` : ''}>${esc(b.text)}</${lvl}>`);
        break;
      }
      case 'ul': case 'ol': out.push(`<${b.type}>${(b.items || []).map((x) => `<li>${rewriteLinks(typeof x === 'string' ? x : x.html ?? esc(x.text))}</li>`).join('')}</${b.type}>`); break;
      case 'tag': out.push(`<p class="tag prose__tag">${esc(b.text)}</p>`); break;
      case 'callout': out.push(`<aside class="callout">${rewriteLinks(b.html ?? esc(b.text))}</aside>`); break;
      case 'faq': out.push(`<div class="faq prose__faq" data-faq>${(b.items || []).map((x) => `<details><summary>${esc(x.q)}</summary><div class="faq__a">${rewriteLinks(x.a_html ?? esc(x.a))}</div></details>`).join('')}</div>`); break;
      case 'img': out.push(blockImg(b, ctx)); break;
      case 'steps': out.push(`<ol class="steps">${(b.items || []).map(stepItem).join('')}</ol>`); break;
      case 'cards': out.push(`<ul class="prose__links">${(b.items || []).map((x) => `<li><a${linkAttrs(x.href || (x.slug ? `/products/${x.slug}/` : '#'))}>${esc(x.title)}</a></li>`).join('')}</ul>`); break;
      case 'reviews': out.push((b.items || []).map((x) => `<blockquote class="prose__quote">${stars(x.stars || 5)}${(x.paras || []).map((q) => `<p>${esc(q)}</p>`).join('')}<footer>${esc(x.name)}</footer></blockquote>`).join('')); break;
      case 'team': out.push(`<ul>${(b.items || []).map((x) => `<li>${esc(x.name)}${x.role ? `, ${esc(x.role)}` : ''}</li>`).join('')}</ul>`); break;
      case 'instagram': out.push(`<p><a${linkAttrs(b.href)}>${esc(b.handle)}</a></p>`); break;
      default: if (b.html) out.push(`<div>${rewriteLinks(b.html)}</div>`);
    }
  });
  flush();
  return `<div class="prose">\n${out.filter(Boolean).join('\n')}\n</div>`;
}

// ---------- head ----------
function ogImage(ctx, og) {
  let u = og.image;
  if (!u && hasGenerated('g-hero-vessel')) u = imgUrl('g-hero-vessel', 1440);
  if (!u) return '';
  return /^https?:/i.test(u) ? u : (ctx.site.origin || '') + u;
}
function storeLd(ctx) {
  const s = ctx.site;
  const a = s.address || {};
  return {
    '@context': 'https://schema.org', '@type': 'Store', name: s.name, legalName: s.legalName, url: s.origin + '/',
    telephone: s.phoneHref.replace(/^tel:/, ''), email: s.email,
    address: { '@type': 'PostalAddress', streetAddress: a.street, addressLocality: a.city, addressRegion: a.state, postalCode: a.zip, addressCountry: 'US' },
    openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '09:00', closes: '21:00' }],
    hasMap: s.directions, sameAs: [s.social.instagram],
  };
}
// The paper grounds as tokens: real generated files when delivered; a band stays on its token colour until then.
function textureCss() {
  const v = (name, id, w) => (hasGenerated(id) ? `${name}:url(${imgUrl(id, w)});` : '');
  const big = v('--tex-washi', 'g-washi', 960) + v('--tex-sage', 'g-washi-sage', 960) + v('--tex-shoji', 'g-shoji-light', 1920) + v('--tex-moss', 'g-moss-garden', 1920) + v('--tex-indigo', 'g-indigo-boro', 1920);
  const small = v('--tex-shoji', 'g-shoji-light', 960) + v('--tex-moss', 'g-moss-garden', 960) + v('--tex-indigo', 'g-indigo-boro', 960);
  if (!big) return '';
  return `<style>:root{${big}}${small ? `@media (max-width:720px){:root{${small}}}` : ''}</style>`;
}
const brandFile = (f) => fs.existsSync(path.join(BRAND_DIR, f));

export function page({ ctx, path: p, title, description, canonical, og = {}, jsonld = [], bodyClass = '', main = '', crumbs = [], heroCrumbs = false, scripts = [], preload = [] }) {
  og = og || {};
  const can = canonical || absUrl(ctx, p);
  const css = (ctx.cssFiles || []).map((f) => `<link rel="stylesheet" href="/assets/css/${f}.css">`).join('\n');
  const lds = [].concat(jsonld || []).filter(Boolean);
  const types = lds.map((o) => o['@type']);
  if (crumbs && crumbs.length > 1 && !types.includes('BreadcrumbList')) {
    lds.push({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: crumbs.map((raw, i) => { const c = crumbParts(raw); return { '@type': 'ListItem', position: i + 1, name: c.label, item: absUrl(ctx, c.href || p) }; }) });
  }
  if (p === '/' && !types.some((x) => /Store|LocalBusiness/.test(String(x)))) lds.push(storeLd(ctx));
  const ld = lds.map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`).join('\n');
  const pre = (preload || []).filter(Boolean).map((x) => `<link rel="preload"${attrs(x)}>`).join('\n');
  const js = [...new Set(['site.js', ...(scripts || [])])].filter((f) => !ctx.jsFiles || ctx.jsFiles.includes(f));
  const ogi = ogImage(ctx, og);
  const printCrumbs = crumbs && crumbs.length && !heroCrumbs && !/class="crumbs"/.test(main);
  return `<!doctype html>
<html lang="en-US">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${escA(description)}">
<link rel="canonical" href="${escA(can)}">
<meta property="og:site_name" content="${escA(ctx.site.name)}">
<meta property="og:title" content="${escA(og.title || title)}">
<meta property="og:description" content="${escA(og.description || description)}">
<meta property="og:url" content="${escA(og.url || can)}">
<meta property="og:type" content="${escA(og.type || 'website')}">
${ogi ? `<meta property="og:image" content="${escA(ogi)}">\n<meta name="twitter:card" content="summary_large_image">` : '<meta name="twitter:card" content="summary">'}
<meta name="theme-color" content="#515d30">
${brandFile('favicon-32.png') ? '<link rel="icon" href="/favicon-32.png" sizes="32x32">' : ''}
${brandFile('favicon.ico') ? '<link rel="alternate icon" href="/favicon.ico">' : ''}
${brandFile('apple-touch-icon.png') ? '<link rel="apple-touch-icon" href="/apple-touch-icon.png">' : ''}
<link rel="preload" href="/assets/fonts/instrument-serif-normal-latin.woff2" as="font" type="font/woff2" crossorigin>
${pre}
${css}
${textureCss()}
<script>(function(d){var r=d.documentElement;r.classList.add('js');var ok=false;try{ok=localStorage.getItem('hoz-age-ok')==='1'||sessionStorage.getItem('hoz-age-ok')==='1'}catch(e){}if(!ok){r.classList.add('gate-pending');setTimeout(function(){if(!window.hozReady)r.classList.remove('gate-pending')},4000)}})(document);</script>
${ld}
</head>
<body id="top"${attrs({ class: bodyClass })}>
<div class="site">
${headerHtml(ctx, p)}
${printCrumbs ? `<div class="crumbs-bar"><div class="wrap wrap--wide">${crumbsHtml(crumbs)}</div></div>` : ''}
<main id="main">
${main}
</main>
${footerHtml(ctx, p)}
</div>
${gateHtml(ctx)}
${js.map((f) => `<script src="/assets/js/${escA(f)}" defer></script>`).join('\n')}
</body>
</html>`;
}
