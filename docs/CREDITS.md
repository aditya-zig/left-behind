# Media, data and software credits

## NASA resources

The **machine-readable, per-file register** is [`src/assets.json`](../src/assets.json). Each entry links the original source record and exact download, includes the retrieval date (14 November 2026), byte count and SHA-256. The in-app Sources page makes original records and local downloads accessible.

NASA 3D Resources collection, pinned to `11ebb4ee043715aefbba6aeec8a61746fad67fa7`:

- Apollo Lunar Module (full two-stage reference; only the descent stage remained)
- Mars Exploration Rover — Opportunity
- InSight Cruise Lander, arm-deployed configuration (not its final dusty surface condition)
- Ingenuity Mars Helicopter
- Viking Lander (generic model, used for Viking 1)
- Dawn; NEAR Shoemaker; Pioneer 10; Kepler (A)
- JSC Mission Control Room (opening uses the supplied preview)
- Apollo 11 Landing Site and Opportunity Landing Site STL printing models
- Mars map, Hipparcos star catalogue projection, Earth image, lunar reference image and original model previews

Spirit, Viking 2 and Pioneer 11 use their NASA-published mission imagery rather than relabeling a sibling spacecraft’s model.

Collection: https://github.com/nasa/NASA-3D-Resources. Its README lists NASA/JPL and individual contributors and links NASA media guidelines. “NASA model” in the interface means a model distributed in NASA's official collection, not a claim that all conversion work was authored by NASA. Preserve original creator credits and any rights notices found at each linked source.

**Moon map:** NASA Scientific Visualization Studio, CGI Moon Kit, https://svs.gsfc.nasa.gov/4720/. NASA/Goddard Space Flight Center; Ernie Wright; Lunar Reconnaissance Orbiter camera and laser altimeter teams. The 2K color map is a visualization texture, not a navigation or scientific measurement product.

**Apollo photography:** NASA Image and Video Library. AS11-40-5927 (Aldrin at the lunar module, Neil Armstrong); AS15-86-11603 (Irwin and Apollo 15 rover, David Scott); AS12-47-6918 (Alan Bean with ALSEP, Charles Conrad); AS11-40-5952 (Apollo 11 retroreflector); AS11-44-6549 (Earth over the lunar horizon). The solar-system illustration is NASA/JPL PIA10969 and is explicitly a published artist concept, not to scale.

**Mission-page imagery:** NASA Science / NASA/JPL-Caltech and other credited mission partners. Original page links are in the register. Opportunity, Spirit, InSight, Dawn, NEAR, Pioneer, Phoenix and Kepler illustrations are NASA-published artist concepts, **not** photographs of the spacecraft at their final locations. Viking 2 uses a technical drawing. Viking 1 uses its first surface image. The original images are not AI-generated assets from this project.

NASA guidelines: https://www.nasa.gov/nasa-brand-center/images-and-media/. NASA identifiers, insignia and employee likenesses have special restrictions. The site does not use NASA's insignia as a project logo, claim endorsement, or imply that an astronaut narrated these stories. NASA publication is not a blanket waiver of third-party rights.

## Image-first local checkpoint (15 November, 9.46am)

`src/photography.json` adds 31 sourced NASA image records, also listed in the in-app source register. Each file retains its original NASA record/download, actual dimensions, byte count and SHA-256. Two oversized originals also use NASA's own ~large display renditions (with separate dimensions, URLs and checksums) in the interface; full-resolution originals are still available. These are not project-generated or AI-upscaled images. Photography is NASA / the astronaut or mission teams named on the linked original; Mars imagery includes NASA/JPL-Caltech/MSSS. NASA publication does not erase contributor rights.

