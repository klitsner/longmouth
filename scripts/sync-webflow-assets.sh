#!/usr/bin/env bash
set -euo pipefail

# Copy only binary Webflow export files used by the Shopify theme into assets/.
# The copied files are ignored by Git so PR diffs stay text-only.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_DIR="$ROOT_DIR/longmouth/images"
TARGET_DIR="$ROOT_DIR/assets"
MANIFEST="$ROOT_DIR/config/webflow-binary-assets.txt"

if [[ ! -d "$SOURCE_DIR" ]]; then
  echo "Missing Webflow image/font/video source directory: $SOURCE_DIR" >&2
  exit 1
fi

if [[ ! -f "$MANIFEST" ]]; then
  echo "Missing binary asset manifest: $MANIFEST" >&2
  exit 1
fi

mkdir -p "$TARGET_DIR"

while IFS= read -r filename || [[ -n "$filename" ]]; do
  [[ -z "$filename" || "$filename" =~ ^# ]] && continue
  if [[ ! -f "$SOURCE_DIR/$filename" ]]; then
    echo "Missing source asset: longmouth/images/$filename" >&2
    exit 1
  fi
  cp -f "$SOURCE_DIR/$filename" "$TARGET_DIR/$filename"
done < "$MANIFEST"

echo "Synced $(grep -vcE '^(#|$)' "$MANIFEST") Webflow binary assets from longmouth/images to assets/."
