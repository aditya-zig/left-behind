# Media, data and software credits

## NASA resources

The **machine-readable, per-file register** is [`src/assets.json`](../src/assets.json). Each entry links the original source record and exact download, includes the retrieval date (14 November 2026), byte count and SHA-256. The in-app Sources page makes original records and local downloads accessible.

NASA 3D Resources collection, pinned to `11ebb4ee043715aefbba6aeec8a61746fad67fa7`:

- Apollo Lunar Module (full two-stage reference; only the descent stage remained)
- Mars Exploration Rover — Opportunity (also used as the shared MER reference for Spirit)
- InSight Cruise Lander, arm-deployed configuration (not its final dusty surface condition)
- Ingenuity Mars Helicopter
- Viking Lander (generic model, used for both Viking landers)
- Dawn; NEAR Shoemaker; Pioneer 10 (also used as Pioneer 11's shared-design reference); Kepler (A)
- JSC Mission Control Room (opening uses the supplied preview)
- Apollo 11 Landing Site and Opportunity Landing Site STL printing models
- Mars map, Hipparcos star catalogue projection, Earth image, lunar reference image and original model previews

Collection: https://github.com/nasa/NASA-3D-Resources. Its README lists NASA/JPL and individual contributors and links NASA media guidelines. “NASA model” in the interface means a model distributed in NASA's official collection, not a claim that all conversion work was authored by NASA. Preserve original creator credits and any rights notices found at each linked source.

**Moon map:** NASA Scientific Visualization Studio, CGI Moon Kit, https://svs.gsfc.nasa.gov/4720/. NASA/Goddard Space Flight Center; Ernie Wright; Lunar Reconnaissance Orbiter camera and laser altimeter teams. The 2K color map is a visualization texture, not a navigation or scientific measurement product.

**Apollo photography:** NASA Image and Video Library. AS11-40-5927 (Aldrin at the lunar module, Neil Armstrong); AS15-86-11603 (Irwin and Apollo 15 rover, David Scott); AS12-47-6918 (Alan Bean with ALSEP, Charles Conrad); AS11-40-5952 (Apollo 11 retroreflector); AS11-44-6549 (Earth over the lunar horizon). The solar-system illustration is NASA/JPL PIA10969 and is explicitly a published artist concept, not to scale.

**Mission-page imagery:** NASA Science / NASA/JPL-Caltech and other credited mission partners. Original page links are in the register. Opportunity, Spirit, InSight, Dawn, NEAR, Pioneer, Phoenix and Kepler illustrations are NASA-published artist concepts, **not** photographs of the spacecraft at their final locations. Viking 2 uses a technical drawing. Viking 1 uses its first surface image. The original images are not AI-generated assets from this project.

NASA guidelines: https://www.nasa.gov/nasa-brand-center/images-and-media/. NASA identifiers, insignia and employee likenesses have special restrictions. The site does not use NASA's insignia as a project logo, claim endorsement, or imply that an astronaut narrated these stories. NASA publication is not a blanket waiver of third-party rights.

## Fonts

- **Imbue**, The Imbue Project Authors / Etcetera Type Company, SIL Open Font License 1.1. Original: https://github.com/google/fonts/tree/main/ofl/imbue. License: `imbue-OFL.txt`.
- **Albert Sans**, The Albert Sans Project Authors, SIL Open Font License 1.1. Original: https://github.com/google/fonts/tree/main/ofl/albertsans. License: `albertsans-OFL.txt`.

Unmodified Google Fonts WOFF2 files are self-hosted. They are interface typography, not NASA media.

## Software

React / React DOM (MIT); Three.js (MIT); Google model-viewer (Apache-2.0); Vite (MIT); TypeScript (Apache-2.0); Playwright (Apache-2.0). Dependency lockfile and installed packages retain full upstream licenses.

Local Draco decoder files are copied unmodified from Three.js 0.172.0 `examples/jsm/libs/draco/gltf/`. Draco: Copyright Google Inc., Apache License 2.0; full license in `draco-LICENSE.txt`. The local decoder avoids a runtime dependency on Google's CDN.

## Original work and AI disclosure

The interface, collection structure, explanatory comparisons and third-person educational scripts are original application work, with AI assistance for implementation, research organization and wording. They are not NASA transmissions, quotations, official NASA narration, or official guidance. No generated space images, generated videos or generated animations are bundled. Device speech synthesis is optional and is not a recorded human performance.
