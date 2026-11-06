// pages.mjs - PAGES lane (House of Zen redesign pitch, "Kintsugi Morning"): /about/ /contact/ /privacy-policy/
// /terms-of-use/ /dispensary-guides/ /getting-a-medical-card/ /patient-guide/ /michigan-cannabis-laws/ /faq/
// /accessibility-statement/ /404.html. (/site-map/ is sitemap.mjs.) Captured pages print every block of
// src/content/pages/<slug>.json; resource pages come from ctx.resources (WRITER-C). Internal `_confirm` fields are never
// read. Lane classes carry the p- prefix; everything else is the contract's component classes.
import { page, pageHero, blocks as shellBlocks, seam, crumbsHtml, icon } from './shell.mjs';
import { esc, escA, linkAttrs, gimg, hasGenerated, photo, brush, menu, directions, demoForm, rewriteLinks, stripTags, slugify, absUrl, isExternal } from './util.mjs';

// a generated ground for .band__clip: a missing id stays on the band's token colour (no placeholder in a backdrop)
const ground = (id, o = {}) => (hasGenerated(id) ? gimg(id, { alt: '', cls: 'band__bg', sizes: '100vw', ...o }) : '');
const HOME = { href: '/', label: 'Home' };
const norm = (s) => stripTags(String(s ?? '')).replace(/\s+/g, ' ').trim();
const kick = (t, cls = '') => (t ? `<p class="kicker${cls ? ' ' + cls : ''}">${esc(t)}</p>` : '');
const extIco = (u) => (isExternal(u) && !/^(tel|mailto|sms):/i.test(u) ? icon('ext') : icon('arrow'));
const btn = (u, label, cls = '') => `<a class="btn${cls ? ' ' + cls : ''}"${linkAttrs(u)}><span>${esc(label)}</span>${extIco(u)}</a>`;
const blocksOf = (rec) => (rec.sections || []).flatMap((s) => s.blocks || []);

function out(ctx, { path, title, description, crumbs = [], main, mod, jsonld = [], preload = [] }) {
  return {
    path,
    html: page({
      ctx, path, title, description, canonical: absUrl(ctx, path),
      og: { title, description, type: 'website' },
      jsonld, bodyClass: `p-page p-page--${mod}`, main, crumbs, heroCrumbs: true, preload,
    }),
  };
}

const faqLd = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((it) => ({ '@type': 'Question', name: norm(it.q), acceptedAnswer: { '@type': 'Answer', text: norm(it.a_html ?? it.a) } })),
});

function faqHtml(items = [], { cls = '' } = {}) {
  return `<div class="faq${cls ? ' ' + cls : ''}" data-faq>${items.map((it) => `<details><summary>${esc(norm(it.q))}</summary><div class="faq__a">${rewriteLinks(it.a_html ?? esc(it.a ?? ''))}</div></details>`).join('\n')}</div>`;
}

