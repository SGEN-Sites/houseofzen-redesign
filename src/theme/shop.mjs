// shop.mjs: SHOP lane (docs/BUILD-CONTRACT.md section 6). "Kintsugi Morning" shop pages:
//   /shop/                     hub: hero, the 8 categories as offset .cat-cards on the generated still-life series, steps, closing band
//   /products/<slug>/ x 8      one template, varied per category (CAT table): hero object = still + client photo at another
//                              scroll speed; glue sections alternate with images; tip as designed type; FAQ + FAQPage JSON-LD;
//                              related articles; closing band with "Shop <label>" and the other categories as a swipe row
//   /deals/                    one offer, huge, inside the enso ring; g-deals protruding
//   /rewards/                  g-rewards + g-cut-bowl; visible concept note; steps on glass; demo form on glass over g-ink-mist
//   /detroit-dispensary/       the location template for ONE store
// New words here are neutral glue only (contract D2). Lane classes are prefixed s-.
import { esc, escA, linkAttrs, gimg, photo, absUrl, menu, rewriteLinks, stripTags, demoForm, brush } from './util.mjs';
import { page, pageHero, blocks, seam, bandBg, icon, crumbsHtml, hoursHtml, specTable, stars } from './shell.mjs';

const NAME = ' | House of Zen';

// ---------- small pieces ----------
const rw = (h) => rewriteLinks(h || '');
const text = (h) => stripTags(String(h || '')).replace(/\s+/g, ' ').trim();
const isExt = (u) => /^https?:/i.test(String(u));
const btn = (u, label, cls = 'btn') => `<a class="${cls}"${linkAttrs(u)}>${esc(label)}${isExt(u) ? icon('ext', 'icon--ext') : icon('arrow')}</a>`;
const kicker = (t, cls = '') => (t ? `<p class="kicker${cls ? ' ' + cls : ''}" data-reveal>${esc(t)}</p>` : '');
// one italic word per heading: the last word (the only word on one-word headings); the words themselves never change
function accent(t) {
  const s = String(t || '').trim();
  const m = s.match(/^(.*\s)?(\S+)$/);
  return m ? `${esc(m[1] || '')}<em class="accent">${esc(m[2])}</em>` : esc(s);
}
// a band paints above the band after it, so a protruding object crosses the seam (contract section 3, the recipe)
const band = ({ tone = 'rice', cls = '', clip = '', z = 1, inner = '' }) => `<section class="band band--${tone} s-band${cls ? ' ' + cls : ''}" style="z-index:${z}">
${clip}
${inner}
</section>`;
const clipOf = (...layers) => `<div class="band__clip" aria-hidden="true">${layers.join('')}</div>`;
const leaf = (cls = 's-leaf--tr') => `<span class="band__leaf ${cls}"></span>`;
const cut = (id, cls, sizes, at = 'data-float') => `<span class="cut ${cls}" ${at} aria-hidden="true">${gimg(id, { alt: '', sizes })}</span>`;
const bud = (ctx, cls, sizes, at = 'data-float') => `<span class="cut ${cls}" ${at} aria-hidden="true">${photo(ctx, 'hoz/bud-cut.png', { alt: '', sizes })}</span>`;
// framed picture: the image itself carries .frame__img, so the hover zoom stays inside the hand-thrown corner (components.css)
const framedGen = (id, cls, sizes, eager = false) => `<figure class="frame ${cls}">${gimg(id, { alt: '', cls: 'frame__img', sizes, eager })}</figure>`;
const framedPhoto = (ctx, file, alt, cls, sizes, eager = false) => `<figure class="frame ${cls}">${photo(ctx, file, { alt, cls: 'frame__img', sizes, eager })}</figure>`;

const faqLd = (items) => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: items.map((it) => ({ '@type': 'Question', name: it.q, acceptedAnswer: { '@type': 'Answer', text: text(it.a_html) } })) });
function out(ctx, { path: p, title, description, crumbs, bodyClass, main, jsonld = [] }) {
  return { path: p, html: page({ ctx, path: p, title, description, crumbs, heroCrumbs: true, bodyClass: `page-shop ${bodyClass}`, main, og: { title, description, type: 'website', url: absUrl(ctx, p) }, jsonld }) };
}
// The inner hero always paints above every band below it, so its object can cross the seam.
const hero = (ctx, o) => pageHero({ ctx, ...o, attrs: { style: 'z-index:30' } });

