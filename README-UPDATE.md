# Tiles Studio — bilingual static website

The root `index.html` is the full Spanish page. `en/index.html` is the fully translated English page.

## Local preview

1. Extract the ZIP.
2. Double-click **index.html** at the repository root for Spanish.
3. Click **EN** in the page to open the English version.
4. Click **ES** to return to the Spanish version.

Open the actual HTML files, not their folders. Switching works over `file://` as well as after deployment.

## Production addresses

- Spanish: https://tiles.studio/ (canonical)
- English: https://tiles.studio/en/ (canonical)

Each page has its own title, meta description, Open Graph metadata and language annotation. The sitemap lists both pages and reciprocal `hreflang` links. No redirect or automatic language selection is used.

## Site behavior

- One-page design, no top navigation menu
- Compact ES / EN language links
- Functional 3D cube with all 11 original images and bilingual image descriptions
- Email contact: tilesstudio.info@gmail.com
- Deferred preloading of offscreen gallery images
- Static HTML/CSS/JS; no dependencies or build command

The ZIP contains all original assets. This GitHub feature branch is separate from the live production branch `main`.
