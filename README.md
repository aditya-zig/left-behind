# Left Behind

**The machines stayed. The discoveries came home.**

An independent, source-led web documentary for the NASA Space Apps challenge **Abandoned but not Forgotten: Storytelling about NASA’s Discarded Equipment on the Moon and Mars**.

Explore the Moon and Mars through ten guided stories, eighteen mission records, original NASA reference models, published mission imagery, and inspectable NASA landing-site terrain. No generated space imagery, procedural stars, particle effects, simulated telemetry, or automatic 3D animation.

## Run locally

Node **22.12+** (Node 24 recommended).

```sh
npm ci
npm run dev
```

Open the URL Vite prints. Assets and fonts are committed and served locally. No API keys, account, database, or environment variables are needed.

```sh
npm test                 # collection, science distinctions, asset hashes, model dependencies
npm run assets:verify    # exact SHA-256 / byte-size verification
npm run build            # strict TypeScript + production bundle
npm run preview          # serve the production build
npx playwright install chromium
npm run test:e2e         # browser checks against localhost:5173 (start dev separately)
```

For another server, use `BASE_URL=http://localhost:4173 npm run test:e2e`. An existing Chrome executable can be supplied with `CHROMIUM_PATH=/absolute/path/to/chrome`. E2E results and screenshots are written to ignored `test-results/`.

## The experience

- **Opening:** four NASA-sourced visual chapters, with pause, manual advance, and skip.
- **Guided journey:** five Moon stories and five Mars stories, roughly thirty seconds each; pause, skip, exit, or change worlds at any time. No autoplay sound. Background tabs pause the journey.
- **Explore:** manually rotate and zoom contextual globes with source-based markers; inspect actual NASA Apollo 11 / Opportunity landing-site STL terrain separately. Full button lists duplicate map selection accessibly.
- **Inspect:** NASA GLBs when available, official imagery otherwise. Model limitations are shown, including the complete lunar-module model versus the descent stage left behind.
- **Evidence:** purpose, why hardware stayed, discoveries, location precision, nuanced status, and a source link explaining each claim. No unsupported item-level prices.
- **Collection:** search/filter all eighteen records. Dawn, NEAR, Pioneer 10/11 and Kepler are explicitly **beyond** the Moon and Mars, not surface markers.
- **Legacy:** Moon/Mars comparison, future lessons and a reflection question with explanatory feedback.
- **Transparency:** source register, asset credits, AI-assistance disclosure and local history reset.

Optional narration uses the browser/device speech service and the visible transcript. The site does **not** include ElevenLabs audio or an invented astronaut mascot. See [implementation notes](docs/IMPLEMENTATION.md) for those boundaries.

## NASA resources actually used

The [official challenge resource list](https://www.spaceappschallenge.org/2026/challenges/nasas-discarded-equipment-storytelling/?tab=resources) drives the mission records. Its NSSDCA entries supply Apollo landing coordinates, engineering design, traverse/sample totals, ALSEP instruments and shutdown history—not just bibliography links. NASA mission pages supply robotic mission histories, locations and scientific findings.

- [NASA 3D Resources](https://github.com/nasa/NASA-3D-Resources): ten GLBs, previews, NASA star/Mars imagery and two landing-site STL models. Originals pinned to commit `11ebb4ee043715aefbba6aeec8a61746fad67fa7`.
- [NASA CGI Moon Kit](https://svs.gsfc.nasa.gov/4720/): a proper equirectangular LRO-based lunar texture, not a circular photograph stretched onto a sphere.
- [NASA Image and Video Library](https://images.nasa.gov/): Apollo photographs, Earthrise and the explicitly labeled solar-system artist concept.
- [NASA Science](https://science.nasa.gov/): mission facts and published images. NASA-published artist concepts are distinguished from photographs.
- [NASA Trek](https://trek.nasa.gov/): direct Moon/Mars links for authoritative geographic exploration; not embedded or presented as our own mapping data.

Every bundled NASA file has its original download URL, source record, retrieval date, byte count and SHA-256 in [`src/assets.json`](src/assets.json). `npm run assets:restore` restores missing/changed files only after verifying the pinned original. It refuses silently changed upstream content.

## Structure

- `src/data.ts` — typed mission records, source-to-claim descriptions and tour order
- `src/App.tsx` — hash routes, readable transcripts, tour controls and collection
- `src/Scene.tsx` — demand-rendered Three.js globe / original STL terrain, no auto-rotation
- `src/Model.tsx` — on-demand Google model-viewer, image fallback and credits
- `public/assets/` — official NASA originals plus self-hosted fonts
- `public/draco/` — local decoder, so compressed NASA models need no Google CDN
- `tests/` — data/integrity and real-browser checks
- `vercel.json` — static deployment and restrictive security headers

## Deploy

Import this GitHub repository into Vercel. Framework **Vite**, build **`npm run build`**, output **`dist`**, project root **`.`**, Node **24.x**. No environment variables or paid integrations are necessary. Hash routes work on a plain static host without rewrites.

## Accuracy, accessibility and privacy

This is an educational archive, not live spacecraft monitoring or a navigation tool. Approximate/final-site/landing-site distinctions appear beside the map. Terrain is a NASA printing-model reference with its original relief, not a walkable, georeferenced reconstruction. No life detection, fabricated transmissions, equipment prices or current-health claims are invented.

Transcripts, text evidence and mission lists remain available without WebGL. Keyboard globe controls: arrows, +/− and Home; named zoom/reset buttons are also provided. Browser speech availability varies; transcripts are always the primary content. Reduced-motion settings are respected. No analytics, tracking cookies, login, or backend. Visited record IDs stay in localStorage on this device and can be cleared in About. Hosting providers and an optional OS speech service have their own policies.

See [credits](docs/CREDITS.md), [source methodology](docs/SOURCING.md), [demo/submission notes](docs/DEMO.md), and [implementation boundaries](docs/IMPLEMENTATION.md).

## License / independence

Original application code: MIT. NASA assets, contributor materials, fonts and decoder software retain their own terms and credits; see [CREDITS](docs/CREDITS.md). NASA names are used descriptively. NASA does not sponsor or endorse this project. Do not infer challenge eligibility, judging outcomes, or permission for commercial use from this repository. AI assisted implementation, source organization and educational wording; no user research or human testing is claimed.