// ---------- content helpers ----------
const homeSection = (ctx, id) => (((ctx.content.home || {}).sections || []).find((s) => s.id === id) || { blocks: [] });
const homeLine = (ctx, id) => { const b = homeSection(ctx, id).blocks.find((x) => x.type === 'p'); return b ? b.html : ''; };
const homeHeading = (ctx, id) => (homeSection(ctx, id).blocks.find((b) => b.type === 'h2') || {}).text || '';
const homeReviews = (ctx) => (homeSection(ctx, 'reviews').blocks.find((b) => b.type === 'reviews') || { items: [] }).items;
const sectionsOf = (res) => (res && Array.isArray(res.sections) ? res.sections : []);
const blocksOf = (s, ...types) => ((s && s.blocks) || []).filter((b) => types.includes(b.type));
const stepsOf = (s) => blocksOf(s, 'steps')[0];
const faqsIn = (res) => sectionsOf(res).flatMap((s) => blocksOf(s, 'faq').flatMap((b) => b.items || []));
const isFaqOnly = (s) => (s.blocks || []).length > 0 && (s.blocks || []).every((b) => b.type === 'faq');

// Section prose: everything except what a designed slot lifts out goes through blocks().
function prose(ctx, list, skip = ['steps', 'faq']) {
  const rest = (list || []).filter((b) => !skip.includes(b.type));
  return rest.length ? `<div class="s-prose">${blocks(rest, ctx)}</div>` : '';
}
const stepsHtml = (ctx, st) => `<div class="s-steps">${blocks([st], ctx)}</div>`;
// The accordions, first question open.
const faqHtml = (ctx, items) => `<div class="s-faq">${blocks([{ type: 'faq', items }], ctx).replace('<details>', '<details open>')}</div>`;

function acard(p, i) {
  const rt = typeof p.readTime === 'number' ? `${p.readTime} min read` : p.readTime;
  return `<li class="s-reads__item s-reads__item--${i + 1}" data-reveal style="--i:${i}"><article class="acard s-acard">
<span class="acard__media s-acard__media" aria-hidden="true">${gimg(p.image, { alt: '', sizes: '(min-width: 1024px) 380px, 76vw' })}</span>
${rt ? `<p class="acard__meta">${esc(rt)}</p>` : ''}
<h3 class="acard__title"><a${linkAttrs(p.path)}>${esc(p.h1)}</a></h3>
<span class="acard__more">Read${icon('arrow')}</span>
</article></li>`;
}
function readsBand(ctx, posts, { tone = 'washi', z = 2, cls = '' } = {}) {
  if (!posts.length) return '';
  return band({ tone, z, cls: `s-reads${cls ? ' ' + cls : ''}`, inner: `<div class="wrap">
<div class="s-reads__head"><div>${kicker('The Journal')}<h2 class="display s-h2" data-reveal style="--i:1">Related <em class="accent">reading</em></h2></div><a class="link-arrow s-reads__all"${linkAttrs('/blog/')}>All articles${icon('arrow')}</a></div>
<ul class="s-reads__list" role="list">${posts.map(acard).join('\n')}</ul>
</div>` });
}

// A small category card, used in swipe rows.
function miniCat(ctx, c, { usePhoto = false } = {}) {
  const sizes = '(min-width: 1024px) 180px, 40vw';
  const pic = usePhoto ? photo(ctx, c.photo, { alt: '', sizes }) : gimg(c.gimg, { alt: '', sizes });
  return `<li class="s-mini__item"><a class="s-mini"${linkAttrs(`/products/${c.slug}/`)}><span class="s-mini__media">${pic}</span><span class="s-mini__title">${esc(c.label)}</span></a></li>`;
}

