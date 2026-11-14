# Judge feedback — local implementation

Branch: `feedback`, based on `8acec2d` (`Globe version`). This work does not authorize a push or replace the published Globe version. The film and supplied Blip experiments remain in history; this branch renders the interactive globe opening and original SVG Orbit, with **no video**.

## What changed

- Atkinson Hyperlegible Next, served locally under OFL, replaces the display/body font in the explorer. Reading text is 16–19px; quiet explanatory labels are generally 13–15px. The mission list is a selector rather than a dock full of competing cards.
- A 30-degree scientific coordinate graticule overlays the NASA-textured worlds. The atlas contains **29 selected sourced sites: 19 Moon, 10 Mars**, including the existing 13 surface stories and 16 additional equipment/landing references. This is not a complete planetary inventory.
- Every atlas site has a named coordinate source and a precision/meaning note. The searchable list makes nearby, overlapping pins reachable. Apollo instruments use their own catalogue positions, not the lunar-module coordinate. Rounded Mars rover touchdown references are not current positions or abandoned-rover claims.
- One selected machine drives Orbit's transcript and a prominent inspection action. The existing mascot follows the pointer with bounded eye/saucer movement. Reduced motion and the motion toggle disable these gestures. The optional guided tour is explicit and can be paused.
- A large native dialog separates the story, hardware/parts and original evidence. Part selection changes reading focus and the whole NASA reference model's viewing angle. It does **not** fabricate exploded geometry, component coordinates or a final damage reconstruction. Complete LM models explicitly include the ascent cabin that departed.
- Hardware notes distinguish what stayed, departed and was actually returned. Surveyor 3's camera/sampler recovery is a real counterexample to “everything is forever lost.” Missing component-cost data is stated rather than replaced with invented rankings.
- `#/responsibility` adds an evidence-based ethics discussion, a selectable document/reuse/return planning brief and local download. It proposes documenting condition, ownership and context before interference. It distinguishes small-spacecraft concepts from demonstrated recovery capability.
- NASA models show a real reference preview while loading; cached-load races no longer leave the preparing label visible after load. Devices without WebGL retain the NASA image, complete atlas, story and sources.

## Research and claim boundaries

### Coordinates

