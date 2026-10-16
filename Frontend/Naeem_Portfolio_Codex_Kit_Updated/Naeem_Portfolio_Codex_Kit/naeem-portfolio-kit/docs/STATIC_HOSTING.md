# Using the frontend later

The requested deliverable is a local ZIP. Nothing is deployed by this kit.

When you choose to update the live site, use **only the contents of `website/`** as the static publish directory. It contains the HTML, CSS, JavaScript, local photographs, certificate files, CV download, bibliography, sitemap, and crawler instructions.

Do not use the kit root as a publish directory. `content/`, `evidence/`, and `docs/` include source evidence and owner-review information, including a signed appointment letter and an older application-specific CV.

There is no production build service to run. If source content changes first, run `python3 scripts/build.py` and the validation commands from `START_HERE.md`, then upload the website folder to your chosen static host.

The site’s internal assets use relative paths and can be opened directly or served under a subdirectory. Canonical, social-preview, robots, and sitemap URLs currently target `https://mehedinaeem.dev/`; update those URLs if you choose a different public origin. DNS, HTTPS, and custom-domain configuration belong to the later hosting step.

External links go to GitHub, Google Scholar, ORCID, LinkedIn, IEEE, arXiv, YouTube, Facebook, Credly, and the linked project websites. The portfolio itself makes no external API calls and stores no visitor data. Email actions open the visitor’s mail application.
