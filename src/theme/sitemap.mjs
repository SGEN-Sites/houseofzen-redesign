// sitemap.mjs - PAGES lane: /site-map/. Rendered LAST (index.mjs MODULES), so ctx.pages holds every rendered page: each is
// listed once under Home, Shop, Visit, Resources, Journal or Legal (a page no rule knows lands in Resources, never dropped).
// Labels: ia.json labels first, then the article and resource titles, then the page's own <h1>.
import { esc, linkAttrs, stripTags, absUrl } from './util.mjs';
import { page, crumbsHtml } from './shell.mjs';

const PATH = '/site-map/';
const GROUPS = ['Home', 'Shop', 'Visit', 'Resources', 'Journal', 'Legal'];
const VISIT = ['/about/', '/contact/', '/detroit-dispensary/'];
const SHOP = ['/shop/', '/deals/', '/rewards/'];
const LEGAL = ['/privacy-policy/', '/terms-of-use/', PATH];
const FIRST = ['/', '/shop/', '/blog/', '/detroit-dispensary/', '/about/', '/contact/', '/dispensary-guides/'];

const clean = (t) => stripTags(String(t || '')).replace(/\s+/g, ' ').trim();

function labels(ctx) {
  const L = new Map();
  const put = (u, l) => {
    if (typeof u !== 'string' || !u.startsWith('/') || !l || L.has(u)) return;
    L.set(u, clean(l));
  };
  put('/', 'Home');
  put('/shop/', 'Shop');
  put('/site-map/', 'Sitemap');
  const walk = (o) => {
    if (Array.isArray(o)) o.forEach(walk);
    else if (o && typeof o === 'object') {
      if (typeof o.href === 'string' && (o.label || o.title)) put(o.href, o.label || o.title);
      Object.values(o).forEach(walk);
    }
  };
  walk(ctx.ia && ctx.ia.nav);
  walk(ctx.ia && ctx.ia.footer);
  for (const p of ctx.posts || []) put(p.path || `/blog/${p.slug}/`, p.h1 || p.title);
  for (const r of Object.values(ctx.resources || {})) if (r && r.path) put(r.path, r.h1 || r.title);
  return L;
}

function groupOf(p) {
  if (p === '/') return 'Home';
  if (p.startsWith('/products/') || SHOP.includes(p)) return 'Shop';
  if (VISIT.includes(p)) return 'Visit';
  if (p === '/blog/' || p.startsWith('/blog/')) return 'Journal';
  if (LEGAL.includes(p)) return 'Legal';
  return 'Resources';
}

export async function render(ctx) {
  const L = labels(ctx);
  const h1Of = (html) => {
    const m = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html || '');
    return m ? clean(m[1]) : '';
  };
  const all = [...ctx.pages.keys()].filter((p) => p.endsWith('/'));
  if (!all.includes(PATH)) all.push(PATH);
  const rank = (p) => { const i = FIRST.indexOf(p); return i === -1 ? FIRST.length : i; };
  const entries = all.map((p) => ({ path: p, label: L.get(p) || h1Of((ctx.pages.get(p) || {}).html) || p, group: groupOf(p) }));
  entries.sort((a, b) => rank(a.path) - rank(b.path) || (a.path.split('/').length - b.path.split('/').length) || a.label.localeCompare(b.label));

  const li = (e) => `<li><a class="p-sm__link"${linkAttrs(e.path, e.path === PATH ? { 'aria-current': 'page' } : {})}>${esc(e.label)}</a></li>`;
  const groups = GROUPS.map((g, gi) => {
    const items = entries.filter((e) => e.group === g);
    if (!items.length) return '';
    const id = `sm-${g.toLowerCase()}`;
    const cls = items.length > 12 ? ' p-sm__group--long' : items.length === 1 ? ' p-sm__group--one' : '';
    return `<section class="glass glass--strong p-sm__group${cls}" aria-labelledby="${id}" data-reveal style="--i:${gi % 3}">
<h2 class="p-sm__title" id="${id}">${esc(g)}</h2>
<ul class="p-sm__list" role="list">${items.map(li).join('')}</ul>
</section>`;
  }).join('\n');

  const crumbs = [{ href: '/', label: 'Home' }, { href: PATH, label: 'Sitemap' }];
  const title = 'Sitemap | House of Zen';
  const description = 'A list of the House of Zen website in six groups: home, shop, visit, resources, journal and legal.';
  const main = `<section class="band band--rice p-legal__hero p-sm__hero">
<div class="wrap wrap--wide p-legal__heroin">
${crumbsHtml(crumbs)}
<h1 class="display p-legal__h1">Site<em class="accent">map</em></h1>
<p class="lede p-sm__lede">All ${entries.length} pages of this site, in six groups.</p>
</div>
</section>
<section class="band band--plaster p-sm" aria-label="All pages">
<div class="wrap wrap--wide"><div class="p-sm__grid">${groups}</div></div>
</section>`;

  return [{
    path: PATH,
    html: page({ ctx, path: PATH, title, description, canonical: absUrl(ctx, PATH), og: { title, description, type: 'website' }, bodyClass: 'p-page p-page--sitemap', main, crumbs, heroCrumbs: true }),
  }];
}
