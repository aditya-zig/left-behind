# Source methodology and scientific guardrails

Reviewed 14 November 2026. This is a historical, editorial record; review date is not proof of current spacecraft health.

## Source hierarchy

1. The official Space Apps challenge and its listed NASA resources establish scope.
2. NASA NSSDCA catalogue entries establish engineering design, mission chronology and landing references.
3. NASA Science mission records and dated NASA/JPL announcements establish results and end-of-mission distinctions.
4. NASA's own model collection, SVS and Image Library supply visual assets. Original metadata and source links stay attached to the files.

Every record in `src/data.ts` includes sources with a `supports` field stating exactly what the source supports. A visually attractive page is not evidence for an unrelated claim. `docs/source-urls.json` records the initial mission-page reading list; the authoritative current in-app citations are `src/data.ts`.

## Challenge-listed resources put to work

- **1969-059C:** Eagle's two-stage design, 21.55 kg returned samples and LRO/DE421 landing coordinates. Complete-model caveat prevents showing an ascent stage as hardware still on the Moon.
- **1971-063C:** Apollo 15 traverses (27.9 km), 77.31 kg samples and landing reference. This is the LM/ALSEP catalogue record, which also describes LRV operations; the separate NSSDCA LRV overview provides the broader rover context. We do not pretend the LM coordinate is the rover's exact parking location.
- **1969-099C:** Apollo 12 ALSEP central-station coordinate (distinct from the LM), experiment suite and 30 September 1977 shutdown.
- **Surveyor 3:** robotic soil investigation and the unusual Apollo 12 visit/recovery of components.
- **Mars Pathfinder:** Sojourner's rover/lander relationship and mission science, not a false attribution of all Pathfinder data to the tiny rover alone.
- **Spirit/Opportunity, Viking, InSight and Ingenuity:** purpose, chronology, science and distinct failure/retirement conditions, cross-checked against individual NASA mission records.
- **Dawn, NEAR, Pioneer and Kepler:** educational comparisons outside the Moon/Mars surface inventory. Locations and end states are not conflated with surface abandonment.

## Coordinates

Markers are contextual. Exact coordinates are used only at source precision; a region or parent lander coordinate is explicitly called out. Longitudes are normalized to east-positive −180…180. Viking 2's 225.71° W becomes 134.29° E; Phoenix's 234.25° E becomes −125.75°. The lunar texture is a 2:1 equirectangular LRO-based map, not a circular portrait. Neither globe is a navigation-grade map.

NASA printing-model terrain is a separate inspectable reference: Apollo 11 and Opportunity landing sites. No precise spacecraft placement or fictitious first-person surface walk is inferred from it. It is not appropriate to overlay all mission markers on a single local terrain.

## Dates and status

- Opportunity: **10 June 2018** last communication, **13 February 2019** NASA mission closure. Different events.
- InSight: **15 December 2022** end date in NASA's mission overview; retirement announcement explains dwindling solar power.
- Ingenuity: **18 January 2024** last flight, **25 January 2024** flight-mission announcement. Grounding is not a claim that all electronics stopped.
- Apollo reflectors: a **2019** account documents continuing passive science. No assertion of verified 2026 functionality.
- Viking lander dates are not substituted with their orbiters' dates.
- Kepler and Dawn are retired in their respective orbits; NEAR landed on Eros; Pioneer records refer to spacecraft traveling outward. None is placed on the Moon or Mars.

## Writing and visuals

Stories are third-person educational interpretation, not quotations. No fictional “last words,” invented telemetry or audio said to be from NASA. Water evidence / potentially habitable environments are not detection of life. Whole-mission budgets are not prices for abandoned objects, so unsupported costs are omitted.

Reference models are not final-condition scans. NASA-published artist concepts are visibly labeled. Reproducibility comes from original file bytes, pinned GitHub revision and checksums, not from re-generating lookalike assets. Media rights and contributor credits remain attached to the original records.

`npm run check:sources` checks HTTP availability only. A 200 response is not an independent scientific review; a transient 403/timeout is not proof a NASA citation is invalid. Human editorial review and original source context are still necessary.
