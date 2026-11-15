# Moon / Mars tour — local redesign, 15 November 2026

## Direction

User references: the local Earth map-tour MP4 (`a83e1cdcf7dbe71ca08e71405de908a7.mp4`) and Jack Harvatt’s Mars GIF. Reviewed in a visible, isolated browser with native computer use. Borrow the composition and travel pattern, not the reference author’s artwork.

The Notion “NASA space implementation” hub and its Artemis II implementation notes were read. Left Behind remains an evidence-backed documentary, not a live tracker or a game.

## Acceptance checklist

- [x] A large NASA-textured Moon or Mars dominates the planetary screen.
- [x] Short equipment caption, image/model, and name; longer reading requires opening “Story & evidence”.
- [x] “Next stop” changes location immediately, rather than advancing another paragraph. Previous stop is available.
- [x] Automatic tour advances after 18 visible seconds at a location; it pauses for details, the atlas, hidden tabs and global motion-off.
- [x] Orbiting, zooming, marker selection and location selection enter manual exploration; the tour can be resumed.
- [x] A surface arc and camera pullback connect stops without passing through the planet. Arcs are explicitly illustrative, not spacecraft trajectories.
- [x] Both worlds retain their full coordinate atlas: 19 Moon sites, 10 Mars sites. The automatic equipment sequence uses five Moon and eight Mars stories.
- [x] Minimap, selected marker and coordinates orient the viewer. Landing references are not described as current rover positions.
- [x] Reduced motion disables automatic touring and moving cameras by default. No-WebGL keeps images, details, locations and tour navigation.
- [x] Removed the per-model “Pause rotation” button at the user’s request. Global motion preference still controls model rotation; dragging still works.
- [x] Keep authentic media, historical/configuration caveats and concept/reference labels. Models are references, not a survey of present conditions.
- [x] Responsive screenshots checked at 390, 768 and 1440 pixels on both worlds; no clipped transport, atlas trigger or horizontal overflow. Additional 1280×720 and 1024×700 checks verify the locations button is not covered by the story card. Final release browser gate is enforced before merging.

## Native visual verification

Viewed the map reference’s Earth/country flyovers and animated connection lines; viewed the Mars GIF’s warm planet, dark field, large title and sparse controls.

Compared the running implementation at 1366 × 768, exercised Mars travel and pause, switched to the Moon, and clicked Next stop from Eagle to Apollo 15’s rover. Observed the curved transition and arrival. During the visual loop, reduced caption density, separated the atlas trigger from the card, retained visual-type labels and removed the requested rotation control. Compared the Mars GIF alongside phone and tablet captures; added dark backing to the atlas trigger and coordinate caption after the tablet contrast check.

Local before/after captures: `/tmp/left-behind-video-review.DkFX6E/before-mars.jpg`, `/tmp/left-behind-video-review.DkFX6E/after-moon-tour.jpg`. Browser regression screenshots are generated under `test-results/feedback-*.png`.

## Boundaries

This tour pass added no dependencies, paid services, external agents, Notion writes, media imports or artwork copies. Original videos/GIF remain untouched and untracked. The user subsequently authorized publishing to `main` and the existing Vercel project; deployment success must be verified against the published revision, not inferred from this document.

The planetary view is a textured globe with sourced pins, not photogrammetric surface terrain or a scientific navigation tool. Narration uses the existing gesture-gated device speech service, not ElevenLabs. The short tour captions do not replace the fuller sourced story/evidence panels. Existing archive, hardware details and responsibility experience remain available.

## Verification

Release gates: `npm run check` (22 unit checks, strict TypeScript and Vite), `npm run assets:verify` (49 registered originals), `npm run test:e2e` (20 explorer checks), and `npm run test:prep` (8 practice checks). Photograph integrity is included in the unit suite. GitHub Actions runs these gates for the published commit; use its revision-specific result as the final automated receipt.

A focused browser probe verified 18-second automatic advance, pause, immediate next/previous and no-WebGL arrival. Timer fixtures use isolated browser contexts because Playwright clock control is context-wide. They exercise the supported no-WebGL path to avoid rendering every simulated GPU frame; the other explorer checks retain real rendering. Fake clocks are installed before navigation, then explicitly paused after application readiness or dialog setup. Exact simulated durations test opening advance, pause/resume and the equipment tour without letting real setup time race those assertions. The full suite retains its existing assertions while updating selectors for the redesigned controls and testing absence of the removed rotation button.

Native review, the six main responsive screenshots and four additional short-desktop captures are local visual evidence, not independent user research or an external-agent review.
