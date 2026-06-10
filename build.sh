#!/usr/bin/env bash

set -euo pipefail

APP_NAME="bw"
ENTRY="index.ts"
DIST="release"

echo "📦 Cleaning $DIST..."
rm -rf "$DIST"
mkdir -p "$DIST"

build() {
  local target="$1"
  local outfile="$2"

  echo "🔨 Building $outfile ($target)..."

  bun build "$ENTRY" \
    --compile \
    --target="$target" \
    --outfile="$DIST/$outfile"

  echo "✅ Done: $DIST/$outfile"
}

build "bun-linux-x64"     "${APP_NAME}-linux-x64"
build "bun-linux-arm64"   "${APP_NAME}-linux-arm64"
build "bun-windows-x64"   "${APP_NAME}-windows-x64.exe"
build "bun-darwin-x64"    "${APP_NAME}-macos-x64"

echo
echo "🎉 All builds completed!"
echo

ls -lh "$DIST"