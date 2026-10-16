Portfolio content lives in `src/portfolio/content.json`; reusable views and interactions live alongside it. Public routes `/`, `/projects`, `/projects/:slug`, `/research`, and `/research/:slug` use local content. Detail routes use the record IDs from the JSON. Existing administration code is retained separately.

Website-ready assets are in `public/assets/portfolio/`. The designated current CV is `documents/Md_Mehedi_Hasan_Naeem_CV.pdf`. Official society logo bytes are preserved. Certificates and logos use contained previews; gallery dialogs expose full images and original-document links.

The extracted source kit remains in `tools/portfolio-source/naeem-portfolio-kit/`, ignored by Git. Do not place that evidence directory, the archive, signed RA letter, or older application CV in `public/`. Build output includes public assets and application bundles, not the source kit. Public data omits owner notes and source inventories.

Content snapshot: 15 October 2026. Seven conference papers: one published, two presented with proceedings in progress, four accepted. Six first-author records. Two preprints are views of existing records. One journal manuscript is under review, with descriptive topic only and no fabricated citation. Four other presentation records remain separate. Missing journal metadata, acceptance letters, MEETCON dates, and expanded author initials remain unresolved per the kit.

Verification:

- `npm run lint`
- `npm run build`
- `node tools/check-portfolio.mjs`
- Local Chrome at 1440 × 1000 and 390 × 844: initial rendering, no horizontal overflow, research search/category filtering, journal citation suppression, citation dialog, Escape close and focus, project limitations, full-image gallery, mobile navigation, and no console exceptions.

Start the frontend with `npm run dev -- --host 127.0.0.1`. Use the URL Vite prints; it chooses another port when 5173 is occupied. No deployment, push, or DNS changes were performed.

October 2026 redesign: warm neutral and forest palette, editorial typography, contained mapped project covers, full-card native buttons with independent links, research reading dialogs, single-image galleries, responsive two-row filtered project previews, chronological experience timeline, and an accessible portrait flip with a static reduced-motion alternative. CGPA, Programming Trainer, Private Tutor, and TechMind entries are removed from public application data; supporting originals remain unchanged.

The requested ZIP was not present in the workspace or attachments at implementation time. The existing `Naeem_Portfolio_Codex_Kit/naeem-portfolio-kit/` extraction contains the updated `content/project-cover-map.json` and all twelve covers and was used directly. It remains outside `public/`.

LUMO and restaurant food-waste abstracts are transcribed from their official arXiv records (2609.30692 and 2609.08078), with source links and PDF actions. Other records show explicitly labeled research summaries because an original abstract was not established. The SPISFM action opens its DOI/publisher record. Presentation evidence never becomes a full-paper action.

Latest checks passed: lint, production build, portfolio integrity, desktop 1440px / tablet 900px / mobile 390px two-row limits, expansion/collapse, category filtering, excluded content, full-card pointer target, independent secondary link hit targets, original abstract reading and paper URL, native Escape, keyboard portrait flip, reduced-motion static rendering, gallery buttons and arrow keys, rendered image loading, no horizontal overflow, and no browser console errors. Local preview for this session: http://127.0.0.1:5174/ . The build reports an existing stale Browserslist database warning.

Latest experience correction: `ExperienceTimeline.jsx` renders 11 unique roles ordered by established start dates, with one accordion panel open at a time. Native buttons expose `aria-expanded` and `aria-controls`; collapsed regions are inert and hidden. Framer Motion handles brief entrance animations and CSS handles expansion, hover and indicator transitions, with reduced-motion overrides. The six user-corrected ranges are stored in `content.json` and mirrored in legacy data where applicable. Programming Hero now reads Mar 2025–Aug 2025; Intel's experience range is Jun 2025–Sep 2025 while its certificate remains dated 22 September 2025.

The latest supplied folder is `Naeem_Portfolio_Codex_Kit_Updated/Naeem_Portfolio_Codex_Kit/naeem-portfolio-kit/`. Its five award covers, original Innovatex/Research Week photographs, and portrait icon exports are now integrated. Other portfolio records and supporting source documents are retained. Its starter code is excluded from application lint.

Validation for this update: lint, production build, content/asset integrity, and Chrome desktop (1440px)/mobile (390px) checks passed. Browser checks covered initial collapse, one-open behavior, Enter/Space, inert collapsed panels, ARIA associations, corrected dates, sort order, mobile date placement/overflow, reduced motion, award-image loading, favicon configuration and no console errors. Screenshot review covered desktop and mobile timeline views. Session preview: http://127.0.0.1:5175/ . No deployment performed.
