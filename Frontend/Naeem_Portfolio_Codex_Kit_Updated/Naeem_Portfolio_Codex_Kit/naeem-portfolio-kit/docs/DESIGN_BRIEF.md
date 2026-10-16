# Design direction

Audience: prospective research supervisors, collaborators, academic reviewers, and technical employers.

The source reference is [Shihab Muhtasim’s portfolio](https://shihabmuhtasim.github.io/). Its public HTML, stylesheet, and rendered-content bundle were reviewed on 15 October 2026. The useful qualities are a dark portrait-led hero, a light page background, restrained blue links, rounded panels, ample spacing, a compact sticky navigation, and clear hierarchy between large section headings and dense academic content.

The starter is an original implementation. No reference-site code, portraits, biography, projects, or achievements are included in this kit.

## Visual system

| Element | Direction |
| --- | --- |
| Page | Light gray `#f5f6f8`, white surfaces, thin neutral borders. |
| Hero and contact | Dark navy `#111722`, muted secondary text, pale blue detail. |
| Accent | Blue `#235fdd`, used for links, selection, and primary actions. |
| Type | Local system sans-serif stack; compact academic detail, generous headings. No remote font dependency. |
| Photography | Naeem’s existing portrait, real awards, actual sports images, and conference photographs. |
| Cards | Moderate corner radii; short previews with substantive detail dialogs. |
| Motion | Small hover changes only, with reduced-motion support. |
| Layout | Desktop grids collapse to stacked content on narrow screens. |

## Information order

1. Personal introduction and professional links.
2. Education and research interests.
3. Research records with explicit status and category filters.
4. Selected technical projects with detailed scope.
5. Research experience, leadership, and ambassador roles.
6. Awards, certificates, and real evidence.
7. Conference participation and galleries.
8. Sports and team leadership.
9. Skills, community engagement, and contact.

Research counts deliberately distinguish the seven conference papers from journal work and other presentation records. The hero does not claim seven already-published IEEE papers.

Use large images selectively. Preserve readable full images in dialogs even when thumbnails use a visual crop. Keep logos and certificate previews fully contained. The society logo is unchanged and is not an illustration to recreate.

## Interaction and content constraints

Contact uses a mailto link and a copy-email control. Project and research links go to their original sources. There is no invented contact-form success state, live repository feed, or changing citation counter. All displayed research status is tied to the 15 October 2026 snapshot.

Each visitor-facing project detail explains the problem, approach, technical scope, and current limitations. Do not repeat large technology lists across unrelated sections or use fictitious percentage skill meters.

The latest complete design instructions are in CODEX_PROMPT.md. The 16 October asset update uses equal-size award frames and the portrait favicon; the next design pass implements the requested timeline, project expansion, paper abstract details and portrait flip.