// ---------- /about/ ----------
function about(ctx) {
  const c = ctx.content.about;
  const sec = Object.fromEntries((c.sections || []).map((s) => [s.id, s]));
  const of = (id, type) => (sec[id] ? sec[id].blocks.filter((b) => b.type === type) : []);
  const crumbs = [HOME, { href: '/about/', label: 'About' }];

  const h1 = of('intro', 'h1')[0] || { lead: 'About', accent: 'The House of Zen' };
  const intro = of('intro', 'p')[0];

  const story = of('story', 'p');
  const storyTag = of('story', 'tag')[0];
  const storyH2 = norm(of('story', 'h2')[0]?.text);
  const [line1, line2 = ''] = storyH2.split(/(?<=\.)\s+/);
  const line2Words = line2.split(' ');
  const line2Last = line2Words.pop() || '';
  const statement = norm(story[2]?.html);
  const statementHtml = /family\.$/.test(statement)
    ? `${esc(statement.replace(/family\.$/, ''))}${brush('family', { cls: 'p-ab-state__brush' })}.`
    : esc(statement);
  // The captured sentence runs together ("community.Our team"): the characters stay exact, the two sentences sit on two lines.
  const todayRaw = String(story[3]?.html ?? '');
  const today = /community\.Our/.test(todayRaw)
    ? `${rewriteLinks(todayRaw.split('Our team')[0])}<span class="p-ab-story__leadin">Our team${rewriteLinks(todayRaw.split('Our team').slice(1).join('Our team'))}</span>`
    : rewriteLinks(todayRaw);

  const teamH2 = of('team', 'h2')[0];
  const teamP = of('team', 'p')[0];
  const team = of('team', 'team')[0]?.items || [];
  const nameHtml = (t) => {
    const parts = String(t.name).split(' ');
    const first = parts.shift();
    return `<li class="p-ab-name${t.role ? ' p-ab-name--owner' : ''}" data-reveal style="--i:${team.indexOf(t)}"><span class="p-ab-name__n"><span>${esc(first)}</span> <span>${esc(parts.join(' '))}</span></span>${t.role ? `<span class="kicker p-ab-name__role">${esc(t.role)}</span>` : ''}</li>`;
  };

  const balP = of('balance', 'p')[0];
  const balBtn = of('balance', 'button')[0] || { text: 'Shop now' };
  const faqH2 = of('faq', 'h2')[0];
  const faqP = of('faq', 'p')[0];
  const faqItems = of('faq', 'faq')[0]?.items || [];

  const main = `<section class="band band--plaster edge--torn-bottom p-ab-hero">
<div class="band__clip"><span class="p-ab-hero__veil"></span></div>
<div class="wrap wrap--wide p-ab-hero__grid">
<div class="p-ab-hero__text">
${crumbsHtml(crumbs)}
<h1 class="display p-ab-hero__h1"><span class="p-ab-hero__lead">${esc(h1.lead)}</span> ${brush('the-house-of-zen', { cls: 'p-ab-hero__brush' })}</h1>
<p class="lede p-ab-hero__lede" data-reveal style="--i:1">${rewriteLinks(intro?.html)}</p>
<div class="btn-row p-ab-hero__cta" data-reveal style="--i:2">${btn(menu(ctx), balBtn.text)}${btn('/detroit-dispensary/', 'Visit us', 'btn--ghost')}</div>
</div>
<div class="p-ab-hero__media">
<div class="p-ab-hero__enso" data-spin="0.02" aria-hidden="true">${gimg('g-enso', { alt: '', sizes: '(min-width: 1024px) 30vw, 60vw', cls: 'cut' })}</div>
<div class="p-ab-hero__depth" data-depth="-0.05">
<figure class="frame frame--r1 p-ab-hero__frame">${photo(ctx, 'hoz/lounge.jpg', { alt: 'The lounge at House of Zen: a gold sunburst mirror on a patterned wall, sage chairs and tall green plants by the window.', sizes: '(min-width: 1024px) 60vw, 94vw', cls: 'frame__img', eager: true })}</figure>
</div>
<div class="p-ab-hero__vase protrude" data-depth="0.09" aria-hidden="true"><div data-float>${gimg('g-cut-vase', { alt: '', sizes: '(min-width: 1024px) 22vw, 36vw', cls: 'cut' })}</div></div>
</div>
</div>
</section>

<section id="story" class="band band--washi p-ab-story">
<div class="band__clip">${photo(ctx, 'hoz/leaf-pattern.png', { alt: '', cls: 'p-ab-story__leaf', sizes: '60vw' })}</div>
${seam(4, { cls: 'p-ab-story__seam' })}
<div class="wrap wrap--wide p-ab-story__grid">
<header class="p-ab-story__head">
${kick(storyTag?.text)}
<h2 class="display p-ab-story__h2" data-reveal="lines"><span class="p-ab-story__l1">${esc(line1)}</span> <span class="p-ab-story__l2">${esc(line2Words.join(' '))} <em class="accent">${esc(line2Last)}</em></span></h2>
</header>
<div class="p-ab-story__photo" data-depth="0.07">
<figure class="frame frame--r2 p-ab-story__frame" data-reveal="wipe">${photo(ctx, 'hoz/entry-plants.jpg', { alt: 'Indigo glazed planters full of green branches by the entry, under a framed painting.', sizes: '(min-width: 1024px) 36vw, 76vw', cls: 'frame__img' })}</figure>
<div class="p-ab-story__sprig protrude" data-depth="-0.05" aria-hidden="true">${gimg('g-cut-sprig', { alt: '', sizes: '(min-width: 1024px) 16vw, 30vw', cls: 'cut' })}</div>
</div>
<div class="p-ab-story__col">
<div class="p-ab-story__intro" data-reveal><p>${rewriteLinks(story[0]?.html)}</p><p>${rewriteLinks(story[1]?.html)}</p></div>
<p class="p-ab-state" data-reveal style="--i:1">${statementHtml}</p>
<p class="p-ab-story__today" data-reveal style="--i:2">${today}</p>
</div>
</div>
</section>

<section id="team" class="band band--mint p-ab-team">
<div class="wrap wrap--wide p-ab-team__wrap">
<header class="p-ab-team__head">
<h2 class="display p-ab-team__h2" data-reveal="lines">${esc(teamH2?.text)}</h2>
<p class="lede p-ab-team__lede" data-reveal style="--i:1">${rewriteLinks(teamP?.html)}</p>
</header>
<div class="p-ab-team__stage">
<figure class="frame frame--r3 p-ab-team__photo">${photo(ctx, 'hoz/team.jpg', { alt: 'Five women of the House of Zen family in navy House of Zen shirts, standing together in the shop and smiling.', sizes: '(min-width: 1560px) 1480px, 96vw', cls: 'frame__img' })}</figure>
<ul class="glass glass--strong p-ab-team__names" role="list">${team.map(nameHtml).join('')}</ul>
</div>
</div>
</section>

<section id="balance" class="band band--moss p-ab-bal">
<div class="band__clip"><div class="p-ab-bal__bg" data-depth="0.1">${ground('g-moss-garden')}</div><span class="p-ab-bal__veil"></span></div>
<div class="wrap wrap--wide p-ab-bal__inner">
<div class="p-ab-bal__enso" data-spin="0.03" aria-hidden="true">${gimg('g-enso', { alt: '', sizes: '(min-width: 1024px) 40vw, 80vw', cls: 'cut' })}</div>
<h2 class="display p-ab-bal__h2"><span class="p-ab-bal__lead">Find your</span> ${brush('balance', { cls: 'p-ab-bal__brush' })}</h2>
<p class="lede p-ab-bal__line" data-reveal>${rewriteLinks(balP?.html)}</p>
<div class="btn-row p-ab-bal__cta" data-reveal style="--i:1">${btn(menu(ctx), balBtn.text, 'btn--gold')}</div>
</div>
<div class="p-ab-bal__bud protrude" data-depth="-0.08" aria-hidden="true"><div data-float>${photo(ctx, 'hoz/bud-cut.png', { alt: '', sizes: '(min-width: 1024px) 34vw, 60vw', cls: 'cut' })}</div></div>
</section>

<section id="faq" class="band band--rice p-ab-faq">
<div class="wrap wrap--wide p-ab-faq__grid">
<header class="p-ab-faq__head">
<h2 class="display p-ab-faq__h2" data-reveal="lines">${esc(faqH2?.text)}</h2>
<p class="p-ab-faq__line" data-reveal style="--i:1">${rewriteLinks(faqP?.html)}</p>
</header>
${faqHtml(faqItems, { cls: 'p-ab-faq__list' })}
</div>
</section>`;

  return out(ctx, { path: '/about/', title: c.title, description: c.description, crumbs, main, mod: 'about', jsonld: faqItems.length ? [faqLd(faqItems)] : [] });
}

