#!/usr/bin/env bash
set -euo pipefail

# Copy binary Webflow export files into Shopify's assets directory for local
# preview/deployment without committing those binaries to this PR.
#
# Usage:
#   scripts/sync-webflow-assets.sh
#
# Run from the repository root before `shopify theme dev` or `shopify theme push`.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_DIR="$ROOT_DIR/longmouth/images"
TARGET_DIR="$ROOT_DIR/assets"

if [[ ! -d "$SOURCE_DIR" ]]; then
  echo "Missing Webflow image/font/video source directory: $SOURCE_DIR" >&2
  exit 1
fi

mkdir -p "$TARGET_DIR"

shopt -s nullglob
extensions=(png webp avif jpg jpeg otf ttf woff woff2 mp4 webm)
for ext in "${extensions[@]}"; do
  for file in "$SOURCE_DIR"/*."$ext"; do
    cp -f "$file" "$TARGET_DIR/$(basename "$file")"
  done
done

echo "Synced Webflow binary assets from longmouth/images to assets/."
