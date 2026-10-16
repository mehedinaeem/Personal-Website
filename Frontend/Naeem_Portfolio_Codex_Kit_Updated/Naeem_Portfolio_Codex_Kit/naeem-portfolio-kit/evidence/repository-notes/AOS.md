# Amader Online School

A frontend-only React website for free educational access for Bangladeshi students in Classes 6–12. Founder: Md Mehedi Hasan Naeem. The supplied logo is preserved unchanged in `public/logo.png`.

## Run locally

Use Node.js 22.12+ and npm.

```sh
npm ci
npm run dev
```

Open the URL printed by Vite (normally http://localhost:5173).

```sh
npm test             # Content and URL validation
npm run test:e2e     # Browser, accessibility, and interaction checks
npm run build       # Validate content and create dist/
npm run preview     # Preview the production build
```

Browser checks use Google Chrome at `/usr/bin/google-chrome`. Set `CHROME_PATH` to another installed Chromium executable if needed. No production browser automation dependency is loaded into the app.

## Structure

- `src/data/catalog.js`: editable settings, class and subject directories, and content records.
- `src/data/course-data.template.json`: the supplied unpublished schema reference.
- `src/components`: reusable cards, controls, fallback UI, and privacy-enhanced player.
- `src/pages`: home, directories, search, details, learning, and information pages.
- `src/layouts`: shared responsive header and footer.
- `src/hooks`: defensive local browser persistence.
- `src/utils`: YouTube parsing and catalog validation.
- `scripts/sitemap.js`: build validation and domain-aware sitemap generation.

React Router provides page routing; Tailwind CSS provides CSS utilities and brand tokens alongside custom responsive CSS. Lucide supplies icons, and Framer Motion provides reduced-motion-aware entrance animation. Non-home pages are lazy loaded.

## Current content status

All seven classes have subject directories. The independent Videos area contains 149 supplied official channel videos. Structured class courses, chapters, playlists, and lessons remain empty until content is mapped to verified class/subject records. The original course template is not published.

Set contact fields in the exported `site` object in `src/data/catalog.js`. Set `SITE_URL` to your real HTTPS origin during production builds to generate canonical metadata, absolute social image URLs, and a sitemap. Without it the app deliberately publishes no invented domain.

See [CONTENT_GUIDE.md](CONTENT_GUIDE.md), [DEPLOYMENT.md](DEPLOYMENT.md), and [AUDIT.md](AUDIT.md).

## Official YouTube archive

The Videos area (`/videos`, `/videos/category/:categorySlug`, `/videos/:videoId`) reads `src/data/amader-youtube-videos-categorized.json`. The supplied 149 records and every original field are preserved. Admission videos are independent of the Classes 6–12 catalog. Counts are computed from valid published records, and views are labeled as dataset snapshots.

To append a video, add a unique 11-character YouTube `id`, its original watch `url`, full `title`, matching `categorySlug` and `category` from the existing categories, `sourceType:"official"`, the confirmed channel name/URL, `published:true`, and an `order`. Lower order means newer within the dataset; renumber existing entries when inserting at the start. This order is not a verified publication date. Use numeric `viewCount` and `durationSeconds` when known, otherwise `null`; use an array for `universityTags`. No YouTube API key is needed. Keep the source summary fields (`totalVideos` and category `count`) consistent for manual review; displayed counts are always derived, never copied from summaries.

`src/data/videos.js` exposes the archive, category groups/counts, lookup, combined filters, sorting, and a varied homepage selection (first dataset item from each of the first six categories). Run `npm test`, `npm run test:e2e`, and `npm run build` after updates. The build checks IDs, duplicates, source attribution, URL consistency, and categories. Unavailable embeds retain an original YouTube link; neither the local dataset nor these tests verifies current public availability on YouTube.
# AOS