// ---------- /contact/ ----------
function contact(ctx) {
  const c = ctx.content.contact;
  const s = ctx.site;
  const blocks = blocksOf(c);
  const crumbs = [HOME, { href: '/contact/', label: 'Contact' }];
  const h1 = blocks.find((b) => b.type === 'h1') || { lead: 'Contact', accent: 'House of Zen' };
  const line = blocks.find((b) => b.type === 'p');
  const details = blocks.filter((b) => b.type === 'detail');
  const form = blocks.find((b) => b.type === 'form') || { fields: [], button: 'Submit' };

  const detailMeta = (d) => {
    if (/location/i.test(d.label)) return { ico: 'pin', href: directions(ctx), cls: 'p-ct-d--loc', depth: 0.03 };
    if (/phone/i.test(d.label)) return { ico: 'phone', href: s.phoneHref, cls: 'p-ct-d--phone', depth: -0.03 };
    if (/email/i.test(d.label)) return { ico: 'mail', href: `mailto:${s.email}`, cls: 'p-ct-d--mail', depth: 0.05 };
    return { ico: 'clock', href: '', cls: 'p-ct-d--hours', depth: -0.02 };
  };
  const detailHtml = (d, i) => {
    const m = detailMeta(d);
    const val = /hours/i.test(d.label) ? s.hours.text : d.value;
    const inner = m.href ? `<a class="p-ct-d__link"${linkAttrs(m.href)}>${esc(val)}</a>` : `<span>${esc(val)}</span>`;
    return `<div class="p-ct-d ${m.cls}" data-depth="${m.depth}"><div class="glass glass--strong glass--lift p-ct-d__pane" data-spot data-reveal style="--i:${i}"><p class="p-ct-d__label">${icon(m.ico)}<span>${esc(d.label)}</span></p><p class="p-ct-d__value">${inner}</p></div></div>`;
  };

  // Client's fields: "Name: First" + "Last" sit under a "Name" group legend, the rest stay as they are.
  const rawFields = form.fields || [];
  const group = (rawFields[0] || '').includes(':') ? rawFields[0].split(':')[0].trim() : '';
  const fields = rawFields.map((f) => (f.includes(':') ? f.split(':').slice(1).join(':').trim() : f));
  const longFields = fields.filter((f) => /message|comment/i.test(f));
  let formHtml = demoForm({ id: 'contact-form', fields, textarea: longFields, button: form.button || 'Submit', cls: 'p-ct-form' });
  if (group) {
    formHtml = formHtml.replace(/(<label class="demo-form__field">[\s\S]*?<\/label>)\s*(<label class="demo-form__field">[\s\S]*?<\/label>)/, (all, a, b) => `<fieldset class="p-ct-form__name"><legend class="demo-form__label p-ct-form__legend">${esc(group)}</legend>${a}\n${b}</fieldset>`);
  }

  const main = `<section class="band band--plaster edge--torn-bottom p-ct-hero">
<div class="band__clip"><div class="p-ct-hero__photo" data-depth="0.06">${photo(ctx, 'hoz/storefront.jpg', { alt: 'The House of Zen storefront: big dark letters on a warm brick wall, with flower planters along the sidewalk.', sizes: '(min-width: 1024px) 72vw, 100vw', cls: 'p-ct-hero__img', eager: true })}</div><span class="p-ct-hero__veil"></span></div>
<div class="wrap wrap--wide p-ct-hero__grid">
<div class="p-ct-hero__text">
${crumbsHtml(crumbs)}
<h1 class="display p-ct-hero__h1"><span class="p-ct-hero__lead">${esc(h1.lead)}</span> ${brush('house-of-zen', { cls: 'p-ct-hero__brush' })}</h1>
<p class="lede p-ct-hero__lede" data-reveal style="--i:1">${rewriteLinks(line?.html)}</p>
</div>
<div class="p-ct-details">${details.map(detailHtml).join('')}</div>
</div>
</section>

<section id="message" class="band band--washi p-ct-body">
<div class="band__clip">${ground('g-ink-mist')}</div>
${seam(4, { cls: 'p-ct-body__seam' })}
<div class="wrap wrap--wide p-ct-body__grid">
<div class="p-ct-formwrap">
<div class="glass glass--strong p-ct-formpane" data-reveal>
${kick('Contact form')}
<h2 class="display p-ct-body__h2">Send a message</h2>
${formHtml}
</div>
</div>
<div class="p-ct-mapwrap">
<div data-depth="0.05">
<figure class="frame frame--r1 p-ct-map" data-reveal="wipe"><iframe class="p-ct-map__iframe" src="${escA(s.mapEmbed)}" title="Map: House of Zen at ${escA(s.address.full)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></figure>
</div>
<div class="p-ct-map__sprig protrude" data-depth="-0.06" aria-hidden="true">${gimg('g-cut-sprig', { alt: '', sizes: '(min-width: 1024px) 18vw, 34vw', cls: 'cut' })}</div>
<p class="p-ct-map__link">${icon('pin')}<a class="link-arrow"${linkAttrs(directions(ctx))}>Open the map in Google Maps${icon('ext')}</a></p>
</div>
</div>
</section>`;

  return out(ctx, { path: '/contact/', title: c.title, description: c.description, crumbs, main, mod: 'contact' });
}

