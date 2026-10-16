# Update my portfolio in this workspace

Inspect the existing frontend, framework and supplied portfolio kit, then implement these changes in the actual project. Preserve the working stack. These instructions override older CV and kit content. My portfolio is mehedinaeem.dev. Take broad visual inspiration from https://shihabmuhtasim.github.io/ and create an original design using my content. Keep everything frontend-only and local; do not deploy.

## Professional, modern design
Use a coherent colour palette, strong typography, consistent spacing, aligned cards and clear section hierarchy. Remove excessive card height and empty space. Add subtle card entrance and hover animation with reduced-motion support. Make each project, paper and award card's primary area clickable using accessible links or buttons. Keep secondary links independently usable; do not nest interactive elements. Check desktop, tablet and mobile.

Animate my real hero portrait with a subtle float and an intentional flip on hover, keyboard interaction or tap. Use an existing second portrait or a concise identity panel on the back. Preserve my actual face.

## Updated award images — use all five

The supplied kit includes these matching 1200 × 900 images in website/assets/awards/cards/:

| Award | Card image |
| --- | --- |
| Digital Transformation & Leadership Award | digital-transformation-card.png |
| Research Week: 2nd Runner-Up, Idea Competition | research-week-card.png |
| Innovatex: Top 10 among 200+ teams | innovatex-hackathon-card.png |
| HSC academic recognition | hsc-academic-recognition-card.png |
| World Vision JSC recognition | world-vision-jsc-recognition-card.png |

Copy the assets into this frontend's public/static directory with suitable paths. Use all five, especially the newly added Innovatex and Research Week photos. Research Week's result is **2nd Runner-Up**. The Innovatex event banner identifies **2025**.

The three trophy images already have transparent backgrounds. Keep event photographs and their event backgrounds intact. Give all cards the same 4:3 media frame with object-fit: contain, a subtle neutral backdrop and consistent compact copy spacing. Preserve faces, trophy shapes, logos and text. Avoid stretching or aggressive cropping.

Show one primary image per card. On click, open original full-size photographs and certificates in an accessible gallery displaying one image at a time, with Previous/Next, image count, arrow-key navigation, Escape to close and focus restoration. Original trophy photos remain in website/assets/awards/. Unchanged event photos are website/assets/conferences/Innovatex-hackathon-bubt.png and website/assets/conferences/Research-week-runner up.png. Use original evidence for close reading; the edited trophy cutouts are card presentation assets. Exact mappings are in content/portfolio.json and docs/AWARD_IMAGES.md.

## Browser tab icon — use my portrait

Use the uploaded **me.png** as the browser tab icon. The kit includes website/assets/icons/me.png unchanged, plus standard exports:

- website/favicon.ico: 16, 32 and 48 pixel entries.
- website/assets/icons/favicon-32.png and favicon-16.png: PNG alternatives.
- website/assets/icons/apple-touch-icon.png: 180 × 180.
- favicon-192.png and favicon-512.png in the same icons directory, if an existing manifest needs them.

Replace all old monogram or framework favicon references. Update the HTML head and any existing manifest using paths compatible with the project's base URL. Do not add PWA infrastructure just for these files. Keep my portrait's proportions and identity intact. This request concerns the tab icon separately from the hero portrait.

## Research
Organise research into conference papers, journal manuscripts and abstracts/presentations. Keep preprint access on its corresponding paper, or offer a filter without duplicating paper counts. Preserve each publication status.

Make a paper card open a readable detail panel with title, authors, venue, date, status and the actual abstract where supplied or verified from the paper. Provide **Read abstract** and a separate **Read full paper** action when genuine source material exists. Use the real IEEE, DOI, arXiv or supplied PDF link; prefer an open-access version where available. Never use a presentation certificate as the full paper.

Do not invent an abstract or present an editorial summary as the official abstract. If the abstract or full paper is unavailable, omit that action and report the missing source in completion notes. Distinguish published, presented, accepted, under-review and abstract-only work.

## Selected projects
Use an image on every selected project card, with its correct project name. Follow the 12 cover mappings in content/project-cover-map.json and the cover objects in content/portfolio.json. Include the JKKNIU Research Society website and JKKNIU MUN website; their covers are actual website captures. Keep original technical figures in the detail gallery.

Initially show two rows: six cards at three desktop columns, four at two tablet columns and two at one mobile column. Add **View all projects** and **Show less**. Expansion must show the remaining matching projects; filtering and breakpoint changes must keep this behaviour consistent. Make the full primary card area open details with description, technologies, real links and honest scope.

## Work and leadership
Present experience as a professional timeline with role, organisation, dates or supplied duration, and concise contributions. Group related appointments where useful. Preserve established ordering and do not invent dates for undated roles. Include Programming Hero Campus Ambassador as **March 2025 · 5 months**, with its supplied image.

## Corrections and exclusions
- Do not show CGPA in rendered pages or public structured content.
- Do not include Programming Trainer, Private Tutor or the TechMind Hackathon 1st Runner-Up award.
- CSE Fest 2025 mini-cricket: **captain of the runner-up team**.
- Running achievement: **7.5 km in 35 minutes**.
- Preserve the official JKKNIU Research Society logo exactly as supplied.
- Preserve all other supported awards, certifications, conferences, sports and project details. Do not fabricate dates, results, metrics, affiliations or publication claims.

## Complete and verify
Implement the changes; do not stop at a plan. Preserve original evidence and use local assets. Keep contact links functional without fake form submissions. Run available build/lint checks and appropriate existing tests. Verify image paths, favicon metadata, full-card activation, project expansion, timeline layout, galleries, keyboard navigation and reduced motion. Perform desktop/mobile browser checks where supported and report any checks that could not run. Summarise changed files and genuinely missing source material. Do not deploy.
