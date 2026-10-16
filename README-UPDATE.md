# Tiles Studio — bilingual website update

This archive contains the complete static website and its original images.

## Deployment
Deploy the repository root as a static site to Vercel. No dependencies or build command are required.

## Opening the ZIP locally
Extract the ZIP, then double-click **index.html** in the root folder (not the es/ or en/ directory). The site redirects to the appropriate language HTML file. You can also open **es/index.html** or **en/index.html** directly. The language links work both from local files and on Vercel.

## Routes
- `/`: chooses ES for Spanish/Catalan browser locale; EN otherwise; honours saved manual choice. Has clickable fallback links with JavaScript disabled.
- `/en/`: full English page (indexable and shareable).
- `/es/`: full Spanish page (indexable and shareable).

## Changes
- Removed the old navigation (non-existing anchor targets).
- Added a compact EN / ES language switch and email link.
- Added per-language canonical/hreflang, Open Graph/Twitter tags, JSON-LD, robots.txt and sitemap.xml.
- Deferred loading the additional five gallery images until after page load and idle time, retaining the 3D cube and all 11 original images.
- Images, CSS and JavaScript remain shared between both language pages.

The GitHub feature branch contains these changes without publishing them to the production/main branch.