// ---------- legal: verbatim, narrow reading column, sticky contents built from the h2s ----------
function legal(ctx, slug, description) {
  const c = ctx.content[slug];
  const crumbs = [HOME, { href: c.path, label: c.h1 }];
  const used = new Set();
  const idOf = (t) => {
    const base = slugify(t).replace(/^\d+-/, '') || 'section';
    let id = base; let n = 2;
    while (used.has(id)) id = `${base}-${n++}`;
    used.add(id);
    return id;
  };
  const toc = [];
  const list = blocksOf(c).filter((b) => b.type !== 'h1').map((b) => {
    if (b.type !== 'h2') return b;
    const id = idOf(b.text);
    toc.push({ id, text: b.text });
    return { ...b, id };
  });
  const body = shellBlocks(list, ctx);
  const tocList = `<ol class="p-legal__toclist" role="list">${toc.map((t) => `<li><a href="#${escA(t.id)}">${esc(t.text)}</a></li>`).join('')}</ol>`;
  const main = `<section class="band band--rice p-legal__hero">
<div class="wrap wrap--wide p-legal__heroin">
${crumbsHtml(crumbs)}
<h1 class="display p-legal__h1">${esc(c.h1)}</h1>
</div>
</section>
<section class="band band--rice p-legal">
<div class="wrap wrap--wide p-legal__grid">
<nav class="p-legal__toc" aria-label="On this page"><p class="kicker">On this page</p>${tocList}</nav>
<details class="p-legal__tocm"><summary>On this page</summary>${tocList}</details>
<div class="p-legal__prose">
${body}
</div>
</div>
</section>`;
  return out(ctx, { path: c.path, title: c.title, description: c.description || description, crumbs, main, mod: 'legal' });
}