The cylindrical Sun map is [NASA SVS 3851](https://svs.gsfc.nasa.gov/3851/), NASA/GSFC/SVS, Tom Bridgman, STEREO and SDO teams: 304 Å extreme-ultraviolet observations from 2011, in false colour. NASA's gap-filled historical visualization is not a live or visible-light Sun. Its 4096×2048 source is mapped onto an ordinary sphere without generated surface pixels or a synthetic corona.

The descent-stage drawing is extracted from page 4 (printed page 64) of [NASA's LM overview](https://www.nasa.gov/wp-content/uploads/static/history/alsj/08_LM_&_SLA_Overview_pp61-68.pdf). The PDF's embedded JPEG is extracted and cropped to its original diagram bounds, without drawing or generating new hardware. The manifest records this derivation. Other new photographs are unaltered source bytes; low-resolution historical originals are not upscaled. Captions distinguish programme/ground references, hardware before deployment, orbital images and rotor shadows from actual close-up photographs. The 1920px Apollo 11 reflector file reuses the already verified NASA image when the attempted higher-resolution download is unavailable.

## Fonts

- **Atkinson Hyperlegible Next** (local `feedback` branch interface), The Atkinson Hyperlegible Next Project Authors, SIL Open Font License 1.1. Source: https://github.com/google/fonts/tree/main/ofl/atkinsonhyperlegiblenext. Font: `public/fonts/atkinson-hyperlegible-next.ttf`; full license: `public/fonts/OFL.txt`. Served locally, without a font-service request.

- **Imbue**, The Imbue Project Authors / Etcetera Type Company, SIL Open Font License 1.1. Original: https://github.com/google/fonts/tree/main/ofl/imbue. License: `imbue-OFL.txt`.
- **Albert Sans**, The Albert Sans Project Authors, SIL Open Font License 1.1. Original: https://github.com/google/fonts/tree/main/ofl/albertsans. License: `albertsans-OFL.txt`.

Unmodified Google Fonts WOFF2 files are self-hosted. They are interface typography, not NASA media.

## Software

React / React DOM (MIT); Motion for React 14.14.0 (MIT, https://github.com/motiondivision/motion); Three.js (MIT); Google model-viewer (Apache-2.0); Vite (MIT); TypeScript (Apache-2.0); Playwright (Apache-2.0). Dependency lockfile and installed packages retain full upstream licenses. Motion animates the fictional Orbit interface, not NASA imagery or equipment.

Local Draco decoder files are copied unmodified from Three.js 0.172.0 `examples/jsm/libs/draco/gltf/`. Draco: Copyright Google Inc., Apache License 2.0; full license in `draco-LICENSE.txt`. The local decoder avoids a runtime dependency on Google's CDN.

## Original work and AI disclosure

The interface, collection structure, explanatory comparisons and third-person educational scripts are original application work, with AI assistance for implementation, research organization and wording. They are not NASA transmissions, quotations, official NASA narration, or official guidance. No AI-generated space imagery, videos or equipment models were created for the project. Device speech synthesis is optional and is not a recorded human performance.

## Local redesign media (not pushed)

- **NASA+ animation excerpts:** *Moon Base, The Series | Lunar Rovers*, https://plus.nasa.gov/video/moon-base-update-lunar-rovers/. Operator-supplied film, animation-only straight cuts, no interviews/audio. These are future exploration concepts, not historical recordings. NASA publication does not remove original contributor rights. Per-cut provenance and derived-file checksums: `src/media.json`.
- **Blip UFO:** operator-supplied `3d.zip/mascot-ufo.html`. Geometry, materials and motion are adapted from that supplied source, preserved in `docs/assets/mascot-ufo.source.txt`. It is a fictional interface guide, not a NASA model. The local adaptation removes its CDN imports, generated star background, chat/export controls and `/api/speak` network call.
- **PIA10748:** NASA/JPL-Caltech/R. Hurt, Milky Way artist concept, https://science.nasa.gov/photojournal/our-milky-way-gets-a-makeover-artist-concept/.
- **GSFC_20171208_Archive_e000790:** archival NASA SDO Sun image, https://images.nasa.gov/details/GSFC_20171208_Archive_e000790. Not a live feed.

The two additional original NASA image files are recorded in `src/assets.json`; the derived NASA+ MP4 and actual-frame poster have their own provenance register. Equipment without a matching NASA 3D model remains an explicitly labelled NASA image. No substitute model is represented as the historical object.
