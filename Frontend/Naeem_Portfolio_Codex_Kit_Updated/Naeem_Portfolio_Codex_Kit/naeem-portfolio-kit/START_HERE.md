# Mehedi Hasan Naeem — Portfolio rebuild kit

This folder contains the organized source material and a working frontend starter for updating **mehedinaeem.dev**. It follows the broad visual direction of [Shihab Muhtasim’s portfolio](https://shihabmuhtasim.github.io/) with an original implementation and Naeem’s own content.

## Start with the website

Open `website/index.html` in a modern browser. It works directly from the folder without installation, a backend, a database, or API keys. Internet access is needed only when you follow external research, social, or project links.

The website includes responsive layouts, a mobile menu, research category filters and search, project detail dialogs, BibTeX copy/download, certificate previews, conference galleries, sports galleries, and email contact links. It uses plain HTML, CSS, and JavaScript.

## Continue in Codex

Open this entire folder as the workspace and paste the contents of `CODEX_PROMPT.md` into Codex. `AGENTS.md` contains the project’s content and implementation rules.

The starter can be refined in place. A React conversion is optional; it is not required for a frontend-only portfolio.

## Where things live

| Path | Purpose |
| --- | --- |
| `website/` | The complete frontend. This is the only folder intended for static hosting. |
| `content/portfolio.json` | Editable profile, education, research, projects, roles, awards, certifications, conferences, sports, and skills. |
| `content/publications.bib` | Bibliography with publication status preserved. |
| `content/asset-manifest.json` and `.csv` | Descriptive asset names, source files, original links, and processing notes. |
| `content/github-repository-catalog.json` | Public repository inventory, including projects not selected for the website. |
| `content/original-file-inventory.json` | Inventory and SHA-256 hashes of all 20 uploads. |
| `evidence/original-uploads/` | All 20 supplied files, unchanged, including the CVs and original conference ZIP. |
| `evidence/conference-certificates/` | Extracted conference certificates and the correct COMPAS LUMO certificate. |
| `evidence/repository-notes/` | Retrieved READMEs for the important projects. |
| `docs/` | Design brief, source notes, corrections, research-status decisions, and coverage. |
| `scripts/` | Build and validation tools. The website itself does not need Python. |

## Update the content

Edit `content/portfolio.json`, then run these commands from this folder:

```bash
python3 scripts/build.py
python3 scripts/validate.py
node --check website/app.js
node --check website/content.js
```

The build uses only the Python standard library. It regenerates `website/index.html`, `website/content.js`, and the bibliography. Layout markup lives in `scripts/index.template.html`; styling and interactions live in `website/styles.css` and `website/app.js`.

## What has been incorporated

- Seven IEEE conference papers: one published in IEEE Xplore, two presented with proceedings publication in progress, and four accepted for presentation. Six list Naeem as first author.
- Two arXiv links attached to their existing paper records; one journal manuscript under review; four other abstract/presentation records.
- Twelve selected GitHub projects with descriptions, technologies, source links, detail views, and implementation limits.
- Eleven professional, leadership, and community roles, including the Programming Hero ambassador term beginning March 2025 for five months. Programming Trainer and Private Tutor are excluded as requested.
- The Digital Transformation & Leadership Award with trophy, presentation photograph, and certificate; other supplied academic trophies and CV awards.
- Aspire, Intel, IBM SPSS, and the existing HYD seminar credential, with conference certificates in their own records.
- COMPAS photographs, the correct LUMO presentation certificate, and the other conference records.
- Football champions, CSE Fest runner-up captaincy, and the 7.5 km run completed in 35 minutes, with locally saved photographs.

No change has been made to the live website. The source data is a snapshot as of **15 October 2026**. See `docs/REVIEW_NOTES.md` for metadata that remains incomplete and `docs/VALIDATION.md` for the actual verification performed.

## Updated project images

Every selected project now has a named image in `website/assets/projects/covers/`. The Research Society and MUN cards use actual website captures; the other ten use repository-informed illustrations. Original technical screenshots and figures remain in the detail galleries.

Open `docs/project-covers.html` to review all twelve. Use `PROJECT_IMAGES_UPDATE_PROMPT.md` to apply just these image changes to an existing React/Vite portfolio. The exact image-generation prompts and project-to-image mapping are in `content/project-cover-prompts.json` and `content/project-cover-map.json`.

## Updated awards and portrait tab icon

The five award cards now have matching 1200 × 900 covers. Three trophies have transparent backgrounds; the added Innovatex and Research Week event photographs retain their full scenes. Original trophy and event images remain available in the click-to-open gallery, one image at a time.

The supplied `me.png` portrait is now the starter's browser tab icon. Standard ICO, PNG and Apple touch icon exports are in `website/` and `website/assets/icons/`. See `docs/AWARD_IMAGES.md` for exact paths.

Use `AWARDS_AND_FAVICON_UPDATE_PROMPT.md` for just these image and icon updates in your current VS Code frontend. Use the rewritten `CODEX_PROMPT.md` for the complete professional redesign, including the work timeline, paper abstract/full-paper actions, two-row project expansion and animated portrait flip. Those wider design changes are instructions for the next Codex pass; the current starter update focuses on images, award cards, galleries and favicon integration.

CGPA, Programming Trainer, Private Tutor and the TechMind Hackathon award are excluded from the public structured data and rendered starter. Original source documents are preserved unchanged. The research metadata remains the verified 15 October snapshot; this asset update is dated 16 October 2026.