// ---------- /shop/ ----------
const BIG = '(min-width: 1024px) 40vw, 76vw';
const SMALL = '(min-width: 1024px) 31vw, 76vw';
const CAT_SIZES = [BIG, SMALL, SMALL, BIG, BIG, SMALL, SMALL, BIG];
const CAT_DEPTH = ['-0.02', '0.05', '0.03', '-0.03', '-0.02', '0.06', '0.02', '-0.03'];
const LIFT_CUTS = ['g-cut-sprig', 'g-cut-stones', 'g-cut-bowl', 'g-cut-sprig', 'g-cut-stones', 'g-cut-sprig', 'g-cut-bowl', 'g-cut-stones'];
function hubCard(c, i) {
  return `<li class="s-cats__item s-cats__item--${i + 1}" data-depth="${CAT_DEPTH[i]}">
<a class="cat-card s-cat"${linkAttrs(`/products/${c.slug}/`)} data-reveal style="--i:${i % 2}">
<span class="cat-card__cut" aria-hidden="true">${gimg(LIFT_CUTS[i], { alt: '', sizes: '(min-width: 1024px) 200px, 30vw' })}</span>
<span class="cat-card__media s-cat__media">${gimg(c.gimg, { alt: '', sizes: CAT_SIZES[i] })}</span>
<span class="cat-card__title s-cat__title">${esc(c.label)}</span>
<span class="cat-card__cta s-cat__cta">Explore${icon('arrow')}</span>
</a></li>`;
}
// the closing band every hub keeps: the client's own line and heading
function balanceBand(ctx, z = 1) {
  return band({ tone: 'moss', z, cls: 's-close', clip: bandBg('g-moss-garden', { pos: '50% 40%' }), inner: `<div class="wrap s-close__wrap">
<h2 class="s-close__h" data-reveal>${brush('find-your-balance')}</h2>
<p class="lede s-close__line" data-reveal style="--i:1">${rw(homeLine(ctx, 'balance'))}</p>
<div class="btn-row" data-reveal style="--i:2">${btn(menu(ctx), 'Shop now', 'btn btn--gold')}</div>
</div>${cut('g-cut-stones', 's-close__stones', '(min-width: 1024px) 22vw, 34vw', 'data-depth="0.07"')}` });
}
function renderHub(ctx) {
  const res = ctx.resources.shop || {};
  const p = '/shop/';
  const crumbs = [{ label: 'Home', href: '/' }, { label: res.h1 || 'Products' }];
  const media = `<div class="s-hubobj">
${framedGen('g-art-store', 'frame--float frame--r1 s-hubobj__frame', '(min-width: 1024px) 34vw, 70vw', true)}
${bud(ctx, 's-hubobj__bud', '(min-width: 1024px) 24vw, 40vw', 'data-float data-depth="0.14"')}
</div>`;
  const line = text(homeLine(ctx, 'products'));
  const how = sectionsOf(res)[0];
  const rest = sectionsOf(res).filter((s) => s !== how);
  const main = `${hero(ctx, { kicker: res.kicker || 'Explore', h1Html: brush('products'), lede: esc(res.lede || line), crumbs, cta: btn(menu(ctx), 'Shop now'), media, tone: 'plaster', cls: 's-hubhero' })}
${band({ tone: 'rice', z: 20, cls: 's-cats-band edge--torn-bottom', clip: clipOf(leaf('s-leaf--tr')), inner: `<div class="wrap">
<h2 class="vh">Categories</h2>
<ul class="s-cats" role="list">${ctx.site.categories.map(hubCard).join('\n')}</ul>
</div>` })}
${how ? band({ tone: 'washi', z: 12, cls: 's-how', inner: `<div class="wrap s-how__wrap">
<div class="s-how__head">${kicker(how.kicker)}<h2 class="display s-h2" data-reveal style="--i:1">${accent(how.heading)}</h2></div>
<div class="s-how__art" data-depth="-0.05">${framedPhoto(ctx, 'hoz/counter-wall.jpg', 'The shop floor at House of Zen, with shelves of products along the wall', 'frame--r3 s-how__frame', '(min-width: 1024px) 58vw, 92vw')}</div>
<div class="glass glass--strong s-how__pane" data-reveal data-spot>${stepsOf(how) ? stepsHtml(ctx, stepsOf(how)) : ''}${prose(ctx, how.blocks)}</div>
</div>` }) : ''}
${rest.map((s, i) => noteBand(ctx, s, i, 10 - i)).join('\n')}
${balanceBand(ctx)}`;
  return out(ctx, { path: p, title: res.title || 'Products' + NAME, description: res.description || line, crumbs, bodyClass: 'page-hub', main });
}

// Short supporting section: heading at one side, words at the other.
function noteBand(ctx, s, i, z, { clip = '', glass = false } = {}) {
  const flip = i % 2 === 1;
  return band({ tone: flip ? 'washi' : 'rice', z, cls: 's-note', clip, inner: `<div class="wrap s-note__wrap${flip ? ' s-note__wrap--r' : ''}">
<div class="s-note__head">${kicker(s.kicker)}<h2 class="display s-h3" data-reveal style="--i:1">${accent(s.heading)}</h2></div>
<div class="s-note__body${glass ? ' glass glass--strong s-note__glass' : ''}" data-reveal style="--i:2"${glass ? ' data-spot' : ''}>${prose(ctx, s.blocks)}${stepsOf(s) ? stepsHtml(ctx, stepsOf(s)) : ''}${blocksOf(s, 'faq').length ? faqHtml(ctx, blocksOf(s, 'faq').flatMap((b) => b.items || [])) : ''}</div>
</div>` });
}