[NASA NSSDCA lunar landing sites](https://nssdc.gsfc.nasa.gov/planetary/lunar/lunar_sites.html) lists Apollo LM, ALSEP and reflector positions in the LRO / DE421 Mean Earth / Polar Axis frame, citing Wagner et al. (2017). The Apollo 12 ALSEP coordinate is −3.0098°, −23.4249°. The Apollo 11 reflector is 0.67345°, 23.47307°, distinct from Eagle's 0.67416°, 23.47314°.

Additional Surveyor positions retain the rounded values and uncertainty published by NASA Science: [1](https://science.nasa.gov/mission/surveyor-1/), [5](https://science.nasa.gov/mission/surveyor-5/), [6](https://science.nasa.gov/mission/surveyor-6/), [7](https://science.nasa.gov/mission/surveyor-7/). Surveyor 6 hopped after landing; its rounded reference is not an exact final survey.

[NASA GISS Mars lander sites](https://www.giss.nasa.gov/tools/mars24/help/landers.html) supplies rounded Curiosity and Perseverance **touchdown** references. Its historical status descriptions are not used as current mission status. Existing mission-specific Mars regional references are retained with their uncertainty. Mixed-source points are not presented as a common-frame navigation service. [NASA Moon Trek](https://trek.nasa.gov/moon/) and [Mars Trek](https://trek.nasa.gov/mars/) are linked for deeper geospatial exploration.

### Hardware

- [NASA LM / spacecraft adapter overview](https://www.nasa.gov/wp-content/uploads/static/history/alsj/08_LM_&_SLA_Overview_pp61-68.pdf): two-stage configuration, descent structure/propulsion, landing gear and ascent systems.
- [NASA lunar roving vehicles](https://nssdc.gsfc.nasa.gov/planetary/lunar/apollo_lrv.html): four independent quarter-horsepower wheel motors, wire-mesh wheels, power and communications. The exhibit has no verified matching rover GLB or exact parking coordinate.
- [NASA/JPL Surveyor 3 recovery](https://www.jpl.nasa.gov/blog/2012/1/surveyor-3-camera-returned-from-the-moon): Apollo 12 recovered the camera, scoop, cable and tubing; camera hardware was studied and dismantled on Earth. NASA's [Apollo 12 and Surveyor 3 photograph and caption](https://science.nasa.gov/resource/apollo-12-and-surveyor-3/) independently confirms the camera and other components were returned. JPL currently blocks this host's direct fetch (403); the NASA Science alternative is readable.
- Existing `src/data.ts` NASA mission sources support the remaining subsystem context and mission outcomes. “Not separately located” is not a newly invented part coordinate.

### Responsibility and small spacecraft

- [UNOOSA treaty text](https://www.unoosa.org/unoosa/en/ourwork/spacelaw/treaties/outerspacetreaty.html): Article VIII retains ownership; Article IX addresses harmful contamination and interference. This is neither “no law” nor a universal return-every-machine mandate. The page is an educational overview, not legal advice.
- [NASA-STD-8719.27](https://standards.nasa.gov/standard/NASA/NASA-STD-871927): forward and backward planetary-contamination protections. Recovery, disturbance and Mars return require mission-specific analysis.
- [NASA lunar landing/operations policy analysis](https://www.nasa.gov/wp-content/uploads/2023/05/nasa-otps-lunar-landing-and-operations-policy-analysis-final-report-2.pdf): additional context for responsible operations and preserving sites.
- [NASA SmallSats/CubeSats](https://www.nasa.gov/what-are-smallsats-and-cubesats/): a 1U CubeSat is 10 × 10 × 10cm; small size alone supplies neither lunar ascent nor Earth return.
- [ESA CanSat](https://education.esa.int/what_is_a_cansat/): a can-sized educational satellite simulation deployed within Earth's atmosphere, not an already demonstrated planetary cleanup spacecraft.

No pollution mass, emissions, toxicity, budget ranking, salvage value, live location, life discovery or operational cleanup result is invented. No new spacecraft imagery or equipment geometry is generated. Orbit and the coordinate overlay are interface elements, not NASA observations.

## Local verification

Commands for this host:

```sh
npm run check
npm run assets:verify
BASE_URL=http://127.0.0.1:5173 CHROMIUM_PATH=/home/batman/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome npm run test:e2e
BASE_URL=http://127.0.0.1:5173 CHROMIUM_PATH=/home/batman/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome npm run test:prep
```

Browser checks caught Orbit's bubble intercepting destination buttons; opening copy and guide now occupy separate grid cells, stacked on small screens. They also caught the default destination matching an additional record's missing artifact ID, and focus restoration running before the native dialog released its opener. Explicit default selection and post-commit focus restoration repair those cases. The selected pin sits above overlapping neighbours, without moving its published coordinate; the atlas list keeps all neighbours reachable. A source review caught a mismatched cursor-tilt CSS variable; the regression checks the rendered saucer transform, not just a JavaScript variable. Loading posters are absolute overlays in both the new explorer and the original archive, preventing extra-height layout shifts.

Final feedback run `bc7cecd35` passed **43 checks: 18 unit, 17 explorer-browser groups and 8 presentation-practice groups**, strict TypeScript / Vite production build, all 49 NASA-asset checksums and `git diff --check`. Browser checks include ordinary projected-marker clicks, delayed and cached model loading, original archive loading layout, dialog focus restoration, wrong-world deep-link rejection, no-WebGL fallback and exact visible-text speech simulation. No normal-browser application errors, failed resources or external requests were observed. Desktop 1440×900 and 1100×768 checks verify Orbit does not cover the coordinate action; the shorter-screen visual review led to reserving a separate desktop guide region. Tablet 768px, intermediate 631px and phone 390px detail/atlas layouts passed the no-horizontal-overflow checks; atlas rows retain their full text height. A final native-window review led to non-shrinking atlas rows and collapsing narrow navigation before the wordmark can wrap.

Rendered app-mode inspection covered the opening and Moon at 1440, 768 and 390px: zero small-text findings, horizontal overflow or broken images; headings remain within two lines. Raw policy reports exit 1 for the neutral legibility scrim over the NASA-textured canvas and warn about cinematic 76–91px titles. These are documented design exceptions to generic dashboard rules, not hidden passes: the requested globe-first visual style is preserved. Inspector captures can occur during camera arrival; settled-view browser screenshots are also reviewed.

A native desktop check in an isolated Chrome profile opened both Moon and Mars atlases, loaded the actual NASA lunar-module model, selected the departed ascent subsystem and verified dialog dismissal. The local preview remains open; no personal browser profile or cookies were imported.

Test receipts and screenshots are under ignored `test-results/` and `.taste-skill/feedback-review/`. Browser voice tests simulate device speech; they do not establish a particular installed voice or ElevenLabs integration. Component-level exploded geometry, verified component-cost rankings, live spacecraft positions and a flight-proven cleanup nanosatellite are not claimed.
