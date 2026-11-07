# Media

Everything on this site that is not a client photograph is AI-generated mood imagery. None of it shows House of Zen's store, staff, customers or products. Every generated still carries the IPTC `trainedAlgorithmicMedia` label in its metadata, and so does every WebP variant the build makes from it.

## Generated stills

Model: FLUX 1.1 pro ultra, reviewed by eye, then cropped, graded or composited as noted. The prompt, seed and review note of each image are in `src/content/image-plan.json` and in the sidecar `<file>.json` next to it in `assets/generated/`.

| Id | What it is | Work after generation |
|---|---|---|
| `g-hero-vessel` | Indigo vase with gold seams and a green branch on a stone ledge, pale plaster wall in morning light | Frame shifted to place the vase, wall extended and evened, soft lattice shadow added |
| `g-shoji-light` | Empty plaster wall with a lattice of window light | Cropped, toned |
| `g-moss-garden` | Moss garden, raked gravel, stones, dim dawn light | Backdrop regraded to dim mist, moss muted |
| `g-ink-mist` | Pale ink wash on washi paper | Ink softened, thinned and recoloured |
| `g-brick-dawn` | Weathered brick with leaf shadows, a small indigo bowl on a ledge | Colour calmed |
| `g-indigo-boro` | Dark indigo patched cloth | Stitches dimmed, a few turned gold |
| `g-washi` | Off-white washi paper, a repeating tile | Flattened, wrapped to tile, fibres drawn |
| `g-washi-sage` | The same paper in pale sage, a repeating tile | Made from the `g-washi` source, tinted |
| `g-cat-flower` | Cured cannabis buds in a stoneware dish | Cropped to 4:5, lifted |
| `g-cat-prerolls` | Two cone joints with twisted tips on slate | Retouched: tapered, band removed, twists drawn, slate rebuilt |
| `g-cat-edibles` | Plain dark chocolate squares on a rough plate | Cropped to 4:5 |
| `g-cat-concentrates` | Golden resin in a small glass jar on a stone | Cropped to 4:5 |
| `g-cat-topicals` | Plain stoneware balm jar on linen | Cropped to 4:5 |
| `g-cat-cbd` | Unlabelled amber dropper bottle, river stone, a leaf | Cropped to 4:5, leaf calmed |
| `g-cat-vaporizers` | Plain vape pen on slate with a thread of vapor | Cropped to 4:5 |
| `g-cat-accessories` | Hand-blown glass pipe on moss | Cropped to 4:5, colour calmed |
| `g-deals` | Washi packet tied with gold thread | None |
| `g-rewards` | Tea bowl mended with gold seams, pebbles beside it | The mended bowl from `g-cut-bowl` laid over the generated bowl |
| `g-journal` | Handmade paper with a pressed cannabis leaf, a ceramic cup | None |
| `g-first-visit` | Open blank notebook, pencil, cup of tea | None |
| `g-card` | Blank cream card on linen, stoneware cup | None |
| `g-law` | Old brass balance scale on a limewash ledge | None |
| `g-patient` | Plain amber bottle, blank notebook, sprig | None |
| `g-recipes` | Stoneware butter dish, wooden honey dipper | None |
| `g-art-terpenes` | Citrus peel, pine, lavender and peppercorns on slate | None |
| `g-art-label` | Plain glass jar with a blank kraft label | None |
| `g-art-store` | Glass jars in a wooden drawer lined with linen | None |
| `g-art-glass` | Clean hand-blown glass drying by a window | None |
| `g-art-social` | Two ceramic cups on a low table at dusk | None |
| `g-art-evening` | A lit candle, a cup and a window at dusk | None |
| `g-art-creative` | Brush, ink and blank washi | None |
| `g-art-micro` | Tiny ceramic spoon and small dish | None |
| `g-art-decarb` | Rustic baking tray with parchment and a little cured flower | None |
| `g-art-honey` | Stoneware pot of honey with a dipper | None |

## Generated cut-outs (transparent PNG)

| Id | What it is | Model |
|---|---|---|
| `g-flower-macro` | A frosty cured cannabis bud, close up: the Premium Flower category image | FLUX 1.1 pro ultra |
| `g-cut-vase` | Indigo vase with gold seams and a green branch | FLUX 1.1 pro ultra + BiRefNet v2 matting |
| `g-cut-bowl` | Mended indigo tea bowl | FLUX 1.1 pro ultra + BiRefNet v2 matting |
| `g-cut-stones` | Three balanced river stones | FLUX 1.1 pro ultra + BiRefNet v2 matting |
| `g-cut-sprig` | Sprig of cannabis leaves | FLUX 1.1 pro ultra + BiRefNet v2 matting |
| `g-enso` | A brushed ring in soft gold | FLUX 1.1 pro ultra, black ink on white converted to alpha and tinted; the open gap cut by script |

## Motion

`assets/media/hero-loop.mp4` and `hero-loop-small.mp4`: a muted, seamless 20 s loop. fal Kling 3.0 pro animated the AI-generated still `g-hero-vessel` (the leaves and their shadows move, the window light drifts), and playing it forward then in reverse makes the seam invisible. Phones get `hero-loop-small.mp4`, a 720x720 square of the vase on its ledge (the part a phone shows), about 0.6 MB. Both files carry an AI-generated label in their metadata. It is not footage of House of Zen.

## Client images

Client photographs stay the client's. Their content was not changed: nothing was added or removed.

| File | Treatment |
|---|---|
| `assets/photos/hoz/storefront.jpg` | Upscaled 2x with AI (Topaz High Fidelity V2, face enhancement off) |
| `assets/photos/hoz/lounge.jpg` | Upscaled 2x, same model |
| `assets/photos/hoz/counter.jpg` | Upscaled 2x, same model |
| `assets/photos/hoz/counter-wall.jpg` | Upscaled 2x, same model |
| `assets/photos/hoz/entry-plants.jpg` | Upscaled 2x, same model |
| `assets/photos/hoz/exterior-top.jpg` | Cropped from the client's exterior photo and upscaled 2x, same model; the door panel with its logo is the original photo, enlarged without AI |
| `assets/photos/hoz/team.jpg` | Not upscaled: the original file. The upscale altered the faces, so it was discarded |
| `assets/brand/hoz-logo.png`, `hoz-mark.png` | The client's logo enlarged 4x without AI (Lanczos with an unsharp mask), alpha edge tightened; the mark is the Buddha face cropped from it |

The upscaled JPEG files carry the IPTC `algorithmicallyEnhanced` label.