// ---------- /products/<slug>/ ----------
// One template, varied by category so the eight pages do not read as clones. `art` = the image beside each glue section, in order
// (client photos start with "hoz/"; everything else is a generated id). `shape` varies the hero object and the row grid.
const CAT = {
  flower: { tone: 'plaster', cut: 'bud', art: ['g-art-store', 'g-art-terpenes'], tip: 'sage', shape: 1 },
  'pre-rolls': { tone: 'washi', cut: 'g-cut-sprig', art: ['hoz/counter-wall.jpg', 'g-art-social'], tip: 'plaster', shape: 2 },
  edibles: { tone: 'plaster', cut: 'g-cut-bowl', art: ['g-recipes', 'g-art-micro'], tip: 'mint', shape: 3 },
  concentrates: { tone: 'washi', cut: 'g-cut-stones', art: ['g-art-honey', 'hoz/counter.jpg'], tip: 'sage', shape: 1 },
  topicals: { tone: 'plaster', cut: 'g-cut-vase', art: ['g-art-evening', 'g-art-label'], tip: 'plaster', shape: 2 },
  cbd: { tone: 'washi', cut: 'g-cut-sprig', art: ['hoz/cbd-hand.jpg', 'g-patient'], tip: 'mint', shape: 3 },
  vaporizers: { tone: 'plaster', cut: 'g-cut-stones', art: ['g-art-creative', 'hoz/counter.jpg'], tip: 'sage', shape: 1 },
  accessories: { tone: 'washi', cut: 'g-cut-bowl', art: ['g-art-glass', 'hoz/entry-plants.jpg'], tip: 'plaster', shape: 2 },
};
const ROW_SIZES = '(min-width: 1024px) 44vw, 80vw';
const ART_ALT = {
  'hoz/counter-wall.jpg': 'The shop floor at House of Zen, with shelves of products along the wall',
  'hoz/counter.jpg': 'The counter at House of Zen, with lit display cases and shelves behind it',
  'hoz/cbd-hand.jpg': 'A dropper bottle of CBD oil on a wooden table beside two hands',
  'hoz/entry-plants.jpg': 'The entry at House of Zen, with indigo planters and art on the wall',
};
const artFrame = (ctx, ref, cls) => (ref.startsWith('hoz/') ? framedPhoto(ctx, ref, ART_ALT[ref] || '', cls, ROW_SIZES) : framedGen(ref, cls, ROW_SIZES));
function productRow(ctx, s, i, decor) {
  const flip = i % 2 === 1;
  const r = ['frame--r1', 'frame--r2', 'frame--r3'][(i + decor.shape) % 3];
  const art = decor.art[i % decor.art.length];
  return band({ tone: i % 2 ? 'washi' : 'rice', z: 20 - i, cls: 's-rowband', inner: `<div class="wrap s-row${flip ? ' s-row--flip' : ''} s-row--${decor.shape}">
<div class="s-row__text">
<h2 class="display s-h3 s-row__h" data-reveal>${accent(s.heading)}</h2>
<div class="prose s-prose" data-reveal style="--i:1">${rw(s.html)}</div>
</div>
<div class="s-row__art" data-depth="${flip ? '0.05' : '0.08'}">${artFrame(ctx, art, `${r} s-row__frame${art === 'hoz/cbd-hand.jpg' ? ' s-row__frame--wide' : ''}`)}</div>
</div>` });
}
function renderProduct(ctx, c) {
  const g = (ctx.glue || {})[c.slug] || {};
  const decor = CAT[c.slug] || CAT.flower;
  const p = `/products/${c.slug}/`;
  const label = g.label || c.label;
  const crumbs = [{ label: 'Home', href: '/' }, { label: 'Products', href: '/shop/' }, { label }];
  const object = decor.cut === 'bud'
    ? bud(ctx, 's-obj__cut', '(min-width: 1024px) 20vw, 36vw', 'data-float data-depth="0.2"')
    : cut(decor.cut, 's-obj__cut', '(min-width: 1024px) 18vw, 32vw', 'data-float data-depth="0.2"');
  const media = `<div class="s-obj s-obj--${decor.shape}">
<div class="s-obj__main" data-depth="-0.05">${framedGen(c.gimg, 'frame--float frame--r1', '(min-width: 1024px) 26vw, 62vw', true)}</div>
<div class="s-obj__photo" data-depth="0.13">${framedPhoto(ctx, c.photo, `${label} at House of Zen`, 'frame--bare frame--r2', '(min-width: 1024px) 18vw, 40vw', true)}</div>
${object}
</div>`;
  const secs = Array.isArray(g.sections) ? g.sections : [];
  const faq = Array.isArray(g.faq) ? g.faq : [];
  const related = (ctx.posts || []).filter((x) => (x.relatedCategories || []).includes(c.slug)).slice(0, 3);
  const others = ctx.site.categories.filter((x) => x.slug !== c.slug);
  const main = `${hero(ctx, { kicker: g.kicker || 'Products', h1Html: accent(g.h1 || label), lede: esc(g.lede || ''), crumbs, cta: btn(menu(ctx, c.slug), `Shop ${label}`), media, tone: decor.tone, cls: 's-prodhero' })}
${secs.map((s, n) => productRow(ctx, s, n, decor)).join('\n')}
${g.tip ? band({ tone: decor.tip, z: 14, cls: 's-tipband', clip: decor.tip === 'sage' ? '' : clipOf(leaf('s-leaf--bl')), inner: `<div class="wrap s-tip">
<span class="s-tip__enso" data-spin="0.02" aria-hidden="true">${gimg('g-enso', { alt: '', sizes: '(min-width: 1024px) 40vw, 80vw' })}</span>
<p class="kicker s-tip__kick" data-reveal>Worth knowing</p>
<p class="s-tip__text" data-reveal style="--i:1">${esc(text(g.tip))}</p>
</div>` }) : ''}
${faq.length ? band({ tone: 'rice', z: 13, cls: 's-faqband', inner: `<div class="wrap s-faqband__wrap"><h2 class="s-faqband__h" data-reveal>${brush('questions')}</h2><div class="s-faqband__list" data-reveal style="--i:1">${faqHtml(ctx, faq)}</div></div>` }) : ''}
${readsBand(ctx, related, { tone: 'washi', z: 12, cls: 'edge--torn-bottom' })}
${band({ tone: 'moss', z: 1, cls: `s-close s-close--prod${related.length ? '' : ' s-close--plain'}`, clip: bandBg('g-moss-garden', { pos: `50% ${30 + decor.shape * 15}%` }), inner: `<div class="wrap s-close__wrap s-close__wrap--row">
<h2 class="display s-close__title" data-reveal>Shop <em class="accent">${esc(label)}</em></h2>
<div class="btn-row" data-reveal style="--i:1">${btn(menu(ctx, c.slug), `Shop ${label}`, 'btn btn--gold')}</div>
</div>
<div class="wrap s-others"><h3 class="s-others__h">Other categories</h3><ul class="s-mini-row" role="list">${others.map((x) => miniCat(ctx, x)).join('\n')}</ul></div>` })}`;
  return out(ctx, { path: p, title: g.title || `${label}${NAME}`, description: g.description || `${label} at House of Zen, ${ctx.site.address.full}.`, crumbs, bodyClass: `page-product page-product--${c.slug}`, main, jsonld: faq.length ? [faqLd(faq)] : [] });
}

