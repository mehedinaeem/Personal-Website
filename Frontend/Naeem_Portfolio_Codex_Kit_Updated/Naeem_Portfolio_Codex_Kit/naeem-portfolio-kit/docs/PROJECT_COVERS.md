# Updated images for every selected project

All twelve selected projects have a dedicated named cover. Each project’s `cover` object is the card image, and that image is also first in its `images` array for compatibility. Existing screenshots, illustrations, and research figures are retained after the new cover in the detail gallery.

The ten new illustrations were created with the built-in image-generation tool, using the project README information reviewed for this kit. They are conceptual covers, not photographs of deployed systems, interface screenshots, model predictions, or evaluation evidence. The exact generation and revision prompts are preserved in `content/project-cover-prompts.json`.

The Research Society and MUN images are unchanged captures of the actual public homepages, obtained on 15 October 2026. Their real website names and branding are visible. No organization logo was regenerated, cropped out, or altered.

## Cover mapping

All paths below are relative to `website/`.

| Project ID | Project | Cover | Basis |
| --- | --- | --- | --- |
| `smartpresence` | SmartPresence | `assets/projects/covers/smartpresence-cover.webp` | Classroom recognition and person tracking; conceptual illustration. |
| `lumo` | LUMO | `assets/projects/covers/lumo-cover.webp` | Local speech processing, edge inference, and speech synthesis. |
| `bitol` | BITOL | `assets/projects/covers/bitol-cover.webp` | Banana surface-appearance detection; no biological diagnosis implied. |
| `theatrestageai` | TheatreStageAI | `assets/projects/covers/theatrestageai-cover.webp` | Theatre scenes, scripts, blocking, and lighting planning. |
| `food-waste` | Restaurant food-waste modelling | `assets/projects/covers/food-waste-cover.webp` | Restaurant food-waste regression research; no measured-result claims. |
| `campus-transport` | Smart Campus, Smart Transport | `assets/projects/covers/campus-transport-cover.webp` | Campus bus routes, booking, and transport workflows. |
| `research-society` | JKKNIU Research Society | `assets/projects/covers/research-society-cover.jpg` | Actual [jkkniurs.org](https://jkkniurs.org/) homepage. |
| `munc` | JKKNIU Model United Nations Club | `assets/projects/covers/munc-cover.jpg` | Actual [jkkniu-munc.tech](https://jkkniu-munc.tech/) homepage. |
| `aos` | Amader Online School | `assets/projects/covers/aos-cover.webp` | Free learning resources, lessons, and educational video access. |
| `office-energy` | Office Energy Monitor | `assets/projects/covers/office-energy-cover.webp` | Simulated room-level device monitoring; explicitly labeled as simulated. |
| `spam-email` | Spam email classification | `assets/projects/covers/spam-email-cover.webp` | Email classification with the repository’s machine-learning context. |
| `smartstudy` | SmartStudyAI | `assets/projects/covers/smartstudy-cover.webp` | Summarization, learning, and quizzes from the available repository metadata. |

## Files for Codex

- `content/project-cover-map.json`: exact filenames, dimensions, provenance, hashes, and project IDs.
- `content/project-cover-prompts.json`: full prompts and the transport-cover text cleanup instruction.
- `content/portfolio.json`: updated `cover` fields and gallery ordering.
- `docs/project-covers.html`: open locally to inspect all twelve images together.
- `PROJECT_IMAGES_UPDATE_PROMPT.md`: focused instructions for applying the images to the existing React/Vite website.

## Display rules

Use the entire image with `object-fit: contain` and a neutral background. A 16:9 card frame is suitable, with letterboxing for the two taller actual-homepage captures. Do not zoom or crop the images on hover: doing so can cut off the title or the organization logo.

The starter’s project-card renderer now requires a real image for every selected project. It no longer falls back to a text-only CSS tile. The Research Society and MUN records are marked featured so an implementation that uses that flag will include them.

## Verification

The selected images were visually inspected for readable names and subject relevance. All image files were decoded and local references were checked during the package validation. This update does not add a browser visual QA claim for the portfolio application itself.
