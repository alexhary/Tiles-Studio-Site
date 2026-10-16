# Tiles Studio — bilingual website update

This archive contains the complete static website and its original images.

## Deployment
Deploy the repository root as a static site to Vercel. No dependencies or build command are required.

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