// ---------- /deals/ ----------
// "first customer deals: 30% OFF the purchase" -> lead / huge / tail; the words stay in order as one sentence.
function offerHtml(o) {
  const m = String(o || '').match(/^(.*?)(\d+%)\s*(OFF)(.*)$/i);
  if (!m) return `<span class="s-offer__big s-offer__big--line">${esc(o)}</span>`;
  return `<span class="s-offer__lead">${esc(m[1].trim())}</span> <span class="s-offer__big">${esc(m[2])}</span> <span class="s-offer__off">${esc(m[3])}</span> <span class="s-offer__tail">${esc(m[4].trim())}</span>`;
}
function renderDeals(ctx) {
  const res = ctx.resources.deals || {};
  const p = '/deals/';
  const crumbs = [{ label: 'Home', href: '/' }, { label: 'Deals' }];
  const offer = res.offer || ctx.site.offer.firstCustomer;
  const secs = sectionsOf(res);
  const media = `<div class="s-ring">
<span class="s-ring__enso" data-spin="0.02" aria-hidden="true">${gimg('g-enso', { alt: '', sizes: '(min-width: 1024px) 40vw, 86vw', eager: true })}</span>
<p class="s-offer">${offerHtml(offer)}</p>
<div class="s-ring__photo" data-depth="0.12">${framedGen('g-deals', 'frame--float frame--r3 s-ring__frame', '(min-width: 1024px) 24vw, 46vw', true)}</div>
</div>`;
  const main = `${hero(ctx, { kicker: res.kicker || 'Deals', h1Html: brush('deals'), lede: esc(res.lede || ''), crumbs, cta: btn(menu(ctx), 'Shop now'), media, tone: 'washi', cls: 's-dealhero' })}
${secs.map((s, i) => noteBand(ctx, s, i, 20 - i, { clip: i === 0 ? clipOf(leaf('s-leaf--tr')) : i === 1 ? bandBg('g-ink-mist') : '', glass: i === 1 })).join('\n')}
${balanceBand(ctx)}`;
  const faqs = faqsIn(res);
  return out(ctx, { path: p, title: res.title || 'Deals' + NAME, description: res.description || offer, crumbs, bodyClass: 'page-deals', main, jsonld: faqs.length ? [faqLd(faqs)] : [] });
}

