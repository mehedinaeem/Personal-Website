# Award images and portrait favicon — 16 October 2026

The uploaded ZIP included the Innovatex and Research Week event photographs. They are now connected to their award records. The three trophy photos were edited with the built-in imagegen tool to remove surrounding backgrounds; the finished alpha images were fitted onto consistent canvases. Original evidence is unchanged.

| Record | Card asset, relative to website/ | Original gallery |
| --- | --- | --- |
| digital | assets/awards/cards/digital-transformation-card.png | Original trophy, receiving photo and certificate in assets/awards/ |
| research-week | assets/awards/cards/research-week-card.png | assets/conferences/Research-week-runner up.png |
| innovatex | assets/awards/cards/innovatex-hackathon-card.png | assets/conferences/Innovatex-hackathon-bubt.png |
| hsc-recognition | assets/awards/cards/hsc-academic-recognition-card.png | assets/awards/hsc-academic-recognition.webp |
| jsc-recognition | assets/awards/cards/world-vision-jsc-recognition-card.png | assets/awards/world-vision-jsc-recognition.webp |

All card assets are **1200 × 900**, with a 4:3 aspect ratio. Trophies have alpha transparency, equal visible-height targets and aligned bases. Event photos keep their backgrounds. The supplied Research Week photograph is 596 × 335 pixels and is rescaled to fit the common canvas, with no AI reconstruction or sharpening. Use a fixed 4:3 frame with object-fit: contain for consistent layout independently of source resolution.

The starter now displays five illustrated award cards, with the primary card area opening details. Galleries show one original image at a time with Previous/Next, a count, arrow-key navigation and Escape to close. The TechMind award is excluded from the public dataset as requested.

AI background extraction can alter small inscriptions. The unchanged original photographs remain the evidence for close reading; edited cutouts are card previews. The official standalone Research Society logo has not been modified. Prompts, method and source/output paths are in content/award-image-edit-prompts.json. Full tool outputs are kept in evidence/award-image-update/generated-cutouts/.

## Portrait favicon

The supplied me.png is copied unchanged to website/assets/icons/me.png. Standard exports preserve its identity and transparency; no new face was generated.

| File, relative to website/ | Size |
| --- | --- |
| favicon.ico | 16, 32 and 48 pixel ICO entries |
| assets/icons/favicon-16.png | 16 × 16 |
| assets/icons/favicon-32.png | 32 × 32 |
| assets/icons/favicon-48.png | 48 × 48 |
| assets/icons/apple-touch-icon.png | 180 × 180 |
| assets/icons/favicon-192.png | 192 × 192 |
| assets/icons/favicon-512.png | 512 × 512 |

The starter's HTML head uses relative ICO, PNG and Apple touch icon URLs. Copy these into the actual frontend's static/public directory and adapt paths to its configured base URL. Remove old monogram or framework icon references. Existing favicon caching may require a browser reload after the changed files are deployed.

To reproduce canvas and icon exports, install Pillow and run python3 scripts/update_award_assets.py. Background extraction is performed by imagegen; the script only resizes and pads finished assets. Website runtime has no new dependency.

Use CODEX_PROMPT.md for full modernisation instructions, or AWARDS_AND_FAVICON_UPDATE_PROMPT.md for the focused image/icon update. Only website/ is public hosting content.
