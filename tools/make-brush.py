"""make-brush.py - render the client's brush lettering as artwork: one SVG per fixed brand phrase (outlines, no font file).

The client's accent face is a commercial font. It is NOT copied into this site: only these phrases, as static outlines,
are served (assets/brand/brush/<slug>.svg), used as CSS masks so they take any colour. Needs the TTF from the client's
site in assets/source/live (git-ignored).  python -X utf8 tools/make-brush.py
"""
import json, os
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PHRASES = {
    'the-house-of-zen': 'The House of Zen', 'house-of-zen': 'House of Zen', 'balance': 'Balance', 'find-your-balance': 'Find your Balance',
    'got-you': 'We\u2019ve Got You', 'zen': 'Zen', 'family': 'Family', 'trust': 'Trust', 'purpose': 'Purpose', 'detroit': 'Detroit',
    'welcome': 'Welcome', 'products': 'Products', 'explore': 'Explore', 'rewards': 'Rewards', 'deals': 'Deals', 'journal': 'Journal',
    'resources': 'Resources', 'visit': 'Visit', 'start-here': 'Start here', 'our-team': 'Our Team', 'mindful': 'Mindful', 'questions': 'Questions',
}
font = TTFont(os.path.join(ROOT, 'assets/source/live/Chicago-Brush.ttf'))
gs = font.getGlyphSet(); cmap = font.getBestCmap(); hmtx = font['hmtx']; units = font['head'].unitsPerEm
kern = {}
if 'kern' in font:
    for t in font['kern'].kernTables:
        kern.update(getattr(t, 'kernTable', {}))
out_dir = os.path.join(ROOT, 'assets/brand/brush'); os.makedirs(out_dir, exist_ok=True)
meta = {}
for slug, text in PHRASES.items():
    x = 0; parts = []; xmin = ymin = 1e9; xmax = ymax = -1e9; prev = None
    for ch in text:
        name = cmap.get(ord(ch))
        if name is None:
            raise SystemExit('no glyph for ' + repr(ch))
        if prev and (prev, name) in kern:
            x += kern[(prev, name)]
        pen = SVGPathPen(gs); gs[name].draw(pen); d = pen.getCommands()
        bp = BoundsPen(gs); gs[name].draw(bp)
        if bp.bounds:
            a, b, c, e = bp.bounds
            xmin, ymin, xmax, ymax = min(xmin, x + a), min(ymin, b), max(xmax, x + c), max(ymax, e)
        if d:
            parts.append('<path transform="translate(%d 0)" d="%s"/>' % (x, d))
        x += hmtx[name][0]; prev = name
    pad = round(units * 0.03)
    vx, vy, vw, vh = xmin - pad, -(ymax + pad), xmax - xmin + 2 * pad, ymax - ymin + 2 * pad
    svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="%d %d %d %d"><g transform="scale(1 -1)">%s</g></svg>' % (vx, vy, vw, vh, ''.join(parts))
    open(os.path.join(out_dir, slug + '.svg'), 'w', encoding='utf8', newline='\n').write(svg)
    meta[slug] = {'text': text, 'ar': round(vw / vh, 3), 'emh': round(vh / units, 3)}
    print(slug, meta[slug], len(svg))
json.dump(meta, open(os.path.join(ROOT, 'src/content/brush.json'), 'w', encoding='utf8', newline='\n'), ensure_ascii=False, indent=0)
