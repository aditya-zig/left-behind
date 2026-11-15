# Left Behind

**The machines stayed. The discoveries came home.**

**Live experience:** https://left-behind-tau.vercel.app

An independent, source-led web documentary for the NASA Space Apps challenge **Abandoned but not Forgotten: Storytelling about NASA’s Discarded Equipment on the Moon and Mars**.

Explore the Moon and Mars through thirteen surface stories, twenty-nine sourced map locations, eighteen archive records, original NASA reference models and published mission imagery. A compact guided tour flies between locations; longer stories and evidence open on demand. No generated space imagery, fabricated transmissions or simulated telemetry.

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

## Presentation practice

Open [`/prep.html`](https://left-behind-tau.vercel.app/prep.html) for an unlinked, beginner-friendly rehearsal guide: ten short judging answers, plain-English explanations, optional browser read-aloud, three NASA examples, mentor questions and ungraded practice. Notes and self-checks stay in browser storage. This is a public study page, not an authenticated private area. It makes no educational-effectiveness or judging-outcome claim.

Run `BASE_URL=http://localhost:4173 npm run test:prep` against a production preview to check it. Speech controls are tested with a simulated voice service; actual voice availability depends on the browser and operating system.

## The experience

- **Opening:** four automatically advancing NASA-sourced chapters, with pause, manual advance and immediate Moon/Mars choices. Narration requires a user gesture.
- **Guided journey:** five Moon and eight Mars equipment stops, eighteen visible seconds each; previous/next, pause/resume and world switching. Opening details, the atlas, hidden tabs and global motion-off pause the tour. Routes are illustrative, not spacecraft trajectories.
- **Explore:** drag and zoom NASA-textured globes with sourced markers and a location minimap. The coordinate atlas contains nineteen Moon and ten Mars sites; landing references are not current rover positions. Map/list interaction enters manual exploration.
- **Inspect:** NASA GLBs when available, official imagery otherwise. Model limitations are shown, including the complete lunar-module model versus the descent stage left behind.
- **Evidence:** purpose, why hardware stayed, discoveries, location precision, nuanced status, and a source link explaining each claim. No unsupported item-level prices.
- **Collection:** search/filter all eighteen records. Dawn, NEAR, Pioneer 10/11 and Kepler are explicitly **beyond** the Moon and Mars, not surface markers.
- **Responsibility:** distinguish preservation, contamination and return risks; create a local discussion brief without claiming a deployed cleanup mission. The legacy archive and reflection remain available.
- **Transparency:** source register, asset credits, AI-assistance disclosure and local history reset.

Gesture-gated narration uses the browser/device speech service and visible text, not ElevenLabs. The small alien guide is fictional UI, not a NASA character or an astronaut quotation. See the [current tour design and verification notes](docs/TOUR-REDESIGN.md); older [implementation notes](docs/IMPLEMENTATION.md) describe the original archive.

## NASA resources actually used

The [official challenge resource list](https://www.spaceappschallenge.org/2026/challenges/nasas-discarded-equipment-storytelling/?tab=resources) drives the mission records. Its NSSDCA entries supply Apollo landing coordinates, engineering design, traverse/sample totals, ALSEP instruments and shutdown history—not just bibliography links. NASA mission pages supply robotic mission histories, locations and scientific findings.

- [NASA 3D Resources](https://github.com/nasa/NASA-3D-Resources): ten GLBs, previews, NASA star/Mars imagery and two landing-site STL models. Originals pinned to commit `11ebb4ee043715aefbba6aeec8a61746fad67fa7`.
- [NASA CGI Moon Kit](https://svs.gsfc.nasa.gov/4720/): a proper equirectangular LRO-based lunar texture, not a circular photograph stretched onto a sphere.
- [NASA Image and Video Library](https://images.nasa.gov/): Apollo photographs, Earthrise and the explicitly labeled solar-system artist concept.
- [NASA Science](https://science.nasa.gov/): mission facts and published images. NASA-published artist concepts are distinguished from photographs.
- [NASA Trek](https://trek.nasa.gov/): direct Moon/Mars links for authoritative geographic exploration; not embedded or presented as our own mapping data.

Bundled NASA resources record original download URLs, source records, retrieval dates, byte counts and SHA-256 values in [`src/assets.json`](src/assets.json) and [`src/photography.json`](src/photography.json). The latter includes thirty-one added photographs and the Sun map; concepts and reference configurations remain labeled. `npm run assets:restore` restores missing/changed files only after verifying the pinned original. It refuses silently changed upstream content.

## Structure

- `src/data.ts` — typed mission records, source-to-claim descriptions and tour order
- `src/CinematicApp.tsx`, `src/FlightScene.tsx` — opening, planetary flights and global preferences
- `src/TourPanel.tsx`, `src/tour.css` — compact discovery card, tour transport and minimap
- `src/atlas.ts`, `src/CoordinateAtlas.tsx` — sourced coordinates and accessible location selection
- `src/MissionDialog.tsx`, `src/Photography.tsx` — hardware details, honest imagery and evidence
- `src/App.tsx`, `src/Scene.tsx` — preserved archive routes and legacy globe/terrain explorer
- `src/Model.tsx` — on-demand Google model-viewer, image fallback and credits
- `public/assets/`, `public/photography/`, `public/fonts/` — self-hosted NASA resources and fonts
- `public/draco/` — local decoder, so compressed NASA models need no Google CDN
- `tests/` — data/integrity and real-browser checks
- `vercel.json` — static deployment and restrictive security headers

## Deploy

Production is deployed at **https://left-behind-tau.vercel.app**, connected to this repository’s `main` branch. The initial import and deployment were performed through the signed-in Vercel interface using computer use.

To deploy your own copy, import this GitHub repository into Vercel. Framework **Vite**, build **`npm run build`**, output **`dist`**, project root **`.`**, Node **24.x**. No environment variables or paid integrations are necessary. Hash routes work on a plain static host without rewrites.

## Accuracy, accessibility and privacy

This is an educational archive, not live spacecraft monitoring or a navigation tool. Approximate/final-site/landing-site distinctions appear beside the map. Terrain is a NASA printing-model reference with its original relief, not a walkable, georeferenced reconstruction. No life detection, fabricated transmissions, equipment prices or current-health claims are invented.

Transcripts, text evidence and mission lists remain available without WebGL. The planetary canvas supports +/− zoom and Home reset; named mission lists duplicate marker selection. The preserved archive explorer also provides zoom/reset buttons. Browser speech availability varies; transcripts are always the primary content. Reduced-motion settings are respected. No analytics, tracking cookies, login, or backend. Visited record IDs stay in localStorage on this device and can be cleared in About. Hosting providers and an optional OS speech service have their own policies.

See [credits](docs/CREDITS.md), [source methodology](docs/SOURCING.md), [demo/submission notes](docs/DEMO.md), and [implementation boundaries](docs/IMPLEMENTATION.md).

## License / independence

Original application code: MIT. NASA assets, contributor materials, fonts and decoder software retain their own terms and credits; see [CREDITS](docs/CREDITS.md). NASA names are used descriptively. NASA does not sponsor or endorse this project. Do not infer challenge eligibility, judging outcomes, or permission for commercial use from this repository. AI assisted implementation, source organization and educational wording; no user research or human testing is claimed.
