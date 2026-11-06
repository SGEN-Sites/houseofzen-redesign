# Design notes: "Kintsugi Morning"

Kintsugi repairs broken pottery with gold and makes the repair the most beautiful part. House of Zen talks about care, family,
trust and balance, and its logo already is gold and indigo. So the site is a quiet morning room: limewashed plaster and washi
paper, moss, hand-thrown indigo stoneware with gold seams, soft window light. Over it, frosted glass panes slide like shoji
screens.

## The three styles

- **Glassmorphism.** Frosted panes sit only where something varied shows through them: plaster light, moss, ink wash, photographs.
  Hero headlines sit straight on the image with no box. On phones big panes turn opaque, for speed.
- **Luxury typography.** The client's own serif set very large with a lot of empty space around it, its sans for body and labels,
  and its brush lettering for one accent phrase per screen.
- **Wabi sabi.** Nothing is perfectly square: hand-thrown corners that each differ a little, hand-torn paper edges between bands,
  asymmetrical columns, emptiness on purpose, natural materials, and no decoration that is not doing something.

## Depth

Every page has three planes: paper and plaster at the back, glass in the middle, objects in front. The objects (the client's bud
cut-out, an indigo vase, mended bowls, balanced stones) cross section edges and frame edges and move at their own scroll speed, so
the page reads as layers rather than a flat sheet.

## Motion

Scroll-through stages on the home page (the hero's planes separate as a glass pane slides over them; the products run sideways),
reveals, a gold seam that draws itself with the scroll, brush words that paint on, a slowly turning enso. Hover: glass lifts with a
sheen, photographs zoom inside their frames while the object in front moves the other way. Everything is off under
`prefers-reduced-motion`, and every page reads fully without JavaScript.

## Brand kept

Instrument Serif, Lato and Poppins, the client's brush lettering, its moss `#515D30`, olive `#808B55`, sage `#A4A865` and mint-white
ground, the logo's indigo and gold, its leaf art and bud cut-out, its rounded forms, and every word of its own pages.
