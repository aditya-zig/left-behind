# Mascot recordings

Integration branch: `mascot-voice-integration`, based on `origin/main` at `8acec2d`.
Worktree: `/Users/moawyamahmoudshariff/left-behind-mascot`.
The original working folder's pre-existing changes are not included.

The cinematic guide uses `src/mascot-script.json` as the single source for captions and recording IDs. All 18 catalogue objects map to four ordered recordings. Next line and guided tour retain their existing controls. Audio is opt-in, stops on context change, minimization, detail opening, and unmount; hidden tabs pause playback. Classic archive read-aloud remains device TTS.

Supplied sources:
- `Downloads/mascot_voice_script_map_with_timestamps.json`: copied verbatim.
- `Downloads/mascot_voice_clips/*.wav`: copied without conversion (94 files).
- `Downloads/mascot_voice_clips/REPORT.txt`: preserved alongside the clips.
- The original script map's IDs/text match the timestamp map exactly.
- Every clip is byte-identical to its master WAV slice starting 20 ms before the listed start (clamped at zero). Clips contain up to 20 ms padding at each end.

**Review limitation:** 33 entries are marked `REVIEW` in the supplied map/report. File identity and timestamp alignment do not prove spoken-word accuracy. No ASR or human listening certification was performed; review those clips before treating the recording boundaries/transcription as final. The full master is not duplicated into the website because the split clips already contain the same audio.

Checks:
```
npm test
npm run build
node tests/mascot-browser.mjs
```
The browser test uses installed Google Chrome and verifies real audio time progression, matching Moon/Mars captions and URLs, cancellation on next line, mute, and runtime errors.

Run locally:
```
cd /Users/moawyamahmoudshariff/left-behind-mascot
npm run dev -- --port 5174
```
Current server log: `/tmp/left-behind-mascot-vite.log`.

After a friend's changes arrive, merge/rebase them into this branch with a clean worktree, re-run the checks, and resolve any `CinematicApp.tsx` conflicts explicitly. No automatic pull or push is configured by this integration.