// ---------- resource pages (WRITER-C): the inner-page pattern ----------
const RES = {
  'dispensary-guides': {
    hero: 'g-first-visit', cut: 'g-cut-stones',
    figs: { 'how-to-choose': { photo: 'hoz/counter.jpg', alt: 'The shop floor at House of Zen, with the counter and the shelves behind it.' }, 'first-customer': { photo: 'hoz/exterior-top.jpg', alt: 'The front of House of Zen on Mack Ave: brick wall, the big letters and the door.' } },
  },
  'getting-a-medical-card': {
    hero: 'g-card', cut: 'g-cut-sprig',
    figs: { 'the-program': { gimg: 'g-journal' }, physician: { gimg: 'g-art-evening' } },
  },
  'patient-guide': {
    hero: 'g-patient', cut: 'g-cut-bowl',
    figs: { 'what-to-bring': { photo: 'hoz/counter-wall.jpg', alt: 'The shop floor at House of Zen, with the display wall behind the counter.' }, 'product-forms': { gimg: 'g-art-label' } },
  },
  'michigan-cannabis-laws': {
    hero: 'g-law', heroPos: '72% 50%', cut: 'g-cut-stones', requiredNote: 'As of October 2026. General information, not legal advice.',
    figs: { 'who-can-buy': { gimg: 'g-brick-dawn' }, driving: { gimg: 'g-art-store' }, 'leaving-the-state': { gimg: 'g-art-label' } },
  },
  faq: { hero: 'g-ink-mist', ink: true, heroPos: '30% 80%', cut: 'bud', crumb: 'FAQ', figs: {} },
  'accessibility-statement': { hero: 'g-ink-mist', ink: true, heroPos: '30% 80%', cut: 'g-cut-bowl', figs: {} },
};

