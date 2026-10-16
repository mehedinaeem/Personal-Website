# Portfolio project instructions

## Scope

This is a local portfolio source kit for Md Mehedi Hasan Naeem. The current user request is to prepare a ZIP first. Keep work local. Do not deploy, change DNS, modify the live mehedinaeem.dev website, or push repository changes unless the user subsequently requests that action.

Build a frontend-only portfolio. Do not add a database, server API, authentication, admin panel, analytics, serverless functions, secret keys, or a fake contact-form submission flow. Contact uses mailto and external professional profiles.

## Read first

1. `START_HERE.md`
2. `docs/DESIGN_BRIEF.md`
3. `docs/CORRECTIONS.md`
4. `docs/RESEARCH_STATUS.md`
5. `content/portfolio.json`

## Evidence order

The latest explicit user correction overrides the supplied CVs. For publication metadata, use authoritative IEEE/arXiv records when available, followed by the current supplied CV and actual presentation certificates. The old portfolio has stale statuses and placeholder fields; do not copy those back into the new data. Professional history is supplemental and identified in the source notes.

Never invent a paper title, author expansion, DOI, publication venue, citation metric, event date, result, award, appointment, photograph caption, or project outcome. Leave unknown fields empty in data and omit them gracefully from visitor-facing text. Keep explanatory owner notes in `docs/` rather than displaying them as public biography.

## Binding corrections

- Latest public-content exclusions: do not show CGPA, Programming Trainer, Private Tutor, or the TechMind Hackathon 1st Runner-Up award. Original CV/evidence files remain unchanged.
- Use the five equal-size award covers in `website/assets/awards/cards/`, including the newly supplied Innovatex and Research Week images. Use the original event/trophy photos in detail galleries. See `docs/AWARD_IMAGES.md`.
- The browser tab icon must use the supplied `me.png` portrait and the included `favicon.ico`/PNG exports. Do not restore the old monogram or framework icon.
- CSE Fest 2025 mini-cricket: **captain of the runner-up team**, not only a team member.
- Running event: **7.5 km in 35 minutes**, not 10 km. It is not a full marathon distance.
- Programming Hero: **Campus Ambassador, five months beginning March 2025**. Use “Mar 2025 · 5 months”; do not infer an exact end month.
- Current society role: **President, 6th Executive Committee**, with the previous Vice President role recorded separately.
- The journal manuscript is **under review**, not published. Its exact title and full author metadata are not established.
- The first IEEE paper is the SPISFM i-COSTE 2025 paper with DOI `10.1109/i-COSTE68047.2025.11467551`.
- LUMO and restaurant food-waste research are **presented, proceedings publication in progress** as of the source snapshot. The four other i-COSTE 2026 entries are **accepted, presentation scheduled**.

## Research organization

Maintain separate visitor filters for conference papers, journal manuscripts, preprints, and abstracts/presentations. A preprint is an alternative link to an existing paper, not an extra paper in the total. Do not describe all conference entries as already published in IEEE Xplore. Do not infer Scopus indexing for every item from the author’s general CV statement.

The BILTEK LUMO safety-assistance presentation and COMPAS offline voice-assistant paper are different records. Conference-city labels do not establish physical travel or attendance in that country. Initials not established by the evidence must remain initials.

## Project claims

Use the project READMEs and `content/portfolio.json` for current scope. SmartPresence includes independent recognition and tracking workflows; a unified automatic fingerprint-to-track pipeline is not yet connected. Restaurant food-waste evaluation uses a constructed proxy target. BITOL’s two classes describe surface appearance, not biological diagnosis. Office Energy Monitor uses simulated device readings. The campus-transport CV and README differ about live GPS integration; preserve that scope distinction. TheatreStageAI is a research prototype.

## Assets and publishing boundary

Use descriptive assets in `website/assets/`. Do not hotlink Facebook/CDN images or replace real personal photographs with generated pictures. Full originals and source links are available in `evidence/` and the asset manifest.

All twelve selected projects now have named cover images. Use each record’s `cover` object (also the first `images` item) on its project card. Covers live in `website/assets/projects/covers/`. Ten are repository-informed illustrations; the Research Society and MUN covers are actual public-homepage captures. Preserve the existing technical figures/screenshots as detail-gallery material. Keep full cover titles and logos visible with `object-fit: contain`; do not substitute CSS-only tiles, unrelated pictures, or regenerated organization logos. See `docs/PROJECT_COVERS.md` and `PROJECT_IMAGES_UPDATE_PROMPT.md`.

Use the official JKKNIU Research Society logo as supplied, without redrawing, cropping, recoloring, distortion, or cutting off any part. Use `object-fit: contain` for logos and certificate previews. The society’s motto is “Research for enriching knowledge.”

Only `website/` is public deployment content. Do not publish the whole kit, original RA letter, Stanford-oriented CV, source inventories, or owner-review notes. The RA role is public; the appointment letter is archived as evidence and contains student identifiers. The current CV is the public download; originals are not overwritten.

## Implementation and verification

`CODEX_PROMPT.md` contains the latest complete professional-design request. `AWARDS_AND_FAVICON_UPDATE_PROMPT.md` is the focused image/icon update prompt for an existing frontend. The image/icon update is applied to this starter; the wider hero flip, two-row project expansion, research abstract details and work timeline are implementation instructions for the next Codex design pass.

Prefer the existing buildless HTML/CSS/JS implementation. Keep profile and portfolio content editable in the JSON source. If changing the architecture, keep the frontend static and preserve all content and asset mappings. Use relative URLs for local files and root/subdirectory compatibility.

Run `python3 scripts/build.py`, `python3 scripts/validate.py`, and JavaScript syntax checks after edits. Use available browser QA to inspect desktop and mobile layouts, filtering, dialogs, keyboard focus, and full-image galleries before calling a subsequent visual iteration production-ready. Do not claim browser checks that were not run.

Design with accessible contrast, keyboard navigation, visible focus, reduced-motion support, image alternative text, and mobile layouts. Avoid fake proficiency bars, fabricated testimonials, invented metrics, excessive animation, generic filler, and unrelated personal history.
