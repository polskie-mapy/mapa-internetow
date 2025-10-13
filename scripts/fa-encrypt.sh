#!/bin/sh
set -e

if [ -z "$FA_ENCRYPTION_KEY" ]; then
  echo "Error: FA_ENCRYPTION_KEY not set"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ENCRYPTED_DIR="$PROJECT_DIR/.fontawesome-encrypted"
NODE_MODULES="$PROJECT_DIR/node_modules"

mkdir -p "$ENCRYPTED_DIR"

for package in pro-regular-svg-icons pro-solid-svg-icons; do
  package_path="$NODE_MODULES/@fortawesome/$package"
  [ ! -d "$package_path" ] && echo "Error: @fortawesome/$package not found" && exit 1
  output="$ENCRYPTED_DIR/@fortawesome-$package.tar.gz.enc"
  (cd "$NODE_MODULES" && tar -czf - "./@fortawesome/$package") | openssl enc -aes-256-cbc -salt -pbkdf2 -pass env:FA_ENCRYPTION_KEY -out "$output"
  echo "✓ @fortawesome/$package"
done

echo "Done. Commit .fontawesome-encrypted/ to repo"