function stepsHtml(b) {
  return `<div class="glass p-steps" data-spot><ol class="steps">${(b.items || []).map((st, i) => {
    const title = typeof st === 'string' ? '' : st.title || st.heading || '';
    const text = typeof st === 'string' ? st : st.html ?? (st.text != null ? esc(st.text) : '');
    return `<li class="step" data-reveal style="--i:${i % 5}"><span class="step__num" aria-hidden="true">${i + 1}</span>${title ? `<h3 class="step__title">${esc(norm(title))}</h3>` : ''}${text ? `<div class="step__text">${rewriteLinks(text)}</div>` : ''}</li>`;
  }).join('')}</ol></div>`;
}
function calloutHtml(b) {
  const body = b.html ?? (b.text != null ? esc(b.text) : '');
  return `<aside class="p-callout" data-reveal><div class="p-callout__art" aria-hidden="true">${gimg('g-enso', { alt: '', sizes: '240px', cls: 'cut' })}</div><div class="glass glass--strong p-callout__pane"><div class="p-callout__body">${rewriteLinks(body)}</div></div></aside>`;
}
// Consecutive prose blocks share one blocks() run; steps, callouts and accordions stand on their own.
function resBlocks(list, ctx) {
  const parts = [];
  let run = [];
  const flush = () => { if (run.length) { parts.push(shellBlocks(run, ctx)); run = []; } };
  for (const b of list || []) {
    if (b.type !== 'faq' && b.type !== 'steps' && b.type !== 'callout') { run.push(b); continue; }
    flush();
    if (b.type === 'faq') parts.push(faqHtml(b.items, { cls: 'p-res__faq' }));
    else if (b.type === 'steps') parts.push(stepsHtml(b));
    else parts.push(calloutHtml(b));
  }
  flush();
  return parts.join('\n');
}

// One italic word per heading: the last one.
function headingWithAccent(text) {
  const t = norm(text);
  const i = t.lastIndexOf(' ');
  if (i < 0) return `<em class="accent">${esc(t)}</em>`;
  return `${esc(t.slice(0, i))} <em class="accent">${esc(t.slice(i + 1))}</em>`;
}

function heroMedia(ctx, cfg) {
  const opts = { alt: '', sizes: '(min-width: 1024px) 230px, 34vw', cls: 'cut' };
  const cut = cfg.cut === 'bud' ? photo(ctx, 'hoz/bud-cut.png', opts) : gimg(cfg.cut, opts);
  const pos = cfg.heroPos ? { style: `object-position:${cfg.heroPos}` } : {};
  return `<figure class="frame frame--r2 p-hero__frame">${gimg(cfg.hero, { alt: '', sizes: '(min-width: 1024px) 520px, 92vw', cls: 'frame__img', eager: true, attrs: pos })}</figure>
<div class="page-hero__cut" data-depth="0.08" aria-hidden="true"><div data-float>${cut}</div></div>`;
}

