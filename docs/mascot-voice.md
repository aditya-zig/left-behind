# Travelling mascot and recorded captions

Worktree: `/Users/moawyamahmoudshariff/left-behind-mascot`.
Integration branch: `mascot-voice-integration`.
Latest UI incorporated: `origin/main` at `d05162e` (feedback UI merge).
The original working folder's pre-existing changes are untouched.

## UI integration

The existing tour, atlas, photographs, evidence dialogs, NASA assets and accessibility controls are preserved. Orbit is a separate viewport-bounded travelling companion rather than a corner chat panel. Its saucer follows a cross-screen flight during transfers and moves between safe waypoints while exploring. Scroll completion updates its waypoint. Eye tracking and subtle hover/banking animate independently. Motion pause, reduced motion, hidden tabs, minimization and dialog interaction are respected. Only the saucer catches pointer input, so it cannot block map controls.

The supplied text and recording IDs are coupled in `src/mascot-script.json`. Each of 18 catalogue objects has four ordered lines. Captions fade/slide/blur into view as each corresponding recording starts; playback progress comes from the real audio element. This is whole-caption animation, not fabricated word-level synchronization. The actual `ended` event advances the line; auto tours cannot cut off a clip on a fixed timer. Flight captions persist until both camera arrival and audio completion. Extra locations without recordings remain explicitly text-only. The classic archive retains device TTS.

The latest UI's default-on narration preference is preserved, but sound requires the first pointer/keyboard interaction. Mute and complete visible captions remain available.

## Corrected audio boundaries

A base.en speech-to-text pass over the supplied 94 clips revealed genuine boundary errors: destination audio included “Hold tight”; the Moon-travel clip omitted it, and several other lines included speech from their neighbours.

All 94 clips were therefore recut from the supplied master using a full-master word-timestamp alignment and midpoint boundaries between adjacent intended lines. They tile the master without overlap or omitted samples. Original `supplied_start`, `supplied_end` and `check` fields are retained in the manifest; corrected start/end and each WAV's SHA256 are recorded separately. Original `public/audio/mascot/REPORT.txt` describes the **supplied**, not corrected, boundaries.

Master SHA256: `74e15a5f4e82a19aecab212ee0c5e7fbc6d31219a19a900bc489a8b885b47fd1`.

Reproduce/verify without adding website dependencies:
```
python3 scripts/prepare-mascot-audio.py /path/to/mascot_voice.wav
```

A second, independent small.en transcription pass processed every corrected clip. Raw results are in `docs/mascot-audio-qa.json`. Numbers, spelling and punctuation can differ in ASR output; automated similarity is not a listening certification.

### Release gate: human audio review still required

Two numerical phrases remain ambiguous across ASR passes:
- `mars_insight_02`: script says **1,300 marsquakes**; recognition was inconsistent.
- `beyond_kepler_03`: script says **2,600 planets**; both recognizers output **600**.

Do not change educational facts merely to match uncertain recognition. Listen to these recordings and provide replacements if the original voice actually says the wrong number. No human listening verification was performed by the assistant.

Native computer-use diagnostics report Accessibility=false and Screen Recording=false for `~/Applications/pi-computer-use.app`. Those permissions require the user in System Settings → Privacy & Security. A separate visible Chrome session was exercised successfully via browser UI automation; this is not a claim that native desktop-helper checks passed.

**No push or new Vercel deployment has been performed pending the requested pre-push review.** Existing production is `https://left-behind-tau.vercel.app`; its current availability is not evidence that these unpushed changes are deployed.

## Checks

```
npm test
npm run build
BASE_URL=http://127.0.0.1:5174 CHROMIUM_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node tests/cinematic.mjs
node tests/mascot-browser.mjs
HEADED=1 node tests/mascot-browser.mjs
```

The full UI suite passes including atlas, all NASA assets, dialogs/parts, additional locations, desktop/mobile layouts, fallback WebGL path, tour controls and narration. The mascot suite verifies real WAV time progression/end events, exact caption/URL matching, replacement/cancellation, mute, text-only sites, visible Moon→Mars movement, caption animation and reduced motion. Unit tests validate ordered catalogue coverage, WAV checksums/durations, and contiguous corrected master boundaries. Build passes with Vite's existing large-chunk warning.

A casing collision in the incoming UI (`Stewardship.tsx` versus `stewardship.ts`) was resolved by naming the page `ResponsibilityPage.tsx`, keeping the data module and exports unchanged.

Run locally:
```
cd /Users/moawyamahmoudshariff/left-behind-mascot
npm run dev -- --port 5174
```
Server log: `/tmp/left-behind-mascot-vite.log`.
Screenshots: `/tmp/left-behind-mascot-desktop.png`, `/tmp/left-behind-mascot-mobile.png`.
