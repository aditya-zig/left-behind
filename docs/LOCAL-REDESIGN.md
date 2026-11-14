# Cinematic redesign — local review only

Branch: `main` (local). The restored globe-first checkpoint is committed as `Globe version`. No push or deployment is authorized; the public website remains unchanged.

Open http://127.0.0.1:5173/ while the local preview is running. To restart: `npm run build && npm run preview -- --port 5173 --strictPort`.

## Rollback checkpoint

Restored the pre-film globe-first interface shown in the operator's reference screenshots: Solar System opening, large Moon/Mars globes, glass navigation and mission dock, and the original Orbit guide. The source was recovered from the earlier local file snapshots, not by resetting public `main`.

The film-first version remains at `7ad7477`. The subsequent local readability work is preserved on `backup/film-before-globe-rollback-20261114` at `8e1c07c`. NASA mission records, media provenance and the presentation coach are retained. No push or deployment was performed.

## Restored experience

- Full-viewport NASA Milky Way concept → illustrated solar neighbourhood → Earth → destination choice, with continuous camera transitions.
- Panoramic NASA-textured Moon/Mars explorer, glass controls, automatic orbit with a motion toggle, and an always-accessible mission list.
- Hover/focus a landing marker for a floating NASA model or image; click for a native story/evidence dialog. Equipment without a genuine NASA model uses an actual NASA image instead.
- Orbit: an original, fictional alien/UFO interface guide, visible story chunks, optional device speech, and guided progression. Not a NASA character or recovered transmission.
- Rotating original NASA model showcases below the opening. Reduced motion skips automatic travel/rotation; WebGL-unavailable devices retain imagery, stories and controls.
- Original 18 source-led records, collections, evidence archive, and separate presentation coach remain available.

## Accuracy and attribution

The camera journey, relative sizes and distances are deliberately cinematic, not a scientific Solar System simulation. NASA surface textures provide context, not a georeferenced surface-navigation service. Clustered markers use leader lines for readability; the mission records retain explicit location uncertainty.

Added resources, recorded with byte sizes and SHA-256 in `src/assets.json`:

- **PIA10748**, Milky Way artist concept: NASA/JPL-Caltech/R. Hurt. https://science.nasa.gov/photojournal/our-milky-way-gets-a-makeover-artist-concept/
- **GSFC_20171208_Archive_e000790**, NASA SDO solar instrument image, archival rather than live. https://images.nasa.gov/details/GSFC_20171208_Archive_e000790

NASA equipment and science were not regenerated. Orbit's SVG artwork, glass styling and camera choreography are newly authored UI, as requested in the revised brief. Browser speech is not ElevenLabs or a NASA recording and may depend on the device's speech service.

## Verification

`npm test` includes source integrity and story-chunk/route tests. `npm run assets:verify` verifies all 49 bundled NASA resources. `npm run build` performs strict TypeScript and production compilation. `npm run test:e2e` exercises the new cinematic interface; `npm run test:prep` independently checks the existing learning coach. Older `tests/browser.mjs` is the pre-redesign interface suite, not the new default user journey.

Fresh rollback verification passed: 13 unit/integrity checks, all 11 cinematic browser checks, the strict production build and all 49 NASA asset checksums. The browser run reported no application errors, missing resources or external requests. Current Moon and galaxy screenshots were visually checked against the reference. Narration timing uses a simulated speech service; actual device voice quality remains system-dependent. Camera travel remains wall-clock bounded, including slow-frame-rate operation.

For local browser checks, set `BASE_URL=http://127.0.0.1:5173` for both suites (the coach otherwise defaults to port 4173). If Playwright's bundled browser is absent, set `CHROMIUM_PATH` to an installed Chromium executable. These are test-runner settings, not application dependencies.

The original archive interface can be inspected using `?classic` during local comparison. No external model review or formal no-mistakes push/PR pipeline was run: those would conflict with the local-only instruction.
