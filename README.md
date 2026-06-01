# Longmouth Shopify Theme Port

This repository contains an initial Shopify theme scaffold generated from the Webflow export in `longmouth/`.

## What is included

- `layout/theme.liquid` contains the Shopify document shell and the cleaned Webflow `<head>` assets.
- `sections/webflow-home.liquid` contains the exported Webflow body markup as the homepage section.
- `templates/index.json` mounts the Webflow homepage section.
- `assets/` contains text-based theme assets such as exported Webflow CSS, JavaScript, and SVG files.

## Binary asset workflow

Binary Webflow assets such as images, fonts, and videos are intentionally **not** committed under `assets/` because the PR/review flow does not support binary-file diffs well. The source binaries remain in the committed Webflow download under `longmouth/images/`.

Before running or uploading the Shopify theme locally, sync those source binaries into Shopify's `assets/` directory:

```bash
scripts/sync-webflow-assets.sh
```

The copied files are ignored by Git, but Shopify CLI will still see them locally for preview or theme upload commands.

## Smootify/headless cleanup

The initial Smootify bootstrap, Smootify CDN includes, Storefront API token call, and IP geolocation/localStorage country workaround have been removed. Shopify should now own localization/Markets, cart, and checkout behavior natively.

## Follow-up information needed for a full backend conversion

1. A Shopify product export or theme preview store access so the remaining Smootify product IDs can be mapped to Shopify product handles and variants.
2. Desired collection rules for the shop grid and product drawer ordering.
3. Confirmation of which tracking scripts should remain in the Shopify theme versus being managed by Shopify apps/customer events.
4. Preferred cart behavior: keep the Webflow mini-cart visuals, replace with a native Shopify cart drawer, or route directly to checkout.