// ---------- /rewards/ ----------
function renderRewards(ctx) {
  const res = ctx.resources.rewards || {};
  const p = '/rewards/';
  const crumbs = [{ label: 'Home', href: '/' }, { label: 'Rewards' }];
  const form = res.form || null;
  const media = `<div class="s-rew">
<div class="s-rew__photo" data-depth="-0.04">${framedGen('g-rewards', 'frame--float frame--r2 s-rew__frame', '(min-width: 1024px) 36vw, 86vw', true)}</div>
${cut('g-cut-bowl', 's-rew__bowl', '(min-width: 1024px) 20vw, 34vw', 'data-float data-depth="0.16"')}
</div>`;
  const concept = res.concept ? `<p class="s-concept" data-reveal style="--i:2">${esc(res.concept)}</p>` : '';
  const heroHtml = hero(ctx, { kicker: res.kicker || 'Concept', h1Html: brush('rewards'), lede: esc(res.lede || ''), crumbs, cta: form ? `<a class="btn" href="#s-rewards-form">${esc(form.button)}${icon('arrow')}</a>` : '', media, tone: 'plaster', cls: 's-rewhero' })
    .replace(/(<p class="lede page-hero__lede"[^>]*>[\s\S]*?<\/p>)/, `$1\n${concept}`);
  const bands = sectionsOf(res).map((s, i) => {
    if (!stepsOf(s)) return noteBand(ctx, s, i, 20 - i);
    return band({ tone: 'sage', z: 20 - i, cls: 's-stepsband', clip: clipOf(leaf('s-leaf--tr')), inner: `<div class="wrap">
<div class="s-stepsband__head">${kicker(s.kicker)}<h2 class="display s-h2" data-reveal style="--i:1">${accent(s.heading)}</h2></div>
<div class="glass glass--strong glass--shoji s-stepsband__pane" data-reveal data-spot>${stepsHtml(ctx, stepsOf(s))}</div>
${prose(ctx, s.blocks)}
</div>` });
  });
  const main = `${heroHtml}
${bands.join('\n')}
${form ? band({ tone: 'rice', z: 2, cls: 's-formband', clip: bandBg('g-ink-mist'), inner: `<div class="wrap s-formband__wrap">
<div class="s-formband__head"><h2 class="display s-h2" data-reveal>${accent(form.heading)}</h2>${seam(2, { cls: 's-formband__seam' })}</div>
<div class="glass glass--strong s-formband__pane" data-reveal style="--i:1" data-spot>${demoForm({ id: 's-rewards-form', fields: form.fields || [], button: form.button || 'Submit' })}</div>
</div>` }) : ''}`;
  const faqs = faqsIn(res);
  return out(ctx, { path: p, title: res.title || 'Rewards' + NAME, description: res.description || 'A concept for a House of Zen rewards program.', crumbs, bodyClass: 'page-rewards', main, jsonld: faqs.length ? [faqLd(faqs)] : [] });
}