const hasType = (s, t) => (s.blocks || []).some((b) => b.type === t);
// Short sections share a band (up to three); steps and accordion sections have a band of their own.
function chaptersOf(sections, figs) {
  const out = [];
  let run = [];
  const flush = () => { if (run.length) { out.push({ kind: 'prose', secs: run }); run = []; } };
  for (const s of sections) {
    if (hasType(s, 'steps')) { flush(); out.push({ kind: 'steps', secs: [s] }); continue; }
    if (hasType(s, 'faq')) { flush(); out.push({ kind: 'faq', secs: [s] }); continue; }
    if (figs[s.id]) flush();
    run.push(s);
    if (run.length === 3) flush();
  }
  flush();
  return out;
}

function secHtml(s, ctx, i) {
  return `<section${s.id ? ` id="${escA(s.id)}"` : ''} class="p-sec${i % 2 ? ' p-sec--b' : ''}">
<header class="p-sec__head">${kick(s.kicker)}<h2 class="display p-sec__h2" data-reveal="lines">${esc(norm(s.heading))}</h2></header>
<div class="p-sec__body" data-reveal>${resBlocks(s.blocks, ctx)}</div>
</section>`;
}

function resource(ctx, slug) {
  const r = (ctx.resources || {})[slug];
  if (!r) return null;
  const cfg = RES[slug];
  const path = r.path || `/${slug}/`;
  const crumbs = [HOME, { href: path, label: cfg.crumb || norm(r.h1 || r.title) }];
  const lede = norm(r.lede);
  const notes = [r.note].filter(Boolean).map((n) => norm(n));
  // The note must be readable near the top: it follows the line under the H1.
  if (cfg.requiredNote && !lede.includes(cfg.requiredNote) && !notes.some((n) => n.includes(cfg.requiredNote))) notes.unshift(cfg.requiredNote);
  const noteHtml = notes.map((n) => `<p class="p-note">${esc(n)}</p>`).join('');
  const heroHtml = pageHero({
    ctx,
    kicker: r.kicker,
    h1Html: headingWithAccent(r.h1 || r.title),
    lede: `${esc(lede)}${noteHtml ? `</p>${noteHtml.replace(/<\/p>$/, '')}` : ''}`,
    crumbs,
    cta: [{ label: 'Shop now', href: 'menu' }, { label: 'Contact', href: '/contact/' }],
    media: heroMedia(ctx, cfg),
    tone: 'plaster',
    cls: cfg.ink ? 'p-hero p-hero--ink' : 'p-hero',
  });

  const figs = cfg.figs || {};
  const chapters = chaptersOf(r.sections || [], figs);
  const GROUNDS = ['band--rice', 'band--washi', 'band--mint'];
  let g = 0;
  let side = 0;
  let seamed = false;
  const body = chapters.map((c, i) => {
    const first = c.secs[0];
    const fig = c.kind === 'prose' ? figs[first.id] : null;
    const flip = fig ? side++ % 2 === 1 : false;
    const bandCls = c.kind === 'steps' ? 'band--plaster' : GROUNDS[g++ % GROUNDS.length];
    const clip = '';
    const figHtml = fig ? `<div class="p-chap__side"><div class="p-chap__fig" data-depth="0.05"><figure class="frame frame--r${(side % 3) + 1} p-chap__frame" data-reveal="wipe">${fig.photo ? photo(ctx, fig.photo, { alt: fig.alt || '', sizes: '(min-width: 1024px) 34vw, 84vw', cls: 'frame__img' }) : gimg(fig.gimg, { alt: '', sizes: '(min-width: 1024px) 34vw, 84vw', cls: 'frame__img' })}</figure></div></div>` : '';
    const seamHtml = fig && !flip && !seamed ? ((seamed = true), seam(4, { cls: 'p-chap__seam' })) : '';
    const cls = [`p-chap--${c.kind}`, fig ? 'p-chap--fig' : '', flip ? 'p-chap--flip' : '', !fig && i % 2 ? 'p-chap--shift' : '', chapters[i - 1] && chapters[i - 1].hadFig ? 'p-chap--after-fig' : ''].filter(Boolean).join(' ');
    c.hadFig = !!fig;
    return `<section class="band ${bandCls} p-chap ${cls}" style="z-index:${chapters.length - i + 1}">
${clip}
<div class="wrap wrap--wide p-chap__grid">
${seamHtml}<div class="p-chap__main">${c.secs.map((s, j) => secHtml(s, ctx, j)).join('\n')}</div>
${figHtml}
</div>
</section>`;
  }).join('\n');

  const sources = (r.sources || []).map((src) => {
    const url = typeof src === 'string' ? src : src.url || src.href;
    const label = (typeof src === 'object' && (src.label || src.title)) || String(url).replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
    return { url, label, publisher: (typeof src === 'object' && src.publisher) || '' };
  });
  const sourcesHtml = sources.length ? `<section class="band band--rice p-sources">
<div class="wrap wrap--wide p-sources__in">
<h2 class="p-sources__h">Sources</h2>
<ul class="p-sources__list">${sources.map((x) => `<li><a${linkAttrs(x.url)}>${esc(x.label)}</a>${x.publisher ? `<span class="p-sources__pub">${esc(x.publisher)}</span>` : ''}</li>`).join('')}</ul>
</div>
</section>` : '';

  const faqItems = (r.sections || []).flatMap((s) => (s.blocks || []).filter((b) => b.type === 'faq').flatMap((b) => b.items || []));
  return out(ctx, {
    path,
    title: r.title || `${norm(r.h1)} | House of Zen`,
    description: r.description || '',
    crumbs,
    main: `${heroHtml}\n${body}\n${sourcesHtml}`,
    mod: `res p-page--${slug}`,
    jsonld: slug === 'faq' && faqItems.length ? [faqLd(faqItems)] : [],
  });
}

