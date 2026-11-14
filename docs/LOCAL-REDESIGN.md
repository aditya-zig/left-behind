# Local NASA redesign — not pushed

Branch: `redesign/cinematic-explorer`. This iteration is local only. The public Vercel deployment has not been changed.

Open http://127.0.0.1:5173/ while the preview is running. Restart with `npm run build && npm run preview -- --host 127.0.0.1 --port 5173 --strictPort`.

## Current revision

- One small home icon replaces the navbar. The duplicate mission dock and story popup are removed.
- The opening and equipment gallery use animation-only excerpts from the operator-supplied NASA+ film. No interviews or soundtrack, generated space footage, or added visual effects.
- Blip is the actual Three.js UFO geometry supplied in `3d.zip/mascot-ufo.html`, with its bob, head tracking, blinking, lights and optional speech-mouth movement. The original source is preserved in `docs/assets/mascot-ufo.source.txt`. It is not the earlier SVG mascot.
- A stepped white/pixel-style speech bubble presents short story chunks. Optional device speech remains off by default and is not a NASA recording or ElevenLabs service.
- Landing markers show the corresponding original NASA 3D model directly where one is available. The remaining records use explicitly labelled NASA images, not fabricated or relabelled equipment models. Hover enlarges the reference; clicking opens its complete mission page.
- Each mission has a full-page article: purpose, why it remained, discoveries, recorded status, location uncertainty, inline NASA citations, and a reading rail with original sources, relevant NASA Trek maps and asset credits.
- Three featured objects precede “Wonder first”; all 15 remaining records follow it in “More to discover.”
- The 18-record collection, source archive and separate `/prep.html` presentation coach remain available.

## Supplied NASA film

Official source: https://plus.nasa.gov/video/moon-base-update-lunar-rovers/ — *Moon Base, The Series | Lunar Rovers*, NASA+, 20 October 2026.

The supplied original is retained locally and ignored by Git. The 30-second muted background uses source intervals **8–21 s**, **115.5–121.5 s**, and **159–170 s**, with straight cuts only, resized to 1280×720 at 24 fps. Animation-only selection was visually reviewed with source contact sheets and the edited clip's two-second samples. `src/media.json` records the source, original hash, cut boundaries and final MP4/poster checksums.

These are **future lunar exploration concepts**, not historical video of Apollo, the Mars missions, or the precise equipment locations. NASA-published media may retain third-party contributor rights; original credits remain in the linked full film. The supplied source title must not be used to imply NASA endorsement.

## Accuracy and accessibility

NASA surface textures and approximate mission coordinates provide context, not survey-grade navigation or live tracking. Equipment marker size and camera distances are illustrative. On small screens, leader lines connect readable, non-overlapping UI slots to the actual projected sites. A full Apollo module reference does not mean its ascent stage remains on the Moon; the detail page preserves that caveat.

Reduced motion pauses the film, mascot movement and model rotation, and skips animated travel. Hidden/offscreen media pauses. A collapsed mission index provides keyboard/touch access to every record and opens automatically when WebGL is unavailable. Unsupported devices retain NASA imagery, articles and source links. Native voice availability and quality depend on the device.

## Verification

- `npm test`: data integrity, source/asset checks, story/route/camera helpers and edited-film checksums.
- `npm run assets:verify`: all 49 original bundled NASA resources. The derived video is verified separately by `tests/media.test.ts`, not falsely restored from an unedited remote original.
- `npm run build`: strict TypeScript and production compilation with the existing deployment security policy.
- `npm run test:e2e`: current video/mascot/marker/article interface, all 18 mission pages, 768/390 layouts and overlap regression, reduced motion, simulated speech and no-WebGL fallback.
- `npm run test:prep`: independent presentation-coach regression suite.

A map-input regression was reproduced with an ordinary, unforced Playwright click: the visible lunar marker lay outside its translated parent's composited hit region, so the underlying globe canvas received pointer input. A controlled in-browser trial moving the offset onto the wrapper restored the click. The implementation now positions the complete wrapper/hit region, with leader lines still anchored to the projected site. Motion-off also clears residual orbit inertia. The browser suite exercises real marker clicks rather than bypassing hit testing with DOM clicks or `force`.

Final production build passed. The current interface passed all **12 browser checks**, including real marker clicks, every mission page, both mobile widths, collision checks, reduced motion, simulated speech and no-WebGL fallback. All **8 presentation-coach regression checks** also passed. Normal runs reported no application console errors, failed resources or external requests. A remaining build warning notes the lazy-loaded Three.js chunk is larger than 500 kB; it is not a compilation failure.

Browser evidence is written to ignored `test-results/`. Actual voice quality and human learning outcomes have not been measured. Older `tests/browser.mjs` covers the pre-redesign interface, not the current default journey. No agents, paid APIs, external model reviews, push, deployment or formal push/PR pipeline were used for this iteration.
