// util.mjs - shared helpers (main session owns this file; lanes import, never edit: ask through your report).
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from '../lib/paths.mjs';
import { img, picture, imgUrl, hasGenerated } from '../lib/images.mjs';
export { img, picture, imgUrl, hasGenerated };

// Generated image by id (docs/BUILD-CONTRACT.md "Generated image ids"). While IMAGERY is still producing, a lane build
// with ALLOW_MISSING_GEN=1 gets a styled placeholder slot instead of a build failure; the final build (no env) fails on
// any missing id.
export function gimg(id, opts = {}) {
  if (hasGenerated(id) || process.env.ALLOW_MISSING_GEN !== '1') return img(id, opts);
  return `<span class="img-slot ${opts.cls || ''}" data-slot="${String(id).replace(/"/g, '')}" role="img" aria-label="${String(opts.alt || '').replace(/"/g, '&quot;')}"></span>`;
}

export const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export const escA = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export const attrs = (o = {}) => Object.entries(o).filter(([, v]) => v !== false && v != null && v !== '').map(([k, v]) => (v === true ? ` ${k}` : ` ${k}="${escA(v)}"`)).join('');
export const isExternal = (u) => /^(https?:)?\/\//i.test(String(u)) || /^(mailto|tel|sms):/i.test(String(u));

// Internal page paths are directories ("/shop" -> "/shop/"); "#frag" and "?q" survive; files ("/404.html",
// "/assets/...") are left alone. External URLs unchanged.
export function href(u) {
  const s = String(u ?? '');
  if (!s || isExternal(s) || s.startsWith('#')) return s;
  const m = s.match(/^([^?#]*)([?#].*)?$/);
  let p = m[1];
  const rest = m[2] || '';
  if (!p.startsWith('/')) return s;
  if (p.startsWith('/assets/') || /\.[a-z0-9]{2,5}$/i.test(p)) return s;
  if (!p.endsWith('/')) p += '/';
  return p + rest;
}

// <a> attributes for any URL: external links open in a new tab with rel noopener (mailto/tel stay in place).
export function linkAttrs(u, extra = {}) {
  const h = href(String(u ?? ''));
  const ext = /^(https?:)?\/\//i.test(h);
  return attrs({ href: h, ...(ext ? { target: '_blank', rel: 'noopener' } : {}), ...extra });
}

// Client photo by file name under assets/photos, e.g. photo(ctx, 'hoz/lounge.jpg', { alt: '...', sizes: '...' }):
// <img> with WebP variants + srcset, width/height from the file.
export function photo(ctx, file, opts = {}) {
  // A generated stand-in ("g-...") where the client has no usable photo: it keeps its AI label and its honest plan alt, unless the
  // caller marks it decorative with alt: ''.
  const gen = String(file).replace(/^hoz\//, '');
  if (gen.startsWith('g-')) return gimg(gen, { ...opts, alt: opts.alt === '' ? '' : undefined });
  return img({ src: '/assets/photos/' + file, alt: opts.alt ?? '' }, opts);
}

export const slugify = (s) => String(s).toLowerCase().replace(/&[a-z]+;/g, '').replace(/<[^>]+>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const stripTags = (s) => String(s ?? '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

// Absolute URL for canonicals / og:url (site.json origin).
export const absUrl = (ctx, p) => ctx.site.origin + href(p);

// Links inside captured HTML: the client's own absolute URLs become in-site paths; everything else is unchanged.
const LIVE_RE = /^https?:\/\/(?:www\.)?houseofzendetroit\.com/i;
export function liveHref(u) {
  let s = String(u ?? '').trim();
  if (!s || s.startsWith('#') || /^(mailto|tel|sms):/i.test(s)) return s;
  if (/^https?:\/\/(?:www\.)?houseofzendetroit\.com\/stores\//i.test(s)) return s; // the live menu stays live
  if (LIVE_RE.test(s)) s = s.replace(LIVE_RE, '') || '/';
  if (isExternal(s)) return s;
  return href(s);
}
export function rewriteLinks(html) {
  return String(html ?? '').replace(/(<a\b[^>]*?\shref=)(["'])(.*?)\2/gi, (all, pre, q, u) => {
    const raw = u.replace(/&amp;/g, '&').replace(/&#0?38;/g, '&');
    return pre + q + escA(liveHref(raw)) + q;
  });
}

// House of Zen's live online menu (the client's own "Menu" link). menu(ctx) = the menu home; menu(ctx, 'flower') = that
// category on the live menu (site.json menu.categories). Only explicit "Shop" buttons leave the site; in-site browsing
// goes to /products/<slug>/.
export function menu(ctx, slug) {
  const c = (ctx.site && ctx.site.menu) || {};
  if (!slug) return c.base || '#';
  const hit = (c.categories || []).find((x) => x.slug === slug);
  return hit ? hit.url : c.base || '#';
}

// The client's brush lettering, served as outline artwork (fixed phrases, src/content/brush.json; tools/make-brush.py).
// It is a CSS mask, so it takes currentColor: set `color` on it or its parent. The words stay in the DOM for readers.
// Height follows font-size (1em of the surrounding type, tune with --brush-h). data-brush = paint-on reveal (site.js).
let BRUSH = null;
export function brush(slug, { cls = '', paint = true } = {}) {
  if (!BRUSH) BRUSH = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/content/brush.json'), 'utf8'));
  const b = BRUSH[slug];
  if (!b) throw new Error('unknown brush phrase: ' + slug + ' (known: ' + Object.keys(BRUSH).join(', ') + ')');
  const u = `/assets/brand/brush/${slug}.svg`;
  return `<span class="brush${cls ? ' ' + cls : ''}"${paint ? ' data-brush' : ''} style="--ar:${b.ar};-webkit-mask-image:url(${u});mask-image:url(${u})"><span class="vh">${esc(b.text)}</span></span>`;
}

// Directions links are built from the store address, so no distance or travel time is ever stated.
export function directions(ctx) { return ctx.site.directions; }

// Preview forms are NOT wired to any service: every form renders with data-demo-form; site.js stops the submit and
// shows the inline note. Use demoForm() for every form so the wording stays one sentence site-wide.
export const DEMO_NOTE = 'This preview form is not connected yet, so nothing is sent.';
export function demoForm({ id = '', fields = [], button = 'Submit', cls = '', textarea = [] } = {}) {
  const field = (f) => {
    const name = slugify(f);
    if (textarea.includes(f)) return `<label class="demo-form__field demo-form__field--wide"><span class="demo-form__label">${esc(f)}</span><textarea class="demo-form__input" name="${name}" rows="4"></textarea></label>`;
    const type = /email/i.test(f) ? 'email' : 'text';
    return `<label class="demo-form__field"><span class="demo-form__label">${esc(f)}</span><input class="demo-form__input" type="${type}" name="${name}" autocomplete="${/email/i.test(f) ? 'email' : /first/i.test(f) ? 'given-name' : /last/i.test(f) ? 'family-name' : /name/i.test(f) ? 'name' : 'off'}"></label>`;
  };
  return `<form class="demo-form ${cls}" data-demo-form novalidate${id ? ` id="${escA(id)}"` : ''}>
${fields.map(field).join('\n')}
<button class="btn btn--gold demo-form__btn" type="submit">${esc(button)}</button>
<p class="demo-form__note" data-demo-note hidden role="status">${esc(DEMO_NOTE)}</p>
</form>`;
}