// ---------- /detroit-dispensary/ ----------
const STORE_REVIEWS = ['Teej J.', 'Carol K.', 'Mike N.'];
function reviewCard(r, i) {
  return `<li class="s-rev__item s-rev__item--${i + 1}" data-depth="${['0.03', '-0.02', '0.05'][i % 3]}"><figure class="glass glass--strong glass--lift s-rev" data-reveal style="--i:${i}" data-spot>
${stars(r.stars || 5)}
<blockquote class="s-rev__q">${(r.paras || []).map((x) => `<p>${esc(x)}</p>`).join('')}</blockquote>
<figcaption class="s-rev__name">${esc(r.name)}</figcaption>
</figure></li>`;
}
// One section of the writer's page by id.
const secById = (list, id) => list.find((s) => s.id === id);
function renderStore(ctx) {
  const res = ctx.resources['detroit-dispensary'] || {};
  const { site } = ctx;
  const p = '/detroit-dispensary/';
  const crumbs = [{ label: 'Home', href: '/' }, { label: 'Dispensary' }];
  const secs = sectionsOf(res).filter((s) => !isFaqOnly(s));
  const details = secById(secs, 'store-details');
  const visiting = secById(secs, 'visiting');
  const carry = secById(secs, 'what-we-carry');
  const others = secs.filter((s) => s !== details && s !== visiting && s !== carry);
  const faqSec = sectionsOf(res).find(isFaqOnly);
  const faqs = faqsIn(res);
  const allRev = homeReviews(ctx);
  const picks = STORE_REVIEWS.map((n) => allRev.find((r) => r.name === n)).filter(Boolean);
  const moreInfo = (ctx.ia.footer.columns || []).find((c) => c.title === 'More information') || { title: 'More information', links: [] };
  const callBtn = (cls = 'btn btn--ghost') => `<a class="${cls}"${linkAttrs(site.phoneHref)}>Call now${icon('phone')}</a>`;
  const dirBtn = (label, cls = 'btn btn--ghost') => `<a class="${cls}"${linkAttrs(site.directions)}>${esc(label)}${icon('pin')}</a>`;
  const ageItem = blocksOf(details, 'ul').flatMap((b) => b.items || []).find((x) => /^<strong>Age:/.test(x));
  const rows = [
    ['Address', `${esc(site.address.street)}<br>${esc(site.address.city)}, ${esc(site.address.state)} ${esc(site.address.zip)}`],
    ['Phone', `<a${linkAttrs(site.phoneHref)}>${esc(site.phone)}</a>`],
    ['Email', `<a${linkAttrs('mailto:' + site.email)}>${esc(site.email)}</a>`],
    ...(ageItem ? [['Age', esc(text(ageItem).replace(/^Age:\s*/, ''))]] : []),
  ];

  const heroHtml = `<section class="page-hero band band--plaster edge--torn-bottom s-storehero" style="z-index:30">
<div class="s-storehero__grid">
<div class="s-storehero__text">
${crumbsHtml(crumbs)}
${kicker(res.kicker || 'Our Detroit dispensary')}
<h1 class="display s-storehero__h1" data-reveal style="--i:1">House of Zen <span class="s-storehero__city">${brush('detroit')}</span></h1>
${res.lede ? `<p class="lede s-storehero__lede" data-reveal style="--i:2">${esc(res.lede)}</p>` : ''}
<div class="btn-row s-storehero__cta" data-reveal style="--i:3">${btn(menu(ctx), 'Shop now')}${dirBtn('Get Directions')}${callBtn()}</div>
</div>
<div class="s-storehero__art">
${framedPhoto(ctx, 'hoz/storefront.jpg', 'The House of Zen storefront on Mack Ave: a warm brick wall, big dark letters and two planters of red flowers', 'frame--bare s-storehero__front', '(min-width: 1024px) 62vw, 100vw', true)}
<div class="s-storehero__door" data-depth="0.1">${framedPhoto(ctx, 'hoz/exterior-top.jpg', 'The big House of Zen letters, the door with its Buddha decal and the OPEN window at 14501 Mack Ave', 'frame--float frame--r2 s-storehero__doorframe', '(min-width: 1024px) 26vw, 40vw', true)}</div>
</div>
</div>
</section>`;

  const detailsBand = band({ tone: 'plaster', z: 20, cls: 's-details', clip: clipOf(gimg('g-brick-dawn', { alt: '', cls: 'band__bg', sizes: '100vw' })), inner: `<div class="wrap wrap--wide s-details__wrap">
<div class="glass glass--strong s-details__pane" data-reveal data-spot>
<div class="s-details__lead">
<h2 class="display s-h3">${accent((details || {}).heading || 'Store details')}</h2>
${prose(ctx, blocksOf(details, 'p'))}
<nav class="s-details__more" aria-label="${escA(moreInfo.title)}">
<h3 class="s-details__h">${esc(moreInfo.title)}</h3>
<ul class="s-details__links" role="list">${moreInfo.links.filter((l) => !/sitemap|accessibility/i.test(l.label)).map((l) => `<li><a class="link-arrow"${linkAttrs(l.href)}>${esc(l.label)}${icon('arrow')}</a></li>`).join('')}</ul>
</nav>
</div>
<div class="s-details__facts">
${hoursHtml(ctx, 's-details__hours')}
${specTable(rows, 's-details__spec')}
<div class="btn-row s-details__btns">${callBtn('btn')}${dirBtn('View on maps')}</div>
</div>
</div>
</div>` });

  const visitBand = band({ tone: 'washi', z: 19, cls: 's-visit', clip: clipOf(leaf('s-leaf--bl')), inner: `<div class="wrap s-visit__wrap">
<div class="s-visit__text">
<h2 class="display s-h2" data-reveal>${accent((visiting || {}).heading || 'Visiting')}</h2>
<div data-reveal style="--i:1">${prose(ctx, (visiting || {}).blocks)}</div>
</div>
<div class="s-visit__art">
<div class="s-visit__lounge" data-depth="-0.04">${framedPhoto(ctx, 'hoz/lounge.jpg', 'The lounge at House of Zen: a gold sunburst mirror, sage chairs and plants', 'frame--r3 s-visit__loungeframe', '(min-width: 1024px) 46vw, 88vw')}</div>
<div class="s-visit__entry" data-depth="0.12">${framedPhoto(ctx, 'hoz/entry-plants.jpg', 'The entry at House of Zen, with indigo planters and art on the wall', 'frame--float frame--r1 s-visit__entryframe', '(min-width: 1024px) 22vw, 44vw')}</div>
${cut('g-cut-sprig', 's-visit__sprig', '(min-width: 1024px) 14vw, 24vw')}
</div>
</div>` });

  const carryBand = band({ tone: 'rice', z: 18, cls: 's-carry', inner: `<div class="wrap">
<div class="s-carry__head"><h2 class="display s-h2" data-reveal>${accent((carry || {}).heading || 'What we carry')}</h2><div data-reveal style="--i:1">${prose(ctx, blocksOf(carry, 'p'))}</div></div>
<ul class="s-mini-row s-mini-row--wide" role="list">${site.categories.map((c) => miniCat(ctx, c, { usePhoto: true })).join('\n')}</ul>
</div>` });

  const reviewsBand = picks.length ? band({ tone: 'rice', z: 17, cls: 's-revband', inner: `<div class="wrap s-revband__head"><h2 class="display s-h2" data-reveal>${accent(homeHeading(ctx, 'reviews'))}</h2></div>
<div class="s-revband__photo">${photo(ctx, 'hoz/counter.jpg', { alt: 'The counter at House of Zen, with lit display cases and shelves behind it', sizes: '100vw', cls: 's-revband__pic', attrs: { 'data-scale-scroll': true } })}</div>
<div class="wrap s-revband__wrap"><ul class="s-rev__list" role="list">${picks.map(reviewCard).join('\n')}</ul></div>` }) : '';

  const otherBands = others.map((s, i) => noteBand(ctx, s, i, 16 - i)).join('\n');

  const faqBand = faqs.length ? band({ tone: 'washi', z: 6, cls: 's-faqband', inner: `<div class="wrap s-faqband__wrap"><h2 class="s-faqband__h" data-reveal>${brush('questions')} <span class="s-faqband__rest">${esc(String((faqSec || {}).heading || '').replace(/^Questions\s*/, ''))}</span></h2><div class="s-faqband__list" data-reveal style="--i:1">${faqHtml(ctx, faqs)}</div></div>` }) : '';

  const mapBand = band({ tone: 'rice', z: 5, cls: 's-mapband', inner: `<div class="wrap s-mapband__wrap">
<div class="s-mapband__text">${kicker('Find us')}<h2 class="display s-h2" data-reveal style="--i:1">14501 Mack <em class="accent">Ave</em></h2><p class="lede" data-reveal style="--i:2">${esc(site.address.city)}, ${esc(site.address.state)} ${esc(site.address.zip)}</p><div class="btn-row s-mapband__btns" data-reveal style="--i:3">${dirBtn('View on maps')}${btn(menu(ctx), 'Shop now')}</div></div>
<div class="s-mapband__art"><div class="frame frame--r2 s-mapband__frame" data-reveal><iframe class="frame__img s-mapband__map" src="${escA(site.mapEmbed)}" title="Map showing House of Zen at ${escA(site.address.full)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div></div>
</div>` });

  const main = [heroHtml, detailsBand, visitBand, carryBand, reviewsBand, otherBands, faqBand, mapBand].filter(Boolean).join('\n');
  const local = {
    '@context': 'https://schema.org', '@type': 'LocalBusiness', name: site.legalName, url: absUrl(ctx, p), telephone: site.phoneHref.replace(/^tel:/, ''), email: site.email,
    image: absUrl(ctx, '/assets/photos/hoz/storefront.jpg'),
    address: { '@type': 'PostalAddress', streetAddress: site.address.street, addressLocality: site.address.city, addressRegion: site.address.state, postalCode: site.address.zip, addressCountry: 'US' },
    openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '09:00', closes: '21:00' }],
    hasMap: site.directions, sameAs: [site.social.instagram],
  };
  return out(ctx, { path: p, title: res.title || site.legalName + NAME, description: res.description || `${site.legalName} at ${site.address.full}. ${site.hours.text}.`, crumbs, bodyClass: 'page-store', main, jsonld: [local, ...(faqs.length ? [faqLd(faqs)] : [])] });
}

export async function render(ctx) {
  return [renderHub(ctx), ...ctx.site.categories.map((c) => renderProduct(ctx, c)), renderDeals(ctx), renderRewards(ctx), renderStore(ctx)];
}
