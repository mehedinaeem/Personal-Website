Update only the Selected Projects images in my existing React/Vite portfolio. Implement the changes in the current project and preserve unrelated work.

The updated `Naeem_Portfolio_Codex_Kit.zip` contains a `naeem-portfolio-kit` folder with twelve named project covers. Locate or safely extract the updated kit outside the public publish directory, then read:

- `docs/PROJECT_COVERS.md`
- `content/project-cover-map.json`
- `content/portfolio.json`

Copy the twelve files from the kit’s `website/assets/projects/covers/` into the appropriate `public/assets/projects/covers/` directory in this React project. Update the project data using the project IDs in the cover map. Use each project’s `cover.src` and `cover.alt` on its card. Convert paths to the format required by the existing application; avoid broken relative URLs.

Every selected project must show an actual image. Do not leave text-only placeholders. The new covers already contain the project names; do not add another title over the image that obscures the lettering.

Use the actual website covers for:

- JKKNIU Research Society: `research-society-cover.jpg`, from https://jkkniurs.org/
- JKKNIU Model United Nations Club: `munc-cover.jpg`, from https://jkkniu-munc.tech/

Keep both website projects visible in Selected Projects. Their real branding is already in the images. Do not regenerate or modify the official logos.

The other ten covers are repository-informed illustrations. Keep the existing technical screenshots, research figures, and project evidence in the detail galleries. Do not describe the new illustrations as working-system screenshots or evaluation outputs.

Use consistent card frames, preferably 16:9, with `object-fit: contain` and a neutral background. Keep the entire title, subtitle, and organization branding visible at every screen size. Avoid cropping or zooming the images on hover. Preserve accessible alternative text and existing project detail, GitHub, paper, dataset, and website links.

Keep this change frontend-only. Do not add API calls, change the backend, rewrite the rest of the website, or overwrite unrelated uncommitted changes.

Run the relevant build and asset checks. When a browser is available, inspect all project cards on desktop and mobile and check that every image loads with readable lettering. Complete the changes and report the updated files and verification results. Do not deploy or push changes.