// ---------- /404.html ----------
function notFound(ctx) {
  const main = `<section class="band band--plaster p-404">
<div class="wrap p-404__grid">
<div class="p-404__bowl" aria-hidden="true"><div data-float>${gimg('g-cut-bowl', { alt: '', sizes: '(min-width: 1024px) 34vw, 60vw', cls: 'cut', eager: true })}</div></div>
<div class="p-404__text">
${kick('Page not found')}
<h1 class="display p-404__h1">This page is <em class="accent">not here</em></h1>
<p class="lede">The link may be old, or the address may have a small typo. The rest of the house is just where it was.</p>
<div class="btn-row">${btn('/', 'Back to home')}${btn(menu(ctx), 'See the menu', 'btn--ghost')}</div>
</div>
</div>
</section>`;
  return out(ctx, { path: '/404.html', title: 'Page not found | House of Zen', description: 'This page could not be found on the House of Zen site. Links back to the home page and the menu.', main, mod: 'notfound' });
}

export async function render(ctx) {
  const pages = [
    about(ctx),
    contact(ctx),
    legal(ctx, 'privacy-policy', 'The House of Zen Detroit privacy policy: how information may be collected, used, disclosed and protected through the website and related services.'),
    legal(ctx, 'terms-of-use', 'The House of Zen Detroit terms of use: the terms that govern access to and use of the website.'),
  ];
  for (const slug of Object.keys(RES)) {
    const p = resource(ctx, slug);
    if (p) pages.push(p);
  }
  pages.push(notFound(ctx));
  return pages;
}
