# Longmouth Shopify Theme Port

This repository contains a cleaned initial Shopify theme scaffold generated from the Webflow export in `longmouth/`.

## Current focus

The theme is intentionally focused on getting the homepage layout, styling, and behavior organized before the Shopify-native product/cart backend is rebuilt.

## Homepage structure

- `layout/theme.liquid` provides the Shopify document shell and the cleaned Webflow metadata/style references.
- `templates/index.json` mounts the homepage section.
- `sections/webflow-home.liquid` is a small homepage entry point. It renders split markup snippets, loads CSS, and loads JavaScript by role.
- `snippets/home-markup-part-*.liquid` contains the Webflow homepage HTML split into upload-safe chunks. These snippets should stay markup-only.
- `assets/longmouth.webflow.shared.dc2f03922.css.liquid` contains the exported Webflow stylesheet.
- `assets/longmouth-home-inline.css.liquid` contains inline Webflow styles extracted from the HTML export.

## JavaScript organization

All inline homepage JavaScript has been extracted into role-based files:

- `assets/longmouth-home-core.js` — Webflow environment flags and core DOM helpers.
- `assets/longmouth-home-analytics.js` — analytics snippets; review before launch and consider moving these to Shopify customer events/pixels.
- `assets/longmouth-home-home-effects.js` — homepage visual effects such as marquee/scroll/card/glitch behavior.
- `assets/longmouth-home-shop-ui.js` — shop panel, product drawer, and cart shell behavior that will likely be replaced by native Shopify product/cart code.
- `assets/longmouth-home-privacy.js` — cookie/privacy banner helpers.

Removed headless/Smootify-specific scripts include the IP geolocation bootstrap, direct Storefront API market-context call, Smootify CDN loader, and Smootify country verification/query snippets.

## Binary asset workflow

Binary Webflow assets such as images, fonts, and videos are intentionally **not** committed under `assets/` because the PR/review flow does not support binary-file diffs well. The source binaries remain in the committed Webflow download under `longmouth/images/`.

`config/webflow-binary-assets.txt` is the manifest of binary files currently referenced by the Shopify theme. Before running or uploading the Shopify theme locally, sync only those used binaries into Shopify's `assets/` directory:

```bash
scripts/sync-webflow-assets.sh
```

The copied files are ignored by Git, but Shopify CLI will still see them locally for preview or theme upload commands.

## Follow-up information needed for a full backend conversion

1. A Shopify product export or theme preview store access so the remaining product IDs can be mapped to Shopify product handles and variants.
2. Desired collection rules for the shop grid and product drawer ordering.
3. Confirmation of which tracking scripts should remain in the Shopify theme versus being managed by Shopify apps/customer events.
4. Preferred cart behavior: keep the Webflow mini-cart visuals, replace with a native Shopify cart drawer, or route directly to checkout.
