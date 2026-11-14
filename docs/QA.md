# Verification — 14 November 2026

## Passed locally against the production build

- Strict TypeScript check and Vite 7.3.8 production build.
- Seven automated data/integrity tests, with zero skipped tests.
- SHA-256 and byte-size verification for all 47 bundled NASA assets.
- Fourteen Playwright browser checks against the production preview, using the same Content Security Policy as Vercel:
  - NASA globe and local fonts.
  - Lunar model, mission facts, reference-geometry caveat.
  - Every lunar record and original NASA Apollo terrain.
  - Mars navigation and locally decoded compressed NASA models.
  - Collection search, empty results, and separate beyond-Moon/Mars records.
  - Deep-space models and Pioneer 11’s intentionally image-only fallback.
  - All mission sources and per-asset provenance.
  - Educational reflection feedback.
  - Opening sequence, pause/skip, guided-story exit.
  - Automatic story advancement, pause, and non-looping completion.
  - Tablet-width navigation and overflow check (768 px).
  - Mobile-width navigation and overflow check (390 px).
  - WebGL disabled: NASA photographs, mission text and all 18 collection records remain usable.
  - Invalid route recovery.
- Normal browser run: no uncaught errors, failed resources, or external resource requests. The unsupported-WebGL case separately verifies no uncaught exceptions.
- Dependency audit after the Vite patch: zero reported vulnerabilities. An audit is not a security guarantee.

## Deployment observations

The initial Vercel import was performed through the signed-in browser using computer use, on the existing Hobby team. Vercel reported **Ready**. The public production URL returned HTTP 200 and the configured security headers. The public Ingenuity page loaded its actual NASA GLB and had no horizontal overflow at 1440 px.

Production: https://left-behind-tau.vercel.app

## Boundaries

These are automated Chromium checks plus desktop/mobile-width screenshot inspection, not human usability testing, physical-device certification, a scientific peer review, or a hackathon eligibility verdict. Device speech synthesis varies by browser/OS; ElevenLabs and a custom astronaut character are not included. Browser evidence is generated under ignored `test-results/`, and CI uploads its own test artifact.

Run `npm run check`, `npm run assets:verify`, and `npm run test:e2e` to reproduce. Use `BASE_URL` to test a production deployment. See the README for browser installation and `CHROMIUM_PATH`.
